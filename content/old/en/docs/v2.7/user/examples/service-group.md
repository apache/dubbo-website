---
type: docs
title: "Service Group"
linkTitle: "Service Group"
weight: 11
description: "Grouping service in dubbo"
---

When you have multi-impls of a interface,you can distinguish them with the group.

## Service

```xml
<dubbo:service group="feedback" interface="com.xxx.IndexService" />
<dubbo:service group="member" interface="com.xxx.IndexService" />
```

## Reference

```xml
<dubbo:reference id="feedbackIndexService" group="feedback" interface="com.xxx.IndexService" />
<dubbo:reference id="memberIndexService" group="member" interface="com.xxx.IndewxService" />
```

Any group:

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" group="*" />
```

{{% alert title="Warning" color="warning" %}}
`group="*"` is supported after version `2.2.0`, always select only one available group of implementations to invoke.
{{% /alert %}}



