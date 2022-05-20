---
type: docs
title: "dubbo:parameter"
linkTitle: "dubbo:parameter"
weight: 1 
description: "dubbo:parameter element"
---

Optional parameter configuration. The corresponding class is `java.util.Map`. This tag is used as a sub tag to configure custom parameters for extending `<dubbo:protocol>`, `<dubbo:service>`, `<dubbo:provider>`, `<dubbo:reference>` or `<dubbo:consumer>`.

| Attribute | Corresponding URL parameter | Type   | Required    | Default Value | Function           | Description             | Compatibility |
| --------- | --------------------------- | ------ | ----------- | ------------- | ------------------ | ----------------------- | ------------- |
| key       | key                         | string | <b>True</b> |               | Service governance | routing parameter key   | Above 2.0.0   |
| value     | value                       | string | <b>True</b> |               | Service governance | routing parameter value | Above 2.0.0   |

For example：

```xml
<dubbo:protocol name="napoli">
    <dubbo:parameter key="http://10.20.160.198/wiki/display/dubbo/napoli.queue.name" value="xxx" />
</dubbo:protocol>
```

you can also use it like this: 

```xml
<dubbo:protocol name="jms" p:queue="xxx" />
```
