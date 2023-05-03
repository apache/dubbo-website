---
aliases:
    - /zh/docs/references/xml/dubbo-method/
description: dubbo:method 配置
linkTitle: dubbo:method
title: dubbo:method
type: docs
weight: 1
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/config/properties/#method)。
{{% /pageinfo %}}

方法级配置。对应的配置类： `org.apache.dubbo.config.MethodConfig`。同时该标签为 `<dubbo:service>` 或 `<dubbo:reference>` 的子标签，用于控制到方法级。

| 属性 | 对应URL参数 | 类型 | 是否必填 | 缺省值 | 作用 | 描述 | 兼容性 |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | | string | <b>必填</b> | | 标识 | 方法名 | 1.0.8以上版本 |
| timeout | &lt;methodName&gt;.timeout | int | 可选 | 缺省为的timeout | 性能调优 | 方法调用超时时间(毫秒) | 1.0.8以上版本 |
| retries | &lt;methodName&gt;.retries | int | 可选 | 缺省为&lt;dubbo:reference&gt;的retries | 性能调优 | 远程服务调用重试次数，不包括第一次调用，不需要重试请设为0 | 2.0.0以上版本 |
| loadbalance | &lt;methodName&gt;.loadbalance | string | 可选 | 缺省为的loadbalance | 性能调优 | 负载均衡策略，可选值：random,roundrobin,leastactive，分别表示：随机，轮询，最少活跃调用 | 2.0.0以上版本 |
| async | &lt;methodName&gt;.async | boolean | 可选 | 缺省为&lt;dubbo:reference&gt;的async | 性能调优 | 是否异步执行，不可靠异步，只是忽略返回值，不阻塞执行线程 | 1.0.9以上版本 |
| sent | &lt;methodName&gt;.sent | boolean | 可选 | true | 性能调优 | 异步调用时，标记sent=true时，表示网络已发出数据 | 2.0.6以上版本 |
| actives | &lt;methodName&gt;.actives | int | 可选 | 0 | 性能调优 | 每服务消费者最大并发调用限制 | 2.0.5以上版本 |
| executes | &lt;methodName&gt;.executes | int | 可选 | 0 | 性能调优 | 每服务每方法最大使用线程数限制&#45; &#45;，此属性只在&lt;dubbo:method&gt;作为&lt;dubbo:service&gt;子标签时有效 | 2.0.5以上版本 |
| deprecated | &lt;methodName&gt;.deprecated | boolean | 可选 | false | 服务治理 | 服务方法是否过时，此属性只在&lt;dubbo:method&gt;作为&lt;dubbo:service&gt;子标签时有效 | 2.0.5以上版本 |
| sticky | &lt;methodName&gt;.sticky | boolean | 可选 | false | 服务治理 | 设置true 该接口上的所有方法使用同一个provider.如果需要更复杂的规则，请使用路由 | 2.0.6以上版本 |
| return | &lt;methodName&gt;.return | boolean | 可选 | true | 性能调优 | 方法调用是否需要返回值,async设置为true时才生效，如果设置为true，则返回future，或回调onreturn等方法，如果设置为false，则请求发送成功后直接返回Null | 2.0.6以上版本 |
| oninvoke | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 方法执行前拦截 | 2.0.6以上版本 |
| onreturn | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 方法执行返回后拦截 | 2.0.6以上版本 |
| onthrow | attribute属性，不在URL中体现 | String | 可选 | | 性能调优 | 方法执行有异常拦截 | 2.0.6以上版本 |
| cache | &lt;methodName&gt;.cache | string/boolean | 可选 | | 服务治理 | 以调用参数为key，缓存返回结果，可选：lru, threadlocal, jcache等 | Dubbo2.1.0及其以上版本支持 |
| validation | &lt;methodName&gt;.validation | boolean | 可选 | | 服务治理 | 是否启用JSR303标准注解验证，如果启用，将对方法参数上的注解进行校验 | Dubbo2.1.0及其以上版本支持 |

比如:  

```xml
<dubbo:reference interface="com.xxx.XxxService">
    <dubbo:method name="findXxx" timeout="3000" retries="2" />
</dubbo:reference>
```
