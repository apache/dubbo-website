---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/serialization/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/serialization/
description: 在 Dubbo 中使用高效的 Java 序列化（Kryo 和 FST）
linkTitle: 序列化概述
title: Dubbo 序列化机制介绍
type: docs
weight: 1
---

## 支持的协议列表
以下是 Dubbo 框架支持的序列化协议列表，根据 `triple`、`dubbo` RPC 通信协议进行分类。

| <span style="display:inline-block;width:100px">RPC协议</span> | <span style="display:inline-block;width:100px">编程模式</span> | <span style="display:inline-block;width:100px">序列化协议</span> | <span style="display:inline-block;width:200px">配置方式</span> | JDK版本 | 说明 |
| --- | --- | --- | --- | --- | --- |
| **triple** | IDL | protobuf、<br/>protobuf-json | 默认值 | 8, 17, 21 | 使用 IDL 时的默认序列化方式，client 也可以选择 protobuf-json 序列化通信，无需额外配置 |
|  | Java接口 | protobuf-wrapper | serialization="hessian" | 8, 17, 21 | 这种模式下采用的是两次序列化模式，即数据先被 hessian 序列化，再由 protobuf 序列化。<br/><br/>为了支持与 IDL 同等的调用模型，易用性较好但性能略有下降 |
| **dubbo** | Java接口 | hessian | 默认值，serialization="hessian" | 8, 17, 21 | dubbo 协议默认序列化方式，具备兼容性好、高性能、跨语言的优势(java、go、c/c++、php、python、.net) |
|  | Java接口 | protostuff | serialization="protostuff" | 8 | A java serialization library with built-in support for forward-backward compatibility (schema evolution) and validation. |
|  | Java接口 | gson | serialization="gson" | 8, 17, 21 | 谷歌推出的一款 json 序列化库 |
|  | Java接口 | avro | serialization="avro" | 8, 17, 21 | 一款 Java 高性能序列化库 |
|  | Java接口 | msgpack | serialization="msgpack" | 8, 17, 21 | 具备兼容性好，提供多语言（Java、C/C++、Python等）实现等优势|
|  | Java接口 | kryo | serialization="kryo" | 8, 17, 21 | Kryo是一种非常成熟的序列化实现，已经在Twitter、Groupon、Yahoo以及多个著名开源项目（如Hive、Storm）中广泛的使用。 |
|  | Java接口 | fastjson2 | serialization="fastjson2" | 8, 17, 21 | fastjson |
|  | Java接口 | 更多扩展|  |  | [dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-serialization-extensions) |

## 性能对比报告

序列化对于远程调用的响应速度、吞吐量、网络带宽消耗等起着至关重要的作用，是我们提升分布式系统性能的最关键因素之一。

具体请查看 [参考手册 - 性能基准报告](/zh-cn/overview/mannual/java-sdk/reference-manual/performance/)。

## 切换序列化协议

{{% alert title="注意" color="info" %}}
本文档适用的典型场景是 Dubbo 老用户：用户已经有大量系统运行在 Dubbo 之上，由于一些场景需要，必须将使用多年的序列化升级一个新的序列化协议。
{{% /alert %}}

在 `3.2.0` 及之后版本中, Dubbo 的服务端引入新的配置 `prefer-serialization`，该特性可以通过协商的方式将整个系统的序列化协议平滑的升级到一个全新协议。

### 切换步骤

序列化协议升级，需要分两步走：

**1. 需要推动服务端的序列化协议升级，同时在服务端的暴露配置中需要添加 `prefer-serialization` 配置。**

比如：升级前的序列化协议是 hessian2，升级的目标序列化协议是 Fastjson2 那么在服务端的暴露配置中就应该添加如下所示的配置：

Spring Boot 应用 `application.properties` 配置文件中增加如下内容：

```properties
dubbo.provider.prefer-serialization=fastjson2,hessian2 #这里定义了新的协议协商顺序
dubbo.provider.serialization=hessian2 #这是之前的序列化协议
```

或者，如果使用 xml 配置的话：

```xml
<dubbo:provider serialization="hessian2" prefer-serialization="fastjson2,hessian2" />
```

**2. 客户端和服务端都需要增加新的序列化实现必要依赖**

如以上示例所示，需要确保消费端和提供端都增加 fastjson2 依赖：
```xml
<dependency>
  <groupId>com.alibaba.fastjson2</groupId>
  <artifactId>fastjson2</artifactId>
  <version>${fastjson2.version}</version>
</dependency>
```

{{% alert title="警告" color="warning" %}}
要使自动协商生效，需要确保：
* 消费者端、提供者端都是 3.2.x 及以上版本，否则配置不生效（继续使用老序列化协议）
* 消费者端、提供者端都加上了必须的序列化实现包依赖，否则不生效（继续使用老序列化协议，个别极端场景可能报错）。
{{% /alert %}}

