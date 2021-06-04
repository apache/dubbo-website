---
type: docs
title: "dubbo:monitor"
linkTitle: "dubbo:monitor"
weight: 1 
description: "dubbo:monitor 配置"
---

监控中心配置。对应的配置类： `org.apache.dubbo.config.MonitorConfig`

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| protocol | protocol | string | 可选 | dubbo | 服务治理 | 监控中心协议，如果为protocol="registry"，表示从注册中心发现监控中心地址，否则直连监控中心。 | 2.0.9以上版本 |
| address | &lt;url&gt; | string | 可选 | N/A | 服务治理 | 直连监控中心服务器地址，address="10.20.130.230:12080" | 1.0.16以上版本 |
