---
type: docs
title: "Distributed transaction"
linkTitle: "Transaction"
weight: 42
description: "Distributed transaction support in dubbo"
---

Distributed transactions are based on the JTA / XA specification(this feature has not yet been implemented)

Two-phase commit:

![/user-guide/images/jta-xa.jpg](/imgs/user/jta-xa.jpg)


In Dubbo, [Seate](/en/blog/2019/01/17/how-to-use-seata-to-ensure-consistency-between-dubbo-microservices/) can be used to support distributed transactions.