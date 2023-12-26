---
aliases:
    - /zh/docs3-v2/golang-sdk/refer/compatible_version/
    - /zh-cn/docs3-v2/golang-sdk/refer/compatible_version/
    - /zh-cn/overview/mannual/golang-sdk/preface/refer/compatible_version/
description: 依赖适配版本号
title: 版本信息
type: docs
weight: 1
---
我们提供了不同版本的 Dubbo Java 实现文档，您可以在下方版本列表中选择不同的版本文档，查看每个版本的维护情况、组件版本、升级注意事项等。

## 版本说明

| <span style="display:inline-block;min-width:120px">Dubbo 分支</span> | <span style="display:inline-block;min-width:100px">最新版本</span> | <span style="display:inline-block;min-width:80px">JDK</span> | Spring Boot | <span style="display:inline-block;min-width:80px">组件版本</span> | 详细说明 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3.3.x (当前文档) | 3.3.0-beta.1 | 8, 17, 21 | | [详情](https://github.com/apache/dubbo/blob/dubbo-3.3.0-beta.1/dubbo-dependencies-bom/pom.xml#L91) | - 跨版本升级说明 <br/><br/>  - 不建议生产使用！最新Triple、REST协议升级，内置Metrics、Tracing、GraalVM支持 |
| [3.2.x](https://dubbo-3-2-x.staged.apache.org/zh-cn/overview/mannual/java-sdk/) | 3.2.10 | 8, 17 |  | [详情](https://github.com/apache/dubbo/blob/dubbo-3.2.10/dubbo-dependencies-bom/pom.xml#L91) | - 跨版本升级说明 <br/><br/>  - 生产可用(推荐，长期维护)！ |
| [3.1.x](https://dubbo-3-2-x.staged.apache.org/zh-cn/overview/mannual/java-sdk/) | 3.1.11 | 8, 17 |  | [详情](https://github.com/apache/dubbo/blob/dubbo-3.1.11/dubbo-dependencies-bom/pom.xml#L91) | - 跨版本升级说明 <br/><br/>  - 生产可用(仅修复安全漏洞)！ |
| [3.0.x](https://dubbo-3-2-x.staged.apache.org/zh-cn/overview/mannual/java-sdk/) | 3.0.15 | 8 |  | [详情](https://github.com/apache/dubbo/blob/dubbo-3.0.15/dubbo-dependencies-bom/pom.xml#L91) | - 跨版本升级说明 <br/><br/>  - 生产可用(停止维护)！  |
| [2.7.x](https://dubbo-3-2-x.staged.apache.org/zh-cn/overview/mannual/java-sdk/) | 2.7.23 | 8 |  | [详情](https://raw.githubusercontent.com/apache/dubbo/dubbo-2.7.23/dubbo-dependencies-bom/pom.xml) | - 跨版本升级说明 <br/><br/>  -  生产可用(停止维护)！  |
| [2.6.x](https://dubbo-3-2-x.staged.apache.org/zh-cn/overview/mannual/java-sdk/) | 2.6.20 | 6, 7 | - | _ | - 跨版本升级说明 <br/><br/>  -  生产可用(停止维护)！ |
| [2.5.x](https://dubbo-3-2-x.staged.apache.org/zh-cn/overview/mannual/java-sdk/) | 2.5.10 | 6, 7 | - | - | - 跨版本升级说明 <br/><br/>  -  生产可用(停止维护)！ |
