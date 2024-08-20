---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/local-mock/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/local-mock/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/service-downgrade/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/service-downgrade/
description: 了解如何在 Dubbo 中利用本地伪装实现服务降级
linkTitle: 服务降级
title: 服务讲解（本地伪装）
type: docs
weight: 10
---

## 特性说明

在 Dubbo3 中有一种机制可以实现轻量级的服务降级，也就是本地伪装。

Mock 是 Stub 的一个子集，便于服务提供方在客户端执行容错逻辑，因经常需要在出现 RpcException (比如网络失败，超时等)时进行容错，而在出现业务异常(比如登录用户名密码错误)时不需要容错，
如果用 Stub，可能就需要捕获并依赖 RpcException 类，而用 Mock 就可以不依赖 RpcException，因为它的约定就是只有出现 RpcException 时才执行。

## 使用场景

本地伪装常被用于服务降级。比如某验权服务，当服务提供方全部挂掉后，假如此时服务消费方发起了一次远程调用，那么本次调用将会失败并抛出一个 `RpcException` 异常。为了避免出现这种直接抛出异常的情况出现，那么客户端就可以利用本地伪装来提供 Mock 数据返回授权失败。

其他使用场景包括：
- 某服务或接口负荷超出最大承载能力范围，需要进行降级应急处理，避免系统崩溃
- 调用的某非关键服务或接口暂时不可用时，返回模拟数据或空，业务还能继续可用
- 降级非核心业务的服务或接口，腾出系统资源，尽量保证核心业务的正常运行
- 某上游基础服务超时或不可用时，执行能快速响应的降级预案，避免服务整体雪崩

## 使用方式

完整示例源码请参见 [dubbo-samples-mock](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-mock)

### 开启 Mock 配置

在 Spring XML 配置文件中按以下方式配置：

```xml
<dubbo:reference interface="com.foo.BarService" mock="true" />
```

或

```xml
<dubbo:reference interface="com.foo.BarService" mock="com.foo.BarServiceMock" />
```

在工程中提供 Mock 实现 [^2]：
在 interface 旁放一个 Mock 实现，它实现 BarService 接口，并有一个无参构造函数。同时，如果没有在配置文件中显式指定 Mock 类的时候，那么需要保证 Mock 类的全限定类名是 `原全限定类名+Mock` 的形式，例如 `com.foo.BarServiceMock`，否则将会 Mock 失败。
```java
package com.foo;
public class BarServiceMock implements BarService {
    public String sayHello(String name) {
        // 你可以伪造容错数据，此方法只在出现RpcException时被执行
        return "容错数据";
    }
}
```

### 使用 return 关键字 Mock 返回值 

使用 `return` 来返回一个字符串表示的对象，作为 Mock 的返回值。合法的字符串可以是：
- *empty*：代表空，返回基本类型的默认值、集合类的空值、自定义实体类的空对象，如果返回值是一个实体类，那么此时返回的将会是一个属性都为默认值的空对象而不是 `null`。
- *null*：返回 `null`
- *true*：返回 `true`
- *false*：返回 `false`
- *JSON 字符串*：返回反序列化 JSON 串后所得到的对象

举个例子，如果服务的消费方经常需要 try-catch 捕获异常，如：

```java
public class DemoService {

    public Offer findOffer(String offerId) {
        Offer offer = null;
        try {
            offer = offerService.findOffer(offerId);
        } catch (RpcException e) {
            logger.error(e);
        }

        return offer;
    }
}
```

那么请考虑改为 Mock 实现，并在 Mock 实现中 `return null`。如果只是想简单的忽略异常，在 `2.0.11` 以上版本可用：

```xml
<dubbo:reference interface="com.foo.BarService" mock="return null" />
```

### 使用 throw 关键字 Mock 抛出异常

使用 `throw` 来返回一个 Exception 对象，作为 Mock 的返回值。

当调用出错时，抛出一个默认的 RPCException:

```xml

<dubbo:reference interface="com.foo.BarService" mock="throw"/>
```

当调用出错时，抛出指定的 Exception：

自定义异常必须拥有一个入参为 `String` 的构造函数，该构造函数将用于接受异常信息。
```xml

<dubbo:reference interface="com.foo.BarService" mock="throw com.foo.MockException"/>
```

### 使用 force 和 fail 关键字来配置 Mock 的行为

`force:` 代表强制使用 Mock 行为，在这种情况下不会走远程调用。

`fail:` 与默认行为一致，只有当远程调用发生错误时才使用 Mock 行为。也就是说，配置的时候其实是可以不使用 `fail` 关键字的，直接使用 `throw` 或者 `return` 就可以了。 

`force:` 和 `fail:` 都支持与 `throw` 或者 `return` 组合使用。

强制返回指定值：

```xml

<dubbo:reference interface="com.foo.BarService" mock="force:return fake"/>
```

强制抛出指定异常：

```xml

<dubbo:reference interface="com.foo.BarService" mock="force:throw com.foo.MockException"/>
```

调用失败时返回指定值：
```xml

<dubbo:reference interface="com.foo.BarService" mock="fail:return fake"/>

<!-- 等价于以下写法 -->
<dubbo:reference interface="com.foo.BarService" mock="return fake"/>
```

调用失败时抛出异常

```xml

<dubbo:reference interface="com.foo.BarService" mock="fail:throw com.foo.MockException"/>

<!-- 等价于以下写法 -->
<dubbo:reference interface="com.foo.BarService" mock="throw com.foo.MockException"/>
```

### 在方法级别配置 Mock

Mock 可以在方法级别上指定，假定 `com.foo.BarService` 上有好几个方法，我们可以单独为 `sayHello()` 方法指定 Mock 行为。

具体配置如下所示，在本例中，只要 `sayHello()` 被调用到时，强制返回 "fake":

```xml

<dubbo:reference id="demoService" check="false" interface="com.foo.BarService">
    <dubbo:parameter key="sayHello.mock" value="force:return fake"/>
</dubbo:reference>
```

### 配合 dubbo-admin 使用

* 应用消费端引入 <a href="https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-mock-extensions" target="_blank">`dubbo-mock-admin`</a>依赖

* 应用消费端启动时设置 JVM 参数，`-Denable.dubbo.admin.mock=true`

* 启动 dubbo-admin，在服务 Mock-> 规则配置菜单下设置 Mock 规则

以服务方法的维度设置规则，设置返回模拟数据，动态启用/禁用规则


### 使用专业限流组件

如果您有更高级、专业的限流诉求，我们推荐使用专业的限流降级组件如 [Sentinel](https://sentinelguard.io/zh-cn/docs/open-source-framework-integrations.html)，以达到最佳体验。参考示例实践：[微服务治理/限流降级](/zh-cn/overview/mannual/java-sdk/tasks/rate-limit/)

服务降级是指服务在非正常情况下进行降级应急处理。


{{% alert title="注意事项" color="primary" %}}

Dubbo 启动时会检查配置，当 mock 属性值配置有误时会启动失败，可根据错误提示信息进行排查

- 配置格式错误，如 `return+null` 会报错，被当做 mock 类型处理，`return` 后面可省略不写或者跟空格后再跟返回值
- 类型找不到错误，如自定义 mock 类、throw 自定义异常，请检查类型是否存在或是否有拼写错误
{{% /alert %}}

