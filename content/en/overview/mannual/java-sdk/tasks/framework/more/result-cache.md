---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/result-cache/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/result-cache/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/performance/result-cache/
description: Accelerate access speed through result caching
linkTitle: Result Cache Invocation
title: Result Cache Invocation
type: docs
weight: 50
---

## Function Description

Dubbo supports server-side and client-side result caching.

#### Cache Types

Currently, versions 3.0 and above of Dubbo support the following built-in caching strategies:

* `lru` removes excess cache based on the least recently used principle, keeping the hottest data cached.
* `lfu` implements cache strategy based on the principle of evicting the least frequently used.
* `expiring` implements cache strategy based on expiration time.
* `threadlocal` caches in the current thread, for example in a page render when many portals are needed to query user information, using thread cache can reduce such unnecessary accesses.
* `jcache` integrates with [JSR107](http://jcp.org/en/jsr/detail?id=107%27), bridging various cache implementations.

Cache types are extensible [Cache Extension](/en/overview/mannual/java-sdk/reference-manual/spi/description/cache)

About [Example Code](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-cache)

## Usage Scenarios

Result caching is used to accelerate access speed to hot data. Dubbo provides declarative caching to reduce users' workload in adding caching.

## Usage

### Client-Side Caching

In Dubbo, RPC call result caching supports configuration control at both the interface and method granularity.

**Interface Granularity**

XML Configuration:

```xml
<dubbo:reference interface="com.foo.DemoService" cache="lru" />
```

Annotation Configuration:

```java
@DubboReference(cache = "lru")
private DemoService demoService;
```

**Method Granularity**

```xml
<dubbo:reference interface="com.foo.DemoService">
    <dubbo:method name="sayHello" cache="lru" />
</dubbo:reference>
```

Annotation Configuration:

```java
@DubboReference(methods = {@Method(name="sayHello",cache = "lru")})
private DemoService demoService;
```

### Server-Side Caching

**Interface Granularity**

XML Configuration:

```xml
<bean id="demoService" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>
<dubbo:service interface="com.foo.DemoService" ref="demoService" cache="lru" />
```

Annotation Configuration:

```java
@DubboService(cache = "lru")
public class DemoServiceImpl implements DemoService {

    private static final Logger logger = LoggerFactory.getLogger(DemoServiceImpl.class);
    @Override
    public String sayHello(String name) {
        logger.info("Hello " + name + ", request from consumer: " + RpcContext.getContext().getRemoteAddress());
        return "Hello " + name;

    }

}
```

**Method Granularity**

```xml
<bean id="demoService" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>
<dubbo:service interface="com.foo.DemoService" ref="demoService" cache="lru" />
    <dubbo:method name="sayHello" cache="lru" />
</dubbo:service>
```

Annotation Configuration:

```java
@DubboService(methods = {@Method(name="sayHello",cache = "lru")})
public class DemoServiceImpl implements DemoService {

    private static final Logger logger = LoggerFactory.getLogger(DemoServiceImpl.class);
    @Override
    public String sayHello(String name) {
        logger.info("Hello " + name + ", request from consumer: " + RpcContext.getContext().getRemoteAddress());
        return "Hello " + name;

    }

}
```

