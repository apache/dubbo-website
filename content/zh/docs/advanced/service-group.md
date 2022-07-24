---
type: docs
title: "服务分组"
linkTitle: "服务分组"
weight: 11
description: "使用服务分组区分服务接口的不同实现"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/advanced-features-and-usage/service/service-group/)。
{{% /pageinfo %}}

当一个接口有多种实现时，可以用 group 区分。

## 服务

```xml
<dubbo:service group="feedback" interface="com.xxx.IndexService" />
<dubbo:service group="member" interface="com.xxx.IndexService" />
```

## 引用

```xml
<dubbo:reference id="feedbackIndexService" group="feedback" interface="com.xxx.IndexService" />
<dubbo:reference id="memberIndexService" group="member" interface="com.xxx.IndexService" />
```

任意组：

```xml
<dubbo:reference id="barService" interface="com.foo.BarService" group="*" />
```

{{% alert title="提示" color="primary" %}}
`2.2.0` 以上版本支持，总是只调一个可用组的实现
{{% /alert %}}
