---
type: docs
title: "分布式事务"
linkTitle: "分布式事务"
weight: 42
description: "Dubbo 中分布式事务的支持"
---

分布式事务基于 JTA/XA 规范实现。

两阶段提交：

![/user-guide/images/jta-xa.jpg](/imgs/user/jta-xa.jpg)

在 Dubbo 中，可以采用 [seata](/zh/blog/2019/01/17/如何使用seata保证dubbo微服务间的一致性/) 来完成对分布式事务的支持。