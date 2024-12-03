---
title: "Serialization Security"
linkTitle: "Serialization Security"
weight: 1
type: docs
description: "Using Serialization Protocols More Securely in Dubbo"
---

# Overview

Dubbo supports serialization protocol extensions, allowing users to enable any serialization protocol based on this mechanism theoretically. This brings great flexibility but also potential security risks. Data deserialization is the most susceptible to attacker exploitation, allowing them to execute RCE attacks, steal or damage server-side data. Before switching or implementing a serialization protocol, users should thoroughly research the security guarantees of the target protocol and its implementation and set up appropriate security measures (e.g., black/whitelists) in advance. Dubbo cannot directly ensure the security of the target serialization mechanism.

Dubbo 2.7 officially supports the following serialization protocols:
* Hessian2
* Fastjson
* Kryo
* FST
* JDK
* Protostuff
* Protocol Buffers
* Avro
* Gson

From Dubbo 3.0, the default supported serialization protocols are:
* Hessian2
* JDK
* Protocol Buffers

From Dubbo 3.2, the default supported serialization protocols are:
* Hessian2
* Fastjson2
* JDK
* Protocol Buffers

For security reasons, from Dubbo 3.3, the default supported serialization protocols are:
* Hessian2
* Fastjson2
* Protocol Buffers

For the above serialization extensions, Dubbo will follow up and update dependencies to the latest secure versions upon discovering or receiving reports of vulnerabilities. However, the final solution to vulnerabilities depends on the serialization framework implementation.

> For users of [dubbo hessian2](https://github.com/apache/dubbo-hessian-lite/releases) version, Dubbo ensures the security of the Hessian2 serialization mechanism and strives to fix reported security vulnerabilities.

Additionally, from Dubbo 3.2, Hessian2 and Fastjson2 utilize a default whitelist mechanism. If you find certain data processing removed, refer to [documentation](/en/overview/mannual/java-sdk/advanced-features-and-usage/security/class-check/) for configuration.

# Comprehensive Reinforcement

To enhance the security of application serialization as much as possible, Dubbo 3.0 upgrades the serialization protocol security and recommends using the Triple protocol in non-Wrapper mode. This protocol is secure by default but requires developers to write IDL files.

In Triple protocol Wrapper mode, compatibility with other serialized data is allowed, offering good compatibility. However, other protocols may have deserialization security flaws. High-security property users should enable whitelist mode for the Hessian2 protocol following the sample code instructions, while the framework defaults to blacklist mode to intercept malicious calls.

If other serialization protocols must be used, and some security is desired, the Token authentication mechanism should be enabled to prevent unauthenticated, untrusted request sources from threatening the Provider's security. When enabling Token authentication, the authentication function of the registry should be enabled simultaneously.

[Reinforcement Reference](/en/overview/mannual/java-sdk/advanced-features-and-usage/security/)

