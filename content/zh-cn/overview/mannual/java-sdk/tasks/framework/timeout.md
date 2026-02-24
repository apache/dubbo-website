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
* 理论上 `B -> C`、`C -> D` 都有配置了独立的超时时间，且超时计时是独立计算的，它们并不知道调用发起方 A 是否已经超时
* 在任何情形下，只要 A 等待 5s 没有收到响应，整个调用链路就可以被终止了。如果此时 C 正在运行，则发起 `C -> D` 就没有意义了，会造成不必要的资源消耗，这在长链路场景中尤为明显

为了解决上述问题，Dubbo 引入了 Deadline 机制，通过在调用链路中透传 deadline（初始值等于超时时间），使得整个调用链能在统一的时间窗口内执行。随着调用深入，deadline 不断被扣减，后续服务的超时时间等于 deadline 剩余时间。如果 deadline 消耗殆尽，调用链路中其他尚未执行的任务将被取消。

例如：

- A 发起调用时设置 timeout = 5000ms，则 deadline 初始值为 5000ms

- 当 C 发起请求时，整个链路已消耗 3000ms，则 `C -> D` 最多只能再用 2000ms

<img style="max-width:600px;height:auto;" src="/imgs/v3/tasks/framework/timeout-deadline.png"/>

Deadline 机制默认是关闭的，需显式开启，应用级别的配置如下：

```yaml
dubbo:
  provider:
    timeout: 5000
    parameters.enable-timeout-countdown: true
```

也可以为某个服务单独配置：

```java
@DubboReference(timeout=5000, parameters={"enable-timeout-countdown", "true"})
private DemoService demoService; 
```

在 Dubbo 链路中，只要链路上游开启 `enable-timeout-countdown=true`，后续所有节点**默认继承并透传** deadline（无需额外开启），除非显式设为 `false` 才会中断。该约束覆盖所有 Dubbo 线程发起的同步/异步调用，但**非 Dubbo 线程**（如自定义线程池、CompletableFuture 等）发起的调用无法自动透传。示例：

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
  return service.invoke("hello");
});
```