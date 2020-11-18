---
type: docs
title: "Provider Configuration"
linkTitle: "Provider"
weight: 3
description: "Protocol configurations in erlang"
---

## Base Config

Provider config is under the dubboerl application with sys.config

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
| module_implements | atom() | - | The service implements module name|
| interface_module | atom() | - | Interface module name is transfer form java jar |
| interface_fullname | binary() | - | Interface full name is the java class name |

Option is to be added.