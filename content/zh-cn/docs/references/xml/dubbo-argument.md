---
aliases:
    - /zh/docs/references/xml/dubbo-argument/
description: dubbo:argument 配置
linkTitle: dubbo:argument
title: dubbo:argument
type: docs
weight: 1
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/config/properties/#argument)。
{{% /pageinfo %}}

方法参数配置。对应的配置类： `org.apache.dubbo.config.ArgumentConfig`。该标签为 `<dubbo:method>` 的子标签，用于方法参数的特征描述，比如： 
 
```xml
<dubbo:method name="findXxx" timeout="3000" retries="2">
    <dubbo:argument index="0" callback="true" />
</dubbo:method>
```
| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| index | | int | <b>必填</b> | | 标识 | 参数索引 | 2.0.6以上版本 |
| type | | String | 与index二选一 | | 标识 | 通过参数类型查找参数的index | 2.0.6以上版本 |
| callback | &lt;metodName&gt;&lt;index&gt;.retries | boolean | 可选 | | 服务治理 | 参数是否为callback接口，如果为callback，服务提供方将生成反向代理，可以从服务提供方反向调用消费方，通常用于事件推送. | 2.0.6以上版本 |
