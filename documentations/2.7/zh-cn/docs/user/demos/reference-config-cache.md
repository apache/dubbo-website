# ReferenceConfig 缓存

`ReferenceConfig` 实例很重，封装了与注册中心的连接以及与提供者的连接，需要缓存。否则重复生成 `ReferenceConfig` 可能造成性能问题并且会有内存和连接泄漏。在 API 方式编程时，容易忽略此问题。

因此，自 `2.4.0` 版本开始， dubbo 提供了简单的工具类 `ReferenceConfigCache`用于缓存 `ReferenceConfig` 实例。

使用方式如下：

```java
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>();
reference.setInterface(XxxService.class);
reference.setVersion("1.0.0");
......
ReferenceConfigCache cache = ReferenceConfigCache.getCache();
// cache.get方法中会缓存 Reference对象，并且调用ReferenceConfig.get方法启动ReferenceConfig
XxxService xxxService = cache.get(reference);
// 注意！ Cache会持有ReferenceConfig，不要在外部再调用ReferenceConfig的destroy方法，导致Cache内的ReferenceConfig失效！
// 使用xxxService对象
xxxService.sayHello();
```

消除 Cache 中的 `ReferenceConfig`，将销毁 `ReferenceConfig` 并释放对应的资源。

```java
ReferenceConfigCache cache = ReferenceConfigCache.getCache();
cache.destroy(reference);
```

缺省 `ReferenceConfigCache` 把相同服务 Group、接口、版本的 `ReferenceConfig` 认为是相同，缓存一份。即以服务 Group、接口、版本为缓存的 Key。

可以修改这个策略，在 `ReferenceConfigCache.getCache` 时，传一个 `KeyGenerator`。详见 `ReferenceConfigCache` 类的方法。

```java
KeyGenerator keyGenerator = new ...
ReferenceConfigCache cache = ReferenceConfigCache.getCache(keyGenerator );
```

