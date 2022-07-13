---
type: docs
title: "Nacos 注册中心"
linkTitle: "Nacos"
weight: 1
description: "Nacos 注册中心参考手册"
---
## 特性说明
Nacos 是 Dubbo 生态系统中重要的注册中心实现，其中 [`dubbo-registry-nacos`](https://github.com/apache/dubbo/tree/3.0/dubbo-registry/dubbo-registry-nacos) 则是 Dubbo 融合 Nacos 注册中心的实现。

#### 预备工作

Dubbo 使用 nacos 注册中心之前，需先成功启动nacos server，操作步骤请参考 [nacos快速入门](https://nacos.io/zh-cn/docs/quick-start.html) 。<br>

当Dubbo使用`3.0.0`及以上版本时，需要使用Nacos `2.0.0`及以上版本。

#### Nacos通用参数说明

参数名 | 中文描述| 默认值
---|---|---
username|连接Nacos Server的用户名|nacos
paasword|连接Nacos Server的密码|nacos
backup|备用地址|空
namespace|命名空间的ID|public
group|分组名称|DEFAULT_GROUP
register-consumer-url|是否注册消费端|false
com.alibaba.nacos.naming.log.filename|初始化日志文件名|naming.log
endpoint|连接Nacos Server指定的连接点，可参考[文档](https://nacos.io/zh-cn/blog/address-server.html)|空
endpointPort|连接Nacos Server指定的连接点端口，可以参考[文档](https://nacos.io/zh-cn/blog/address-server.html)|空
endpointQueryParams|endpoint查参数询|空
isUseCloudNamespaceParsing|是否解析云环境中的namespace参数|true
isUseEndpointParsingRule|是否开启endpoint 参数规则解析|true
namingLoadCacheAtStart|启动时是否优先读取本地缓存|true
namingCacheRegistryDir|指定缓存子目录，位置为 .../nacos/{SUB_DIR}/naming|空
namingClientBeatThreadCount|客户端心跳的线程池大小|机器的CPU数的一半
namingPollingThreadCount|客户端定时轮询数据更新的线程池大小|机器的CPU数的一半
namingRequestDomainMaxRetryCount|client通过HTTP向Nacos Server请求的重试次数|3
namingPushEmptyProtection|在服务没有有效（健康）实例时，是否开启保护，开启后则会使用旧的服务实例|false
push.receiver.udp.port|客户端UDP的端口|空

## 使用场景

## 使用方式
#### 快速上手
Dubbo 融合 Nacos 成为注册中心的操作步骤非常简单，大致步骤可分为“增加 Maven 依赖”以及“配置注册中心”。


#### 增加 Maven 依赖

首先，您需要将 `dubbo-registry-nacos` 的 Maven 依赖添加到您的项目 `pom.xml` 文件中。

**注**：Dubbo `3.0.0`及以上版本，dubbo-registry-nacos引入nacos-client`2.0.0`及以上版本。
```xml
<dependencies>
    ...
    <!-- Dubbo Nacos registry dependency -->
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-registry-nacos</artifactId>
        <version>3.0.7</version>
    </dependency>   
    
    <!-- Dubbo dependency -->
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>3.0.7</version>
    </dependency>
    ...
</dependencies>
```

当项目中添加  `dubbo-registry-nacos` 后，您无需显式地编程实现服务发现和注册逻辑，实际实现由该三方包提供，接下来配置 Naocs 注册中心。

#### 配置注册中心

如果 Dubbo 应用使用 Spring Framework 装配，将有两种配置方法可选，分别为：[Dubbo Spring 外部化配置](https://mercyblitz.github.io/2018/01/18/Dubbo-%E5%A4%96%E9%83%A8%E5%8C%96%E9%85%8D%E7%BD%AE/)以及 Spring XML 配置文件，推荐前者。


#### Dubbo Spring 外部化配置

Dubbo Spring [外部化配置](https://mercyblitz.github.io/2018/01/18/Dubbo-%E5%A4%96%E9%83%A8%E5%8C%96%E9%85%8D%E7%BD%AE/) 是由 Dubbo 2.5.8 引入的新特性，可通过 Spring `Environment` 属性自动地生成并绑定 Dubbo 配置 Bean，实现配置简化，并且降低微服务开发门槛。

当 Dubbo 使用 Nacos 为注册中心，假设启动服务器IP `10.20.153.10`，端口号`8848`，则在 Dubbo 外部化配置文件中添加以下配置：

```properties
## 其他属性保持不变

## application 
dubbo.application.name=your-dubbo-application

## Nacos registry address
dubbo.registry.address=nacos://10.20.153.10:8848

##如果要使用其他nacos参数，可以使用以下2中方式
#第一种方式
#dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos&namespace=5cbb70a5-xxx-xxx-xxx-d43479ae0932&group=demo

#第二种方式
#dubbo.registry.address=nacos://localhost:8848
#dubbo.registry.parameters.username=nacos
#dubbo.registry.parameters.password=nacos
#dubbo.registry.parameters.namespace=5cbb70a5-xxx-xxx-xxx-d43479ae0932
#dubbo.registry.parameters.group=demo
...
```
关于 nacos 配置参数请参考 nacos 通用参数说明

注：Dubbo3.0.0版本以后，增加了是否注册消费者的参数，如果需要将消费者注册到 nacos 注册中心上，需要将参数 (register-consumer-url)设置为true，默认是false。

设置方式如下：
```properties
##设置是否注册消费者的参数，可以使用以下2中方式
#第一种方式
#dubbo.registry.address=nacos://localhost:8848?register-consumer-url=true

#第二种方式
#dubbo.registry.address=nacos://localhost:8848
#dubbo.registry.parameters.register-consumer-url=true

```

随后，重启您的 Dubbo 应用，Dubbo 的服务提供和消费信息在 Nacos 控制台中可以显示：

![image-dubbo-registry-nacos-6.png](/static/imgs/blog/dubbo-registry-nacos-6.png)


如图所示，服务名前缀为 `providers:` 的信息为服务提供者的元信息，`consumers:` 则代表服务消费者的元信息。点击“**详情**”可查看`providers:` 服务状态详情：

![image-dubbo-registry-nacos-7.png](/static/imgs/blog/dubbo-registry-nacos-7.png)

`consumers:` 服务状态详情：

![image-dubbo-registry-nacos-8.png](/static/imgs/blog/dubbo-registry-nacos-8.png)


如果您正在使用 Spring XML 配置文件装配 Dubbo 注册中心的话，请参考下一节。

#### Spring XML 配置文件

当 Dubbo 使用 Nacos 为注册中心，假设启动服务器IP `10.20.153.10`，端口号`8848`，在 Spring Bean 在 XML 文件中添加以下配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xsi:schemaLocation="http://www.springframework.org/schema/beans        http://www.springframework.org/schema/beans/spring-beans-4.3.xsd        http://dubbo.apache.org/schema/dubbo        http://dubbo.apache.org/schema/dubbo/dubbo.xsd">

    <!-- 提供方应用信息，用于计算依赖关系 -->
    <dubbo:application name="nacos-demo-xml"/>

    <!-- 使用 Nacos 注册中心 -->
<dubbo:registry address="nacos:// 10.20.153.10:8848" username="nacos" password="nacos"/>

<!-- 如果要使用其他nacos参数可以使用下面方式 -->
	<!-- 当参数在xsd中有定义时，可用以下方式 -->
	<!-- <dubbo:registry address="nacos:// 10.20.153.10:8848" username="nacos" password="nacos" group="demo" /> -->

	<!-- 或者使用以下方式，将参数配置在address中 -->
<!-- <dubbo:registry address="nacos://10.20.153.10:8848?namespace=5cbb70a5-xxx-xxx-xxx-d43479ae0932" username="nacos" password="nacos" /> -->
...
</beans>
```

关于 nacos 配置参数请参考 nacos 通用参数说明

**注**：Dubbo3.0.0版本以后，增加了是否注册消费者的参数，如果需要将消费者注册到 nacos 注册中心上，需要将参数 (register-consumer-url) 设置为 true，默认是 false。设置方式如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xsi:schemaLocation="http://www.springframework.org/schema/beans        http://www.springframework.org/schema/beans/spring-beans-4.3.xsd        http://dubbo.apache.org/schema/dubbo        http://dubbo.apache.org/schema/dubbo/dubbo.xsd">

	...
    <!-- 使用 Nacos 注册中心 -->
<dubbo:registry address="nacos:// 10.20.153.10:8848?register-consumer-url=true" username="nacos" password="nacos"/>
...
</beans>
```

重启 Dubbo 应用后，在 Nacos 的控制台同样上可看到服务提供者和消费者的的注册元信息：

![image-dubbo-registry-nacos-9.png](/static/imgs/blog/dubbo-registry-nacos-9.png)

如图所示，服务名前缀为 `providers:` 的信息为服务提供者的元信息，`consumers:` 则代表服务消费者的元信息。点击“**详情**”可查看`providers:` 服务状态详情：

![image-dubbo-registry-nacos-10.png](/static/imgs/blog/dubbo-registry-nacos-10.png)

`consumers:` 服务状态详情：

![image-dubbo-registry-nacos-11.png](/static/imgs/blog/dubbo-registry-nacos-11.png)
