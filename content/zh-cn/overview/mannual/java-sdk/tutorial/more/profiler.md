---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/profiler/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/profiler/
description: Dubbo 请求耗时采样
linkTitle: 请求耗时采样
title: 请求耗时采样
type: docs
weight: 1
---






## 功能说明

性能采样功能可以对 Dubbo 处理链路上的各处耗时进行检测，在出现超时的时候 `( usageTime / timeout > profilerWarnPercent * 100 )` 通过日志记录调用的耗时。

此功能分为 `simple profiler` 和 `detail profiler` 两个模式，其中 `simple profiler` 模式默认开启，`detail profiler` 模式默认关闭。
`detail profiler` 相较 `simple profiler` 模式多采集了每个 filter 的处理耗时、协议上的具体耗时等。
在 `simple profiler` 模式下如果发现 Dubbo 框架内部存在耗时长的情况，可以开启 `detail profiler` 模式，以便更好地排查问题。

## 使用场景

需要对 Dubbo 请求的精确耗时进行采集分析的场景，如服务不明原因的超时等

## 使用方式

`simple profiler` 默认自动开启，对于请求处理时间超过超时时间 3/4 的，都会通过日志打印出慢调用信息。如果需要开启 `detail profiler` 模式或者修改超时告警比例，可以参考[性能采样命令](../../../reference-manual/qos/profiler/)文档。

### 日志说明

日志中各字段的含义如下：

```
[Dubbo-Consumer] execute service 接口#方法 cost 实际耗时, this invocation almost (maybe already) timeout. Timeout: 超时时间
invocation context:
请求上下文
thread info: 
Start time: 开始请求时间（nano 时间）
+-[ Offset: 当前节点开始时间; Usage: 当前节点使用总耗时, 当前节点耗时比例 ] 当前节点描述
  +-[ Offset: 当前节点开始时间; Usage: 当前节点使用总耗时, 当前节点耗时比例 ] 当前节点描述
```

对于请求耗时这里以两个例子进行介绍：

```
methodA() {
  do something (1)
  methodB (2)
  do something (3)
}

methodB() {
  do something (4)
  methodC (5)
  do something (6)
}

methodC() {
  do something (7)
}
 
+-[ Offset: 0 ms; Usage: (1) + (2) + (3) ms] execute methodA
  +-[ Offset: (1) ms; Usage: (4) + (5) + (6) = (2) ms ] execute methodB
    +-[ Offset: (1) + (4) ms; Usage: (7) = (5) ms ] execute methodC
    
(1) (2) (3) ... 均为时间占位符
```

```
methodA() {
  do something (1)
  methodB (2)
  methodE (3)
  do something (4)
}

methodB() {
  do something (5)
  methodC (6)
  methodD (7)
  do something (8)
}

methodC() {
  do something (9)
}

methodD() {
  do something (10)
}

methodE() {
  do something (11)
}
 
+-[ Offset: 0 ms; Usage: (1) + (2) + (3) + (4) ms] execute methodA
  +-[ Offset: (1) ms; Usage: (5) + (6) + (7) + (8) = (2) ms ] execute methodB
    +-[ Offset: (1) + (5) ms; Usage: (9) = (6) ms ] execute methodC
    +-[ Offset: (1) + (5) + (6) ms; Usage: (10) = (7) ms ] execute methodD
  +-[ Offset: (1) + (2) ms; Usage: (11) = (3) ms ] execute methodE
    
(1) (2) (3) ... 均为时间占位符
```

### simple profiler

Consumer 侧：
```
[19/07/22 07:08:35:035 CST] main  WARN proxy.InvokerInvocationHandler:  [DUBBO] [Dubbo-Consumer] execute service org.apache.dubbo.samples.api.GreetingsService#sayHi cost 1003.015746 ms, this invocation almost (maybe already) timeout. Timeout: 1000ms
invocation context:
path=org.apache.dubbo.samples.api.GreetingsService;
remote.application=first-dubbo-consumer;
interface=org.apache.dubbo.samples.api.GreetingsService;
version=0.0.0;
timeout=1000;
thread info: 
Start time: 285821581299853
+-[ Offset: 0.000000ms; Usage: 1003.015746ms, 100% ] Receive request. Client invoke begin. ServiceKey: org.apache.dubbo.samples.api.GreetingsService MethodName:sayHi
  +-[ Offset: 7.987015ms; Usage: 994.207928ms, 99% ] Invoker invoke. Target Address: xx.xx.xx.xx:20880, dubbo version: 3.0.10-SNAPSHOT, current host: xx.xx.xx.xx
```

Provider 侧：
```
[19/07/22 07:08:35:035 CST] DubboServerHandler-30.227.64.173:20880-thread-2  WARN filter.ProfilerServerFilter:  [DUBBO] [Dubbo-Provider] execute service org.apache.dubbo.samples.api.GreetingsService:0.0.0#sayHi cost 808.494672 ms, this invocation almost (maybe already) timeout. Timeout: 1000ms
client: xx.xx.xx.xx:51604
invocation context:
input=281;
path=org.apache.dubbo.samples.api.GreetingsService;
remote.application=first-dubbo-consumer;
dubbo=2.0.2;
interface=org.apache.dubbo.samples.api.GreetingsService;
version=0.0.0;
timeout=1000;
thread info: 
Start time: 285821754461125
+-[ Offset: 0.000000ms; Usage: 808.494672ms, 100% ] Receive request. Server invoke begin.
  +-[ Offset: 1.030912ms; Usage: 804.236342ms, 99% ] Receive request. Server biz impl invoke begin., dubbo version: 3.0.10-SNAPSHOT, current host: xx.xx.xx.xx
```

