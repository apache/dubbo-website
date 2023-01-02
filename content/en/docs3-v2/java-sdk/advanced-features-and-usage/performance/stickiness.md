---
type: docs
title: "Stick Connection"
linkTitle: "Stick connection"
weight: 31
description: "Configure sticky connections for stateful services"
---
## Feature description

## scenes to be used
Sticky connections are used for stateful services, so that the client always initiates calls to the same provider as much as possible, unless the provider hangs up and connects to another one.

Sticky connection will automatically enable [Delayed Connection](../lazy-connect) to reduce the number of long connections.

## How to use
```xml
<dubbo:reference id="xxxService" interface="com.xxx.XxxService" sticky="true" />
```

Dubbo supports method-level sticky connections, if you want more fine-grained control, you can also configure it like this.

```xml
<dubbo:reference id="xxxService" interface="com.xxx.XxxService">
    <dubbo:method name="sayHello" sticky="true" />
</dubbo:reference>
```