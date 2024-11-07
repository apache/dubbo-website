---
description: "A guide to protocol selection (triple, dubbo) in different scenarios, including basic configuration methods, default ports, applicable scenarios, and more."
linkTitle: Choosing RPC Protocols
title: RPC Communication Protocols Supported by Dubbo
type: docs
weight: 1
---

As an RPC framework, Dubbo comes with efficient RPC communication protocols to solve encoding and communication issues between services. The currently supported protocols include:
 * triple, a high-performance communication protocol based on HTTP/1 and HTTP/2, 100% compatible with gRPC, supporting Unary, Streaming, and other communication patterns; supports publishing REST-style HTTP services.
 * dubbo, a high-performance private communication protocol based on TCP, with the drawback of poor universality, more suitable for use between Dubbo SDKs;
 * Any protocol extension, supports any RPC protocol through extended protocol, with official ecosystem libraries providing support for JsonRPC, thrift, etc.

## Protocol Overview

### Which protocol to use?

**How should developers determine which protocol to use?** Below is a comparative analysis of several mainstream protocols from the perspectives of usage scenarios, performance, ease of programming, and multi-language interoperability:

| <span style="display:inline-block;width:50px">Protocol</span> | Performance | Gateway Friendly | Streaming | Multi-language Support | Programming API | Description |
| --- | --- | --- | --- | --- | --- | --- |
| triple | High | High | Supported, Client stream, Server stream, Bi-directional stream | Supported (Java, Go, Node.js, JavaScript, Rust) | Java Interface, Protobuf (IDL) | The most balanced protocol implementation in terms of multi-language compatibility, performance, gateway, Streaming, gRPC, etc., officially recommended. |
| dubbo | High | Low | Not supported | Supported (Java, Go) | Java Interface | Highest performance private protocol, but high costs for frontend traffic access and multi-language support. |
| rest | Low | High | Not supported | Supported | Java Interface | REST protocol offers maximum flexibility in frontend access and interoperability, but has performance and weak typing drawbacks compared to RPC. **Note, REST is only a publishing form of the triple protocol in Dubbo 3.** |

{{% alert title="Note" color="warning" %}}
Starting from version 3.3, the triple protocol supports publishing standard HTTP services in REST style. Therefore, there no longer exists a separate REST protocol extension in the framework. However, we still choose to explain triple and REST as independent protocol implementations in documentation. Please be aware.
{{% /alert %}}

### Protocol Default Values
Below are specific development, configuration, and runtime information for several main protocols:
 | Protocol Name | Configuration Value | Service Definition Method | Default Port | Transport Layer Protocol | Serialization Protocol | Default |
 | --- | --- | --- | --- | --- | --- | --- |
 | **triple** | tri | - Java Interface <br/> - Protobuf (IDL) | 50051 | HTTP/1, HTTP/2 | Protobuf Binary, Protobuf JSON | No |
 | **dubbo** | dubbo | - Java Interface | 20880 | TCP | Hessian, Fastjson2, JSON, JDK, Avro, Kryo, etc. | **Yes** |
 | **rest** | tri or rest | - Java Interface + SpringMVC <br/> - Java Interface + JAX-RS | 50051 | HTTP/1, HTTP/2 | JSON | No |

 {{% alert title="Note" color="info" %}}
 For the sake of backward compatibility, all current Dubbo release versions default to using the `dubbo` communication protocol. **We strongly recommend that new users clearly configure to use the `triple` protocol from the beginning**, and old users refer to the documentation [for a smooth migration of the protocol](/en/overview/mannual/java-sdk/reference-manual/upgrades-and-compatibility/migration/).
 {{% /alert %}}

Next, let's look at the basic usage of the following protocols.

## Triple Protocol
### Basic Configuration
Enable the triple protocol with the configuration below, the default port is 50051; if `port: -1` is set, it will randomly select a port (incrementing from 50051 until the first available port is found).

```yaml
dubbo:
 protocol:
   name: tri
   port: 50051
```

### Service Definition Method
When using the triple protocol, developers can define Dubbo RPC services using two methods: `Java Interface` and `Protobuf (IDL)`. The protocol capabilities under both service definition modes are equivalent and only affect developers' programming experience. The specific choice of development mode depends on the user's business context.

#### 1. Java Interface
This method defines the service by declaring a Java interface. The example we saw in the quick start is this mode, **suitable for development teams without cross-language requirements, offering low learning costs; Dubbo 2 users can switch protocols at zero cost**.

Service definition example:

```java
public interface DemoService {
    String sayHello(String name);
}
```

