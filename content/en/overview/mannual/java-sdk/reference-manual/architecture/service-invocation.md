---
aliases:
    - /zh/docs3-v2/java-sdk/concepts-and-architecture/service-invocation/
    - /zh-cn/docs3-v2/java-sdk/concepts-and-architecture/service-invocation/
    - /zh-cn/overview/mannual/java-sdk/concepts-and-architecture/service-invocation/
description: 本文将介绍如何在 Dubbo Java 实现中自定义调用链路上核心的扩展点以满足您的需求。
linkTitle: 服务调用
title: 服务调用扩展点
type: docs
weight: 4
---


![dubbo-architucture](/imgs/v3/concepts/invoke-arch.jpg)

如上图所示，从服务调用的角度来看，Dubbo 在链路中提供了丰富的扩展点，覆盖了负载均衡方式、选址前后的拦截器、服务端处理拦截器等。
简单来说 Dubbo 发起远程调用的时候，主要工作流程可以分为消费端和服务端两个部分。

消费端的工作流程如下：
- 通过 Stub 接收来自用户的请求，并且封装在 `Invocation` 对象中
- 将 `Invocation` 对象传递给 `ClusterFilter`（**扩展点**）做选址前的请求预处理，如请求参数的转换、请求日志记录、限流等操作都是在此阶段进行的
- 将 `Invocation` 对象传递给 `Cluster`（**扩展点**）进行集群调用逻辑的决策，如快速失败模式、安全失败模式等决策都是在此阶段进行的
  - `Cluster` 调用 `Directory` 获取所有可用的服务端地址信息
  - `Directory` 调用 `StateRouter`（**扩展点**，推荐使用） 和 `Router`（**扩展点**） 对服务端的地址信息进行路由筛选，此阶段主要是从全量的地址信息中筛选出本次调用允许调用到的目标，如基于打标的流量路由就是在此阶段进行的
  - `Cluster` 获得从 `Directory` 提供的可用服务端信息后，会调用 `LoadBalance` （**扩展点**）从多个地址中选择出一个本次调用的目标，如随机调用、轮询调用、一致性哈希等策略都是在此阶段进行的
  - `Cluster` 获得目标的 `Invoker` 以后将 `Invocation` 传递给对应的 `Invoker`，并等待返回结果，如果出现报错则执行对应的决策（如快速失败、安全失败等）
- 经过上面的处理，得到了带有目标地址信息的 `Invoker`，会再调用 `Filter`（**扩展点**）进行选址后的请求处理（由于在消费端侧创建的 `Filter` 数量级和服务端地址量级一致，如无特殊需要建议使用 `ClusterFilter` 进行扩展拦截，以提高性能）
- 最后 `Invocation` 会被通过网络发送给服务端

服务端的工作流程如下：
- 服务端通信层收到请求以后，会将请求传递给协议层构建出 `Invocation`
- 将 `Invocation` 对象传递给 `Filter` （**扩展点**）做服务端请求的预处理，如服务端鉴权、日志记录、限流等操作都是在此阶段进行的
- 将 `Invocation` 对象传递给动态代理做真实的服务端调用

## Filter（拦截器）

拦截器可以实现服务提供方和服务消费方调用过程拦截，Dubbo 本身的大多功能均基于此扩展点实现，每次远程方法执行，该拦截都会被执行，请注意对性能的影响。
其中在消费端侧，`ClusterFilter` 用于选址前的拦截和 `Filter` 用于选址后的拦截。如无特殊需要使用 `ClusterFilter` 进行扩展拦截，以提高性能。

![filter-architucture](/imgs/v3/concepts/filter-arch.jpg)

在 Dubbo 3 中，`Filter` 和 `ClusterFilter` 的接口签名被统一抽象到 `BaseFilter` 中，开发者可以分别实现 `Filter` 或 `ClusterFilter` 的接口来实现自己的拦截器。
如果需要拦截返回状态，可以直接实现 `BaseFilter.Listener` 的接口，Dubbo 将自动识别，并进行调用。

```java
package org.apache.dubbo.rpc;

public interface BaseFilter {
    
    Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException;

    interface Listener {

        void onResponse(Result appResponse, Invoker<?> invoker, Invocation invocation);

        void onError(Throwable t, Invoker<?> invoker, Invocation invocation);
    }
}
```

```java
package org.apache.dubbo.rpc;

@SPI(scope = ExtensionScope.MODULE)
public interface Filter extends BaseFilter {
}
```

```java
package org.apache.dubbo.rpc.cluster.filter;

@SPI(scope = ExtensionScope.MODULE)
public interface ClusterFilter extends BaseFilter {
}
```

特别的，如果需要在 Consumer 侧生效 `Filter` 或 `ClusterFilter`，需要增加 `@Activate` 注解，并且需要指定 `group` 的值为 `consumer`。

```java
@Activate(group = CommonConstants.CONSUMER)
```

如果需要在 Provider 侧生效 `Filter` 或 `ClusterFilter`，需要增加 `@Activate` 注解，并且需要指定 `group` 的值为 `provider`。

```java
@Activate(group = CommonConstants.PROVIDER)
```

> [调用拦截扩展方式](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/filter/)

## Router（路由选址）

路由选址提供从多个服务提供方中选择**一批**满足条件的目标提供方进行调用的能力。
Dubbo 的路由主要需要实现 3 个接口，分别是负责每次调用筛选的 `route` 方法，负责地址推送后缓存的 `notify` 方法，以及销毁路由的 `stop` 方法。
在 Dubbo 3 中推荐实现 `StateRouter` 接口，能够提供高性能的路由选址方式。

```java
package org.apache.dubbo.rpc.cluster.router.state;

public interface StateRouter<T> {

    BitList<Invoker<T>> route(BitList<Invoker<T>> invokers, URL url, Invocation invocation,
                     boolean needToPrintMessage, Holder<RouterSnapshotNode<T>> nodeHolder) throws RpcException;

    void notify(BitList<Invoker<T>> invokers);

    void stop();
}
```

```java
package org.apache.dubbo.rpc.cluster;

public interface Router extends Comparable<Router> {

    @Deprecated
    List<Invoker<T>> route(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException;
    
    <T> RouterResult<Invoker<T>> route(List<Invoker<T>> invokers, URL url, Invocation invocation,
                                                     boolean needToPrintMessage) throws RpcException;

    <T> void notify(List<Invoker<T>> invokers);

    void stop();
}
```

> [路由选址扩展方式](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/router/)

## Cluster（集群规则）

集群规则提供在有多个服务提供方时进行结果聚合、容错等能力。

```java
package org.apache.dubbo.rpc.cluster.support;

public abstract class AbstractClusterInvoker<T> implements ClusterInvoker<T> {
    
    protected abstract Result doInvoke(Invocation invocation, List<Invoker<T>> invokers,
                                       LoadBalance loadbalance) throws RpcException;
}
```


> [集群规则扩展方式](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/cluster/)

## LoadBalance（负载均衡）

负载均衡提供从多个服务提供方中选择**一个**目标提供方进行调用的能力。

```java
package org.apache.dubbo.rpc.cluster;

public interface LoadBalance {
    
    <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException;
}
```
> [调用拦截扩展方式](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/filter/)
