---
type: docs
title: "Call Result Cache"
linkTitle: "Call result cache"
weight: 7
description: "Speed up access by caching results"
---
## Feature description

#### cache type

* `lru` deletes redundant caches based on the least recently used principle, keeping the hottest data cached.
* `threadlocal` The current thread cache, such as a page rendering, uses many portals, and each portal needs to check user information. Through thread caching, this redundant access can be reduced.
* `jcache` integrates with [JSR107](http://jcp.org/en/jsr/detail?id=107%27) to bridge various cache implementations.

Cache Type Extensible [Cache Extensions](../../../reference-manual/spi/description/cache)

About [sample code](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-cache)

## scenes to be used

The result cache is used to speed up access to popular data. Dubbo provides a declarative cache to reduce the workload of users adding cache.

## How to use

```xml
<dubbo:reference interface="com.foo.BarService" cache="lru" />
```

or:

```xml
<dubbo:reference interface="com.foo.BarService">
    <dubbo:method name="findBar" cache="lru" />
</dubbo:reference>
```