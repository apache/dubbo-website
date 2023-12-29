---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/accesslog/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/accesslog/
description: 了解 Dubbo 调用信息记录通过访问日志来配置和使用
linkTitle: 调用信息记录
title: 调用信息记录
type: docs
weight: 13
---





## 特性说明

在 dubbo3 日志分为日志适配和访问日志，如果想记录每一次请求信息，可开启访问日志，类似于 apache 的访问日志。

## 使用场景

基于审计需要等类似 nginx accesslog 输出等。

## 使用方式
### log4j 日志
将访问日志输出到当前应用的 log4j 日志
```xml
<dubbo:protocol accesslog="true" />
```
### 指定文件
将访问日志输出到指定文件
```xml
<dubbo:protocol accesslog="http://10.20.160.198/wiki/display/dubbo/foo/bar.log" />
```
> 此日志量比较大，请注意磁盘容量。