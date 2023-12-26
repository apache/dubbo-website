---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/reference-config-cache/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/reference-config-cache/
description: 在 Dubbo 中缓存 ReferenceConfig
linkTitle: 服务引用配置对象缓存
title: 服务引用配置对象缓存
type: docs
weight: 2
---




   
## 功能说明

`ReferenceConfig` 实例很重，封装了与注册中心的连接以及与提供者的连接，需要缓存。否则重复生成 `ReferenceConfig` 可能造成性能问题并且会有内存和连接泄漏。在 API 方式编程时，容易忽略此问题。

因此，自 `2.4.0` 版本开始， dubbo 提供了简单的工具类 `ReferenceConfigCache`用于缓存 `ReferenceConfig` 实例。

## 使用场景

网关等存在动态创建订阅的场景，由于 ReferenceConfig 本身很重，会创建特别多的中间对象，而 proxy 本身是可以复用的，所以通过 ReferenceConfigCache 可以缓存这部分的属性。

## 使用方式

### 消除并销毁
消除 Cache 中的 `ReferenceConfig`，将销毁 `ReferenceConfig` 并释放对应的资源。
```java  
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>();  
reference.setInterface(XxxService.class);  
reference.setVersion("1.0.0");  
......  
ReferenceConfigCache cache = ReferenceConfigCache.getCache();  
// cache.get方法中会缓存 Reference对象，并且调用ReferenceConfig.get方法启动ReferenceConfig  
XxxService xxxService = cache.get(reference);  
// 注意！ Cache会持有ReferenceConfig，不要在外部再调用ReferenceConfig的destroy方法，导致Cache内的ReferenceConfig失效！  
// 使用xxxService对象  
xxxService.sayHello();  
```
```java  
ReferenceConfigCache cache = ReferenceConfigCache.getCache();  
cache.destroy(reference);  
```   
缺省 `ReferenceConfigCache` 把相同服务 Group、接口、版本的 `ReferenceConfig` 认为是相同，缓存一份。即以服务 Group、接口、版本为缓存的 Key。

### 修改策略
可以修改这个策略，在 `ReferenceConfigCache.getCache` 时，传一个 `KeyGenerator`。详见 `ReferenceConfigCache` 类的方法。
```java  
KeyGenerator keyGenerator = new ...  
ReferenceConfigCache cache = ReferenceConfigCache.getCache(keyGenerator);  
```