---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/config-connections/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/stickiness/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/lazy-connect/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/config-connections/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/stickiness/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/lazy-connect/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/config-connections/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/performance/config-connections/
description: Connection control between server and client in Dubbo
linkTitle: Connection Control
title: Connection Control
type: docs
weight: 29
---





## Function Description
The connection control feature allows users to manage and control the number of incoming and outgoing connections to the server, limit the number of connections, and set timeouts, ensuring the stability and performance of the Dubbo system. It also allows users to configure different levels of access control based on IP address, port, and protocol to protect the system from malicious traffic and reduce the risk of service interruptions. Additionally, it provides a way to monitor current traffic and connection status.

## Use Cases
1. Reduce connections when the server is overloaded: When the server is overloaded, use Dubbo to set a maximum connection limit to reduce load and prevent crashes.
2. Limit connections during attacks: Dubbo can limit the number of connections during an attack to prevent malicious connections from overwhelming the server and causing a crash.
3. Limit connections to specific services: Dubbo can limit the number of connections to specific services to prevent overload from too many requests and ensure timely responses.
4. Limit connections from a single IP address: Dubbo can limit the number of connections from a single IP to reduce the risk of malicious activity.

## Usage
### Server-Side Connection Control

Limit the server-side accepted connections to no more than 10 [^1]:

```xml
<dubbo:provider protocol="dubbo" accepts="10" />
```

or

```xml
<dubbo:protocol name="dubbo" accepts="10" />
```

### Client-Side Connection Control

Limit the client service connections to no more than 10 [^2]:

```xml
<dubbo:reference interface="com.foo.BarService" connections="10" />
```

or

```xml
<dubbo:service interface="com.foo.BarService" connections="10" />
```

If both `<dubbo:service>` and `<dubbo:reference>` are configured with connections, `<dubbo:reference>` takes precedence, see: [Configuration Override Policy](/en/overview/mannual/java-sdk/reference-manual/config/principle/)

[^1]: Because connections are on the Server, this is configured on the Provider.
[^2]: If it is a long connection, such as the Dubbo protocol, connections indicate the number of long connections established for each provider of that service.




## Function Description
Consumers can send requests to the provider before the provider is ready to receive requests, ensuring requests are sent at the right time and preventing consumers from being blocked by slow or unavailable providers.

## Use Cases
Sticky connections are used for stateful services, allowing clients to always invoke the same provider unless that provider is down.

Sticky connections will automatically enable [lazy connect](../lazy-connect) to reduce the number of long connections.

## Usage
```xml
<dubbo:reference id="xxxService" interface="com.xxx.XxxService" sticky="true" />
```

Dubbo supports method-level sticky connections, allowing for more granular control.

```xml
<dubbo:reference id="xxxService" interface="com.xxx.XxxService">
    <dubbo:method name="sayHello" sticky="true" />
</dubbo:reference>
```





## Function Description
True connections are established only when the consumer actually uses the service, avoiding unnecessary connections to reduce latency and improve system stability.

## Use Cases
Lazy connections are used to reduce the number of long connections. Long connections are created when a call is initiated.

## Usage
```xml
<dubbo:protocol name="dubbo" lazy="true" />
```

> This configuration only takes effect for the Dubbo protocol used with long connections.

