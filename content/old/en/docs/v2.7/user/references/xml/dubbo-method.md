---
type: docs
title: "dubbo:method"
linkTitle: "dubbo:method"
weight: 1 
description: "dubbo:method element"
---


Method level configuration. The corresponding class: `org.apache.dubbo.config.MethodConfig`. This tag is a child tag of `<dubbo:service>` or `<dubbo:reference>`, for accuracy to method level.

| Property | Corresponding URL parameter | Type | Requisite | Default | Effect | Description | Compatibility |
| --- | --- | ---- | --- | --- | --- | --- | --- |
| name | | string | <b>Y</b> | | identifier | Method name | above 1.0.8 |
| timeout | &lt;metodName&gt;.timeout | int | N | &lt;dubbo:reference&gt; timeout | performance optimization | Method call timeout(ms)| above 1.0.8 |
| retries | &lt;metodName&gt;.retries | int | N | &lt;dubbo:reference&gt; retries | performance optimization | Invoking retry times, exclude the first invoking. Set 0 to disable it| above 2.0.0 |
| loadbalance | &lt;metodName&gt;.loadbalance | string | N | &lt;dubbo:reference&gt; loadbalance | performance optimization | Load balancing strategy. Choices：random, roundrobin(polling), leastactive(invoking least active service) | above 2.0.0 |
| async | &lt;metodName&gt;.async | boolean | N |&lt;dubbo:reference&gt; async | performance optimization | Whether invoke asynchronously | above 1.0.9 |
| sent | &lt;methodName&gt;.sent | boolean | N | true | performance optimization | Generally used when async is true, and If true, indicate that the network has sent out data | above 2.0.6 |
| actives | &lt;metodName&gt;.actives | int | N | 0 | performance optimization | The max concurrency of per service method for each corresponding consumer | above 2.0.5 |
| executes | &lt;metodName&gt;.executes | int | N | 0 | performance optimization | The maximum number of threads of per service method is limited&#45; &#45;. Only take effect when &lt;dubbo:method&gt; is &lt;dubbo:service&gt; child tag | above 2.0.5 |
| deprecated | &lt;methodName&gt;.deprecated | boolean | N | false | service governance | Whether is deprecated method. Only take effect when &lt;dubbo:method&gt; is &lt;dubbo:service&gt; child tag | above 2.0.5 |
| sticky | &lt;methodName&gt;.sticky | boolean | N | false | service governance | If true, all methods on this interface use the same provider. If more complex rules are required, use routing | above 2.0.6 |
| return | &lt;methodName&gt;.return | boolean | N | true | performance optimization | Whether need return value. Only take effect when async is true. If true, return future, or callback such as "onreturn" method. Otherwise, return null. | above 2.0.6 |
| oninvoke |  | String | N | | performance optimization | Intercept before invoke | above 2.0.6 |
| onreturn |  | String | N | | performance optimization | Intercept after invoke| above 2.0.6 |
| onthrow |  | String | N | | performance optimization | Intercept when catch exception | above 2.0.6 |
| cache | &lt;methodName&gt;.cache | string/boolean | N | | service governance | Cache return result, and key is call parameters. Choices: lru, threadlocal, jcache and so on | at least 2.1.0 |
| validation | &lt;methodName&gt;.validation | boolean | N | | service governance | Whether enable JSR303 standard annotation validation| at least 2.1.0|

For example:

```xml
<dubbo:reference interface="com.xxx.XxxService">
    <dubbo:method name="findXxx" timeout="3000" retries="2" />
</dubbo:reference>
```
