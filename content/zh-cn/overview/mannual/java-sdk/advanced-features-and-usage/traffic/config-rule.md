---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/traffic/config-rule/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/traffic/config-rule/
description: 在 Dubbo 中配置应用级治理规则和服务级治理规则
linkTitle: 配置规则
title: 配置规则
type: docs
weight: 34
---





## 配置规则概述
覆盖规则是 Dubbo 设计的在无需重启应用的情况下，动态调整 RPC 调用行为的一种能力。2.7.0 版本开始，支持从**服务**和**应用**两个粒度来调整动态配置。

> 请在服务治理控制台查看或修改覆盖规则。

### 应用粒度

```yaml
# 将应用demo（key:demo）在20880端口上提供（side:provider）的所有服务（scope:application）的权重修改为1000（weight:1000）。
---
configVersion: v2.7
scope: application
key: demo
enabled: true
configs:
- addresses: ["0.0.0.0:20880"]
  side: provider
  parameters:
  weight: 1000
  ...
```

### 服务粒度

```yaml
# 所有消费（side:consumer）DemoService服务（key:org.apache.dubbo.samples.governance.api.DemoService）的应用实例（addresses:[0.0.0.0]），超时时间修改为6000ms
---
configVersion: v2.7
scope: service
key: org.apache.dubbo.samples.governance.api.DemoService
enabled: true
configs:
- addresses: [0.0.0.0]
  side: consumer
  parameters:
  timeout: 6000
  ...
```
## 配置规则
### 规则详解
-  `configVersion` 表示 dubbo 的版本
- `scope`表示配置作用范围，分别是应用（application）或服务（service）粒度。**必填**。
- `key` 指定规则体作用在哪个服务或应用。**必填**。
    - scope=service时，key取值为[{group}:]{service}[:{version}]的组合
- scope=application时，key取值为application名称
- `enabled=true` 覆盖规则是否生效，可不填，缺省生效。
- `configs` 定义具体的覆盖规则内容，可以指定n（n>=1）个规则体。**必填**。
    - side，
    - applications
    - services
    - parameters
    - addresses
    - providerAddresses

**配置场景**
1. 要修改整个应用的配置还是某个服务的配置。
    - 应用：`scope: application, key: app-name`（还可使用`services`指定某几个服务）。
    - 服务：`scope: service, key:group+service+version `。

2. 修改是作用到消费者端还是提供者端。
    - 消费者：`side: consumer` ，作用到消费端时（你还可以进一步使用`providerAddress`, `applications`选定特定的提供者示例或应用）。
    - 提供者：`side: provider`。

3. 配置是否只对某几个特定实例生效。
    - 所有实例：`addresses: ["0.0.0.0"] `或`addresses: ["0.0.0.0:*"] `具体由side值决定。
    - 指定实例：`addersses[实例地址列表]`。

4. 要修改的属性是哪个。

### 配置模板

```yaml
---
configVersion: v2.7
scope: application/service
key: app-name/group+service+version
enabled: true
configs:
- addresses: ["0.0.0.0"]
  providerAddresses: ["1.1.1.1:20880", "2.2.2.2:20881"]
  side: consumer
  applications/services: []
  parameters:
    timeout: 1000
    cluster: failfase
    loadbalance: random
- addresses: ["0.0.0.0:20880"]
  side: provider
  applications/services: []
  parameters:
    threadpool: fixed
    threads: 200
    iothreads: 4
    dispatcher: all
    weight: 200
...
```

### 示例

**禁用提供者**
> 通常用于临时踢除某台提供者机器，相似的，禁止消费者访问请使用路由规则
   ```yaml
   ---
   configVersion: v2.7
   scope: application
   key: demo-provider
   enabled: true
   configs:
   - addresses: ["10.20.153.10:20880"]
     side: provider
     parameters:
       disabled: true
   ...
   ```

**调整权重**
> 通常用于容量评估，缺省权重为 200
   ```yaml
   ---
   configVersion: v2.7
   scope: application
   key: demo-provider
   enabled: true
   configs:
   - addresses: ["10.20.153.10:20880"]
     side: provider
     parameters:
       weight: 200
   ...
   ```

**调整负载均衡策略**
> 缺省负载均衡策略为 random
   ```yaml
   ---
   configVersion: v2.7
   scope: application
   key: demo-consumer
   enabled: true
   configs:
   - side: consumer
     parameters:
       loadbalance: random
   ...
   ```

**服务降级**
> 通常用于临时屏蔽某个出错的非关键服务
```yaml
---
   configVersion: v2.7
   scope: service
   key: org.apache.dubbo.samples.governance.api.DemoService
   enabled: true
   configs:
   - side: consumer
     parameters:
       force: return null
   ...
```