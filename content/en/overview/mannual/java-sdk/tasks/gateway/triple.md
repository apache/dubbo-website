---
aliases:
    - /en/overview/tasks/ecosystem/gateway/
    - /en/overview/tasks/ecosystem/gateway/
description: |
    Proxying Dubbo Service through Higress Cloud Native Gateway, supporting triple protocol.
linkTitle: triple protocol
title: Access Dubbo Backend Services via Gateway for HTTP Traffic
type: docs
weight: 3
---

In the [triple protocol specification](/en/overview/reference/protocols/triple-spec/), we detailed the friendly design of the triple protocol for browsers and gateways, one very important aspect being that triple supports running on both HTTP/1 and HTTP/2:
* Use the efficient triple binary protocol between backend services.
* For the frontend access layer, it supports all standard HTTP tools like cURL to request backend services in standard `application/json`, `application/yaml`, etc.

Next, let’s see how to quickly access the backend triple microservice system through some common gateway products for frontend HTTP traffic.

{{% alert title="Note" color="warning" %}}
After using the triple protocol, there is no need for generalized invocation, `http -> dubbo` protocol conversion, etc. Any mainstream gateway device can directly access the backend triple protocol service through HTTP traffic.
Refer to [Publishing REST Style Services](../../protocols/rest/)
{{% /alert %}}

## Native HTTP Access

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/http-to-triple.png"/>

As illustrated, HTTP requests from browsers, phones, or web servers can be directly forwarded by the gateway to backend Dubbo services, while backend services continue to use the triple binary protocol. **Since the traffic entering and exiting the gateway is standard HTTP, there is no need for the gateway to perform any proprietary protocol conversion work, nor any custom logic, allowing it to focus solely on traffic routing and responsibilities.**

In a real production environment, **the only issue that the gateway needs to address is service discovery: how to dynamically perceive changes in backend triple service instances?** The good news is that several mainstream open-source gateway products, such as Apache APISIX and Higress, generally support using Nacos, Zookeeper, Kubernetes as upstream data sources.

Next, we will detail the workflow of the entire mechanism using a typical example of `Higress + Nacos + Dubbo`.

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/triple-higress.png"/>

### Start Example Application

The complete source code for this example can be found at [dubbo-samples-gateway-higress-triple](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-triple).

In this example, a triple service defined as `org.apache.dubbo.samples.gateway.api.DemoService` is defined and published:

```java
public interface DemoService {
    String sayHello(String name);
}
```

Next, we demonstrate how to start the Dubbo service and use the Higress gateway to forward requests to the backend service.

### Access the Higress Gateway

Next, we will specifically demonstrate the steps for accessing the Higress gateway, including deploying the Dubbo application, Nacos registry, and Higress gateway.

#### Install Higress and Nacos

The following example is deployed in a Kubernetes environment, so ensure you are connected to a usable Kubernetes cluster.

