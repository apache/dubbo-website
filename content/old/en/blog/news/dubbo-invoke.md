---
title: "Dubbo: Several ways about synchronous/asynchronous invoke"
linkTitle: "Dubbo Invoke"
date: 2018-08-14
description: >
    This article introduces you how to use Dubbo synchronously or asynchronously.
---

As we all know，Dubbo adopts a single large join protocol by default and takes the NIO asynchronous communication mechanism of Netty as the low-level implementation. Based on this mechanism, Dubbo implements several invocation modes as follows:

* synchronous invoke
* asynchronous invoke
* parameters callback
* event notification

### Synchronous invoke

Synchronous invoke is a kind of blocking invocation mode, that is the Consumer keeps blocking and waiting, until the Provider returns.

Generally, a typical synchronous invocation process is as follows:

1. Consumer service thread invokes the remote API and sends requests to the Provider. Meanwhile, the current service thread stays in blocking state;
2. Provider process relative request after receiving it from Consumer. Then returns the results to Consumer;
3. After Consumer receiving results, the current thread continues to execute.

Here are two problems:

1. How does Consumer service thread turn into `blocking` state?
2. How does the service thread be awaked to execute after Consumer receiving results?

In fact, the low-level I/O operations of Dubbo are all asynchronous. The Consumer gets a Future object after invoking the Provider. For synchronous invoke, the service thread takes advantage of `Future#get(timeout)` to block and wait for Provider returning results, with the 'timeout' indicating the timeout defined by Consumer. When the result returns, the Future will be set and the blocked service thread will be awaked. The service thread will return an exception if there is no result after timeout.

### Asynchronous invoke

For scenarios that Provider has a long response time, it's necessary to implement asynchronous invoke based on Dubbo's underlying asynchronous NIO. It could utilize the resource of Consumer effectively, and costs less than using multi-thread for Consumer.

Asynchronous invoke does not need specific configuration for Provider. In the example，the API of Provider is defined as follow：

```java
public interface AsyncService {
    String goodbye(String name);
}
```

##### Consumer configuration

```xml
<dubbo:reference id="asyncService" interface="com.alibaba.dubbo.samples.async.api.AsyncService">
    <dubbo:method name="goodbye" async="true"/>
</dubbo:reference>
```

Notice that if we need an asynchronous revoke method, we must use `<dubbo:method/>` label to describe it.

##### Consumer triggers invocation

```java
AsyncService service = ...;
String result = service.goodbye("samples");// returns NULL and DO NOT use!
Future<String> future = RpcContext.getContext().getFuture();
... // other service thread logic
result = future.get(); // could use get(timeout, unit) to configure timeout, when it needs to get the asynchronous result
```

After Dubbo Consumer triggers invocation, it uses `RpcContext.getContext().getFuture()` to get the relative `Future` object, and then it could start executing other tasks. Anytime when we need results, `future.get(timeout)` is supposed to be called.

Under several special conditions, it could be set whether to wait for sending the request, to accelerate the return of invocation:

* `sent="true"` Waiting for sending the request, and return an exception if it fails;
* `sent="false"` Do not wait for the request, and returns immediately after putting the request to the I/O queue.

We set it to `false` by default. And detailed configuration is as follows：

```xml
<dubbo:method name="goodbye" async="true" sent="true" />
```

If you only want to be asynchronous, then omit the result thoroughly, `return="false"` could be set to reduce the creation and management cost of Future:

```xml
<dubbo:method name="goodbye" async="true" return="false"/>
```

At this time，`RpcContext.getContext().getFuture()` will return `null`。

The complete sequence diagram of asynchronous invoke is as follow:

![Asynchronous invoke](/imgs/blog/dubbo-async.svg)

The sample locates at：https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-async

### Parameters callback

The parameter Callback is somewhat similar to the local Callback mechanism, but Callback is not an inner class or interface of Dubbo. Instead, it is defined by the Provider. Dubbo will generate a reverse proxy based on the long connection, so as to implement the logic of calling the Consumer from the Provider.

##### Service and Callback definition of Provider

```java
public interface CallbackService {
    void addListener(String key, CallbackListener listener);
}

public interface CallbackListener {
    void changed(String msg);
}
```

