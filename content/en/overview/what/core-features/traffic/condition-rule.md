---
aliases:
    - /en/overview/core-features/traffic/condition-rule/
    - /en/overview/core-features/traffic/condition-rule/
description: ""
linkTitle: Condition Routing
title: Condition Routing Rules
type: docs
weight: 1

---

Condition routing rules forward requests that meet specific conditions to a subset of specific address instances. The rules first match the request parameters that initiate the traffic, and requests that meet the matching conditions will be forwarded to a subset containing a specific list of instance addresses.

Below is an example of a condition routing rule.

Based on the following example rule, all calls to the `getComment` method of the `org.apache.dubbo.samples.CommentService` service will be forwarded to the subset of addresses marked with `region=Hangzhou`.

  ```yaml
  configVersion: v3.0
  scope: service
  force: true
  runtime: true
  enabled: true
  key: org.apache.dubbo.samples.CommentService
  conditions:
    - method=getComment => region=Hangzhou
  ```

You can see the specific example code: [Condition Routing](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-configconditionrouter/src/main/java/org/apache/dubbo/samples/governance)

## ConditionRule

The main body of the condition routing rule. Defines the target service or application where the routing rule takes effect, traffic filtering conditions, and behaviors in some specific scenarios.

| Field Name    | Type     | **Description**                                                     | Required |
| --- | --- |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ---- |
| configVersion | string   | The version of the condition routing, the current version is `v3.0`                            | Yes   |
| scope         | string   | Supports two rules: `service` and `application`                     | Yes   |
| key           | string   | Identifier of the target service or application to which it applies<br/><br/>- When `scope:service`, `key` should be the service name where the rule takes effect, such as org.apache.dubbo.samples.CommentService<br/> - When `scope:application`, then `key` should be the application name where the rule should take effect, such as my-dubbo-service. | Yes   |
| enabled       | bool     | Whether the rule is effective. When `enabled:false`, the rule is not effective               | Yes   |
| conditions    | string[] | Condition rules defined in the configuration, see [Condition Rules](https://cn.dubbo.apache.org/zh-cn/overview/core-features/traffic/condition-rule/#condition) for details | Yes   |
| force         | bool     | Behavior when the subset of instances after routing is empty. `true` throws a No Provider Exception. `false` ignores the rule and directly requests other instances. The default value is false | No   |
| runtime       | bool     | Whether to run the routing rule for each RPC call or use the routing cache (if available). The default value is false (false uses the cache, true does not use the cache) | No   |

## Condition

`Condition` is the main body of the conditional routing rule, which is a composite string type, such as `method=getComment => region=Hangzhou`. Among them,

* The part before `=>` is the request parameter matching condition. The `parameters specified in the matching condition` will be compared with the `consumer's request context (URL), and even method parameters`. When the consumer meets the matching condition, the address subset filtering rule after `=>` will be executed for that consumer.
* The part after `=>` is the address subset filtering condition. The `parameters specified in the filtering condition` will be compared with the `provider instance address (URL)`. The consumer will ultimately only get the list of instances that meet the filtering condition, ensuring that traffic is only sent to the address subset that meets the condition.
  * If the matching condition is empty, it means it applies to all requests, such as: `=> status != staging`
  * If the filtering condition is empty, it means access from the corresponding request is prohibited, such as: `application = product =>`

### Matching/Filtering Conditions

**Parameter Support**

* Service invocation context, such as: interface, method, group, version, etc.
* Request context, such as attachments[key] = value
* Method parameters, such as arguments[0] = tom
* Fields of the URL itself, such as: protocol, host, port, etc.
* Extended parameters on the URL, such as: application, organization, etc.
* Support for developer-defined extensions

**Condition Support**

* Equal sign = means "match", such as: method = getComment
* Not equal sign != means "not match", such as: method != getComment

**Value Support**

* Multiple values separated by commas `,`, such as: host != 10.20.153.10,10.20.153.11
* Ends with an asterisk `*`, indicating a wildcard, such as: host != 10.20.*
* Starts with a dollar sign `$`, indicating a reference to a consumer parameter, such as: region = $region
* Integer value ranges, such as: userId = 1~100, userId = 101~
* Support for developer-defined extensions
