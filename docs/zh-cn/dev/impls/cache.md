# 缓存扩展

## 扩展说明

用请求参数作为 key，缓存返回结果。

## 扩展接口

`com.alibaba.dubbo.cache.CacheFactory`

## 扩展配置

```xml
<dubbo:service cache="lru" />
<!-- 方法级缓存 -->
<dubbo:service><dubbo:method cache="lru" /></dubbo:service> 
<!-- 缺省值设置，当<dubbo:service>没有配置cache属性时，使用此配置 -->
<dubbo:provider cache="xxx,yyy" /> 
```

## 已知扩展

* `com.alibaba.dubbo.cache.support.lru.LruCacheFactory`
* `com.alibaba.dubbo.cache.support.threadlocal.ThreadLocalCacheFactory`
* `com.alibaba.dubbo.cache.support.jcache.JCacheFactory`


## 扩展示例

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCacheFactory.java (实现StatusChecker接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.cache.CacheFactory (纯文本文件，内容为：xxx=com.xxx.XxxCacheFactory)
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