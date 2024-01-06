---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/result-cache/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/result-cache/
description: 通过缓存结果加速访问速度
linkTitle: 调用结果缓存
title: 调用结果缓存
type: docs
weight: 7
---






## 功能说明

Dubbo支持了服务端结果缓存和客户端结果缓存。

#### 缓存类型

目前Dubbo3.0版本及高于其的版本都支持以下几种内置的缓存策略：

* `lru` 基于最近最少使用原则删除多余缓存，保持最热的数据被缓存。
* `lfu`基于淘汰使用频次最低的原则来实现缓存策略。
* `expiring`基于过期时间原则来实现缓存策略。
* `threadlocal` 当前线程缓存，比如一个页面渲染，用到很多 portal，每个 portal 都要去查用户信息，通过线程缓存，可以减少这种多余访问。
* `jcache` 与 [JSR107](http://jcp.org/en/jsr/detail?id=107%27) 集成，可以桥接各种缓存实现。

缓存类型可扩展 [缓存扩展](../../../reference-manual/spi/description/cache)

关于 [示例代码](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-cache)

## 使用场景

结果缓存，用于加速热门数据的访问速度，Dubbo 提供声明式缓存，以减少用户加缓存的工作量。

## 使用方式
### 客户端缓存

Dubbo中对RPC调用结果缓存支持接口粒度和方法粒度的配置控制。

**接口粒度**

xml配置方式：

```xml
<dubbo:reference interface="com.foo.DemoService" cache="lru" />
```

注解配置方式：

```java
@DubboReference(cache = "lru")
private DemoService demoService;
```

**方法粒度**

```xml
<dubbo:reference interface="com.foo.DemoService">
    <dubbo:method name="sayHello" cache="lru" />
</dubbo:reference>
```

注解配置方式：

```java
@DubboReference(methods = {@Method(name="sayHello",cache = "lru")})
private DemoService demoService;
```

### 服务端缓存

**接口粒度**

xml配置方式：

```xml
<bean id="demoService" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>
<dubbo:service interface="com.foo.DemoService" ref="demoService" cache="lru" />
```

注解配置方式：

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

**方法粒度**

```xml
<bean id="demoService" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>
<dubbo:service interface="com.foo.DemoService" ref="demoService" cache="lru" />
    <dubbo:method name="sayHello" cache="lru" />
</dubbo:service>
```

注解配置方式：

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
