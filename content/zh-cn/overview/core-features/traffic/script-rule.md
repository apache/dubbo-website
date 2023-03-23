---
aliases:
    - /zh/overview/core-features/traffic/script-rule/
description: ""
linkTitle: 脚本路由
title: 脚本路由规则
type: docs
weight: 3
---



脚本路由为流量管理提供了最大的灵活性，所有流量在执行负载均衡选址之前，都会动态的执行一遍规则脚本，根据脚本执行的结果确定可用的地址子集。

脚本路由只对消费者生效且只支持应用粒度管理，因此， `key` 必须设置为消费者应用名；脚本语法支持多种，以 Dubbo Java SDK 为例，脚本语法支持 Javascript、Groovy、Kotlin 等，具体可参见每个语言实现的限制。

> 脚本路由由于可以动态加载远端代码执行，因此存在潜在的安全隐患，在启用脚本路由前，一定要确保脚本规则在安全沙箱内运行。

```yaml
configVersion: v3.0
key: demo-provider
type: javascript
enabled: true
script: |
  (function route(invokers,invocation,context) {
      var result = new java.util.ArrayList(invokers.size());
      for (i = 0; i < invokers.size(); i ++) {
          if ("10.20.3.3".equals(invokers.get(i).getUrl().getHost())) {
              result.add(invokers.get(i));
          }
      }
      return result;
  } (invokers, invocation, context)); // 表示立即执行方法
```

## ScriptRule
脚本路由规则主体。定义脚本规则生效的目标消费者应用、流量过滤脚本以及一些特定场景下的行为。

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| configVersion | string | The version of the script rule definition, currently available version is `v3.0` | Yes |
| key | string | The identifier of the target application that this rule is about to apply to.| Yes |
| type | string | The script language used to define `script`. | Yes |
| enabled | bool | Whether enable this rule or not, set `enabled:false` to disable this rule. | Yes |
| script | string | The script definition used to filter dubbo provider instances. | Yes |
| force | bool | The behaviour when the instance subset is empty after after routing. `true` means return no provider exception while `false` means ignore this rule. | No |

## Script
`script` 为脚本路由规则的主体，类型为一个具有符合结构的 string 字符串，具体取决于 `type` 指定的脚本语言。

以下是 `type: javascript` 的一个脚本规则示例：

```javascript
(function route(invokers,invocation,context) {
      var result = new java.util.ArrayList(invokers.size());
      for (i = 0; i < invokers.size(); i ++) {
          if ("10.20.3.3".equals(invokers.get(i).getUrl().getHost())) {
              result.add(invokers.get(i));
          }
      }
      return result;
  } (invokers, invocation, context)); // 表示立即执行方法
```
