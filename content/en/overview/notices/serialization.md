---
title: "序列化安全"
linkTitle: "序列化安全"
weight: 1
type: docs
aliases:
  - /zh-cn/blog/1/01/01/序列化协议安全/
description: "在 Dubbo 中更安全的使用序列化协议"
---

# 概述

Dubbo 支持序列化协议的扩展，理论上用户可以基于该扩展机制启用任意的序列化协议，这带来了极大的灵活的，但同时也要意识到其中潜藏的安全性风险。
数据反序列化是最容易被被攻击者利用的一个环节，攻击者利用它执行 RCE 攻击等窃取或破坏服务端数据。
用户在切换序列化协议或实现前， 应充分调研目标序列化协议及其框架实现的安全性保障，并提前设置相应的安全措施（如设置黑/白名单）。
Dubbo 框架自身并不能直接保证目标序列化机制的安全性。

Dubbo 2.7 官方版本提供的序列化协议有如下几种：
* Hessian2
* Fastjson
* Kryo
* FST
* JDK
* Protostuff
* Protocol Buffers
* Avro
* Gson

从 Dubbo 3.0 开始默认仅提供以下序列化协议支持：
* Hessian2
* JDK
* Protocol Buffers

从 Dubbo 3.2 开始默认提供以下序列化协议支持：
* Hessian2
* Fastjson2
* JDK
* Protocol Buffers

处于安全性考虑，从 Dubbo 3.3 开始将默认仅提供以下序列化协议支持：
* Hessian2
* Fastjson2
* Protocol Buffers

针对以上序列化扩展，在发现或收到相关的漏洞报告之后，Dubbo 官方会跟进并升级依赖到最新的安全版本，但最终的漏洞修复方案取决于序列化的框架实现。

> 针对使用 [dubbo hessian2](https://github.com/apache/dubbo-hessian-lite/releases) 版本的用户，Dubbo 官方会保证hessian2序列化机制的安全性并尽可能的修复上报的安全漏洞

此外，从 Dubbo 3.2 版本开始，对于 Hessian2 和 Fastjson2 默认采用白名单机制，如果您发现部分数据处理移除，可以参考[文档](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/security/class-check/)进行配置。

# 全面加固

为了尽可能提高应用序列化的安全性，Dubbo3.0在序列化协议安全方面进行了升级加固，推荐使用 Tripe 协议的非 Wrapper 模式。
该协议默认安全，但需要开发人员编写IDL文件。

Triple 协议 Wrapper 模式下，允许兼容其它序列化数据，提供了良好的兼容性。但其它协议可能存在反序列化安全缺陷，对于 Hessian2 协议，高安全属性用户应当按照 samples 代码指示，开启白名单模式，框架默认会开启黑名单模式，拦截恶意调用。

若必须使用其它序列化协议，同时希望具备一定安全性。应当开启Token鉴权机制，防止未鉴权的不可信请求来源威胁 Provider 的安全性。开启 Token 鉴权机制时，应当同步开启注册中心的鉴权功能。

[加固参考](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/security/)
