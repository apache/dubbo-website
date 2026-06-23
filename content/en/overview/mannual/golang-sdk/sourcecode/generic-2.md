---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/features/generic-2/
    - /en/overview/mannual/golang-sdk/refer/sourcecode/generic-2/
description: Compatibility note for generic invocation documentation
title: Generic Invocation Compatibility Notes
type: docs
weight: 8
---

Related sample:

* Generic invocation sample: <a href="https://github.com/apache/dubbo-go-samples/tree/main/generic" target="_blank">dubbo-go-samples/generic</a>

This page is kept mainly for compatibility with older links.

For current Dubbo Go, please read [Generic Call](/en/overview/mannual/golang-sdk/sourcecode/generic/). The old examples that use:

* `config.NewReferenceConfigBuilder()`
* `GenericLoad()`
* `GetRPCService()`

describe the legacy configuration-centric API path. The recommended runtime entry today is:

* `client.NewGenericService(...)`
* `filter/generic.GenericService.Invoke(...)`
* `filter/generic.GenericService.InvokeWithType(...)`

If you need a working example, use the `dubbo-go-samples/generic` sample first.
