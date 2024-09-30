---
title: "Background and Practice of Dubbo Client Asynchronous Interface Implementation"
linkTitle: "Background and Practice of Dubbo Client Asynchronous Interface Implementation"
tags: ["Java"]
date: 2019-11-01
description: > 
    This article introduces the background and practice of the Dubbo client asynchronous interface 
---

## Foundation


![image | left](/imgs/blog/dubboasyn_client/1.png)


First, let's briefly introduce the thread stages that a complete Dubbo call goes through. Here are a few points:
1. Biz~ represents the business thread, where the business logic processing occurs; the Biz~ thread pool may be created and maintained by the business itself, but most likely is managed by the system framework (for example, in a web-based business system running in a Tomcat container, the Biz~ thread is maintained by Tomcat); IO~ represents the network data processing thread, created and maintained by the IO framework (such as Netty, Grizzly). The default Netty implementation for Dubbo Remoting is NioEventloopLoopGroup; also, based on the binding relationship between Channel and IO threads, IO~ can be seen as a Channel that can accept event messages. Asynchronous processing stages like Biz and IO are precisely abstracted in JDK8 as CompletionStage.

2. As we know, data communication between threads is done using shared variables. The data communication between Biz and IO stages is through a Queue; specifically, in the Dubbo implementation on the client side (indicated as step 1 in the above diagram), Biz places a Task into the LinkedBlockingQueue of the EventLoop, while the EventLoop has a corresponding Thread that continuously iterates through the Queue to execute the information contained in the Task. The exact code can be seen in SingleThreadEventExecutor (by the way, Netty uses an unbounded LinkedBlockingQueue by default, which could lead to Memory Leak risks when the Biz rate exceeds the network rate).

3. As shown in the diagram, a standard RPC call has undergone four message (event) transmissions shown in steps 1, 2, 3, and 4: from the client business thread to the IO thread to send the request, from the server IO thread to the business logic thread to __accept the request__, then from the business logic thread back to the IO thread to write the response after processing is completed, and finally the client processes the response from the IO thread back to the business logic. Apart from needing to maintain the mapping relationship between the response and request between steps 1 and 4, the four event processes are completely independent, which means that an RPC call is inherently asynchronous, with synchronization being derived from the asynchronous nature.

## Client Asynchronous

### Implementation Background
In Java (I’m not sure about other languages), a local interface call can be transparently converted to a remote RPC call through a proxy mechanism. Most business parties prefer this programming method that is similar to local interfaces for remote service integration. Therefore, although RPC is intrinsically asynchronous, users of Dubbo predominantly use it synchronously, while asynchronous usage has become a niche scenario. The advantage of synchronous calls is that the programming model aligns more with the "traditional" habits of business parties, at the cost of blocking the current Biz~ thread after the request is sent (step 1) until the response is processed (step 4). In the process from steps 1, 2, 3, to 4, which may range from microseconds to seconds, blocking the Biz~ thread consumes thread resources and increases system resource overhead.

Thus, the point of client asynchronous is to save thread resource costs, with the trade-off being the need to understand the usage of asynchronous:) In synchronous mode, the return type of the API interface represents a certain business class. In an asynchronous scenario, since the response return and request sending are two completely independent events, the return type of the API interface should be changed to CompletionStage, as mentioned above, which is an inevitable asynchronous support in Dubbo. Referring back to the recent Dubbo release, without changing the interface, a callback interface needs to be registered to handle the response return event during service creation.

Here is an example.

### Example

For event notification example code, please refer to: [https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-notify](https://github.com/dubbo/dubbo-samples/tree/master/2-advanced/dubbo-samples-notify)

Event notification allows the consumer side to trigger three events: `oninvoke`, `onreturn`, and `onthrow` before calling, after a normal return, or when an exception occurs.

You can specify the methods to be notified by setting up the consumer configuration like this:

```xml
<bean id="demoCallback" class="com.alibaba.dubbo.samples.notify.impl.NotifyImpl" />

<dubbo:reference id="demoService" check="false" interface="com.alibaba.dubbo.samples.notify.api.DemoService" version="1.0.0" group="cn">
    <dubbo:method name="sayHello" onreturn="demoCallback.onreturn" onthrow="demoCallback.onthrow"/>
</dubbo:reference>
```

In which, the code for NotifyImpl is as follows:

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

It is important to emphasize that the parameter rules of the three methods in the custom Notify interface are as follows:

* The `oninvoke` method parameter matches that of the called method;
* The first parameter of the `onreturn` method is the return value of the called method, followed by the parameters of the called method;
* The first parameter of the `onthrow` method is the calling exception, followed by the parameters of the called method.

In the above configuration, the `sayHello` method is a synchronous call, so the execution of the event notification methods is also synchronous. You can configure `async=true` to make the method call asynchronous, in which case the event notification methods are also executed asynchronously. It should be emphasized that the `oninvoke` method is synchronously executed regardless of whether the call is asynchronous.

### Practical Suggestions

* <div data-type="alignment" data-value="justify" style="text-align:justify">
  <div data-type="p">The logic after the RPC call is not strongly dependent on the results: asynchronous callback applies when the client <strong>is not strongly dependent on the result from the server</strong>.</div>
  </div>

* <div data-type="alignment" data-value="justify" style="text-align:justify">
  <div data-type="p">Rx scenarios: Since understanding the reactive programming model, I believe that as long as the programming mindset embraces reactive, and the state machine design of the business model can be appropriately adjusted, using asynchronous solutions is applicable in any scenario, thus achieving better terminal response experience. For Dubbo, the current asynchronous interface model needs improvement like the reactive model interface, enabling users to more naturally use asynchronous interfaces.</div>
  </div>


### Summary

* The point of client asynchronous is that the request sending and response handling are two different independent events; how the response is handled and in which thread it is processed does not need to be coupled or bound with the business logic thread of the request sending event.
* The logical handling of response event callbacks can be selected based on the situation. It is recommended, if the callback logic is simple, to directly handle it in the IO thread; if it includes remote access or DB access and other IO type __synchronous__ operations, it is recommended to handle it in an independent thread pool.

