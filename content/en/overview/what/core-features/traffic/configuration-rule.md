---
aliases:
    - /en/overview/core-features/traffic/configuration-rule/
    - /en/overview/core-features/traffic/configuration-rule/
description: ""
linkTitle: Dynamic Configuration
title: Configuration Rule
type: docs
weight: 4
---


Configuration Rule (ConfigurationRule) is a capability designed by Dubbo to dynamically adjust RPC call behavior without restarting the application. It is also known as a dynamic override rule because it changes RPC call behavior by overriding various parameter values of Dubbo instances or URLs within Dubbo instances at runtime.

When using configuration rules, there are several key points to note:
* **Set rule effective filter conditions.** Configuration rules support a series of filter conditions to limit the rules to only apply to services, applications, or instances that meet specific conditions.
* **Set rule effective scope.** An RPC service has two roles: the service initiator (consumer) and the service handler (provider). Rules defined for a service can be specifically limited to take effect on either the consumer or the provider.
* **Choose rule management granularity.** Dubbo supports managing and issuing rules from both service and application granularities.

The following is an application-level configuration example. After the configuration takes effect, all services provided under the `shop-detail` application will enable accesslog, and it will take effect on all instances deployed under `shop-detail`.

```yaml
configVersion: v3.0
scope: application
key: shop-detail
configs:
  - side: provider
    parameters:
      accesslog: 'true'
```

The following is a service-level configuration example. `key: org.apache.dubbo.samples.UserService` and `side: consumer` indicate that this configuration applies to all Dubbo instances consuming UserService, executing 4 retries after a call failure. The `match` condition further restricts the scope of the consumer to only the consumer application named `shop-frontend`.

```yaml
configVersion: v3.0
scope: service
key: org.apache.dubbo.samples.UserService
configs:
  - match:
      application:
        oneof:
          - exact: shop-frontend
    side: consumer
    parameters:
      retries: '4'
```
## ConfigurationRule
The main body of the configuration rule, defining the target service or application to be set and the specific rule configuration. Multiple specific configuration rules (configs) can be set.

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| configVersion | string | The version of the configuration rule definition, currently available version is `v3.0` | Yes |
| scope | string | Supports `service` and `application` scope configurations.  | Yes |
| key | string | The identifier of the target service or application that this rule is about to apply to. <br/><br/>- If `scope:service`is set, then `key`should be specified as the Dubbo service key that this rule targets to control.<br/> - If `scope:application` is set, then `key`should be specified as the name of the application that this rule targets to control.| Yes |
| enabled | bool | Whether to enable this rule or not, set `enabled:false` to disable this rule. | Yes |
| configs | Config[] | The `match condition` and `configuration` of this rule. | Yes |

## Config
The specific rule configuration definition, including the effective side (consumer or provider) and filter conditions.

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| side | string | Especially useful when `scope:service`is set.<br/><br/>- `side: provider`means this Config will only take effect on the provider instances of the service key.<br/>- `side:consumer`means this Config will only take effect on the consumer instances of the service key| Yes |
| parameters | map<string, string> | The keys and values this rule aims to change. | Yes |
| match | MatchCondition | A set of criteria to be met in order for the rule/config to be applied to the Dubbo instance.  | No |
| enabled | bool | Whether to enable this Config or not, will use the value in ConfigurationRule if not set | No |
| ~~addresses~~ | ~~string[]~~ | ~~replaced with address in MatchCondition~~ | ~~No~~ |
| ~~providerAddresses~~ | ~~string[]~~ | ~~not supported anymore~~ | ~~No~~ |
| ~~services~~ | ~~string[]~~ | ~~replaced with service in MatchCondition~~ | ~~No~~ |
| ~~applications~~ | ~~string[]~~ | ~~replaced with application in MatchCondition~~ | ~~No~~ |

## MatchCondition
Filter conditions used to set rules for which service, application, instance (address), or instances containing specific parameters (param) are effective.

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| address | StringMatch | The instance address matching condition for this config rule to take effect.<br/><br/>- exact: "value" for exact string match<br/>- prefix: "value" for prefix-based match<br/>- regex: "value" for RE2 style regex-based match ([https://github.com/google/re2/wiki/Syntax)](https://github.com/google/re2/wiki/Syntax)).| No |
| service | StringMatch (oneof) | The service matching condition for this config rule to take effect. Effective when `scope: application` is set.<br/><br/>- exact: "value" for exact string match<br/>- prefix: "value" for prefix-based match<br/>- regex: "value" for RE2 style regex-based match ([https://github.com/google/re2/wiki/Syntax)](https://github.com/google/re2/wiki/Syntax)).| No |
| application | StringMatch (oneof) | The application matching condition for this config rule to take effect. Effective when `scope: service` is set.<br/><br/>- exact: "value" for exact string match<br/>- prefix: "value" for prefix-based match<br/>- regex: "value" for RE2 style regex-based match ([https://github.com/google/re2/wiki/Syntax)](https://github.com/google/re2/wiki/Syntax)).| No |
| param | ParamCondition[] | The Dubbo url keys and values matching condition for this config rule to take effect. | No |

## ParamCondition
Defines instance parameter (param) filter conditions, corresponding to Dubbo URL address parameters.

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| key | string | The name of the key in the Dubbo url address. | Yes |
| value | StringMatch (oneof) | The matching condition for the value in the Dubbo url address. | Yes |

## StringMatch
| Field | Type | Description | Required |
| --- | --- | --- | --- |
| exact | string (oneof) | exact string match | No |
| prefix | string (oneof) | prefix-based match | No |
| regex | string (oneof) | RE2 style regex-based match ([https://github.com/google/re2/wiki/Syntax)](https://github.com/google/re2/wiki/Syntax)). | No |

It seems like you haven't pasted the Markdown content yet. Please provide the content you need translated, and I'll assist you accordingly.
