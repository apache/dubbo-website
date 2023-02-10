---
type: docs
title: "Thrift"
linkTitle: "Thrift"
weight: 50
description: ""
---

## 特性说明
当前 dubbo 支持的 thrift 协议是对 thrift 原生协议的扩展，在原生协议的基础上添加了一些额外的头信息，比如 service name，magic number 等。`2.3.0` 以上版本支持。

[Thrift](http://thrift.apache.org) 是 Facebook 捐给 Apache 的一个 RPC 框架。

## 使用场景

适用于 SOA 标准 RPC 框架。

## 使用方式 - Java

### 依赖

从 Dubbo 3 开始，Thrift 协议已经不再内嵌在 Dubbo 中，需要单独引入独立的[模块](/zh-cn/release/dubbo-spi-extensions/#dubbo-rpc)。
```xml
<dependency>
    <groupId>org.apache.dubbo.extensions</groupId>
    <artifactId>dubbo-rpc-native-thrift</artifactId>
    <version>1.0.0</version>
</dependency>
```


```xml
<dependency>
    <groupId>org.apache.thrift</groupId>
    <artifactId>libthrift</artifactId>
    <version>0.8.0</version>
</dependency>
```

### 所有服务共用一个端口

与原生 Thrift 不兼容
```xml
<dubbo:protocol name="thrift" port="3030" />
```

> Thrift 不支持 null 值，即：不能在协议中传递 null 值

## 使用方式 - Go

暂不支持

## 使用方式 - Node.js

暂不支持

## 使用方式 - Rust

暂不支持
