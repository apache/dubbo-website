---
type: docs
title: "序列化配置项"
linkTitle: "序列化配置项"
weight: 4
description: "在 erlang 中配置序列化方式"
---

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
 