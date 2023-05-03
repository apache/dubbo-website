---
aliases:
    - /zh/overview/tasks/troubleshoot/request-failed/
description: 在 Dubbo 请求成功率低时的排查思路
linkTitle: 请求成功率低
title: 请求成功率低
type: docs
weight: 3
---



在生产环境中，请求成功率与延时是最关键的指标，本文将介绍在请求成功率下降时候的排查思路。

## 一句话总结
全链路指标（消费端、网络、服务端、外部依赖等）分析瓶颈

![img](/imgs/docs3-v2/java-sdk/troubleshoot/1677487652373-fdc41dbd-0fe0-461f-b827-fa8db68ba2a2.jpeg)

## 排查思路
### 1 消费端是否正常构造请求
#### 1.1 检查类对象是否都是可以序列化的
在使用 Dubbo 进行 RPC 进行远程调用的时候，由于是跨进程的调用，为了防止非预期的数据在网络中请求，Dubbo 遵循 Java 的序列化最佳实践会检查所有数据对象是否实现了 `Serializable` 接口。

以下是检查到序列化异常时的日志样例：
```
io.netty.handler.codec.EncoderException: java.lang.IllegalArgumentException: [Serialization Security] Serialized class org.apache.dubbo.samples.api.GreetingsService$Data has not implement Serializable interface. Current mode is strict check, will disallow to deserialize it by default. 
	at io.netty.handler.codec.MessageToByteEncoder.write(MessageToByteEncoder.java:125)
	at io.netty.channel.AbstractChannelHandlerContext.invokeWrite0(AbstractChannelHandlerContext.java:881)
	at io.netty.channel.AbstractChannelHandlerContext.invokeWrite(AbstractChannelHandlerContext.java:863)
	at io.netty.channel.AbstractChannelHandlerContext.write(AbstractChannelHandlerContext.java:968)
	at io.netty.channel.AbstractChannelHandlerContext.write(AbstractChannelHandlerContext.java:856)
	at io.netty.handler.timeout.IdleStateHandler.write(IdleStateHandler.java:304)
	at io.netty.channel.AbstractChannelHandlerContext.invokeWrite0(AbstractChannelHandlerContext.java:879)
	at io.netty.channel.AbstractChannelHandlerContext.invokeWrite(AbstractChannelHandlerContext.java:863)
	at io.netty.channel.AbstractChannelHandlerContext.write(AbstractChannelHandlerContext.java:968)
	at io.netty.channel.AbstractChannelHandlerContext.write(AbstractChannelHandlerContext.java:856)
	at io.netty.channel.ChannelDuplexHandler.write(ChannelDuplexHandler.java:115)
	at org.apache.dubbo.remoting.transport.netty4.NettyClientHandler.write(NettyClientHandler.java:88)
	at io.netty.channel.AbstractChannelHandlerContext.invokeWrite0(AbstractChannelHandlerContext.java:879)
	at io.netty.channel.AbstractChannelHandlerContext.invokeWriteAndFlush(AbstractChannelHandlerContext.java:940)
	at io.netty.channel.AbstractChannelHandlerContext$WriteTask.run(AbstractChannelHandlerContext.java:1247)
	at io.netty.util.concurrent.AbstractEventExecutor.runTask(AbstractEventExecutor.java:174)
	at io.netty.util.concurrent.AbstractEventExecutor.safeExecute(AbstractEventExecutor.java:167)
	at io.netty.util.concurrent.SingleThreadEventExecutor.runAllTasks(SingleThreadEventExecutor.java:470)
	at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:569)
	at io.netty.util.concurrent.SingleThreadEventExecutor$4.run(SingleThreadEventExecutor.java:997)
	at io.netty.util.internal.ThreadExecutorMap$2.run(ThreadExecutorMap.java:74)
	at io.netty.util.concurrent.FastThreadLocalRunnable.run(FastThreadLocalRunnable.java:30)
	at java.lang.Thread.run(Thread.java:748)
Caused by: java.lang.IllegalArgumentException: [Serialization Security] Serialized class org.apache.dubbo.samples.api.GreetingsService$Data has not implement Serializable interface. Current mode is strict check, will disallow to deserialize it by default. 
	at org.apache.dubbo.common.utils.DefaultSerializeClassChecker.loadClass(DefaultSerializeClassChecker.java:112)
	at org.apache.dubbo.common.serialize.hessian2.Hessian2SerializerFactory.getDefaultSerializer(Hessian2SerializerFactory.java:49)
	at com.alibaba.com.caucho.hessian.io.SerializerFactory.getSerializer(SerializerFactory.java:393)
	at com.alibaba.com.caucho.hessian.io.Hessian2Output.writeObject(Hessian2Output.java:411)
	at org.apache.dubbo.common.serialize.hessian2.Hessian2ObjectOutput.writeObject(Hessian2ObjectOutput.java:99)
	at org.apache.dubbo.rpc.protocol.dubbo.DubboCodec.encodeRequestData(DubboCodec.java:208)
	at org.apache.dubbo.remoting.exchange.codec.ExchangeCodec.encodeRequest(ExchangeCodec.java:261)
	at org.apache.dubbo.remoting.exchange.codec.ExchangeCodec.encode(ExchangeCodec.java:75)
	at org.apache.dubbo.rpc.protocol.dubbo.DubboCountCodec.encode(DubboCountCodec.java:47)
	at org.apache.dubbo.remoting.transport.netty4.NettyCodecAdapter$InternalEncoder.encode(NettyCodecAdapter.java:69)
	at io.netty.handler.codec.MessageToByteEncoder.write(MessageToByteEncoder.java:107)
	... 22 more
```

