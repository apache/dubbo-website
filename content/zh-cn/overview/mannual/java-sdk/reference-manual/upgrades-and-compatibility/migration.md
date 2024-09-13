---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/triple/migration/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/triple/migration/
    - /zh-cn/overview/mannual/java-sdk/reference-manual/upgrades-and-compatibility/migration/
description: "从 dubbo2 升级到 dubbo3：涵盖 2.6.x、2.5.x、2.7.x 等版本升级。"
linkTitle: 升级到Dubbo3
title: 从 dubbo2 升级到 dubbo3（涵盖 2.5.x、2.6.x、2.7.x 等版本）
type: docs
weight: 1
---

总体来说，Dubbo2 升级到 Dubbo3 后的核心能力都是兼容的，对于 90% 以上的常规用户而言（指未做深度 SPI 扩展或源码定制的用户），可以非常简单的完成升级。

## 2.7.x 升级 Dubbo3

### 步骤一：升级核心依赖

首先，在应用中增加 bom 依赖管理：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-dependencies-bom</artifactId>
            <version>3.3.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

如果您之前用的是 `org.apache.dubbo:dubbo` 依赖，请升级到以下版本（如果项目中还有其它 dubbo 子模块依赖，请一并升级版本号）：

```xml
<dependency>
  <groupId>org.apache.dubbo</groupId>
  <artifactId>dubbo</artifactId>
</dependency>
```

如果之前的应用是 Spring Boot，建议使用以下 starter 依赖方式并升级到最新版本（如果之前未使用 starter，请删除所有老的 dubbo 模块依赖，直接使用以下配置即可）：

```xml
<dependency>
  <groupId>org.apache.dubbo</groupId>
  <artifactId>dubbo-spring-boot-starter</artifactId>
</dependency>
```

{{% alert title="Dubbo3 相关的 Spring、Spring Boot 版本升级说明" color="warning" %}}
Dubbo3 支持的 Spring、Spring Boot 版本兼容范围非常广：
* 既支持 Spring 3.x ~ Spring 5.x 相关版本，同时也支持 Spring Boot 1.x ~ Spring Boot 2.x 版本。如果遇到应用无法升级高版本 Spring、Spring Boot 的情况下，可排掉 `dubbo-spring-boot-starter` 或 `dubbo` 中传递的高版本 Spring 依赖，指定项目可接受的 Spring 版本依赖即可。
* Spring Boot 3.x 和 Spring 6 版本由于需要 JDK 17 及以上版本，请参考 [Dubbo Spring Boot 手册]() 了解详情。
{{% /alert %}}

### 步骤二：升级其它组件依赖
1. Nacos 注册中心

	如果您使用的是 Nacos 注册中心，在升级到 Dubbo3 之前，请先确保 Nacos Server 升级到 2.x 版本。除了 Nacos Server 之外，我们还需要升级应用侧的 Nacos Client 依赖。

	如果是 Spring Boot 应用，则可删除 nacos-client 依赖，直接使用 starter：

	```xml
	<dependency>
	  <groupId>org.apache.dubbo</groupId>
	  <artifactId>dubbo-nacos-spring-boot-starter</artifactId>
	</dependency>
	```

	如果您当前不是 Spring Boot 应用，则直接更新 nacos-client 到 2.x 即可：

	```xml
	<dependency>
	  <groupId>com.alibaba</groupId>
	  <artifactId>nacos-client</artifactId>
	  <version>2.3.0</version>
	</dependency>
	```

2. Zookeeper 注册中心

	如果是 Spring Boot 应用，则可删除之前老的 Zookeeper 相关依赖，直接使用 starter：

	```xml
	<dependency>
	  <groupId>org.apache.dubbo</groupId>
	  <artifactId>dubbo-zookeeper-curator5-spring-boot-starter</artifactId>
	</dependency>
	```

	请注意，以上 `dubbo-zookeeper-curator5-spring-boot-starter` 请搭配 Zookeeper Server 3.8.0+ 版本使用。如果您当前正在使用的 Zookeeper Server 版本是 3.4.x 版本，则使用以下 starter：

	```xml
	<dependency>
	  <groupId>org.apache.dubbo</groupId>
	  <artifactId>dubbo-zookeeper-spring-boot-starter</artifactId>
	</dependency>
	```

	如果不是 Spring Boot 应用，则可以使用以下依赖（推荐，需确保 Zookeeper Server 3.8.0 版本及以上）：

	```xml
	<dependency>
	  <groupId>org.apache.dubbo</groupId>
	  <artifactId>dubbo-dependencies-zookeeper-curator5</artifactId>
	</dependency>
	```

	或者（对于 Zookeeper Server 3.4.x 版本用户）

	```xml
	<dependency>
	  <groupId>org.apache.dubbo</groupId>
	  <artifactId>dubbo-dependencies-zookeeper</artifactId>
	</dependency>
	```
	{{% alert title="Zookeeper升级注意事项" color="warning" %}}
    请注意在使用以上方式管理 zookeeper 客户端依赖时，请清理项目中的其它 zookeper、curator 等依赖，完全使用 dubbo 提供的版本。
    {{% /alert %}}

