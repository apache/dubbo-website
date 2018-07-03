# API Reference

Generally speaking, dubbo keeps its functionality no intrusive as much as possible, but for some particular features, there's no other way not only API can achieve. [^1]

These APIs are summarized here below:

## Configuration API

```
com.alibaba.dubbo.config.ServiceConfig
com.alibaba.dubbo.config.ReferenceConfig
com.alibaba.dubbo.config.ProtocolConfig
com.alibaba.dubbo.config.RegistryConfig
com.alibaba.dubbo.config.MonitorConfig
com.alibaba.dubbo.config.ApplicationConfig
com.alibaba.dubbo.config.ModuleConfig
com.alibaba.dubbo.config.ProviderConfig
com.alibaba.dubbo.config.ConsumerConfig
com.alibaba.dubbo.config.MethodConfig
com.alibaba.dubbo.config.ArgumentConfig
```

Pls. refer to [API Configuration](../configuration/api.md) for further information. 

## Annotation API

```
com.alibaba.dubbo.config.annotation.Service
com.alibaba.dubbo.config.annotation.Reference
```

Pls. refer to [Annotation Configuration](../configuration/annotation.md) for further information.

## Model API

```
com.alibaba.dubbo.common.URL
com.alibaba.dubbo.rpc.RpcException
```

## Context API

```
com.alibaba.dubbo.rpc.RpcContext
```

Pls. refer to [context](../demos/context.md) & [pass parameter in attachment](../demos/attachment.md) & [asynchronous call](../demos/async-call.md) for further information.

## Service API

```
com.alibaba.dubbo.rpc.service.GenericService
com.alibaba.dubbo.rpc.service.GenericException
```

Pls. refer to [generic reference](../demos/generic-reference.md) & [generic service](../demos/generic-service.md) for further information.

```
com.alibaba.dubbo.rpc.service.EchoService
```
Pls. refer to [test via echo service](../demos/echo-service.md) for further details.

[^1]: Attention: do not rely on APIs other than what're mentioned here, otherwise your application may face the risk of incompatibility after upgrade dubbo.