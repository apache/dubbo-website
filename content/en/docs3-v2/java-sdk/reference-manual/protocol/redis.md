---
type: docs
title: "Redis protocol"
linkTitle: "Redis Protocol"
weight: 9
---


## Feature description
RPC protocol implemented based on Redis. `2.3.0` and above are supported.

[Redis](http://redis.io) is an efficient KV storage server.

## scenes to be used

Caching, current limiting, distributed locks, etc.

## How to use

### Import dependencies

Starting from Dubbo 3, the Redis protocol is no longer embedded in Dubbo, and an independent [module](/zh-cn/download/spi-extensions/#dubbo-rpc) needs to be introduced separately.
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-redis</artifactId>
    <version>1.0.0</version>
</dependency>
```


### Register the address of the redis service
```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("redis://10.20.153.11/com.foo.BarService?category=providers&dynamic=false&application=foo&group=member&loadbalance=consistenthash"));
```

### Referenced on the client side
Does not need to be aware of Redis addresses

On the client side use:
```xml
<dubbo:reference id="store" interface="java.util.Map" group="member" />
```
Or point-to-point direct connection:
```xml
<dubbo:reference id="store" interface="java.util.Map" url="redis://10.20.153.10:6379" />
```
It is also possible to use a custom interface:
```xml
<dubbo:reference id="store" interface="com.foo.StoreService" url="redis://10.20.153.10:6379" />
```

Where "p:xxx" is the standard p tag of spring
```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="redis://10.20.153.10:6379" p:set="putFoo" p:get="getFoo" p:delete=" removeFoo" />
```
The method name is suggested to be the same as the standard method name of redis, namely: get(key), set(key, value), delete(key).

If the method name is different from the standard method name of redis, you need to configure the mapping relationship:
