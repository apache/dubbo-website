---
title: "Dubbo 现有心跳方案总结以及改进建议"
linkTitle: "Dubbo 现有心跳方案总结以及改进建议"
tags: ["Java"]
date: 2018-08-19
description: > 
    本文介绍了一种心跳，两种设计
---

### 1 前言

设计一个好的心跳机制并不是一件容易的事，就我所熟知的几个 RPC 框架，它们的心跳机制可以说大相径庭，这篇文章我将探讨一下**如何设计一个优雅的心跳机制，主要从 Dubbo 的现有方案以及一个改进方案来做分析**。

### 2 预备知识

因为后续我们将从源码层面来进行介绍，所以一些服务治理框架的细节还需要提前交代一下，方便大家理解。

#### 2.1 客户端如何得知请求失败了？

高性能的 RPC 框架几乎都会选择使用 Netty 来作为通信层的组件，非阻塞式通信的高效不需要我做过多的介绍。但也由于非阻塞的特性，导致其发送数据和接收数据是一个异步的过程，所以当存在服务端异常、网络问题时，客户端是接收不到响应的，那么我们如何判断一次 RPC 调用是失败的呢？

误区一：Dubbo 调用不是默认同步的吗？

Dubbo 在通信层是异步的，呈现给使用者同步的错觉是因为内部做了阻塞等待，实现了异步转同步。

误区二： `Channel.writeAndFlush` 会返回一个 `channelFuture`，我只需要判断 `channelFuture.isSuccess` 就可以判断请求是否成功了。

注意，writeAndFlush 成功并不代表对端接受到了请求，返回值为 true 只能保证写入网络缓冲区成功，并不代表发送成功。

避开上述两个误区，我们再来回到本小节的标题：客户端如何得知请求失败？**正确的逻辑应当是以客户端接收到失败响应为判断依据**。等等，前面不还在说在失败的场景中，服务端是不会返回响应的吗？没错，既然服务端不会返回，那就只能客户端自己造了。

一个常见的设计是：客户端发起一个 RPC 请求，会设置一个超时时间 `client_timeout`，发起调用的同时，客户端会开启一个延迟 `client_timeout` 的定时器

- 接收到正常响应时，移除该定时器。
- 定时器倒计时完毕，还没有被移除，则认为请求超时，构造一个失败的响应传递给客户端。

Dubbo 中的超时判定逻辑：

```java
public static DefaultFuture newFuture(Channel channel, Request request, int timeout) {
    final DefaultFuture future = new DefaultFuture(channel, request, timeout);
    // timeout check
    timeoutCheck(future);
    return future;
}
private static void timeoutCheck(DefaultFuture future) {
    TimeoutCheckTask task = new TimeoutCheckTask(future);
    TIME_OUT_TIMER.newTimeout(task, future.getTimeout(), TimeUnit.MILLISECONDS);
}
private static class TimeoutCheckTask implements TimerTask {
    private DefaultFuture future;
    TimeoutCheckTask(DefaultFuture future) {
        this.future = future;
    }
    @Override
    public void run(Timeout timeout) {
        if (future == null || future.isDone()) {
            return;
        }
        // create exception response.
        Response timeoutResponse = new Response(future.getId());
        // set timeout status.
        timeoutResponse.setStatus(future.isSent() ? Response.SERVER_TIMEOUT : Response.CLIENT_TIMEOUT);
        timeoutResponse.setErrorMessage(future.getTimeoutMessage(true));
        // handle response.
        DefaultFuture.received(future.getChannel(), timeoutResponse);
    }
}

```

主要逻辑涉及的类：`DubboInvoker`，`HeaderExchangeChannel`，`DefaultFuture` ，通过上述代码，我们可以得知一个细节，无论是何种调用，都会经过这个定时器的检测，**超时即调用失败，一次 RPC 调用的失败，必须以客户端收到失败响应为准**。

#### 2.2 心跳检测需要容错

网络通信永远要考虑到最坏的情况，一次心跳失败，不能认定为连接不通，多次心跳失败，才能采取相应的措施。

#### 2.3 心跳检测不需要忙检测

