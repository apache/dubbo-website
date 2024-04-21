---
type: docs
title: "Local call"
linkTitle: "Local call"
weight: 22
description: "Local call in Dubbo"
---

## Feature description
The local call uses the injvm protocol, which is a pseudo-protocol. It does not open ports, does not initiate remote calls, and is only directly associated in the JVM, but executes Dubbo's Filter chain.

## scenes to be used

When we need to call a remote service, the remote service has not been developed yet, and similar services are implemented locally using the injvm protocol. When calling this service, we can call our local implementation service.

## How to use

### Define the injvm protocol
```xml
<dubbo:protocol name="injvm" />
```

### Set the default protocol

```xml
<dubbo:provider protocol="injvm" />
```

### Set service protocol

```xml
<dubbo:service protocol="injvm" />
```

### Prioritize the use of injvm

```xml
<dubbo:consumer injvm="true" .../>
<dubbo:provider injvm="true" .../>
```

**or**

```xml
<dubbo:reference injvm="true" .../>
<dubbo:service injvm="true" .../>
```

#### Notice:
Dubbo from `2.2.0`, each service will be exposed locally by default, and can be referenced locally without any configuration. If you do not want the service to be exposed remotely, you only need to set the protocol to injvm in the provider. **


### Automatic exposure

Starting with `2.2.0`, every service is exposed locally by default. When referencing services, local services are preferred by default. If you want to reference remote services, you can use the following configuration to force references to remote services.

```xml
<dubbo:reference ... scope="remote" />
```

### Dynamic configuration call behavior

Starting with' 3.2', the api provided by Dubbo allows users to dynamically configure whether a single call is a local call or a remote call, and when it is not configured, the local service will be referenced first by default.

**Configure a single call as a remote call.**

```java
RpcContext.getServiceContext().setLocalInvoke(false);
```

**Configure a single call as a local call.**

```java
RpcContext.getServiceContext().setLocalInvoker(true);
```

