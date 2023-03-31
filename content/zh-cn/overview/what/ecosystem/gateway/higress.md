---
aliases:
    - /zh/overview/what/ecosystem/gateway/higress/
description: ""
linkTitle: Higress
title: Higress
type: docs
weight: 30
---

# Higress 对接 Dubbo 服务

Higress提供了从HTTP协议到Dubbo协议进行转换的功能，用户通过配置协议转换，可以将一个Dubbo服务以HTTP接口暴露出来，从而用HTTP请求实现对Dubbo接口的调用。本文将通过一个示例来介绍如何用Higress配置HTTP到Dubbo的协议转换。

## 前提条件
1. Higress目前支持的Dubbo框架的版本为2.x。若您使用Dubbo3.0，要求使用dubbo协议（目前暂不支持Triple协议）。
2. 已安装Higress，并开启了对Istio CRD的支持，参考[安装部署文档](https://higress.io/zh-cn/docs/ops/deploy-by-helm)。

## 部署Dubbo服务

您可以选用Naocs或者Zookeeper任意一种作为注册中心，部署一个Dubbo服务。具体可以参考以下文档：

https://cn.dubbo.apache.org/zh-cn/overview/what/ecosystem/registry/nacos/

https://cn.dubbo.apache.org/zh-cn/overview/what/ecosystem/registry/zookeeper/

假设我们现在已经部署了如下一个Dubbo服务，其服务名为com.alibaba.nacos.example.dubbo.service.DemoService，并指定了该服务的version为“1.0.0”，group为“dev”，下面我们将介绍如何为该服务配置协议转换。

```java
package com.alibaba.nacos.example.dubbo.service;

public interface DemoService {
    String sayName(String name);
}
```
     
## 通过Ingress转发请求到Dubbo服务
Higress可以通过[McpBridge](https://higress.io/zh-cn/docs/user/mcp-bridge)来对接Nacos或者Zookeeper作为服务来源。这里我们以Nacos为例，假设Naocs的ip地址为192.xxx.xx.32，我们可以在K8s集群中apply以下资源来配置McpBridge
```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: default
  namespace: higress-system
spec:
  registries:
  - domain: 192.xxx.xx.32
    nacosGroups:
    - DEFAULT_GROUP
    name: nacos-service-resource
    port: 8848
    type: nacos2
```
通过McpBridge，我们可以直接从Nacos中发现Dubbo服务，并为其创建路由。

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
经过上述步骤，我们已经通过Ingress将path前缀为/dubbo的请求路由到我们的Dubbo服务上。但光是这样是无法正常通信的，因为Dubbo服务使用的是定制的Dubbo协议，无法天然与HTTP协议进行兼容。因此接下来我们将通过EnvoyFilter来配置HTTP到Dubbo的协议转换规则，从而实现用HTTP请求来调用Dubbo服务。

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