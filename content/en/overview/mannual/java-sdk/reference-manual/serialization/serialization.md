---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/serialization/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/serialization/
description: Using efficient Java serialization (Kryo and FST) in Dubbo
linkTitle: Serialization Overview
title: Introduction to Dubbo Serialization Mechanism
type: docs
weight: 1
---

## Supported Protocol List
The following is the list of serialization protocols supported by the Dubbo framework, classified by `triple` and `dubbo` RPC communication protocols.

| <span style="display:inline-block;width:100px">RPC Protocol</span> | <span style="display:inline-block;width:100px">Programming Mode</span> | <span style="display:inline-block;width:100px">Serialization Protocol</span> | <span style="display:inline-block;width:200px">Configuration Method</span> | JDK Version | Description |
| --- | --- | --- | --- | --- | --- |
| **triple** | IDL | protobuf,<br/>protobuf-json | Default | 8, 17, 21 | Default serialization method when using IDL, clients can also choose protobuf-json for serialization communication without additional configuration |
|  | Java Interface | protobuf-wrapper | serialization="hessian" | 8, 17, 21 | This mode adopts a double serialization mode, where data is first serialized by hessian and then by protobuf.<br/><br/>Supports a calling model equivalent to IDL, which is easy to use but with slightly reduced performance |
| **dubbo** | Java Interface | hessian | Default, serialization="hessian" | 8, 17, 21 | The default serialization method for the dubbo protocol, featuring good compatibility, high performance, and cross-language advantages (java, go, c/c++, php, python, .net) |
|  | Java Interface | protostuff | serialization="protostuff" | 8 | A Java serialization library with built-in support for forward-backward compatibility (schema evolution) and validation. |
|  | Java Interface | gson | serialization="gson" | 8, 17, 21 | A JSON serialization library released by Google |
|  | Java Interface | avro | serialization="avro" | 8, 17, 21 | A high-performance serialization library for Java |
|  | Java Interface | msgpack | serialization="msgpack" | 8, 17, 21 | Offers good compatibility and multi-language implementations (Java, C/C++, Python, etc.) |
|  | Java Interface | kryo | serialization="kryo" | 8, 17, 21 | Kryo is a very mature serialization implementation, widely used in Twitter, Groupon, Yahoo, and many prominent open-source projects (like Hive, Storm). |
|  | Java Interface | fastjson2 | serialization="fastjson2" | 8, 17, 21 | fastjson |
|  | Java Interface | More extensions|  |  | [dubbo-spi-extensions](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-serialization-extensions) |

## Performance Comparison Report

Serialization plays a crucial role in response speed, throughput, and network bandwidth consumption for remote calls, making it one of the key factors in improving the performance of distributed systems.

For specifics, please refer to the [Reference Manual - Performance Benchmark Report](/en/overview/mannual/java-sdk/reference-manual/performance/) .

## Switching Serialization Protocols

{{% alert title="Note" color="info" %}}
The typical scenario applicable for this document is long-time Dubbo users: users who have had many systems running on Dubbo for years and need to upgrade the serialization used for various scenarios to a new serialization protocol.
{{% /alert %}}

In version `3.2.0` and later, Dubbo's server introduces a new configuration `prefer-serialization`, allowing a smooth upgrade of the entire system's serialization protocol to a new one through negotiation.

### Switching Steps

The upgrade of serialization protocols involves two steps:

**1. The server's serialization protocol needs to be updated, and the `prefer-serialization` configuration must be added to the server's exposure configuration.**

For example, if the previous serialization protocol was hessian2 and the target serialization protocol is Fastjson2, the server's exposure configuration should include:

Add the following contents to the Spring Boot application’s `application.properties` configuration file:

```properties
dubbo.provider.prefer-serialization=fastjson2,hessian2 # Here we define the new protocol negotiation order
dubbo.provider.serialization=hessian2 # This is the previous serialization protocol
```

Or, if using XML configuration:
```xml
<dubbo:provider serialization="hessian2" prefer-serialization="fastjson2,hessian2" />
```

**2. Both the client and server need to add the necessary dependencies for the new serialization implementation.**

As shown in the above example, ensure the consumer and provider both add the fastjson2 dependency:
```xml
<dependency>
  <groupId>com.alibaba.fastjson2</groupId>
  <artifactId>fastjson2</artifactId>
  <version>${fastjson2.version}</version>
</dependency>
```

