---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/config-center/
    - /en/docs3-v2/java-sdk/reference-manual/config-center/
    - /en/overview/what/ecosystem/config-center/
description: The basic usage and working principle of the Dubbo configuration center
linkTitle: Configuration Center
title: Configuration Center
type: docs
weight: 6
---






The configuration center (config-center) in Dubbo can undertake two types of responsibilities:

1. [External configuration](../config/principle/#33-external-configuration): centralized storage of startup configurations (simply understood as external storage of dubbo.properties).
2. Storage of traffic governance rules.

Please refer to the specific extension implementations to understand how to enable the configuration center.

It is worth noting that the Dubbo dynamic configuration center defines two different levels of isolation options, namely namespace and group.
* namespace - Configuration namespace, default value `dubbo`. The namespace is typically used for multi-tenant isolation, i.e., logical isolation of different configurations for different users or environments, distinct from physical isolation, as different namespaces still use the same physical cluster.
* group - Configuration grouping, default value `dubbo`. `group` is typically used to categorize a set of configuration items of the same type/purpose and is an additional layer of isolation for configuration items under the `namespace`.

Refer to [Configuration Description - Configuration Item Manual](../config/properties/#config-center) to learn more about configuration items offered by config-center beyond namespace and group.

> To be compatible with the 2.6.x version configuration, when using Zookeeper as the registry center, and without explicitly configuring the configuration center, the Dubbo framework will default to using this Zookeeper as the configuration center, but it will only be used for service governance purposes.

