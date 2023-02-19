---
type: docs
title: "Memcached protocol"
linkTitle: "Memcached protocol"
weight: 12
---
## Feature description
RPC protocol implemented based on memcached. `2.3.0` and above are supported.

[Memcached](http://memcached.org/) is an efficient KV cache server.

## scenes to be used
Relieve database pressure, improve interaction speed, etc.

## How to use
### Import dependencies

Starting from Dubbo 3, the Memcached protocol is no longer embedded in Dubbo, and an independent [module](/zh-cn/download/spi-extensions/#dubbo-rpc) needs to be introduced separately.
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-memcached</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Register the address of memcached service
```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("memcached://10.20.153.11/com.foo.BarService?category=providers&dynamic=false&application=foo&group=member&loadbalance=consistenthash"));
```

### Referenced on the client side
**Do not need to be aware of the address of Memcached**

use on client side

```xml
<dubbo:reference id="cache" interface="java.util.Map" group="member" />
```

Or point-to-point direct connection

```xml
<dubbo:reference id="cache" interface="java.util.Map" url="memcached://10.20.153.10:11211" />
```

You can also use a custom interface
```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="memcached://10.20.153.10:11211" />
```

Where "p:xxx" is the standard p tag of spring
```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="memcached://10.20.153.10:11211" p:set="putFoo" p:get="getFoo" p:delete=" removeFoo" />
```
If the method name is different from the standard method name of memcached, you need to configure the mapping relationship;

The method name is recommended to be the same as the standard method name of memcached, namely: get(key), set(key, value), delete(key).
