---
type: docs
title: "异步执行"
linkTitle: "异步执行"
weight: 21
description: "Dubbo 服务提供方的异步执行"
---


Provider端异步执行将阻塞的业务从Dubbo内部线程池切换到业务自定义线程，避免Dubbo线程池的过度占用，有助于避免不同服务间的互相影响。异步执行无益于节省资源或提升RPC响应性能，因为如果业务执行需要阻塞，则始终还是要有线程来负责执行。

{{% alert title="注意" color="warning" %}}
Provider 端异步执行和 Consumer 端异步调用是相互独立的，你可以任意正交组合两端配置
- Consumer同步 - Provider同步
- Consumer异步 - Provider同步
- Consumer同步 - Provider异步
- Consumer异步 - Provider异步
{{% /alert %}}


## 定义 CompletableFuture 签名的接口

服务接口定义：

```java
public interface AsyncService {
    CompletableFuture<String> sayHello(String name);
}
```

服务实现：

```java
public class AsyncServiceImpl implements AsyncService {
    @Override
    public CompletableFuture<String> sayHello(String name) {
        RpcContext savedContext = RpcContext.getContext();
        // 建议为supplyAsync提供自定义线程池，避免使用JDK公用线程池
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

通过 `return CompletableFuture.supplyAsync() `，业务执行已从 Dubbo 线程切换到业务线程，避免了对 Dubbo 线程池的阻塞。



## 使用AsyncContext

Dubbo 提供了一个类似 Serverlet 3.0 的异步接口`AsyncContext`，在没有 CompletableFuture 签名接口的情况下，也可以实现 Provider 端的异步执行。

服务接口定义：

```java
public interface AsyncService {
    String sayHello(String name);
}
```

服务暴露，和普通服务完全一致：

```xml
<bean id="asyncService" class="org.apache.dubbo.samples.governance.impl.AsyncServiceImpl"/>
<dubbo:service interface="org.apache.dubbo.samples.governance.api.AsyncService" ref="asyncService"/>
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







