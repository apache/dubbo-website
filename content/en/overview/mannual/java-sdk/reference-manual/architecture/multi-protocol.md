---
description: "Apache Dubbo single-port multi-protocol implementation principle & source code analysis."
linkTitle: Single-Port Multi-Protocol
title: Analysis of Single-Port Multi-Protocol Implementation Principles
type: docs
weight: 1
---

By configuring protocols, Dubbo 3 can support port protocol multiplexing. For instance, after enabling port reuse with the Triple protocol, you can add support for the Dubbo protocol and the Qos protocol on the same port. These protocols are identified by a unified port reuse server, which can facilitate service protocol migration, save ports and related resources, and reduce operational complexity.

![pu-server-image1](/imgs/blog/pu-server/pu-server-flow.png)

- During the service creation phase, different Protocol objects are created for export by retrieving service export protocol configurations from the Config layer. If it's not the first time creating a port-reusing Server, the Exchanger saves data passed from the Protocol layer to the Server for subsequent processing of that protocol type's messages.

- When messages from clients arrive, they first go through the Server to the ProtocolDetector. If identification is successful, the corresponding protocol is marked for that client. The handling logic is configured via WireProtocol, and ultimately, it is handed over to ChannelOperator to bind the IO framework and the corresponding Dubbo framework processing logic.

- Once the protocol recognition is completed, the Channel determines how to handle messages from remote clients, which can be processed through the corresponding ServerPipeline (during processing, the message handling thread is also determined by configuration).

## Usage Scenarios
- The most common application is service discovery. This allows applications to discover services over the network and communicate with them using the same port, which helps reduce the complexity of network communications and makes management easier.

- It can be used for load balancing. This allows applications to balance loads between multiple remote services or service clusters, which helps improve the scalability, reliability, and availability of services.

- It can be used for service monitoring. This allows applications to monitor the health of remote services and issue alerts when a service fails or becomes unavailable, helping to ensure service availability and reduce downtime.

> Reference use case
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-port-unification](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-port-unification)

## Usage Method
Deploy multiple services on the same host or access multiple services via a load balancer.

> About the configuration methods supported by Dubbo [Configuration Instructions](/en/overview/mannual/java-sdk/reference-manual/config/)

### Service Multi-Protocol Export

The ext-protocol parameter supports configuring multiple different protocols, which are separated by ",".

#### XML Configuration

```xml
<dubbo:protocol name="dubbo" port="-1" ext-protocol="tri,"/>

<bean id="greetingService" class="org.apache.dubbo.demo.provider.GreetingServiceImpl"/>

<dubbo:service delay="5000" version="1.0.0" group="greeting" timeout="5000" interface="org.apache.dubbo.demo.GreetingService" ref="greetingService" protocol="dubbo"/>

```

#### API Configuration

```java
ProtocolConfig config = new ProtocolConfig(CommonConstants.TRIPLE, -1);

config.setExtProtocol(CommonConstants.DUBBO+",");
```

#### YAML Configuration

``` yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
  protocol:
    name: tri
    port: -1
    ext-protocol: dubbo,
```

#### Properties Configuration
```properties
dubbo.protocol.name=tri
dubbo.protocol.ext-protocol=dubbo,
dubbo.protocol.port=20880
```

### Qos Access

#### Qos Module Import

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-qos</artifactId>
</dependency>
```

After importing the Qos module, related configuration items can refer to the [Qos Operation Manual](/en/overview/mannual/java-sdk/reference-manual/qos/overview/) for configuration.

By default, the Qos service based on port reuse is started after the module is imported. 

### Qos Usage

To integrate the Qos protocol into port reuse scenarios, after establishing a connection, the client must first send a message to the server. Compared to providing Qos service through a single port, the port-reuse version of Qos protocol requires users to perform some operations to complete protocol identification (one of two options).

1. Directly invoke commands

    Directly calling telnet-supported commands can also complete identification; when users are unfamiliar, they can use the help command to aid recognition.

    ![pu-server-image2](/imgs/blog/pu-server/qos-telnet-directcall.png)

2. Sending telnet command identification

   After establishing a connection with the telnet command, execute the following steps:

   1. Use ctrl + "]" to enter the telnet interactive interface (default escape character for telnet).
   2. Call "send ayt" to send a special identification field to the server (a special field for the telnet protocol).
   3. Press Enter to complete the message sending and enter the dubbo interactive interface.

   ![pu-server-imgs3](/imgs/blog/pu-server/qos-telnet-sendayt.png)


### Service Reference

Using the example from [dubbo-samples-port-unification](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-port-unification) as a basis, referencing services with different protocols and configurations in a non-port reuse scenario are consistent. Below is the output of the URL information during the invocation process through the InvokerListener on the Consumer side.

```java
ReferenceConfig<GreetingService> reference = new ReferenceConfig<>();
reference.setInterface(GreetingService.class);
reference.setListener("consumer");
reference.setProtocol(this.protocol);
// reference.setProtocol(CommonConstants.DUBBO);
// reference.setProtocol(CommonConstants.TRIPLE);
```

![pu-server-imgs4](/imgs/blog/pu-server/reference-service.png)

