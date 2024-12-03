---
title: "Log4j Vulnerability Impact"
linkTitle: "Log4j Vulnerability Impact"
description: "Log4j CVE-2021-44228 Vulnerability Impact"
aliases:
- /en/blog/1/01/01/security-vulnerabilities/
weight: 90
type: docs
---

Recently, the mainstream logging component [log4j2](https://logging.apache.org/log4j/2.x/) exposed a [security vulnerability CVE-2021-44228](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44228).

Below is a summary of the impact of vulnerability CVE-2021-44228 on the Apache Dubbo framework and user response guidelines.

## Dubbo Impact Range
**This vulnerability does not affect the security use of the Dubbo framework.**

Dubbo itself does not strongly depend on the log4j2 framework, nor does it bring log4j2 into the business project through dependencies. Therefore, users using Dubbo versions 2.7.x, 3.0.x, etc., do not need to forcibly upgrade the Dubbo version.

Below is the dependency analysis of various Dubbo components on log4j2, involving `dubbo-common`, `dubbo-spring-boot-starter`, `dubbo-spring-boot-actuator`:

* dubbo-common includes an optional dependency on `log4j-core`. Please check whether the project itself has enabled log4j dependencies. If enabled, upgrade accordingly.
```xml
[INFO] --- maven-dependency-plugin:3.1.2:tree (default-cli) @ dubbo-common ---
[INFO] org.apache.dubbo:dubbo-common:jar:2.7.14-SNAPSHOT
[INFO] +- org.apache.logging.log4j:log4j-api:jar:2.11.1:provided
[INFO] \- org.apache.logging.log4j:log4j-core:jar:2.11.1:provided

```

* dubbo-spring-boot-starter passes the log4j-api dependency through the spring-boot component. The log4j-api itself has no security issues. Pay attention to the compatibility with log4j-api when upgrading the log4j-core component.

```xml
[INFO] --- maven-dependency-plugin:3.1.2:tree (default-cli) @ dubbo-spring-boot-starter ---
[INFO] org.apache.dubbo:dubbo-spring-boot-starter:jar:2.7.14-SNAPSHOT
[INFO] \- org.springframework.boot:spring-boot-starter:jar:2.3.1.RELEASE:compile (optional) 
[INFO]    \- org.springframework.boot:spring-boot-starter-logging:jar:2.3.1.RELEASE:compile (optional) 
[INFO]       \- org.apache.logging.log4j:log4j-to-slf4j:jar:2.13.3:compile (optional) 
[INFO]          \- org.apache.logging.log4j:log4j-api:jar:2.13.3:compile (optional) 

```

* dubbo-spring-boot-actuator passes the log4j-api dependency through the spring-boot component. The log4j-api itself has no security issues. Pay attention to the compatibility with log4j-api when upgrading the log4j-core component.

```xml
[INFO] org.apache.dubbo:dubbo-spring-boot-actuator:jar:2.7.14-SNAPSHOT
[INFO] \- org.springframework.boot:spring-boot-starter-web:jar:2.3.1.RELEASE:compile (optional) 
[INFO]    \- org.springframework.boot:spring-boot-starter:jar:2.3.1.RELEASE:compile
[INFO]       \- org.springframework.boot:spring-boot-starter-logging:jar:2.3.1.RELEASE:compile
[INFO]          \- org.apache.logging.log4j:log4j-to-slf4j:jar:2.13.3:compile
[INFO]             \- org.apache.logging.log4j:log4j-api:jar:2.13.3:compile
```