3. 其它组件升级

	除了注册中心之外，如果您有用到 Dubbo 的其它特性并且依赖第三方组件支持此特性，则您需要根据具体情况升级相应的组件版本，以确保组件能配合 Dubbo3 工作。

{{% alert title="查看依赖的三方组件版本" color="info" %}}
目的是确认项目中的三方依赖可以与 Dubbo3 正常工作（保持API兼容性）。正常来说，Dubbo 应用中并不会有非常多的第三方组件依赖，所以只要按需确认即可，另外，您可以参考 [Dubbo3 版本依赖的组件版本]() 确认合适的组件版本。
{{% /alert %}}

### 步骤三：兼容性检查
{{% alert title="哪些用户需要做兼容性检查" color="info" %}}
对于大部分常规用户来说，可以跳过这个环节，通常是当前对 Dubbo 有深度定制的用户需要关注（SPI 扩展或源码定制）！
{{% /alert %}}

#### 检查点一：是否有 SPI 扩展

1. 以下 SPI 扩展点在 Dubbo3 中已被移除，如有使用请注意：

	* 事件总线。出于事件管理的复杂度原因，EventDispatcher 和 EventListener 在 Dubbo 3.x 的支持已经删除。如果有对应扩展机制的使用请考虑重构为对应 Dubbo 功能的扩展。

2. 以下 SPI 扩展点的内部工作机制做了实现优化，可按需调整：

	* Filter 拦截器机制。可以基于 Filter 拦截器对请求进行拦截处理，在 2.7 中支持在路由选址后再对请求进行拦截处理。Dubbo3 中新增了 `ClusterFilter` SPI 定义，相比于之前的 `Filter` 扩展点，`ClusterFilter` 可以在很大程度上降低内存的占用，对与超大规模集群有较大的收益。

如果您有一些 Consumer 侧的拦截器是基于 Filter 扩展实现的，如果没有和远端的 IP 地址强绑定的逻辑，我们建议您将对应的 `org.apache.dubbo.rpc.Filter` SPI 扩展点迁移到 `org.apache.dubbo.rpc.cluster.filter.ClusterFilter` 这个新的 SPI 扩展点。

{{% alert title="警告" color="info" %}}
`org.apache.dubbo.rpc.Filter` 与 `org.apache.dubbo.rpc.cluster.filter.ClusterFilter` 在 Dubbo3 中同时支持，ClusterFilter 适配可按需调整，之前老的 Filter 实现都会继续生效，无需担心。
{{% /alert %}}

#### 检查点二：是否存在源码定制
如果您正在使用的 Dubbo 框架包含一些私有源码定制（通过 javagent 或者 asm 等通过运行时对 Dubbo 的修改也在此范围内），则直接升级到开源 Dubbo3 版本可能有兼容性风险。对于这种非标准行为，Dubbo 无法保证其先前的兼容性，需要用户在升级前对所有源码修改进行检查，确保这部分内容完成对 Dubbo3 版本的适配后再升级上线。

> 此类问题可通过一些字节码层面的工具实现，如将进程 metaspace 内容遍历导出，过滤出 Dubbo 所有相关类及调用，以识别业务中、二方包中等直接依赖或增强 Dubbo 框架内部源码的位置。判断这些源码调用在 Dubbo3 内部是否仍然存在，以决策下一步升级动作。

### 步骤四：上线验证
1. 灰度发布
Dubbo 3 升级对于发布流程没有做特殊限制，按照正常业务发布即可。
由于 Dubbo 是进行跨大版本的变更升级，发布中请尽可能多分批次发布，同时拉大第一批和第二批发布的时间间隔，做好充足的观察。
发布过程中，我们建议您先升级应用的下游（也即是服务提供者），在验证服务处理正常以后再继续后续发布。

2. 观测应用指标
在发布的过程中，有以下几个纬度的指标可以判断升级是否出现问题。

- 机器的 CPU、内存使用情况
- 接口请求成功率
- 接口请求 RT
- 日志的报错信息
- 自定义扩展行为是否符合预期

## 2.6.x 及以下版本升级 Dubbo3

以下内容是针对 2.6.x、2.5.x 及以下版本用户的，帮助了解如何升级到 Dubbo3 版本。对于这些版本的用户而言，80% 的用户都是可以通过替换依赖实现平滑升级的，按以下步骤升级并做好检查即可。

### 步骤一：升级核心依赖

首先，必须升级之前老的 `com.alibaba:dubbo` 依赖坐标升级为 `org.apache.dubbo:dubbo`。

如下所示，将 `com.alibaba:dubbo` 依赖

```xml
<dependency>
	<groupId>com.alibaba</groupId>
	<artifactId>dubbo</artifactId>
	<version>2.6.5</version>
</dependency>
```

替换为 `org.apache.dubbo:dubbo` 依赖，其它配置文件不用修改，如下所示：

