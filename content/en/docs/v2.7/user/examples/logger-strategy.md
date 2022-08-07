---
type: docs
title: "Logger Strategy"
linkTitle: "Logger Strategy"
weight: 38
description: "Config logger Strategy in dubbo"
---

`2.2.1` or later, dubbo support log4j、slf4j、jcl、jdk adapters [^1], you can also explicitly configure the log output policy in the following ways:

1. Command

    ```sh
    java -Ddubbo.application.logger=log4j
    ```

1. Configure in `dubbo.properties`

    ```properties
    dubbo.application.logger=log4j
    ```

1. Configure in `dubbo.xml`

    ```xml
    <dubbo:application logger="log4j" />
    ```

[^1]: Custom Extensions: [logger-adapter](/en/docs/v2.7/dev/impls/logger-adapter)
