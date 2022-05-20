---
type: docs
title: "Asynchronous Execution"
linkTitle: "Async Execution"
weight: 21
description: "Asynchronous execution on dubbo provider side"
---

The asynchronous execute on provider switches the blocked service from the internal thread pool of Dubbo to the service custom thread to avoid over-occupation of the Dubbo thread pool, which helps to avoid mutual influence between different services.Asynchronous-Execution is not conducive to saving resources or improving RPC responsiveness, because if business execution needs to be blocked, there is always a thread to be responsible for execution.

{{% alert title="Notice" color="primary" %}}
Note: Asynchronous execute on provider and asynchronous execute on consumer are independent of each other. You can configure ends of any orthogonal combination.

- Synchronous Execution On Consumer - Synchronous Execution On Provider
- Asynchronous Executio On Consumer - Synchronous Execution On Provider
- Synchronous Execution On Consumer - Asynchronous Executio On Provider
- Asynchronous Execution On Consumer - Asynchronous Executio On Provider
{{% /alert %}}

## Interface that defines the CompletableFuture signature

Service interface definition：

```java
public interface AsyncService {
    CompletableFuture<String> sayHello(String name);
}
```

Service implementation：

```java
public class AsyncServiceImpl implements AsyncService {
    @Override
    public CompletableFuture<String> sayHello(String name) {
        RpcContext savedContext = RpcContext.getContext();
        // It is recommended to provide a custom thread pool for supplyAsync to avoid using the JDK common thread pool.
        return CompletableFuture.supplyAsync(() -> {
            System.out.println(savedContext.getAttachment("consumer-key1"));
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "async response from provider.";
        });
    }
}
```

The business execution has been switched from the Dubbo thread to the business thread by `return CompletableFuture.supplyAsync()`, avoiding blocking of the Dubbo thread pool.



## Use AsyncContext

Dubbo provides an asynchronous interface `AsyncContext` similar to Serverlet 3.0. It can also implement asynchronous execution of the Provider without the CompletableFuture signature interface.

Service interface definition：

```java
public interface AsyncService {
    String sayHello(String name);
}
```

Service export, exactly the same as ordinary service：

```xml
<bean id="asyncService" class="org.apache.dubbo.samples.governance.impl.AsyncServiceImpl"/>
<dubbo:service interface="org.apache.dubbo.samples.governance.api.AsyncService" ref="asyncService"/>
```

Service implementation：

```java
public class AsyncServiceImpl implements AsyncService {
    public String sayHello(String name) {
        final AsyncContext asyncContext = RpcContext.startAsync();
        new Thread(() -> {
            // If you want to use context, you must do it at the very beginning
            asyncContext.signalContextSwitch();
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            // Write to response
            asyncContext.write("Hello " + name + ", response from provider.");
        }).start();
        return null;
    }
}
```


