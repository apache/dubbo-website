---
aliases:
    - /zh/overview/core-features/traffic/configuration-rule/
description: ""
linkTitle: 动态配置
title: 动态配置规则
type: docs
weight: 4
---


动态配置规则 (ConfigurationRule) 是 Dubbo 设计的在无需重启应用的情况下，动态调整 RPC 调用行为的一种能力，也称为动态覆盖规则，因为它是通过在运行态覆盖 Dubbo 实例或者 Dubbo 实例中 URL 地址的各种参数值，实现改变 RPC 调用行为的能力。

使用动态配置规则，有以下几条关键信息值得注意：
* **设置规则生效过滤条件。** 配置规则支持一系列的过滤条件，用来限定规则只对符合特定条件的服务、应用或实例才生效。
* **设置规则生效范围。** 一个 rpc 服务有服务发起方（消费者）和服务处理方（提供者）两个角色，对某一个服务定义的规则，可以具体到限制是对消费者还是提供者生效。
* **选择规则管理粒度。** Dubbo 支持从服务和应用两个粒度来管理和下发规则。

以下一个应用级别的配置示例，配置生效后，`shop-detail` 应用下提供的所有服务都将启用 accesslog，对 `shop-detail` 部署的所有实例生效。

```yaml
configVersion: v3.0
scope: application
key: shop-detail
configs:
  - side: provider
    parameters:
      accesslog: 'true'
```

以下是一个服务级别的配置示例，`key: org.apache.dubbo.samples.UserService` 和 `side: consumer` 说明这条配置对所有正在消费 UserService 的 Dubbo 实例生效，在调用失败后都执行 4 次重试。`match` 条件进一步限制了消费端的范围，限定为只对应用名为 `shop-frontend` 的这个消费端应用生效。

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
配置规则主体，定义要设置的目标服务或应用、具体的规则配置。具体配置规则 (configs) 可以设置多条。

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| configVersion | string | The version of the configuration rule definition, currently available version is `v3.0` | Yes |
| scope | string | Supports `service` and `application` scope configurations.  | Yes |
| key | string | The identifier of the target service or application that this rule is about to apply to. <br/><br/>- If `scope:service`is set, then `key`should be specified as the Dubbo service key that this rule targets to control.<br/> - If `scope:application` is set, then `key`should be specified as the name of the application that this rule targets to control.| Yes |
| enabled | bool | Whether enable this rule or not, set `enabled:false` to disable this rule. | Yes |
| configs | Config[] | The `match condition` and `configuration` of this rule. | Yes |

## Config
具体的规则配置定义，包含生效端 (consumer 或 provider) 和过滤条件。

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| side | string | Especially useful when `scope:service`is set.<br/><br/>- `side: provider`means this Config will only take effect on the provider instances of the service key.<br/>- `side:consumer`means this Config will only take effect on the consumer instances of the service key| Yes |
| parameters | map<string, string> | The keys and values this rule aims to change. | Yes |
| match | MatchCondition | A set of criterion to be met in order for the rule/config to be applied to the Dubbo instance.  | No |
| enabled | bool | Whether enable this Config or not, will use the value in ConfigurationRule if not set | No |
| ~~addresses~~ | ~~string[]~~ | ~~replaced with address in MatchCondition~~ | ~~No~~ |
| ~~providerAddresses~~ | ~~string[]~~ | ~~not supported anymore~~ | ~~No~~ |
| ~~services~~ | ~~string[]~~ | ~~replaced with service in MatchCondition~~ | ~~No~~ |
| ~~applications~~ | ~~string[]~~ | ~~replaced with application in MatchCondition~~ | ~~No~~ |

## MatchCondition
过滤条件，用来设置规则对哪个服务 (service)、应用 (application)、实例 (address)，或者包含哪些参数 (param) 的实例生效。

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| address | StringMatch | The instance address matching condition for this config rule to take effect.<br/><br/>- xact: "value" for exact string match<br/>- prefix: "value" for prefix-based match<br/>- regex: "value" for RE2 style regex-based match ([https://github.com/google/re2/wiki/Syntax)](https://github.com/google/re2/wiki/Syntax)).| No |
| service | StringMatch (oneof) | The service matching condition for this config rule to take effect. Effective when `scope: application` is set.<br/><br/>- exact: "value" for exact string match<br/>- prefix: "value" for prefix-based match<br/>- regex: "value" for RE2 style regex-based match ([https://github.com/google/re2/wiki/Syntax)](https://github.com/google/re2/wiki/Syntax)).| No |
| application | StringMatch (oneof) | The application matching condition for this config rule to take effect. Effective when `scope: service` is set.<br/><br/>- exact: "value" for exact string match<br/>- prefix: "value" for prefix-based match<br/>- regex: "value" for RE2 style regex-based match ([https://github.com/google/re2/wiki/Syntax)](https://github.com/google/re2/wiki/Syntax)).| No |
| param | ParamCondition[] | The Dubbo url keys and values matching condition for this config rule to take effect. | No |

## ParamCondition
定义实例参数 (param) 过滤条件，对应到 Dubbo URL 地址参数。

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
