---
type: docs
title: "异步调用"
linkTitle: "异步调用"
weight: 21
description: "在 Dubbo 中发起异步调用"
---


从 2.7.0 开始，Dubbo 的所有异步编程接口开始以 [CompletableFuture](https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html) 为基础

基于 NIO 的非阻塞实现并行调用，客户端不需要启动多线程即可完成并行调用多个远程服务，相对多线程开销较小。

![/user-guide/images/future.jpg](/imgs/user/future.jpg)


## 使用 CompletableFuture 签名的接口

需要服务提供者事先定义 CompletableFuture 签名的服务，具体参见[服务端异步执行]({{<ref "/docs/v2.7/user/examples/async-execute-on-provider.md" >}} "")接口定义：

```java
public interface AsyncService {
    CompletableFuture<String> sayHello(String name);
}
```

注意接口的返回类型是 `CompletableFuture<String>`。

XML引用服务：

```xml
<dubbo:reference id="asyncService" timeout="10000" interface="com.alibaba.dubbo.samples.async.api.AsyncService"/>
```

调用远程服务：

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

## 使用 RpcContext

在 consumer.xml 中配置：

```xml
<dubbo:reference id="asyncService" interface="org.apache.dubbo.samples.governance.api.AsyncService">
      <dubbo:method name="sayHello" async="true" />
</dubbo:reference>
```

调用代码:

```java
// 此调用会立即返回null
asyncService.sayHello("world");
// 拿到调用的Future引用，当结果返回后，会被通知和设置到此Future
CompletableFuture<String> helloFuture = RpcContext.getContext().getCompletableFuture();
// 为Future添加回调
helloFuture.whenComplete((retValue, exception) -> {
    if (exception == null) {
        System.out.println(retValue);
    } else {
        exception.printStackTrace();
    }
});
```

或者，你也可以这样做异步调用:

```java
CompletableFuture<String> future = RpcContext.getContext().asyncCall(
    () -> {
        asyncService.sayHello("oneway call request1");
    }
);

future.get();
```



## 重载服务接口

如果你只有这样的同步服务定义，而又不喜欢 RpcContext 的异步使用方式。

```java
public interface GreetingsService {
    String sayHi(String name);
}
```

那还有一种方式，就是利用 Java 8 提供的 default 接口实现，重载一个带有 CompletableFuture 签名的方法。
  
> CompletableFuture 签名的方法目前只支持 Dubbo 协议，其他协议由于第三方实现问题，需要视具体情况而定。

有两种方式来实现：

1. 提供方或消费方自己修改接口签名

```java
public interface GreetingsService {
    String sayHi(String name);
    
    // AsyncSignal is totally optional, you can use any parameter type as long as java allows your to do that.
    default CompletableFuture<String> sayHi(String name, AsyncSignal signal) {
        return CompletableFuture.completedFuture(sayHi(name));
    }
}
```

1. Dubbo 官方提供 compiler hacker，编译期自动重写同步方法，请[在此](https://github.com/dubbo/dubbo-async-processor#compiler-hacker-processer)讨论和跟进具体进展。



你也可以设置是否等待消息发出： [^1]

- `sent="true"` 等待消息发出，消息发送失败将抛出异常。
- `sent="false"` 不等待消息发出，将消息放入 IO 队列，即刻返回。

```xml
<dubbo:method name="findFoo" async="true" sent="true" />
```

如果你只是想异步，完全忽略返回值，可以配置 `return="false"`，以减少 Future 对象的创建和管理成本：

```xml
<dubbo:method name="findFoo" async="true" return="false" />
```

[^1]: 异步总是不等待返回