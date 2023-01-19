---
type: docs
title: "Routing Status Command"
linkTitle: "Routing Status Command"
weight: 8
description: "Route Status Command"
---

Many of Dubbo's traffic management capabilities are implemented based on Router. In a production environment, if traffic results do not meet expectations, you can use the routing status command to check the routing status to locate possible problems.

Reference link: [routing status collection](../../../advanced-features-and-usage/performance/router-snapshot/)

## getRouterSnapshot command

Get the current grouping status of each layer of routing. (Only supports StateRouter)

Command: `getRouterSnapshot {serviceName}`

`serviceName` is the name of the service to be collected, which supports matching

```
dubbo>getRouterSnapshot com.dubbo.dubbointegration.BackendService
com.dubbo.dubbointegration.BackendService@2c2e824a
[ All Invokers: 2 ] [ Valid Invokers: 2 ]

MockInvokersSelector Total: 2
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
TailStateRouterEnd


dubbo>
```

## enableRouterSnapshot command

Enable routing result collection mode

Command: `enableRouterSnapshot {serviceName}`

`serviceName` is the name of the service to be collected, which supports matching

```
dubbo>enableRouterSnapshot com.dubbo.*
OK. Found service count: 1. This will cause performance degradation, please be careful!

dubbo>
```

## disableRouterSnapshot command

Disable routing result collection mode

Command: `disableRouterSnapshot {serviceName}`

`serviceName` is the name of the service to be collected, which supports matching

```
dubbo>disableRouterSnapshot com.dubbo.*
OK. Found service count: 1

dubbo>
```

## getEnabledRouterSnapshot command

Get the services that are currently collecting

```
dubbo>getEnabledRouterSnapshot
com.dubbo.dubbointegration.BackendService

dubbo>
```

## getRecentRouterSnapshot command

Obtain the historical routing status through the qos command. (up to 32 results stored)

```
dubbo>getRecentRouterSnapshot
1658224330156 - Router snapshot service com.dubbo.dubbointegration.BackendService from registry 172.18.111.184 on the consumer 172.18.111.184 using the dubbo version 3.0.9 is below:
[ Parent (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) ] Input: 172.18.111.187:20880,172.18.111.183:20880 -> Chain Node Output: 172.18.111.187:20880.3172.18 :20880
  [ MockInvokersSelector (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: invocation.need.mock not set. Return normal Invokers. ] Current Node Output: 172.18.111.187:20880,172.183.111. :20880
    [ StandardMeshRuleRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: MeshRuleCache has not been built. Skip route. ] Current Node Output: 172.18.111.187:20880,172.1803:1121.88
      [ TagStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Disable Tag Router. Reason: tagRouterRule is invalid or disabled ] Current Node Output: 172.18.111.187:20880,172.183.111. 20880
        [ ServiceStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Directly return. Reason: Invokers from previous router is empty or conditionRouters is empty. ] Current Node Output: 172.18.111.187:20880 ,172.18.111.183:20880
          [ AppStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Directly return. Reason: Invokers from previous router is empty or conditionRouters is empty. ] Current Node Output: 172.18.111.187:20880 ,172.18.111.183:20880

1658224330156 - Router snapshot service com.dubbo.dubbointegration.BackendService from registry 172.18.111.184 on the consumer 172.18.111.184 using the dubbo version 3.0.9 is below:
[ Parent (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) ] Input: 172.18.111.187:20880,172.18.111.183:20880 -> Chain Node Output: 172.18.111.187:20880.3172.18 :20880
  [ MockInvokersSelector (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: invocation.need.mock not set. Return normal Invokers. ] Current Node Output: 172.18.111.187:20880,172.183.111. :20880
    [ StandardMeshRuleRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: MeshRuleCache has not been built. Skip route. ] Current Node Output: 172.18.111.187:20880,172.1803:1121.88
      [ TagStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Disable Tag Router. Reason: tagRouterRule is invalid or disabled ] Current Node Output: 172.18.111.187:20880,172.183.111. 20880
        [ ServiceStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Directly return. Reason: Invokers from previous router is empty or conditionRouters is empty. ] Current Node Output: 172.18.111.187:20880 ,172.18.111.183:20880
          [ AppStateRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 2) Router message: Directly return. Reason: Invokers from previous router is empty or conditionRouters is empty. ] Current Node Output: 172.18.111.187:20880 ,172.18.111.183:20880

···

dubbo>
```