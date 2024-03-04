---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/security/class-check/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/security/class-check/
description: 了解 Dubbo 类检查机制
linkTitle: 类检查机制
title: 类检查机制
type: docs
weight: 1
---
## 特性说明
该机制保证服务提供方和服务消费方类之间的兼容性和安全。

## 使用场景
防止由于类版本不匹配、方法签名不兼容或缺少类而可能发生的潜在问题。

## 使用方式

支持版本
Dubbo >= 3.1.6

适用范围
目前序列化检查支持 Hessian2、Fastjson2 序列化以及泛化调用。其他的序列化方式暂不支持。

### 检查模式
检查模式分为三个级别：`STRICT` 严格检查，`WARN` 告警，`DISABLE` 禁用。
`STRICT` 严格检查：禁止反序列化所有不在允许序列化列表（白名单）中的类。
`WARN` 告警：仅禁止序列化所有在不允许序列化列表中（黑名单）的类，同时在反序列化不在允许序列化列表（白名单）中类的时候通过日志进行告警。
`DISABLE` 禁用：不进行任何检查。

3.1 版本中默认为 `WARN` 告警级别，3.2 版本中默认为 `STRICT` 严格检查级别。

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

### Serializable 接口检查

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

### 自动扫描相关配置

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

### 可信/不可信类自定义配置

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

### 审计方式

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
