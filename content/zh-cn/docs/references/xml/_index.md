---
aliases:
    - /zh/docs/references/xml/
description: Dubbo 的 XML Schema 配置参考手册
linkTitle: XML 配置
title: Schema 配置参考手册
type: docs
weight: 1
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/config/xml/)。
{{% /pageinfo %}}

这里以 XML Config [^1] 为准，列举所有配置项 [^2]。其它配置方式，请参见相应转换关系：[属性配置](../../../docsv2.7/user/configuration/properties)，[注解配置](../../../docsv2.7/user/configuration/annotation)，[API 配置](../../../docsv2.7/user/configuration/api)。

所有配置项分为三大类，参见下表中的"作用" 一列。

* 服务发现：表示该配置项用于服务的注册与发现，目的是让消费方找到提供方。
* 服务治理：表示该配置项用于治理服务间的关系，或为开发测试提供便利条件。
* 性能调优：表示该配置项用于调优性能，不同的选项对性能会产生影响。
* 所有配置最终都将转换为 URL [^3] 表示，并由服务提供方生成，经注册中心传递给消费方，各属性对应 URL 的参数，参见配置项一览表中的 "对应URL参数" 列。

[^1]: XML Schema: http://dubbo.apache.org/schema/dubbo/dubbo.xsd
[^2]: 注意：只有 group，interface，version 是服务的匹配条件，三者决定是不是同一个服务，其它配置项均为调优和治理参数。
[^3]: URL 格式：`protocol://username:password@host:port/path?key=value&key=value`
