---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/qos/router-snapshot/
    - /en/docs3-v2/java-sdk/reference-manual/qos/router-snapshot/
    - /en/overview/mannual/java-sdk/reference-manual/qos/router-snapshot/
description: Router Status Command
linkTitle: Router Status Command
title: Router Status Command
type: docs
weight: 8
---




Many traffic governance capabilities in Dubbo are implemented based on the Router. In production environments, if traffic results do not meet expectations, you can use the router status command to check the router's status to locate potential issues.

> [Router Status Collection](../../../advanced-features-and-usage/performance/router-snapshot/)

### getRouterSnapshot Command

Retrieve the grouping status of each layer of the router. (Only supports StateRouter)

Command: `getRouterSnapshot {serviceName}`

`serviceName` is the name of the service to collect, supports matching.

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

### enableRouterSnapshot Command

Enable router result collection mode.

Command: `enableRouterSnapshot {serviceName}`

`serviceName` is the name of the service to collect, supports matching.

```
dubbo>enableRouterSnapshot com.dubbo.*
OK. Found service count: 1. This will cause performance degradation, please be careful!

dubbo>
```

### disableRouterSnapshot Command

Disable router result collection mode.

Command: `disableRouterSnapshot {serviceName}`

`serviceName` is the name of the service to collect, supports matching.

```
dubbo>disableRouterSnapshot com.dubbo.*
OK. Found service count: 1

dubbo>
```

### getEnabledRouterSnapshot Command

Get the services that have collection enabled.

```
dubbo>getEnabledRouterSnapshot
com.dubbo.dubbointegration.BackendService

dubbo>
```

### getRecentRouterSnapshot Command

Obtain historical router status through the qos command. (Stores up to 32 results)

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

