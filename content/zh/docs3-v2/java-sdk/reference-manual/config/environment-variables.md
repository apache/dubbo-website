---
type: docs
title: "自动加载环境变量"
linkTitle: "自动加载环境变量"
weight: 70
description: "在 Dubbo 中自动加载环境变量"
---

从 2.7.3 版本开始，Dubbo 会自动从约定 key 中读取配置，并将配置以 Key-Value 的形式写入到URL中。

支持的 key 有以下两个：

1. `dubbo.labels`，指定一些列配置到 URL 中的键值对，通常通过 JVM -D 或系统环境变量指定。

    增加以下配置：
    
    ```properties
    # JVM
    -Ddubbo.labels = "tag1=value1; tag2=value2"
    # 环境变量
    DUBBO_LABELS = "tag1=value1; tag2=value2"
    ```
   
    最终生成的 URL 会包含 tag1、tag2 两个 key: `dubbo://xxx?tag1=value1&tag2=value2`
    
2. `dubbo.env.keys`，指定环境变量 key 值，Dubbo 会尝试从环境变量加载每个 key

    ```properties
    # JVM
    -Ddubbo.env.keys = "DUBBO_TAG1, DUBBO_TAG2"
    # 环境变量
    DUBBO_ENV_KEYS = "DUBBO_TAG1, DUBBO_TAG2"
    ```
    
    最终生成的 URL 会包含 DUBBO_TAG1、DUBBO_TAG2 两个 key: `dubbo://xxx?DUBBO_TAG1=value1&DUBBO_TAG2=value2`