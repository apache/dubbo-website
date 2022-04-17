---
type: docs
title: "Consumer configuration"
linkTitle: "Consumer configuration"
weight: 2
description: "Configure consumers in erlang"
---

## Basic configuration

Consumers need to add configuration items to `sys.config` file `dubboerl` filed.

```erlang
{dubboerl,[
	%% other config ...
	{consumer,[
		{<<"interface fullname">>,[Option]},
		%% eg:
		{<<"org.apache.dubbo.erlang.sample.service.facade.UserOperator">>,[]},
	]}
]}
```

Option is to be added.