You can say just setting `protocol="tri"` is enough; everything else is no different from the old version of Dubbo protocol development. Please refer to 【Advanced Learning - Communication Protocol】 for [specific usage examples of Java Interface + Triple protocol](/en/overview/mannual/java-sdk/tasks/protocols/triple/interface/).

#### 2. Protobuf (IDL)
This method defines services using Protobuf (IDL), **suitable for development teams currently or in the future having cross-language requirements; the same IDL service can be used for multi-language microservice development such as Java/Go/Node.js; the disadvantage is that the learning cost of Protobuf is relatively high**.

```Protobuf
syntax = "proto3";
option java_multiple_files = true;
package org.apache.dubbo.springboot.demo.idl;

message GreeterRequest {
  string name = 1;
}
message GreeterReply {
  string message = 1;
}

service Greeter{
  rpc greet(GreeterRequest) returns (GreeterReply);
}
```

Using the Dubbo-provided protoc compile plugin, the IDL service definition above compiles into related stub code, which contains the interface definitions needed by Dubbo. Thus, subsequent coding doesn't differ much, except for being automatically generated by the plugin here from user-defined Java Interface.

```java
// Generated by dubbo protoc plugin
public interface Greeter extends org.apache.dubbo.rpc.model.DubboStub {
    String JAVA_SERVICE_NAME = "org.apache.dubbo.springboot.demo.idl.Greeter";
    String SERVICE_NAME = "org.apache.dubbo.springboot.demo.idl.Greeter";

    org.apache.dubbo.springboot.demo.idl.GreeterReply greet(org.apache.dubbo.springboot.demo.idl.GreeterRequest request);
    // more generated codes here...
}
```

The Protobuf mode supports Protobuf and Protobuf-json serialization methods. Please refer to 【Advanced Learning - Communication Protocol】 for [specific usage examples of Protobuf (IDL) + Triple protocol](/en/overview/mannual/java-sdk/tasks/protocols/triple/idl/).

#### 3. Which programming mode should I use, and how to choose?

|  | Yes | No |
| --- | --- | --- |
| Does the company's business involve languages other than Java, and are cross-language interoperability scenarios common? | Protobuf | Java Interface |
| Are the developers in the company familiar with Protobuf and willing to accept the additional costs of Protobuf? | Protobuf | Java Interface |
| Is there a standard gRPC interoperability requirement? | Protobuf | Java Interface |
| Are you an old user of Dubbo 2 wanting to migrate to the triple protocol with zero transformation? | Java Interface | Protobuf |

### HTTP Access Method
The triple protocol supports direct access from standard HTTP tools, making it easy for frontend components like browsers and gateways to connect, and service testing also becomes simpler.

When the service starts, it can be accessed directly using the cURL command:
```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50052/org.apache.dubbo.springboot.demo.idl.Greeter/greet/
```

The above default uses the HTTP access path `org.apache.dubbo.springboot.demo.idl.Greeter/greet`, and only supports the POST method. If you want to publish REST-style services, please refer to the REST protocol section below.

You may also refer to [【Tutorial - Frontend Gateway Access】](/en/overview/mannual/java-sdk/tasks/gateway/triple/)

## Dubbo Protocol
### Basic Configuration
Enable the dubbo protocol with the configuration below, the default port is 20880; if `port: -1` is set, it will randomly select a port (incrementing from 20880 until the first available port is found).

```yaml
dubbo:
 protocol:
   name: dubbo
   port: 20880
```

### Service Definition Method
The dubbo protocol supports defining Dubbo RPC services using the `Java Interface` method, that is by declaring a Java interface. The serialization method can choose from Hessian, Fastjson2, JSON, Kryo, JDK, custom extensions, and any encoding protocol, with the default serialization protocol set to Fastjson2.

```java
public interface DemoService {
    String sayHello(String name);
}
```

{{% alert title="Note" color="info" %}}
Starting from version 3.2.0, Dubbo has introduced an automatic negotiation mechanism for serialization protocols. If conditions `both sides are specific Dubbo 3 versions + Fastjson2 dependencies exist` are met, it will automatically use the fastjson2 serialization protocol; otherwise, it will use the hessian2 protocol, with the negotiation being transparent and unnoticed by users.

Since the default serialization protocol for Dubbo 2 is hessian2, users should pay attention to compatibility issues during upgrades, especially for scenarios that intercept RPC call payloads, such as sidecars that parse link payloads.
{{% /alert %}}

