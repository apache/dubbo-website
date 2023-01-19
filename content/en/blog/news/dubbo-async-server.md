---
title: "Implementation background and practice of Dubbo server asynchronous interface"
linkTitle: "Dubbo Async Server"
date: 2019-02-20
description: >
    Implementation background and practice of Dubbo server asynchronous interface
---

## Preface
It is suggested to make an understanding of the thread phase involved in the process of Dubbo first, please refer to [Implementation background and practice of Dubbo client asynchronous interface](/en/blog/2019/02/20/implementation-background-and-practice-of-dubbo-client-asynchronous-interface/) for details.

## Implementation background
It is necessary to introduce the server-side thread strategy in more detail to deepen the user's judgment basis for selecting server-side asynchrony. It is also necessary to introduce coroutines, the "secret weapon" often used in server-side asynchrony.

### Server-side thread strategy
Dubbo supports a variety of NIO frameworks to implement remoting protocols. Whether Netty, Mina or Grizzly, the implementations are much the same. They are all based on event-driven methods to establish network channels and read data streams. Taking introduction to [Thread Strategy](https://javaee.github.io/grizzly/iostrategies.html) of Grizzly as an example, the following four categories are usually supported. Dubbo as an RPC framework, the default choice is the first strategy. Because it is impossible to determine whether the business services are CPU-intensive or IO blocking type. the first strategy is the most insurance strategy. Of course, after understanding these strategies, it is the most perfect choice to make targeted choices based on business scenarios.
1. __Worker-thread Strategy__

The most useful IOStrategy, where Selector thread delegates NIO events processing to a worker threads.



![workerthread-strategy.png](/imgs/blog/dubboasyn_server/1.png)


This IOStrategy is very scalable and safe. We can change the size of selector and worker thread pool as required and there is no risk that some problem, which may occur during the specific NIO event processing, will impact other Channels registered on the same Selector.

The disadvantage is the cost of thread context switching.

2. __Same-thread Strategy__

Potentially the most efficient IOStrategy. Unlike the worker-thread IOStrategy, the same-thread IOStrategy processes NIO events in the current thread, avoiding expensive thread context switches.


![samethread-strategy.png](/imgs/blog/dubboasyn_server/2.png)


This IOStrategy is still pretty scalable, because we can tune the selector thread pool size, but it does have drawbacks. Care needs to be taken that channel NIO event processing won’t block or execute any long lasting operation, because it may block the processing of other NIO events that occur on the same Selector.

3. __Dynamic Strategy__

As mentioned previously worker-thread and same-thread strategies have distinct advantages and disadvantages. However, what if a strategy could try to swap them smartly during runtime depending on the current conditions (load, gathered statistics… etc)?


![dynamic-strategy.png](/imgs/blog/dubboasyn_server/3.png)


Potentially this IOStrategy could bring a lot of benefit and allow finer control of the resources. However, it’s important to not overload the condition evaluation logic, as its complexity will make this IOStrategy inefficient comparing to previous two strategies.

By the way, I want you to pay more attention to this strategy, which is probably the best combination of Dubbo server asynchrony.

4. __Leader-follower Strategy__


![leaderfollower-strategy.png](/imgs/blog/dubboasyn_server/4.png)

This IOStrategy is similar to worker-thread IOStrategy, but instead of passing NIO event processing to a worker thread, it changes worker thread to a selector thread by passing it the control over Selector and the actual NIO event processing takes place in the current thread. This strategy actually confuses worker and IO thread stages, which is not recommended.

### Coroutine and thread
In terms of CPU resource management, the minimum scheduling unit of OS and JVM is thread. The coroutine library implemented by business application through extension can have independent running unit. In fact, it is also done based on thread. The principle should be to save the context and switch to another coroutine when IO blocking or lock waiting is encountered.

__In the default Dubbo thread strategy, there are worker thread pools to execute the business logic, but the ThreadPool Full problem often occurs. In order to release worker threads as soon as possible, another thread will be set up in the implementation of the business service. The cost is thread context switching again, and it's necessary to consider link-level data transfer (such as tracing information) and flow-control export controls, etc. Of course, if Dubbo can switch to the Same-thread strategy, combined with the coroutine library support, server-side asynchrony is a recommended use.__

## The sample

Use an example to experience the Dubbo server-side asynchronous interface. For Demo code, visit [https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-notify](https://github.com/dubbo/dubbo-samples/tree/master/2-advanced/dubbo-samples-notify)。

```java
public class AsyncServiceImpl implements AsyncService {

    @Override
    public String sayHello(String name) {
        System.out.println("Main sayHello() method start.");
        final AsyncContext asyncContext = RpcContext.startAsync();
        new Thread(() -> {
            asyncContext.signalContextSwitch();
            System.out.println("Attachment from consumer: " + RpcContext.getContext().getAttachment("consumer-key1"));
            System.out.println("    -- Async start.");
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            asyncContext.write("Hello " + name + ", response from provider.");
            System.out.println("    -- Async end.");
        }).start();
        System.out.println("Main sayHello() method end.");
        return "hello, " + name;
    }

```
## Practical suggestions
* Don't rely too much on server-side asynchrony.
* Server-side asynchrony is basically a false proposition in the face of event-driven or Reactive.<span data-type="color" style="color:rgb(36, 41, 46)"><span data-type="background" style="background-color:rgb(255, 255, 255)">Supplement the reason: the server asynchrony is said Dubbo server-side business threads (default is 200) is not enough, but in the Event-Driven mode, 200 threads certainly do not need that much, just as much as the number of CPU cores. As long as the business implementation is non-blocking and pure asynchronous business logic processing, it is a waste of resources to use as many threads as possible.</span></span>
* To use server-side asynchrony, it is recommended that the server-side thread strategy adopt the Same_thread pattern + Coroutine Library.

## Conclusions
When Dubbo supports business applications, it encounters a variety of requirements scenarios, and server-side asynchrony provides users with a solution to deal with ThreadPool Full. In the case of ThreadPool Full, if the current system bottleneck is CPU, this solution is not recommended. If the system load is not high, increasing the number of worker threads or using server asynchrony can be considered.
