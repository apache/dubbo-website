---
type: docs
title: "Routing Status Collection"
linkTitle: "Routing Status Collection"
weight: 2
description: "routing status collection"
---
## Function Description
## scenes to be used

Many of Dubbo's traffic management capabilities are implemented based on Router. In a production environment, if traffic results do not meet expectations, you can use the routing status command to check the routing status to locate possible problems.

## How to use

### View route cache status

When Dubbo receives the address change, it will push the address information to all `Routers`, and these `Routers` can calculate the routing packets in advance at this stage and cache them to avoid the need to traverse all provider calculations when calling grouping parameters.
The `StateRouter` introduced in Dubbo 3 provides the ability to obtain the status of each route in real time through the qos command tool.

The operation and maintenance personnel can obtain the status of the route through the `getRouterSnapshot` command. For specific commands, please refer to the [getRouterSnapshot command](../../../reference-manual/qos/router-snapshot/#getroutersnapshot-command) document.

**Note: This feature only supports `StateRoute`, and `StateRouter` needs to implement the `doBuildSnapshot` interface based on `AbstractStateRouter`. **

### View the route calculation result of the actual request

By default in Dubbo 3, the node status of route calculation is printed when the route filter is empty. Operation and maintenance personnel can judge whether the calculation result of each route meets expectations through logs.

#### Log format

```
No provider available after route for the service service from registry registration center address on the consumer consumer IP using the dubbo version 3.0.7. Router snapshot is below:
[ Parent (Input: Number of input addresses of the current node) (Current Node Output: Number of calculation results of the current node) (Chain Node Output: Number of intersection results of the current node and subsequent nodes) ] Input: Examples of input addresses (up to 5 are displayed) -> Chain Node Output: Example of addresses output by the current node (up to 5 are displayed)
  [Route name (Input: number of input addresses of the current node) (Current Node Output: number of calculation results of the current node) (Chain Node Output: number of intersection results of the current node and subsequent nodes) Router message: routing log] Current Node Output: current node Example of addresses output (up to 5 displayed)
    [routing name (Input: current node input address number) (Current Node Output: current node calculation result number) (Chain Node Output: current node and subsequent node intersection result number) Router message: routing log] Current Node Output: current input Examples of addresses for (show up to 5)
```

#### Notice:
- The routing log needs to rely on the routing implementation to judge the `needToPrintMessage` parameter, and write the `messageHolder` routing log when needed
- Since the result of multi-level routing is the intersection of the results, the calculation result of the current node may be empty after the intersection with the subsequent level

#### Log example

```
[19/07/22 07:42:46:046 CST] main WARN cluster.RouterChain: [DUBBO] No provider available after route for the service org.apache.dubbo.samples.governance.api.DemoService from registry 30.227.64.173 on the consumer 30.227.64.173 using the dubbo version 3.0.7. Router snapshot is below:
[ Parent (Input: 2) (Current Node Output: 2) (Chain Node Output: 0) ] Input: 30.227.64.173:20881,30.227.64.173:20880 -> Chain Node Output: Empty
  [ MockInvokersSelector (Input: 2) (Current Node Output: 2) (Chain Node Output: 0) Router message: invocation.need.mock not set. Return normal Invokers. ] Current Node Output: 30.227.64.173:20881,30.223.64.17 :20880
    [ StandardMeshRuleRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 0) Router message: MeshRuleCache has not been built. Skip route. ] Current Node Output: 30.227.64.173:20881,30.227.624.1803:
      [ TagStateRouter (Input: 2) (Current Node Output: 0) (Chain Node Output: 0) Router message: FAILOVER: return all Providers without any tags ] Current Node Output: Empty, dubbo version: 3.0.7, current host: 30.227 .64.173
```

#### Open route full sampling

In some special cases, the request may be called to the wrong server, but because the address selection is not empty, the process information of the route cannot be seen. At this time, you can [Enable full route sampling through qos](../../. ./reference-manual/qos/router-snapshot/). The latest routing snapshot can be obtained remotely through the `getRecentRouterSnapshot` command of qos.

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

#### Notice:
If the log is empty due to the mismatch of the log framework, you can refer to [Log Framework Adaptation and Runtime Management](../../others/logger-management/) to dynamically modify the log output framework.