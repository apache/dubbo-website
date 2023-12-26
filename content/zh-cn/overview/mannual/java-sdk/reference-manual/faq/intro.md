---
aliases:
    - /zh/docs3-v2/java-sdk/faq/intro/
    - /zh-cn/docs3-v2/java-sdk/faq/intro/
description: 错误码机制的介绍
linkTitle: 错误码机制的介绍
title: 错误码机制的介绍
type: docs
weight: 0
---






### 背景
Dubbo 内部依赖的 Logger 抽象层提供了日志输出能力，但是大部分的异常日志都没有附带排查说明，导致用户看到异常后无法进行处理。

为了解决这个问题，自 Dubbo 3.1 版本开始，引入了错误码机制。其将官方文档中的错误码 FAQ 与日志框架连接起来。在日志抽象输出异常的同时附带输出对应的官网文档链接，引导用户进行自主排查。

### 错误码格式
`[Cat]-[X]`

> 两个空格均为数字。其中第一个数字为类别，第二个数字为具体错误码。

### 提示显示的格式
```
This may be caused by ..., go to https://dubbo.apache.org/faq/[Cat]/[X] to find instructions.
```
> 另外在这句话后可以指定补充的信息（即 extendedInformation）。

### 显示的实例
```
[31/07/22 02:43:07:796 CST] main  WARN support.AbortPolicyWithReport:  [DUBBO] Thread pool is EXHAUSTED! Thread Name: Test, Pool Size: 0 (active: 0, core: 1, max: 1, largest: 0), Task: 0 (completed: 0), Executor status:(isShutdown:false, isTerminated:false, isTerminating:false), in dubbo://10.20.130.230:20880!, dubbo version: , current host: 10.20.130.230, error code: 0-1. This may be caused by too much client requesting provider, go to https://dubbo.apache.org/faq/0/1 to find instructions.
```

> 用户只需点击链接即可根据错误码查找到原因。

### Logger 接口支持
为确保兼容性，Dubbo 3.1 基于原本的 Logger 抽象，构建了一个新的接口 `ErrorTypeAwareLogger`。

warn 等级的方法进行了扩展如下
```
void warn(String code, String cause, String extendedInformation, String msg);
void warn(String code, String cause, String extendedInformation, String msg, Throwable e);
```

其中 code 指错误码，cause 指可能的原因（即 caused by... 后面所接的文字），extendedInformation 作为补充信息，直接附加在 caused by 这句话的后面。

> 对于 error 级别也做了相同的扩展。