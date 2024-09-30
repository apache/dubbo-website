---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/cache/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/cache/
description: Cache Extension
linkTitle: Cache Extension
title: Cache Extension
type: docs
weight: 24
---






## Extension Description

Use request parameters as keys to cache return results.

## Extension Interface

`org.apache.dubbo.cache.CacheFactory`

## Extension Configuration

```xml
<dubbo:service cache="lru" />
<!-- Method-level caching -->
<dubbo:service><dubbo:method cache="lru" /></dubbo:service> 
<!-- Default value setting, used when <dubbo:service> does not configure the cache property -->
<dubbo:provider cache="xxx,yyy" /> 
```

## Known Extensions

* `org.apache.dubbo.cache.support.lru.LruCacheFactory`
* `org.apache.dubbo.cache.support.threadlocal.ThreadLocalCacheFactory`
* `org.apache.dubbo.cache.support.jcache.JCacheFactory`


## Extension Examples

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCacheFactory.java (implements CacheFactory interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.cache.CacheFactory (plain text file, content: xxx=com.xxx.XxxCacheFactory)
```

XxxCacheFactory.java:

```java
package com.xxx;
 
import org.apache.dubbo.cache.CacheFactory;
 
public class XxxCacheFactory implements CacheFactory {
    public Cache getCache(URL url, String name) {
        return new XxxCache(url, name);
    }
}
```

XxxCache.java:

```java
package com.xxx;
 
import org.apache.dubbo.cache.Cache;
 
public class XxxCache implements Cache {
    public Cache(URL url, String name) {
        // ...
    }
    public void put(Object key, Object value) {
        // ...
    }
    public Object get(Object key) {
        // ...
    }
}
```

META-INF/dubbo/org.apache.dubbo.cache.CacheFactory:

```properties
xxx=com.xxx.XxxCacheFactory
```

