# redis://

RPC protocol based on memcached implementation.

## Register redis service address

```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("redis://10.20.153.11/com.foo.BarService?category=providers&dynamic=false&application=foo&group=member&loadbalance=consistenthash"));
```

## Use in client

get service reference:

```xml
<dubbo:reference id="store" interface="java.util.Map" group="member" />
```

or direct access by IP:


```xml
<dubbo:reference id="store" interface="java.util.Map" url="redis://10.20.153.10:6379" />
```

you can also use a custom interface：

```xml
<dubbo:reference id="store" interface="com.foo.StoreService" url="redis://10.20.153.10:6379" />
```

The method name is the same as the standard method name of memcached, just like get(key), set(key, value), delete(key)。

If the method name and the memcached standard method name are not the same, you need to configure the mapping

```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="memcached://10.20.153.10:11211" p:set="putFoo" p:get="getFoo" p:delete="removeFoo" />
```


