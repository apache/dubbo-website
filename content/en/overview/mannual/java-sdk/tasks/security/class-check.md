---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/security/class-check/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/security/class-check/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/security/class-check/
description: Understanding Dubbo's Class Check Mechanism
linkTitle: Class Check Mechanism
title: Class Check Mechanism
type: docs
weight: 1
---
## Feature Description
This mechanism ensures compatibility and security between service providers and consumers.

## Use Cases
To prevent potential issues due to class version mismatches, incompatible method signatures, or missing classes.

## Usage

Supported Versions
Dubbo >= 3.1.6

Applicable Scope
Currently, serialization checks support Hessian2, Fastjson2 serialization, and generic calls. Other serialization methods are not supported.

### Check Modes
The check mode has three levels: `STRICT`, `WARN`, `DISABLE`.
`STRICT`: Disallows deserialization of all classes not in the allowed serialization list (whitelist).
`WARN`: Only disallows serialization of classes in the disallowed serialization list (blacklist) and logs a warning when deserializing classes not in the allowed serialization list (whitelist).
`DISABLE`: No checks at all.

The default for version 3.1 is `WARN`, while for version 3.2, it is `STRICT`.

Configuration via ApplicationConfig:
```java
ApplicationConfig applicationConfig = new ApplicationConfig();
applicationConfig.setSerializeCheckStatus("STRICT");
```

Configuration via Spring XML:
```xml
<dubbo:application name="demo-provider" serialize-check-status="STRICT"/>
```

Configuration via Spring Properties / dubbo.properties:
```properties
dubbo.application.serialize-check-status=STRICT
```

Configuration via System Property:
```properties
-Ddubbo.application.serialize-check-status=STRICT
```

After successful configuration, the following log message can be seen:
```
INFO utils.SerializeSecurityManager:  [DUBBO] Serialize check level: STRICT
```

Note: If multiple applications in the same process (Dubbo Framework Model) have different check modes configured, the "loosest" level will take effect. For instance, if two Spring contexts are started, one set to `STRICT` and one to `WARN`, the `WARN` level configuration will take effect.

### Serializable Interface Checks

The Serializable interface check mode has two levels: `true` (enabled) and `false` (disabled). When enabled, it rejects deserialization of all classes that do not implement `Serializable`.

By default, Dubbo configures this as `true`.

Configuration via ApplicationConfig:
```java
ApplicationConfig applicationConfig = new ApplicationConfig();
applicationConfig.setCheckSerializable(true);
```

Configuration via Spring XML:
```xml
<dubbo:application name="demo-provider" check-serializable="true"/>
```

Configuration via Spring Properties / dubbo.properties:
```properties
dubbo.application.check-serializable=true
```

Configuration via System Property:
```properties
-Ddubbo.application.check-serializable=true
```

After successful configuration, the following log message can be seen:
```
INFO utils.SerializeSecurityManager:  [DUBBO] Serialize check serializable: true
```

Note 1: If multiple applications in the same process have different Serializable interface check modes, the "loosest" level will take effect. For example, if one is set to `true` and another to `false`, the `false` configuration will take effect.
Note 2: Currently, the built-in `Serializable` check configurations for Hessian2 and Fastjson2 are not connected. For generic calls, configuring `dubbo.application.check-serializable` is sufficient to modify the check configuration; for Hessian2 serialization, both `dubbo.application.check-serializable` and `dubbo.hessian.allowNonSerializable` need to be modified; for Fastjson2 serialization, modification is not currently supported.

### Auto-Scanning Configuration

Dubbo's automatic class scanning mechanism has two configuration items: `AutoTrustSerializeClass` for enabling automatic scanning and `TrustSerializeClassLevel` for class trust levels.

In simple terms, after enabling automatic class scanning, Dubbo will automatically scan all related classes used by interfaces through `ReferenceConfig` and `ServiceConfig`, recursively trusting their package. The `TrustSerializeClassLevel` can limit which package levels are ultimately trusted.

The default configuration sets `AutoTrustSerializeClass` to `true` and `TrustSerializeClassLevel` to `3`.

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

Configuration via Spring Properties / dubbo.properties:
```properties
dubbo.application.auto-trust-serialize-class=true
dubbo.application.trust-serialize-class-level=3
```

Configuration via System Property:
```properties
-Ddubbo.application.auto-trust-serialize-class=true
-Ddubbo.application.trust-serialize-class-level=3
```

After successful configuration, you can check the loaded trusted class results against expectations using QoS commands.

Note: There will be some performance overhead during startup after enabling checks.

### Custom Trusted/Untrusted Class Configuration

In addition to Dubbo’s automatic scanning, you can also configure trusted/untrusted class lists via resource files.

Configuration method: Define the following files in the resource directory.

```properties
# security/serialize.allowlist
io.dubbo.test
```

```properties
# security/serialize.blockedlist
io.dubbo.block
```

After successful configuration, the following log messages can be seen:
```properties
INFO utils.SerializeSecurityConfigurator:  [DUBBO] Read serialize allow list from file:/Users/albumen/code/dubbo-samples/99-integration/dubbo-samples-serialize-check/target/classes/security/serialize.allowlist
INFO utils.SerializeSecurityConfigurator:  [DUBBO] Read serialize blocked list from file:/Users/albumen/code/dubbo-samples/99-integration/dubbo-samples-serialize-check/target/classes/security/serialize.blockedlist
```

The configuration priority is as follows: User-defined trusted classes = Framework built-in trusted classes > User-defined untrusted classes = Framework built-in untrusted classes > Automatically scanned trusted classes.

### Audit Methods

Dubbo supports viewing current configuration information and trusted/untrusted class lists in real-time via QoS commands. Currently, there are two supported commands: `serializeCheckStatus` to view current configuration information, and `serializeWarnedClasses` to view the real-time warning list.

1. `serializeCheckStatus` to view current configuration information

Access via console:
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

Access via HTTP request for JSON format result:
```bash
> curl http://127.0.0.1:22222/serializeCheckStatus      
{"checkStatus":"WARN","allowedPrefix":[...],"checkSerializable":true,"disAllowedPrefix":[...]}
```

2. `serializeWarnedClasses` to view real-time warning list

Access via console:
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

Access via HTTP request for JSON format result:
```bash
> curl http://127.0.0.1:22222/serializeWarnedClasses
{"warnedClasses":["io.dubbo.test2.NotSerializable","org.apache.dubbo.samples.NotSerializable","io.dubbo.test.NotSerializable","io.dubbo.test2.OthersSerializable"]}
```

> It is advisable to pay attention to the results of `serializeWarnedClasses` in a timely manner to determine if an attack is occurring.

