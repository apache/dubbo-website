---
aliases:
    - /zh/overview/tasks/develop/async/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/async-call/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/async-call/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/async-execute-on-provider/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/async/
description: 某些情况下希望dubbo接口异步调用，避免不必要的等待。
linkTitle: 异步调用
title: 异步调用
type: docs
weight: 3
---

Dubbo 异步调用分为 Provider 端异步调用和 Consumer 端异步两种模式。
* Consumer 端异步是指发起 RPC 调用后立即返回，调用线程继续处理其他业务逻辑，当响应结果返回后通过回调函数通知消费端结果。
* Provider 端异步执行将阻塞的业务从 Dubbo 内部线程池切换到业务自定义线程，避免Dubbo线程池的过度占用，有助于避免不同服务间的互相影响。

以下是消费端 consumer 异步调用的工作示例图：

![/user-guide/images/future.jpg](/imgs/user/future.jpg)

Provider 端异步执行和 Consumer 端异步调用是相互独立的，你可以任意正交组合两端配置。
+ Consumer同步 - Provider同步
+ Consumer异步 - Provider同步
+ Consumer同步 - Provider异步
+ Consumer异步 - Provider异步

本文档演示的完整示例源码请参见：
* [Consumer 服务调用异步](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-simple-boot)
* [Provider 服务执行异步](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-provider)
* [定义 CompletableFuture 方法签名的服务](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-original-future)

## Provider异步

### 1 使用CompletableFuture

接口定义：
```java
public interface AsyncService {
    /**
     * 同步调用方法
     */
    String invoke(String param);
    /**
     * 异步调用方法
     */
    CompletableFuture<String> asyncInvoke(String param);
}

```
服务实现：
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
        // 建议为supplyAsync提供自定义线程池
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
通过 return CompletableFuture.supplyAsync() ，业务执行已从 Dubbo 线程切换到业务线程，避免了对 Dubbo 线程池的阻塞。

### 2 使用AsyncContext

Dubbo 提供了一个类似 Servlet 3.0 的异步接口AsyncContext，在没有 CompletableFuture 签名接口的情况下，也可以实现 Provider 端的异步执行。

接口定义：
```java
public interface AsyncService {
    String sayHello(String name);
}

```

服务实现：

```java
public class AsyncServiceImpl implements AsyncService {
    public String sayHello(String name) {
        final AsyncContext asyncContext = RpcContext.startAsync();
        new Thread(() -> {
            // 如果要使用上下文，则必须要放在第一句执行
            asyncContext.signalContextSwitch();
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            // 写回响应
            asyncContext.write("Hello " + name + ", response from provider.");
        }).start();
        return null;
    }
}

```

## Consumer异步

### 1 使用CompletableFuture
```java
@DubboReference
private AsyncService asyncService;

@Override
public void run(String... args) throws Exception {
    //调用异步接口
    CompletableFuture<String> future1 = asyncService.asyncInvoke("async call request1");
    future1.whenComplete((v, t) -> {
        if (t != null) {
            t.printStackTrace();
        } else {
            System.out.println("AsyncTask Response-1: " + v);
        }
    });
    //两次调用并非顺序返回
    CompletableFuture<String> future2 = asyncService.asyncInvoke("async call request2");
    future2.whenComplete((v, t) -> {
        if (t != null) {
            t.printStackTrace();
        } else {
            System.out.println("AsyncTask Response-2: " + v);
        }
    });
    //consumer异步调用
    CompletableFuture<String> future3 =  CompletableFuture.supplyAsync(() -> {
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

### 2 使用 RpcContext
在注解中配置:

```java
@DubboReference(async="true")
private AsyncService asyncService;
```

也可以指定方法级别的异步配置：

```java
@DubboReference(methods = {@Method(name = "sayHello", timeout = 5000)})
private AsyncService asyncService;
```

接下来的调用即会是异步的：

```java
// 此调用会立即返回null
asyncService.sayHello("world");
// 拿到调用的Future引用，当结果返回后，会被通知和设置到此Future
CompletableFuture<String> helloFuture = RpcContext.getServiceContext().getCompletableFuture();
// 为Future添加回调
helloFuture.whenComplete((retValue, exception) -> {
    if (exception == null) {
        System.out.println(retValue);
    } else {
        exception.printStackTrace();
    }
});
```

或者，也可以这样做异步调用
```java
CompletableFuture<String> future = RpcContext.getServiceContext().asyncCall(
    () -> {
        asyncService.sayHello("oneway call request1");
    }
);

future.get();
```

**异步总是不等待返回**，你也可以设置是否等待消息发出
- `sent="true"`  等待消息发出，消息发送失败将抛出异常。
- `sent="false"` 不等待消息发出，将消息放入 IO 队列，即刻返回。

```java
@DubboReference(methods = {@Method(name = "sayHello", timeout = 5000， sent = true)})
private AsyncService asyncService;
```

如果你只是想异步，完全忽略返回值，可以配置 `return="false"`，以减少 Future 对象的创建和管理成本
```java
@DubboReference(methods = {@Method(name = "sayHello", timeout = 5000， return = false)})
private AsyncService asyncService;
```


