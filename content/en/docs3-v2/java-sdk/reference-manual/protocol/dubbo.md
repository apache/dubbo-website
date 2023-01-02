---
type: docs
title: "Dubbo protocol"
linkTitle: "Dubbo protocol"
weight: 2
---

## Feature description
Dubbo's default protocol uses a single long connection and NIO asynchronous communication, which is suitable for small data volume and large concurrent service calls, and the situation where the number of service consumer machines is much larger than the number of service provider machines.

Conversely, Dubbo's default protocol is not suitable for services that transmit large amounts of data, such as file transfers, video transfers, etc., unless the request volume is very low.

![dubbo-protocol.jpg](/imgs/user/dubbo-protocol.jpg)

* Transporter: mina, netty, grizzy
* Serialization: dubbo, hessian2, java, json
* Dispatcher: all, direct, message, execution, connection
* ThreadPool: fixed, cached


Default protocol, using tbremoting interaction based on netty `3.2.5.Final` and hessian2 `3.2.1-fixed-2(Alibaba embed version)`.

* Number of connections: single connection
* Connection method: long connection
* Transport protocol: TCP
* Transmission method: NIO asynchronous transmission
* Serialization: Hessian binary serialization
* Scope of application: The incoming and outgoing parameter data packets are small (recommended to be less than 100K), the number of consumers is more than that of the provider, and a single consumer cannot fill the provider. Try not to use the dubbo protocol to transfer large files or very large strings.
* Applicable scenario: regular remote service method call

**constraint**

* Parameters and return values need to implement `Serializable` interface
* Parameters and return values cannot be customized to implement `List`, `Map`, `Number`, `Date`, `Calendar` and other interfaces, only the implementations that come with JDK can be used, because hessian will do special processing and customize the implementation All attribute values in the class are lost.
* Hessian serialization, only pass member attribute values and value types, do not pass methods or static variables, compatibility **provided by Wu Yajun**

| Data communication | Situation | Results |
| ------------- | ------------- | ------------- |
| A->B | Class A has one more attribute (or class B has one less attribute) | No exception is thrown, the value of the attribute with more A, B does not, and the others are normal |
| A->B | enumeration A has one more enumeration (or B has one less enumeration) | A uses the extra enumeration for transmission | throws exception |
| A->B | Enumeration A has one more enumeration (or B has one less enumeration) | A does not use the extra enumeration for transmission | No exception is thrown, B receives data normally |
| A->B | The attributes of A and B have the same name but different types | Throw an exception |
| A->B | The serialId is different | Normal transmission |

The method added to the interface has no impact on the client. If the method is not required by the client, the client does not need to redeploy. The addition of attributes in input parameters and result sets has no effect on the client. If the client does not need new attributes, there is no need to redeploy.

Changes in input parameters and result set attribute names have no impact on client serialization, but if the client is not redeployed, regardless of input or output, the attribute values with changed attribute names cannot be obtained.

**Summarize**
- The server and the client do not need to be completely consistent with the domain objects, but follow the principle of maximum matching.
- An exception will be thrown: one more type of enumeration value and one less type, just use a different one, or the attribute name is the same, but the type is different.


## scenes to be used

It is suitable for service calls with large concurrent and small data volumes, and the service consumer is much larger than the service provider.

## How to use

### Configuration protocol

```xml
<dubbo:protocol name="dubbo" port="20880" />
```

### Set the default protocol

```xml
<dubbo:provider protocol="dubbo" />
```

### Set the protocol of a service

```xml
<dubbo:service interface="..." protocol="dubbo" />
```

### Multiport

```xml
<dubbo:protocol id="dubbo1" name="dubbo" port="20880" />
<dubbo:protocol id="dubbo2" name="dubbo" port="20881" />
```

### Configure protocol options

```xml
<dubbo:protocol name="dubbo" port="9090" server="netty" client="netty" codec="dubbo" serialization="hessian2" charset="UTF-8" threadpool="fixed" threads="100 " queues="0" iothreads="9" buffer="8192" accepts="1000" payload="8388608" />
```

### Multi-connection configuration

By default, the Dubbo protocol uses a single long connection per service, per provider and per consumer. If the amount of data is large, multiple connections can be used.

```xml
<dubbo:service interface="..." connections="1"/>
<dubbo:reference interface="..." connections="1"/>
```

* `<dubbo:service connections="0">` or `<dubbo:reference connections="0">` means that the service uses JVM shared persistent connection. **default**
* `<dubbo:service connections="1">` or `<dubbo:reference connections="1">` means that the service uses independent persistent connections.
* `<dubbo:service connections="2">` or `<dubbo:reference connections="2">` means that the service uses two independent persistent connections.

In order to prevent being hung up by a large number of connections, the maximum number of receiving connections can be limited on the service provider to achieve self-protection of the service provider.

```xml
<dubbo:protocol name="dubbo" accepts="1000" />
```

## common problem

### Q1
Why should there be more consumers than providers?

Because the dubbo protocol uses a single long connection, assuming that the network is a gigabit network card **1024Mbit=128MByte**, according to the test experience data, each connection can only be filled up to 7MByte (different environments may be different, for reference), theoretically 1 A service provider needs 20 service consumers to fill up the network card.

### Q2
Why can't I send large packets?

Because the dubbo protocol uses a single long connection, if the data packet size of each request is 500KByte, assuming that the network is a Gigabit network card**1024Mbit=128MByte**, each connection can be up to 7MByte (different environments may be different), a single service provides The maximum TPS (transactions per second) of the latter is: 128MByte / 500KByte = 262. The maximum TPS (transactions per second) for a single consumer to call a single service provider is: 7MByte / 500KByte = 14. If acceptable, you can consider using it, otherwise the network will become a bottleneck.

### Q3
Why use asynchronous single long connection?

Because the current situation of the service is that there are few service providers, usually only a few machines, but many service consumers, the entire website may be accessing the service. For example, Morgan’s provider has only 6 providers, but there are hundreds of consumers. Or, there are 150 million calls per day. If the conventional Hessian service is used, the service provider is easily overwhelmed. Through a single connection, it is guaranteed that a single consumer will not overwhelm the provider, long-term connection, reducing connection handshake verification, etc. And use asynchronous IO, reuse thread pool, prevent C10K problem.