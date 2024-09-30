---
aliases:
    - /en/overview/core-features/traffic/tag-rule/
    - /en/overview/core-features/traffic/tag-rule/
description: ""
linkTitle: Tag Routing
title: Tag Routing Rules
type: docs
weight: 2
---



Tag routing divides instances of a service into different groups, constraining traffic with specific tags to flow only within designated groups. Different groups serve different traffic scenarios, achieving traffic isolation. This can be the basis for scenarios such as blue-green deployment and canary release. Currently, there are two ways to tag instances: `dynamic rule tagging` and `static rule tagging`. `Dynamic rule tagging` can dynamically enclose a group of machine instances at runtime, while `static rule tagging` requires instance restart to take effect. Dynamic rules have higher priority compared to static rules, and when both rules exist and conflict, dynamic rules will prevail.

This article discusses tag routing rules, specifically `dynamic rule tagging`.

Tag routing is a strictly isolated traffic system. For the same application, once tagged, the subset of addresses is isolated. Only requests with the corresponding tag can access this subset of addresses. This subset will no longer receive traffic without tags or with different tags.

For example, if we tag an application and divide it into three address subsets: tag-a, tag-b, and no tag, then the traffic accessing this application will either route to tag-a (when the request context dubbo.tag=tag-a), route to tag-b (dubbo.tag=tag-b), or route to the no tag address subset (dubbo.tag not set). There will be no mixed routing.

The scope of tag routing is the provider application, and the consumer application does not need to configure tag routing rules. All services within a provider application can only have one grouping rule. There will not be a situation where service A uses one routing rule and service B uses another. The following conditional routing example encloses an isolated environment `gray` in the `shop-detail` application. The `gray` environment includes all machine instances marked with `env=gray`.

```yaml
configVersion: v3.0
force: true
enabled: true
key: shop-detail
tags:
  - name: gray
    match:
      - key: env
        value:
          exact: gray
```
## TagRule
The main body of the tag routing rule. Defines the target application for which the routing rule is effective, tag classification rules, and behaviors in specific scenarios.

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| configVersion | string | The version of the tag rule definition, currently available version is `v3.0` | Yes |
| key | string | The identifier of the target application that this rule is about to control| Yes |
| enabled | bool | Whether to enable this rule or not, set `enabled:false` to disable this rule. | Yes |
| tags | Tag[] | The tag definition of this rule. | Yes |
| force | bool | The behavior when the instance subset is empty after routing. `true` means return no provider exception while `false` means fallback to subset without any tags. | No |
| runtime | bool | Whether to run the routing rule for every RPC invocation or use routing cache if available. | No |

## Tag
Tag definition, filtering out a subset of addresses based on `match` conditions.

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | The name of the tag used to match the `dubbo.tag` value in the request context. | Yes |
| match | MatchCondition | A set of criteria to be met for instances to be classified as members of this tag.  | No |

## MatchCondition
Defines instance filtering conditions based on specific parameters in the Dubbo URL address.

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| key | string | The name of the key in the Dubbo URL address. | Yes |
| value | StringMatch (oneof) | The matching condition for the value in the Dubbo URL address. | Yes |
