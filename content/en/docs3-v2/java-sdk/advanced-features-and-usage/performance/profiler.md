---
type: docs
title: "Request time-consuming sampling"
linkTitle: "Request time-consuming sampling"
weight: 1
description: "Dubbo 3 request time-consuming sampling"
---

## Function Description

The performance sampling function can detect the time consumption of various parts of the Dubbo processing link. When a timeout occurs, `( usageTime / timeout > profilerWarnPercent * 100 )` records the time consumption of calls through logs.

This function is divided into `simple profiler` and `detail profiler` two modes, where `simple profiler` mode is enabled by default, and `detail profiler` mode is disabled by default.
Compared with the `simple profiler` mode, the `detail profiler` collects more time-consuming processing of each filter, specific time-consuming protocols, etc.
In the `simple profiler` mode, if you find that there is a long time-consuming situation inside the Dubbo framework, you can enable the `detail profiler` mode to better troubleshoot the problem.

## scenes to be used

Scenarios that need to collect and analyze the precise time consumption of Dubbo requests, such as service timeouts for unknown reasons, etc.

## How to use

`simple profiler` is automatically enabled by default, and for requests whose processing time exceeds 3/4 of the timeout time, the slow call information will be printed out through the log. If you need to enable the `detail profiler` mode or modify the timeout alarm ratio, you can refer to the [performance sampling command](../../../reference-manual/qos/profiler/) document.

### output example

#### Log description

The meaning of each field in the log is as follows:

```
[Dubbo-Consumer] execute service interface#method cost actual time-consuming, this invocation almost (maybe already) timeout. Timeout: timeout
invocation context:
request context
thread info:
Start time: start request time (nano time)
+-[ Offset: the start time of the current node; Usage: the total time spent on the current node, the time-consuming ratio of the current node ] Description of the current node
  +-[ Offset: the start time of the current node; Usage: the total time spent on the current node, the time-consuming ratio of the current node ] Description of the current node
```

For the request time-consuming, here are two examples:

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
  method D (7)
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

#### simple profiler

Consumer side:
```
[19/07/22 07:08:35:035 CST] main WARN proxy.InvokerInvocationHandler: [DUBBO] [Dubbo-Consumer] execute service org.apache.dubbo.samples.api.GreetingsService#sayHi cost 1003.015746 ms, this invocation almost (maybe already) timeout. Timeout: 1000ms
invocation context:
path=org.apache.dubbo.samples.api.GreetingsService;
remote.application=first-dubbo-consumer;
interface=org.apache.dubbo.samples.api.GreetingsService;
version=0.0.0;
timeout=1000;
thread info:
Start time: 285821581299853
+-[ Offset: 0.000000ms; Usage: 1003.015746ms, 100% ] Receive request. Client invoke begin. ServiceKey: org.apache.dubbo.samples.api.GreetingsService MethodName:sayHi
  +-[ Offset: 7.987015ms; Usage: 994.207928ms, 99% ] Invoker invoke. Target Address: xx.xx.xx.xx:20880, dubbo version: 3.0.10-SNAPSHOT, current host: xx.xx.xx. xx
```

Provider side:
```
[19/07/22 07:08:35:035 CST] DubboServerHandler-30.227.64.173:20880-thread-2 WARN filter.ProfilerServerFilter: [DUBBO] [Dubbo-Provider] execute service org.apache.dubbo.samples.api .GreetingsService:0.0.0#sayHi cost 808.494672 ms, this invocation almost (maybe already) timeout. Timeout: 1000ms
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

#### detail profiler

Consumer side:
```
[19/07/22 07:10:59:059 CST] main WARN proxy.InvokerInvocationHandler: [DUBBO] [Dubbo-Consumer] execute service org.apache.dubbo.samples.api.GreetingsService#sayHi cost 990.828336 ms, this invocation almost (maybe already) timeout. Timeout: 1000ms
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
                 +-[ Offset: 8.258359ms; Usage: 981.612033ms, 99% ] Invoker invoke. Target Address: xx.xx.xx.xx:20880, dubbo version: 3.0.10-SNAPSHOT, current host: xx.xx.xx. xx
```

Provider side:
```
[19/07/22 07:10:59:059 CST] DubboServerHandler-30.227.64.173:20880-thread-2 WARN filter.ProfilerServerFilter: [DUBBO] [Dubbo-Provider] execute service org.apache.dubbo.samples.api .GreetingsService:0.0.0#sayHi cost 811.017347 ms, this invocation almost (maybe already) timeout. Timeout: 1000ms
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

Note: If the log is empty due to the mismatch of the log framework, you can refer to [Log Framework Adaptation and Runtime Management](../../others/logger-management/) to dynamically modify the log output framework.