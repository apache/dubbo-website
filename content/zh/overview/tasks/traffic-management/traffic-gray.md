---
type: docs
title: "流量灰度"
linkTitle: "流量灰度"
weight: 5
description: "在 Dubbo-Admin 中配置标签路由规则实现灰度发布"
---

Dubbo提供流量灰度的服务治理能力，可以在无需重启应用的情况下，配置标签路由规则和条件路由实现灰度发布。

Dubbo可以通过XML配置，注解配置，动态配置实现流量灰度，这里主要介绍动态配置的方式，其他配置方式请参考旧文档[配置](https://dubbo.apache.org/zh/docsv2.7/user/configuration/)

## 开始之前

请确保成功运行Dubbo-Admin

## 背景信息

在产品开发中会遇到需求变化、版本迭代的场景，为了兼顾需求变化和系统稳定，发布要尽可能平滑，影响人群要由少到多，一旦有问题马上回滚。Dubbo-Admin提供了动态的流量灰度能力，能够帮助您对新服务作标，服务平滑发布，提高服务的稳定和可用性。

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

**对于流量灰度场景，只需要理清楚以下问题基本就知道配置该怎么写了：**

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

### 标签路由

1. 登录Dubbo-Admin控制台
2. 在左侧导航栏选择服务治理 > 标签路由。
3. 点击创建按钮，在创建新标签规则面板中，填写规则内容，然后单击保存。

#### 规则详解

##### 配置模板

```yaml
---
  force: false
  runtime: true
  enabled: true
  key: governance-tagrouter-provider
  tags:
    - name: tag1
      addresses: ["127.0.0.1:20880"]
    - name: tag2
      addresses: ["127.0.0.1:20881"]
 ...
```

**对于流量灰度场景，只需要理清楚以下问题基本就知道配置该怎么写了：**

1. 要修改服务所属提供者应用的配置。
   - 应用：`scope: application, key: app-name`（还可使用`services`指定某几个服务）。
2. 配置是否只对某几个特定实例生效。
   - 所有实例：`addresses: ["0.0.0.0"] `或`addresses: ["0.0.0.0:*"] `具体由side值决定。
   - 指定实例：`addersses[实例地址列表]`。
3. 要修改的标签名。

## 结果验证
选择和流量灰度配置相关的应用，触发该调用验证。