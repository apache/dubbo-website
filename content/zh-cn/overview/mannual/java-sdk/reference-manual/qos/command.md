---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/qos/command/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/qos/command/
description: 基础命令手册
linkTitle: 基础命令手册
title: 基础命令手册
type: docs
weight: 2
---





基础命令功能提供了一系列的基础命令。

### help 命令

显示更多命令
```
//列出所有命令
dubbo>help

//列出单个命令的具体使用情况
dubbo>help online
+--------------+----------------------------------------------------------------------------------+
| COMMAND NAME | online                                                                           |
+--------------+----------------------------------------------------------------------------------+
|      EXAMPLE | online dubbo                                                                     |
|              | online xx.xx.xxx.service                                                         |
+--------------+----------------------------------------------------------------------------------+

dubbo>
```

### version 命令

显示当前运行的 Dubbo 的版本号

```
dubbo>version
dubbo version "3.0.10-SNAPSHOT"

dubbo>
```

### quit 命令

退出命令状态

```
dubbo>quit
BYE!
Connection closed by foreign host.

```
