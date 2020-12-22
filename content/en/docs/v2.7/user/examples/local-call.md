---
type: docs
title: "Local Call"
linkTitle: "Local Call"
weight: 22
description: "Local call in dubbo"
---

The local call uses the `injvm` protocol, a pseudo-protocol that does not turn on the port, does not initiate remote calls, is directly associated within the JVM, but executes the Dubbo Filter chain.

## Configuration

Configure `injvm` protocol

```xml
<dubbo:protocol name="injvm" />
```

Configure default provider

```xml
<dubbo:provider protocol="injvm" />
```

Configure default service

```xml
<dubbo:service protocol="injvm" />
```

Use injvm first

```xml
<dubbo:consumer injvm="true" .../>
<dubbo:provider injvm="true" .../>
```

or

```xml
<dubbo:reference injvm="true" .../>
<dubbo:service injvm="true" .../>
```

Note: Dubbo services are exposed locally from `2.2.0` by default. It can be referenced locally without any configuration. If you don't want the service to be exposed remotely, you only need to set the protocol to injvm in the provider.

## Automatically exposed, local service references

`2.2.0` or later, each service is exposed locally by default. When referring to the service, the local service is referenced by default. If you want to reference a remote service, you can use the following configuration to force a reference to a remote service.


```xml
<dubbo:reference ... scope="remote" />
```
