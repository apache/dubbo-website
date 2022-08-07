---
type: docs
title: "请求路由"
linkTitle: "请求路由"
weight: 5
description: "在 Dubbo 中配置应用级治理规则和服务级治理规则"
toc_hide: true
---

> **提示**
>
> 本文描述的是新版本规则配置，而不是[老版本配置规则](/zh/docs/advanced/config-rule-deprecated)

# 配置规则

此任务将展示在 Dubbo 中配置应用级治理规则和服务级治理规则


覆盖规则是 Dubbo 设计的在无需重启应用的情况下，动态调整 RPC 调用行为的一种能力。2.7.0 版本开始，支持从**服务**和**应用**两个粒度来调整动态配置。



## 开始之前

- 安装idea

- 克隆[dubbo-samples](https://github.com/apache/dubbo-samples.git)到本地，idea打开

- 拉取dubbo-admin镜像并运行镜像

  


> **提示**
>
> 可参考如下步骤部署dubbo-admin
>
> 1. 创建docker-compose.yml文件，内容如下:
>
> ```
> version: '3'
> services:
>   zk:
>     image: zookeeper
>     container_name: zk
>     ports:
>       - 2181:2181
>   dubbo-admin:
>     image: apache/dubbo-admin
>     container_name: dubbo-admin
>     # 等待zk启动后再启动
>     depends_on:
>       - zk
>     ports:
>       - 8080:8080
>     environment:
>       - admin.registry.address=zookeeper://zk:2181
>       - admin.config-center=zookeeper://zk:2181
>       - admin.metadata-report.address=zookeeper://zk:2181
> ```
>
> 2.运行命令
>
> ```
> docker-compose up
> ```



运行成功后，可以看见dubbo-admin界面

![dubbo_console](/imgs/v3/tasks/config-rule/dubbo_console.png)



## 概览



dubbo-samples-governance示例包含dubbo-samples-applevel-override和dubbo-samples-servicelevel-override子示例，这2个子示例分别从**服务**和**应用**两个粒度应用覆盖规则动态调整路由。



此任务的最初目标是应用覆盖规则在无需重启应用的情况下动态调整流量路由。稍后，您将从**服务**和**应用**两个粒度应用规则动态调整路由。



下图展示本任务的应用端到端架构。

![demo_architecture](/imgs/v3/tasks/config-rule/demo_architecture.png)



### 应用粒度



dubbo-samples-applevel-override示例中，BasicConsumer类和BascicProvider类为消费者类和提供者类，现在运行BasicProvider，成功后如图：

![BasicProvider_run](/imgs/v3/tasks/config-rule/BasicProvider_run.png)



在控制台查询服务，可以看到应用governance-appoverride-provider，如图：

![BasicProvider1_check](/imgs/v3/tasks/config-rule/BasicProvider1_check.png)



现在再运行一个提供者示例，运行在20881端口，首先修改dubbo-demo-provider.xml，将< dubbo:protocol />标签中端口修改修改为20881，运行BasicProvider，成功后查询控制台，如图：

![BasicProvider2_check](/imgs/v3/tasks/config-rule/BasicProvider2_check.png)




> **提示**
>
> 如果运行BasicProvider示例失败，请修改BasicProvider配置，勾选Allow multiple instances



#### 任务1：临时剔除提供者

目前需要临时剔除在20880端口的提供者，可以使用覆盖规则进行动态配置。

1.打开服务治理控制台，点击”创建“，填入应用名和配置，这个配置将禁用在20880端口上提供（side:provider）的所有服务（scope:application）。

```yaml
configVersion: v2.7
scope: application
key: governance-appoverride-provider
enabled: true
configs:
- addresses: ["0.0.0.0:20880"]
  side: provider
  parameters:
    disabled: true
```

运行BasicConsumer，此时发现是运行在20881端口的提供者提供服务，说明覆盖规则生效。



#### 任务2：评估系统容量

目前需要对系统容量进行评估，进行调整权重。

1. 修改刚才的配置，填入配置如下，这个配置将调整20880端口的提供者权重(通常用于容量评估，缺省权重为 200)

   ```yaml
   configVersion: v2.7
   scope: application
   key: governance-appoverride-provider
   enabled: true
   configs:
   - addresses: ["0.0.0.0:20880"]
     side: provider
     parameters:
       weight: 1000
   ```

多次运行BasicConsumer，发现运行在20880端口的提供者示例提供服务次数多于20881端口的提供者示例。



#### 任务3：调整负载均衡策略

目前需要调整负载均衡策略。

1. 修改刚才的配置，填入配置如下，这个配置将调整负载均衡策略：(缺省负载均衡策略为 random)

   ```yaml
   configVersion: v2.7
   scope: application
   key: governance-appoverride-provider
   enabled: true
   configs:
   - side: consumer
     parameters:
       loadbalance: random
   ```

Random策略按权重设置随机概率，多次运行BasicConsumer，BasicConsumer访问20880端口的概率大于访问20881端口的概率。



### 服务粒度



dubbo-samples-servicelevel-override示例与上面的示例类似，故不赘述。运行BasicProvider类。



#### 任务1：修改提供者服务的超时时间

目前需要修改提供者服务的超时时间

1.打开服务治理控制台，点击”创建“，填入服务名和配置，这个配置将所有消费（side:consumer）DemoService服务（org.apache.dubbo.samples.governance.api.DemoService）的应用实例（addresses:[0.0.0.0]），超时时间修改为300ms

```yaml
configVersion: v2.7
scope: service
key: org.apache.dubbo.samples.governance.api.DemoService
enabled: true
configs:
- addresses: [0.0.0.0]
  side: consumer
  parameters:
    timeout: 300
```

运行BasicConsumer类，发现BasicConSumer抛异常无法调用远程方法，如图：

![service_timeout](/imgs/v3/tasks/config-rule/service_timeout.png)



## 规则详解

#### 配置模板

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

其中：

- `configVersion` 表示 dubbo 的版本
- `scope`表示配置作用范围，分别是应用（application）或服务（service）粒度。**必填**。
- `key`指定规则体作用在哪个服务或应用。**必填**。
  - scope=service时，key取值为[{group}:]{service}[:{version}]的组合
  - scope=application时，key取值为application名称

- `enabled=true` 覆盖规则是否生效，可不填，缺省生效。
- `configs`定义具体的覆盖规则内容，可以指定n（n>=1）个规则体。**必填**。
  - side: 消费者端/提供者端
  - applications: 对应用覆盖规则
  - services: 对服务覆盖规则
  - parameters: 参数列表
  - addresses: 地址值
  - providerAddresses: 提供者地址值

**对于绝大多数配置场景，只需要理清楚以下问题基本就知道配置该怎么写了：**

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

#### 示例

1. 禁用提供者：(通常用于临时踢除某台提供者机器，相似的，禁止消费者访问请使用路由规则)

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

2. 调整权重：(通常用于容量评估，缺省权重为 200)

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

3. 调整负载均衡策略：(缺省负载均衡策略为 random)

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
