---
type: docs
title: "Connection Control"
linkTitle: "Connection Control"
weight: 29
description: "Connection control between server and client in Dubbo"
---
## Feature description

## scenes to be used

## How to use
### Server connection control

Limit the number of connections accepted by the server to no more than 10 [^1]:

```xml
<dubbo:provider protocol="dubbo" accepts="10" />
```

or

```xml
<dubbo:protocol name="dubbo" accepts="10" />
```

### Client connection control

Limit the client service to use no more than 10 connections [^2]:

```xml
<dubbo:reference interface="com.foo.BarService" connections="10" />
```

or

```xml
<dubbo:service interface="com.foo.BarService" connections="10" />
```

If both `<dubbo:service>` and `<dubbo:reference>` are configured with connections, `<dubbo:reference>` takes precedence, see: [Configuration override strategy](../../../reference- manual/config/principle/)

[^1]: Because it is connected to the Server, it is configured on the Provider
[^2]: If it is a long connection, such as the Dubbo protocol, connections indicates the number of long connections established by the service for each provider