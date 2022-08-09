---
type: docs
title: "请求路由"
linkTitle: "请求路由"
weight: 5
description: "在 Dubbo-Admin 根据请求条件路由"
---

Dubbo提供动态创建条件路由的服务治理能力，可以在无需重启应用的情况下，根据请求发起方、请求的方法条件路由。

Dubbo可以通过XML配置，注解配置，动态配置实现动态根据请求条件路由，这里主要介绍动态配置的方式，其他配置方式请参考旧文档[配置](https://dubbo.apache.org/zh/docsv2.7/user/configuration/)

## 开始之前

请确保成功运行Dubbo-Admin
 
## 背景信息

在业务场景如黑白名单，排除预发布机，只暴露部分机器，分环境隔离等，需要路由规则在发起RPC调用前过滤目标服务器地址，过滤后的地址作为最终发起RPC调用的备选地址。Dubbo-Admin提供条件路由的能力，能够帮助您配置路由规则，满足业务场景。

## 操作步骤

### 条件路由

1. 登录Dubbo-Admin控制台
2. 在左侧导航栏选择服务治理 > 条件路由。
3. 点击创建按钮，在创建新路由规则面板中，填写规则内容，然后单击保存。


#### 规则详解

##### 配置模板

```yaml
---
scope: application/service
force: true
runtime: true
enabled: true
key: app-name/group+service+version
conditions:
  - application=app1 => address=*:20880
  - method=sayHello => address=*:20880
```

**对于条件路由场景，只需要理清楚以下问题基本就知道配置该怎么写了：**

1. 要修改消费者应用的配置还是某个服务的配置。
   - 应用：`scope: application, key: app-name`（还可使用`services`指定某几个服务）。
   - 服务：`scope: service, key:group+service+version `。
2. 配置是否只对某几个特定实例生效。
   - 所有实例：`addresses: ["0.0.0.0"] `或`addresses: ["0.0.0.0:*"] `具体由side值决定。
   - 指定实例：`addersses[实例地址列表]`。
3. 要修改的条件规则。
   - => 之前的为消费者匹配条件，所有参数和消费者的 URL 进行对比，当消费者满足匹配条件时，对该消费者执行后面的过滤规则。
   - => 之后为提供者地址列表的过滤条件，所有参数和提供者的 URL 进行对比，消费者最终只拿到过滤后的地址列表。
   - 如果匹配条件为空，表示对所有消费方应用，如：=> host != 10.20.153.11
   - 如果过滤条件为空，表示禁止访问，如：host = 10.20.153.10 =>

## 结果验证
选择和条件路由配置相关的应用，触发该调用验证。