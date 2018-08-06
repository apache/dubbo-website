# Sentinel 为 Dubbo 服务保驾护航

在复杂的生产环境下可能部署着成千上万的 Dubbo 服务实例，流量持续不断地进入，服务之间进行相互调用。但是分布式系统中可能会因流量激增、系统负载过高、网络延迟等一系列问题，导致某些服务不可用，如果不进行相应的控制可能导致级联故障，影响服务的可用性，因此我们需要一个能够保障服务稳定性的利器 —— Sentinel，来为 Dubbo 服务保驾护航。[Sentinel](https://github.com/alibaba/Sentinel) 是阿里中间件团队开源的，面向分布式服务架构的轻量级流量控制产品，主要以流量为切入点，从**流量控制**、**熔断降级**、**系统负载保护**等多个维度来帮助用户保护服务的稳定性。

Sentinel 主要功能有三部分：

- 流量控制：Sentinel 可以针对不同的调用关系，以不同的运行指标（如 QPS、线程数、系统负载等）为基准，对资源调用进行流量控制，将随机的请求调整成合适的形状。
- 熔断降级：当调用链路中某个资源出现不稳定的情况，如平均 RT 增高、异常比例升高的时候，Sentinel 会使对此资源的调用请求快速失败，避免影响其它的资源，导致级联失败。
- 系统负载保护：Sentinel 对系统的维度提供保护，让系统的入口流量和系统的负载达到一个平衡，保证系统在能力范围之内处理最多的请求。

本文将介绍如何在 Dubbo 体系中使用 Sentinel，以及与 Sentinel 整合的最佳实践。

## 快速接入 Sentinel

Sentinel 提供了与 Dubbo 整合的模块 - [Sentinel Dubbo Adapter](https://github.com/dubbo/dubbo-sentinel-support)，主要包括针对 Service Provider 和 Service Consumer 实现的 Filter。使用时我们只需引入以下模块（以 Maven 为例）：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-dubbo-adapter</artifactId>
    <version>x.y.z</version>
</dependency>
```

引入此依赖后，Dubbo 的服务接口和方法（包括调用端和服务端）就会成为 Sentinel 中的资源，在配置了规则后就可以自动享受到 Sentinel 的防护能力。

接入 Sentinel Dubbo Adapter 后，即使未配置规则，Sentinel 也会对相应的 Dubbo 服务的调用信息进行统计。那么我们怎么知道 Sentinel 接入成功了呢？这时候就要请出一大利器 —— Sentinel 控制台了。

## Sentinel Dashboard

为了便于使用，Sentinel 提供了一个控制台（Dashboard）用于机器发现、规则配置、查看簇点链路、查看实时监控等功能。我们只需要按照 [Sentinel 控制台文档](https://github.com/alibaba/Sentinel/wiki/%E6%8E%A7%E5%88%B6%E5%8F%B0) 启动控制台，然后给对应的应用程序添加相应参数并启动即可。比如中 Service Provider 的启动参数可以配成：

```bash
-Djava.net.preferIPv4Stack=true -Dcsp.sentinel.api.port=8720 -Dcsp.sentinel.dashboard.server=localhost:8080 -Dproject.name=dubbo-provider-demo
```

这样在启动 Service Provider 以后，就可以在 Sentinel 控制台中找到对应的应用了。可以很方便地在控制台中配置限流规则：

![规则配置](../../img/blog/sentinel-dashboard-view-rules.png)

或者查看实时监控数据：

![秒级实时监控](../../img/blog/sentinel-dashboard-metrics.png)

## Sentinel 与 Dubbo 整合的最佳实践

> 具体 Demo 代码请见 [sentinel-demo-dubbo](https://github.com/alibaba/Sentinel/tree/master/sentinel-demo/sentinel-demo-dubbo)。

### Service Provider

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

很多场景下，根据**调用方**来限流也是非常重要的。比如有两个服务 A 和 B 都向 Service Provider 发起调用请求，我们希望只对来自服务 B 的请求进行限流，则可以设置限流规则的 `limitApp` 为服务 B 的名称。Sentinel Dubbo Adapter 会自动解析 Dubbo 消费者（调用方）的 application name 作为调用方名称（`origin`），在进行资源保护的时候都会带上调用方名称。若限流规则未配置调用方（`default`），则该限流规则对所有调用方生效。若限流规则配置了调用方则限流规则将仅对指定调用方生效。

> 注：Dubbo 默认通信不携带对端 application name 信息，因此需要开发者在调用端手动将 application name 置入 attachment 中，provider 端进行相应的解析。Sentinel Dubbo Adapter 实现了一个 Filter 用于自动从 consumer 端向 provider 端透传 application name。若调用端未引入 Sentinel Dubbo Adapter，又希望根据调用端限流，可以在调用端手动将 application name 置入 attachment 中，key 为 `dubboApplication`。

在限流日志中会也会记录调用方的名称，如：

```
2018-07-25 16:26:48|1|com.alibaba.csp.sentinel.demo.dubbo.FooService:sayHello(java.lang.String),FlowException,default,demo-consumer|5,0
```

其中日志中的 `demo-consumer` 即为调用方名称。

### Service Consumer

Service Consumer 作为客户端去调用远程服务。每一个服务都可能会依赖几个下游服务，若某个服务 A 依赖的下游服务 B 出现了不稳定的情况，服务 A 请求 服务 B 的响应时间变长，从而服务 A 调用服务 B 的线程就会产生堆积，最终可能耗尽服务 A 的线程数。我们通过用并发线程数来控制对下游服务 B 的访问，来保证下游服务不可靠的时候，不会拖垮服务自身。基于这种场景，推荐给 Consumer 配置**线程数模式**的限流，来保证自身不被不稳定服务所影响。限流粒度同样可以是服务接口和服务方法两种粒度。

采用基于线程数的限流模式后，我们不需要再显式地去进行线程池隔离，Sentinel 会控制资源的线程数，超出的请求直接拒绝，直到堆积的线程处理完成，可以达到信号量隔离的效果。

我们看一下这种模式的效果。假设当前服务 A 依赖两个远程服务方法 `sayHello(java.lang.String)` 和 `doAnother()`。前者远程调用的响应时间 为 1s-1.5s之间，后者 RT 非常小（30 ms 左右）。服务 A 端设两个远程方法 thread count 为 5。然后每隔 50 ms 左右向线程池投入两个任务，作为消费者分别远程调用对应方法，持续 10 次。可以看到 `sayHello` 方法被限流 5 次，因为后面调用的时候前面的远程调用还未返回（RT 高）；而 `doAnother()` 调用则不受影响。线程数目超出时快速失败能够有效地防止自己被慢调用所影响。

## Sentinel 与 Hystrix 的比较

目前业界常用的熔断降级/隔离的库是 Netflix 的 [Hystrix](https://github.com/Netflix/Hystrix)，那么 Sentinel 与 Hystrix 有什么异同呢？Hystrix 的关注点在于以 *隔离* 和 *熔断* 为主的容错机制，而 Sentinel 的侧重点在于多样化的流量控制、熔断降级、系统负载保护、实时监控和控制台，可以看到解决的问题还是有比较大的不同的。

Hystrix 采用命令模式封装资源调用逻辑，并且资源的定义与隔离规则是强依赖的，即在创建 HystrixCommand 的时候就要指定隔离规则（因其执行模型依赖于隔离模式）。Sentinel 的设计更为简单，不关注资源是如何执行的，资源的定义与规则的配置相分离。用户可以先定义好资源，然后在需要的时候配置规则即可。Sentinel 的原则非常简单：根据对应资源配置的规则来为资源执行相应的限流/降级/负载保护策略，若规则未配置则仅进行统计。

隔离是 Hystrix 的核心功能。Hystrix 通过线程池或信号量的方式来对依赖（即 Sentinel 中对应的资源）进行隔离，其中最常用的是资源隔离。Hystrix 线程池隔离的好处是比较彻底，但是不足之处在于要开很多线程池，在应用本身线程数目比较多的时候上下文切换的 overhead 会非常大；Hystrix 的信号量隔离模式可以限制调用的并发数而不显式创建线程，这样的方式比较轻量级，但缺点是无法对慢调用自动进行降级，只能等待客户端自己超时，因此仍然可能会出现级联阻塞的情况。Sentinel 可以通过并发线程数模式的流量控制来提供信号量隔离的功能。并且结合基于响应时间的熔断降级模式，可以在不稳定资源的平均响应时间比较高的时候自动降级，防止过多的慢调用占满并发数，影响整个系统。

Hystrix 熔断降级功能采用熔断器模式，在某个服务失败比率高时自动进行熔断。Sentinel 的熔断降级功能更为通用，支持平均响应时间与失败比率两个指标。Sentinel 还提供各种调用链路关系和流量控制效果支持，同时还可以根据系统负载去实时地调整流量来保护系统，应用场景更为丰富。同时，Sentinel 还提供了实时的监控 API 和控制台，可以方便用户快速了解目前系统的状态，对服务的稳定性了如指掌。

更详细的对比请参见 [Sentinel 与 Hystrix 的对比](https://github.com/alibaba/Sentinel/wiki/Sentinel-%E4%B8%8E-Hystrix-%E7%9A%84%E5%AF%B9%E6%AF%94)。

## 总结

以上介绍的只是 Sentinel 的一个最简单的场景 —— 限流。Sentinel 还可以处理更复杂的各种情况，比如超时熔断、冷启动、请求匀速等。可以参考 [Sentinel 文档](https://github.com/alibaba/Sentinel/wiki/%E4%B8%BB%E9%A1%B5)，更多的场景等待你去挖掘！
