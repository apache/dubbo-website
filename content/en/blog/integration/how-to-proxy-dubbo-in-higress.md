---
aliases:
    - /en/overview/what/ecosystem/gateway/higress/
description: "Use Higress as a Dubbo gateway to proxy Dubbo protocol services."
linkTitle: How to Proxy Dubbo Services via Higress Gateway
title: How to Proxy Dubbo Services via Higress Gateway
date: 2024-04-01
tags: ["gateway", "ecosystem"]
---
{{% alert title="Note" color="warning" %}}
This article is only applicable to Dubbo protocol communication scenarios. If you are a Dubbo3 user, it is recommended to use the triple protocol. Please refer to [Use Apache APISIX to Proxy Dubbo Services (triple protocol)](/en/overview/mannual/java-sdk/tasks/gateway/triple/) for specific examples.
{{% /alert %}}

Higress provides the capability to convert from HTTP protocol to Dubbo protocol. Users can expose a Dubbo service as an HTTP interface by configuring protocol conversion, thus allowing HTTP requests to invoke Dubbo interfaces. This article introduces how to configure HTTP to Dubbo protocol conversion using Higress through an example. The example guides you to easily deploy a Nacos server and a Dubbo service, then forwards HTTP requests to the Dubbo service registered in Nacos through Ingress, and accomplishes HTTP calls to the Dubbo service through Higress's protocol conversion capability.

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/http-to-dubbo.png"/>

Here is a complete example using `Higress + Dubbo protocol + Nacos registry`: [dubbo-samples-gateway-higress-dubbo](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-dubbo).

## Prerequisites
1. Higress has been installed with support for Istio CRDs enabled. Refer to [Higress installation and deployment documentation](https://higress.io/zh-cn/docs/ops/deploy-by-helm).

## Deploy Nacos and Dubbo Services

First, apply the following resources in the K8s cluster to deploy a Nacos registry while exposing this Nacos server through K8s service.

```yaml
# Nacos Server configuration
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

# Nacos Server Service configuration
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
In the K8s cluster, apply the following resources to deploy a Dubbo service, which will be registered with the Nacos above (you can choose to repackage, we will directly use the community-prepared image package).
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
The code for this Dubbo service can be found in the [dubbo-samples-gateway-higress-dubbo](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-dubbo) repository, with the interface defined as follows:

```java
package org.apache.dubbo.samples.gateway.api;

public interface DemoService {
    String sayHello(String name);
}
```
The interface implementation is as follows:

```java
@Service(version = "${demo.service.version}", group = "${demo.service.group}")
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        return "Hello " + name;
    }
}
```
In this example, the Dubbo service name is `org.apache.dubbo.samples.gateway.api.DemoService`, the service version is `1.0.0`, and the service group is `dev`.

For testing convenience, we can map the Nacos service deployed in the K8S cluster to the local port by running the following command:

```bash
kubectl port-forward svc/nacos-server 8848:8848 --address='0.0.0.0' 
```

Then, request the Nacos service discovery interface to view the metadata information of our Dubbo service, thereby verifying the above deployment.

```bash
$ curl -X GET 'http://127.0.0.1:8848/nacos/v1/ns/instance/list?serviceName=providers:com.alibaba.nacos.example.dubbo.service.DemoService:1.0.0:dev'

