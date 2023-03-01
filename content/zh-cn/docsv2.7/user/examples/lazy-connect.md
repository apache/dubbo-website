---
aliases:
    - /zh/docsv2.7/user/examples/lazy-connect/
description: 在 Dubbo 中配置延迟连接
linkTitle: 延迟连接
title: 延迟连接
type: docs
weight: 30
---


## 背景
延迟连接用于减少长连接数。当有调用发起时，再创建长连接。

## 示例
```xml
<dubbo:protocol name="dubbo" lazy="true" />
```

{{% alert title="提示" color="primary" %}}
该配置只对使用长连接的 dubbo 协议生效。
{{% /alert %}}