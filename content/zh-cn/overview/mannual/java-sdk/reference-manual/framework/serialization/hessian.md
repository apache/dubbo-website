---
aliases:
    - /zh/overview/what/ecosystem/serialization/hessian/
    - /zh-cn/overview/what/ecosystem/serialization/hessian/
description: "本文介绍 Hessian 序列化"
linkTitle: Hessian
title: Hessian
type: docs
weight: 1
---



## 1 介绍

Hessian序列化是一种支持动态类型、跨语言、基于对象传输的网络协议，Java对象序列化的二进制流可以被其他语言（如，c++，python）。特性如下：

1. 自描述序列化类型。不依赖外部描述文件或者接口定义，用一个字节表示常用的基础类型，极大缩短二进制流。
2. 语言无关，支持脚本语言
3. 协议简单，比Java原生序列化高效
4. 相比hessian1，hessian2中增加了压缩编码，其序列化二进制流大小是Java序列化的50%，序列化耗时是Java序列化的30%，反序列化耗时是Java序列化的20%。

## 2 使用方式

> Dubbo < 3.2.0 版本中，默认使用 Hessian2 作为默认序列化

### 2.1 配置启用


```yaml
# application.yml (Spring Boot)
dubbo:
 protocol:
   serialization: hessian2
```
或
```properties
# dubbo.properties
dubbo.protocol.serialization=hessian2

# or
dubbo.consumer.serialization=hessian2

# or
dubbo.reference.com.demo.DemoService.serialization=hessian2
```
或
```xml
<dubbo:protocol serialization="hessian2" />

        <!-- or -->
<dubbo:consumer serialization="hessian2" />

        <!-- or -->
<dubbo:reference interface="xxx" serialization="hessian2" />
```
