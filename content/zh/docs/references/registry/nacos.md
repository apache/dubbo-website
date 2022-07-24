---
type: docs
title: "Nacos 注册中心"
linkTitle: "Nacos"
weight: 1
description: "Nacos 注册中心参考手册"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/reference-manual/registry/nacos/)。
{{% /pageinfo %}}

Nacos 是 Dubbo 生态系统中重要的注册中心实现，其中 [`dubbo-registry-nacos`](https://github.com/apache/incubator-dubbo/tree/master/dubbo-registry/dubbo-registry-nacos) 则是 Dubbo 融合 Nacos 注册中心的实现。

## 预备工作

当您将 [dubbo-registry-nacos](https://github.com/apache/incubator-dubbo/tree/master/dubbo-registry/dubbo-registry-nacos) 整合到您的 Dubbo 工程之前，请确保后台已经启动 Nacos 服务。如果您尚且不熟悉 Nacos 的基本使用的话，可先行参考 [Nacos 快速入门](https://nacos.io/en-us/docs/quick-start.html)。建议使用 Nacos `1.0.0` 及以上的版本。

## 快速上手

Dubbo 融合 Nacos 成为注册中心的操作步骤非常简单，大致步骤可分为“增加 Maven 依赖”以及“配置注册中心“。


### 增加 Maven 依赖

首先，您需要将 `dubbo-registry-nacos` 的 Maven 依赖添加到您的项目 `pom.xml` 文件中，并且强烈地推荐您使用 Dubbo `2.6.5`：

```xml
<dependencies>

    ...
        
    <!-- Dubbo Nacos registry dependency -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>dubbo-registry-nacos</artifactId>
        <version>0.0.2</version>
    </dependency>   
    
    <!-- Keep latest Nacos client version -->
    <dependency>
        <groupId>com.alibaba.nacos</groupId>
        <artifactId>nacos-client</artifactId>
        <version>[0.6.1,)</version>
    </dependency>
    
    <!-- Dubbo dependency -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>dubbo</artifactId>
        <version>2.6.5</version>
    </dependency>
    
    <!-- Alibaba Spring Context extension -->
    <dependency>
        <groupId>com.alibaba.spring</groupId>
        <artifactId>spring-context-support</artifactId>
        <version>1.0.2</version>
    </dependency>

    ...
    
</dependencies>
```

当项目中添加  `dubbo-registry-nacos` 后，您无需显式地编程实现服务发现和注册逻辑，实际实现由该三方包提供，接下来配置 Naocs 注册中心。

### 配置注册中心

假设您 Dubbo 应用使用 Spring Framework 装配，将有两种配置方法可选，分别为：[Dubbo Spring 外部化配置](https://mercyblitz.github.io/2018/01/18/Dubbo-%E5%A4%96%E9%83%A8%E5%8C%96%E9%85%8D%E7%BD%AE/)以及 Spring XML 配置文件，推荐前者。


### Dubbo Spring 外部化配置

> [参考](https://mercyblitz.github.io/2018/01/18/Dubbo-%E5%A4%96%E9%83%A8%E5%8C%96%E9%85%8D%E7%BD%AE/)

Dubbo Spring 外部化配置是由 Dubbo `2.5.8` 引入的新特性，可通过 Spring `Environment` 属性自动地生成并绑定 Dubbo 配置 Bean，实现配置简化，并且降低微服务开发门槛。

假设您的 Nacos Server 同样运行在服务器 `10.20.153.10` 上，并使用默认 Nacos 服务端口 `8848`，您只需将 `dubbo.registry.address` 属性调整如下：

```properties
## 其他属性保持不变

## Nacos registry address
dubbo.registry.address = nacos://10.20.153.10:8848
...
```

随后，重启您的 Dubbo 应用，Dubbo 的服务提供和消费信息在 Nacos 控制台中可以显示：

![dubbo-registry-nacos-1.png](/imgs/blog/dubbo-registry-nacos-1.png)



如图所示，服务名前缀为 `providers:` 的信息为服务提供者的元信息，`consumers:` 则代表服务消费者的元信息。点击“**详情**”可查看服务状态详情：

![image-dubbo-registry-nacos-2.png](/imgs/blog/dubbo-registry-nacos-2.png)

如果您正在使用 Spring XML 配置文件装配 Dubbo 注册中心的话，请参考下一节。

### Spring XML 配置文件

与 [Dubbo Spring 外部化配置](https://mercyblitz.github.io/2018/01/18/Dubbo-%E5%A4%96%E9%83%A8%E5%8C%96%E9%85%8D%E7%BD%AE/) 配置类似，只需要调整 `address` 属性配置即可：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans        http://www.springframework.org/schema/beans/spring-beans-4.3.xsd        http://dubbo.apache.org/schema/dubbo        http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
 
    <!-- 提供方应用信息，用于计算依赖关系 -->
    <dubbo:application name="dubbo-provider-xml-demo"  />
 
    <!-- 使用 Nacos 注册中心 -->
    <dubbo:registry address="nacos://10.20.153.10:8848" />
 	...
</beans>
```



重启 Dubbo 应用后，您同样也能发现服务提供方和消费方的注册元信息呈现在 Nacos 控制台中：

![dubbo-registry-nacos-3.png](/imgs/blog/dubbo-registry-nacos-3.png)


**附加信息**: 在nacos-server@`1.0.0`版本后，支持客户端通过上报一些包含特定的元数据的实例到服务端来控制实例的一些行为。
  
 例如:  
`preserved.heart.beat.timeout`   : 该实例在不发送心跳后，从健康到不健康的时间。（单位:毫秒）
`preserved.ip.delete.timeout`    : 该实例在不发送心跳后，被服务端下掉该实例的时间。（单位:毫秒）
`preserved.heart.beat.interval`  : 该实例在客户端上报心跳的间隔时间。（单位:毫秒）
`preserved.instance.id.generator`: 该实例的id生成策略，值为`snowflake`时，从0开始增加。
`preserved.register.source`      : 保留键，目前未使用。

该功能将在Dubbo@`2.7.10`开始支持，通过在address中增加参数来进行配置.
例如: `nacos://10.20.153.10:8848?preserved.heart.beat.timeout=15000&preserved.ip.delete.timeout=30000&preserved.heart.beat.interval=10000`

