---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/json-compatibility-check/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/json-compatibility-check/
description: Rest协议下对服务接口进行JSON兼容性检测
linkTitle: 服务接口JSON兼容性检测
title: 服务接口JSON兼容性检测
type: docs
weight: 6
---





## 特性说明
`Dubbo`目前支持使用`Rest`协议进行服务调用，`Rest`协议默认会使用`JSON`作为序列化方式，但`JSON`并不支持`Java`的一些特殊用法，如`接口`和`抽象类`等。

`Dubbo 3.3`版本在服务发布流程中增加了`服务接口JSON兼容性检测`功能， 可以确保服务接口传输对象是否可以被`JSON`序列化， 进一步提升`Rest`服务接口的正确性。

## 使用场景
使用`Rest`作为通信协议，`JSON`作为序列化方式时，对服务接口进行兼容性检查，确保服务接口传输对象可以正确地被`JSON`序列化。

## 使用方式

当使用`Rest`协议作为通信协议，`JSON`作为序列化方式时，可以在`xml`文件中通过配置`protocol`的`json-check-level`属性来配置`JSON兼容性检查`的级别。

目前有`3`种级别，每种级别的具体含义如下：

* `disabled`：表示`不开启JSON兼容性检查`，此时不会对接口进行兼容性检查。
* `warn`：表示`开启JSON兼容性检查`，如果出现不兼容的情况，将会以`warn`级别的日志形式将不兼容的接口名称打印输出到终端。
* `strict`：表示`开启JSON兼容性检查`，如果出现不兼容的情况，将会在启动时抛出`IllegalStateException`异常，终止启动流程，同时会将不兼容的接口名称存放在异常信息中。

> 如果没有通过`json-check-level`指定兼容性检查级别，则默认是`warn`告警级别。

### 使用示例

```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd http://www.springframework.org/schema/context
       http://www.springframework.org/schema/context/spring-context.xsd">

    <context:component-scan base-package="com.example.rest"/>

    <bean name="dubboConfig" class="com.example.rest.config.DubboConfig"></bean>

    <dubbo:application name="rest-provider" owner="programmer" organization="dubbo"/>

    <dubbo:registry address="zookeeper://${zookeeper.address:127.0.0.1}:2180"/>

    <!-- 将JSON兼容性检查级别设为disabled  -->
    <dubbo:protocol name="rest" port="8880" threads="300" json-check-level="disabled"/>

    <!-- 将JSON兼容性检查级别设为warn  -->
    <dubbo:protocol name="rest" port="8880" threads="300" json-check-level="warn"/>

    <!-- 将JSON兼容性检查级别设为strict  -->
    <dubbo:protocol name="rest" port="8880" threads="300" json-check-level="strict"/>

</beans>
```
