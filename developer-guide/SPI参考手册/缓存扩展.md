##### 1. 扩展说明

用请求参数作为key，缓存返回结果。

##### 2. 扩展接口

`com.alibaba.dubbo.cache.CacheFactory`

##### 3. 扩展配置

```xml
<dubbo:service cache="lru" />
<dubbo:service><dubbo:method cache="lru" /></dubbo:service> <!-- 方法级缓存 -->
<dubbo:provider cache="xxx,yyy" /> <!-- 缺省值设置，当<dubbo:service>没有配置cache属性时，使用此配置 -->
```

##### 4. 已知扩展

* `com.alibaba.dubbo.cache.support.lru.LruCacheFactory`
* `com.alibaba.dubbo.cache.support.threadlocal.ThreadLocalCacheFactory`
* `com.alibaba.dubbo.cache.support.jcache.JCacheFactory`


##### 5. 扩展示例

Maven项目结构

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

XxxCacheFactory.java

```java
package com.xxx;
 
import com.alibaba.dubbo.cache.CacheFactory;
 
public class XxxCacheFactory implements CacheFactory {
    public Cache getCache(URL url, String name) {
        return new XxxCache(url, name);
    }
}
```

XxxCacheFactory.java

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

META-INF/dubbo/com.alibaba.dubbo.cache.CacheFactory

```
xxx=com.xxx.XxxCacheFactory
```