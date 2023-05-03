---
aliases:
    - /zh/docs/references/xml/dubbo-module/
description: dubbo:module 配置
linkTitle: dubbo:module
title: dubbo:module
type: docs
weight: 1
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/config/properties/#module)。
{{% /pageinfo %}}

模块信息配置。对应的配置类 `org.apache.dubbo.config.ModuleConfig`

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | module | string | <b>必填</b> | | 服务治理 | 当前模块名称，用于注册中心计算模块间依赖关系 | 2.2.0以上版本 |
| version | module.version | string | 可选 | | 服务治理 | 当前模块的版本 | 2.2.0以上版本 |
| owner | owner | string | 可选 | | 服务治理 | 模块负责人，用于服务治理，请填写负责人公司邮箱前缀 | 2.2.0以上版本 |
| organization | organization | string | 可选 | | 服务治理 | 组织名称(BU或部门)，用于注册中心区分服务来源，此配置项建议不要使用autoconfig，直接写死在配置中，比如china,intl,itu,crm,asc,dw,aliexpress等 | 2.2.0以上版本 |
