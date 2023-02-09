---
title: "Dubbo服务端异步接口的实现背景和实践"
linkTitle: "Dubbo服务端异步接口的实现背景和实践"
tags: ["Java"]
date: 2019-11-02
description: > 
    本文介绍了 Dubbo 服务端异步接口的实现背景和实践
---

## 铺垫
建议先对Dubbo的处理过程中涉及的线程阶段先做个了解，具体可参考[Dubbo客户端异步接口的实现背景和使用场景](/zh-cn/blog/2019/11/01/dubbo客户端异步接口的实现背景和实践/)。

## 实现背景
有必要比较详细点的介绍下服务端的线程策略来加深用户在选择服务端异步的判断依据，同时有必要引出协程这一在服务端异步中常常会用到的“秘密武器”。

### 服务端的线程策略
Dubbo支持多种NIO框架来做Remoting的协议实现，无论是Netty，Mina或者Grizzly，实现都大同小异，都是基于事件驱动的方式来做网络通道建立，数据流读取的。其中以Grizzly对于[线程策略](https://javaee.github.io/grizzly/iostrategies.html)的介绍为例，通常支持以下四种。Dubbo作为一个RPC框架，默认选择的是第一种策略，原因在于业务服务是CPU密集型还是IO阻塞型，是无法断定的，第一种策略是最保险的策略。当然，对于这几种策略有了了解后，再结合业务场景做针对性的选择是最完美的。
1. __Worker-thread策略__

最常用最普适的策略，其中IO线程将NIO事件处理委托给工作线程。


![workerthread-strategy.png](/imgs/blog/dubboasyn_server/1.png)


此策略具有很高的伸缩性。我们可以根据需要更改IO和worker线程池的大小，并且不存在在特定NIO事件处理期间可能发生的，同一Selector各个Channel之间相互干扰的风险。

缺点是有线程上下文切换的代价。

2. __Same-thread策略__

可能是最有效的策略。与第一种不同，同一线程处理当前线程中的NIO事件，避免了昂贵的线程上下文切换。


![samethread-strategy.png](/imgs/blog/dubboasyn_server/2.png)


这个策略可以调整IO线程池大小，也是具备可伸缩性；缺点也很明显，它要求业务处理中一定不要有阻塞处理，因为它可能会阻止在同一个IO线程上发生的其他NIO事件的处理。

3. __Dynamic策略__

如前所述，前两种策略具有明显的优点和缺点。但是，如果策略可以尝试在运行时根据当前条件（负载，收集的统计信息等）巧妙地交换它们，何如？


![dynamic-strategy.png](/imgs/blog/dubboasyn_server/3.png)


这种策略可能会带来很多好处，能更好地控制资源，前提是不要使条件评估逻辑过载，防止评估判断的复杂性会使这种策略效率低下。
多说一句，希望大家对这个策略多留意一下，它可能是Dubbo服务端异步方式的最佳搭配。我也多扯个淡，这几天关注了些adaptive XX或者predictive XX，这里看到dynamic真是亲切，Dubbo作为产品级生产级的微服务解决方案，是必须既要adaptive，又要predictive，还要dynamic，哈哈。

4. __Leader-follower策略__



![leaderfollower-strategy.png](/imgs/blog/dubboasyn_server/4.png)

此策略类似于第一种，但它不是将NIO事件处理传递给worker线程，而是通过将控制传递给Selector给工作线程，并将实际NIO事件处理当前IO线程中。这种策略其实是把worker和IO线程阶段做了混淆，个人不建议。
### 协程与线程
在CPU资源的管理上，OS和JVM的最小调度单位都是线程，业务应用通过扩展实现的协程包是可以具备独立的运行单位，事实上也是基于线程来做的，核心应该是遇到IO阻塞，或者锁等待时，保存上下文，然后切换到另一个协程。至于说的协程开销低，能更高效的使用CPU，这些考虑到协程库的用户态实现和上下文设计是支持的，但也建议大家结合实际业务场景做性能测试。

__在默认的Dubbo线程策略中，是有worker线程池来执行业务逻辑，但也常常会发生ThreadPool Full的问题，为了尽快释放worker线程，在业务服务的实现中会另起线程。代价是再次增加线程上下文切换，同时需要考虑链路级别的数据传送(比如tracing信息)和流控的出口控制等等。当然，如果Dubbo能够切换到Same-thread策略，再配合协程库的支持，服务端异步是一种值得推荐的使用方式。__

## 示例
通过示例来体验下Dubbo服务端异步接口。Demo代码请访问github之[https://github.com/dubbo/dubbo-samples/tree/master/2-advanced/dubbo-samples-notify](https://github.com/dubbo/dubbo-samples/tree/master/2-advanced/dubbo-samples-notify)。
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
## 实践建议
* 不要迷信服务端异步。
* 服务端异步在Event-Driven或者Reactive面前基本是伪命题.<span data-type="color" style="color:rgb(36, 41, 46)"><span data-type="background" style="background-color:rgb(255, 255, 255)">补充下原因：服务端异步初衷是说Dubbo的服务端业务线程数（默认是200个）不够，但其实在event-driven模式下，200个肯定不需要那么多，只需要cpu核数那样就可以。只要业务实现是非阻塞的纯异步方式的业务逻辑处理，用再多的线程数都是浪费资源。</span></span>
* 要用服务端异步，建议服务端的线程策略采用same thread模式+协程包。

## 小结
Dubbo在支持业务应用时，会碰到千奇百怪的需求场景，服务端异步为用户提供了一种解决ThreadPool Full的方案。当发生ThreadPool Full的情况下，如果当前系统瓶颈是CPU，不建议用这种方案；如果系统Load不高，调高worker的线程数目，或者采用服务端异步，都是可以考虑的。
