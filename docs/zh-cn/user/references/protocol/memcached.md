# memcached://

基于 memcached [^1] 实现的 RPC 协议 [^2]。

## 注册 memcached 服务的地址

```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("memcached://10.20.153.11/com.foo.BarService?category=providers&dynamic=false&application=foo&group=member&loadbalance=consistenthash"));
```

## 在客户端引用

在客户端使用 [^3]：

```xml
<dubbo:reference id="cache" interface="java.util.Map" group="member" />
```

或者，点对点直连：

```xml
<dubbo:reference id="cache" interface="java.util.Map" url="memcached://10.20.153.10:11211" />
```

也可以使用自定义接口：

```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="memcached://10.20.153.10:11211" />
```

方法名建议和 memcached 的标准方法名相同，即：get(key), set(key, value), delete(key)。

如果方法名和 memcached 的标准方法名不相同，则需要配置映射关系 [^4]：

```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="memcached://10.20.153.10:11211" p:set="putFoo" p:get="getFoo" p:delete="removeFoo" />
```

[^1]: [Memcached](http://memcached.org/) 是一个高效的 KV 缓存服务器
[^2]: `2.3.0` 以上版本支持
[^3]: 不需要感知 Memcached 的地址
[^4]: 其中 "p:xxx" 为 spring 的标准 p 标签