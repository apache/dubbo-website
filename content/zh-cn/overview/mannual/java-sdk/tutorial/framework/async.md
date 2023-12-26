---
aliases:
    - /zh/overview/tasks/develop/async/
description: 某些情况下希望dubbo接口异步调用，避免不必要的等待。
linkTitle: Provider端和Consumer端异步调用
title: 异步调用
type: docs
weight: 3
---

文档完整的示例地址请参见
* [服务调用异步](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-simple-boot)
* [服务执行异步](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-provider)
* [定义 CompletableFuture 方法签名的服务](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-original-future)

## 异步调用
Dubbo异步调用分为Provider端异步调用和Consumer端异步调用。
Provider端异步执行将阻塞的业务从Dubbo内部线程池切换到业务自定义线程，
避免Dubbo线程池的过度占用，有助于避免不同服务间的互相影响。异步执行无异于节省资源或提升RPC响应性能。

*<font color='#FF7D00' size=4 > 注意 </font>*

> Provider 端异步执行和 Consumer 端异步调用是相互独立的，你可以任意正交组合两端配置
> + Consumer同步 - Provider同步
> + Consumer异步 - Provider同步
> + Consumer同步 - Provider异步
> + Consumer异步 - Provider异步

## 使用场景
* 对于Provider端来说，如果接口比较耗时，避免dubbo线程被阻塞，可以使用异步将线程切换到业务线程。
* 对于Consumer端来说，调用Dubbo接口没有严格时序上的关系、不是原子操作、不影响逻辑情况下可以使用异步调用。


## Provider异步

### 1、使用CompletableFuture实现异步

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

### 2、使用AsyncContext实现异步

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