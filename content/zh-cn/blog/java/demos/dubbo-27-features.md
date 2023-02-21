---
title: "Dubbo2.7 三大新特性详解"
linkTitle: "Dubbo2.7 三大新特性详解"
tags: ["Java"]
date: 2018-08-15
description: >
    异步化改造,三大中心改造,服务治理增强
---

## 1 背景介绍

自 2017 年 7 月阿里重启 Dubbo 开源，到目前为止 github star 数，contributor 数都有了非常大的提升。2018 年 2 月 9 日阿里决定将 Dubbo 项目贡献给 Apache，经过一周的投票，顺利成为了 Apache 的孵化项目，也就是大家现在看到的 **Incubator Dubbo**。预计在 2019 年 4 月，Dubbo 可以达成毕业，成为 Apache 的顶级项目。

## 2 分支介绍

![分支](/imgs/blog/270/branches.png)

Dubbo 目前有如图所示的 5 个分支，其中 2.7.1-release 只是一个临时分支，忽略不计，对其他 4 个分支进行介绍。

- 2.5.x 近期已经通过投票，Dubbo 社区即将停止对其的维护。
- 2.6.x 为长期支持的版本，也是 Dubbo 贡献给 Apache 之前的版本，其包名前缀为：com.alibaba，JDK 版本对应 1.6。
- 3.x-dev 是前瞻性的版本，对 Dubbo 进行一些高级特性的补充，如支持 rx 特性。
- master 为长期支持的版本，版本号为 2.7.x，也是 Dubbo 贡献给 Apache 的开发版本，其包名前缀为：org.apache，JDK 版本对应 1.8。

> 如果想要研究 Dubbo 的源码，建议直接浏览 master 分支。

## 3 Dubbo 2.7 新特性

Dubbo 2.7.x 作为 Apache 的孵化版本，除了代码优化之外，还新增了许多重磅的新特性，本文将会介绍其中最典型的三个新特性：

- 异步化改造
- 三大中心改造
- 服务治理增强

## 4 异步化改造

### 4.1 几种调用方式

![调用方式](/imgs/blog/270/invokes.png)

在远程方法调用中，大致可以分为这 4 种调用方式。oneway 指的是客户端发送消息后，不需要接受响应。对于那些不关心服务端响应的请求，比较适合使用 oneway 通信。

> 注意，void hello() 方法在远程方法调用中，不属于 oneway 调用，虽然 void 方法表达了不关心返回值的语义，但在 RPC 层面，仍然需要做通信层的响应。

sync 是最常用的通信方式，也是默认的通信方法。

future 和 callback 都属于异步调用的范畴，他们的区别是：在接收响应时，future.get() 会导致线程的阻塞;callback 通常会设置一个回调线程，当接收到响应时，自动执行，不会对当前线程造成阻塞。

### 4.2 Dubbo 2.6 异步化

异步化的优势在于客户端不需要启动多线程即可完成并行调用多个远程服务，相对多线程开销较小。介绍 2.7 中的异步化改造之前，先回顾一下如何在 2.6 中使用 Dubbo 异步化的能力。

1. 将同步接口声明成 `async=true`
    ```xml
    <dubbo:reference id="asyncService" interface="org.apache.dubbo.demo.api.AsyncService" async="true"/>
    ```
    ```java
    public interface AsyncService {
        String sayHello(String name);
    }
    ```
2. 通过上下文类获取 future
    ```java
    AsyncService.sayHello("Han Meimei");
    Future<String> fooFuture = RpcContext.getContext().getFuture();
    fooFuture.get();
    ```

可以看出，这样的使用方式，不太符合异步编程的习惯，竟然需要从一个上下文类中获取到 Future。如果同时进行多个异步调用，使用不当很容易造成上下文污染。而且，Future 并不支持 callback 的调用方式。这些弊端在 Dubbo 2.7 中得到了改进。

### 4.3 Dubbo 2.7 异步化

1. 无需配置中特殊声明，显式声明异步接口即可
    ```java
    public interface AsyncService {
        String sayHello(String name);
        default CompletableFuture<String> sayHiAsync(String name) {
            return CompletableFuture.completedFuture(sayHello(name));
        }
    }
    ```
