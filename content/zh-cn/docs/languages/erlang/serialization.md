---
aliases:
    - /zh/docs/languages/erlang/serialization/
description: 在 erlang 中配置序列化方式
linkTitle: 序列化配置项
title: 序列化配置项
type: docs
weight: 4
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/erlang-sdk/serialization/)。
{{% /pageinfo %}}

当前该库只实现了 `dubbo://` 通讯协议。

序列化方式实现了 `hessian` 和 `json` 两种方式。

## 配置样例

序列化配置需要添加到 `sys.config` 文件 `dubboerl` 应用配置项里。

```erlang
{dubboerl,[
	%% other config ...
	{protocol,hessian}
]}
```
 
| ConfigName | Type | DefaultValue | Remarks |
| --- | --- | --- | --- |
| protocol | atom() | hessian | hessian,json |
