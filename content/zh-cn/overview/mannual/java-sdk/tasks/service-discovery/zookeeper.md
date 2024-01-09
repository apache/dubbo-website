---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description:
linkTitle: 使用Zookeeper注册中心
title: 配置服务发现
type: docs
weight: 3
---

本示例演示 Zookeeper 作为注册中心实现自动服务发现，示例基于 Spring Boot 应用展开，可在此查看 [完整示例代码](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-zookeeper)

## 1 基本配置
### 1.1 增加 Maven 依赖
添加 dubbo、zookeeper 等依赖。`dubbo-dependencies-zookeeper` 将自动为应用增加 Zookeeper 相关客户端的依赖，减少用户使用 Zookeeper 成本，如使用中遇到版本兼容问题，用户也可以选择自行添加 Curator、Zookeeper Client 等依赖。

```xml
<properties>
    <dubbo.version>3.3.0-beta.1</dubbo.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>${dubbo.version}</version>
    </dependency>
    <!-- This dependency helps to introduce Curator and Zookeeper dependencies that are necessary for Dubbo to work with zookeeper as transitive dependencies. -->
    <!-- 仅当 Zookeeper Server 版本是 3.4.x 及以下时，使用此依赖 -->
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-dependencies-zookeeper</artifactId>
        <version>${dubbo.version}</version>
        <type>pom</type>
    </dependency>
    <!-- 仅当 Zookeeper Server 版本是 3.5.x 及以上时，使用此依赖
	<dependency>
		<groupId>org.apache.dubbo</groupId>
		<artifactId>dubbo-dependencies-zookeeper-curator5</artifactId>
		<version>${dubbo.version}</version>
		<type>pom</type>
	</dependency>
	-->
</dependencies>
```

对于 Spring Boot 应用而言，可使用如下依赖：
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>3.3.0-beta.1</version>
</dependency>
<!-- 仅当 Zookeeper Server 版本是 3.4.x 及以下时，使用此依赖 -->
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-zookeeper-spring-boot-starter</artifactId>
    <version>3.3.0-beta.1</version>
</dependency>
<!-- 仅当 Zookeeper Server 版本是 3.5.x 及以上时，使用此依赖
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-zookeeper-curator5-spring-boot-starter</artifactId>
    <version>3.3.0-beta.1</version>
</dependency>
-->
```

其中，dubbo-zookeeper-curator5-spring-boot-starter 或 `dubbo-zookeeper-curator5-spring-boot-starter` 负责管理 zookeeper 相关依赖。

### 1.2 Zookeeper 版本

由于 Dubbo 使用 Curator 作为与 Zookeeper Server 交互的编程客户端，因此，要特别注意 Zookeeper Server 与 Dubbo 版本依赖的兼容性。

Dubbo 提供了 Zookeeper 依赖的辅助管理组件，开发者可根据当前使用的 Zookeeper Server 版本选择依赖版本：

**1. 如果您是 Dubbo3 用户，请根据如下表格选择组件：**

| **Zookeeper Server 版本** | **Dubbo 依赖** | **Dubbo Starter 依赖（SpringBoot用户）** |
| --- | --- | --- |
| 3.4.x 及以下 | dubbo-dependencies-zookeeper | dubbo-zookeeper-spring-boot-starter |
| 3.5.x 及以上 | dubbo-dependencies-zookeeper-curator5 | dubbo-zookeeper-curator5-spring-boot-starter |

**2. 如果您是 Dubbo2 2.7.x 用户：**

| **Zookeeper Server 版本** | **Dubbo 依赖** | **Dubbo Starter 依赖（SpringBoot用户）** |
| --- | --- | --- |
| 3.4.x 及以下 | dubbo-dependencies-zookeeper | 不支持 |
| 3.5.x 及以上 | 不支持 | 不支持 |

{{% alert title="注意" color="info" %}}
* Dubbo 3.3.0 版本开始正式支持 JDK 17，如果您使用 JDK 17，则必须选用 dubbo-dependencies-zookeeper-curator5 或 dubbo-zookeeper-curator5-spring-boot-starter 依赖，对应的 Zookeeper Server 必须是 3.4.x 版本及以上。
{{% /alert %}}


### 1.3 配置并启用 Zookeeper
```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
```
或
```properties
# dubbo.properties
dubbo.registry.address=zookeeper://localhost:2181
```
或
```xml
<dubbo:registry address="zookeeper://localhost:2181" />
```

`address` 是启用 zookeeper 注册中心唯一必须指定的属性，而在生产环境下，`address` 通常被指定为集群地址，如

`address=zookeeper://10.20.153.10:2181?backup=10.20.153.11:2181,10.20.153.12:2181`

protocol 与 address 分开配置的模式也可以，如

`<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181,10.20.153.11:2181,10.20.153.12:2181" />`

## 2 高级配置
### 2.1 认证与鉴权

如果 Zookeeper 开启认证，Dubbo 支持指定 username、password 的方式传入身份标识。

```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   username: hello
   password: 1234
```

也可以直接将参数扩展在 address 上 `address=zookeeper://hello:1234@localhost:2181`

### 2.2 分组隔离
通过指定 `group` 属性，可以在同一个 Zookeeper 集群内实现微服务地址的逻辑隔离。比如可以在一套集群内隔离出多套开发环境，在地址发现层面实现隔离。

```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   group: daily1
```
### 2.3 其他扩展配置
配置连接、会话过期时间
```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   timeout: 30 * 1000* # 连接超时时间，默认 30s
   session: 60 * 1000* # 会话超时时间，默认 60s
```

Zookeeper 注册中心还支持其他一些控制参数，具体可参见[Registry 配置项手册](../../config/properties#registry)

## 3 工作原理
在前面的一节中，我们讲解了应用级服务发现与接口级服务发现的区别，在 Zookeeper 实现中，它们的存储结构也存在较大差异。

### 3.1 接口级节点结构

![/user-guide/images/zookeeper.jpg](/imgs/user/zookeeper.jpg)

流程：
* 服务提供者启动时:  向 `/dubbo/com.foo.BarService/providers` 目录下写入自己的 URL 地址。
* 服务消费者启动时: 订阅 `/dubbo/com.foo.BarService/providers` 目录下的提供者 URL 地址。并向 `/dubbo/com.foo.BarService/consumers` 目录下写入自己的 URL 地址
* 监控中心启动时:   订阅 `/dubbo/com.foo.BarService` 目录下的所有提供者和消费者 URL 地址。

支持以下功能：

* 当提供者出现断电等异常停机时，注册中心能自动删除提供者信息
* 当注册中心重启时，能自动恢复注册数据，以及订阅请求
* 当会话过期时，能自动恢复注册数据，以及订阅请求
* 当设置 `<dubbo:registry check="false" />` 时，记录失败注册和订阅请求，后台定时重试
* 可通过 `<dubbo:registry username="admin" password="1234" />` 设置 zookeeper 登录信息
* 可通过 `<dubbo:registry group="dubbo" />` 设置 zookeeper 的根节点，不配置将使用默认的根节点。
* 支持 `*` 号通配符 `<dubbo:reference group="*" version="*" />`，可订阅服务的所有分组和所有版本的提供者

### 3.2 应用级节点结构

