# Sentinel: Dubbo 服务的流量哨兵

在复杂的生产环境下可能部署着成千上万的 Dubbo 服务实例，流量持续不断地进入，服务之间进行相互调用。但是分布式系统中可能会因流量激增、系统负载过高、网络延迟等一系列问题，导致某些服务不可用，如果不进行相应的控制可能导致级联故障，影响服务的可用性，因此我们需要一个能够保障服务稳定性的利器 —— Sentinel，来为 Dubbo 服务保驾护航。

## Sentinel 介绍

[Sentinel](https://github.com/alibaba/Sentinel) 是阿里中间件团队开源的，面向分布式服务架构的轻量级流量控制产品，主要以流量为切入点，从流量控制、熔断降级、系统负载保护等多个维度来帮助用户保护服务的稳定性。

Sentinel 主要功能有三部分：

- 流量控制：Sentinel 可以针对不同的调用关系，以不同的运行指标（如 QPS、线程数、系统负载等）为基准，对资源调用进行流量控制，将随机的请求调整成合适的形状。
- 熔断降级：当调用链路中某个资源出现不稳定的情况，如平均 RT 增高、异常比例升高的时候，Sentinel 会使对此资源的调用请求快速失败，避免影响其它的资源，导致级联失败。
- 系统负载保护：Sentinel 对系统的维度提供保护。当系统负载较高的时候，如果仍持续让请求进入，可能会导致系统崩溃，无法响应。在集群环境下，网络负载均衡会把本应这台机器承载的流量转发到其它的机器上去。如果这个时候其它的机器也处在一个边缘状态的时候，这个增加的流量就会导致这台机器也崩溃，最后导致整个集群不可用。针对这个情况，Sentinel 提供了对应的保护机制，让系统的入口流量和系统的负载达到一个平衡，保证系统在能力范围之内处理最多的请求。

目前业界常用的熔断降级/隔离的库是 Netflix 的 [Hystrix](https://github.com/Netflix/Hystrix)。Hystrix 注重隔离的概念，通过线程池或信号量的方式来对依赖（即 Sentinel 中对应的资源）进行隔离。Hystrix 线程池隔离的好处是比较彻底，但是不足之处在于要开很多线程池，还要预先去划分依赖，并给每个依赖分配线程池。Sentinel 为资源隔离提供了另一种思路：通过并发线程数进行控制。这样用户就不需要预先指定线程池的大小，而且没有线程切换的损耗。当资源处于不稳定状态时，响应时间变长，线程数逐步增加。当某个资源的线程数飙高到设定的阈值时，会触发对此资源请求的限流，直到堆积的线程完成任务后再继续接收请求。

Hystrix 熔断降级功能采用熔断器模式，在某个服务失败比率高时自动进行熔断。Sentinel 的熔断降级功能更为通用，支持平均响应时间与失败比率两个指标。Sentinel 还提供各种调用链路关系和流量控制效果支持，同时还可以根据系统负载去实时地调整流量来保护系统，应用场景更为丰富。同时，Sentinel 还提供了实时的监控 API 和控制台，可以方便用户快速了解目前系统的状态，对服务的稳定性了如指掌。

## Sentinel 与 Dubbo 整合的最佳实践

Sentinel 提供了与 Dubbo 整合的模块 - [Sentinel Dubbo Adapter](https://github.com/sczyh30/alibaba-sentinel-dubbo-adapter)，主要包括针对 Service Provider 和 Service Consumer 实现的 Filter。使用时用户只需引入以下模块（以 Maven 为例）：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-dubbo-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

引入此依赖后，Dubbo 的服务接口和方法（包括调用端和服务端）就会成为 Sentinel 中的资源，在配置了规则后就可以自动享受到 Sentinel 的防护能力。若不希望开启 Sentinel Dubbo Adapter 中的某个 Filter，可以手动关闭对应的 Filter，比如：

```java
@Bean
public ConsumerConfig consumerConfig() {
    ConsumerConfig consumerConfig = new ConsumerConfig();
    consumerConfig.setFilter("-sentinel.dubbo.consumer.filter");
    return consumerConfig;
}
```

我们还提供了几个具体的 Demo，具体代码请见 [sentinel-demo-dubbo](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo/sentinel-demo-dubbo)。

## Service Provider

Service Provider 用于向外界提供服务，处理各个消费者的调用请求。为了保护 Provider 不被激增的流量拖垮影响稳定性，可以给 Provider 配置 **QPS 模式**的限流，这样当每秒的请求量超过设定的阈值时会自动拒绝多的请求。限流粒度可以是服务接口和服务方法两种粒度。若希望整个服务接口的 QPS 不超过一定数值，则可以为对应服务接口资源（resourceName 为**接口全限定名**）配置 QPS 阈值；若希望服务的某个方法的 QPS 不超过一定数值，则可以为对应服务方法资源（resourceName 为**接口全限定名:方法签名**）配置 QPS 阈值。有关配置详情请参考 [流量控制 | Sentinel](https://github.com/alibaba/Sentinel/wiki/%E6%B5%81%E9%87%8F%E6%8E%A7%E5%88%B6)。

我们看一下这种模式的限流产生的效果。假设我们已经定义了某个服务接口 `com.alibaba.csp.sentinel.demo.dubbo.FooService`，其中有一个方法 `sayHello(java.lang.String)`，Provider 端该方法设定 QPS 阈值为 10。在 Consumer 端在 1s 之内连续发起 15 次调用，可以通过日志文件看到 Provider 端被限流。拦截日志统一记录在 `~/logs/csp/sentinel-block.log` 中：

```
2018-07-24 17:13:43|1|com.alibaba.csp.sentinel.demo.dubbo.FooService:sayHello(java.lang.String),FlowException,default,|5,0
```

在 Provider 对应的 metrics 日志中也有记录：

```
1532423623000|2018-07-24 17:13:43|com.alibaba.csp.sentinel.demo.dubbo.FooService|15|0|15|0|3
1532423623000|2018-07-24 17:13:43|com.alibaba.csp.sentinel.demo.dubbo.FooService:sayHello(java.lang.String)|10|5|10|0|0
```

## Service Consumer

Service Consumer 作为客户端去调用远程服务。每一个服务都可能会依赖几个下游服务，若某个服务 A 依赖的下游服务 B 出现了不稳定的情况，服务 A 请求 服务 B 的响应时间变长，从而服务 A 调用服务 B 的线程就会产生堆积，最终可能耗尽服务 A 的线程数。我们通过用并发线程数来控制对下游服务 B 的访问，来保证下游服务不可靠的时候，不会拖垮服务自身。基于这种场景，推荐给 Consumer 配置**线程数模式**的限流，来保证自身不被不稳定服务所影响。限流粒度同样可以是服务接口和服务方法两种粒度。

采用基于线程数的限流模式后，我们不需要再显式地去进行线程池隔离，Sentinel 会控制资源的线程数，超出的请求直接拒绝，直到堆积的线程处理完成。

我们看一下这种模式的效果。假设当前服务 A 依赖两个远程服务方法 `sayHello(java.lang.String)` 和 `doAnother()`。前者远程调用的响应时间 为 1s-1.5s之间，后者 RT 非常小（30 ms 左右）。服务 A 端设两个远程方法 thread count 为 5。然后每隔 50 ms 左右向线程池投入两个任务，作为消费者分别远程调用对应方法，持续 10 次。可以看到 `sayHello` 方法被限流 5 次，因为后面调用的时候前面的远程调用还未返回（RT 高）；而 `doAnother()` 调用则不受影响。线程数目超出时快速失败能够有效地防止自己被慢调用所影响。

## Sentinel Dashboard

Sentinel 还提供 API 用于获取实时的监控信息，对应文档见[此处](https://github.com/alibaba/Sentinel/wiki/%E5%AE%9E%E6%97%B6%E7%9B%91%E6%8E%A7)。为了便于使用，Sentinel 还提供了一个控制台（Dashboard）用于配置规则、查看监控、机器发现等功能。我们只需要按照 [Sentinel 控制台文档](https://github.com/alibaba/Sentinel/wiki/%E6%8E%A7%E5%88%B6%E5%8F%B0) 启动控制台，然后给对应的应用程序添加相应参数并启动即可。比如本文中 Service Provider 示例的启动参数：

```bash
-Djava.net.preferIPv4Stack=true -Dcsp.sentinel.api.port=8720 -Dcsp.sentinel.dashboard.server=localhost:8080 -Dproject.name=dubbo-provider-demo
```

这样在启动 Service Provider 示例以后，就可以在 Sentinel 控制台中找到我们的应用了。可以很方便地在控制台中配置限流规则：

![规则配置](../../img/blog/sentinel-dashboard-view-rules.png)

或者查看实时监控数据：

![秒级实时监控](../../img/blog/sentinel-dashboard-metrics.png)

## 总结

以上介绍的只是 Sentinel 的一个最简单的场景 —— 限流。Sentinel 还可以处理更复杂的各种情况，比如超时熔断、冷启动、请求匀速等。可以参考 [Sentinel 文档](https://github.com/alibaba/Sentinel/wiki/%E4%B8%BB%E9%A1%B5)，更多的场景等待你去挖掘！