忙检测的对立面是空闲检测，我们做心跳的初衷，是为了保证连接的可用性，以保证及时采取断连，重连等措施。如果一条通道上有频繁的 RPC 调用正在进行，我们不应该为通道增加负担去发送心跳包。**心跳扮演的角色应当是晴天收伞，雨天送伞。**

### 3 Dubbo 现有方案

> 本文的源码对应 Dubbo  2.7.x 版本，在 apache 孵化的该版本中，心跳机制得到了增强。

介绍完了一些基础的概念，我们再来看看 Dubbo 是如何设计应用层心跳的。Dubbo 的心跳是双向心跳，客户端会给服务端发送心跳，反之，服务端也会向客户端发送心跳。

#### 3.1 连接建立时创建定时器

```java
public class HeaderExchangeClient implements ExchangeClient {
    private int heartbeat;
    private int heartbeatTimeout;
    private HashedWheelTimer heartbeatTimer;
    public HeaderExchangeClient(Client client, boolean needHeartbeat) {
        this.client = client;
        this.channel = new HeaderExchangeChannel(client);
        this.heartbeat = client.getUrl().getParameter(Constants.HEARTBEAT_KEY, dubbo != null && dubbo.startsWith("1.0.") ? Constants.DEFAULT_HEARTBEAT : 0);
        this.heartbeatTimeout = client.getUrl().getParameter(Constants.HEARTBEAT_TIMEOUT_KEY, heartbeat * 3);
        if (needHeartbeat) { <1>
            long tickDuration = calculateLeastDuration(heartbeat);
            heartbeatTimer = new HashedWheelTimer(new NamedThreadFactory("dubbo-client-heartbeat", true), tickDuration,
                    TimeUnit.MILLISECONDS, Constants.TICKS_PER_WHEEL); <2>
            startHeartbeatTimer();
        }
    }
 }
```

<1> **默认开启心跳检测的定时器**

<2> **创建了一个 `HashedWheelTimer ` 开启心跳检测**，这是 Netty 所提供的一个经典的时间轮定时器实现，至于它和 jdk 的实现有何不同，不了解的同学也可以关注下，我就不拓展了。

不仅 `HeaderExchangeClient` 客户端开起了定时器，`HeaderExchangeServer` 服务端同样开起了定时器，由于服务端的逻辑和客户端几乎一致，所以后续我并不会重复粘贴服务端的代码。

> Dubbo 在早期版本版本中使用的是 schedule 方案，在 2.7.x 中替换成了 HashedWheelTimer。

#### 3.2 开启两个定时任务

```java
private void startHeartbeatTimer() {
    long heartbeatTick = calculateLeastDuration(heartbeat);
    long heartbeatTimeoutTick = calculateLeastDuration(heartbeatTimeout);
    HeartbeatTimerTask heartBeatTimerTask = new HeartbeatTimerTask(cp, heartbeatTick, heartbeat); <1>
    ReconnectTimerTask reconnectTimerTask = new ReconnectTimerTask(cp, heartbeatTimeoutTick, heartbeatTimeout); <2>

    heartbeatTimer.newTimeout(heartBeatTimerTask, heartbeatTick, TimeUnit.MILLISECONDS);
    heartbeatTimer.newTimeout(reconnectTimerTask, heartbeatTimeoutTick, TimeUnit.MILLISECONDS);
}
```

Dubbo 在 `startHeartbeatTimer` 方法中主要开启了两个定时器： `HeartbeatTimerTask`，`ReconnectTimerTask` 

<1> `HeartbeatTimerTask` 主要用于定时发送心跳请求

<2> `ReconnectTimerTask`  主要用于心跳失败之后处理重连，断连的逻辑

至于方法中的其他代码，其实也是本文的重要分析内容，先容我卖个关子，后面再来看追溯。

#### 3.3 定时任务一：发送心跳请求

详细解析下心跳检测定时任务的逻辑 `HeartbeatTimerTask#doTask`：

