
---
title: "安全漏洞"
linkTitle: "安全漏洞"
description: "安全漏洞说明"
tags: ["安全漏洞"]
weight: 90
---

## 1. Log4j CVE-2021-44228 漏洞

最近，主流日志组件 [log4j2](https://logging.apache.org/log4j/2.x/) 爆出[安全漏洞 CVE-2021-44228](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44228)。

以下是漏洞 CVE-2021-44228 对 Apache Dubbo 框架的影响总结及用户应对指南。

## Dubbo 影响范围
**该漏洞对 Dubbo 框架使用安全并无影响。**

Dubbo 本身不强依赖 log4j2 框架，也不会通过依赖传递将 log4j2 带到业务工程中去，因此，正在使用 Dubbo 2.7.x、3.0.x 等版本的用户均无需强制升级 Dubbo 版本。

以下是 Dubbo 各组件对 log4j2 的依赖分析，涉及 `dubbo-common`、`dubbo-spring-boot-starter`、`dubbo-spring-boot-actuator`：

* dubbo-common 包含对 `log4j-core` 的可选依赖，请检查项目自身是否启用了 log4j 依赖，如启用则对应升级即可。
```xml
[INFO] --- maven-dependency-plugin:3.1.2:tree (default-cli) @ dubbo-common ---
[INFO] org.apache.dubbo:dubbo-common:jar:2.7.14-SNAPSHOT
[INFO] +- org.apache.logging.log4j:log4j-api:jar:2.11.1:provided
[INFO] \- org.apache.logging.log4j:log4j-core:jar:2.11.1:provided

```

* dubbo-spring-boot-starter 通过 spring-boot 组件传递了 log4j-api 依赖，log4j-api 本身并无安全问题，升级 log4j-core 组件时注意与 log4j-api 的兼容性

```xml
[INFO] --- maven-dependency-plugin:3.1.2:tree (default-cli) @ dubbo-spring-boot-starter ---
[INFO] org.apache.dubbo:dubbo-spring-boot-starter:jar:2.7.14-SNAPSHOT
[INFO] \- org.springframework.boot:spring-boot-starter:jar:2.3.1.RELEASE:compile (optional) 
[INFO]    \- org.springframework.boot:spring-boot-starter-logging:jar:2.3.1.RELEASE:compile (optional) 
[INFO]       \- org.apache.logging.log4j:log4j-to-slf4j:jar:2.13.3:compile (optional) 
[INFO]          \- org.apache.logging.log4j:log4j-api:jar:2.13.3:compile (optional) 

```

* dubbo-spring-boot-actuator 通过 spring-boot 组件传递了 log4j-api 依赖，log4j-api 本身并无安全问题，升级 log4j-core 组件时应注意与 log4j-api 的兼容性

```xml
[INFO] org.apache.dubbo:dubbo-spring-boot-actuator:jar:2.7.14-SNAPSHOT
[INFO] \- org.springframework.boot:spring-boot-starter-web:jar:2.3.1.RELEASE:compile (optional) 
[INFO]    \- org.springframework.boot:spring-boot-starter:jar:2.3.1.RELEASE:compile
[INFO]       \- org.springframework.boot:spring-boot-starter-logging:jar:2.3.1.RELEASE:compile
[INFO]          \- org.apache.logging.log4j:log4j-to-slf4j:jar:2.13.3:compile
[INFO]             \- org.apache.logging.log4j:log4j-api:jar:2.13.3:compile
```


## 2. 序列化
Dubbo 支持序列化协议的扩展，理论上用户可以基于该扩展机制启用任意的序列化协议，这带来了极大的灵活的，但同时也要意识到其中潜藏的安全性风险。
数据反序列化是最容易被被攻击者利用的一个环节，攻击者利用它执行 RCE 攻击等窃取或破坏服务端数据，用户在切换序列化协议或实现前，
应充分调研目标序列化协议及其框架实现的安全性保障，并提前设置相应的安全措施（如设置黑/白名单）。Dubbo 框架自身并不能保证目标序列化机制的安全性。

Dubbo 2.7 官方版本提供的序列化协议有如下几种：
* Hessian2
* Fastjson
* Kryo
* FST
* JDK
* Protostuff/Protobuf
* Avro
* Gson

针对以上序列化扩展，在发现或收到相关的漏洞报告之后，Dubbo 官方会跟进并升级依赖到最新的安全版本，但最终的漏洞修复方案取决于序列化的框架实现。

> 针对使用 [dubbo hessian2](https://github.com/apache/dubbo-hessian-lite/releases) 版本的用户，Dubbo 官方会保证hessian2序列化机制的安全性并尽可能的修复上报的安全漏洞
