ReferenceConfig实例很重，封装了与注册中心的连接以及与提供者的连接，需要缓存，否则重复生成ReferenceConfig可能造成性能问题并且会有内存和连接泄漏。API方式编程时，容易忽略此问题。

Dubbo 2.4.0+版本，提供了简单的工具类ReferenceConfigCache用于缓存ReferenceConfig实例。

使用方式如下：

```java
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>();
reference.setInterface(XxxService.class);
reference.setVersion("1.0.0");
......
 
ReferenceConfigCache cache = ReferenceConfigCache.getCache();
XxxService xxxService = cache.get(reference); // cache.get方法中会Cache Reference对象，并且调用ReferenceConfig.get方法启动ReferenceConfig
// 注意！ Cache会持有ReferenceConfig，不要在外部再调用ReferenceConfig的destroy方法，导致Cache内的ReferenceConfig失效！
 
// 使用xxxService对象
xxxService.sayHello();
```

消除Cache中的ReferenceConfig，销毁ReferenceConfig并释放对应的资源。

```java
ReferenceConfigCache cache = ReferenceConfigCache.getCache();
cache.destroy(reference);
```

缺省ReferenceConfigCache把相同服务Group、接口、版本的ReferenceConfig认为是相同，缓存一份。即以服务Group、接口、版本为缓存的Key。

可以修改这个策略，在ReferenceConfigCache.getCache时，传一个KeyGenerator。详见ReferenceConfigCache类的方法。

```java
KeyGenerator keyGenerator = new ...
 
ReferenceConfigCache cache = ReferenceConfigCache.getCache(keyGenerator );
```

