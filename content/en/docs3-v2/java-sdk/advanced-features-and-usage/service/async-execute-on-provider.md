---
type: docs
title: "Asynchronous execution"
linkTitle: "Asynchronous execution"
weight: 21
description: "Asynchronous execution of Dubbo service provider"
---

{{% pageinfo %}} This document is no longer maintained. You are currently viewing a snapshot version. If you want to see the latest version of the documentation, see [Latest Version](/en/docs3-v2/java-sdk/advanced-features-and-usage/service/attachment/).
{{% /pageinfo %}}


The asynchronous execution of the provider side switches the blocked business from Dubbo's internal thread pool to the business-defined thread, avoiding excessive occupation of the Dubbo thread pool, and helping to avoid the mutual influence between different services. Asynchronous execution is tantamount to saving resources or improving RPC response performance, because if business execution needs to be blocked, there is always a thread to be responsible for execution.

{{% alert title="Attention" color="warning" %}}
The asynchronous execution on the Provider side and the asynchronous call on the Consumer side are independent of each other, and you can configure both ends in any orthogonal combination
- Consumer Synchronization - Provider Synchronization
- Consumer asynchronous - Provider synchronous
- Consumer synchronous - Provider asynchronous
- Consumer asynchronous - Provider asynchronous
  {{% /alert %}}


## Define the interface of CompletableFuture signature

Service interface definition:

```java
public interface AsyncService {
    CompletableFuture<String> sayHello(String name);
}
```

Service implementation:

```java
public class AsyncServiceImpl implements AsyncService {
    @Override
    public CompletableFuture<String> sayHello(String name) {
        RpcContext savedContext = RpcContext. getContext();
        // It is recommended to provide a custom thread pool for supplyAsync and avoid using the JDK public thread pool
        return CompletableFuture. supplyAsync(() -> {
            System.out.println(savedContext.getAttachment("consumer-key1"));
            try {
                Thread. sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "async response from provider.";
        });
    }
}
```

Through `return CompletableFuture.supplyAsync()`, the business execution has been switched from the Dubbo thread to the business thread, avoiding the blocking of the Dubbo thread pool.



## Using AsyncContext

Dubbo provides an asynchronous interface `AsyncContext` similar to Servlet 3.0, which can also implement asynchronous execution on the Provider side without the CompletableFuture signature interface.

Service interface definition:

```java
public interface AsyncService {
    String sayHello(String name);
}
```

Service exposure is exactly the same as ordinary services:

```xml
<bean id="asyncService" class="org.apache.dubbo.samples.governance.impl.AsyncServiceImpl"/>
<dubbo:service interface="org.apache.dubbo.samples.governance.api.AsyncService" ref="asyncService"/>
```

Service implementation:

```java
public class AsyncServiceImpl implements AsyncService {
    public String sayHello(String name) {
        final AsyncContext asyncContext = RpcContext. startAsync();
        new Thread(() -> {
            // If you want to use the context, it must be executed in the first sentence
            asyncContext.signalContextSwitch();
            try {
                Thread. sleep(500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            // write back the response
            asyncContext.write("Hello " + name + ", response from provider.");
        }).start();
        return null;
    }
}
```