
---
type: docs
title: "安全漏洞"
linkTitle: "安全漏洞"
description: "序列化相关的安全问题说明"
weight: 90
---


## 序列化
Dubbo 支持序列化协议的扩展，理论上用户可以基于该扩展机制启用任意序的列化协议，这带来了极大的灵活的，但同时也要意识到其中潜藏的安全性风险。
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
