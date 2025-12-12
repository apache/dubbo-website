---
aliases:
    - /en/docs3-v2/erlang-sdk/serialization/
    - /en/docs3-v2/erlang-sdk/serialization/
    - /en/overview/mannual/erlang-sdk/serialization/
    - /en/overview/reference/erlang-sdk/serialization/
description: Configure serialization methods in Erlang
linkTitle: Serialization Configuration Options
title: Serialization Configuration Options
type: docs
weight: 4
---

Currently, this library only implements the `dubbo://` communication protocol.

Two serialization methods are implemented: `hessian` and `json`.

## Configuration Example

The serialization configuration needs to be added to the `dubboerl` application configuration in the `sys.config` file.

```erlang
{dubboerl,[
	%% other config ...
	{protocol,hessian}
]}
```
 
| ConfigName | Type | DefaultValue | Remarks |
| --- | --- | --- | --- |
| protocol | atom() | hessian | hessian,json |

