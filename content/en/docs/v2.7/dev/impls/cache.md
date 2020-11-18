---
type: docs
title: "Cache Extension"
linkTitle: "Cache"
weight: 24
---

## Summary

Cache the return value, use request parameter as the key.

## Extension Interface

`org.apache.dubbo.cache.CacheFactory`

## Extension Configuration

```xml
<dubbo:service cache="lru" />
<!-- method level cache -->
<dubbo:service><dubbo:method cache="lru" /></dubbo:service> 
<!-- 缺省值设置，当<dubbo:service>没有配置cache属性时，使用此配置 -->
<!-- default configuration, will take affect if cache attribute isn't configured in <dubbo:service> -->
<dubbo:provider cache="xxx,yyy" /> 
```

## Existing Extensions

* `org.apache.dubbo.cache.support.lru.LruCacheFactory`
* `org.apache.dubbo.cache.support.threadlocal.ThreadLocalCacheFactory`
* `org.apache.dubbo.cache.support.jcache.JCacheFactory`


## Extension Guide

Directory layout:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCacheFactory.java (CacheFactory implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.cache.CacheFactory (plain text file with contents: xxx=com.xxx.XxxCacheFactory)
```

XxxCacheFactory.java：

```java
package com.xxx;
 
import org.apache.dubbo.cache.CacheFactory;
 
public class XxxCacheFactory implements CacheFactory {
    public Cache getCache(URL url, String name) {
        return new XxxCache(url, name);
    }
}
```

XxxCache.java：

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

META-INF/dubbo/org.apache.dubbo.cache.CacheFactory：

```properties
xxx=com.xxx.XxxCacheFactory
```
