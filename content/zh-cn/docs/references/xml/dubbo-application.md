---
aliases:
    - /zh/docs/references/xml/dubbo-application/
description: dubbo:application 配置
linkTitle: dubbo:application
title: dubbo:application
type: docs
weight: 1
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/config/properties/#application)。
{{% /pageinfo %}}

应用信息配置。对应的配置类：`org.apache.dubbo.config.ApplicationConfig`

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | application | string | <b>必填</b> | | 服务治理 | 当前应用名称，用于注册中心计算应用间依赖关系，注意：消费者和提供者应用名不要一样，此参数不是匹配条件，你当前项目叫什么名字就填什么，和提供者消费者角色无关，比如：kylin应用调用了morgan应用的服务，则kylin项目配成kylin，morgan项目配成morgan，可能kylin也提供其它服务给别人使用，但kylin项目永远配成kylin，这样注册中心将显示kylin依赖于morgan | 1.0.16以上版本 |
| version | application.version | string | 可选 | | 服务治理 | 当前应用的版本 | 2.2.0以上版本 |
| owner | owner | string | 可选 | | 服务治理 | 应用负责人，用于服务治理，请填写负责人公司邮箱前缀 | 2.0.5以上版本 |
| organization | organization | string | 可选 | | 服务治理 | 组织名称(BU或部门)，用于注册中心区分服务来源，此配置项建议不要使用autoconfig，直接写死在配置中，比如china,intl,itu,crm,asc,dw,aliexpress等 | 2.0.0以上版本 |
| architecture <br class="atl-forced-newline" /> | architecture <br class="atl-forced-newline" /> | string | 可选 | | 服务治理 | 用于服务分层对应的架构。如，intl、china。不同的架构使用不同的分层。 | 2.0.7以上版本 |
| environment | environment | string | 可选 | | 服务治理 | 应用环境，如：develop/test/product，不同环境使用不同的缺省值，以及作为只用于开发测试功能的限制条件 | 2.0.0以上版本 |
| compiler | compiler | string | 可选 | javassist | 性能优化 | Java字节码编译器，用于动态类的生成，可选：jdk或javassist | 2.1.0以上版本 |
| logger | logger | string | 可选 | slf4j | 性能优化 | 日志输出方式，可选：slf4j,jcl,log4j,log4j2,jdk | 2.2.0以上版本 | 
| metadata-type | metadata-type |String| 可选 | local | 服务治理 | metadata 传递方式，是以 Provider 视角而言的，Consumer 侧配置无效，可选值有：<br>remote - Provider 把 metadata 放到远端注册中心，Consumer 从注册中心获取<br/>local - Provider 把 metadata 放在本地，Consumer 从 Provider 处直接获取| 2.7.6以上版本 |
