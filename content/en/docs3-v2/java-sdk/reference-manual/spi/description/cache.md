---
type: docs
title: "Cache Extension"
linkTitle: "Cache Extension"
weight: 24
---

## Expansion Description

Use the request parameter as the key to cache the returned result.

## Extension ports

`org.apache.dubbo.cache.CacheFactory`

## Extended configuration

```xml
<dubbo:service cache="lru" />
<!-- method level cache -->
<dubbo:service><dubbo:method cache="lru" /></dubbo:service>
<!-- The default value setting, when <dubbo:service> does not configure the cache attribute, use this configuration -->
<dubbo:provider cache="xxx,yyy" />
```

## Known extensions

* `org.apache.dubbo.cache.support.lru.LruCacheFactory`
* `org.apache.dubbo.cache.support.threadlocal.ThreadLocalCacheFactory`
* `org.apache.dubbo.cache.support.jcache.JCacheFactory`


## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCacheFactory.java (implements the CacheFactory interface)
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
        //...
    }
    public void put(Object key, Object value) {
        //...
    }
    public Object get(Object key) {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.cache.CacheFactory:

```properties
xxx=com.xxx.XxxCacheFactory
```