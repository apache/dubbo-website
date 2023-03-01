---
aliases:
    - /zh/docs/references/protocols/redis/
description: redis:// 协议参考手册
linkTitle: redis://
title: redis 协议
type: docs
weight: 4
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/redis/)。
{{% /pageinfo %}}


基于 Redis [^1] 实现的 RPC 协议。

{{% alert title="提示" color="primary" %}}
`2.3.0` 以上版本支持
{{% /alert %}}

## 注册 redis 服务的地址

```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("redis://10.20.153.11/com.foo.BarService?category=providers&dynamic=false&application=foo&group=member&loadbalance=consistenthash"));
```

## 在客户端引用

在客户端使用 [^2]：

```xml
<dubbo:reference id="store" interface="java.util.Map" group="member" />
```

或者，点对点直连：

```xml
<dubbo:reference id="store" interface="java.util.Map" url="redis://10.20.153.10:6379" />
```

也可以使用自定义接口：

```xml
<dubbo:reference id="store" interface="com.foo.StoreService" url="redis://10.20.153.10:6379" />
```

方法名建议和 redis 的标准方法名相同，即：get(key), set(key, value), delete(key)。

如果方法名和 redis 的标准方法名不相同，则需要配置映射关系 [^3]：

```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="redis://10.20.153.10:6379" p:set="putFoo" p:get="getFoo" p:delete="removeFoo" />
```

[^1]: [Redis](http://redis.io) 是一个高效的 KV 存储服务器
[^2]: 不需要感知 Redis 的地址
[^3]: 其中 "p:xxx" 为 spring 的标准 p 标签
