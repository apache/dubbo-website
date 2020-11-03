```
# Asynchronous call

NIO-based non-blocking parallel call, the client does not need to start multi-threading to complete multiple remote services in parallel, and the relative multi-threading overhead is small.。 [^1]

![/user-guide/images/future.jpg](../sources/images/future.jpg)

Configured in consumer.xml:

```xml
<dubbo:reference id="fooService" interface="com.alibaba.foo.FooService">
      <dubbo:method name="findFoo" async="true" />
</dubbo:reference>
<dubbo:reference id="barService" interface="com.alibaba.bar.BarService">
      <dubbo:method name="findBar" async="true" />
</dubbo:reference>
```

Call code:

```java
// This call will return null immediately
fooService.findFoo(fooId);
// Get the called Future reference, when the result is returned, it will be notified and set to this Future
Future<Foo> fooFuture = RpcContext.getContext().getFuture();
 
// This call will return null immediately
barService.findBar(barId);
// Get the called Future reference, when the result is returned, it will be notified and set to this Future
Future<Bar> barFuture = RpcContext.getContext().getFuture();
 
// At this time, the requests of findFoo and findBar are executed at the same time. The client does not need to start multi-threading to support parallelism, but completes the non-blocking of NIO.
 
/ / If foo has returned, get the return value directly, otherwise the thread waits, waiting for foo to return, the thread will be wake up by notify
Foo foo = fooFuture.get();
// Same as waiting for bar to return
Bar bar = barFuture.get();
 
// If foo needs 5 seconds to return, bar needs 6 seconds to return. In fact, it only takes 6 seconds to get foo and bar for the next processing.
```

You can also set whether to wait for the message to be sent: [^2]

* `sent="true"` Wait for a message to be sent, and a message failure will throw an exception.
* `sent="false"` Do not wait for the message to be sent, put the message into the IO queue, and return immediately.

```xml
<dubbo:method name="findFoo" async="true" sent="true" />
```

If you just want to be asynchronous and completely ignore the return value, you can configure `return="false"` to reduce the creation and management cost of the Future object:

```xml
<dubbo:method name="findFoo" async="true" return="false" />
```

[^1]: Supported by `2.0.6` and above
[^2]: Asynchronous always does not wait to return
```