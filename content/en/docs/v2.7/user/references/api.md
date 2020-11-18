---
type: docs
title: "API Reference"
linkTitle: "API"
weight: 7
description: "References documentation for dubbo API"
---

Generally speaking, dubbo keeps its functionality no intrusive as much as possible, but for some particular features, there's no other way not only API can achieve. 
{{% alert title="Warning" color="warning" %}}
Do not rely on APIs other than what're mentioned here, otherwise your application may face the risk of incompatibility after upgrade dubbo.
{{% /alert %}}
These APIs are summarized here below:

## Configuration API

```
org.apache.dubbo.config.ServiceConfig
org.apache.dubbo.config.ReferenceConfig
org.apache.dubbo.config.ProtocolConfig
org.apache.dubbo.config.RegistryConfig
org.apache.dubbo.config.MonitorConfig
org.apache.dubbo.config.ApplicationConfig
org.apache.dubbo.config.ModuleConfig
org.apache.dubbo.config.ProviderConfig
org.apache.dubbo.config.ConsumerConfig
org.apache.dubbo.config.MethodConfig
org.apache.dubbo.config.ArgumentConfig
```

Pls. refer to [API Configuration](../../configuration/api) for further information. 

## Annotation API

```
org.apache.dubbo.config.annotation.Service
org.apache.dubbo.config.annotation.Reference
```

Pls. refer to [Annotation Configuration](../../configuration/annotation) for further information.

## Model API

```
org.apache.dubbo.common.URL
org.apache.dubbo.rpc.RpcException
```

## Context API

```
org.apache.dubbo.rpc.RpcContext
```

Pls. refer to [context](../../examples/context) & [pass parameter in attachment](../../examples/attachment) & [asynchronous call](../../examples/async-call) for further information.

## Service API

```
org.apache.dubbo.rpc.service.GenericService
org.apache.dubbo.rpc.service.GenericException
```

Pls. refer to [generic reference](../../examples/generic-reference) & [generic service](../../examples/generic-service) for further information.

```
org.apache.dubbo.rpc.service.EchoService
```
Pls. refer to [test via echo service](../../examples/echo-service) for further details.

