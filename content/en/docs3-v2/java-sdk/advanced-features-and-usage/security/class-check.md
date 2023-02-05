---
type: docs
title: "Dubbo Class Inspection Mechanism"
linkTitle: "Dubbo Class Inspection Mechanism"
weight: 1
description: "Understand the Dubbo class inspection mechanism"
---

## Supported versions

Dubbo >= 3.1.6

## Scope of application
Currently, the serialization check supports Hessian2, Fastjson2 serialization and generalized calls. Other serialization methods are not currently supported.

## configuration method

### 1. Check mode
The inspection mode is divided into three levels: `STRICT` strict inspection, `WARN` warning, `DISABLED` disabled.
`STRICT` Strict checks: disallow deserialization of all classes that are not in the allowed serialization list (whitelist).
`WARN` warning: only prohibits serialization of all classes in the disallowed serialization list (blacklist), and alerts through logs when deserializing classes that are not in the allowed serialization list (whitelist).
`DISABLED` Disabled: Do not do any checks.

Version 3.1 defaults to `WARN` warning level, and version 3.2 defaults to `STRICT` strict checking level.

Configuration via ApplicationConfig:
```java
ApplicationConfig applicationConfig = new ApplicationConfig();
applicationConfig.setSerializeCheckStatus("STRICT");
```

Configuration via Spring XML:
```xml
<dubbo:application name="demo-provider" serialize-check-status="STRICT"/>
```

Configure via Spring Properties / dubbo.properties:
```properties
dubbo.application.serialize-check-status=STRICT
```

Configure via System Property:
```properties
-Ddubbo.application.serialize-check-status=STRICT
```

After the configuration is successful, you can see the following prompts in the log:
```
INFO utils.SerializeSecurityManager: [DUBBO] Serialize check level: STRICT
```

Note: If multiple applications under the same process (Dubbo Framework Model) are configured with different inspection modes at the same time, the "loosenest" level will eventually take effect. If two Spring Contexts are started at the same time, one is configured as `STRICT` and the other is configured as `WARN`, the `WARN` level configuration will finally take effect.

### 2. Serializable interface check

The Serializable interface check mode is divided into two levels: `true` is enabled, and `false` is disabled. When the check is turned on, it will refuse to deserialize all classes that do not implement `Serializable`.

The default configuration in Dubbo is `true` to enable the check.

Configuration via ApplicationConfig:
```java
ApplicationConfig applicationConfig = new ApplicationConfig();
applicationConfig.setCheckSerializable(true);
```

Configuration via Spring XML:
```xml
<dubbo:application name="demo-provider" check-serializable="true"/>
```

Configure via Spring Properties / dubbo.properties:
```properties
dubbo.application.check-serializable=true
```

Configure via System Property:
```properties
-Ddubbo.application.check-serializable=true
```

After the configuration is successful, you can see the following prompts in the log:
```
INFO utils.SerializeSecurityManager: [DUBBO] Serialize check serializable: true
```

Note 1: If multiple applications under the same process (Dubbo Framework Model) are configured with different Serializable interface inspection modes at the same time, the "loosenest" level will eventually take effect. If two Spring Contexts are started at the same time, one configured as `true` and the other configured as `false`, the `false` level configuration will finally take effect.
Note 2: At present, the built-in `Serializable` check configuration of Hessian2 and Fastjson2 has not been opened. For generalized calls, you only need to configure `dubbo.application.check-serializable` to modify the check configuration; for Hessian2 serialization, you need to modify `dubbo.application.check-serializable` and `dubbo.hessian.allowNonSerializable` at the same time

### 3. Automatically scan related configurations

There are two configuration items in the Dubbo class automatic scanning mechanism: `AutoTrustSerializeClass

To put it simply, after automatic class scanning is enabled, Dubbo will automatically scan all related classes that may be used by the interface through `ReferenceConfig` and `ServiceConfig`, and recursively trust its package. `TrustSerializeClassLevel

