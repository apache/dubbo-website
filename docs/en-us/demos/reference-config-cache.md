# ReferenceConfig Cache

The instance of `ReferenceConfig` is heavy. It encapsulates the connection to the registry and the connection to the provider, so it need to be cached. Otherwise, repeatedly generating `ReferenceConfig` may cause performance problems , memory and connection leaks. This problem is easy to ignored when programming in API mode.

Therefore, since `2.4.0`, dubbo provides a simple utility ReferenceConfigCache for caching instances of `ReferenceConfig`.


Use as follows：

```java
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>();
reference.setInterface(XxxService.class);
reference.setVersion("1.0.0");
......
ReferenceConfigCache cache = ReferenceConfigCache.getCache();
// cache.get will cache the instance of Reference ，and call ReferenceConfig.get method to start ReferenceConfig
XxxService xxxService = cache.get(reference);
// Note: Cache will hold ReferenceConfig, do not call destroy method of ReferenceConfig outside. If you do this, it will invalidate ReferenceConfig in Cache!
// Use xxxService instance
xxxService.sayHello();
```

Destroy `ReferenceConfig` in the Cache, it also remove `ReferenceConfig` and release the corresponding resources。

```java
ReferenceConfigCache cache = ReferenceConfigCache.getCache();
cache.destroy(reference);
```

By default ,`ReferenceConfigCache` caches one ` ReferenceConfig` for the same service Group, interface, version. The key of `ReferenceConfigCache` is from the group of service Group, interface, and the version. 

You can modify the strategy. Define an instance of KeyGenerator, pass it as parameter of getCache method. Refer to `ReferenceConfigCache` for information。

```java
KeyGenerator keyGenerator = new ...
ReferenceConfigCache cache = ReferenceConfigCache.getCache(keyGenerator );
```

