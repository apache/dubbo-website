---
title: "Serialization Protocol Security"
linkTitle: "Serialization Protocol Security"
weight: 1
tags: ["Security Vulnerabilities"]
description: "Safer use of serialization protocols in Dubbo"
---

Dubbo 3 has enhanced the security aspects of serialization protocols and recommends using the Triple protocol in non-Wrapper mode. This protocol is secure by default but requires developers to write IDL files.

In the Triple protocol's Wrapper mode, compatibility with other serialization data is allowed, offering good compatibility. However, other protocols may have deserialization security flaws. For the Hessian2 protocol, users who require high-security attributes should enable whitelist mode according to the sample code. The framework will enable blacklist mode by default to block malicious calls.

Using other serialization protocols is not recommended. When an attacker can access the Provider interface, security flaws in other serialization protocols may lead to command execution through the Provider interface.

If you must use other serialization protocols and wish to maintain some level of security, you should enable the Token authentication mechanism. This will prevent threats to the Provider's security from unauthenticated and untrusted request sources. When enabling Token authentication, you should also enable the authentication feature in the registry.

## Notice
The following serializations are proved that not safe enough to transfer on network and not recommend to use.
- native-hessian
- native-java (Java ObjectOutputStream and ObjectInputStream)
