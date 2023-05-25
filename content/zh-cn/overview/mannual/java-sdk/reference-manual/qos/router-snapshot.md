---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/qos/router-snapshot/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/qos/router-snapshot/
description: 路由状态命令
linkTitle: 路由状态命令
title: 路由状态命令
type: docs
weight: 8
---






Dubbo 的很多流量治理能力是基于 Router 进行实现的，在生产环境中，如果出现流量结果不符合预期的情况，可以通过路由状态命令来查看路由的状态，以此来定位可能存在的问题。

> [路由状态采集](../../../advanced-features-and-usage/performance/router-snapshot/)

### getRouterSnapshot 命令

获取当前的每层路由的分组状态。（仅支持 StateRouter）

命令：`getRouterSnapshot {serviceName}`

`serviceName` 为需要采集的服务名，支持匹配

```
dubbo>getRouterSnapshot com.dubbo.dubbointegration.BackendService
com.dubbo.dubbointegration.BackendService@2c2e824a
[ All Invokers:2 ] [ Valid Invokers: 2 ]

MockInvokersSelector  Total: 2
[ Mocked -> Empty (Total: 0) ]
[ Normal -> 172.18.111.187:20880,172.18.111.183:20880 (Total: 2) ]
            ↓ 
StandardMeshRuleRouter not support
            ↓ 
TagStateRouter not support
            ↓ 
ServiceStateRouter not support
            ↓ 
AppStateRouter not support
            ↓ 
TailStateRouter End


dubbo>
```

### enableRouterSnapshot 命令

开启路由结果采集模式

命令：`enableRouterSnapshot {serviceName}`

`serviceName` 为需要采集的服务名，支持匹配

```
dubbo>enableRouterSnapshot com.dubbo.*
OK. Found service count: 1. This will cause performance degradation, please be careful!

dubbo>
```

### disableRouterSnapshot 命令

关闭路由结果采集模式

命令：`disableRouterSnapshot {serviceName}`

`serviceName` 为需要采集的服务名，支持匹配

```
dubbo>disableRouterSnapshot com.dubbo.*
OK. Found service count: 1

dubbo>
```

### getEnabledRouterSnapshot 命令

获取当前已经开启采集的服务

```
dubbo>getEnabledRouterSnapshot
com.dubbo.dubbointegration.BackendService

dubbo>
```

### getRecentRouterSnapshot 命令

通过 qos 命令获取历史的路由状态。（最多存储 32 个结果）

```
dubbo>getRecentRouterSnapshot
1658224330156 - Router snapshot service com.dubbo.dubbointegration.BackendService from registry 172.18.111.184 on the consumer 172.18.111.184 using the dubbo version 3.0.9 is below: 
[ Parent (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) ] Input: 172.18.111.187:20880,172.18.111.183:20880 -> Chain Node Output: 172.18.111.187:20880,172.18.111.183:20880
  [ MockInvokersSelector (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: invocation.need.mock not set. Return normal Invokers. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
    [ StandardMeshRuleRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: MeshRuleCache has not been built. Skip route. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
      [ TagStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Disable Tag Router. Reason: tagRouterRule is invalid or disabled ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
        [ ServiceStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Directly return. Reason: Invokers from previous router is empty or conditionRouters is empty. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
          [ AppStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Directly return. Reason: Invokers from previous router is empty or conditionRouters is empty. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880

1658224330156 - Router snapshot service com.dubbo.dubbointegration.BackendService from registry 172.18.111.184 on the consumer 172.18.111.184 using the dubbo version 3.0.9 is below: 
[ Parent (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) ] Input: 172.18.111.187:20880,172.18.111.183:20880 -> Chain Node Output: 172.18.111.187:20880,172.18.111.183:20880
  [ MockInvokersSelector (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: invocation.need.mock not set. Return normal Invokers. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
    [ StandardMeshRuleRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: MeshRuleCache has not been built. Skip route. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
      [ TagStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Disable Tag Router. Reason: tagRouterRule is invalid or disabled ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
        [ ServiceStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Directly return. Reason: Invokers from previous router is empty or conditionRouters is empty. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880
          [ AppStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Directly return. Reason: Invokers from previous router is empty or conditionRouters is empty. ] Current Node Output: 172.18.111.187:20880,172.18.111.183:20880

···

dubbo>
```
