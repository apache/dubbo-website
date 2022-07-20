---
type: docs
title: "基础命令手册"
linkTitle: "基础命令手册"
weight: 2
description: "基础命令手册"
---


## help 命令

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

## version 命令

显示当前运行的 Dubbo 的版本号

```
dubbo>version
dubbo version "3.0.10-SNAPSHOT"

dubbo>
```

## quit 命令

退出命令状态

```
dubbo>quit
BYE!
Connection closed by foreign host.

```