```java
protected void doTask(Channel channel) {
    Long lastRead = lastRead(channel);
    Long lastWrite = lastWrite(channel);
    if ((lastRead != null && now() - lastRead > heartbeat)
        || (lastWrite != null && now() - lastWrite > heartbeat)) {
            Request req = new Request();
            req.setVersion(Version.getProtocolVersion());
            req.setTwoWay(true);
            req.setEvent(Request.HEARTBEAT_EVENT);
            channel.send(req);
        }
    }
}
```

前面已经介绍过，**Dubbo 采取的是双向心跳设计**，即服务端会向客户端发送心跳，客户端也会向服务端发送心跳，接收的一方更新 lastRead 字段，发送的一方更新 lastWrite 字段，超过心跳间隙的时间，便发送心跳请求给对端。这里的 lastRead/lastWrite 同样会被同一个通道上的普通调用更新，通过更新这两个字段，实现了只在连接空闲时才会真正发送空闲报文的机制，符合我们一开始科普的做法。

> 注意：不仅仅心跳请求会更新 lastRead 和 lastWrite，普通请求也会。这对应了我们预备知识中的空闲检测机制。

#### 3.4 定时任务二：处理重连和断连

继续研究下重连和断连定时器都实现了什么 `ReconnectTimerTask#doTask`。

```java
protected void doTask(Channel channel) {
    Long lastRead = lastRead(channel);
    Long now = now();
    if (lastRead != null && now - lastRead > heartbeatTimeout) {
        if (channel instanceof Client) {
            ((Client) channel).reconnect();
        } else {
            channel.close();
        }
    }
}
```

第二个定时器则负责根据客户端、服务端类型来对连接做不同的处理，当超过设置的心跳总时间之后，客户端选择的是重新连接，服务端则是选择直接断开连接。这样的考虑是合理的，客户端调用是强依赖可用连接的，而服务端可以等待客户端重新建立连接。

> 细心的朋友会发现，这个类被命名为 ReconnectTimerTask 是不太准确的，因为它处理的是重连和断连两个逻辑。

#### 3.5 定时不精确的问题

在 Dubbo 的 issue 中曾经有人反馈过定时不精确的问题，我们来看看是怎么一回事。

Dubbo 中默认的心跳周期是 60s，设想如下的时序：

- 第 0 秒，心跳检测发现连接活跃
- 第 1 秒，连接实际断开
- 第 60 秒，心跳检测发现连接不活跃

由于**时间窗口的问题，死链不能够被及时检测出来，最坏情况为一个心跳周期**。

为了解决上述问题，我们再倒回去看一下上面的 `startHeartbeatTimer()` 方法

```java
long heartbeatTick = calculateLeastDuration(heartbeat); 
long heartbeatTimeoutTick = calculateLeastDuration(heartbeatTimeout);
```

其中 `calculateLeastDuration` 根据心跳时间和超时时间分别计算出了一个 tick 时间，实际上就是将两个变量除以了 3，使得他们的值缩小，并传入了 `HashedWheelTimer` 的第二个参数之中

```java
heartbeatTimer.newTimeout(heartBeatTimerTask, heartbeatTick, TimeUnit.MILLISECONDS);
heartbeatTimer.newTimeout(reconnectTimerTask, heartbeatTimeoutTick, TimeUnit.MILLISECONDS);
```

tick 的含义便是定时任务执行的频率。这样，通过减少检测间隔时间，增大了及时发现死链的概率，原先的最坏情况是 60s，如今变成了 20s。这个频率依旧可以加快，但需要考虑资源消耗的问题。

> 定时不准确的问题出现在 Dubbo 的两个定时任务之中，所以都做了 tick 操作。事实上，所有的定时检测的逻辑都存在类似的问题。

#### 3.6 Dubbo 心跳总结

Dubbo 对于建立的每一个连接，同时在客户端和服务端开启了 2 个定时器，一个用于定时发送心跳，一个用于定时重连、断连，执行的频率均为各自检测周期的 1/3。定时发送心跳的任务负责在连接空闲时，向对端发送心跳包。定时重连、断连的任务负责检测 lastRead 是否在超时周期内仍未被更新，如果判定为超时，客户端处理的逻辑是重连，服务端则采取断连的措施。