2. 使用 callback 方式处理返回值
    ```java
    CompletableFuture<String> future = asyncService.sayHiAsync("Han MeiMei");
    future.whenComplete((retValue, exception) -> {
        if (exception == null) {
            System.out.println(retValue);
        } else {
            exception.printStackTrace();
        }
    });
    ```

Dubbo 2.7 中使用了 JDK1.8 提供的 `CompletableFuture` 原生接口对自身的异步化做了改进。`CompletableFuture` 可以支持 future 和 callback 两种调用方式，用户可以根据自己的喜好和场景选择使用，非常灵活。

### 4.4 异步化设计 FAQ

Q：如果 RPC 接口只定义了同步接口，有办法使用异步调用吗？

A：2.6 中的异步调用唯一的优势在于，不需要在接口层面做改造，又可以进行异步调用，这种方式仍然在 2.7 中保留；使用 Dubbo 官方提供的 compiler hacker，编译期自动重写同步方法，请[在此](https://github.com/dubbo/dubbo-async-processor#compiler-hacker-processer)讨论和跟进具体进展。

---

Q：关于异步接口的设计问题，为何不提供编译插件，根据原接口，自动编译出一个 XxxAsync 接口？

A：Dubbo 2.7 采用过这种设计，但接口的膨胀会导致服务类的增量发布，而且接口名的变化会影响服务治理的一些相关逻辑，改为方法添加 Async 后缀相对影响范围较小。

---

Q：Dubbo 分为了客户端异步和服务端异步，刚刚你介绍的是客户端异步，为什么不提服务端异步呢？

A：Dubbo 2.7 新增了服务端异步的支持，但实际上，Dubbo 的业务线程池模型，本身就可以理解为异步调用，个人认为服务端异步的特性较为鸡肋。

## 5 三大中心改造

三大中心指的：注册中心，元数据中心，配置中心。

在 2.7 之前的版本，Dubbo 只配备了注册中心，主流使用的注册中心为 zookeeper。新增加了元数据中心和配置中心，自然是为了解决对应的痛点，下面我们来详细阐释三大中心改造的原因。

### 5.1 元数据改造

元数据是什么？元数据定义为描述数据的数据，在服务治理中，例如服务接口名，重试次数，版本号等等都可以理解为元数据。在 2.7 之前，元数据一股脑丢在了注册中心之中，这造成了一系列的问题：

**推送量大 -> 存储数据量大 -> 网络传输量大 -> 延迟严重**

生产者端注册 30+ 参数，有接近一半是不需要作为注册中心进行传递；消费者端注册 25+ 参数，只有个别需要传递给注册中心。有了以上的理论分析，Dubbo 2.7 进行了大刀阔斧的改动，只将真正属于服务治理的数据发布到注册中心之中，大大降低了注册中心的负荷。

同时，将全量的元数据发布到另外的组件中：元数据中心。元数据中心目前支持 redis（推荐），zookeeper。这也为 Dubbo 2.7 全新的 Dubbo Admin 做了准备，关于新版的 Dubbo Admin，我将会后续准备一篇独立的文章进行介绍。

示例：使用 zookeeper 作为元数据中心

```xml
<dubbo:metadata-report address="zookeeper://127.0.0.1:2181"/>
```

### 5.2 Dubbo 2.6 元数据 

```shell
dubbo://30.5.120.185:20880/com.alibaba.dubbo.demo.DemoService?
anyhost=true&
application=demo-provider&
interface=com.alibaba.dubbo.demo.DemoService&
methods=sayHello&
bean.name=com.alibaba.dubbo.demo.DemoService&
dubbo=2.0.2&
executes=4500&
generic=false&
owner=kirito&
pid=84228&
retries=7&
side=provider&
timestamp=1552965771067
```

从本地的 zookeeper 中取出一条服务数据，通过解码之后，可以看出，的确有很多参数是不必要。

### 5.3 Dubbo 2.7 元数据

在 2.7 中，如果不进行额外的配置，zookeeper 中的数据格式仍然会和 Dubbo 2.6 保持一致，这主要是为了保证兼容性，让 Dubbo 2.6 的客户端可以调用 Dubbo 2.7 的服务端。如果整体迁移到 2.7，则可以为注册中心开启简化配置的参数：

```xml
<dubbo:registry address=“zookeeper://127.0.0.1:2181” simplified="true"/>
```

Dubbo 将会只上传那些必要的服务治理数据，一个简化过后的数据如下所示：

```shell
dubbo://30.5.120.185:20880/org.apache.dubbo.demo.api.DemoService?
application=demo-provider&
dubbo=2.0.2&
release=2.7.0&
timestamp=1552975501873
```

对于那些非必要的服务信息，仍然全量存储在元数据中心之中：

![元数据](/imgs/blog/270/metadata.png)

> 元数据中心的数据可以被用于服务测试，服务 MOCK 等功能。目前注册中心配置中 simplified 的默认值为 false，因为考虑到了迁移的兼容问题，在后续迭代中，默认值将会改为 true。

### 5.4 配置中心支持

衡量配置中心的必要性往往从三个角度出发：

1. 分布式配置统一管理

2. 动态变更推送

3. 安全性

Spring Cloud Config, Apollo, Nacos 等分布式配置中心组件都对上述功能有不同程度的支持。在 2.7 之前的版本中，在 zookeeper 中设置了部分节点：configurators，routers，用于管理部分配置和路由信息，它们可以理解为 Dubbo 配置中心的雏形。在 2.7 中，Dubbo 正式支持了配置中心，目前支持的几种注册中心 Zookeeper，Apollo，Nacos（2.7.1-release 支持）。

在 Dubbo 中，配置中心主要承担了两个作用

- 外部化配置。启动配置的集中式存储

- 服务治理。服务治理规则的存储与通知

示例：使用 Zookeeper 作为配置中心

```xml
<dubbo:config-center address="zookeeper://127.0.0.1:2181"/>
```

引入配置中心后，需要注意配置项的覆盖问题，优先级如图所示

![配置覆盖优先级](/imgs/blog/configuration.jpg)

## 6 服务治理增强

我更倾向于将 Dubbo 当做一个服务治理框架，而不仅仅是一个 RPC 框架。在 2.7 中，Dubbo 对其服务治理能力进行了增强，增加了标签路由的能力，并抽象出了应用路由和服务路由的概念。在最后一个特性介绍中，着重对标签路由 TagRouter 进行探讨。

>  在服务治理中，路由层和负载均衡层的对比。区别 1，Router：m 选 n，LoadBalance：n 选 1；区别 2，路由往往是叠加使用的，负载均衡只能配置一种。

在很长的一段时间内，Dubbo 社区经常有人提的一个问题是：Dubbo 如何实现流量隔离和灰度发布，直到 2.7 提供了标签路由，用户可以使用这个功能，来实现上述的需求。

![标签路由](/imgs/blog/270/tag-route.png)

标签路由提供了这样一个能力，当调用链路为 A -> B -> C -> D 时，用户给请求打标，最典型的打标方式可以借助 attachment（他可以在分布式调用中传递下去），调用会优先请求那些匹配的服务端，如 A -> B，C -> D，由于集群中未部署 C 节点，则会降级到普通节点。

打标方式会受到集成系统差异的影响，从而导致很大的差异，所以 Dubbo 只提供了 `RpcContext.getContext().setAttachment()` 这样的基础接口，用户可以使用 SPI 扩展，或者 server filter 的扩展，对测试流量进行打标，引导进入隔离环境/灰度环境。

新版的 Dubbo Admin 提供了标签路由的配置项：

![标签路由配置](/imgs/blog/270/tag-route-config.png)

Dubbo 用户可以在自己系统的基础上对标签路由进行二次扩展，或者借鉴标签路由的设计，实现自己系统的流量隔离，灰度发布。

## 7 总结

本文介绍了 Dubbo 2.7 比较重要的三大新特性：异步化改造，三大中心改造，服务治理增强。Dubbo 2.7 还包含了很多功能优化、特性升级，可以在项目源码的 [CHANGES.md](https://github.com/apache/dubbo/blob/master/CHANGES.md) 中浏览全部的改动点。最后提供一份 Dubbo 2.7 的升级文档：[2.7迁移文档](/zh-cn/docsv2.7/user/versions/version-270/)，欢迎体验。
