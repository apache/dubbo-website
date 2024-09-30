---
aliases:
    - /en/docs3-v2/erlang-sdk/service/
    - /en-us/docs3-v2/erlang-sdk/service/
    - /en-us/overview/mannual/erlang-sdk/service/
    - /en-us/overview/reference/erlang-sdk/service/
description: Configuring service providers in Erlang
linkTitle: Provider Configuration
title: Provider Configuration
type: docs
weight: 3
---

## Basic Configuration

Provider configuration items need to be added to the `sys.config` file under the `dubboerl` application configuration item.

```erlang
{dubboerl,[
	%% other config ...
	{provider,[
		{module_implements,interface_module,interface_fullname,[Options]},
		%% eg:
		{userOperator_impl,userOperator,<<"org.apache.dubbo.erlang.sample.service.facade.UserOperator">>,[Option]}
	]}
]}
```

| ConfigName | Type | DefaultValue | Remarks |
| --- | --- | --- | --- |
| module_implements | atom() | - | The service implementation module name |
| interface_module | atom() | - | Interface module name converted from java jar |
| interface_fullname | binary() | - | Fully qualified name of the interface's Java class |

Option is to be added.

