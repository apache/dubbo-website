---
type: docs
title: "Frame State Command"
linkTitle: "Frame State Command"
weight: 4
description: "Frame State Command"
---

Reference document: [Kubernetes Lifecycle Probe](../../../advanced-features-and-usage/others/dubbo-kubernetes-probe/)

## startup command

Check if the current framework has been started

```
dubbo>startup
true

dubbo>
```

## ready command

Detect whether the current framework can provide services normally (may be temporarily offline)

```
dubbo>ready
true

dubbo>
```

## live command

Check if the current framework is running normally (possibly a permanent exception)

```
dubbo>live
true

dubbo>
```