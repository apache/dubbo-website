---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/traffic/routing-rule/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/traffic/routing-rule/
description: 通过 Dubbo 中的路由规则做服务治理
linkTitle: 路由规则
title: 路由规则
type: docs
weight: 33
---





## 路由规则概述
路由规则在发起一次RPC调用前起到过滤目标服务器地址的作用，过滤后的地址列表，将作为消费端最终发起RPC调用的备选地址。

您可以随时在服务治理控制台 [Dubbo-Admin](https://github.com/apache/dubbo-admin) 写入路由规则。

- 条件路由。支持以服务或 Consumer 应用为粒度配置路由规则。
- 标签路由。以 Provider 应用为粒度配置路由规则。

### 应用粒度

  ```yaml
  # app1的消费者只能消费所有端口为20880的服务实例
  # app2的消费者只能消费所有端口为20881的服务实例
  ---
  scope: application
  force: true
  runtime: true
  enabled: true
  key: governance-conditionrouter-consumer
  conditions:
    - application=app1 => address=*:20880
    - application=app2 => address=*:20881
  ...
  ```

### 服务粒度

  ```yaml
  # DemoService的sayHello方法只能消费所有端口为20880的服务实例
  # DemoService的sayHi方法只能消费所有端口为20881的服务实例
  ---
  scope: service
  force: true
  runtime: true
  enabled: true
  key: org.apache.dubbo.samples.governance.api.DemoService
  conditions:
    - method=sayHello => address=*:20880
    - method=sayHi => address=*:20881
  ...
  ```
> 后续我们计划在 2.6.x 版本的基础上继续增强脚本路由功能。

## 规则详解

- `scope`表示路由规则的作用粒度，scope的取值会决定key的取值。**必填**。
  - service 服务粒度
  - application 应用粒度
- `Key`明确规则体作用在哪个服务或应用。**必填**。
  - scope=service时，key取值为[{group}:]{service}[:{version}]的组合
  - scope=application时，key取值为application名称
- `enabled=true` 当前路由规则是否生效，可不填，缺省生效。
- `force=false` 当路由结果为空时，是否强制执行，如果不强制执行，路由结果为空的路由规则将自动失效，可不填，缺省为 `false`。
- `runtime=false` 是否在每次调用时执行路由规则，否则只在提供者地址列表变更时预先执行并缓存结果，调用时直接从缓存中获取路由结果。如果用了参数路由，必须设为 `true`，需要注意设置会影响调用的性能，可不填，缺省为 `false`。
- `priority=1` 路由规则的优先级，用于排序，优先级越大越靠前执行，可不填，缺省为 `0`。
- `conditions` 定义具体的路由规则内容。**必填**。

### Conditions规则体
`conditions`部分是规则的主体，由1到任意多条规则组成，下面我们就每个规则的配置语法做详细说明：

**格式**

- `=>` 之前的为消费者匹配条件，所有参数和消费者的 URL 进行对比，当消费者满足匹配条件时，对该消费者执行后面的过滤规则。
- `=>` 之后为提供者地址列表的过滤条件，所有参数和提供者的 URL 进行对比，消费者最终只拿到过滤后的地址列表。
- 如果匹配条件为空，表示对所有消费方应用，如：`=> host != 10.20.153.11`
- 如果过滤条件为空，表示禁止访问，如：`host = 10.20.153.10 =>`

**表达式**

参数支持

- 服务调用信息，如：method, argument 等，暂不支持参数路由
- URL 本身的字段，如：protocol, host, port 等
- 以及 URL 上的所有参数，如：application, organization 等

条件支持

- 等号 `=` 表示"匹配"，如：`host = 10.20.153.10`
- 不等号 `!=` 表示"不匹配"，如：`host != 10.20.153.10`

值支持

- 以逗号 `,` 分隔多个值，如：`host != 10.20.153.10,10.20.153.11`
- 以星号 `*` 结尾，表示通配，如：`host != 10.20.*`
- 以美元符 `$` 开头，表示引用消费者参数，如：`host = $host`

### Condition示例

排除预发布机

```
=> host != 172.22.3.91
```

白名单

```
register.ip != 10.20.153.10,10.20.153.11 =>
```

> 一个服务只能有一条白名单规则，否则两条规则交叉，就都被筛选掉了

黑名单

```
register.ip = 10.20.153.10,10.20.153.11 =>
```

服务寄宿在应用上，只暴露一部分的机器，防止整个集群挂掉

```
=> host = 172.22.3.1*,172.22.3.2*
```

为重要应用提供额外的机器

```
application != kylin => host != 172.22.3.95,172.22.3.96
```

读写分离

```
method = find*,list*,get*,is* => host = 172.22.3.94,172.22.3.95,172.22.3.96
method != find*,list*,get*,is* => host = 172.22.3.97,172.22.3.98
```

前后台分离

```
application = bops => host = 172.22.3.91,172.22.3.92,172.22.3.93
application != bops => host = 172.22.3.94,172.22.3.95,172.22.3.96
```

隔离不同机房网段

```
host != 172.22.3.* => host != 172.22.3.*
```

提供者与消费者部署在同集群内，本机只访问本机的服务

```
=> host = $host
```



## 标签路由规则

标签路由通过将某一个或多个服务的提供者划分到同一个分组，约束流量只在指定分组中流转，从而实现流量隔离的目的，可以作为蓝绿发布、灰度发布等场景的能力基础。

### 规则详解

**格式**

- `Key`明确规则体作用到哪个应用。**必填**。
- `enabled=true` 当前路由规则是否生效，可不填，缺省生效。
- `force=false` 当路由结果为空时，是否强制执行，如果不强制执行，路由结果为空的路由规则将自动失效，可不填，缺省为 `false`。
- `runtime=false` 是否在每次调用时执行路由规则，否则只在提供者地址列表变更时预先执行并缓存结果，调用时直接从缓存中获取路由结果。如果用了参数路由，必须设为 `true`，需要注意设置会影响调用的性能，可不填，缺省为 `false`。
- `priority=1` 路由规则的优先级，用于排序，优先级越大越靠前执行，可不填，缺省为 `0`。
- `tags` 定义具体的标签分组内容，可定义任意n（n>=1）个标签并为每个标签指定实例列表。**必填**。
  - name， 标签名称
- addresses， 当前标签包含的实例列表



**降级约定**

1. `dubbo.tag=tag1` 时优先选择 标记了`tag=tag1` 的 provider。若集群中不存在与请求标记对应的服务，默认将降级请求 tag为空的provider；如果要改变这种默认行为，即找不到匹配tag1的provider返回异常，需设置`dubbo.force.tag=true`。

2. `dubbo.tag`未设置时，只会匹配tag为空的provider。即使集群中存在可用的服务，若 tag 不匹配也就无法调用，这与约定1不同，携带标签的请求可以降级访问到无标签的服务，但不携带标签/携带其他种类标签的请求永远无法访问到其他标签的服务。
### Provider

标签主要是指对Provider端应用实例的分组，目前有两种方式可以完成实例分组，分别是`动态规则打标`和`静态规则打标`，其中动态规则相较于静态规则优先级更高，而当两种规则同时存在且出现冲突时，将以动态规则为准。

> 可随时在**服务治理控制台**下发标签归组规则

**动态规则打标**
```yaml
# governance-tagrouter-provider应用增加了两个标签分组tag1和tag2
# tag1包含一个实例 127.0.0.1:20880
# tag2包含一个实例 127.0.0.1:20881
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



**静态打标**

```xml
<dubbo:provider tag="tag1"/>
```

**or**

```xml
<dubbo:service tag="tag1"/>
```

**or**

```properties
java -jar xxx-provider.jar -Ddubbo.provider.tag={the tag you want, may come from OS ENV}
```



### Consumer

```java
RpcContext.getContext().setAttachment(Constants.TAG_KEY,"tag1");
```

> 请求标签的作用域为每一次 invocation，使用 attachment 来传递请求标签，注意保存在 attachment 中的值将会在一次完整的远程调用中持续传递，得益于这样的特性，我们只需要在起始调用时，通过一行代码的设置，达到标签的持续传递。

> 目前仅仅支持 hardcoding 的方式设置 dubboTag。注意到 RpcContext 是线程绑定的，优雅的使用 TagRouter 特性，建议通过 servlet 过滤器(在 web 环境下)，或者定制的 SPI 过滤器设置 dubboTag。

> 自定义路由参考[路由扩展](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/router/)