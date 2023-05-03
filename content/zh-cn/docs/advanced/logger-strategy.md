---
aliases:
    - /zh/docs/advanced/logger-strategy/
description: 在 Dubbo 中适配日志框架
linkTitle: 日志适配
title: 日志适配
type: docs
weight: 38
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/others/logger-management/)。
{{% /pageinfo %}}

自 `2.2.1` 开始，dubbo 开始内置 log4j、slf4j、jcl、jdk 这些日志框架的适配[1]，也可以通过以下方式显式配置日志输出策略：

0. 命令行

    ```sh
      java -Ddubbo.application.logger=log4j
    ```

0. 在 `dubbo.properties` 中指定

    ```
      dubbo.application.logger=log4j
    ```

0. 在 `dubbo.xml` 中配置

    ```xml
      <dubbo:application logger="log4j" />
    ```

[1]: 自定义扩展可以参考 [日志适配扩展](../../../docsv2.7/dev/impls/logger-adapter/)