{{% alert title="Warning" color="warning" %}}
For automatic negotiation to take effect, ensure that:
* Both consumer and provider are version 3.2.x or higher, or else the configuration will be ineffective (and continue using the old serialization protocol)
* Both consumer and provider include necessary serialization implementation package dependencies, otherwise it won't work (will continue using the old serialization protocol, and may throw errors in extreme scenarios).
{{% /alert %}}

### Implementation Principle

The serialization protocol for the Dubbo client is chosen based on the registration configuration of the server (i.e., the server's `serialization` configuration). During the request phase, Dubbo assembles the client serialization protocol into the request header, and the server determines the deserialization protocol based on the request header. Therefore, mismatched versions between the server and client may lead to serialization issues on the client side.

To solve this situation, version `3.2.0` will prioritize the protocols specified in the `prefer-serialization` configuration during client serialization; if the `prefer-serialization` protocols are not supported, it will then use the protocols specified in the `serialization` configuration. (You can think of `serialization` as a fallback configuration)

## Security

Among all the serialization methods mentioned above, protobuf serialization has the highest security. For other serialization mechanisms, we need to prevent RCE attacks caused by arbitrary class serialization and deserialization.

### Class Checking Mechanism
The class checking mechanism in Dubbo can ensure serialization security in a way similar to black-and-white lists. This mechanism guarantees compatibility and security between classes on the service provider and the service consumer, preventing potential issues that may arise from version mismatches, incompatible method signatures, or missing classes.

{{% alert title="Note" color="warning" %}}
* Dubbo >= 3.1.6 introduced this checking mechanism, which is transparent to the user.
* Currently, the serialization checks support Hessian2, Fastjson2 serialization, and generic calls; other serialization methods are not yet supported.
* **In version 3.1, the default is `WARN` alert level; in version 3.2, the default is `STRICT` check level. If you encounter issues, you can lower the check level using the guide below.**
{{% /alert %}}

#### Check Modes
Check modes are divided into three levels: `STRICT`, `WARN`, and `DISABLE`.
`STRICT`: Prohibit deserialization of all classes not in the allowed serialization list (whitelist).
`WARN`: Only prohibit serialization of classes in the disallowed serialization list (blacklist), while logging warnings for deserializing classes not in the allowed serialization list.
`DISABLE`: No checks are performed.

> In version 3.1, the default is `WARN`, while in version 3.2, the default is `STRICT`. If you encounter issues, you can lower the check level using the following guides.

Via ApplicationConfig:
```java
ApplicationConfig applicationConfig = new ApplicationConfig();
applicationConfig.setSerializeCheckStatus("STRICT");
```

Via Spring XML configuration:
```xml
<dubbo:application name="demo-provider" serialize-check-status="STRICT"/>
```

Via Spring Properties / dubbo.properties configuration:
```properties
dubbo.application.serialize-check-status=STRICT
```

Via System Property configuration:
```properties
-Ddubbo.application.serialize-check-status=STRICT
```

After successful configuration, you can see the following prompt in the logs:
```
INFO utils.SerializeSecurityManager:  [DUBBO] Serialize check level: STRICT
```

Note: If multiple applications in the same process (Dubbo Framework Model) configure different check modes, the "most lenient" level will take effect. For example, if two Spring Contexts are started simultaneously, with one configured as `STRICT` and the other as `WARN`, the effective configuration will be `WARN`.

#### Serializable Interface Check

The Serializable interface check mode has two levels: `true` (enabled) and `false` (disabled). When enabled, it will reject deserializing all classes that do not implement `Serializable`.

The default configuration in Dubbo is `true` to enable checks.

Via ApplicationConfig:
```java
ApplicationConfig applicationConfig = new ApplicationConfig();
applicationConfig.setCheckSerializable(true);
```

Via Spring XML configuration:
```xml
<dubbo:application name="demo-provider" check-serializable="true"/>
```

Via Spring Properties / dubbo.properties configuration:
```properties
dubbo.application.check-serializable=true
```

Via System Property configuration:
```properties
-Ddubbo.application.check-serializable=true
```

After successful configuration, you can see the following prompt in the logs:
```
INFO utils.SerializeSecurityManager:  [DUBBO] Serialize check serializable: true
```

Note 1: If multiple applications in the same process (Dubbo Framework Model) configure different Serializable interface check modes, the "most lenient" level will take effect. For example, if two Spring Contexts are started simultaneously, with one configured as `true` and the other as `false`, the effective configuration will be `false`.
Note 2: Currently, the built-in `Serializable` check configuration for Hessian2 and Fastjson2 has not been integrated. For generic calls, only modifying `dubbo.application.check-serializable` is necessary; for Hessian2 serialization, both `dubbo.application.check-serializable` and `dubbo.hessian.allowNonSerializable` need to be modified; for Fastjson2 serialization, modification is currently unsupported.

#### Auto-Scanning Related Configuration

The Dubbo class auto-scanning mechanism has two configuration items: `AutoTrustSerializeClass` whether to enable auto-scanning and `TrustSerializeClassLevel` class trust level.

Simply put, after enabling class auto-scanning, Dubbo will automatically scan all related classes that may be used through `ReferenceConfig` and `ServiceConfig`, recursively trusting their respective packages. The `TrustSerializeClassLevel` can be used to limit the final trusted package level. For example, if `io.dubbo.test.pojo.User` has its `TrustSerializeClassLevel` configured to `3`, it will trust all classes under the `io.dubbo.test` package.

The default configuration in Dubbo has `AutoTrustSerializeClass` set to `true` to enable scanning, and `TrustSerializeClassLevel` set to `3`.

Via ApplicationConfig:
```java
ApplicationConfig applicationConfig = new ApplicationConfig();
applicationConfig.setAutoTrustSerializeClass(true);
applicationConfig.setTrustSerializeClassLevel(3);
```

Via Spring XML configuration:
```xml
<dubbo:application name="demo-provider" auto-trust-serialize-class="true" trust-serialize-class-level="3"/>
```

Via Spring Properties / dubbo.properties configuration:
```properties
dubbo.application.auto-trust-serialize-class=true
dubbo.application.trust-serialize-class-level=3
```

Via System Property configuration:
```properties
-Ddubbo.application.auto-trust-serialize-class=true
-Ddubbo.application.trust-serialize-class-level=3
```

After successful configuration, you can check whether the current loaded trusted class results meet expectations using QoS commands.

Note: Enabling checks will incur some performance overhead during startup.

#### Custom Configuration for Trusted/Untrusted Classes

In addition to Dubbo's auto-scanned classes, configuration of trusted/untrusted class lists is also supported via resource files.

Configuration method: define the following files in the resource directory.

```properties
# security/serialize.allowlist
io.dubbo.test
```

```properties
# security/serialize.blockedlist
io.dubbo.block
```

After successful configuration, you will see the following prompt in the logs:
```properties
INFO utils.SerializeSecurityConfigurator:  [DUBBO] Read serialize allow list from file:/Users/albumen/code/dubbo-samples/99-integration/dubbo-samples-serialize-check/target/classes/security/serialize.allowlist
INFO utils.SerializeSecurityConfigurator:  [DUBBO] Read serialize blocked list from file:/Users/albumen/code/dubbo-samples/99-integration/dubbo-samples-serialize-check/target/classes/security/serialize.blockedlist
```

The configuration priority is: user-defined trusted classes = framework-built trusted classes > user-defined untrusted classes = framework-built untrusted classes > automatically scanned trusted classes.

#### Audit Method

Dubbo supports real-time viewing of current configuration information and trusted/untrusted class lists through QoS commands. Currently, two commands are supported: `serializeCheckStatus` to view current configuration information, and `serializeWarnedClasses` to view the real-time warning list.

1. `serializeCheckStatus` to view current configuration information

Access directly through the console:
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

Access via HTTP request for JSON format results:
```bash
> curl http://127.0.0.1:22222/serializeCheckStatus
{"checkStatus":"WARN","allowedPrefix":[...],"checkSerializable":true,"disAllowedPrefix":[...]}
```

2. `serializeWarnedClasses` to view the real-time warning list

Access directly through the console:
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

Access via HTTP request for JSON format results:
```bash
> curl http://127.0.0.1:22222/serializeWarnedClasses
{"warnedClasses":["io.dubbo.test2.NotSerializable","org.apache.dubbo.samples.NotSerializable","io.dubbo.test.NotSerializable","io.dubbo.test2.OthersSerializable"]}
```

> It is recommended to promptly monitor the results of `serializeWarnedClasses` to determine if an attack is occurring.

