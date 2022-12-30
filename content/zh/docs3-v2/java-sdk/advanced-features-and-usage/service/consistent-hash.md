---
type: docs
title: "一致性哈希选址"
linkTitle: "一致性哈希选址"
weight: 6
description: "在负载均衡阶段基于一致性哈希进行选址"
---
## 特性说明

[Dubbo 一致性Hash负载均衡实现剖析](/zh/blog/2019/05/01/dubbo-%E4%B8%80%E8%87%B4%E6%80%A7hash%E8%B4%9F%E8%BD%BD%E5%9D%87%E8%A1%A1%E5%AE%9E%E7%8E%B0%E5%89%96%E6%9E%90/)

## 使用场景

在有多台服务端的时候根据请求参数的进行一致性哈希散列选择服务端。

## 使用方式

配置一致性哈希的方式有很多，最常见的是：

### 注解配置

> @DubboReference(loadbalance = “consistenthash”)

### API 配置

> referenceConfig.setLoadBalance("consistenthash");

### Properties 配置

> dubbo.reference.loadbalance=consistenthash

### XML 配置

> <dubbo:reference loadbalance=“consistenthash” />

默认采用第一个参数作为哈希 key，如果需要切换参数，可以指定 `hash.arguments` 属性

```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<DemoService>();
// ... init
Map<String, String> parameters = new HashMap<String, String>();
parameters.put("hash.arguments", "1");
parameters.put("sayHello.hash.arguments", "0,1");
referenceConfig.setParameters(parameters);
referenceConfig.setLoadBalance("consistenthash");
referenceConfig.get();
```
