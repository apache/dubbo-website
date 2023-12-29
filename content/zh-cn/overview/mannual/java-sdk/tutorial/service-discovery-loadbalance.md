---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description: Dubbo 提供的集群负载均衡策略
linkTitle: 服务发现与负载均衡
title: 服务发现与负载均衡
type: docs
weight: 4
---
Dubbo 提供了 client-based 服务发现与负载均衡机制，可自动检测后端服务实例变化且在不同实例间均匀的分发流量，支持 Nacos、Zookeeper、Kubernetes Service 等多种注册中心接入。

## 服务发现
以下是 Dubbo 服务发现接入的一些主流注册中心实现，更多扩展实现请查看 [注册中心参考手册]()：

| 注册中心 | 配置值 | 服务发现模型 | 是否支持鉴权 | spring-boot-starter |
| --- | --- | --- | --- | --- |
| Nacos | nacos | 应用级、接口级 | 是 | dubbo-nacos-spring-boot-starter |
| Zookeeper | zookeeper | 应用级、接口级 | 是 | - dubbo-zookeeper-spring-boot-starter <br/> - dubbo-zookeeper-curator5-spring-boot-starter |
| Kubernetes Service | 参考下文使用文档 | 应用级 | 是 | 无 |

### Nacos 注册中心
以 Spring Boot 场景下的应用开发为例，增加以下配置使用基于 Nacos 注册中心的服务发现（Zookeeper 的使用方式类似）。

在项目中添加 macos-client 等相关依赖：

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-nacos-spring-boot-starter</artifactId>
    <version>3.3.0-beta.1</version>
</dependency>
```

在 `application.yml` 文件增加 retistry 注册中心配置。

```yml
dubbo:
  registry:
    address: "nacos://127.0.0.1:8848"
```

之后启动 Dubbo 进程，provider 将自动注册服务和地址到 Nacos server，同时 consumer 自动订阅地址变化。

**Dubbo 支持配置到注册中心连接的鉴权，也支持指定命名空间、分组等以实现注册数据的隔离，此外，Dubbo 还支持设置如延迟注册、推空保护、只注册、只订阅等注册订阅行为。** 以下是一些简单的配置示例，请查看 [注册中心参考手册]() 了解更多配置详情。

```yml
dubbo:
  registry:
    address: "nacos://127.0.0.1:8848"
    group: group1 # use separated group in registry server.
    delay: 10000 # delay registering instance to registry server.
    parameters.namespace: xxx # set target namespace to operate in registry server.
    parameters.key: value # extended key value that will be used when building connection with registry.
```

{{% alert title="服务发现模型说明" color="warning" %}}
Dubbo3 在兼容 Dubbo2 `接口级服务发现`的同时，定义了新的`应用级服务发现`模型，关于它们的含义与工作原理请参考 [应用级服务发现]()。

Dubbo3 具备自动协商服务发现模型的能力，因此老版本 Dubbo2 用户可以无缝升级 Dubbo3。强烈建议新用户明确配置使用应用级服务发现。
```yml
dubbo:
  registry:
    address: "nacos://127.0.0.1:8848"
    register-mode: instance # 新用户请设置此值，表示启用应用级服务发现，可选值 interface、instance、all