##### Service implementation of Provider

```java
public class CallbackServiceImpl implements CallbackService {

    private final Map<String, CallbackListener> listeners = new ConcurrentHashMap<String, CallbackListener>();

    public CallbackServiceImpl() {
        Thread t = new Thread(new Runnable() {
            public void run() {
                while (true) {
                    try {
                        for (Map.Entry<String, CallbackListener> entry : listeners.entrySet()) {
                            try {
                                entry.getValue().changed(getChanged(entry.getKey()));
                            } catch (Throwable t) {
                                listeners.remove(entry.getKey());
                            }
                        }
                        Thread.sleep(5000); // timely trigger change event
                    } catch (Throwable t) {
                        t.printStackTrace();
                    }
                }
            }
        });
        t.setDaemon(true);
        t.start();
    }

    public void addListener(String key, CallbackListener listener) {
        listeners.put(key, listener);
        listener.changed(getChanged(key)); // send notification for change
    }

    private String getChanged(String key) {
        return "Changed: " + new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());
    }
}
```

##### Service exposure of Provider

```xml
<bean id="callbackService" class="com.alibaba.dubbo.samples.callback.impl.CallbackServiceImpl"/>

<dubbo:service interface="com.alibaba.dubbo.samples.callback.api.CallbackService" ref="callbackService" connections="1" callbacks="1000">
    <dubbo:method name="addListener">
        <dubbo:argument index="1" callback="true"/>
        <!--<dubbo:argument type="com.demo.CallbackListener" callback="true" />-->
    </dubbo:method>
</dubbo:service>
```

Here，Provider needs to declare which parameter is the Callback parameter in the method.

##### Callback interface implementation of Consumer

```java
CallbackService callbackService = ...;
callbackService.addListener("foo.bar", new CallbackListener() {
        public void changed(String msg) {
            System.out.println("callback1:" + msg);
        }
});
```

The implementation class of the Callback interface is on the Consumer, which automatically exports a Callback service when the method is called. Thus during Provider processing the call, if the parameter is determined as Callback, it will generate a proxy. Therefore, when the service implementation class calling the Callback method, it will be passed to the Consumer to execute the code.

The sample code above is located at：https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-callback

This invocation mode is somewhat like message publishing and subscribing, but there is a little difference. For example, when the Consumer completes the export of Callback service, if it restarts later, then the Provider will fail to adjust. Meanwhile it is also a problem for the Provider to clean up the proxy.

### Event notification

Event notification allows the Consumer triggering three events，particularly `oninvoke`, `onreturn`, `onthrow` before calling, after calling or occurring exceptions.

You can specify which events need to be notified during configuring Consumer, such as:

```xml
<bean id="demoCallback" class="com.alibaba.dubbo.samples.notify.impl.NotifyImpl" />

<dubbo:reference id="demoService" check="false" interface="com.alibaba.dubbo.samples.notify.api.DemoService" version="1.0.0" group="cn">
    <dubbo:method name="sayHello" onreturn="demoCallback.onreturn" onthrow="demoCallback.onthrow"/>
</dubbo:reference>
```

Among them，the code of NotifyImpl is as follow：

```java
public class NotifyImpl implements Notify{

    public Map<Integer, String> ret = new HashMap<Integer, String>();

    public void onreturn(String name, int id) {
        ret.put(id, name);
        System.out.println("onreturn: " + name);
    }

    public void onthrow(Throwable ex, String name, int id) {
        System.out.println("onthrow: " + name);
    }
}
```

Here we address that the parameter rules of three methods in the custom Notify interface are as follows:

* `oninvoke` method's parameters are the same as the calling method parameters;
* `onreturn` method's first parameter is the returned value of calling method，and the others are the same as the calling method;
* `onthrow` method's first parameter is an invoked exception，and the others are the same as the calling method.

In the above configuration, `sayHello` method is an asynchronous invocation, so the execution of event notification method is also synchronous. You can configure the `async = true` to make method invocation asynchronous, at this moment, event notification method is executed asynchronously. Especially emphasize that `oninvoke` method is executed synchronously, whether is an asynchronous call or not.

Please refer to the sample code for event notification：https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-notify