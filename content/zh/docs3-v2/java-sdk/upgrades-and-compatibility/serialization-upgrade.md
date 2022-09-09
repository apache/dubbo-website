---
type: docs
title: "序列化协议升级指南"
linkTitle: "序列化协议升级指南"
weight: 6
description: "无损升级序列化协议的最佳实践"
---

**无损升级序列化协议的最佳实践。**

在 3.10 版本中，Dubbo 默认支持的序列化协议新增对 Fastjson2 的支持。部分用户可能会考虑在现有的系统中对序列化协议进行升级，但服务端和客户端版本的差异可能导致客户端并不支持服务端的序列化协议。而在 3.11 版本中 Dubbo 的服务端引入新的配置`prefer-serialization`，该特性可以完美解决服务端序列化升级过程中可能带来的风险。


** 最佳实践 **
序列化协议升级，需要分两步走：

* **首先需要推动服务端的序列化协议升级，同时在服务端的暴露配置中需要添加`prefer-serialization`配置。比如：升级前的序列化协议是 hessian2，升级之后的序列化协议是 Fastjson2 那么在服务端的暴露配置中就应该添加如下所示的配置**

```yaml
dubbo.provider.prefer-serialization=hessian2
dubbo.provider.serialization=Fastjson2

```
* **其次，客户端需要升级至和服务端相同版本**



