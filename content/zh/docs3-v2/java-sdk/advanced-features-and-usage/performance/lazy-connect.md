---
type: docs
title: "延迟连接"
linkTitle: "延迟连接"
weight: 30
description: "在 Dubbo 中配置延迟连接"
---
## 特性说明

## 使用场景
延迟连接用于减少长连接数。当有调用发起时，再创建长连接。

## 使用方式
```xml
<dubbo:protocol name="dubbo" lazy="true" />
```

> 该配置只对使用长连接的 dubbo 协议生效。
