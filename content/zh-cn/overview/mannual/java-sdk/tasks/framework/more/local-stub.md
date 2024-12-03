---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/local-stub/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/local-stub/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/local-stub/
description: 了解 Dubbo 中本地存根在客户端执行部分逻辑的使用
linkTitle: 本地存根
title: 本地存根
type: docs
weight: 11
---

## 特性说明：

远程服务后，客户端通常只剩下接口，而实现全在服务器端，但提供方有些时候想在客户端也执行部分逻辑。

![/user-guide/images/stub.jpg](/imgs/user/stub.jpg)

## 使用场景
做 ThreadLocal 缓存，提前验证参数，调用失败后伪造容错数据等等，此时就需要在 API 中带上 Stub，客户端生成 Proxy 实例，会把 Proxy 通过构造函数传给 Stub [^1]，然后把 Stub 暴露给用户，Stub 可以决定要不要去调 Proxy。

## 使用方式

完整示例源码请参见 [dubbo-samples-stub](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-stub)

### spring 配置文件配置

```xml
<dubbo:consumer interface="com.foo.BarService" stub="true" />
```

或

```xml
<dubbo:consumer interface="com.foo.BarService" stub="com.foo.BarServiceStub" />
```

### 提供 Stub 的实现 [^2]

```java
package com.foo;
public class BarServiceStub implements BarService {
    private final BarSer    vice barService;
    
    // 构造函数传入真正的远程代理对象
    public BarServiceStub(BarService barService){
        this.barService = barService;
    }
 
    public String sayHello(String name) {
        // 此代码在客户端执行, 你可以在客户端做ThreadLocal本地缓存，或预先验证参数是否合法，等等
        try {
            return barService.sayHello(name);
        } catch (Exception e) {
            // 你可以容错，可以做任何AOP拦截事项
            return "容错数据";
        }
    }
}
```

[^1]: Stub 必须有可传入 Proxy 的构造函数。
[^2]: 在 interface 旁边放一个 Stub 实现，它实现 BarService 接口，并有一个传入远程 BarService 实例的构造函数。
