---
type: docs
title: "结果缓存"
linkTitle: "结果缓存"
weight: 15
description: "通过缓存结果加速访问速度"
---

结果缓存，用于加速热门数据的访问速度，Dubbo 提供声明式缓存，以减少用户加缓存的工作量。

## 缓存类型

* `lru` 基于最近最少使用原则删除多余缓存，保持最热的数据被缓存。
* `threadlocal` 当前线程缓存，比如一个页面渲染，用到很多 portal，每个 portal 都要去查用户信息，通过线程缓存，可以减少这种多余访问。
* `jcache` 与 [JSR107](http://jcp.org/en/jsr/detail?id=107%27) 集成，可以桥接各种缓存实现。

缓存类型可扩展，参见：[缓存扩展](../../../dev/impls/cache)

## 配置

```xml
<dubbo:reference interface="com.foo.BarService" cache="lru" />
```

或：

```xml
<dubbo:reference interface="com.foo.BarService">
    <dubbo:method name="findBar" cache="lru" />
</dubbo:reference>
```

{{% alert title="提示" color="primary" %}}
`2.1.0` 以上版本支持。 

[示例代码](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-cache)
{{% /alert %}}

