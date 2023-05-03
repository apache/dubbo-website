---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/multi-protocols/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/multi-protocols/
description: 在 Dubbo 中配置多协议
linkTitle: 多协议
title: 多协议
type: docs
weight: 9
---





## 特性说明
Dubbo 允许配置多协议，在不同服务上支持不同协议或者同一服务上同时支持多种协议。

## 使用场景

与不同系统的兼容：如果你正在与一个支持特定协议的系统集成，你可以使用 Dubbo 对该协议的支持来方便通信。例如，如果您正在与使用 RMI 的遗留系统进行集成，则可以使用 Dubbo 的 RMI 协议支持与该系统进行通信。使用多种协议可以提供灵活性，并允许您为您的特定用例选择最佳选项。

- 改进的性能：不同的协议可能具有不同的性能特征，这取决于传输的数据量和网络条件等因素。通过使用多种协议，可以根据您的性能要求选择最适合给定情况的协议。
- 安全性：一些协议可能提供比其他协议更好的安全特性。HTTPS 协议通过加密传输的数据来提供安全通信，这对于保护敏感数据非常有用。
- 易用性：某些协议在某些情况下可能更易于使用。如果正在构建 Web 应用程序并希望与远程服务集成，使用 HTTP 协议可能比使用需要更复杂设置的协议更方便。

## 使用方式

### 不同服务不同协议
不同服务在性能上适用不同协议进行传输，比如大数据用短连接协议，小数据大并发用长连接协议

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd"> 
    <dubbo:application name="world"  />
    <dubbo:registry id="registry" address="10.20.141.150:9090" username="admin" password="hello1234" />
    <!-- 多协议配置 -->
    <dubbo:protocol name="dubbo" port="20880" />
    <dubbo:protocol name="rmi" port="1099" />
    <!-- 使用dubbo协议暴露服务 -->
    <dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" protocol="dubbo" />
    <!-- 使用rmi协议暴露服务 -->
    <dubbo:service interface="com.alibaba.hello.api.DemoService" version="1.0.0" ref="demoService" protocol="rmi" /> 
</beans>
```

### 多协议暴露服务
需要与 http 客户端相互操作

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <dubbo:application name="world"  />
    <dubbo:registry id="registry" address="10.20.141.150:9090" username="admin" password="hello1234" />
    <!-- 多协议配置 -->
    <dubbo:protocol name="dubbo" port="20880" />
    <dubbo:protocol name="hessian" port="8080" />
    <!-- 使用多个协议暴露服务 -->
    <dubbo:service id="helloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" protocol="dubbo,hessian" />
</beans>
```