---
title: 升级与可能的兼容性问题总结
keywords: Dubbo,升级与可能的兼容性问题总结
description: 升级与可能的兼容性问题总结
---

# 升级与可能的兼容性问题总结

环境要求：需要**Java 8**及以上版本。

2.7.0版本在改造的过程中遵循了一个原则，即**保持与低版本的兼容性，因此从功能层面来说它是与2.6.x及更低版本完全兼容的**，而接下来将要提到的兼容性问题主要是[包重命名](#1.1)带来的。另外，虽然功能用法保持向后兼容，但参考本文能帮助您尽快用到2.7.0版本的新特性。

## 升级步骤

1. 升级pom到2.7.0（以all-in-one依赖为例）。

```xml
<properties>
    <dubbo.version>2.7.0</dubbo.version>
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
        <version>${dubbo.version}</version>
    </dependency>
    <dependency>
        <groupId>io.netty</groupId>
        <artifactId>netty-all</artifactId>
    </dependency>
</dependencies>
```

如果升级依赖后出现API或SPI扩展相关的编译错误，请参考[包兼容性问题](#1.1)

此时重新部署应用，所有默认行为和2.6.x保持一致，如果要用到2.7的新特性，则需要继续做以下配置（可选）：

- 简化的URL
- 配置元数据中心
- 使用外部化配置
- 服务治理规则
- 使用异步API



下面我们就对这几部分的配置分别做详细说明。



#### 简化的URL

```xml
<!-- simplified="true"表示注册简化版的URL到Registry -->
<dubbo:registry address="zookeeper://127.0.0.1:2181" simplified="true"/>
```

```properties
dubbo.registry.simplified=true
```

建议将此配置集中管理，参考[外部化配置](#1.2)。

> URL简化只是剔除了一些纯粹的查询用的参数，并没有做大刀阔斧的服务发现模型改造，因此精简后的URL完全可以被2.6及以下版本的消费端实现服务发现与调用，同样2.7版本也可以发现和调用低版本的提供者。



#### 配置元数据中心

```xml
<dubbo:metadata-report address="redis://127.0.0.1:6379"/>
```

```properties
dubbo.metadataReport.address=redis://127.0.0.1:6379
```

建议将此配置集中管理，参考[外部化配置](#1.2)。
在此了解更多[元数据中心]()设计目的与用途。



<h4 id="1.2">使用外部化配置</h4>

需要在项目启动前，使用[最新版本Dubbo-OPS](https://github.com/apache/dubbo-ops)完成外部化配置迁移，理论上配置中心支持所有本地dubbo.properties所支持的配置项。

以XML开发形式为例，假设我们本地有如下配置：

```xml
<dubbo:application name="demo-provider"/>
<dubbo:config-center address="zookeeper://127.0.0.1:2181"/>

<dubbo:registry address="zookeeper://127.0.0.1:2181" simplified="true"/>
<dubbo:metadata-report address="redis://127.0.0.1:6379"/>
<dubbo:protocol name="dubbo" port="20880"/>

<bean id="demoService" class="org.apache.dubbo.samples.basic.impl.DemoServiceImpl"/>
<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService" ref="demoService"/>
```

通过[OPS控制台](http://47.91.207.147/#/management?key=global)将以下全局配置迁移到配置中心，成为所有应用共享的配置。

```properties
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.registry.simplified=true

dubbo.metadataReport.address=redis://127.0.0.1:6379

dubbo.protocol.name=dubbo
dubbo.protocol.port=20880
```

这样应用开发者只需要关心配置中心的配置。

```xml
<dubbo:application name="demo-provider"/>
<dubbo:config-center address="zookeeper://127.0.0.1:2181"/>

<bean id="demoService" class="org.apache.dubbo.samples.basic.impl.DemoServiceImpl"/>
<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService" ref="demoService"/>
```



这里增加了一篇[Dubbo配置方式]()的说明文档，详细描述了Dubbo当前支持的配置类型、不同配置之间的覆盖关系等。



#### 服务治理规则迁移

2.7版本可以读取到老的治理规则，因此不用担心升级2.7的应用后老规则会失效，可以选择先升级上线，再慢慢的做增量式规则迁移。

请参考[OPS -> 服务治理](http://47.91.207.147/#/governance/routingRule)了解规则配置方式，这里我们重点关注的是规则格式，以下提供几个简单示例：

- 条件路由

  ```yaml
  ---
  scope: application
  force: true
  runtime: true
  enabled: true
  key: governance-conditionrouter-consumer
  conditions:
    - application=app1 => address=*:20880
    - application=app2 => address=*:20881
  ...
  ```



- 标签路由

  ```yaml
  ---
  force: false
  runtime: true
  enabled: true
  key: governance-tagrouter-provider
  tags:
    - name: tag1
      addresses: ["127.0.0.1:20880"]
    - name: tag2
      addresses: ["127.0.0.1:20881"]
  ...
  ```



- 动态配置（覆盖规则）

  ```yaml
  ---
  scope: service
  key: org.apache.dubbo.samples.governance.api.DemoService
  enabled: true
  configs:
  - addresses: [0.0.0.0]
    side: consumer
    parameters:
      timeout: 6000
  ...
  ```



关于治理规则更多详细说明，请参考[路由规则](/docs/zh-cn/user/demos/routing-rule.md)和[覆盖规则](/docs/zh-cn/user/demos/config-rule.md)用户文档。

也可继续了解[使用示例](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-governance)。



#### 使用异步API

这部分的接口和低版本同样是完全兼容的，你仅须在打算使用CompletableFuture<T>提供的回调或者异步组装能力时，再考虑升级这部分内容即可。

- 定义CompletableFuture<T>类型接口
- 同步签名接口实现Provider端异步执行

- 感知异步返回值的Filter链路



点击链接，了解关于异步API如何使用的更多[使用示例]()。



<h4 id="1.1">包名改造</h4>

1. Maven坐标

**groupId 由 `com.alibaba` 改为 `org.apache.dubbo`**

2. package

**package 由 `com.alibaba.dubbo` 改为 `org.apache.dubbo`**



Maven坐标升级比较直观，只需要修改相应的pom文件就可以了；而package变更则可能会带来编译问题，升级过程需要用户修改代码。因此为了减少用户升级成本，让用户可以做到渐进式升级，2.7.0版本继续保留了一些常用基础API和SPI`com.alibaba.dubbo`的支持。

#### API编程接口

- 注解

| 注解                  | 说明               |
| --------------------- | ------------------ |
| @Reference            | 消费端服务引用注解 |
| @Service              | 提供端服务暴露注解 |
| @EnableDubbo          |                    |
| 其他常用Spring注解API |                    |



- 编程API

| API               | 说明                          |
| ----------------- | ----------------------------- |
| ReferenceConfig   | Service配置采集和引用编程接口 |
| ServiceConfig     | Service配置采集和暴露编程接口 |
| ApplicationConfig | Application配置采集API        |
| RegistryConfig    | 注册中心配置采集API           |
| ConsumerConfig    | 提供端默认配置采集API         |
| ProviderConfig    | 消费端默认配置采集API         |
| ProtocolConfig    | RPC协议配置采集API            |
| ArcumentConfig    | 服务参数级配置采集API         |
| MethodConfig      | 服务方法级配置采集API         |
| ModuleConfig      | 服务治理Module配置采集API     |
| MonitorConfig     | 监控配置采集API               |
| RpcContext        | 编程上下文API                 |



#### SPI扩展

> 如果公司内部有维护的自定义SPI扩展库，在业务工程升级到2.7.0之前，请务必先确保扩展库与2.7.0的兼容性。如果发现有兼容性问题，请通过修改包名引用的方式完成升级，并重新打包。



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



## FAQ

1. 升级后启动出现curator依赖报错