```xml
<properties>
    <dubbo.version>3.3.0</dubbo.version>
</properties>
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-dependencies-bom</artifactId>
            <version>${dubbo.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
    </dependency>
</dependencies>
```

如果您是 Spring Boot 应用，则也可以使用 `org.apache.dubbo:dubbo-spring-boot-starter` 替换上面的 `org.apache.dubbo:dubbo` 依赖：

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-spring-boot-starter</artifactId>
    </dependency>
</dependencies>
```

### 步骤二：升级其它组件依赖

您需要升级注册中心（Nacos、Zookeeper或其它）等第三方组件，具体升级方法和目标版本请参考本文前面一节的 [2.7.x 版本升级到 Dubbo3](./#步骤二升级其它组件依赖) 中的详细说明，两者操作方法完全一样。

{{% alert title="请务必注意第三方组件的版本" color="info" %}}
* 对于很多 Dubbo 2.6.x 及以下的老用户来说，可能用到的组件（如注册中心）都是比较老的版本，这时升级到 Dubbo3 之前请仔细分析一下都有哪些功能和核心依赖组件，以评估组件升级到的目标版本。
* 对于部分 Zookeeper 用户而言，如果 Zookeeper 版本较老，建议先升级 Zookeeper Server 到 3.8.x 及以上版本，再使用 Dubbo3 的 `dubbo-zookeeper-curator5-spring-boot-starter` 管理依赖，如上文 [2.7.x 升级](./#步骤二升级其它组件依赖) 一节中所述。
{{% /alert %}}

### 步骤三：兼容性检查
如果升级依赖后出现API或SPI扩展相关的编译错误，请参考下文。如果您的 Dubbo 用法中有很多 SPI 扩展实现、内部 API 调用、或者改了一些内核源码，则需要重点关注这一部分的兼容性检查。

#### 检查点一：包名改造
 Dubbo3 与 2.6.x 及以下版本最大的一个区别就是坐标、包名的变化：

1. Maven 坐标 GAV

**groupId 由 `com.alibaba` 改为 `org.apache.dubbo`**

2. package

**package 前缀由 `com.alibaba.dubbo.*` 改为 `org.apache.dubbo.*`**


Maven坐标升级比较直观，只需要修改相应的pom文件就可以了；而package变更则可能会带来编译问题，但好在 Dubbo3 版本继续保留了绝大部分常用基础 API 和 SPI 的 `com.alibaba.dubbo` 适配支持，因此理论上升级 pom 后项目仍可直接编译成功。

#### 检查点二：API编程接口

- 注解

| 注解                  | 推荐的新注解               | 说明               |
| --------------------- | ------------------ | ------------------ |
| @Reference            | @DubboReference | 消费端服务引用注解   |
| @Service              | @DubboService | 提供端服务暴露注解    |
| @EnableDubbo          | @EnableDubbo  |                    |
| 其他常用Spring注解API   | 其他常用Spring注解API |                    |



- 编程API

| API               | 说明                          |
| ----------------- | ----------------------------- |
| ReferenceConfig   | Service配置采集和引用编程接口 |
| ServiceConfig     | Service配置采集和暴露编程接口 |
| ApplicationConfig | Application配置采集API        |
| RegistryConfig    | 注册中心配置采集API           |
| ConsumerConfig    | 消费端默认配置采集API         |
| ProviderConfig    | 提供端默认配置采集API         |
| ProtocolConfig    | RPC协议配置采集API            |
| ArgumentConfig    | 服务参数级配置采集API         |
| MethodConfig      | 服务方法级配置采集API         |
| ModuleConfig      | 服务治理Module配置采集API     |
| MonitorConfig     | 监控配置采集API               |
| RpcContext        | 编程上下文API                 |


#### 检查点三：SPI扩展

如果公司内部有维护的自定义SPI扩展库，在业务工程升级到 Dubbo3 上线之前，请务必先确保扩展库与 Dubbo3 的兼容性。如果发现有兼容性问题，建议通过修改包名引用的方式（从实现 `com.alibaba.dubbo.*` 包名类到实现 `org.apache.dubbo.*` 包名类 ）完成升级，并重新打包。



| SPI扩展点     | 说明                                                         |
| ------------- | ------------------------------------------------------------ |
| Registry      | 包括`RegistryFactory`, `Registry` ,`RegistryService`等扩展点 |
| Protocol      | RPC协议扩展                                                  |
| Serialization | 序列化协议扩展                                               |
| Cluster       | 集群容错策略扩展，如Failover, Failfast等                     |
| Loadbalance   | 负载均衡策略扩展                                             |
| Transporter   | 传输框架扩展，如Netty等                                      |
| Monitor       | 监控中心扩展，包括MonitorFactory, Monitor, MonitorService等  |
| Router        | 路由规则扩展                                                 |
| Filter        | 拦截器扩展                                                   |

### 步骤四：上线验证

参考本文前面一节的 [2.7.x 版本升级到 Dubbo3](./#步骤四上线验证) 中讲到的验证方法。
