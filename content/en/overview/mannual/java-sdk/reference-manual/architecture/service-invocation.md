---
aliases:
    - /en/docs3-v2/java-sdk/concepts-and-architecture/service-invocation/
    - /en/docs3-v2/java-sdk/concepts-and-architecture/service-invocation/
    - /en/overview/mannual/java-sdk/concepts-and-architecture/service-invocation/
description: This article will introduce how to customize the core extension points in the calling chain of the Dubbo Java implementation to meet your needs.
linkTitle: Service Invocation
title: Service Invocation Extension Points
type: docs
weight: 4
---


![dubbo-architecture](/imgs/v3/concepts/invoke-arch.jpg)

As shown in the figure above, from the perspective of service invocation, Dubbo provides a wealth of extension points in the call chain, covering load balancing methods, interceptors before and after service location, server processing interceptors, and more.
In simple terms, when Dubbo initiates a remote call, the main workflow can be divided into two parts: the consumer side and the server side.

The workflow of the consumer side is as follows:
- Receives requests from users through the Stub, encapsulated in the `Invocation` object.
- Passes the `Invocation` object to the `ClusterFilter` (**extension point**) for pre-processing the request before the location, such as request parameter conversion, request logging, rate limiting, etc., are performed at this stage.
- Passes the `Invocation` object to the `Cluster` (**extension point**) to make decisions on cluster call logic, such as fast failure mode, safe failure mode, etc., are made at this stage.
  - The `Cluster` calls the `Directory` to obtain all available server address information.
  - The `Directory` calls the `StateRouter` (**extension point**, recommended to use) and `Router` (**extension point**) to filter router information from the addresses of service providers, mainly to select the targets allowed for this call from the full address information, such as traffic routing based on tags, done at this stage.
  - After obtaining the available server information provided by the `Directory`, the `Cluster` calls `LoadBalance` (**extension point**) to select a target for this call from multiple addresses, such as random calls, polling calls, consistent hashing, etc., are made at this stage.
  - After obtaining the target `Invoker`, the `Cluster` passes the `Invocation` to the corresponding `Invoker`, and waits for the return result; if an error occurs, it executes corresponding decisions (like fast failure, safe failure, etc.).
- After the above processing, the `Invoker` with the target address information is obtained, and it will call the `Filter` (**extension point**) for request processing after location (since the number of `Filter` instances created on the consumer side is consistent with the number of server addresses, it is recommended to use `ClusterFilter` for extension interception if there is no special need to improve performance).
- Finally, the `Invocation` will be sent to the server over the network.

The server side workflow is as follows:
- After receiving the request, the server communication layer will pass the request to the protocol layer to construct the `Invocation`.
- Passes the `Invocation` object to the `Filter` (**extension point**) for pre-processing of the server request, such as server authentication, logging, rate limiting, etc., are all done at this stage.
- Passes the `Invocation` object to the dynamic proxy for the actual server call.

## Filter (Interceptor)

Interceptors can implement the interception during the call process of service providers and consumers. Most of the functionalities in Dubbo are based on this extension point, and every remote method execution will trigger this interception, so pay attention to performance impacts.
Among them, on the consumer side, `ClusterFilter` is for interception before location, and `Filter` is for interception after location. It is recommended to use `ClusterFilter` for extension interception to improve performance unless special needs exist.

![filter-architecture](/imgs/v3/concepts/filter-arch.jpg)

In Dubbo 3, the interface signatures of `Filter` and `ClusterFilter` have been unified and abstracted into `BaseFilter`, allowing developers to implement their interceptors by implementing the interfaces of `Filter` or `ClusterFilter`.
If you need to intercept the return state, you can directly implement the `BaseFilter.Listener` interface, and Dubbo will automatically recognize and invoke it.

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

Specifically, if you need the `Filter` or `ClusterFilter` to take effect on the consumer side, you need to add the `@Activate` annotation and specify the value of `group` as `consumer`.

```java
@Activate(group = CommonConstants.CONSUMER)
```

If you need the `Filter` or `ClusterFilter` to take effect on the provider side, you need to add the `@Activate` annotation and specify the value of `group` as `provider`.

```java
@Activate(group = CommonConstants.PROVIDER)
```

> [Invocation Interception Extension Method](/en/overview/mannual/java-sdk/reference-manual/spi/description/filter/)

## Router (Routing)

Routing provides the ability to select **a batch** of suitable target providers for invocation from multiple service providers.
Dubbo routing mainly needs to implement 3 interfaces, which are responsible for the `route` method for filtering each invocation, the `notify` method for caching after address push, and the `stop` method to destroy the routing.
In Dubbo 3, it is recommended to implement the `StateRouter` interface, which can provide high-performance routing.

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

> [Routing Extension Method](/en/overview/mannual/java-sdk/reference-manual/spi/description/router/)

## Cluster (Cluster Rules)

Cluster rules provide the ability to aggregate results, fault tolerance, etc., when there are multiple service providers.

```java
package org.apache.dubbo.rpc.cluster.support;

public abstract class AbstractClusterInvoker<T> implements ClusterInvoker<T> {
    
    protected abstract Result doInvoke(Invocation invocation, List<Invoker<T>> invokers,
                                       LoadBalance loadbalance) throws RpcException;
}
```


> [Cluster Rule Extension Method](/en/overview/mannual/java-sdk/reference-manual/spi/description/cluster/)

## LoadBalance (Load Balancing)

Load balancing provides the ability to select **one** target provider for invocation from multiple service providers.

```java
package org.apache.dubbo.rpc.cluster;

public interface LoadBalance {
    
    <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException;
}
```
> [Invocation Interception Extension Method](/en/overview/mannual/java-sdk/reference-manual/spi/description/filter/)

