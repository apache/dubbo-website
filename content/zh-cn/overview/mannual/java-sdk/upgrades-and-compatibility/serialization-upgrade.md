---
aliases:
    - /zh/docs3-v2/java-sdk/upgrades-and-compatibility/serialization-upgrade/
    - /zh-cn/docs3-v2/java-sdk/upgrades-and-compatibility/serialization-upgrade/
description: 无损升级序列化协议指南
linkTitle: 序列化协议升级
title: 序列化协议升级
type: docs
weight: 5
---





在 `3.1.0` 版本中，Dubbo 默认支持的序列化协议新增对 Fastjson2 的支持。部分用户可能会考虑在现有的系统中对序列化协议进行升级，但服务端和客户端版本的差异可能导致客户端并不支持服务端的序列化协议。

在 `3.2.0` 版本中, Dubbo 的服务端引入新的配置 `prefer-serialization`，该特性可以完美解决服务端序列化升级过程中可能带来的风险。


### 最佳实践

序列化协议升级，需要分两步走：

* **首先需要推动服务端的序列化协议升级，同时在服务端的暴露配置中需要添加 `prefer-serialization` 配置。**
> 比如：升级前的序列化协议是 hessian2，升级之后的序列化协议是 Fastjson2 那么在服务端的暴露配置中就应该添加如下所示的配置。

```yaml
dubbo.provider.prefer-serialization=fastjson2,hessian2
dubbo.provider.serialization=hessian2
```
* **其次，客户端需要升级至和服务端相同版本**

### 实现原理

dubbo 客户端序列化协议是根据服务端的注册配置来选择的（即服务端的`serialization`配置）。在请求阶段 dubbo 会把客户端的序列化协议组装到请求头上，服务端在进行反序列化时会根据请求头来确定反序列化协议。所以，如果服务端和客户端的版本不一致就可能会出现客户端序列化不了的情况。

为了解决这个情况，`3.2.0` 在客户端序列化的时候会优先使用 `prefer-serialization` 配置的协议，如果不支持 `prefer-serialization` 相关的协议，才会使用 `serialization` 配置的协议。（可以把 `serialization` 理解为一个兜底的配置）