先不急着判断这个方案好不好，再来看看改进方案是怎么设计的。

### 4 Dubbo 改进方案

实际上我们可以更优雅地实现心跳机制，本小节开始，我将介绍一个新的心跳机制。

#### 4.1 IdleStateHandler 介绍

Netty 对空闲连接的检测提供了天然的支持，使用 `IdleStateHandler` 可以很方便的实现空闲检测逻辑。

```java
public IdleStateHandler(
            long readerIdleTime, long writerIdleTime, long allIdleTime,
            TimeUnit unit) {}
```

- readerIdleTime：读超时时间
- writerIdleTime：写超时时间
- allIdleTime：所有类型的超时时间

`IdleStateHandler` 这个类会根据设置的超时参数，循环检测 channelRead 和 write 方法多久没有被调用。当在 pipeline 中加入 `IdleSateHandler` 之后，可以在此 pipeline 的任意 Handler 的 `userEventTriggered` 方法之中检测 `IdleStateEvent` 事件，

```java
@Override
public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
    if (evt instanceof IdleStateEvent) {
        //do something
    }
    ctx.fireUserEventTriggered(evt);
}
```

为什么需要介绍 `IdleStateHandler` 呢？其实提到它的空闲检测 + 定时的时候，大家应该能够想到了，这不天然是给心跳机制服务的吗？很多服务治理框架都选择了借助 `IdleStateHandler` 来实现心跳。

> IdleStateHandler 内部使用了 eventLoop.schedule(task) 的方式来实现定时任务，使用 eventLoop 线程的好处是还同时保证了**线程安全**，这里是一个小细节。 

#### 4.2 客户端和服务端配置

首先是将 `IdleStateHandler` 加入 pipeline 中。

**客户端：**

```java
bootstrap.handler(new ChannelInitializer<NioSocketChannel>() {
    @Override
    protected void initChannel(NioSocketChannel ch) throws Exception {
        ch.pipeline().addLast("clientIdleHandler", new IdleStateHandler(60, 0, 0));
    }
});
```

**服务端：**

```java
serverBootstrap.childHandler(new ChannelInitializer<NioSocketChannel>() {
    @Override
    protected void initChannel(NioSocketChannel ch) throws Exception {
        ch.pipeline().addLast("serverIdleHandler",new IdleStateHandler(0, 0, 200));
    }
}
```

客户端配置了 read 超时为 60s，服务端配置了 write/read 超时为 200s，先在此埋下两个伏笔：

1. 为什么客户端和服务端配置的超时时间不一致？
2. 为什么客户端检测的是读超时，而服务端检测的是读写超时？

#### 4.3 空闲超时逻辑 — 客户端

对于空闲超时的处理逻辑，客户端和服务端是不同的。首先来看客户端

```java
@Override
public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
    if (evt instanceof IdleStateEvent) {
        // send heartbeat
        sendHeartBeat();
    } else {
        super.userEventTriggered(ctx, evt);
    }
}
```

检测到空闲超时之后，采取的行为是向服务端发送心跳包，具体是如何发送，以及处理响应的呢？伪代码如下

```java
public void sendHeartBeat() {
    Invocation invocation = new Invocation();
    invocation.setInvocationType(InvocationType.HEART_BEAT);
    channel.writeAndFlush(invocation).addListener(new CallbackFuture() {
        @Override
        public void callback(Future future) {
            RPCResult result = future.get();
            //超时 或者 写失败
            if (result.isError()) {
                channel.addFailedHeartBeatTimes();
                if (channel.getFailedHeartBeatTimes() >= channel.getMaxHeartBeatFailedTimes()) {
                    channel.reconnect();
                }
            } else {
                channel.clearHeartBeatFailedTimes();
            }
        }
    });
}
```

行为并不复杂，构造一个心跳包发送到服务端，接受响应结果

- 响应成功，清空请求失败标记
- 响应失败，心跳失败标记+1，如果超过配置的失败次数，则重新连接

> 不仅仅是心跳，普通请求返回成功响应时也会清空标记

#### 4.4 空闲超时逻辑 — 服务端

