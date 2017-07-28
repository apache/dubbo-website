> ![warning](../sources/images/warning-3.gif)2.3.0以上版本支持。

> ![check](../sources/images/check.gif)[Memcached](http://memcached.org/) 是一个高效的KV缓存服务器。

可以通过脚本或监控中心手工填写表单注册memcached服务的地址：

```java
RegistryFactory registryFactory = ExtensionLoader.getExtensionLoader(RegistryFactory.class).getAdaptiveExtension();
Registry registry = registryFactory.getRegistry(URL.valueOf("zookeeper://10.20.153.10:2181"));
registry.register(URL.valueOf("memcached://10.20.153.11/com.foo.BarService?category=providers&dynamic=false&application=foo&group=member&loadbalance=consistenthash"));
```

然后在客户端使用时，不需要感知Memcached的地址：

```xml
<dubbo:reference id="cache" interface="http://10.20.160.198/wiki/display/dubbo/java.util.Map" group="member" />
```

或者，点对点直连：

```xml
<dubbo:reference id="cache" interface="http://10.20.160.198/wiki/display/dubbo/java.util.Map" url="memcached://10.20.153.10:11211" />
```

也可以使用自定义接口：

```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="memcached://10.20.153.10:11211" />
```

方法名建议和memcached的标准方法名相同，即：get(key), set(key, value), delete(key)。

如果方法名和memcached的标准方法名不相同，则需要配置映射关系：(其中"p:xxx"为spring的标准p标签)

```xml
<dubbo:reference id="cache" interface="com.foo.CacheService" url="memcached://10.20.153.10:11211" p:set="putFoo" p:get="getFoo" p:delete="removeFoo" />
```
