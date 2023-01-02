---
type: docs
title: "Asynchronous call"
linkTitle: "Asynchronous call"
weight: 3
description: "Initiate an asynchronous call in Dubbo"
---

## Feature description
#### background

Starting from 2.7.0, all asynchronous programming interfaces of Dubbo are based on [CompletableFuture](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html)

Based on NIO's non-blocking implementation of parallel calls, the client does not need to start multi-threads to complete parallel calls to multiple remote services, and the overhead of multi-threading is relatively small.

![/user-guide/images/future.jpg](/imgs/user/future.jpg)

## Reference use case

[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-async](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async)
## scenes to be used

Send the user request content to the target request. When the target request encounters high traffic or needs to be processed for a long time, the asynchronous call function will allow the response to be returned to the user immediately, while the target request continues to process the request in the background. When the target request returns the result, the content will be sent displayed to the user.

## How to use
### Interface signed with CompletableFuture

For services that require service providers to define CompletableFuture signatures in advance, the interface definition guidelines are as follows:

The asynchronous execution of the provider side switches the blocked business from Dubbo's internal thread pool to the business-defined thread, avoiding excessive occupation of the Dubbo thread pool, and helping to avoid the mutual influence between different services. Asynchronous execution is tantamount to saving resources or improving RPC response performance, because if business execution needs to be blocked, there is always a thread to be responsible for execution.

> **Provider-side asynchronous execution and Consumer-side asynchronous call are independent of each other, any orthogonal combination of two configurations**
> - Consumer Synchronization - Provider Synchronization
> - Consumer asynchronous - Provider synchronous
> - Consumer synchronous - Provider asynchronous
> - Consumer asynchronous - Provider asynchronous

### Define the interface of CompletableFuture signature

service interface definition
```java
public interface AsyncService {
    CompletableFuture<String> sayHello(String name);
}
```

service realization
```java
public class AsyncServiceImpl implements AsyncService {
    @Override
    public CompletableFuture<String> sayHello(String name) {
        return CompletableFuture. supplyAsync(() -> {
            System.out.println(name);
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



### Using AsyncContext

Dubbo provides an asynchronous interface `AsyncContext` similar to Servlet 3.0, which can also implement asynchronous execution on the Provider side without the CompletableFuture signature interface.

service interface definition
```java
public interface AsyncService {
    String sayHello(String name);
}
```

Service exposure, exactly the same as ordinary services
```xml
<bean id="asyncService" class="org.apache.dubbo.samples.governance.impl.AsyncServiceImpl"/>
<dubbo:service interface="org.apache.dubbo.samples.governance.api.AsyncService" ref="asyncService"/>
```

service realization
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

Note that the return type of the interface is `CompletableFuture<String>`.

XML Reference Service
```xml
<dubbo:reference id="asyncService" timeout="10000" interface="com.alibaba.dubbo.samples.async.api.AsyncService"/>
```

call remote service
```java
// The call directly returns CompletableFuture
CompletableFuture<String> future = asyncService.sayHello("async call request");
// add callback
future. whenComplete((v, t) -> {
    if (t != null) {
        t. printStackTrace();
    } else {
        System.out.println("Response: " + v);
    }
});
// earlier than the result output
System.out.println("Executed before response return.");
```

### Using RpcContext
Configure in consumer.xml
```xml
<dubbo:reference id="asyncService" interface="org.apache.dubbo.samples.governance.api.AsyncService">
      <dubbo:method name="sayHello" async="true" />
</dubbo:reference>
```

calling code
```java
// this call returns null immediately
asyncService.sayHello("world");
// Get the Future reference of the call, when the result is returned, it will be notified and set to this Future
CompletableFuture<String> helloFuture = RpcContext.getServiceContext().getCompletableFuture();
// add callback for Future
helloFuture. whenComplete((retValue, exception) -> {
    if (exception == null) {
        System.out.println(retValue);
    } else {
        exception. printStackTrace();
    }
});
```

Alternatively, it is also possible to do this asynchronously by calling
```java
CompletableFuture<String> future = RpcContext.getServiceContext().asyncCall(
    () -> {
        asyncService.sayHello("oneway call request1");
    }
);

future. get();
```


**Asynchronous always does not wait for return**, you can also set whether to wait for the message to be sent
- `sent="true"` waits for the message to be sent, and an exception will be thrown if the message fails to be sent.
- `sent="false"` does not wait for the message to be sent, puts the message in the IO queue, and returns immediately.

```xml
<dubbo:method name="findFoo" async="true" sent="true" />
```

If you just want to be asynchronous and completely ignore the return value, you can configure `return="false"` to reduce the cost of creating and managing Future objects
```xml
<dubbo:method name="findFoo" async="true" return="false" />
```