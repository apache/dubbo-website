---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/multi-protocols/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/multi-protocols/
    - /en/overview/tasks/protocols/multi-protocols/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/multi-protocols
description: Configuring Multiple Protocols in Dubbo
linkTitle: Multiple Protocols
title: Multiple Protocols
type: docs
weight: 4
---

Unlike ordinary RPC frameworks, Dubbo, as a microservices framework, provides very flexible protocol support and does not bind to a single communication protocol. Therefore, you **can publish multiple RPC protocols simultaneously in one process and call different RPC protocols**. Next, we will detail the specific use cases and methods for multiple protocols.

## Use Cases
There are many scenarios where different protocols may be needed, including security, performance, and interaction with third-party systems. This article does not analyze specific business requirements but instead explores the multi-protocol capabilities provided by the Dubbo framework:

* As a service provider, the same service can be published under multiple protocols for different consumers.
* As a service provider, multiple services can be published under different protocols for different consumers.
* As a service consumer, a specific protocol can be designated to call a service.

## Usage

### Publish the Same Service under Multiple Protocols

If using Spring Boot, you can modify application.yml or application.properties as follows:
```yaml
dubbo:
  protocols:
    dubbo-id:
      name: dubbo
      port: 20880
    tri-id:
      name: tri
      port: 50051
```

For Spring XML:

```xml
<dubbo:protocol id="dubbo-id" name="dubbo" port="20880"/>
<dubbo:protocol id="triple-id" name="tri" port="50051"/>
```

Next, configure the service (by default, the service will be published to all protocol configurations above):

```java
@DubboService(protocol="dubbo-id,triple-id")
private DemoServiceImpl implements DemoService {}
```

### Publish Multiple Services under Different Protocols

If using Spring Boot, modify application.yml or application.properties as follows:
```yaml
dubbo:
  protocols:
    dubbo-id:
      name: dubbo
      port: 20880
    tri-id:
      name: tri
      port: 50051
```

Next, configure different protocol references for different services:

```java
@DubboService(protocol="dubbo-id")
private DemoServiceImpl implements DemoService {}
```

```java
@DubboService(protocol="triple-id")
private GreetingServiceImpl implements GreetingService {}
```

### Specify Protocol to Call Services

For consumers, simply specify the protocol keyword when declaring the reference:

```java
@DubboReference(protocol="dubbo")
private DemoService demoService;
```

```java
@DubboReference(protocol="tri")
private GreetingService greetingService;
```

## Different Implementation Methods

### Multi-Port Multi-Protocol
Multi-protocol publishing means providing multiple protocol access methods for the same service. Multi-protocol can be any combination of two or more protocols, such as the configuration below which simultaneously publishes both dubbo and triple protocols:

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

Based on the configuration above, if the application has the service DemoService, it can be accessed via both the dubbo and triple protocols. The working principle diagram is as follows:

<img alt="Multiple Protocols" style="max-width:800px;height:auto;" src="/imgs/v3/tasks/protocol/multiple-protocols.png"/>

1. The provider instance simultaneously listens on both ports 20880 and 50051.
2. The same instance registers two address URLs in the registration center.
3. Different consumers can choose to call the services published by the same provider using different protocols.

For consumers, if the user has not specified, the framework will automatically select the `dubbo` protocol by default. The Dubbo framework supports configuring which protocol accesses the service, such as `@DubboReference(protocol="tri")`, or specifying a global default in the application.yml configuration file:

```yaml
dubbo:
 consumer:
   protocol: tri
```

### Single-Port Multi-Protocol

In addition to the methods of publishing multiple ports and registering multiple URLs to the registration center, for the built-in dubbo and triple protocols, the framework provides the ability to publish both protocols on a single port simultaneously. This is an important capability for long-time users, as it allows users utilizing the dubbo protocol to additionally publish the triple protocol without adding any burden. Once all applications realize multi-protocol publishing, we can set consumers to initiate calls via the triple protocol.

<img alt="Single-Port Multi-Protocol" style="max-width:800px;height:auto;" src="/imgs/v3/tasks/protocol/multiple-protocols-on-same-port.png"/>

The basic configuration for single-port multi-protocol is as follows:

 ```yaml
 dubbo:
  protocol:
    name: dubbo
    ext-protocol: tri
 ```

