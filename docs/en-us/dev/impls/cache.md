# Cache Extension

## Summary

Cache the return value, use request parameter as the key.

## Extension Interface

`com.alibaba.dubbo.cache.CacheFactory`

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

* `com.alibaba.dubbo.cache.support.lru.LruCacheFactory`
* `com.alibaba.dubbo.cache.support.threadlocal.ThreadLocalCacheFactory`
* `com.alibaba.dubbo.cache.support.jcache.JCacheFactory`


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
                |-com.alibaba.dubbo.cache.CacheFactory (plain text file with contents: xxx=com.xxx.XxxCacheFactory)
```

XxxCacheFactory.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.cache.CacheFactory;
 
public class XxxCacheFactory implements CacheFactory {
    public Cache getCache(URL url, String name) {
        return new XxxCache(url, name);
    }
}
```

XxxCacheFactory.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.cache.Cache;
 
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

META-INF/dubbo/com.alibaba.dubbo.cache.CacheFactory：

```properties
xxx=com.xxx.XxxCacheFactory
```