---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/distributed-transaction/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/distributed-transaction/
description: Dubbo 中分布式事务的支持
linkTitle: 分布式事务支持
title: 分布式事务支持
type: docs
weight: 42
---





## 特性说明
分布式事务基于 JTA/XA 规范实现。

## 使用场景
支付交易：支付交易中的分布式交易支持，如在线支付、银行转账等，确保在完成多个服务调用后支付成功。

库存管理：支持库存管理中的分布式事务场景，确保用户购买产品时，库存得到相应更新成功和交易成功。

订单处理：支持订单处理中的分布式事务场景，确保当用户下订单时，在完成多个服务调用后成功下订单。

数据同步：支持数据同步中的分布式事务场景，确保在完成多个服务调用后，不同服务之间的数据同步成功。

## 实现方式
**两阶段提交**

![/user-guide/images/jta-xa.jpg](/imgs/user/jta-xa.jpg)

> 在 Dubbo 中，可以采用 [seata](/zh-cn/blog/2019/01/17/如何使用seata保证dubbo微服务间的一致性/) 来完成对分布式事务的支持。