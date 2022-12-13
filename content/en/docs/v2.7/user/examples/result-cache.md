---
type: docs
title: "Cache Result"
linkTitle: "Cache Result"
weight: 15
description: "Cache result in dubbo"
---

Cache result is used to speed up access to popular data. Dubbo provides declarative caching to reduce the user work of adding cache [^1].

## Cache Type

* `lru` Delete excess cache Based on the principle of least recently used.  The hottest data is cached.
* `threadlocal` The current thread cache. For example, a page have a lot of portal and each portal need to check user information,  you can reduce this redundant visit with this cache.
* `jcache` integrate with [JSR107](http://jcp.org/en/jsr/detail?id=107%27) , you can bridge a variety of cache implementation.

Caching type can be extended，refer to：[Cache extension](/en/docs/v2.7/dev/impls/cache)

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

{{% alert title="Notice" color="primary" %}}
supported in `2.1.0` or above.
{{% /alert %}}

[^1]: [examples](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-cache)
