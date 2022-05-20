---
type: docs
title: "集群容错"
linkTitle: "集群容错"
weight: 2
description: "集群调用失败时，Dubbo 提供的容错方案"
---

在集群调用失败时，Dubbo 提供了多种容错方案，缺省为 failover 重试。

![cluster](/imgs/user/cluster.jpg)

各节点关系：

* 这里的 `Invoker` 是 `Provider` 的一个可调用 `Service` 的抽象，`Invoker` 封装了 `Provider` 地址及 `Service` 接口信息
* `Directory` 代表多个 `Invoker`，可以把它看成 `List<Invoker>` ，但与 `List` 不同的是，它的值可能是动态变化的，比如注册中心推送变更
* `Cluster` 将 `Directory` 中的多个 `Invoker` 伪装成一个 `Invoker`，对上层透明，伪装过程包含了容错逻辑，调用失败后，重试另一个
* `Router` 负责从多个 `Invoker` 中按路由规则选出子集，比如读写分离，应用隔离等
* `LoadBalance` 负责从多个 `Invoker` 中选出具体的一个用于本次调用，选的过程包含了负载均衡算法，调用失败后，需要重选

## 集群容错模式

可以自行扩展集群容错策略，参见：[集群扩展](../../references/spis/cluster)

### Failover Cluster

失败自动切换，当出现失败，重试其它服务器。通常用于读操作，但重试会带来更长延迟。可通过 `retries="2"` 来设置重试次数(不含第一次)。

重试次数配置如下：

```xml
<dubbo:service retries="2" />
```

或

```xml
<dubbo:reference retries="2" />
```

或

```xml
<dubbo:reference>
    <dubbo:method name="findFoo" retries="2" />
</dubbo:reference>
```

{{% alert title="提示" color="primary" %}}
该配置为缺省配置
{{% /alert %}}

### Failfast Cluster

快速失败，只发起一次调用，失败立即报错。通常用于非幂等性的写操作，比如新增记录。

### Failsafe Cluster

失败安全，出现异常时，直接忽略。通常用于写入审计日志等操作。

### Failback Cluster

失败自动恢复，后台记录失败请求，定时重发。通常用于消息通知操作。

### Forking Cluster

并行调用多个服务器，只要一个成功即返回。通常用于实时性要求较高的读操作，但需要浪费更多服务资源。可通过 `forks="2"` 来设置最大并行数。

### Broadcast Cluster

广播调用所有提供者，逐个调用，任意一台报错则报错。通常用于通知所有提供者更新缓存或日志等本地资源信息。

现在广播调用中，可以通过 broadcast.fail.percent 配置节点调用失败的比例，当达到这个比例后，BroadcastClusterInvoker
将不再调用其他节点，直接抛出异常。 broadcast.fail.percent 取值在 0～100 范围内。默认情况下当全部调用失败后，才会抛出异常。
broadcast.fail.percent 只是控制的当失败后是否继续调用其他节点，并不改变结果(任意一台报错则报错)。broadcast.fail.percent 参数
在 dubbo2.7.10 及以上版本生效。

Broadcast Cluster 配置 broadcast.fail.percent。

broadcast.fail.percent=20 代表了当 20% 的节点调用失败就抛出异常，不再调用其他节点。

```text
@reference(cluster = "broadcast", parameters = {"broadcast.fail.percent", "20"})
```


{{% alert title="提示" color="primary" %}}
`2.1.0` 开始支持
{{% /alert %}}

### Available Cluster

调用目前可用的实例（只调用一个），如果当前没有可用的实例，则抛出异常。通常用于不需要负载均衡的场景。

### Mergeable Cluster

将集群中的调用结果聚合起来返回结果，通常和group一起配合使用。通过分组对结果进行聚合并返回聚合后的结果，比如菜单服务，用group区分同一接口的多种实现，现在消费方需从每种group中调用一次并返回结果，对结果进行合并之后返回，这样就可以实现聚合菜单项。

### ZoneAware Cluster

多注册中心订阅的场景，注册中心集群间的负载均衡。对于多注册中心间的选址策略有如下四种

1. 指定优先级：`preferred="true"`注册中心的地址将被优先选择

```xml
<dubbo:registry address="zookeeper://127.0.0.1:2181" preferred="true" />
```

2. 同中心优先：检查当前请求所属的区域，优先选择具有相同区域的注册中心

```xml
<dubbo:registry address="zookeeper://127.0.0.1:2181" zone="beijing" />
```

3. 权重轮询：根据每个注册中心的权重分配流量

```xml
<dubbo:registry id="beijing" address="zookeeper://127.0.0.1:2181" weight="100" />

<dubbo:registry id="shanghai" address="zookeeper://127.0.0.1:2182" weight="10" />
```

4. 缺省值：选择一个可用的注册中心

## 集群模式配置

按照以下示例在服务提供方和消费方配置集群模式

```xml
<dubbo:service cluster="failsafe" />
```

或

```xml
<dubbo:reference cluster="failsafe" />
```

