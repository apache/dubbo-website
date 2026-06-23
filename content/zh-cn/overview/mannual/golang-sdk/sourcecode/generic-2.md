---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/features/generic-2/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/features/generic-2/
    - /zh-cn/overview/mannual/golang-sdk/refer/sourcecode/generic-2/
description: 泛化调用文档的兼容说明
title: 泛化调用兼容说明
type: docs
weight: 8
---

相关示例：

* 泛化调用示例：<a href="https://github.com/apache/dubbo-go-samples/tree/main/generic" target="_blank">dubbo-go-samples/generic</a>

这个页面主要保留给旧链接兼容使用。

当前 Dubbo Go 请优先阅读[泛化调用](/zh-cn/overview/mannual/golang-sdk/sourcecode/generic/)。旧示例里使用的：

* `config.NewReferenceConfigBuilder()`
* `GenericLoad()`
* `GetRPCService()`

属于早期以配置对象为中心的 API 路径。现在更推荐的运行时入口是：

* `client.NewGenericService(...)`
* `filter/generic.GenericService.Invoke(...)`
* `filter/generic.GenericService.InvokeWithType(...)`

如果你要找一个可以直接参考的完整示例，优先看 `dubbo-go-samples/generic`。
