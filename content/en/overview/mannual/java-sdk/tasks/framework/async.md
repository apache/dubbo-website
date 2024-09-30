---
aliases:
    - /en/overview/tasks/develop/async/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/async-call/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/async-call/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/async-execute-on-provider/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/async/
description: In certain situations, we hope Dubbo interfaces can be called asynchronously to avoid unnecessary waiting.
linkTitle: Asynchronous Call
title: Asynchronous Call
type: docs
weight: 3
---

Dubbo asynchronous calls can be divided into Provider-side asynchronous calls and Consumer-side asynchronous calls.  
* Consumer-side asynchronous means that after initiating an RPC call, it returns immediately, allowing the calling thread to continue processing other business logic. When the response returns, a callback function is used to notify the consumer of the result.  
* Provider-side asynchronous execution moves blocking business from Dubbo's internal thread pool to a user-defined thread, avoiding excessive occupation of the Dubbo thread pool, which helps prevent interference between different services.

Below is a working example diagram of consumer asynchronous calls:

![/user-guide/images/future.jpg](/imgs/user/future.jpg)

Provider-side asynchronous execution and Consumer-side asynchronous calls are mutually independent, and you can combine the configurations of both sides in any orthogonal manner.  
+ Consumer synchronous - Provider synchronous  
+ Consumer asynchronous - Provider synchronous  
+ Consumer synchronous - Provider asynchronous  
+ Consumer asynchronous - Provider asynchronous  

Please refer to the complete example source code demonstrated in this document:  
* [Consumer asynchronous service call](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-simple-boot)  
* [Provider asynchronous service execution](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-provider)  
* [Defining service methods with CompletableFuture signatures](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-original-future)  

## Provider Asynchronous  

### 1 Using CompletableFuture  

Interface Definition:  
```java  
public interface AsyncService {  
    /**  
     * Synchronous call method  
     */  
    String invoke(String param);  
    /**  
     * Asynchronous call method  
     */  
    CompletableFuture<String> asyncInvoke(String param);  
}  
```  
Service Implementation:  
```java  
@DubboService  
public class AsyncServiceImpl implements AsyncService {  

    @Override  
    public String invoke(String param) {  
        try {  
            long time = ThreadLocalRandom.current().nextLong(1000);  
            Thread.sleep(time);  
            StringBuilder s = new StringBuilder();  
            s.append("AsyncService invoke param:").append(param).append(",sleep:").append(time);  
            return s.toString();  
        }  
        catch (InterruptedException e) {  
            Thread.currentThread().interrupt();  
        }  
        return null;  
    }  

    @Override  
    public CompletableFuture<String> asyncInvoke(String param) {  
        // It is recommended to provide a custom thread pool for supplyAsync  
        return CompletableFuture.supplyAsync(() -> {  
            try {  
                // Do something  
                long time = ThreadLocalRandom.current().nextLong(1000);  
                Thread.sleep(time);  
                StringBuilder s = new StringBuilder();  
                s.append("AsyncService asyncInvoke param:").append(param).append(",sleep:").append(time);  
                return s.toString();  
            } catch (InterruptedException e) {  
                Thread.currentThread().interrupt();  
            }  
            return null;  
        });  
    }  
}  
```  
By returning CompletableFuture.supplyAsync(), the business execution has switched from the Dubbo thread to the business thread, avoiding blocking the Dubbo thread pool.  

### 2 Using AsyncContext  

Dubbo provides an asynchronous interface AsyncContext similar to Servlet 3.0, which can also achieve Provider-side asynchronous execution without a CompletableFuture signature interface.  

Interface Definition:  
```java  
public interface AsyncService {  
    String sayHello(String name);  
}  
```  

Service Implementation:  
```java  
public class AsyncServiceImpl implements AsyncService {  
    public String sayHello(String name) {  
        final AsyncContext asyncContext = RpcContext.startAsync();  
        new Thread(() -> {  
            // If you want to use the context, it must be executed on the first line  
            asyncContext.signalContextSwitch();  
            try {  
                Thread.sleep(500);  
            } catch (InterruptedException e) {  
                e.printStackTrace();  
            }  
            // Write back the response  
            asyncContext.write("Hello " + name + ", response from provider.");  
        }).start();  
        return null;  
    }  
}  
```  

## Consumer Asynchronous  

### 1 Using CompletableFuture  
```java  
@DubboReference  
private AsyncService asyncService;  

@Override  
public void run(String... args) throws Exception {  
    // Call asynchronous interface  
    CompletableFuture<String> future1 = asyncService.asyncInvoke("async call request1");  
    future1.whenComplete((v, t) -> {  
        if (t != null) {  
            t.printStackTrace();  
        } else {  
            System.out.println("AsyncTask Response-1: " + v);  
        }  
    });  
    // Two calls do not return in order  
    CompletableFuture<String> future2 = asyncService.asyncInvoke("async call request2");  
    future2.whenComplete((v, t) -> {  
        if (t != null) {  
            t.printStackTrace();  
        } else {  
            System.out.println("AsyncTask Response-2: " + v);  
        }  
    });  
    // Consumer asynchronous call  
    CompletableFuture<String> future3 = CompletableFuture.supplyAsync(() -> {  
        return asyncService.invoke("invoke call request3");  
    });  
    future3.whenComplete((v, t) -> {  
        if (t != null) {  
            t.printStackTrace();  
        } else {  
            System.out.println("AsyncTask Response-3: " + v);  
        }  
    });  

    System.out.println("AsyncTask Executed before response return.");  
}  
```  

### 2 Using RpcContext  
Configure in the annotation:  
```java  
@DubboReference(async="true")  
private AsyncService asyncService;  
```  

You can also specify method-level asynchronous configurations:  
```java  
@DubboReference(methods = {@Method(name = "sayHello", timeout = 5000)})  
private AsyncService asyncService;  
```  

The subsequent calls will be asynchronous:  
```java  
// This call will immediately return null  
asyncService.sayHello("world");  
// Get the Future reference of the call, which will be notified and set to this Future when the result returns  
CompletableFuture<String> helloFuture = RpcContext.getServiceContext().getCompletableFuture();  
// Add a callback to the Future  
helloFuture.whenComplete((retValue, exception) -> {  
    if (exception == null) {  
        System.out.println(retValue);  
    } else {  
        exception.printStackTrace();  
    }  
});  
```  

Or, you can also do asynchronous calls this way  
```java  
CompletableFuture<String> future = RpcContext.getServiceContext().asyncCall(  
    () -> {  
        asyncService.sayHello("oneway call request1");  
    }  
);  

future.get();  
```  

**Asynchronous calls never wait for a return**, and you can also set whether to wait for the message to be sent  
- `sent="true"` waits for the message to be sent; an exception will be thrown if the message sending fails.  
- `sent="false"` does not wait for the message to be sent, puts the message into the IO queue, and returns immediately.  

```java  
@DubboReference(methods = {@Method(name = "sayHello", timeout = 5000, sent = true)})  
private AsyncService asyncService;  
```  

If you just want to be asynchronous and completely ignore the return value, you can configure `return="false"` to reduce the creation and management cost of Future objects  
```java  
@DubboReference(methods = {@Method(name = "sayHello", timeout = 5000, return = false)})  
private AsyncService asyncService;  
```  

