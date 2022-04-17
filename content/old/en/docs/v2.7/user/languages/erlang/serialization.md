---
type: docs
title: "Protocol Configuration"
linkTitle: "Protocol"
weight: 4
description: "Protocol configurations in erlang"
---

The library now only supports hessian and json serialization.

## Configuration example

Protocol config is under the dubboerl application with sys.config

```erlang
{dubboerl,[
	%% other config ...
	{protocol,hessian}
]}
```
 
| ConfigName | Type | DefaultValue | Remarks |
| --- | --- | --- | --- |
| protocol | atom() | hessian | hessian,json |
 