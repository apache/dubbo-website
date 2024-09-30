---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/protocol/dubbo/
    - /en/docs3-v2/java-sdk/reference-manual/protocol/dubbo/
    - /en/overview/what/ecosystem/protocol/dubbo/
description: "This article describes the features and specific implementation details of the Dubbo protocol in Java."
linkTitle: dubbo
title: Dubbo Protocol
type: docs
weight: 3
---

The default protocol of Dubbo uses a single long connection and NIO asynchronous communication, which is suitable for service calls with small data sizes and high concurrency, especially in scenarios where the number of service consumers far exceeds the number of service providers. Dubbo RPC is the most core high-performance, high-throughput remote invocation method in the Dubbo system, which I like to refer to as multiplexing TCP long connection calls.

It is mainly used for remote calls between two Dubbo systems, particularly suitable for high concurrency and small data internet scenarios. Conversely, the default Dubbo protocol is not suitable for transmitting large amounts of data, such as file transfers or video transfers, unless the request volume is very low.

* **Long Connection: Avoids creating a new TCP connection for each call, improving response speed.**
* **Multiplexing: A single TCP connection can alternately transmit multiple requests and response messages, reducing idle time for connections and thereby decreasing the number of network connections under the same concurrency, increasing system throughput.**

![dubbo-protocol.jpg](/imgs/user/dubbo-protocol.jpg)

* Transporter: mina, netty, grizzy
* Serialization: dubbo, hessian2, java, json
* Dispatcher: all, direct, message, execution, connection
* ThreadPool: fixed, cached

The default protocol uses tbremoting interaction based on netty `3.2.5.Final` and hessian2 `3.2.1-fixed-2 (Alibaba embed version)`.

* Number of Connections: Single connection
* Connection Method: Long connection
* Transport Protocol: TCP
* Transport Method: NIO asynchronous transmission
* Serialization: Hessian binary serialization
* Applicable Scope: incoming and outgoing parameter data packets are small (recommended less than 100K), more consumers than providers, a single consumer cannot fully utilize the provider, avoid using the Dubbo protocol to transmit large files or extremely large strings.
* Applicable Scenario: Regular remote service method calls

**Constraints**

* Parameters and return values must implement the `Serializable` interface.
* Parameters and return values cannot use custom implementations of `List`, `Map`, `Number`, `Date`, `Calendar`, etc.; only JDK-provided implementations can be used, as Hessian will handle them specially, and properties of custom implementations will be lost.
* Hessian serialization only transmits member property values and their types, not methods or static variables, compatibility provided by **Wu Yajun**.

| Data Communication | Situation | Result |
| ------------- | ------------- | ------------- |
| A->B  | Class A has an additional property (or Class B has one less property) | No exceptions thrown, A’s additional property value, B does not have it, others are normal |
| A->B  | Enum A has an additional enum (or B has one less enum) | A uses the additional enum for transmission | Throws an exception |
| A->B  | Enum A has an additional enum (or B has one less enum) | A does not use the additional enum for transmission | No exception thrown, B normally receives data |
| A->B  | A and B have the same property name but different types | Throws an exception |
| A->B  | serialId is different | Normal transmission |

Adding methods to the interface has no impact on the client; if the method is not needed by the client, redeployment is not required. Adding properties to input parameters and result sets has no impact on the client; if the client does not need the new properties, redeployment is not necessary.

Changes in input parameter and result set property names have no effect on client serialization, but if the client does not redeploy, property values for properties with changed names will not be retrievable.

{{% alert title="Summary" color="info" %}}
- The server and client do not need to have completely consistent domain objects but should follow the principle of maximum matching.
- Exception scenarios: one side has more enum values, the other side has fewer, and the used enum varies between them, or property names are the same but types differ.
{{% /alert %}}

## Usage

### Configuring Protocol

```xml
<dubbo:protocol name="dubbo" port="20880" />
```

### Setting Default Protocol

```xml
<dubbo:provider protocol="dubbo" />
```

### Setting Protocol for a Specific Service

```xml
<dubbo:service interface="..." protocol="dubbo" />
```

### Multiple Ports

```xml
<dubbo:protocol id="dubbo1" name="dubbo" port="20880" />
<dubbo:protocol id="dubbo2" name="dubbo" port="20881" />
```

### Configuring Protocol Options

```xml
<dubbo:protocol name="dubbo" port="9090" server="netty" client="netty" codec="dubbo" serialization="hessian2" charset="UTF-8" threadpool="fixed" threads="100" queues="0" iothreads="9" buffer="8192" accepts="1000" payload="8388608" />
```

### Multi-Connection Configuration

The default Dubbo protocol uses a single long connection for each service, each provider, and each consumer. If the data volume is large, multiple connections can be employed.

```xml
<dubbo:service interface="..." connections="1"/>
<dubbo:reference interface="..." connections="1"/>
```

* `<dubbo:service connections="0">` or `<dubbo:reference connections="0">` indicates that the service uses JVM shared long connections. **Default**
* `<dubbo:service connections="1">` or `<dubbo:reference connections="1">` indicates that the service uses independent long connections.
* `<dubbo:service connections="2">` or `<dubbo:reference connections="2">` indicates that the service uses two independent long connections.

To prevent being overwhelmed by too many connections, the service provider can limit the number of large incoming connections for self-protection.

```xml
<dubbo:protocol name="dubbo" accepts="1000" />
```

## Common Issues

### Q1 Why should the number of consumers exceed the number of providers?

Because the Dubbo protocol uses a single long connection, assuming the network is a gigabit network **1024Mbit=128MByte**, based on testing experience, each connection can typically handle a maximum of 7MByte (varies by environment), theoretically, 1 service provider requires 20 service consumers to fully utilize the network card.

### Q2 Why can’t large packets be transmitted?

Because the Dubbo protocol uses a single long connection, if each request packet size is 500KByte, assuming the network is a gigabit network **1024Mbit=128MByte**, the maximum TPS (transactions per second) for a single service provider is: 128MByte / 500KByte = 262. The maximum TPS for a single consumer calling a single service provider is: 7MByte / 500KByte = 14. If this can be accepted, it could be considered; otherwise, the network will become a bottleneck.

### Q3 Why use asynchronous single long connections?

Because the current situation of services is mostly that there are fewer providers, typically only a few machines, while there are many consumers; the entire website may be accessing the service. For example, Morgan has only 6 providers but over a hundred consumers, with 150 million calls per day. If conventional Hessian services were used, it would be easy for the service providers to be overloaded; by using a single connection, it ensures that a single consumer won't overload the provider, long connections reduce connection handshake validation, etc., and asynchronous IO is used with a thread pool to prevent the C10K problem.

