---
type: docs
title: "服务分组"
linkTitle: "服务分组"
weight: 11
description: "使用服务分组区分服务接口的不同实现"
---

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
