---
aliases:
    - /zh/overview/tasks/develop/async/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/async-call/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/async-call/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/async-execute-on-provider/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/async/
description: 某些情况下希望dubbo接口异步调用，避免不必要的等待。
linkTitle: 超时时间
title: 为服务调用指定 timeout 超时时间
type: docs
weight: 3
---

为 RPC 调用设置超时时间可以提升集群整体稳定性，避免无限等待响应结果导致的资源占用（比如大量长期无响应的请求占用线程池等）。在调用没有响应的情况下，比如 5s 之后，Dubbo 框架就会自动终止调用等待过程（抛出 TimeoutException），释放此次调用占用的资源。

## 使用方式
有多种方式可以配置 rpc 调用超时时间，从粗粒度的全局默认值，到特定服务、特定方法级别的独立配置：

配置全局默认超时时间为 5s（不配置的情况下，所有服务的默认超时时间是 1s）。
```yaml
dubbo:
  provider:
    timeout: 5000
```

在消费端，指定 DemoService 服务调用的超时时间为 5s
```java
@DubboReference(timeout=5000)
private DemoService demoService;
```

在提供端，指定 DemoService 服务调用的超时时间为 5s（可作为所有消费端的默认值，如果消费端有指定则优先级更高）
```java
@DubboService(timeout=5000)
public class DemoServiceImpl implements DemoService{}
```

在消费端，指定 DemoService sayHello 方法调用的超时时间为 5s
```java
@DubboReference(methods = {@Method(name = "sayHello", timeout = 5000)})
private DemoService demoService;
```

在提供端，指定 DemoService sayHello 方法调用的超时时间为 5s（可作为所有消费端的默认值，如果消费端有指定则优先级更高）
```java
@DubboService(methods = {@Method(name = "sayHello", timeout = 5000)})
public class DemoServiceImpl implements DemoService{}
```

以上配置形式的优先级从高到低依次为：`方法级别配置 > 服务级别配置 > 全局配置 > 默认值`。

## Deadline 机制
<img style="max-width:600px;height:auto;" src="/imgs/v3/tasks/framework/timeout.png"/>

我们来分析一下以上调用链路以及可能出现的超时情况：
* A 调用 B 设置了超时时间 5s，因此 `B -> C -> D` 总计耗时不应该超过 5s，否则 A 就会收到超时异常
* 在任何情形下，只要 A 等待 5s 没有收到响应，整个调用链路就可以被终止了（如果此时 C 正在运行，则 `C -> D` 就没有发起的意义了）
* 理论上 `B -> C`、`C -> D` 都有自己独立的超时时间设置，超时计时也是独立计算的，它们不知道 A 作为调用发起方是否超时

在 Dubbo 框架中，`A -> B` 的调用就像一个开关，一旦启动，在任何情形下整个 `A -> B -> C -> D` 调用链路都会被完整执行下去，即便调用方 A 已经超时，后续的调用动作仍会继续。这在一些场景下是没有意义的，尤其是链路较长的情况下会带来不必要的资源消耗，deadline 就是设计用来解决这个问题，通过在调用链路中传递 deadline（deadline初始值等于超时时间，随着时间流逝而减少）可以确保调用链路只在有效期内执行，deadline 消耗殆尽之后，调用链路中其他尚未执行的任务将被取消。

因此 deadline 机制就是将 ` B -> C -> D` 当作一个整体看待，这一系列动作必须在 5s 之内完成。随着时间流逝 deadline 会从 5s 逐步扣减，后续每一次调用实际可用的超时时间即是当前 deadline 值，比如 `C` 收到请求时已经过去了 3s，则 `C -> D` 的超时时间只剩下 2s。

<img style="max-width:600px;height:auto;" src="/imgs/v3/tasks/framework/timeout-deadline.png"/>

deadline 机制默认是关闭的，如果要启用 deadline 机制，需要配置以下参数：
```yaml
dubbo:
  provider:
    timeout: 5000
    parameters.enable-timeout-countdown: true
```

也可以指定某个服务调用开启 deadline 机制：
```java
@DubboReference(timeout=5000, parameters={"enable-timeout-countdown", "true"})
private DemoService demoService;
```
