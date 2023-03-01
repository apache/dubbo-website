---
aliases:
    - /zh/docs/languages/erlang/reference/
description: 在 erlang 中配置消费者
linkTitle: 消费者配置
title: 消费者配置
type: docs
weight: 2
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/erlang-sdk/reference/)。
{{% /pageinfo %}}

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
