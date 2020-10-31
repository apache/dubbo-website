# API Reference

Generally speaking, dubbo keeps its functionality no intrusive as much as possible, but for some particular features, there's no other way not only API can achieve. [^1]

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

Pls. refer to [API Configuration](../configuration/api.md) for further information. 

## Annotation API

```
org.apache.dubbo.config.annotation.Service
org.apache.dubbo.config.annotation.Reference
```

Pls. refer to [Annotation Configuration](../configuration/annotation.md) for further information.

## Model API

```
org.apache.dubbo.common.URL
org.apache.dubbo.rpc.RpcException
```

## Context API

```
org.apache.dubbo.rpc.RpcContext
```

Pls. refer to [context](../demos/context.md) & [pass parameter in attachment](../demos/attachment.md) & [asynchronous call](../demos/async-call.md) for further information.

## Service API

```
org.apache.dubbo.rpc.service.GenericService
org.apache.dubbo.rpc.service.GenericException
```

Pls. refer to [generic reference](../demos/generic-reference.md) & [generic service](../demos/generic-service.md) for further information.

```
org.apache.dubbo.rpc.service.EchoService
```
Pls. refer to [test via echo service](../demos/echo-service.md) for further details.

[^1]: Attention: do not rely on APIs other than what're mentioned here, otherwise your application may face the risk of incompatibility after upgrade dubbo.