{"name":"DEFAULT_GROUP@@providers:com.alibaba.nacos.example.dubbo.service.DemoService:1.0.0:dev","groupName":"DEFAULT_GROUP","clusters":"","cacheMillis":10000,"hosts":[{"ip":"10.244.0.58","port":20880,"weight":1.0,"healthy":true,"enabled":true,"ephemeral":true,"clusterName":"DEFAULT","serviceName":"DEFAULT_GROUP@@providers:com.alibaba.nacos.example.dubbo.service.DemoService:1.0.0:dev","metadata":{"side":"provider","release":"dubbo_demo","methods":"sayName","deprecated":"false","dubbo":"2.0.2","pid":"3034042","interface":"com.alibaba.nacos.example.dubbo.service.DemoService","service-name-mapping":"true","version":"1.0.0","generic":"false","revision":"dubbo_demo","path":"com.alibaba.nacos.example.dubbo.service.DemoService","protocol":"dubbo","metadata-type":"remote","application":"dubbo-provider-demo","background":"false","dynamic":"true","category":"providers","group":"dev","anyhost":"true","timestamp":"1680176973875"},"ipDeleteTimeout":30000,"instanceHeartBeatInterval":5000,"instanceHeartBeatTimeOut":15000}],"lastRefTime":1680178336936,"checksum":"","allIPs":false,"reachProtectionThreshold":false,"valid":true}%        
```
## Forward Requests to Dubbo Services via Ingress
Higress can connect Nacos as a service source through McpBridge. Apply the following resources in the K8s cluster to configure McpBridge.

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

Through McpBridge, we can directly discover Dubbo services from Nacos and create routes for them without creating service resources for each Dubbo service.

Next, we create the following Ingress to create an HTTP route pointing to the Dubbo service:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    higress.io/destination: gateway-higress-dubbo-provider.DEFAULT-GROUP.public.nacos
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

Thus, requests with the path prefix `/dubbo` will be routed to the Dubbo service we just created.


{{% alert title="Note" color="info" %}}
The above `higress.io/destination` is used to specify the address source of this route. It uses the fixed format `service name.service group.namespace ID.nacos`, where,
* `Service Name` can be either the application name or the interface name. For Dubbo3, it is recommended to configure the application name directly, only configuring the interface name when using interface-level service discovery, with the format as the full `nacos dataid`, such as `providers:{service-name}:{version}:{group}`
* `Service Group`, Nacos group, use `DEFAULT-GROUP` when not explicitly set. Note that it needs to follow the DNS domain name format, so the underscore '_' in service group is converted to a hyphen '-'
* `Namespace ID`, Nacos namespace, use `public` when not explicitly set
* `nacos`, use the fixed value `nacos` to represent the data source
{{% /alert %}}

## Configure HTTP to Dubbo Protocol Conversion Rules via EnvoyFilter

With the above steps, we have deployed a set of Nacos and Dubbo in the K8s environment and routed requests with the path prefix of /dubbo to the configured Dubbo service through Ingress. However, this alone cannot achieve normal communication because the Dubbo service uses a custom Dubbo protocol that is not naturally compatible with HTTP protocol. Therefore, we will configure HTTP to Dubbo protocol conversion rules via EnvoyFilter to invoke Dubbo services with HTTP requests.

Apply the following resources in the K8s cluster. Note that EnvoyFilter belongs to Istio's CRD, so Higress's support for Istio CRD needs to be enabled as per the second point in the prerequisites.

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
                name: org.apache.dubbo.samples.gateway.api.DemoService
                version: 1.0.0
              url_unescape_spec: ALL_CHARACTERS_EXCEPT_RESERVED
  - applyTo: CLUSTER
    match:
      cluster:
        service: gateway-higress-dubbo.DEFAULT-GROUP.public.nacos
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
In the above EnvoyFilter, we configure forwarding of HTTP requests with the path of /dubbo/hello to the Dubbo service com.alibaba.nacos.example.dubbo.service.DemoService:1.0.0:dev and invoke its sayName method, with the method's parameter specified via the query parameter p in the HTTP URL.

## Request Validation

With the above configuration, we can execute the following curl command to invoke this Dubbo service:
```bash
$curl "localhost/dubbo/hello?p=abc" 
{"result":"Service [name :demoService , port : 20880] sayName(\"abc\") : Hello,abc"}
```

## References

* For related EnvoyFilter configuration items, refer to [HTTP to Dubbo Configuration Instructions](https://higress.io/zh-cn/docs/user/dubbo-envoyfilter)
* Complete example source code [dubbo-samples-gateway-higress-dubbo](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-dubbo)

