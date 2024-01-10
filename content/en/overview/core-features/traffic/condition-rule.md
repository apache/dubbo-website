---
aliases:
    - /en/overview/core-features/traffic/condition-rule/
description: ""
linkTitle: Conditional Routing
title:  Conditional Routing Rules
type: docs
weight: 1
---



Conditional routing rules forward requests that meet specific conditions to a subset of destination instances. The rules match the request parameters of incoming traffic, and requests that meet the matching criteria are forwarded to a subset that contains a specific list of instance addresses.

Here is an example of a conditional routing rule.

Based on the following example rule, all invocations of the `getComment` method in the `org.apache.dubbo.samples.CommentService` service will be forwarded to a subset of addresses marked with `region=Hangzhou`.

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

  You can refer to specific example code for conditional routing [here](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-configconditionrouter/src/main/java/org/apache/dubbo/samples/governance).
## ConditionRule
The body of a conditional routing rule defines the target service or application on which the routing rule will take effect, the traffic filtering conditions, and the behaviors in certain specific scenarios.

| Field | Type | Description                                                                                                                                                                                                                                                                                                                                                                                                   | Required |
| --- | --- |---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| --- |
| configVersion | string | The version of the condition rule definition, currently available version is `v3.0`                                                                                                                                                                                                                                                                                                                           | Yes |
| scope | string | Supports `service` and `application` scope rules.                                                                                                                                                                                                                                                                                                                                                             | Yes |
| key | string | The identifier of the target service or application that this rule is about to apply to. <br/><br/>- If `scope:service`is set, then `key`should be specified as the Dubbo service key that this rule targets to control.<br/> - If `scope:application` is set, then `key`should be specified as the name of the application that this rule targets to control, application should always be a Dubbo Consumer. | Yes |
| enabled | bool | Whether enable this rule or not, set `enabled:false` to disable this rule.                                                                                                                                                                                                                                                                                                                                    | Yes |
| conditions | string[] | The condition routing rule definition of this configuration. Check [Condition](./#condition) for details                                                                                                                                                                                                                                                                                                      | Yes |
| force | bool | The behavior when the instance subset is empty after routing. `true` means return no provider exception while `false` means ignore this rule.                                                                                                                                                                                                                                                          | No |
| runtime | bool | Whether run routing rule for every rpc invocation or use routing cache if available.                                                                                                                                                                                                                                                                                                                          | No |

## Condition

The `Condition` serves as the body of a conditional routing rule and is of type string with a composite structure, such as `method=getComment => region=Hangzhou`. Here:

* The conditions before the `=>` symbol indicate the request parameter matching conditions. The specified `matching conditions` are compared with the consumer's request context (URL) or even method parameters. When the consumer satisfies the matching conditions, the address subset filtering rules following the conditions will be applied to the consumer.
* The conditions after the `=>` symbol represent the address subset filtering conditions. The specified  `filtering conditions` are compared with the provider instance addresses (URLs). The consumer can only access instances that meet the filtering conditions, ensuring that traffic is only sent to the subset of addresses that meet the conditions.
    * If the matching conditions are empty, it means the rule applies to all requests, for example:`=> status != staging`
    * If the filtering conditions are empty, it denies access from the corresponding requests, for example: `application = product =>`

### Matching/Filtering Conditions

**Parameter Support**
* Service invocation context, such as interface, method, group, version, etc.
* Request context, such as attachments[key] = value.
* Method parameters, such as arguments[0] = tom.
* Fields in the URL itself, such as protocol, host, port, etc.
* Additional parameters on the URL, such as application, organization, etc.
* Supports developer-defined extensions.

**Condition Support**
* The equal sign (=) represents "match," for example: method = getComment.
* The not-equal sign (!=) represents "not match," for example: method != getComment.

**Value Support**
* Multiple values separated by commas (,), for example: host != 10.20.153.10,10.20.153.11.
* Ending with an asterisk () denotes wildcard matching, for example: host != 10.20..
* Starting with a dollar sign ($) indicates referencing consumer parameters, for example: region = $region.
* Integer value ranges, for example: userId = 1~100, userId = 101~.
* Supports developer-defined extensions.
