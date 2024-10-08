---
aliases:
    - /en/overview/tasks/ecosystem/gateway/
    - /en/overview/tasks/ecosystem/gateway/
description: |
    This article introduces how to implement Dubbo Service proxy using Apache Higress, with backend services utilizing the dubbo communication protocol.
linkTitle: dubbo protocol
title: Accessing Dubbo Backend Services via Gateway for HTTP Traffic
type: docs
weight: 2
---

Since the dubbo protocol is a TCP-based binary private protocol, it is more suitable as an efficient RPC communication protocol between backend microservices, which makes the dubbo protocol less friendly for frontend traffic access. In the Dubbo framework, there are two ways to help developers address this issue:
* **Multi-protocol publishing [Recommended]**, which exposes a REST-style HTTP access method for the dubbo protocol services. This architecture simplifies the structure, and common gateway products can support it.
* **Implementing `http->dubbo` protocol conversion via gateway**, which requires converting the HTTP protocol into the dubbo protocol recognized by backend services, demanding the gateway to support the dubbo protocol.

## Simultaneous Publishing of HTTP and Dubbo Protocols
**If we can make a service publish both dubbo and HTTP protocols simultaneously, backend calls can be based on the efficient dubbo binary protocol while browsers and other frontend facilities can access the same service via HTTP.** The good news is that the Dubbo framework supports publishing multiple protocols for the same service and allows clients to access the service through the same port using different protocols, as shown below:

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/dubbo-rest.png"/>

To achieve simultaneous publication of both dubbo and HTTP protocols, we only need to add a line of configuration to the configuration file:

```yaml
dubbo:
  protocol:
    dubbo: dubbo
    port: 20880
    ext-protocol: tri
```

By adding the `ext-protocol: tri` configuration, the process can now provide HTTP services on port 20880. This was specifically detailed in the previous triple protocol section, and after enabling the application, access can be gained at port 20880:

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:20880/org.apache.dubbo.protocol.multiple.demo.DemoService/sayHello
```

At this point, the gateway can directly connect to the backend dubbo service using HTTP, and any HTTP gateway can easily connect, making the operation very straightforward.

{{% alert title="Notice" color="info" %}}
Additionally, for complete example source code and explanations regarding dubbo and triple multi-protocol publishing, please refer to the [Example of dubbo+rest dual protocol publishing](/en/overview/mannual/java-sdk/reference-manual/protocol/multi-protocols/).
{{% /alert %}}

If you are dissatisfied with the frontend access path format of `/org.apache.dubbo.protocol.multiple.demo.DemoService/sayHello`, you can opt to publish a REST-style HTTP interface by simply adding an annotation on the interface (currently supporting both Spring Web and JAX-RS annotations). For example, assuming we already have a dubbo service named DemoService, the following annotations can be added:

```java
@RestController
@RequestMapping("/triple")
public interface DemoService {
    @GetMapping(value = "/demo")
    String sayHello();
}
```

This way, we can publish a service that supports both dubbo and REST protocols, simplifying access for HTTP gateways, with the only cost being modifying the interface to add annotations.

With the addition of HTTP access methods for the dubbo protocol service, it becomes easy to connect the dubbo service to the gateway, as detailed in the next section's [triple protocol gateway access](/en/overview/mannual/java-sdk/tasks/gateway/triple/) example, which provides comprehensive instructions.

## HTTP to Dubbo Protocol
{{% alert title="Notice" color="warning" %}}
If you are using Dubbo 3.3.x, before considering this solution, we strongly recommend you to carefully evaluate the `Multi-protocol publishing solution` from the previous section. Unless you have specific reasons that prevent you from accepting the application modification costs of multi-protocol publishing (which is essentially just changing a line of configuration), this solution should be considered the second choice.
{{% /alert %}}

To access backend dubbo services through the gateway, the frontend's HTTP traffic must undergo a layer of `http -> dubbo` protocol conversion for normal calls.

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/http-to-dubbo.png"/>

As illustrated above, HTTP requests sent from browsers, phones, or web servers undergo an HTTP to dubbo protocol conversion at the gateway, which ultimately forwards the dubbo protocol to the backend microservice cluster. Therefore, we need a gateway that supports dubbo protocol conversion to facilitate protocol forwarding. The following are several key points the gateway must implement under this architecture:
* **Protocol conversion**, supporting HTTP to dubbo protocol conversion, including parameter mapping.
* **Automatic address discovery**, supporting mainstream registration centers such as Nacos, Zookeeper, and Kubernetes, dynamically sensing changes in backend dubbo instances.
* **Routing with dubbo protocol**, such as when initiating a dubbo protocol call, supporting address filtering according to specific rules and passing additional parameters to the dubbo backend service.

Currently, there are many open-source gateway products on the market that support dubbo protocol access and provide relatively complete support for the above three points, including Higress, Apache APISIX, and Apache Shenyu. Next, let’s explore how to use gateway products with Dubbo through some examples:
*  [Proxying Dubbo Traffic with Higress]({{< relref "../../../../../../blog/integration/how-to-proxy-dubbo-in-higress" >}})
*  [Proxying Dubbo Traffic with Apache APISIX]({{< relref "../../../../../../blog/integration/how-to-proxy-dubbo-in-apache-apisix" >}})
*  [Proxying Dubbo Traffic with Apache Shenyu]({{< relref "../../../../../../blog/integration/how-to-proxy-dubbo-in-apache-shenyu" >}})

If you are not using an existing gateway product but rather a self-built traffic conversion component, you are likely utilizing the [**Generic Invocation**](/en/overview/mannual/java-sdk/tasks/framework/more/generic/) mechanism in the Dubbo framework. Please refer to the relevant documentation for more details.