1. Install Higress, refer to the [Higress Deployment Documentation](https://higress.io/en/docs/ops/deploy-by-helm).

2. Install Nacos by running

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-triple/deploy/nacos/Nacos.yaml
```

#### Start the Dubbo Application

After packaging the above example application into a Docker image (using the pre-packaged official example image), start the application in standard Kubernetes Deployment format:

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-triple/deploy/provider/Deployment.yaml
```

The specific deployment file definition is as follows:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: gateway-higress-triple-provider
    namespace: default
    labels:
        app: gateway-higress-triple-provider
spec:
    replicas: 1
    selector:
        matchLabels:
            app: gateway-higress-triple-provider
    template:
        metadata:
            labels:
                app: gateway-higress-triple-provider
        spec:
            containers:
                -   name: gateway-higress-triple-provider
                    image: docker.io/allenyi/higress-triple:2.0.0
                    imagePullPolicy: IfNotPresent
                    ports:
                        - containerPort: 50052
                    env:
                        - name: NACOS_ADDRESS
                          value: nacos-server.default.svc.cluster.local
```

#### Forward Requests to Dubbo Service through Higress

Higress can interface with Nacos as a service source through McpBridge. Apply the following resources in the K8s cluster to configure McpBridge:

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-triple/deploy/mcp/mcpbridge.yaml
```

The specific definition of the installed McpBridge resource is as follows:

```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: nacos-service-resource
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

> For more detailed configuration, refer to [McpBridge Configuration Documentation](https://higress.io/en/docs/user/mcp-bridge).

Next, we create the following Ingress to create an HTTP route pointing to the Dubbo service:

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-triple/deploy/ingress/Ingress.yaml
```

Thus, requests with the path prefix `/org.apache.dubbo.samples.gateway.api.DemoService` will be routed to the Dubbo service we just created.

The specific resource definitions of the installed resources are as follows:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    higress.io/destination: gateway-higress-triple-provider.DEFAULT-GROUP.public.nacos
  name: demo
  namespace: default
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
                    path: /org.apache.dubbo.samples.gateway.api.DemoService
                    pathType: Prefix
```

Note here that the annotation higress.io/destination specifies the target service to which the route should ultimately be forwarded: `gateway-higress-triple-provider`, which is the name of the application that just started the Dubbo service (relying on the application-level address list registered by Dubbo3).

For services sourced from Nacos, the format here is: “ServiceName.ServiceGroup.NamespaceID.nacos”. Note that the underscore '_' in the service group is converted to a dash '-'. When the namespace is not specified, the default value here is "public".

> For more traffic governance-related configurations, refer to [Ingress Annotation Configuration Documentation](https://higress.io/en/docs/user/annotation) and [Advanced Traffic Governance through Ingress Annotation](https://higress.io/en/docs/user/annotation-use-case).

### Request Validation

You can access Higress using cURL to call the backend triple service:

```shell
$ curl "localhost/org.apache.dubbo.samples.gateway.api.DemoService/sayHello?name=HigressTriple"

"Hello HigressTriple"
```

{{% alert title="Note" color="info" %}}
You need to run `kubectl port-forward service/higress-gateway -n higress-system 80:80 443:443` to expose Higress in the cluster for access.
{{% /alert %}}

The access path exposed directly through the Java path name and method, such as `/org.apache.dubbo.samples.gateway.api.DemoService/sayHello/`, while easily callable, is not user-friendly for the front end. Next, let’s see how to publish a REST-style HTTP service.

## REST Style Interface

In the previous example, something like `http://127.0.0.1:9080/triple/demo/hello` would be a more frontend-friendly access method. To achieve this, we can configure uri rewrite in gateways such as Higress, thereby mapping the frontend `/triple/demo/hello` to the backend `/org.apache.dubbo.samples.gateway.api.DemoService/sayHello/`.

In addition to reconfiguring the gateway rewrite rules, **the Dubbo framework also provides built-in support for exposing REST-style HTTP access paths for triple services**. The specific usage depends on whether you are using [protobuf-based service definition mode](/en/overview/mannual/java-sdk/tasks/protocols/triple/idl/) or [Java interface-based service definition mode](/en/overview/mannual/java-sdk/tasks/protocols/triple/interface/):
* Java Interface Mode: By directly adding annotations to the Java interface, you can simultaneously publish REST-style services. Currently, both Spring Web and JAX-RS annotation standards are supported.
* Protobuf Mode: By using grpc-gateway, you can publish REST-style services.

### Adding Annotations to Service Definitions

By adding any of the following annotations to the Java interface, you can publish both triple binary and REST-style services. With this configuration, for the same service, you can access it using standard binary triple format or via REST HTTP in JSON format.

Spring Web style annotations:
```java
@RequestMapping("/triple/demo")
public interface DemoService {

    @RequestMapping(method = RequestMethod.GET, value = "/hello")
    String sayHello(@RequestParam("name") String name);

}
```

{{% alert title="Note" color="info" %}}
Regarding the interface annotations:
* This has been enabled in the previous example [dubbo-samples-gateway-higress-triple](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-gateway/dubbo-samples-gateway-higress/dubbo-samples-gateway-higress-triple). You can view the source code for actual usage.
* Detailed explanations and usage examples can also be found in the [Advanced Learning - Protocol - REST](/en/overview/mannual/java-sdk/tasks/protocols/rest/) section.
{{% /alert %}}

At this point, our route prefix configuration is as follows, maintaining the previous Nacos address configuration, while changing the path prefix to a friendlier `/triple/demo`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    higress.io/destination: gateway-higress-triple-provider.DEFAULT-GROUP.public.nacos
  name: demo
  namespace: default
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
                    path: /triple/demo
                    pathType: Prefix
```

The service can be accessed using `/triple/demo/hello`:

```shell
$ curl "localhost/triple/demo/hello?name=HigressTriple"

"Hello HigressTriple"
```

{{% alert title="Note" color="info" %}}
The content described in this article applies only to the versions of the triple protocol released after Dubbo 3.3.0.
{{% /alert %}}

## Reference Links
* [Use Apache APISIX to Proxy Triple Protocol Traffic](/en/blog/2024/04/22/using-apache-apisix-to-proxy-dubbo-service-triple-protocol/)
* [Higress Achieves Microservice Discovery and Routing Configuration Based on HTTP Protocol](https://higress.io/en/docs/user/spring-cloud)

