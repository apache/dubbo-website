---
aliases:
  - /zh/docs3-v2/rust-sdk/router-module/condition-router/
  - /zh-cn/docs3-v2/rust-sdk/router-module/condition-router/
description: "条件路由"
linkTitle: 条件路由
title: 条件路由规则
type: docs
weight: 2
---


条件路由规则将符合特定条件的请求转发到特定的地址实例子集上。规则首先对发起流量的请求参数进行匹配，符合匹配条件的请求将被转发到包含特定实例地址列表的子集。

以下是一个条件路由规则示例。

基于以下示例规则，所有 `org.apache.dubbo.samples.CommentService` 服务 `getComment`
方法的调用都将被转发到有 `region=Hangzhou` 标记的地址子集

```yaml
configVersion: v1.0
scope: "service"
force: false
enabled: true
key: "org.apache.dubbo.sample.tri.Greeter"
conditions:
  - method=greet => port=8889
```

```yaml
configVersion: v1.0
scope: "application"
force: false
enabled: true
key: application
conditions:
  - ip=127.0.0.1 => port=8000~8888
```
注：
dubbo rust目前还没有实现对于**应用**的区分，无法区分服务来自哪个应用；
因此对于标签路由和条件路由，都仅能配置一条应用级别的配置
对于应用级别的配置，默认key指定为application，此配置将对全部服务生效

## ConditionRule

条件路由规则主体。定义路由规则生效的目标服务或应用、流量过滤条件以及一些特定场景下的行为。

| Field         | Type     | Description                                                                                                                                                                                                                                                                                                                                                                                                   | Required |
|---------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| configVersion | string   | The version of the condition rule definition, currently available version is `v1.0`                                                                                                                                                                                                                                                                                                                           | Yes      |
| scope         | string   | Supports `service` and `application` scope rules.                                                                                                                                                                                                                                                                                                                                                             | Yes      |
| key           | string   | The identifier of the target service or application that this rule is about to apply to. <br/><br/>- If `scope:service`is set, then `key`should be specified as the Dubbo service key that this rule targets to control.<br/> - If `scope:application` is set, then `key`should be specified as the name of the application that this rule targets to control, application should always be a Dubbo Consumer. | Yes      |
| enabled       | bool     | Whether enable this rule or not, set `enabled:false` to disable this rule.                                                                                                                                                                                                                                                                                                                                    | Yes      |
| conditions    | string[] | The condition routing rule definition of this configuration. Check [Condition](./#condition) for details                                                                                                                                                                                                                                                                                                      | Yes      |
| force         | bool     | The behaviour when the instance subset is empty after after routing. `true` means return no provider exception while `false` means ignore this rule.                                                                                                                                                                                                                                                          | No       |                                                                                                                                                                                                                                                                                            

## Condition

`Condition` 为条件路由规则的主体，类型为一个复合结构的 string 字符串，如 `method=getComment => region=Hangzhou`。其中，

* => 之前的为请求参数匹配条件，指定的 `匹配条件指定的参数` 将与 `消费者的请求上下文 (URL)、甚至方法参数`
  进行对比，当消费者满足匹配条件时，对该消费者执行后面的地址子集过滤规则。
* => 之后的为地址子集过滤条件，指定的 `过滤条件指定的参数` 将与 `提供者实例地址 (URL)`
  进行对比，消费者最终只能拿到符合过滤条件的实例列表，从而确保流量只会发送到符合条件的地址子集。
    * 如果匹配条件为空，表示对所有请求生效，如：`=> status != staging`
    * 如果过滤条件为空，表示禁止来自相应请求的访问，如：`application = product =>`

### 匹配/过滤条件

**参数支持**

* 服务调用上下文，如：service_name, method等
* URL 本身的字段，如：location, ip, port等
* URL params中存储的字段信息

**条件支持**

* 等号 = 表示 "匹配"，如：method = getComment
* 不等号 != 表示 "不匹配"，如：method != getComment

**值支持**

* 以逗号 , 分隔多个值，如：ip != 10.20.153.10,10.20.153.11
* 以星号 * 结尾，表示通配，如：ip != 10.20.*
* 整数值范围，如：port = 80~8080