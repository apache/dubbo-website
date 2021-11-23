---
type: docs
title: "Serialized configuration items"
linkTitle: "Serialized configuration items"
weight: 4
description: "Configure the serialization method in erlang"
---

The library currently only implements the `dubbo://` communication protocol.

It supports `hessian` and `json` as serialization method.

## Configuration example

Provider configuration items to add to the `sys.config` file `dubboerl` field.

```erlang
{dubboerl,[
	%% other config ...
	{protocol,hessian}
]}
```
 
| ConfigName | Type | DefaultValue | Remarks |
| --- | --- | --- | --- |
| protocol | atom() | hessian | hessian,json |
