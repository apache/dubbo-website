---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/consistent-hash/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/consistent-hash/
description: 在负载均衡阶段基于一致性哈希进行选址
linkTitle: 一致性哈希选址
title: 一致性哈希选址
type: docs
weight: 6
---





## 特性说明
在分布式系统中跨多个节点均匀分布请求的方法，使用哈希算法创建请求的哈希并根据哈希值确定哪个节点应该处理请求，算法确保每个节点处理的请求数量大致相等。如果一个节点发生故障，其他节点可以快速接管请求，保持系统高可用性，即使一个节点出现故障，系统的数据映射到系统中有限数量节点的哈希算法，在系统中添加或删除节点时，只需更改有限数量的映射，确保数据均匀分布在系统中的所有节点上提高系统的性能。

[Dubbo 一致性Hash负载均衡实现剖析](/zh-cn/blog/2019/05/01/dubbo-%E4%B8%80%E8%87%B4%E6%80%A7hash%E8%B4%9F%E8%BD%BD%E5%9D%87%E8%A1%A1%E5%AE%9E%E7%8E%B0%E5%89%96%E6%9E%90/)

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