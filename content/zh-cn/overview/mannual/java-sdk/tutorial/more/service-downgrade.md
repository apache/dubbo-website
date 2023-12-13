---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/service-downgrade/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/service-downgrade/
description: 降级 Dubbo 服务
linkTitle: 服务降级
title: 服务降级
type: docs
weight: 3
---






## 特性说明
推荐使用相关限流降级组件（如 [Sentinel](https://sentinelguard.io/zh-cn/docs/open-source-framework-integrations.html)）以达到最佳体验。参考示例实践：[微服务治理/限流降级](/zh-cn/overview/tasks/ecosystem/rate-limit/)

服务降级是指服务在非正常情况下进行降级应急处理。

## 使用场景

- 某服务或接口负荷超出最大承载能力范围，需要进行降级应急处理，避免系统崩溃
- 调用的某非关键服务或接口暂时不可用时，返回模拟数据或空，业务还能继续可用
- 降级非核心业务的服务或接口，腾出系统资源，尽量保证核心业务的正常运行
- 某上游基础服务超时或不可用时，执行能快速响应的降级预案，避免服务整体雪崩

## 使用方式

以 xml 配置为例：（通过注解方式配置类似）

### 1.配置一
`mock="true"`

例：
```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="true" />
```
这种方式需要在相同包下有类名 + `Mock`后缀的实现类，即`com.xxx.service`包下有`DemoServiceMock`类。

### 2.配置二 
`mock="com.xxx.service.DemoServiceMock"`

例：
```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="com.xxx.service.DemoServiceMock" />
```
这种方式指定 Mock 类的全路径。

### 3.配置三 
`mock="[fail|force]return|throw xxx"`

* fail 或 force 关键字可选，表示调用失败或不调用强制执行 mock 方法，如果不指定关键字默认为 fail
* return 表示指定返回结果，throw 表示抛出指定异常
* xxx 根据接口的返回类型解析，可以指定返回值或抛出自定义的异常

例：
```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="return" />
```

```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="return null" />
```

```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="fail:return aaa" />
```

```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="force:return true" />
```

```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="fail:throw" />
```

```xml
<dubbo:reference id="demoService" interface="com.xxx.service.DemoService" mock="force:throw java.lang.NullPointException" />
```

### 4.配合 dubbo-admin 使用

* 应用消费端引入 <a href="https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-mock-extensions" target="_blank">`dubbo-mock-admin`</a>依赖

* 应用消费端启动时设置 JVM 参数，`-Denable.dubbo.admin.mock=true`

* 启动 dubbo-admin，在服务 Mock-> 规则配置菜单下设置 Mock 规则

以服务方法的维度设置规则，设置返回模拟数据，动态启用/禁用规则


{{% alert title="注意事项" color="primary" %}}
 
Dubbo 启动时会检查配置，当 mock 属性值配置有误时会启动失败，可根据错误提示信息进行排查

- 配置格式错误，如 `return+null` 会报错，被当做 mock 类型处理，`return` 后面可省略不写或者跟空格后再跟返回值
- 类型找不到错误，如自定义 mock 类、throw 自定义异常，请检查类型是否存在或是否有拼写错误
{{% /alert %}}