典型的日志关键字为 `has not implement Serializable interface`。

如果存在报错的类信息，请添加实现 `Serializable` 接口后重新部署。

#### 1.2 检查自定义扩展的逻辑是否正常
如果您基于 Dubbo 的 SPI 机制扩展了如 Filter、Cluster、Router 等，请检查对应的实现是否有报错，任何一个组件报错都将影响业务的正常请求。

### 2 消费端是否正常写入请求
#### 2.1 检查机器性能指标
在消费端发起网络请求的时候，需要关注机器的 CPU 状态，如使用率、上下文切换次数等。如果机器负载过高，也将影响 Dubbo 请求处理的效率。

#### 2.2 检查 JVM 指标
除了机器性能之外，JVM 虚拟机的性能也将直接影响 Dubbo，请关注 JVM 进程的以下指标：

1. GC 次数（特别是 Full GC）
2. Young / Old Gen 大小
3. C1 / C2 编译情况

为了更好地观测 JVM 虚拟机，可以通过 Java Flight Recorder 工具进行采样分析，参考。

### 3 网络传输是否正常
#### 3.1 检查网络可达性
对于绝大多数多机房部署的应用，机器之间的互通经过至少 1 个交换机，请检查：

1. 转发（路由）规则是否正常
2. ACL 是否对 Dubbo 开放

#### 3.2 检查网络延迟与重传率
除了可达性之外，Dubbo 作为同步调用的 RPC，对时延和重传是非常敏感的，请检查：

1. 节点之间的 RT
2. 网络的丢包率
3. 网络的重传率（包括 TCP 重传）

对于丢包率和重传率，可以通过 tcpdump 进行流量采样，然后通过 wireshark 进行分析。Dubbo 默认采用长连接复用模式，如果存在网络抖动将严重影响当下的所有在途请求。如果您希望您的请求成功率尽可能接近 100% 需要保证网络的 RT 是平稳的，丢包率和重传率接近于 0。

#### 3.3 检查网络吞吐量
对于存在跨机房调用的用户来说，请密切关注网络的带宽指标，一旦达到运营商所限制的最大值将导致严重的请求丢包等情况，这对于 Dubbo 来说的影响是巨大的。