### detail profiler

Consumer 侧：
```
[19/07/22 07:10:59:059 CST] main  WARN proxy.InvokerInvocationHandler:  [DUBBO] [Dubbo-Consumer] execute service org.apache.dubbo.samples.api.GreetingsService#sayHi cost 990.828336 ms, this invocation almost (maybe already) timeout. Timeout: 1000ms
invocation context:
path=org.apache.dubbo.samples.api.GreetingsService;
remote.application=first-dubbo-consumer;
interface=org.apache.dubbo.samples.api.GreetingsService;
version=0.0.0;
timeout=1000;
thread info: 
Start time: 285965458479241
+-[ Offset: 0.000000ms; Usage: 990.828336ms, 100% ] Receive request. Client invoke begin. ServiceKey: org.apache.dubbo.samples.api.GreetingsService MethodName:sayHi
  +-[ Offset: 0.852044ms; Usage: 989.899439ms, 99% ] Filter org.apache.dubbo.rpc.cluster.filter.support.ConsumerContextFilter invoke.
     +-[ Offset: 1.814858ms; Usage: 988.924876ms, 99% ] Filter org.apache.dubbo.rpc.protocol.dubbo.filter.FutureFilter invoke.
        +-[ Offset: 1.853211ms; Usage: 988.877928ms, 99% ] Filter org.apache.dubbo.monitor.support.MonitorClusterFilter invoke.
           +-[ Offset: 1.873243ms; Usage: 988.661708ms, 99% ] Filter org.apache.dubbo.rpc.cluster.router.RouterSnapshotFilter invoke.
              +-[ Offset: 2.159140ms; Usage: 0.504939ms, 0% ] Router route.
              +-[ Offset: 8.125823ms; Usage: 981.748366ms, 99% ] Cluster org.apache.dubbo.rpc.cluster.support.FailoverClusterInvoker invoke.
                 +-[ Offset: 8.258359ms; Usage: 981.612033ms, 99% ] Invoker invoke. Target Address: xx.xx.xx.xx:20880, dubbo version: 3.0.10-SNAPSHOT, current host: xx.xx.xx.xx
```

Provider 侧：
```
[19/07/22 07:10:59:059 CST] DubboServerHandler-30.227.64.173:20880-thread-2  WARN filter.ProfilerServerFilter:  [DUBBO] [Dubbo-Provider] execute service org.apache.dubbo.samples.api.GreetingsService:0.0.0#sayHi cost 811.017347 ms, this invocation almost (maybe already) timeout. Timeout: 1000ms
client: xx.xx.xx.xx:52019
invocation context:
input=281;
path=org.apache.dubbo.samples.api.GreetingsService;
remote.application=first-dubbo-consumer;
dubbo=2.0.2;
interface=org.apache.dubbo.samples.api.GreetingsService;
version=0.0.0;
timeout=1000;
thread info: 
Start time: 285965612316294
+-[ Offset: 0.000000ms; Usage: 811.017347ms, 100% ] Receive request. Server invoke begin.
  +-[ Offset: 1.096880ms; Usage: 809.916668ms, 99% ] Filter org.apache.dubbo.rpc.filter.EchoFilter invoke.
     +-[ Offset: 1.133478ms; Usage: 809.866204ms, 99% ] Filter org.apache.dubbo.rpc.filter.ClassLoaderFilter invoke.
        +-[ Offset: 1.157563ms; Usage: 809.838572ms, 99% ] Filter org.apache.dubbo.rpc.filter.GenericFilter invoke.
           +-[ Offset: 1.202075ms; Usage: 809.736843ms, 99% ] Filter org.apache.dubbo.rpc.filter.ContextFilter invoke.
              +-[ Offset: 1.433193ms; Usage: 809.504401ms, 99% ] Filter org.apache.dubbo.auth.filter.ProviderAuthFilter invoke.
                 +-[ Offset: 1.470760ms; Usage: 809.464291ms, 99% ] Filter org.apache.dubbo.rpc.filter.ExceptionFilter invoke.
                    +-[ Offset: 1.489103ms; Usage: 809.440183ms, 99% ] Filter org.apache.dubbo.monitor.support.MonitorFilter invoke.
                       +-[ Offset: 1.515757ms; Usage: 809.381893ms, 99% ] Filter org.apache.dubbo.rpc.filter.TimeoutFilter invoke.
                          +-[ Offset: 1.526632ms; Usage: 809.366553ms, 99% ] Filter org.apache.dubbo.rpc.protocol.dubbo.filter.TraceFilter invoke.
                             +-[ Offset: 1.536964ms; Usage: 809.335907ms, 99% ] Filter org.apache.dubbo.rpc.filter.ClassLoaderCallbackFilter invoke.
                                +-[ Offset: 1.558545ms; Usage: 804.276436ms, 99% ] Receive request. Server biz impl invoke begin., dubbo version: 3.0.10-SNAPSHOT, current host: xx.xx.xx.xx
```
{{% alert title="注意" color="warning" %}}
由于日志框架不匹配导致的日志为空可以参考[日志框架适配及运行时管理](../../others/logger-management/)动态修改日志输出框架。
{{% /alert %}}
