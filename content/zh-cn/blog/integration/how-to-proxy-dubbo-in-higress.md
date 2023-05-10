---
aliases:
    - /zh/overview/what/ecosystem/gateway/higress/
description: "使用 Higress 作为 Dubbo 网关"
linkTitle: 如何通过 Higress 网关代理 Dubbo 服务
title: 如何通过 Higress 网关代理 Dubbo 服务
date: 2023-04-01
tags: ["网关", "生态"]
---

# Higress 对接 Dubbo 服务

Higress提供了从HTTP协议到Dubbo协议进行转换的功能，用户通过配置协议转换，可以将一个Dubbo服务以HTTP接口暴露出来，从而用HTTP请求实现对Dubbo接口的调用。本文将通过一个示例来介绍如何用Higress配置HTTP到Dubbo的协议转换。该示例会引导您轻松地部署一个Nacos server和一个Dubbo服务，然后通过Ingress将HTTP请求转发到注册在Nacos上的Dubbo服务，并通过Higress的协议转换能力完成对Dubbo服务的HTTP调用。

## 前提条件
1. Higress目前支持的Dubbo框架的版本为2.x。若您使用Dubbo3.0，要求使用dubbo协议（目前暂不支持Triple协议）。
2. 已安装Higress，并开启了对Istio CRD的支持，参考[Higress安装部署文档](https://higress.io/zh-cn/docs/ops/deploy-by-helm)。

## 部署Nacos和Dubbo服务

首先在K8s集群中apply以下资源，以部署一个Nacos注册中心，同时通过K8s service将这个Nacos server暴露出来。

```yaml
# Nacos Server配置
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nacos-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nacos-server
  template:
    metadata:
      labels:
        app: nacos-server
    spec:
      containers:
      - env:
        - name: MODE
          value: standalone
        image: nacos/nacos-server:v2.2.0
        imagePullPolicy: Always
        name: nacos-server
        ports:
          - containerPort: 8848
            name: server
      dnsPolicy: ClusterFirst
      restartPolicy: Always

# Nacos Server Service配置
---
apiVersion: v1
kind: Service
metadata:
  name: nacos-server
spec:
  ports:
  - port: 8848
    name: server
    protocol: TCP
    targetPort: 8848
  selector:
    app: nacos-server
  type: ClusterIP
```
在K8s集群中apply以下资源，以部署一个Dubbo服务，该Dubbo服务将注册到上述的Naocs中。
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nacos-provider
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nacos-provider
  template:
    metadata:
      labels:
        app: nacos-provider
    spec:
      containers:
        - name: server
          image: higress-registry.cn-hangzhou.cr.aliyuncs.com/samples/nacos-dubbo-provider:v1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 20880
          env:
            - name: DUBBO_REGISTRY_ADDRESS
              value: nacos-server.default.svc.cluster.local
```
该Dubbo服务的代码可以在Nacos的[示例代码](https://github.com/nacos-group/nacos-examples/tree/master/nacos-dubbo-example)仓库中找到，其接口定义为：

```java
package com.alibaba.nacos.example.dubbo.service;

public interface DemoService {
    String sayName(String name);
}
```
接口实现如下：

```java
package com.alibaba.nacos.example.dubbo.service;

import com.alibaba.dubbo.config.annotation.Service;
import com.alibaba.dubbo.rpc.RpcContext;
import org.springframework.beans.factory.annotation.Value;

/**
 * Default {@link DemoService}
 *  https://nacos.io/zh-cn/docs/use-nacos-with-dubbo.html
 * @since 2.6.5
 */
@Service(version = "${demo.service.version}", group = "${demo.service.group}")
public class DefaultService implements DemoService {

    @Value("${demo.service.name}")
    private String serviceName;

    public String sayName(String name) {
        RpcContext rpcContext = RpcContext.getContext();
        return String.format("Service [name :%s , port : %d] %s(\"%s\") : Hello,%s",
                serviceName,
                rpcContext.getLocalPort(),
                rpcContext.getMethodName(),
                name,
                name);
    }
}
```
在本示例中，该Dubbo服务的服务名为com.alibaba.nacos.example.dubbo.service.DemoService，服务版本为1.0.0，服务分组为dev。

为了测试方便，我们可以通过运行以下命令来将我们部署在K8s集群中的Naocs服务映射到本地端口：
```bash
kubectl port-forward svc/nacos-server 8848:8848 --address='0.0.0.0' 
```
然后请求Nacos的服务发现接口，可以查看到我们Dubbo服务的元数据信息，从而对以上部署进行验证。
```bash
$curl -X GET 'http://127.0.0.1:8848/nacos/v1/ns/instance/list?serviceName=providers:com.alibaba.nacos.example.dubbo.service.DemoService:1.0.0:dev'
{"name":"DEFAULT_GROUP@@providers:com.alibaba.nacos.example.dubbo.service.DemoService:1.0.0:dev","groupName":"DEFAULT_GROUP","clusters":"","cacheMillis":10000,"hosts":[{"ip":"10.244.0.58","port":20880,"weight":1.0,"healthy":true,"enabled":true,"ephemeral":true,"clusterName":"DEFAULT","serviceName":"DEFAULT_GROUP@@providers:com.alibaba.nacos.example.dubbo.service.DemoService:1.0.0:dev","metadata":{"side":"provider","release":"dubbo_demo","methods":"sayName","deprecated":"false","dubbo":"2.0.2","pid":"3034042","interface":"com.alibaba.nacos.example.dubbo.service.DemoService","service-name-mapping":"true","version":"1.0.0","generic":"false","revision":"dubbo_demo","path":"com.alibaba.nacos.example.dubbo.service.DemoService","protocol":"dubbo","metadata-type":"remote","application":"dubbo-provider-demo","background":"false","dynamic":"true","category":"providers","group":"dev","anyhost":"true","timestamp":"1680176973875"},"ipDeleteTimeout":30000,"instanceHeartBeatInterval":5000,"instanceHeartBeatTimeOut":15000}],"lastRefTime":1680178336936,"checksum":"","allIPs":false,"reachProtectionThreshold":false,"valid":true}%        
```
## 通过Ingress转发请求到Dubbo服务
Higress可以通过McpBridge来对接Nacos作为服务来源，在K8s集群中apply以下资源来配置McpBridge
```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: default
  namespace: higress-system
spec:
  registries:
  - domain: nacos-server.default.svc.cluster.local
    nacosGroups:
    - DEFAULT_GROUP
    name: nacos-service-resource
    port: 8848
    type: nacos2
```
通过McpBridge，我们可以直接从Nacos中发现Dubbo服务，并为其创建路由，而无需为每一个Dubbo服务创建service资源。

接下来我们创建如下Ingress，从而创建一条指向Dubbo服务的HTTP路由：
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    higress.io/destination: providers:com.alibaba.nacos.example.dubbo.service.DemoService:1.0.0:dev.DEFAULT-GROUP.public.nacos
  name: demo
  namespace: higress-system
spec:
  ingressClassName: higress
  rules:
  - http:
      paths:
      - backend:
          resource:
            apiGroup: networking.higress.io
            kind: McpBridge
            name: default
        path: /dubbo
        pathType: Prefix
```
这样，path前缀为/dubbo的请求就会被路由到我们刚刚创建的Dubbo服务上。

## 通过EnvoyFilter配置HTTP到Dubbo的协议转换规则
经过上述步骤，我们已经在K8s环境下部署了一套Naocs和Dubbo，并通过Ingress将path前缀为/dubbo的请求路由到我们配好的Dubbo服务上。但光是这样是无法正常通信的，因为Dubbo服务使用的是定制的Dubbo协议，无法天然与HTTP协议进行兼容。因此接下来我们将通过EnvoyFilter来配置HTTP到Dubbo的协议转换规则，从而实现用HTTP请求来调用Dubbo服务。

在K8s集群中apply以下资源，要注意的是，EnvoyFilter是属于Istio的CRD，因此需要参照前提条件中的第2点来开启Higress对Istio CRD的支持。
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: EnvoyFilter
metadata:
  name: http-dubbo-transcoder-test
  namespace: higress-system
spec:
  configPatches:
  - applyTo: HTTP_FILTER
    match:
      context: GATEWAY
      listener:
        filterChain:
          filter:
            name: envoy.filters.network.http_connection_manager
            subFilter:
              name: envoy.filters.http.router
    patch:
      operation: INSERT_BEFORE
      value:
        name: envoy.filters.http.http_dubbo_transcoder
        typed_config:
          '@type': type.googleapis.com/udpa.type.v1.TypedStruct
          type_url: type.googleapis.com/envoy.extensions.filters.http.http_dubbo_transcoder.v3.HttpDubboTranscoder
  - applyTo: HTTP_ROUTE
    match:
      context: GATEWAY
      routeConfiguration:
        vhost:
          route:
            name: demo
    patch:
      operation: MERGE
      value:
        route:
          upgrade_configs:
          - connect_config:
              allow_post: true
            upgrade_type: CONNECT
        typed_per_filter_config:
          envoy.filters.http.http_dubbo_transcoder:
            '@type': type.googleapis.com/udpa.type.v1.TypedStruct
            type_url: type.googleapis.com/envoy.extensions.filters.http.http_dubbo_transcoder.v3.HttpDubboTranscoder
            value:
              request_validation_options:
                reject_unknown_method: true
                reject_unknown_query_parameters: true
              services_mapping:
              - group: dev
                method_mapping:
                - name: sayName
                  parameter_mapping:
                  - extract_key: p
                    extract_key_spec: ALL_QUERY_PARAMETER
                    mapping_type: java.lang.String
                  passthrough_setting:
                    passthrough_all_headers: true
                  path_matcher:
                    match_http_method_spec: ALL_GET
                    match_pattern: /dubbo/hello
                name: com.alibaba.nacos.example.dubbo.service.DemoService
                version: 1.0.0
              url_unescape_spec: ALL_CHARACTERS_EXCEPT_RESERVED
  - applyTo: CLUSTER
    match:
      cluster:
        service: providers:com.alibaba.nacos.example.dubbo.service.DemoService:1.0.0:dev.DEFAULT-GROUP.public.nacos
      context: GATEWAY
    patch:
      operation: MERGE
      value:
        upstream_config:
          name: envoy.upstreams.http.dubbo_tcp
          typed_config:
            '@type': type.googleapis.com/udpa.type.v1.TypedStruct
            type_url: type.googleapis.com/envoy.extensions.upstreams.http.dubbo_tcp.v3.DubboTcpConnectionPoolProto
```
在以上EnvoyFilter中，我们配置了将path为/dubbo/hello的HTTP请求转发到Dubbo服务com.alibaba.nacos.example.dubbo.service.DemoService:1.0.0:dev中，并调用其sayName方法，而该方法的参数则通过HTTP url中的的query参数p来指定。

## 请求验证
通过以上配置，我们就可以执行以下curl命令来调用这个dubbo服务了：
```bash
$curl "localhost/dubbo/hello?p=abc" 
{"result":"Service [name :demoService , port : 20880] sayName(\"abc\") : Hello,abc"}
```

## 配置参考
EnvoyFilter的相关配置项参考[HTTP转Dubbo配置说明](https://higress.io/zh-cn/docs/user/dubbo-envoyfilter)