### 4 服务端是否正常接收请求
#### 4.1 检查机器性能指标
在服务端处理网络请求的时候，需要关注机器的 CPU 状态，如使用率、上下文切换次数等。如果机器负载过高，也将影响 Dubbo 请求处理的效率。

#### 4.2 检查 JVM 指标
除了机器性能之外，JVM 虚拟机的性能也将直接影响 Dubbo，请关注 JVM 进程的以下指标：

1. GC 次数（特别是 Full GC）
2. Young / Old Gen 大小
3. C1 / C2 编译情况

为了更好地观测 JVM 虚拟机，可以通过 Java Flight Recorder 工具进行采样分析，参考。

### 5 服务端是否正常处理请求
#### 5.1 检查是否服务端线程池满
Dubbo 默认为服务端配置了 200（可修改）并发值的限制，如果某一时刻下超过了该限制将拒绝所有的新请求1⃣以保护服务端。

以下为线程池满时的日志样例：
```
[27/02/23 05:37:40:040 CST] NettyServerWorker-5-2  WARN support.AbortPolicyWithReport:  [DUBBO] Thread pool is EXHAUSTED! Thread Name: DubboServerHandler-30.221.144.195:20880, Pool Size: 20 (active: 20, core: 20, max: 20, largest: 20), Task: 27 (completed: 7), Executor status:(isShutdown:false, isTerminated:false, isTerminating:false), in dubbo://30.221.144.195:20880!, dubbo version: 3.1.7, current host: 30.221.144.195, error code: 0-1. This may be caused by too much client requesting provider, go to https://dubbo.apache.org/faq/0/1 to find instructions. 
```

典型的日志关键字为 `Thread pool is EXHAUSTED`

Dubbo 默认会在 `user.home` 目录下打印异常时的 `jstack` 信息，您也可以自行执行 `jstack` 进行排查。

#### 5.2 检查是否被限流了
如果您开启了 Dubbo 的 TPS 限流或者是引入了如 Sentinel、Hystrix 等限流组件，请检查是否触发限流值。

#### 5.3 检查自定义扩展的逻辑是否正常
如果您基于 Dubbo 的 SPI 机制扩展了如 Filter 等，请检查对应的实现是否有报错，任何一个组件报错都将影响业务的正常请求。

#### 5.4 检查服务端处理时长
如果服务端处理的时长接近或者是超过客户端配置的超时时间，则客户端会直接快速抛出异常。

关于服务端处理的时长可以参考以下日志：

```
[27/02/23 05:30:04:004 CST] DubboServerHandler-30.221.144.195:20880-thread-5  WARN filter.ProfilerServerFilter:  [DUBBO] [Dubbo-Provider] execute service org.apache.dubbo.samples.api.GreetingsService:0.0.0#sayHi cost 3001.533827 ms, this invocation almost (maybe already) timeout. Timeout: 1000ms
client: fd00:1:5:5200:a0a1:52b:e079:8582:58731
invocation context:
input=284;
path=org.apache.dubbo.samples.api.GreetingsService;
remote.application=first-dubbo-consumer;
dubbo=2.0.2;
interface=org.apache.dubbo.samples.api.GreetingsService;
version=0.0.0;
timeout=1000;
thread info: 
Start time: 4237588012688
+-[ Offset: 0.000000ms; Usage: 3001.533827ms, 100% ] Receive request. Server invoke begin.
  +-[ Offset: 0.045578ms; Usage: 3001.436721ms, 99% ] Receive request. Server biz impl invoke begin., dubbo version: 3.1.7, current host: 30.221.144.195, error code: 3-7. This may be caused by , go to https://dubbo.apache.org/faq/3/7 to find instructions. 
```

可以搜索 `execute service *** cost *** ms, this invocation almost (maybe already) timeout`相关日志。

通常在出现此日志的时候，您的服务实现中可能存在以下情况：

1. 长时间的锁等待
2. 外部依赖（RPC、MQ、Cache、DB 等）处理时长过长，可以接入全链路追踪平台诊断
3. 机器的负载过高
