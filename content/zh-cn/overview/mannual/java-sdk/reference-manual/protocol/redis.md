---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/redis/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/redis/
description: Redis协议
linkTitle: Redis协议
title: Redis协议
type: docs
weight: 9
---







## 特性说明
[Redis](http://redis.io) 是一个高效的 KV 存储服务器。基于 Redis 实现的 RPC 协议。 

> `2.3.0` 以上版本支持。


## 使用场景

缓存，限流，分布式锁等

## 使用方式

### 引入依赖

从 Dubbo 3 开始，Redis 协议已经不再内嵌在 Dubbo 中，需要单独引入独立的[模块](/zh-cn/download/spi-extensions/#dubbo-rpc)。
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-redis</artifactId>
    <version>1.0.0</version>
</dependency>
```


### 注册 redis 服务的地址
```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("redis://10.20.153.11/com.foo.BarService?category=providers&dynamic=false&application=foo&group=member&loadbalance=consistenthash"));
```

### 在客户端引用
不需要感知 Redis 的地址

在客户端使用：
```xml
<dubbo:reference id="store" interface="java.util.Map" group="member" />
```
或者点对点直连：
```xml
<dubbo:reference id="store" interface="java.util.Map" url="redis://10.20.153.10:6379" />
```
也可以使用自定义接口：
```xml
<dubbo:reference id="store" interface="com.foo.StoreService" url="redis://10.20.153.10:6379" />
```

其中 "p:xxx" 为 spring 的标准 p 标签
```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="redis://10.20.153.10:6379" p:set="putFoo" p:get="getFoo" p:delete="removeFoo" />
```
方法名建议和 redis 的标准方法名相同，即：get(key), set(key, value), delete(key)。

如果方法名和 redis 的标准方法名不相同，则需要配置映射关系。