### 实现原理

dubbo 客户端序列化协议是根据服务端的注册配置来选择的（即服务端的`serialization`配置）。在请求阶段 dubbo 会把客户端的序列化协议组装到请求头上，服务端在进行反序列化时会根据请求头来确定反序列化协议。所以，如果服务端和客户端的版本不一致就可能会出现客户端序列化不了的情况。

为了解决这个情况，`3.2.0` 在客户端序列化的时候会优先使用 `prefer-serialization` 配置的协议，如果不支持 `prefer-serialization` 相关的协议，才会使用 `serialization` 配置的协议。（可以把 `serialization` 理解为一个兜底的配置）


## 安全性

以上所有序列化方式中，protobuf 序列化具有最高的安全性，而对于其他序列化机制而言，我们要防止因为任意类序列化反序列化引发的 RCE 攻击。

### 类检查机制
Dubbo 中的类检查机制可以以类似黑白名单的形式来保证序列化安全。该机制保证服务提供方和服务消费方类之间的兼容性和安全，防止由于类版本不匹配、方法签名不兼容或缺少类而可能发生的潜在问题。

{{% alert title="注意" color="warning" %}}
* Dubbo >= 3.1.6 引入此检查机制，对用户透明。
* 目前序列化检查支持 Hessian2、Fastjson2 序列化以及泛化调用，其他的序列化方式暂不支持。
* **3.1 版本中默认为 `WARN` 告警级别，3.2 版本中默认为 `STRICT` 严格检查级别，如您遇到问题可通过以下指引降低检查级别。**
{{% /alert %}}


#### 检查模式
检查模式分为三个级别：`STRICT` 严格检查，`WARN` 告警，`DISABLE` 禁用。
`STRICT` 严格检查：禁止反序列化所有不在允许序列化列表（白名单）中的类。
`WARN` 告警：仅禁止序列化所有在不允许序列化列表中（黑名单）的类，同时在反序列化不在允许序列化列表（白名单）中类的时候通过日志进行告警。
`DISABLE` 禁用：不进行任何检查。

> 3.1 版本中默认为 `WARN` 告警级别，3.2 版本中默认为 `STRICT` 严格检查级别，如您遇到问题可通过以下指引降低检查级别。

通过 ApplicationConfig 配置：
```java
ApplicationConfig applicationConfig = new ApplicationConfig();
applicationConfig.setSerializeCheckStatus("STRICT");
```

通过 Spring XML 配置：
```xml
<dubbo:application name="demo-provider" serialize-check-status="STRICT"/>
```

通过 Spring Properties / dubbo.properties 配置：
```properties
dubbo.application.serialize-check-status=STRICT
```

通过 System Property 配置：
```properties
-Ddubbo.application.serialize-check-status=STRICT
```

配置成功后可以在日志中看到如下的提示：
```
INFO utils.SerializeSecurityManager:  [DUBBO] Serialize check level: STRICT
```

注：在同一个进程（Dubbo Framework Model）下的多个应用如果同时配置不同的检查模式，最终会生效“最宽松”的级别。如两个 Spring Context 同时启动，一个配置为 `STRICT`，另外一个配置为 `WARN`，则最终生效 `WARN` 级别的配置。

#### Serializable 接口检查

Serializable 接口检查模式分为两个级别：`true` 开启，`false` 关闭。开启检查后会拒绝反序列化所有未实现 `Serializable` 的类。

Dubbo 中默认配置为 `true` 开启检查。

通过 ApplicationConfig 配置：
```java
ApplicationConfig applicationConfig = new ApplicationConfig();
applicationConfig.setCheckSerializable(true);
```

通过 Spring XML 配置：
```xml
<dubbo:application name="demo-provider" check-serializable="true"/>
```

通过 Spring Properties / dubbo.properties 配置：
```properties
dubbo.application.check-serializable=true
```

通过 System Property 配置：
```properties
-Ddubbo.application.check-serializable=true
```

配置成功后可以在日志中看到如下的提示：
```
INFO utils.SerializeSecurityManager:  [DUBBO] Serialize check serializable: true
```

注 1：在同一个进程（Dubbo Framework Model）下的多个应用如果同时配置不同的 Serializable 接口检查模式，最终会生效“最宽松”的级别。如两个 Spring Context 同时启动，一个配置为 `true`，另外一个配置为 `false`，则最终生效 `false` 级别的配置。
注 2：目前暂未打通 Hessian2、Fastjson2 内置的 `Serializable` 检查配置。对于泛化调用，仅需要配置 `dubbo.application.check-serializable` 即可修改检查配置；对于 Hessian2 序列化，需要同时修改 `dubbo.application.check-serializable` 和 `dubbo.hessian.allowNonSerializable` 两个配置；对于 Fastjson2 序列化，目前暂不支持修改。

