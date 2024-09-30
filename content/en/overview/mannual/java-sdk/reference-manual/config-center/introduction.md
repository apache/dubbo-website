---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/config-center/
    - /en/docs3-v2/java-sdk/reference-manual/config-center/
    - /en/overview/what/ecosystem/config-center/
description: Basic usage and working principles of the Dubbo Config Center
linkTitle: Overview of Config Center
title: Config Center
type: docs
weight: 1
---


The Config Center in Dubbo has two main responsibilities:

1. [Externalized Configuration](/en/overview/mannual/java-sdk/reference-manual/config/principle/#33-Externalized-Configuration): Centralized storage for startup configurations (simplified as external storage of dubbo.properties).
2. Storage of traffic governance rules.

Please refer to specific extension implementations to learn how to enable the Config Center.

It is worth noting that the Dubbo dynamic configuration center defines two different levels of isolation options, namely namespace and group.
* namespace - Configuration namespace, default value `dubbo`. The namespace is usually used for multi-tenant isolation, logically isolating different users, different environments, or completely unrelated sets of configurations, as opposed to physical isolation, where different namespaces still use the same physical cluster.
* group - Configuration group, default value `dubbo`. The `group` is typically used to classify a set of configuration items of the same type/purpose, providing further isolation of configuration items under the `namespace`.

Refer to [Configuration Instructions - Configuration Item Manual](/en/overview/mannual/java-sdk/reference-manual/config/properties/#dubboconfig-center) for more configuration items available in the config-center beyond namespace and group.

{{% alert title="Using the Registry Center as the Default Config Center" color="info" %}}
When using Zookeeper or Nacos as a registry center without explicitly configuring a config center, the Dubbo framework defaults to using Zookeeper or Nacos as the config center for service governance purposes.
{{% /alert %}}

