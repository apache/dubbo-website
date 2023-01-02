---
type: docs
title: "Configuration Center"
linkTitle: "Configuration Center"
weight: 7
description: ""
---

The configuration center (config-center) can undertake two types of responsibilities in Dubbo:

1. [Externalized configuration](../config/principle/#33-externalized configuration): Centralized storage of startup configuration (simply understood as externalized storage of dubbo.properties).
2. Storage of traffic governance rules

Please refer to the specific extension implementation to learn how to enable the configuration center.

It is worth noting that the Dubbo dynamic configuration center defines two different levels of isolation options, namely namespce and group.
* namespace - configuration namespace, the default value is `dubbo`. Namespaces are usually used for multi-tenant isolation, that is, to logically isolate different users, different environments, or a series of configurations that are completely unrelated. The point of difference from physical isolation is whether different namespaces are used or the same physical cluster.
* group - configuration grouping, default value `dubbo`. `group` is usually used to classify a group of configuration items of the same type/purpose, which is a further isolation of configuration items under `namespace`.

Refer to [Configuration Instructions - Configuration Item Manual](../config/properties/#config-center) for more configuration items opened by config-center other than namespce and group.

> In order to be compatible with the 2.6.x version configuration, when Zookeeper is used as the registration center and the configuration center is not displayed, the Dubbo framework will use this Zookeeper as the configuration center by default, but it will only be used for service governance.