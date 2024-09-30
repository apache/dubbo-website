---
title: "Dubbo's Various Ways of Synchronous/Asynchronous Calls"
linkTitle: "Dubbo's Various Ways of Synchronous/Asynchronous Calls"
tags: ["Java"]
date: 2018-08-14
description: >
    This article introduces several synchronous and asynchronous calling methods implemented by Dubbo based on an asynchronous communication mechanism.
---


We know that Dubbo's default protocol uses a single long connection, with the underlying implementation using Netty's NIO asynchronous communication mechanism. Based on this mechanism, Dubbo implements the following calling methods:

* Synchronous calls
* Asynchronous calls
* Parameter callbacks
* Event notifications

## Synchronous Calls

Synchronous calls are a blocking calling method, meaning the Consumer side code blocks and waits until the Provider side returns;

Typically, a synchronous calling process is as follows:

1. The Consumer business thread calls the remote interface, sending a request to the Provider, while the current thread is in a `blocking` state;
2. After receiving the request from the Consumer, the Provider begins processing the request and returns the result to the Consumer;
3. Once the Consumer receives the result, the current thread continues execution.

There are 2 questions here:

1. How does the Consumer business thread enter the `blocking` state?
2. Once the Consumer receives the result, how is the business thread awakened to continue execution?

In fact, the underlying IO operations of Dubbo are all asynchronous. After the Consumer initiates a call, it obtains a Future object. For synchronous calls, the business thread blocks and waits for the Provider to return the result via `Future#get(timeout)`; the `timeout` is the timeout period defined by the Consumer. When the result returns, it is set in this Future and wakes up the blocking business thread; if the timeout period elapses without a result, the business thread will return an error.

## Asynchronous Calls

Based on Dubbo's underlying asynchronous NIO implementation, asynchronous calls are essential for scenarios with longer Provider response times, effectively utilizing resources on the Consumer side, with relatively low overhead compared to using multi-threading on the Consumer side.

For asynchronous calls, the Provider does not need special configurations. In the example below, the Provider interface is defined as follows:

```java
public interface AsyncService {
    String goodbye(String name);
}
```

### Consumer Configuration

```xml
<dubbo:reference id="asyncService" interface="com.alibaba.dubbo.samples.async.api.AsyncService">
    <dubbo:method name="goodbye" async="true"/>
</dubbo:reference>
```

Methods that require asynchronous calls need to be described using the `<dubbo:method/>` tag.

### Consumer Side Initiating Call

```java
AsyncService service = ...;
String result = service.goodbye("samples"); // The return value here is null, please do not use it
Future<String> future = RpcContext.getContext().getFuture();
... // The business thread can start doing other things
result = future.get(); // Block when needing to obtain the asynchronous result, can also use get(timeout, unit) to set a timeout
```

After the Dubbo Consumer initiates a call, it simultaneously obtains the associated `Future` object through `RpcContext.getContext().getFuture()`, allowing it to start handling other tasks; when the result of this asynchronous call is needed, it can be obtained at any time with `future.get(timeout)`.

In some special scenarios, to expedite call returns, you can set whether to wait for the message to be sent:

* `sent="true"` waits for the message to be sent, an error will be thrown if sending fails;
* `sent="false"` does not wait for the message to be sent, placing the message in the IO queue and returning immediately.

The default is `false`. The configuration is as follows:

```xml
<dubbo:method name="goodbye" async="true" sent="true"/>
```

If you simply want to call asynchronously while completely ignoring the return value, you can configure `return="false"` to reduce the cost of creating and managing Future objects:

```xml
<dubbo:method name="goodbye" async="true" return="false"/>
```

At this point, `RpcContext.getContext().getFuture()` will return `null`.

The entire asynchronous call sequence diagram is as follows:

![Asynchronous Call](/imgs/blog/dubbo-async.svg)

This example code is located at: https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-async

## Parameter Callbacks

Parameter callbacks are somewhat similar to the local callback mechanism, but the callbacks are not classes or interfaces internal to Dubbo; they are defined by the Provider side. Dubbo will generate a reverse proxy based on a long connection to call the Consumer side from the Provider side.

### Provider Side Defining Service and Callback

```java
public interface CallbackService {
    void addListener(String key, CallbackListener listener);
}

public interface CallbackListener {
    void changed(String msg);
}
```

#### Provider Side Service Implementation

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

#### Provider Side Exposing Service

```xml
<bean id="callbackService" class="com.alibaba.dubbo.samples.callback.impl.CallbackServiceImpl"/>

<dubbo:service interface="com.alibaba.dubbo.samples.callback.api.CallbackService" ref="callbackService" connections="1" callbacks="1000">
    <dubbo:method name="addListener">
        <dubbo:argument index="1" callback="true"/>
        <!--<dubbo:argument type="com.demo.CallbackListener" callback="true" />-->
    </dubbo:method>
</dubbo:service>
```

Here, the Provider needs to declare which parameter is the Callback parameter in the method.

#### Consumer Side Implementing Callback Interface

```java
CallbackService callbackService = ...;
callbackService.addListener("foo.bar", new CallbackListener() {
        public void changed(String msg) {
            System.out.println("callback1:" + msg);
        }
});
```

The implementation class of the Callback interface is on the Consumer side, and when the method is called, the Consumer side automatically exports a Callback service. During the call processing on the Provider side, it determines if the parameter is a Callback; it will generate a proxy, thus when calling the Callback method in the service implementation class, code for the Callback implementation will be executed on the Consumer side.

The example code above can be found at: https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-callback

This calling method is somewhat like the publish and subscribe mechanism, but with differences. For example, when the Consumer side finishes exporting the Callback service, if restarted afterward, the Provider will not be able to connect; additionally, how the Provider side cleans up this proxy is also a concern.

## Event Notifications

Event notifications allow the Consumer side to trigger three events: `oninvoke`, `onreturn`, and `onthrow` before, after the call, or in case of an exception.

This can be done by specifying the methods to notify the events when configuring the Consumer, such as:

```xml
<bean id="demoCallback" class="com.alibaba.dubbo.samples.notify.impl.NotifyImpl" />

<dubbo:reference id="demoService" check="false" interface="com.alibaba.dubbo.samples.notify.api.DemoService" version="1.0.0" group="cn">
    <dubbo:method name="sayHello" onreturn="demoCallback.onreturn" onthrow="demoCallback.onthrow"/>
</dubbo:reference>
```

Here, the code for NotifyImpl is as follows:

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

It is important to emphasize that the parameter rules for the three methods in the custom Notify interface are as follows:

* The `oninvoke` method parameters are the same as the calling method's parameters;
* The first parameter of the `onreturn` method is the return value of the calling method, and the rest are the parameters of the calling method;
* The first parameter of the `onthrow` method is the thrown exception, and the rest are the parameters of the calling method.

In the configuration above, since the `sayHello` method is a synchronous call, the execution of the event notification methods is also synchronous. You can configure `async=true` to make the method call asynchronous, in which case the event notification methods will also be executed asynchronously. It is particularly emphasized that the `oninvoke` method is executed synchronously regardless of whether the call is asynchronous.

Example code for event notifications can be referenced at: https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-notify
