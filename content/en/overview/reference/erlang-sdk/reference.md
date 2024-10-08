---
aliases:
    - /en/docs3-v2/erlang-sdk/reference/
    - /en-us/docs3-v2/erlang-sdk/reference/
    - /en-us/overview/manual/erlang-sdk/reference/
    - /en-us/overview/reference/erlang-sdk/reference/
description: Configuring consumers in Erlang
linkTitle: Consumer Configuration
title: Consumer Configuration
type: docs
weight: 2
---






## Basic Configuration

Consumer configurations need to be added to the `sys.config` file under the `dubboerl` application configuration.

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

Option configuration items are to be added.

