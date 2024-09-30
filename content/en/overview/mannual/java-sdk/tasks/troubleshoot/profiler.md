---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/profiler/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/profiler/
description: Dubbo Request Timing Sampling
linkTitle: Request Timing Sampling
title: Request Timing Sampling
type: docs
weight: 1
---


The performance sampling feature can detect the time spent at various points in the Dubbo processing chain, logging the call duration when a timeout occurs `( usageTime / timeout > profilerWarnPercent * 100 )`.

This feature has two modes: `simple profiler` and `detail profiler`, where the `simple profiler` mode is enabled by default and the `detail profiler` mode is disabled by default. The `detail profiler` collects more data, such as the processing time of each filter and specific protocol timing. If long processing times are detected in the Dubbo framework while in `simple profiler` mode, you can enable `detail profiler` mode to better troubleshoot issues.

## Usage Scenarios

Scenarios that require precise timing analysis of Dubbo requests, such as unexplained service timeouts.

## Usage

The `simple profiler` is automatically enabled by default, and for requests exceeding three-quarters of the timeout duration, slow call information will be logged. To enable `detail profiler` mode or modify the timeout alert ratio, refer to the [performance sampling command](/en/overview/mannual/java-sdk/reference-manual/qos/profiler/) documentation.

### Log Description

The meanings of various fields in the log are as follows:

```
[Dubbo-Consumer] execute service interface#method cost actual time spent, this invocation almost (maybe already) timeout. Timeout: timeout duration
invocation context:
request context
thread info: 
Start time: request start time (nano time)
+-[ Offset: current node start time; Usage: total time spent at current node, current node time spent ratio ] current node description
  +-[ Offset: current node start time; Usage: total time spent at current node, current node time spent ratio ] current node description
```

Here are two examples for request timing:

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
    
(1) (2) (3) ... are all time placeholders
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
    
(1) (2) (3) ... are all time placeholders
```

### Simple Profiler

Consumer Side:
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

Provider Side:
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

### Detail Profiler

Consumer Side:
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

Provider Side:
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
{{% alert title="Note" color="warning" %}}
For empty logs caused by log framework mismatches, refer to [Log Framework Adaptation and Runtime Management](../../others/logger-management/) for dynamically modifying the log output framework.
{{% /alert %}}

