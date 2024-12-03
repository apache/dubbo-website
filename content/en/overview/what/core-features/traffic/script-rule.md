---
aliases:
    - /en/overview/core-features/traffic/script-rule/
    - /en/overview/core-features/traffic/script-rule/
description: ""
linkTitle: Script Routing
title: Script Routing Rules
type: docs
weight: 3
---



Script routing provides maximum flexibility for traffic management. All traffic will dynamically execute a rule script before performing load balancing selection, and the available address subset is determined based on the script execution results.

Script routing only affects consumers and only supports application-level management. Therefore, the `key` must be set to the consumer application name. The script syntax supports multiple languages. Taking the Dubbo Java SDK as an example, the script syntax supports Javascript, Groovy, Kotlin, etc. For specific limitations, refer to the implementation of each language.

> Since script routing can dynamically load and execute remote code, there are potential security risks. Ensure that the script rules run in a secure sandbox before enabling script routing.

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
  } (invokers, invocation, context));
```

## ScriptRule
The main body of the script routing rule. It defines the target consumer application for which the script rule is effective, the traffic filtering script, and behaviors in specific scenarios.

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| configVersion | string | The version of the script rule definition, currently available version is `v3.0` | Yes |
| key | string | The identifier of the target application that this rule is about to apply to.| Yes |
| type | string | The script language used to define `script`. | Yes |
| enabled | bool | Whether to enable this rule or not, set `enabled:false` to disable this rule. | Yes |
| script | string | The script definition used to filter dubbo provider instances. | Yes |
| force | bool | The behavior when the instance subset is empty after routing. `true` means return no provider exception while `false` means ignore this rule. | No |

## Script
`script` is the main body of the script routing rule, and its type is a string with a specific structure, depending on the script language specified by `type`.

The following is an example of a script rule with `type: javascript`:

```javascript
(function route(invokers,invocation,context) {
      var result = new java.util.ArrayList(invokers.size());
      for (i = 0; i < invokers.size(); i ++) {
          if ("10.20.3.3".equals(invokers.get(i).getUrl().getHost())) {
              result.add(invokers.get(i));
          }
      }
      return result;
  } (invokers, invocation, context));
```