* For specific usage examples of the dubbo protocol, please refer to the [dubbo protocol example](/en/overview/mannual/java-sdk/tasks/protocols/dubbo/) in 【Advanced Learning - Communication Protocol】.

### HTTP Access Method
Since the dubbo protocol cannot directly support HTTP traffic access, a gateway is needed to implement the conversion process from frontend HTTP protocol to backend dubbo protocol (`http -> dubbo`). The Dubbo framework provides the `generic invocation` capability, allowing the gateway to invoke backend services without defined service interfaces.

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/http-to-dubbo.png"/>

Currently, many open-source gateway products in the community (Higress, Shenyu, APISIX, Tengine, etc.) support `http -> dubbo`, most of which provide a visual interface for configuring parameter mapping (generic invocation) and also support automatic address discovery based on mainstream registries like Nacos, Zookeeper. More details are available in [【Tutorial - HTTP Gateway Access】](/en/overview/mannual/java-sdk/tasks/gateway/dubbo/).

## REST Protocol
As mentioned earlier, starting from version 3.3, the triple protocol supports publishing standard HTTP services in REST style. Therefore, if we publish REST-style services, it is equivalent to using the triple protocol, though we need to add specific annotations (Spring Web, JAX-RS) in the service definition.

```yaml
dubbo:
 protocol:
   name: tri
   port: 50051
```

{{% alert title="Note" color="info" %}}
For users of the old version, the REST configuration is `name: rest`; users can choose to change it to `name: tri`. It is also fine not to modify it; the Dubbo framework will automatically convert REST to triple protocol implementation.
{{% /alert %}}

Thus, REST is just a special publishing form of the triple protocol. To publish in REST format, we need to add annotations to the service interface definition.

### Annotations
Currently, the REST protocol only supports the `Java Interface` service definition mode. Compared to dubbo and triple protocols, in the REST scenario, we need to add annotations to the Interface, supporting both Spring MVC and JAX-RS annotations.

Spring MVC service definition example:
```java
@RestController
@RequestMapping("/demo")
public interface DemoService {
    @GetMapping(value = "/hello")
    String sayHello();
}
```

JAX-RS service definition example:
```java
@Path("/demo")
public interface DemoService {
    @GET
	@Path("/hello")
    String sayHello();
}
```

As you recall, the triple protocol natively supports cURL access, analogous to the access mode `org.apache.dubbo.springboot.demo.idl.Greeter/greet`. By adding the annotations above, REST-style access support can be additionally provided for triple services.

For specific usage examples of the REST protocol, please refer to 【Tutorial - Communication Protocol】 for the [REST protocol example](../rest/).

## Multi-Protocol Publishing
### Multi-Port and Multi-Protocol
Multi-protocol publishing means providing multiple access methods for the same service simultaneously. Multiple protocols can be any combination of two or more protocols. For instance, the configuration below publishes both dubbo and triple protocols:

```yaml
dubbo:
 protocols:
   tri:
     name: tri
     port: 50051
   dubbo:
     name: dubbo
	 port: 20880
```

Based on the above configuration, if there is a service DemoService in the application, it can be accessed via both the dubbo protocol and the triple protocol. The working principle diagram is as follows:

<img alt="Multi-Protocol" style="max-width:800px;height:auto;" src="/imgs/v3/tasks/protocol/multiple-protocols.png"/>

1. The provider instance listens on both ports 20880 and 50051 simultaneously.
2. The same instance registers two address URLs in the registry.
3. Different consumer ends can choose to invoke the service published by the same provider using different protocols.

For the consumer side, if the user does not configure explicitly, by default, the framework will automatically choose to invoke using the `dubbo` protocol. The Dubbo framework supports configuring which protocol to access the service, such as `@DubboReference(protocol="tri")`, or specifying the global default value in the application.yml configuration file:

```yaml
dubbo:
 consumer:
   protocol: tri
```

### Single-Port Multi-Protocol

In addition to publishing on multiple ports and registering multiple URLs to the registry, for the built-in protocols dubbo and triple, the framework provides the ability to publish both dubbo and triple protocols on a single port. This is a crucial capability for old users as it allows users using the dubbo protocol to additionally publish the triple protocol without adding any burden. As all applications implement multi-protocol publishing, we can set the consumer side to initiate calls using the triple protocol.

<img alt="Single-Port Multi-Protocol" style="max-width:800px;height:auto;" src="/imgs/v3/tasks/protocol/multiple-protocols-on-same-port.png"/>

The basic configuration for single-port multi-protocol is as follows:

 ```yaml
 dubbo:
  protocol:
    name: dubbo
    ext-protocol: tri
 ```

