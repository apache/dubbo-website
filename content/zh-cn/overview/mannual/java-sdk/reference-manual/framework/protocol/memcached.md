---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/memcached/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/memcached/
description: Memcached协议
linkTitle: Memcached协议
title: Memcached协议
type: docs
weight: 12
---





## 特性说明
[Memcached](http://memcached.org/) 是一个高效的 KV 缓存服务器。基于 memcached 实现的 RPC 协议。 

> `2.3.0` 以上版本支持。



## 使用场景
缓解数据库压力，提高交互速度等。

## 使用方式
### 引入依赖

从 Dubbo 3 开始，Memcached 协议已经不再内嵌在 Dubbo 中，需要单独引入独立的[模块](/zh-cn/download/spi-extensions/#dubbo-rpc)。
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-memcached</artifactId>
    <version>1.0.0</version>
</dependency>
```

### 注册 memcached 服务的地址
```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("memcached://10.20.153.11/com.foo.BarService?category=providers&dynamic=false&application=foo&group=member&loadbalance=consistenthash"));
```

### 在客户端引用
**不需要感知 Memcached 的地址**

在客户端使用

```xml
<dubbo:reference id="cache" interface="java.util.Map" group="member" />
```

或者点对点直连

```xml
<dubbo:reference id="cache" interface="java.util.Map" url="memcached://10.20.153.10:11211" />
```

也可以使用自定义接口
```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="memcached://10.20.153.10:11211" />
```

其中 "p:xxx" 为 spring 的标准 p 标签
```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="memcached://10.20.153.10:11211" p:set="putFoo" p:get="getFoo" p:delete="removeFoo" />
```
如果方法名和 memcached 的标准方法名不相同，则需要配置映射关系;

方法名建议和 memcached 的标准方法名相同，即：get(key), set(key, value), delete(key)。
