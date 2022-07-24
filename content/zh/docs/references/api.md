---
type: docs
title: "API 参考手册"
linkTitle: "API 参考手册"
weight: 7
description: "Dubbo API 参考手册"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/reference-manual/config/api/)。
{{% /pageinfo %}}

Dubbo 的常规功能，都保持零侵入，但有些功能不得不用 API 侵入才能实现。  

{{% alert title="提示" color="primary" %}}
Dubbo 中除这里声明以外的接口或类，都是内部接口或扩展接口，普通用户请不要直接依赖，否则升级版本可能出现不兼容。
{{% /alert %}}

API 汇总如下：  

## 配置 API

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

详细参见：[API配置](../configuration/api)  

## 注解 API

```
org.apache.dubbo.config.annotation.DubboService
org.apache.dubbo.config.annotation.DubboReference
```

详细参见：[注解配置](../configuration/annotation)

## 模型 API

```
org.apache.dubbo.common.URL
org.apache.dubbo.rpc.RpcException
```

## 上下文 API

```
org.apache.dubbo.rpc.RpcContext
```

详细参见：[上下文信息](../../advanced/context) & [隐式传参](../../advanced/attachment) & [异步调用](../../advanced/async-call)

## 服务 API

```
org.apache.dubbo.rpc.service.GenericService
org.apache.dubbo.rpc.service.GenericException
```

详细参见：[泛化引用](../../advanced/generic-reference) & [泛化实现](../../advanced/generic-service)

```
org.apache.dubbo.rpc.service.EchoService
```
详细参见：[回声测试](../../advanced/echo-service)
