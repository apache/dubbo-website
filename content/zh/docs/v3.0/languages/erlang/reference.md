---
type: docs
title: "消费者配置"
linkTitle: "消费者配置"
weight: 2
description: "在 erlang 中配置消费者"
---

## 基础配置

消费者配置项需要添加到 `sys.config` 文件 `dubboerl` 应用配置项里。

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

Option 配置项待添加中。
