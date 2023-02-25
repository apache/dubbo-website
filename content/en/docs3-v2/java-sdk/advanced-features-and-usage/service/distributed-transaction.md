---
type: docs
title: "Distributed transaction support"
linkTitle: "Distributed transaction support"
weight: 42
description: "Support for distributed transactions in Dubbo"
---

Distributed transactions are implemented based on the JTA/XA specification.

**two-phase commit**

![/user-guide/images/jta-xa.jpg](/imgs/user/jta-xa.jpg)

In Dubbo, you can use [seata](/zh-cn/blog/2019/01/17/How to use seata to ensure the consistency between dubbo microservices/) to complete the support for distributed transactions.