---
title: "Implementation background and practice of Dubbo client asynchronous interface"
linkTitle: "Dubbo Async Client"
date: 2019-02-20
description: >
    Implementation background and practice of Dubbo client asynchronous interface
---

## Preface

![image | left](/imgs/blog/dubboasyn_client/1_en.png)

Let's start with a brief introduction about the stages of a complete Dubbo invocation.  
1. Biz~ represents business thread, that is, the thread where the business logic is located. Biz~ thread pool may be created and maintained by business itself, most of which may be managed by system framework itself (for example, a web system runs under Tomcat container, Biz~ thread is maintained by Tomcat); IO~ stands for network data processing thread, which is created and maintained by IO framework (such as Netty, Grizzly). Dubbo Remoting's default Netty implementation is NioEventloopLoopGroup. In addition, according to the binding relationship between Channel and IO thread, IO~ can also be regarded as an acceptable Channel for event messages. Asynchronous processing stages such as Biz and IO are abstractly described in JDK8 as completionstages.  

2. As we all know, the way of data communication between threads is shared variables. The data communication between Biz and IO is Queue. Specifically to Dubbo, Biz put a task in EventLoop's LinkedBlockingQueue in the client side implementation (i.e. the steps labeled in Figure 1 above), and the corresponding Thread in the EventLoop will keep iteration the Queue to keep on executing the information the task contains. Specific code can refer to SingleThreadEventExecutor (by the way, the default is to use in the Netty is capacity-free LinkedBlockingQueue, when the Biz processing rate higher than the rate of network, there seems to be a Memory Leak risk).    

3. As shown in the figure above, a standard RPC call passes through four message (event) transfers of 1,2,3,4, respectively are the client business thread sending requests to the client IO thread, the server business logic thread receiving the server IO thread requests, the server logic thread responding to the server IO thread after processing, and the client IO thread receiving the results feedback to the business logic thread.  

## Client Asynchronization

### Background
In the Java language (other languages are not clear), a call of the local interface can be transparently converted into the call of remote RPC through the proxy mechanism. Most business parties prefer this programming method similar to the local interface to do remote service invocation. Therefore, although RPC is naturally asynchronous internally, users using Dubbo mostly use synchronization, while asynchrony becomes a minority use scenario. The advantage of synchronization is that the programming model is more in line with the "traditional" habits of the business side. The cost is that the current Biz~threads need to be blocked after the request event represented by 1 in the figure, and can not be awakened until the response processing represented by 4. In the process of 1,2,3,4, which is short in microsecond level and long in second level, the Biz~ thread will be blocked, which will consume thread resources and increase the overhead of system resources.

Therefore, the motivation of client asynchronization is to save thread resource overhead at the cost of understanding how asynchronization is used. In the synchronous mode, the return type of API interface represents a certain business class, while in the asynchronous case, the response and the request are completely independent events, so it is most suitable for the return type of API interface to be CompletionStage mentioned above, which is the inevitable asynchronization supported by Dubbo on asynchronization. Back to the latest Dubbo release, without changing the interface, you need to register a callback interface to handle the response return event when the service is created.    

The example blow is to illustrate it.

### The sample

Refer to the example code for event notification: [https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-notify](https://github.com/dubbo/dubbo-samples/tree/master/2-advanced/dubbo-samples-notify)

Event notification allows the Consumer to trigger 'oninvoke', 'onreturn' and 'onthrow' events, which respectively represent before the call, after the call returns normally, or when an exception occurs.

You can specify a method for notifying events when configuring the Consumer, such as:  

```xml
<bean id="demoCallback" class="com.alibaba.dubbo.samples.notify.impl.NotifyImpl" />

<dubbo:reference id="demoService" check="false" interface="com.alibaba.dubbo.samples.notify.api.DemoService" version="1.0.0" group="cn">
    <dubbo:method name="sayHello" onreturn="demoCallback.onreturn" onthrow="demoCallback.onthrow"/>
</dubbo:reference>
```

The code for NotifyImpl is as follows:  

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

It is important to note that the parameters for the three methods in the custom Notify interface are as follows:  

* `oninvoke` The parameters of the method are the same as those of the calling method.  
* `onreturn` The first parameter of the method is the return value of the calling method, and the rest is the parameters of the calling method.  
* `onthrow` The first parameter to the method is the call exception, and the rest is the parameter to the calling method.    

In the above configuration, the `sayHello` method is called synchronously, so the execution of the event notification method is also synchronously executed. `async=true` can be configured to make the method call asynchronous, and the notification event method is also executed asynchronously. In particular, the `oninvoke` method executes synchronously, regardless of whether it is invoked asynchronously or not.

### Practical advice

* <div data-type="alignment" data-value="justify" style="text-align:justify">
  <div data-type="p">Logical Non-Strongly dependent results after RPC invocation: Asynchronous callbacks are suitable for client-side asynchronous invocation when the client <strong>is not strongly dependent on the server response</strong>.</div>
  </div>

* <div data-type="alignment" data-value="justify" style="text-align:justify">
  <div data-type="p">RX scenario: after learning about reactive programming model, I believe that as long as the programming thinking can embrace reactive and the state machine design of business model can be adjusted appropriately, asynchronous solutions can be applied in all scenarios, so as to achieve better terminal response experience. For Dubbo, the current asynchronous interface model needs to be improved like the reactive model interface in order to make the user more naturally apply the asynchronous interface. </div>
  </div>


### Conclusions

* The motivation of client asynchronization is that the request sending and response processing are two different independent events, how the response is handled and in which thread is handled are not required to be coupled with the business logic thread of the request sending event.
* The processing logic of response event callbacks in which thread to process is to be selected according to the situation. It is recommended that if the callback logic is relatively simple, it should be directly in the IO thread; if it contains IO type synchronization operations such as remote access or DB access, it is recommended that it be processed in a separate thread pool.
