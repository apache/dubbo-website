---
type: docs
title: "Service Call Extension Point"
linkTitle: "Service Call"
weight: 4
description: "This article will introduce how to customize the core extension points on the call link in Dubbo 3 to meet your needs."
---

![dubbo-architecture](/imgs/v3/concepts/invoke-arch.jpg)

As shown in the figure above, from the perspective of service invocation, Dubbo provides a wealth of extension points in the link, covering load balancing methods, interceptors before and after site selection, and server-side processing interceptors.
To put it simply, when Dubbo initiates a remote call, the main workflow can be divided into two parts: the consumer side and the server side.

The workflow on the consumer side is as follows:
- Receive requests from users through Stub and encapsulate them in `Invocation` object
- Pass the `Invocation` object to `ClusterFilter` (**extension point**) for request preprocessing before site selection, such as conversion of request parameters, request logging, current limiting and other operations are carried out at this stage
- Pass the `Invocation` object to `Cluster` (**extension point**) for decision-making of cluster invocation logic, such as fast failure mode, safe failure mode and other decisions are made at this stage
  - `Cluster` calls `Directory` to get all available server address information
  - `Directory` calls `StateRouter` (**extension point**, recommended) and `Router` (**extension point**) to filter the address information of the server. This stage is mainly from the full amount of address information Filter out the targets that are allowed to be called in this call, such as marking-based traffic routing is carried out at this stage
  - After `Cluster` obtains the available server information provided by `Directory`, it will call `LoadBalance` (**extension point**) to select a target for this call from multiple addresses, such as random call, polling Strategies such as calling and consistent hashing are carried out at this stage
  - `Cluster` obtains the `Invoker` of the target, and then passes `Invocation` to the corresponding `Invoker`, and waits for the result to be returned, and executes the corresponding decision if an error occurs (such as fast failure, safety failure, etc.)
- After the above processing, the `Invoker` with the target address information is obtained, and `Filter` (**extension point**) will be called to process the request after the address selection (due to the `Filter` created on the consumer side The magnitude is the same as that of the server address. If there is no special need, it is recommended to use `ClusterFilter` for extended interception to improve performance)
- Finally `Invocation` will be sent to the server over the network

The workflow of the server is as follows:
- After the server communication layer receives the request, it will pass the request to the protocol layer to construct `Invocation`
- Pass the `Invocation` object to `Filter` (**extension point**) to pre-process the server request, such as server authentication, logging, current limiting and other operations are performed at this stage
- Pass the `Invocation` object to the dynamic proxy to make the real server call

## Filter (interceptor)

The interceptor can implement the interception of the call process of the service provider and the service consumer. Most of Dubbo's own functions are implemented based on this extension point. Every time the remote method is executed, the interception will be executed. Please pay attention to the impact on performance.
Among them, on the consumer side, `ClusterFilter` is used for interception before location selection and `Filter` is used for interception after location selection. If there is no special need, use `ClusterFilter` for extended interception to improve performance.

![filter-architecture](/imgs/v3/concepts/filter-arch.jpg)

In Dubbo 3, the interface signatures of `Filter` and `ClusterFilter` are unified and abstracted into `BaseFilter`, and developers can implement the interfaces of `Filter` or `ClusterFilter` respectively to implement their own interceptors.
If you need to intercept the return status, you can directly implement the `BaseFilter.Listener` interface, and Dubbo will automatically recognize and call it.

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

@SPI(scope = ExtensionScope. MODULE)
public interface Filter extends BaseFilter {
}
```

```java
package org.apache.dubbo.rpc.cluster.filter;

@SPI(scope = ExtensionScope. MODULE)
public interface ClusterFilter extends BaseFilter {
}
```

In particular, if `Filter` or `ClusterFilter` needs to be effective on the Consumer side, the `@Activate` annotation needs to be added, and the value of `group` needs to be `consumer`.

```java
@Activate(group = CommonConstants. CONSUMER)
```

If `Filter` or `ClusterFilter` needs to be effective on the Provider side, the `@Activate` annotation needs to be added, and the value of `group` needs to be `provider`.

```java
@Activate(group = CommonConstants. PROVIDER)
```

Please refer to [Reference](../../reference-manual/spi/description/filter/) for specific call interception extension methods

## Router (routing address selection)

Routing address selection provides the ability to select a batch of target providers that meet the conditions from multiple service providers to call.
Dubbo's routing mainly needs to implement 3 interfaces, which are the `route` method responsible for each call screening, the `notify` method responsible for caching after the address is pushed, and the `stop` method for destroying the route.
It is recommended to implement the `StateRouter` interface in Dubbo 3, which can provide high-performance routing address selection.

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

Please refer to [Reference](../../reference-manual/spi/description/router/) for specific routing address selection expansion methods

## Cluster (cluster rules)

Cluster rules provide capabilities such as result aggregation and fault tolerance when there are multiple service providers.

```java
package org.apache.dubbo.rpc.cluster.support;

public abstract class AbstractClusterInvoker<T> implements ClusterInvoker<T> {
    
    protected abstract Result doInvoke(Invocation invocation, List<Invoker<T>> invokers,
                                       LoadBalance loadbalance) throws RpcException;
}
```


Please refer to [Reference](../../reference-manual/spi/description/cluster/) for specific cluster rule extension methods

## LoadBalance

Load balancing provides the ability to select **one** target provider to call from multiple service providers.

```java
package org.apache.dubbo.rpc.cluster;

public interface LoadBalance {
    
    <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException;
}
```

Please refer to [Reference](../../reference-manual/spi/description/load-balance/) for specific call interception extension methods