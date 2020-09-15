# Asynchronous Call

As dubbo is based on a non-blocking NIO network layer, the client can start parallel call to multiple remote services without explicitly starting mulithreads, which costs relatively fewer resources.

![/user-guide/images/future.jpg](../sources/images/future.jpg)


You can config at `consumer.xml` for setup asynchronous call some remote service.

```xml
<dubbo:reference id="fooService" interface="com.alibaba.foo.FooService">
      <dubbo:method name="findFoo" async="true" />
</dubbo:reference>
<dubbo:reference id="barService" interface="com.alibaba.bar.BarService">
      <dubbo:method name="findBar" async="true" />
</dubbo:reference>
```
Configure the above configuration information,you can invoke the remote service in your code.

```java
// the invoke will return null immediately
fooService.findFoo(fooId);
// get current invoke Future instance,when the remote service has return result,will notify this Future instance.
Future<Foo> fooFuture = RpcContext.getContext().getFuture();

// the invoke will return null immediately
barService.findBar(barId);
// get current invoke Future instance,when the remote service has return result,will notify this Future instance.
Future<Bar> barFuture = RpcContext.getContext().getFuture();

// now the request of findFoo and findBar was executed at same time,The client not need setup multithreading for parallel call, which is NIO-based non-blocking implementation of parallel calls

// Current thread will be blocking,and wait findFoo has return. when remote service has return findFoo result,the current thread will be wake up.
Foo foo = fooFuture.get();
// same to findFoo
Bar bar = barFuture.get();

// if findFoo expend five second for wait remote service  return result,and findBar expend six second. Actually,only expend six second will get findFoo and findBar result,and proceed to the next step.
```


You can also set whether to wait for the message to be sent:

* `sent="true"` wait for the message to be send,if send failure，will throw exception.
* `sent="false"` do not wait for the message to be send,when the message will push into io queue,will return immediately.

The Example:

```xml
<dubbo:method name="findFoo" async="true" sent="true" />
```
if you only want to asynchronous call,and don't care the return.you can config `return="false"`,To reduce the cost of creating and managing Future objects.

```xml
<dubbo:method name="findFoo" async="true" return="false" />
```

**Note**
 `2.0.6+` version supported.
