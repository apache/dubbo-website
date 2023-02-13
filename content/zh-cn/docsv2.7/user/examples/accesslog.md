---
type: docs
title: "访问日志"
linkTitle: "访问日志"
weight: 39
description: "配置 Dubbo 的访问日志"
---

如果你想记录每一次请求信息，可开启访问日志，类似于apache的访问日志。**注意**：此日志量比较大，请注意磁盘容量。

将访问日志输出到当前应用的log4j日志：

```xml
<dubbo:protocol accesslog="true" />
```

将访问日志输出到指定文件：

```xml
<dubbo:protocol accesslog="http://10.20.160.198/wiki/display/dubbo/foo/bar.log" />
```
