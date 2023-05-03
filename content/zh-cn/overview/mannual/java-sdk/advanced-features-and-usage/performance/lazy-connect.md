---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/lazy-connect/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/lazy-connect/
description: 在 Dubbo 中配置延迟连接
linkTitle: 延迟连接
title: 延迟连接
type: docs
weight: 30
---





## 功能说明
当消费者请求服务时，实际使用服务时才建立真正的连接，避免不必要的连接来减少延迟并提高系统稳定性。

## 使用场景
延迟连接用于减少长连接数。当有调用发起时，再创建长连接。

## 使用方式
```xml
<dubbo:protocol name="dubbo" lazy="true" />
```

> 该配置只对使用长连接的 dubbo 协议生效。