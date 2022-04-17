---
type: docs
title: "dubbo:argument"
linkTitle: "dubbo:argument"
weight: 1
description: "dubbo:argument element"
---

Method argument configuration. The corresponding class：`org.apache.dubbo.config.ArgumentConfig`. This tag is child of `<dubbo:method>`, which is for feature description of method argument, such as:

```xml
<dubbo:method name="findXxx" timeout="3000" retries="2">
    <dubbo:argument index="0" callback="true" />
</dubbo:method>
```
| Property | Corresponding URL parameter | Type | Requisite | Default | Effect | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| index | | int | <b>Y</b> | | identification | method name | above 2.0.6 |
| type | | String | Index and type choose one | | identification | Find index of argument by it | above 2.0.6 |
| callback | &lt;metodName&gt;&lt;index&gt;.retries | boolean | N | | service governance | Mark whether this argument is a callback service. If true, provider will generate reverse proxy,which can invoke consumer in turn. Generally for event pushing | above 2.0.6 |
