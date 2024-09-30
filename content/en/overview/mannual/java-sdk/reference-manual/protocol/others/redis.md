---
aliases:
    - /en/overview/mannual/java-sdk/reference-manual/protocol/redis/
description: Redis Protocol
linkTitle: Redis Protocol
title: Redis Protocol
type: docs
weight: 4
---




RPC protocol implemented based on Redis [^1].

{{% alert title="Tip" color="primary" %}}
Supports versions above `2.3.0`
{{% /alert %}}

## Register Redis Service Address

```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("redis://10.20.153.11/com.foo.BarService?category=providers&dynamic=false&application=foo&group=member&loadbalance=consistenthash"));
```

## Referencing on the Client Side

Use on the client side [^2]:

```xml
<dubbo:reference id="store" interface="java.util.Map" group="member" />
```

Alternatively, point-to-point direct connection:

```xml
<dubbo:reference id="store" interface="java.util.Map" url="redis://10.20.153.10:6379" />
```

You can also use a custom interface:

```xml
<dubbo:reference id="store" interface="com.foo.StoreService" url="redis://10.20.153.10:6379" />
```

It is recommended that the method names match the standard Redis method names, namely: get(key), set(key, value), delete(key).

If the method names differ from the standard Redis method names, you will need to configure the mapping [^3]:

```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="redis://10.20.153.10:6379" p:set="putFoo" p:get="getFoo" p:delete="removeFoo" />
```

[^1]: [Redis](http://redis.io) is an efficient KV storage server
[^2]: No need to be aware of the Redis address
[^3]: Where "p:xxx" is the standard p tag in Spring

