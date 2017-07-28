> ![warning](../sources/images/check.gif)基于NIO的非阻塞实现并行调用，客户端不需要启动多线程即可完成并行调用多个远程服务，相对多线程开销较小。

> ![warning](../sources/images/warning-3.gif)2.0.6及其以上版本支持

![/user-guide/images/future.jpg](../sources/images/future.jpg)

配置声明：

**consumer.xml**

```xml
<dubbo:reference id="fooService" interface="com.alibaba.foo.FooService">
      <dubbo:method name="findFoo" async="true" />
</dubbo:reference>
<dubbo:reference id="barService" interface="com.alibaba.bar.BarService">
      <dubbo:method name="findBar" async="true" />
</dubbo:reference>
```

调用代码:

```java
fooService.findFoo(fooId); // 此调用会立即返回null
Future<Foo> fooFuture = RpcContext.getContext().getFuture(); // 拿到调用的Future引用，当结果返回后，会被通知和设置到此Future。
 
barService.findBar(barId); // 此调用会立即返回null
Future<Bar> barFuture = RpcContext.getContext().getFuture(); // 拿到调用的Future引用，当结果返回后，会被通知和设置到此Future。
 
// 此时findFoo和findBar的请求同时在执行，客户端不需要启动多线程来支持并行，而是借助NIO的非阻塞完成。
 
Foo foo = fooFuture.get(); // 如果foo已返回，直接拿到返回值，否则线程wait住，等待foo返回后，线程会被notify唤醒。
Bar bar = barFuture.get(); // 同理等待bar返回。
 
// 如果foo需要5秒返回，bar需要6秒返回，实际只需等6秒，即可获取到foo和bar，进行接下来的处理。
```

你也可以设置是否等待消息发出：(异步总是不等待返回)

* `sent="true"` 等待消息发出，消息发送失败将抛出异常。
* `sent="false"` 不等待消息发出，将消息放入IO队列，即刻返回。

```xml
<dubbo:method name="findFoo" async="true" sent="true" />
```

如果你只是想异步，完全忽略返回值，可以配置 `return="false"`，以减少Future对象的创建和管理成本：

```xml
<dubbo:method name="findFoo" async="true" return="false" />
```