The default configuration in Dubbo is `AutoTrustSerializeClass

Configuration via ApplicationConfig:
```java
ApplicationConfig applicationConfig = new ApplicationConfig();
applicationConfig.setAutoTrustSerializeClass(true);
applicationConfig.setTrustSerializeClassLevel(3);
```

Configuration via Spring XML:
```xml
<dubbo:application name="demo-provider" auto-trust-serialize-class="true" trust-serialize-class-level="3"/>
```

Configure via Spring Properties / dubbo.properties:
```properties
dubbo.application.auto-trust-serialize-class=true
dubbo.application.trust-serialize-class-level=3
```

Configure via System Property:
```properties
-Ddubbo.application.auto-trust-serialize-class=true
-Ddubbo.application.trust-serialize-class-level=3
```

After the configuration is successful, you can use the QoS command to check whether the results of the currently loaded trusted classes meet expectations.

Note: After the check is enabled, there will be a certain performance loss during the startup process.

### 4. Custom configuration of trusted/untrusted classes

In addition to Dubbo's automatic scanning classes, it also supports configuration of trusted/untrusted class lists through resource files.

Configuration method: define the following files under the resource directory (resource).

```properties
# security/serialize.allowlist
io.dubbo.test
```

```properties
# security/serialize.blockedlist
io.dubbo.block
```

After the configuration is successful, you can see the following prompts in the log:
```properties
INFO utils.SerializeSecurityConfigurator: [DUBBO] Read serialize allow list from file:/Users/albumen/code/dubbo-samples/99-integration/dubbo-samples-serialize-check/target/classes/security/serialize.allowlist
INFO utils.SerializeSecurityConfigurator: [DUBBO] Read serialize blocked list from file:/Users/albumen/code/dubbo-samples/99-integration/dubbo-samples-serialize-check/target/classes/security/serialize.blockedlist
```

The configuration priority is: user-defined trusted class = built-in trusted class of the framework > user-defined untrusted class = built-in untrusted class of the framework > automatic class scanning trusted class.

## Audit method

Dubbo supports real-time viewing of current configuration information and trusted/untrusted class lists through QoS commands. Currently supports two commands: `serializeCheckStatus` to view the current configuration information, `serializeWarnedClasses` to view the real-time alarm list.

1. `serializeCheckStatus` View the current configuration information

Access directly through the console:
```bash
> telnet 127.0.0.1 22222
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___ __ __ ___ ___ ____
  / _ \ / / / // _ ) / _ ) / __ \
 / // // /_/ // _ |/ _ |/ /_/ /
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

Request the result in json format via http:
```bash
> curl http://127.0.0.1:22222/serializeCheckStatus
{"checkStatus": "WARN","allowedPrefix":[...],"checkSerializable":true,"disAllowedPrefix":[...]}
```

2. `serializeWarnedClasses` view real-time warning list

Access directly through the console:
```bash
> telnet 127.0.0.1 22222
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___ __ __ ___ ___ ____
  / _ \ / / / // _ ) / _ ) / __ \
 / // // /_/ // _ |/ _ |/ /_/ /
/____/ \____//____//____/ \____/
dubbo>serializeWarnedClasses
Warned Classes:
io.dubbo.test.NotSerializable
io.dubbo.test2.NotSerializable
io.dubbo.test2.OthersSerializable
org.apache.dubbo.samples.NotSerializable


dubbo>
```

Request the result in json format via http:
```bash
> curl http://127.0.0.1:22222/serializeWarnedClasses
{"warnedClasses":["io.dubbo.test2.NotSerializable","org.apache.dubbo.samples.NotSerializable","io.dubbo.test.NotSerializable","io.dubbo.test2.OthersSerializable"]}
```

Note: It is recommended to pay attention to the result of `serializeWarnedClasses` in time, and judge whether it is attacked by whether the returned result is not empty.