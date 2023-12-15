---
title: "Serialization Security"
linkTitle: "Serialization Security"
weight: 1
aliases:
  - /zh-cn/blog/1/01/01/Serialization Protocol Security/
description: "Use serialization protocol more safely in Dubbo"
type: docs
---

# Overview

Dubbo supports the extension of serialization protocols. In theory, users can enable any serialization protocol based on this extension mechanism. This brings great flexibility, but at the same time, users must be aware of the hidden security risks.
Data deserialization is the link most easily exploited by attackers, who use it to perform RCE attacks to steal or destroy server-side data.
Before switching serialization protocols or implementations, users should fully investigate the security guarantees of the target serialization protocol and its framework implementation, and set up corresponding security measures in advance (such as setting up a black/white list).
The Dubbo framework itself cannot directly guarantee the security of the target serialization mechanism.

The serialization protocols provided by the official version of Dubbo 2.7 are as follows:
* Hessian2
* Fastjson
* Kryo
* FST
* JDK
* Protostuff
* Protocol Buffers
* Avro
* Gson

Starting from Dubbo 3.0, only the following serialization protocol support is provided by default:
* Hessian2
* JDK
* Protocol Buffers

Starting from Dubbo 3.2, the following serialization protocol support is provided by default:
* Hessian2
* Fastjson2
* JDK
* Protocol Buffers

For security reasons, starting from Dubbo 3.3, only the following serialization protocols will be supported by default:
* Hessian2
* Fastjson2
* Protocol Buffers

For the above serialization extensions, after discovering or receiving relevant vulnerability reports, Dubbo officials will follow up and upgrade dependencies to the latest security version, but the final vulnerability fix depends on the serialization framework implementation.

> For users using the [dubbo hessian2](https://github.com/apache/dubbo-hessian-lite/releases) version, Dubbo officials will ensure the security of the hessian2 serialization mechanism and fix reported security vulnerabilities as much as possible

In addition, starting from Dubbo version 3.2, the whitelist mechanism is adopted by default for Hessian2 and Fastjson2. If you find that some data processing has been removed, you can refer to [Document](/zh-cn/overview/mannual/java-sdk/advanced-features- and-usage/security/class-check/) to configure.

# Full reinforcement

In order to improve the security of application serialization as much as possible, Dubbo 3.0 has upgraded and strengthened the security of the serialization protocol. It is recommended to use the non-Wrapper mode of the Tripe protocol.
This protocol is secure by default, but requires developers to write IDL files.

Triple protocol Wrapper mode allows compatibility with other serialized data, providing good compatibility. However, other protocols may have deserialization security flaws. For the Hessian2 protocol, users with high security attributes should follow the sample code instructions to turn on the whitelist mode. The framework will turn on the blacklist mode by default to intercept malicious calls.

If other serialization protocols must be used, a certain degree of security is expected. The Token authentication mechanism should be enabled to prevent unauthenticated and untrusted request sources from threatening Provider security. When turning on the Token authentication mechanism, the authentication function of the registration center should be turned on simultaneously.

[Reinforcement reference](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/security/)
