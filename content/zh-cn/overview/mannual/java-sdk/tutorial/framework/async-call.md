---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/async-call/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/async-call/
description: 在 Dubbo 中发起异步调用
linkTitle: 异步调用
title: 异步调用
type: docs
weight: 3
---






## 特性说明
#### 背景

从 2.7.0 开始，Dubbo 的所有异步编程接口开始以 [CompletableFuture](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html) 为基础

基于 NIO 的非阻塞实现并行调用，客户端不需要启动多线程即可完成并行调用多个远程服务，相对多线程开销较小。

![/user-guide/images/future.jpg](/imgs/user/future.jpg)


## 使用场景

将用户请求内容发送到目标请求，当目标请求遇到高流量或需要长时间处理，异步调用功能将允许立即向用户返回响应，同时目标请求继续后台处理请求，当目标请求返回结果时，将内容显示给用户。

> 参考用例
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-async](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async)

## 使用方式
### 使用 CompletableFuture 签名的接口

需要服务提供者事先定义 CompletableFuture 签名的服务，接口定义指南如下：

Provider端异步执行将阻塞的业务从Dubbo内部线程池切换到业务自定义线程，避免Dubbo线程池的过度占用，有助于避免不同服务间的互相影响。异步执行无异于节省资源或提升RPC响应性能，因为如果业务执行需要阻塞，则始终还是要有线程来负责执行。

> **Provider 端异步执行和 Consumer 端异步调用是相互独立的，任意正交组合两端配置**
> - Consumer同步 - Provider同步
> - Consumer异步 - Provider同步
> - Consumer同步 - Provider异步
> - Consumer异步 - Provider异步

### 定义 CompletableFuture 签名的接口

服务接口定义
```java
public interface AsyncService {
    CompletableFuture<String> sayHello(String name);
}
```

服务实现
```java
public class AsyncServiceImpl implements AsyncService {
    @Override
    public CompletableFuture<String> sayHello(String name) {
        return CompletableFuture.supplyAsync(() -> {
            System.out.println(name);
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

注意接口的返回类型是 `CompletableFuture<String>`。

XML 引用服务
```xml
<dubbo:reference id="asyncService" timeout="10000" interface="com.alibaba.dubbo.samples.async.api.AsyncService"/>
```

调用远程服务
```java
// 调用直接返回CompletableFuture
CompletableFuture<String> future = asyncService.sayHello("async call request");
// 增加回调
future.whenComplete((v, t) -> {
    if (t != null) {
        t.printStackTrace();
    } else {
        System.out.println("Response: " + v);
    }
});
// 早于结果输出
System.out.println("Executed before response return.");
```

### 使用 AsyncContext

Dubbo 提供了一个类似 Servlet 3.0 的异步接口`AsyncContext`，在没有 CompletableFuture 签名接口的情况下，也可以实现 Provider 端的异步执行。

服务接口定义
```java
public interface AsyncService {
    String sayHello(String name);
}
```

服务暴露，和普通服务完全一致
```xml
<bean id="asyncService" class="org.apache.dubbo.samples.governance.impl.AsyncServiceImpl"/>
<dubbo:service interface="org.apache.dubbo.samples.governance.api.AsyncService" ref="asyncService"/>
```

服务实现
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

### 使用 RpcContext 实现消费端异步调用
在 consumer.xml 中配置
```xml
<dubbo:reference id="asyncService" interface="org.apache.dubbo.samples.governance.api.AsyncService">
      <dubbo:method name="sayHello" async="true" />
</dubbo:reference>
```

调用代码
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

```xml
<dubbo:method name="findFoo" async="true" sent="true" />
```

如果你只是想异步，完全忽略返回值，可以配置 `return="false"`，以减少 Future 对象的创建和管理成本
```xml
<dubbo:method name="findFoo" async="true" return="false" />
```