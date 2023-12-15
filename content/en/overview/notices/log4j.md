---
title: "Log4j vulnerability impact"
linkTitle: "Log4j vulnerability impact"
description: "Log4j CVE-2021-44228 vulnerability impact"
aliases:
- /zh-cn/blog/1/01/01/Security Vulnerability/
weight: 90
type: docs
---

Recently, the mainstream logging component [log4j2](https://logging.apache.org/log4j/2.x/) broke out [security vulnerability CVE-2021-44228](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44228).

The following is a summary of the impact of vulnerability CVE-2021-44228 on the Apache Dubbo framework and user response guidelines.

## Dubbo scope of influence

**This vulnerability has no impact on the security of Dubbo framework. **

Dubbo itself does not rely heavily on the log4j2 framework, nor does it bring log4j2 to business projects through dependency transfer. Therefore, users who are using Dubbo 2.7.x, 3.0.x and other versions do not need to be forced to upgrade the Dubbo version.

The following is an analysis of the dependence of Dubbo components on log4j2, involving `dubbo-common`, `dubbo-spring-boot-starter`, and `dubbo-spring-boot-actuator`:

* dubbo-common includes an optional dependency on `log4j-core`. Please check whether the log4j dependency is enabled in the project itself. If so, upgrade accordingly.
```xml
[INFO] --- maven-dependency-plugin:3.1.2:tree (default-cli) @dubbo-common ---
[INFO] org.apache.dubbo:dubbo-common:jar:2.7.14-SNAPSHOT
[INFO] +- org.apache.logging.log4j:log4j-api:jar:2.11.1:provided
[INFO] \- org.apache.logging.log4j:log4j-core:jar:2.11.1:provided

```

* dubbo-spring-boot-starter passes the log4j-api dependency through the spring-boot component. Log4j-api itself has no security issues. When upgrading the log4j-core component, pay attention to compatibility with log4j-api.

```xml
[INFO] --- maven-dependency-plugin:3.1.2:tree (default-cli) @dubbo-spring-boot-starter ---
[INFO] org.apache.dubbo:dubbo-spring-boot-starter:jar:2.7.14-SNAPSHOT
[INFO] \- org.springframework.boot:spring-boot-starter:jar:2.3.1.RELEASE:compile (optional)
[INFO] \- org.springframework.boot:spring-boot-starter-logging:jar:2.3.1.RELEASE:compile (optional)
[INFO] \- org.apache.logging.log4j:log4j-to-slf4j:jar:2.13.3:compile (optional)
[INFO] \- org.apache.logging.log4j:log4j-api:jar:2.13.3:compile (optional)

```

* dubbo-spring-boot-actuator passes the log4j-api dependency through the spring-boot component. Log4j-api itself has no security issues. When upgrading the log4j-core component, attention should be paid to compatibility with log4j-api

```xml
[INFO] org.apache.dubbo:dubbo-spring-boot-actuator:jar:2.7.14-SNAPSHOT
[INFO] \- org.springframework.boot:spring-boot-starter-web:jar:2.3.1.RELEASE:compile (optional)
[INFO] \- org.springframework.boot:spring-boot-starter:jar:2.3.1.RELEASE:compile
[INFO] \- org.springframework.boot:spring-boot-starter-logging:jar:2.3.1.RELEASE:compile
[INFO] \- org.apache.logging.log4j:log4j-to-slf4j:jar:2.13.3:compile
[INFO] \- org.apache.logging.log4j:log4j-api:jar:2.13.3:compile
```
