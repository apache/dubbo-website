# Cache Result

Cache Result [^1] is used to speed up access to popular data. Dubbo provides declarative caching to reduce the user work of adding cache [^2]。

## Cache Type

* `lru` Delete excess cache Based on the principle of least recently used.  The hottest data is cached.
* `threadlocal` The current thread cache. For example, a page have a lot of portal and each portal need to check user information,  you can reduce this redundant visit with this cache.
* `jcache` integrate with [JSR107](http://jcp.org/en/jsr/detail?id=107%27) , you can bridge a variety of cache implementation。

Caching type can be extended，refer to：[Cache extension](http://dubbo.apache.org/books/dubbo-dev-book-en/impls/cache.html)

## Configuration

```xml
<dubbo:reference interface="com.foo.BarService" cache="lru" />
```

or：

```xml
<dubbo:reference interface="com.foo.BarService">
    <dubbo:method name="findBar" cache="lru" />
</dubbo:reference>
```

[^1]: Support since `2.1.0` 
[^2]: [Sample](https://github.com/apache/incubator-dubbo/tree/master/dubbo-test/dubbo-test-examples/src/main/java/com/alibaba/dubbo/examples/cache)