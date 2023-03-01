---
aliases:
    - /zh/docsv2.7/user/references/api/
description: Dubbo API 参考手册
linkTitle: API 参考手册
title: API 参考手册
type: docs
weight: 7
---



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

详细参见：[API配置](../../configuration/api)  

## 注解 API

```
org.apache.dubbo.config.annotation.Service
org.apache.dubbo.config.annotation.Reference
```

详细参见：[注解配置](../../configuration/annotation)

## 模型 API

```
org.apache.dubbo.common.URL
org.apache.dubbo.rpc.RpcException
```

## 上下文 API

```
org.apache.dubbo.rpc.RpcContext
```

详细参见：[上下文信息](../../examples/context) & [隐式传参](../../examples/attachment) & [异步调用](../../examples/async-call)

## 服务 API

```
org.apache.dubbo.rpc.service.GenericService
org.apache.dubbo.rpc.service.GenericException
```

详细参见：[泛化引用](../../examples/generic-reference) & [泛化实现](../../examples/generic-service)

```
org.apache.dubbo.rpc.service.EchoService
```
详细参见：[回声测试](../../examples/echo-service)