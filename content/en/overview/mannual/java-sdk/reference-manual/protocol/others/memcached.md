---
aliases:
    - /en/overview/mannual/java-sdk/reference-manual/protocol/memcached/
description: Memcached Protocol
linkTitle: Memcached Protocol
title: Memcached Protocol
type: docs
weight: 5
---



RPC protocol based on memcached [^1].

{{% alert title="Tip" color="primary" %}}
Support for version `2.3.0` and above
{{% /alert %}}

## Registering the memcached service address

```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("memcached://10.20.153.11/com.foo.BarService?category=providers&dynamic=false&application=foo&group=member&loadbalance=consistenthash"));
```

## Referencing on the client side

Use on the client side [^2]:

```xml
<dubbo:reference id="cache" interface="java.util.Map" group="member" />
```

Or, connect directly point-to-point:

```xml
<dubbo:reference id="cache" interface="java.util.Map" url="memcached://10.20.153.10:11211" />
```

Custom interfaces can also be used:

```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="memcached://10.20.153.10:11211" />
```

It is recommended that method names match the standard method names of memcached, namely: get(key), set(key, value), delete(key).

If the method names do not match the standard method names of memcached, a mapping relationship needs to be configured [^3]:

```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="memcached://10.20.153.10:11211" p:set="putFoo" p:get="getFoo" p:delete="removeFoo" />
```

[^1]: [Memcached](http://memcached.org/) is an efficient KV cache server
[^2]: No need to be aware of the address of Memcached
[^3]: Where "p:xxx" is the standard p tag of spring

