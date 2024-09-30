---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/qos/probe/
    - /en/docs3-v2/java-sdk/reference-manual/qos/probe/
description: Framework status commands
linkTitle: Framework status commands
title: Framework status commands
type: docs
weight: 4
---

### startup command

Check whether the current framework has started completely

```
dubbo>startup
true

dubbo>
```

### ready command

Check whether the current framework can provide services normally (it may be temporarily offline)

```
dubbo>ready
true

dubbo>
```

### live command

Check whether the current framework is running normally (it may be permanently abnormal)

```
dubbo>live
true

dubbo>
```

