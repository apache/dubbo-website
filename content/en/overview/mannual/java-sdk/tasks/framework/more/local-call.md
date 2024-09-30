---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/local-call/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/local-call/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/local-call/
description: Local Calls in Dubbo
linkTitle: Local Call
title: Local Call
type: docs
weight: 22
---

## Feature Description
Local calls use the injvm protocol, which is a pseudo-protocol that does not open a port or initiate remote calls; it directly associates within the JVM but executes the Dubbo filter chain.

## Usage Scenarios

When we need to call a remote service that is not yet developed, we can implement a similar service locally using the injvm protocol, allowing us to invoke our local implementation of the service.

## Usage Method

### Define the injvm Protocol
```xml
<dubbo:protocol name="injvm" />
```

### Set Default Protocol

```xml
<dubbo:provider protocol="injvm" />
```

### Set Service Protocol

```xml
<dubbo:service protocol="injvm" />
```

### Prefer injvm

```xml
<dubbo:consumer injvm="true" .../>
<dubbo:provider injvm="true" .../>
```

**or**

```xml
<dubbo:reference injvm="true" .../>
<dubbo:service injvm="true" .../>
```

{{% alert title="Note" color="warning" %}}
**From `2.2.0`, each service is exposed locally by default, and no configuration is needed for local reference. If you do not want the service to be exposed remotely, simply set the protocol to injvm in the provider.**
{{% /alert %}}

### Automatic Exposure

Starting from `2.2.0`, each service is exposed locally by default. When referencing a service, the local service is prioritized by default. To reference a remote service, you can use the following configuration to force a remote reference.

```xml
<dubbo:reference ... scope="remote" />
```

### Dynamically Configure Call Behavior

Starting from `3.2`, Dubbo provides an API that allows users to dynamically configure whether a single call is a local or remote call. By default, it prioritizes local services if no configuration is provided.

**Configure a single call as a remote call**

```java
RpcContext.getServiceContext().setLocalInvoke(false);
```

**Configure a single call as a local call**

```java
RpcContext.getServiceContext().setLocalInvoke(true);
```