#### 自动扫描相关配置

Dubbo 类自动扫描机制共有两个配置项：`AutoTrustSerializeClass` 是否启用自动扫描和 `TrustSerializeClassLevel` 类信任层级。

简单来说，在开启类自动扫描之后，Dubbo 会通过 `ReferenceConfig` 和 `ServiceConfig` 自动扫描接口所有可能会用到的相关类，并且递归信任其所在的 package。 `TrustSerializeClassLevel` 类信任层级可以用来限制最终信任的 package 层级。如 `io.dubbo.test.pojo.User` 在 `TrustSerializeClassLevel` 配置为 `3` 的时候，最终会信任 `io.dubbo.test` 这个 package 下所有的类。

Dubbo 中默认配置 `AutoTrustSerializeClass` 为 `true` 启用扫描， `TrustSerializeClassLevel` 为 `3`。

通过 ApplicationConfig 配置：
```java
ApplicationConfig applicationConfig = new ApplicationConfig();
applicationConfig.setAutoTrustSerializeClass(true);
applicationConfig.setTrustSerializeClassLevel(3);
```

通过 Spring XML 配置：
```xml
<dubbo:application name="demo-provider" auto-trust-serialize-class="true" trust-serialize-class-level="3"/>
```

通过 Spring Properties / dubbo.properties 配置：
```properties
dubbo.application.auto-trust-serialize-class=true
dubbo.application.trust-serialize-class-level=3
```

通过 System Property 配置：
```properties
-Ddubbo.application.auto-trust-serialize-class=true
-Ddubbo.application.trust-serialize-class-level=3
```

配置成功后可以通过 QoS 命令检查当前已经加载的可信类结果是否符合预期。

注：开启检查之后在启动的过程中会有一定的性能损耗。

#### 可信/不可信类自定义配置

除了 Dubbo 自动扫描类之外，也支持通过资源文件的方式配置可信/不可信类列表。

配置方式：在资源目录（resource）下定义以下文件。

```properties
# security/serialize.allowlist
io.dubbo.test
```

```properties
# security/serialize.blockedlist
io.dubbo.block
```

配置成功以后可以在日志看到以下提示：
```properties
INFO utils.SerializeSecurityConfigurator:  [DUBBO] Read serialize allow list from file:/Users/albumen/code/dubbo-samples/99-integration/dubbo-samples-serialize-check/target/classes/security/serialize.allowlist
INFO utils.SerializeSecurityConfigurator:  [DUBBO] Read serialize blocked list from file:/Users/albumen/code/dubbo-samples/99-integration/dubbo-samples-serialize-check/target/classes/security/serialize.blockedlist
```

配置优先级为：用户自定义可信类 = 框架内置可信类 > 用户自定义不可信类 = 框架内置不可信类 > 自动类扫描可信类。

#### 审计方式

Dubbo 支持通过 QoS 命令实时查看当前的配置信息以及可信/不可信类列表。目前共支持两个命令：`serializeCheckStatus` 查看当前配置信息，`serializeWarnedClasses` 查看实时的告警列表。

1. `serializeCheckStatus` 查看当前配置信息

通过控制台直接访问：
```bash
> telnet 127.0.0.1 22222
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____
  / _ \ / / / // _ ) / _ ) / __ \
 / // // /_/ // _  |/ _  |/ /_/ /
/____/ \____//____//____/ \____/
dubbo>serializeCheckStatus
CheckStatus: WARN

CheckSerializable: true

AllowedPrefix:
...

DisAllowedPrefix:
...


dubbo>
```

通过 http 请求 json 格式结果：
```bash
> curl http://127.0.0.1:22222/serializeCheckStatus
{"checkStatus":"WARN","allowedPrefix":[...],"checkSerializable":true,"disAllowedPrefix":[...]}
```

2. `serializeWarnedClasses` 查看实时的告警列表

通过控制台直接访问：
```bash
> telnet 127.0.0.1 22222
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____
  / _ \ / / / // _ ) / _ ) / __ \
 / // // /_/ // _  |/ _  |/ /_/ /
/____/ \____//____//____/ \____/
dubbo>serializeWarnedClasses
WarnedClasses:
io.dubbo.test.NotSerializable
io.dubbo.test2.NotSerializable
io.dubbo.test2.OthersSerializable
org.apache.dubbo.samples.NotSerializable


dubbo>
```

通过 http 请求 json 格式结果：
```bash
> curl http://127.0.0.1:22222/serializeWarnedClasses
{"warnedClasses":["io.dubbo.test2.NotSerializable","org.apache.dubbo.samples.NotSerializable","io.dubbo.test.NotSerializable","io.dubbo.test2.OthersSerializable"]}
```

> 建议及时关注 `serializeWarnedClasses` 的结果，通过返回结果是否非空来判断是否受到攻击。
