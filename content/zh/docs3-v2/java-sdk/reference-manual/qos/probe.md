---
type: docs
title: "框架状态命令"
linkTitle: "框架状态命令"
weight: 4
description: "框架状态命令"
---

参考文档：[Kubernetes 生命周期探针](../../../advanced-features-and-usage/others/dubbo-kubernetes-probe/)

## startup 命令

检测当前框架是否已经启动完毕

```
dubbo>startup
true

dubbo>
```

## ready 命令

检测当前框架是否能正常提供服务（可能是临时下线）

```
dubbo>ready
true

dubbo>
```

## live 命令

检测当前框架是否正常运行（可能是永久异常）

```
dubbo>live
true

dubbo>
```
