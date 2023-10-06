---
title: "Security Vulnerabilities"
linkTitle: "Security Vulnerabilities"
description: "Description of Security Vulnerabilities"
tags: ["Security Vulnerabilities"]
weight: 90
---

## 1. Log4j CVE-2021-44228 Vulnerability

Recently, the mainstream logging component [log4j2](https://logging.apache.org/log4j/2.x/) has disclosed a [security vulnerability CVE-2021-44228](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44228).

Below is a summary of the impact of CVE-2021-44228 on the Apache Dubbo framework, as well as guidelines for users.

## Dubbo Impact Scope
**This vulnerability has no impact on the security of the Dubbo framework.**

Dubbo itself does not strongly depend on the log4j2 framework and will not transitively bring log4j2 into business projects. Therefore, users who are using Dubbo versions 2.7.x, 3.0.x, etc., do not need to forcibly upgrade their Dubbo version.

Here is an analysis of the dependency of various Dubbo components on log4j2, including `dubbo-common`, `dubbo-spring-boot-starter`, and `dubbo-spring-boot-actuator`:

* `dubbo-common` contains an optional dependency on `log4j-core`. Please check whether the project itself has enabled the log4j dependency. If enabled, upgrade accordingly.
```xml
[INFO] --- maven-dependency-plugin:3.1.2:tree (default-cli) @ dubbo-common ---
[INFO] org.apache.dubbo:dubbo-common:jar:2.7.14-SNAPSHOT
[INFO] +- org.apache.logging.log4j:log4j-api:jar:2.11.1:provided
[INFO] \- org.apache.logging.log4j:log4j-core:jar:2.11.1:provided

```
* dubbo-spring-boot-starter transitively brings in log4j-api dependency through the spring-boot component. log4j-api itself has no security issues. Pay attention to compatibility with log4j-api when upgrading log4j-core.


```xml
[INFO] --- maven-dependency-plugin:3.1.2:tree (default-cli) @ dubbo-spring-boot-starter ---
[INFO] org.apache.dubbo:dubbo-spring-boot-starter:jar:2.7.14-SNAPSHOT
[INFO] \- org.springframework.boot:spring-boot-starter:jar:2.3.1.RELEASE:compile (optional) 
[INFO]    \- org.springframework.boot:spring-boot-starter-logging:jar:2.3.1.RELEASE:compile (optional) 
[INFO]       \- org.apache.logging.log4j:log4j-to-slf4j:jar:2.13.3:compile (optional) 
[INFO]          \- org.apache.logging.log4j:log4j-api:jar:2.13.3:compile (optional) 

```

* dubbo-spring-boot-actuator also brings in log4j-api dependency through the spring-boot component. log4j-api itself has no security issues. Pay attention to compatibility with log4j-api when upgrading log4j-core.

```xml
[INFO] org.apache.dubbo:dubbo-spring-boot-actuator:jar:2.7.14-SNAPSHOT
[INFO] \- org.springframework.boot:spring-boot-starter-web:jar:2.3.1.RELEASE:compile (optional) 
[INFO]    \- org.springframework.boot:spring-boot-starter:jar:2.3.1.RELEASE:compile
[INFO]       \- org.springframework.boot:spring-boot-starter-logging:jar:2.3.1.RELEASE:compile
[INFO]          \- org.apache.logging.log4j:log4j-to-slf4j:jar:2.13.3:compile
[INFO]             \- org.apache.logging.log4j:log4j-api:jar:2.13.3:compile
```

## 2. Serialization
Dubbo supports the extension of serialization protocols. Theoretically, users can enable any serialization protocol based on this extension mechanism. This brings great flexibility, but also exposes potential security risks.
Data deserialization is the most vulnerable link that attackers can exploit, such as executing RCE attacks to steal or destroy server-side data. Before switching serialization protocols or implementations, users should fully investigate the security guarantees of the target serialization protocol and framework, and set corresponding security measures (such as black/white lists) in advance. Dubbo itself cannot guarantee the security of the target serialization mechanism.

Dubbo 2.7 official version provides the following serialization protocols:

* Hessian2
* Fastjson
* Kryo
* FST
* JDK
* Protostuff/Protobuf
* Avro
* Gson

For the above serialization extensions, after discovering or receiving related vulnerability reports, the Dubbo official team will follow up and upgrade the dependencies to the latest secure versions. However, the final vulnerability remediation solution depends on the framework implementation of the serialization.

> For users using [dubbo hessian2](https://github.com/apache/dubbo-hessian-lite/releases), the Dubbo official team will ensure the security of the hessian2 serialization mechanism and fix reported security vulnerabilities as much as possible.