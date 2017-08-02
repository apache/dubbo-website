> ![warning](../sources/images/check.gif)结果缓存，用于加速热门数据的访问速度，Dubbo提供声明式缓存，以减少用户加缓存的工作量。

> ![warning](../sources/images/warning-3.gif)2.1.0以上版本支持

示例代码：https://github.com/alibaba/dubbo/tree/master/dubbo-test/dubbo-test-examples/src/main/java/com/alibaba/dubbo/examples/cache

* `lru` 基于最近最少使用原则删除多余缓存，保持最热的数据被缓存。
* `threadlocal` 当前线程缓存，比如一个页面渲染，用到很多portal，每个portal都要去查用户信息，通过线程缓存，可以减少这种多余访问。
* `jcache` 与 [JSR107](http://jcp.org/en/jsr/detail?id=107%27) 集成，可以桥接各种缓存实现。

缓存类型可扩展，参见：[CacheFactory扩展点](http://dubbo.io/developer-guide/SPI%E5%8F%82%E8%80%83%E6%89%8B%E5%86%8C/%E7%BC%93%E5%AD%98%E6%89%A9%E5%B1%95.html)

配置如：

```xml
<dubbo:reference interface="com.foo.BarService" cache="lru" />
```

或：

```xml
<dubbo:reference interface="com.foo.BarService">
    <dubbo:method name="findBar" cache="lru" />
</dubbo:reference>
```