```java
@Override
public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
    if (evt instanceof IdleStateEvent) {
        channel.close();
    } else {
        super.userEventTriggered(ctx, evt);
    }
}
```

服务端处理空闲连接的方式非常简单粗暴，直接关闭连接。

#### 4.5 改进方案心跳总结

1. 为什么客户端和服务端配置的超时时间不一致？

   因为客户端有重试逻辑，不断发送心跳失败 n 次之后，才认为是连接断开；而服务端是直接断开，留给服务端时间得长一点。60 * 3 < 200 还说明了一个问题，双方都拥有断开连接的能力，但连接的创建是由客户端主动发起的，那么客户端也更有权利去主动断开连接。

2. 为什么客户端检测的是读超时，而服务端检测的是读写超时？

   这其实是一个心跳的共识了，仔细思考一下，定时逻辑是由客户端发起的，所以整个链路中不通的情况只有可能是：服务端接收，服务端发送，客户端接收。也就是说，只有客户端的 pong，服务端的 ping，pong 的检测是有意义的。

> 主动追求别人的是你，主动说分手的也是你。

利用 `IdleStateHandler` 实现心跳机制可以说是十分优雅的，借助 Netty 提供的空闲检测机制，利用客户端维护单向心跳，在收到 3 次心跳失败响应之后，客户端断开连接，交由异步线程重连，本质还是表现为客户端重连。服务端在连接空闲较长时间后，主动断开连接，以避免无谓的资源浪费。

### 5 心跳设计方案对比

|                      |                        Dubbo 现有方案                        |                    Dubbo 改进方案                    |
| :------------------: | :----------------------------------------------------------: | :--------------------------------------------------: |
|     **主体设计**     |                        开启两个定时器                        |       借助 IdleStateHandler，底层使用 schedule        |
|     **心跳方向**     |                             双向                             |               单向（客户端 -> 服务端）               |
| **心跳失败判定方式** | 心跳成功更新标记，借助定时器定时扫描标记，如果超过心跳超时周期未更新标记，认为心跳失败。 | 通过判断心跳响应是否失败，超过失败次数，认为心跳失败 |
|      **扩展性**      | Dubbo 存在 mina，grizzy 等其他通信层实现，自定义定时器很容易适配多种扩展 |         多通信层各自实现心跳，不做心跳的抽象         |
|      **设计性**      |          编码复杂度高，代码量大，方案复杂，不易维护          |                 编码量小，可维护性强                 |

私下请教过**美团点评的长连接负责人：俞超（闪电侠）**，美点使用的心跳方案和 Dubbo 改进方案几乎一致，可以说该方案是标准实现了。

### 6 Dubbo 实际改动点建议

鉴于 Dubbo 存在一些其他通信层的实现，所以可以保留现有的定时发送心跳的逻辑。

- **建议改动点一：**

双向心跳的设计是不必要的，兼容现有的逻辑，可以让客户端在连接空闲时发送单向心跳，服务端定时检测连接可用性。定时时间尽量保证：客户端超时时间 * 3 ≈ 服务端超时时间

- **建议改动点二：**

去除处理重连和断连的定时任务，Dubbo 可以判断心跳请求是否响应失败，可以借鉴改进方案的设计，在连接级别维护一个心跳失败次数的标记，任意响应成功，清除标记；连续心跳失败 n 次，客户端发起重连。这样可以减少一个不必要的定时器，任何轮询的方式，都是不优雅的。

最后再聊聊可扩展性这个话题。其实我是建议把定时器交给更加底层的 Netty 去做，也就是完全使用 `IdleStateHandler` ，其他通信层组件各自实现自己的空闲检测逻辑，但是 Dubbo 中 mina，grizzy 的兼容问题囿住了我的拳脚，但试问一下，如今的 2019 年，又有多少人在使用 mina 和 grizzy？因为一些不太可能用的特性，而限制了主流用法的优化，这肯定不是什么好事。抽象，功能，可扩展性并不是越多越好，开源产品的人力资源是有限的，框架使用者的理解能力也是有限的，能解决大多数人问题的设计，才是好的设计。哎，谁让我不会 mina，grizzy，还懒得去学呢[摊手]。
