---
type: docs
title: "调用信息记录"
linkTitle: "调用信息记录"
weight: 13
description: "了解 dubbo3 调用信息记录通过访问日志来配置和使用"
---

了解 dubbo3 调用信息记录通过访问日志来配置和使用

## 特性说明:

在 dubbo3 日志分为日志适配和访问日志，如果想记录每一次请求信息，可开启访问日志，类似于 apache 的访问日志。

## 访问日志输出类型：

-   log4j 日志
-   指定文件

## 使用场景:

## 使用方式:

将访问日志输出到当前应用的 log4j 日志：

```
<dubbo:protocol accesslog="true" />
```
将访问日志输出到指定文件：

```
<dubbo:protocol accesslog="http://10.20.160.198/wiki/display/dubbo/foo/bar.log" />
```
#### 注意:

此日志量比较大，请注意磁盘容量。
