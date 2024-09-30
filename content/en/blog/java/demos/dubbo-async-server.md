---
title: "Background and Practice of Asynchronous Interfaces on Dubbo Server"
linkTitle: "Background and Practice of Asynchronous Interfaces on Dubbo Server"
tags: ["Java"]
date: 2019-11-02
description: > 
    This article introduces the background and practice of asynchronous interfaces on the Dubbo server.
---

## Introduction
It is recommended to first understand the thread stages involved in Dubbo's processing. For details, refer to [Background and Use Cases of Asynchronous Interfaces on Dubbo Client](/en/blog/2019/11/01/dubbo客户端异步接口的实现背景和实践/) .

## Implementation Background
It is necessary to provide a detailed introduction to the server's thread strategy to deepen the user's judgment on choosing server-side asynchrony, and to introduce coroutines, which are often used as a "secret weapon" in server-side asynchrony.

### Server's Thread Strategy
Dubbo supports multiple NIO frameworks for the implementation of the remoting protocol, be it Netty, Mina, or Grizzly, the implementations are quite similar, all based on an event-driven approach to establish network channels and read data streams. Taking Grizzly's introduction to [Thread Strategies](https://javaee.github.io/grizzly/iostrategies.html) as an example, it typically supports the following four types. Dubbo, as an RPC framework, defaults to the first strategy, as it is uncertain whether business services are CPU-bound or I/O-blocked; the first strategy is considered to be the safest. However, it is ideal to choose the most appropriate strategy based on business scenarios after understanding these strategies.

1. __Worker-thread Strategy__

This is the most commonly used and universal strategy, where IO threads delegate NIO event processing to worker threads.

![workerthread-strategy.png](/imgs/blog/dubboasyn_server/1.png)

This strategy has high scalability. We can adjust the size of the IO and worker thread pools as needed, and there is no risk of interference among various channels on the same Selector during specific NIO event processing.

The downside is the cost of thread context switching.

2. __Same-thread Strategy__

This might be the most efficient strategy. Unlike the first one, it handles NIO events in the same thread, avoiding the costly thread context switching.

![samethread-strategy.png](/imgs/blog/dubboasyn_server/2.png)

This strategy allows for adjustments to the IO thread pool size and is also scalable; the drawback is it requires that there be no blocking operations in business processing, as it could prevent handling of other NIO events occurring on the same IO thread.

3. __Dynamic Strategy__

As mentioned earlier, the first two strategies have obvious advantages and disadvantages. But what if the strategies could cleverly swap at runtime based on current conditions (load, collected statistics, etc.)?

![dynamic-strategy.png](/imgs/blog/dubboasyn_server/3.png)

This strategy could bring many benefits and better control of resources, provided it doesn't overload the logic for assessing conditions, preventing the complexity of assessments from making this strategy inefficient.

I hope everyone pays more attention to this strategy; it might be the best fit for Dubbo's server-side asynchronous approach. As a side note, I've been paying attention to some adaptive XX or predictive XX lately; seeing dynamic here feels quite familiar. Dubbo, as a product-level, production-level microservice solution, must be adaptive, predictive, and dynamic, haha.

4. __Leader-follower Strategy__

![leaderfollower-strategy.png](/imgs/blog/dubboasyn_server/4.png)

This strategy is similar to the first but does not delegate NIO event processing to worker threads; instead, it passes control to the Selector for work threads, handling actual NIO events in the current IO thread. This strategy essentially confuses the worker and IO thread stages, which I personally do not recommend.

### Coroutine vs Thread
In the management of CPU resources, the minimum scheduling unit for both OS and JVM is threads. Business applications can utilize coroutine packages implemented through extensions, which can have independent running units, and are indeed based on threads. The core idea is to save context when there is I/O blocking or lock waiting, and then switch to another coroutine. As for the claims of low overhead for coroutines and more efficient CPU usage, these are supported by the user-space implementation and context design of the coroutine library, but I also recommend performing performance testing based on actual business scenarios.

__In the default Dubbo thread strategy, there is a worker thread pool to execute business logic, but the ThreadPool Full issue often occurs. To quickly free up worker threads, another thread is often created in the business service implementation. The cost is an additional increase in thread context switching, while also needing to consider link-level data transmission (like tracing information) and flow control outlet management, etc. Of course, if Dubbo can switch to the Same-thread strategy, along with support from the coroutine library, server-side asynchrony is a recommended approach.__

## Example
Experience the Dubbo server asynchronous interface through an example. Demo code can be found on GitHub at [https://github.com/dubbo/dubbo-samples/tree/master/2-advanced/dubbo-samples-notify](https://github.com/dubbo/dubbo-samples/tree/master/2-advanced/dubbo-samples-notify).
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
## Practical Advice
* Do not blindly trust server-side asynchrony.
* Server-side asynchrony is essentially a pseudo-concept in front of Event-Driven or Reactive. <span data-type="color" style="color:rgb(36, 41, 46)"><span data-type="background" style="background-color:rgb(255, 255, 255)">To elaborate: The original intention of server-side asynchrony is that the number of business threads on the Dubbo server (default is 200) is insufficient, but in fact, under an event-driven model, 200 is definitely not needed—just the number of CPU cores would suffice. As long as the business implementation is non-blocking pure asynchronous business logic processing, using too many threads is wasteful.</span></span>
* If using server-side asynchrony, it is recommended to adopt the same thread mode + coroutine package for the server's thread strategy.

## Conclusion
When supporting business applications, Dubbo encounters various bizarre requirements. Server-side asynchrony provides a solution to the ThreadPool Full problem for users. When a ThreadPool Full situation occurs, if the current system bottleneck is CPU, this solution is not recommended; if the system load is low, increasing the number of worker threads or adopting server-side asynchrony are both options worth considering.