```
新用户与老用户均建议参考 [应用级服务发现迁移指南]() 了解更多配置详情。
{{% /alert %}}

### Kubernetes 注册中心
Dubbo 支持关于使用 <a target="_blank" href="">Kubernetes Service</a> 服务发现，由于其架构复杂性，我们有专门的文档展开说明，请参考 [Dubbo+Kubernetes 最佳实践]()。

半托管

全托管架构

在这里都描述一下，架构图给看看

### 基于多个注册中心的发现服务


关于工作原理与更多使用场景说明

### 服务发现问题排查
相比于 client 到 server 的 RPC 直连调用，开启服务发现后，常常会遇到各种个样奇怪的调用失败问题，以下是一些常见的问题与排查方法。

> 如果你的项目开启了服务发现，但在测试中想调用某个特定的 ip，可通过设置对端 ip 地址的 [直连模式]() 绕过服务发现机制进行调用。

1. 消费方地址找不到 (No Provider available)
2. 忘记配置注册中心，
3. 注册中心连不上
4. 消费方启动报错


## 负载均衡
Dubbo 内置了如下负载均衡算法，结合上文提到的自动服务发现机制，消费端会自动使用 `Weighted Random LoadBalance 加权随机负载均衡策略` 选址调用。

如果要调整负载均衡算法，以下是 Dubbo 框架内置的负载均衡策略：

| 算法                        | 特性                    | 备注                                            | 配置值                                             |
| :-------------------------- | :---------------------- | :---------------------------------------------- | :---------------------------------------------- |
| Weighted Random LoadBalance           | 加权随机                | 默认算法，默认权重相同              | random (默认) |
| RoundRobin LoadBalance       | 加权轮询                | 借鉴于 Nginx 的平滑加权轮询算法，默认权重相同， | roundrobin |
| LeastActive LoadBalance      | 最少活跃优先 + 加权随机 | 背后是能者多劳的思想                           | leastactive |
| Shortest-Response LoadBalance | 最短响应优先 + 加权随机 | 更加关注响应速度                             | shortestresponse |
| ConsistentHash LoadBalance   | 一致性哈希             | 确定的入参，确定的提供者，适用于有状态请求        | consistenthash |
| P2C LoadBalance   | Power of Two Choice    | 随机选择两个节点后，继续选择“连接数”较小的那个节点。         | p2c |
| Adaptive LoadBalance   | 自适应负载均衡       | 在 P2C 算法基础上，选择二者中 load 最小的那个节点         | adaptive |

### 使用场景
- 高可用性：部署服务的多个实例以确保即使一个或多个实例失败服务保持可用，负载均衡功能可用于在这些实例之间分配传入的请求确保以负载均衡方式使用每个实例的方式，还能最大限度地降低服务停机的风险。

- 流量管理：限制指向特定服务实例的流量，以防止过载或确保公平的资源分配，负载均衡特性提供了 Round Robin、Weighted Round Robin、Random、Least Active Load Balancing 等多种负载均衡策略，可以用来实现流量控制。

- 服务划分：将一个服务划分成多个逻辑组件，每个逻辑组件可以部署在不同的实例上，使用负载平衡以确保每个分区平衡的方式在这些实例之间分配请求，同时在实例发生故障的情况下提供故障转移功能。

- 性能优化：负载平衡可用于优化服务的性能，通过跨多个实例分发请求可以利用可用的计算资源来缩短响应时间并减少延迟。
 
### 使用方式

> 只需要调整 `loadbalance` 相应取值即可，每种负载均衡策略取值请参见文档最上方表格。

Dubbo 框架支持为单个服务、服务的单个方法指定独立的负载均衡策略
#### 服务端服务级别

```xml
<dubbo:service interface="..." loadbalance="roundrobin" />
```

#### 客户端服务级别

```xml
<dubbo:reference interface="..." loadbalance="roundrobin" />
```

#### 服务端方法级别

```xml
<dubbo:service interface="...">
    <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:service>
```

#### 客户端方法级别

```xml
<dubbo:reference interface="...">
    <dubbo:method name="..." loadbalance="roundrobin"/>
</dubbo:reference>
```

### 一致性哈希配置

默认采用第一个参数作为哈希 key，如果需要切换参数，可以指定 `hash.arguments` 属性

```java
ReferenceConfig<DemoService> referenceConfig = new ReferenceConfig<DemoService>();
// ... init
Map<String, String> parameters = new HashMap<String, String>();
parameters.put("hash.arguments", "1");
parameters.put("sayHello.hash.arguments", "0,1");
referenceConfig.setParameters(parameters);
referenceConfig.setLoadBalance("consistenthash");
referenceConfig.get();
```