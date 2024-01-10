---
aliases:
    - /zh/overview/core-features/traffic/condition-rule/
description: ""
linkTitle: 条件路由
title: 条件路由规则
type: docs
weight: 1

---



条件路由规则将符合特定条件的请求转发到特定的地址实例子集上。规则首先对发起流量的请求参数进行匹配，符合匹配条件的请求将被转发到包含特定实例地址列表的子集。

以下是一个条件路由规则示例。

基于以下示例规则，所有 `org.apache.dubbo.samples.CommentService` 服务 `getComment` 方法的调用都将被转发到有 `region=Hangzhou` 标记的地址子集。

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

可以看具体的例子代码： [条件路由](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-configconditionrouter/src/main/java/org/apache/dubbo/samples/governance)

## ConditionRule

条件路由规则主体。定义路由规则生效的目标服务或应用、流量过滤条件以及一些特定场景下的行为。

| 字段名        | 类型     | **描述**                                                     | 必填 |
| --- | --- |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ---- |
| configVersion | string   | 条件路由的版本，当前版本为 `v3.0`                            | 是   |
| scope         | string   | 支持 `service` 和 `application` 两种规则                     | 是   |
| key           | string   | 应用到的目标服务或应用程序的标识符<br/><br/>- 当 `scope:service` 时,  `key`应该是该规则生效的服务名比如 org.apache.dubbo.samples.CommentService<br/> - 当 `scope:application` 时, then `key`应该是该规则应该生效的应用名称，比如说my-dubbo-service. | 是   |
| enabled       | bool     | 规则是否生效 当 `enabled:false` 时，规则不生效               | 是   |
| conditions    | string[] | 配置中定义的条件规则，详情可以看[条件规则](https://cn.dubbo.apache.org/zh-cn/overview/core-features/traffic/condition-rule/#condition) | 是   |
| force         | bool     | T路由后实例子集为空时的行为。 `true` 则抛出一个No Provider Exception。  `false` 则忽略规则，直接去请求其他的实例。默认值是false | 否   |
| runtime       | bool     | 是否为每个 rpc 调用运行路由规则或使用路由缓存（如果可用）。默认值是false（false则走缓存，true不走缓存） | 否   |

## Condition

`Condition` 为条件路由规则的主体，类型为一个复合结构的 string 字符串，如 `method=getComment => region=Hangzhou`。其中，

* => 之前的为请求参数匹配条件，指定的 `匹配条件指定的参数` 将与 `消费者的请求上下文 (URL)、甚至方法参数` 进行对比，当消费者满足匹配条件时，对该消费者执行后面的地址子集过滤规则。
* => 之后的为地址子集过滤条件，指定的 `过滤条件指定的参数` 将与 `提供者实例地址 (URL)` 进行对比，消费者最终只能拿到符合过滤条件的实例列表，从而确保流量只会发送到符合条件的地址子集。
  * 如果匹配条件为空，表示对所有请求生效，如：`=> status != staging`
  * 如果过滤条件为空，表示禁止来自相应请求的访问，如：`application = product =>`

### 匹配/过滤条件

**参数支持**

* 服务调用上下文，如：interface, method, group, version 等
* 请求上下文，如 attachments[key] = value
* 方法参数，如 arguments[0] = tom
* URL 本身的字段，如：protocol, host, port 等
* URL 上任务扩展参数，如：application, organization 等
* 支持开发者自定义扩展

**条件支持**

* 等号 = 表示 "匹配"，如：method = getComment
* 不等号 != 表示 "不匹配"，如：method != getComment

**值支持**

* 以逗号 , 分隔多个值，如：host != 10.20.153.10,10.20.153.11
* 以星号 * 结尾，表示通配，如：host != 10.20.*
* 以美元符 $ 开头，表示引用消费者参数，如：region = $region
* 整数值范围，如：userId = 1~100、userId = 101~
* 支持开发者自定义扩展
