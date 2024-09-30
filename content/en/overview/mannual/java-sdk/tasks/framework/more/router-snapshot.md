---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/router-snapshot/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/router-snapshot/
description: Route Status Collection
linkTitle: Route Status Collection
title: Route Status Collection
type: docs
weight: 50
---





## Function Description
The route status collection feature can be used to identify any potential issues that may affect service performance, to identify any potential bottlenecks or problems that may hinder the efficient use of services, ensuring smooth operation of services, and that users do not encounter any issues when trying to access services. It allows users to check whether the route is enabled or disabled, ensuring that only authorized services are used and access is limited to authorized personnel.

## Use Cases

Many flow governance capabilities of Dubbo are implemented based on the Router. In production environments, if traffic results do not meet expectations, the route status command can be used to check the status of the routes to locate potential issues.

## Usage

### View Route Cache Status

When Dubbo receives address changes, it pushes address information to all `Router`s. These `Router`s can calculate the route groups in advance during this phase, caching them to avoid traversing all providers to calculate grouping parameters at the time of invocation.
The `StateRouter` introduced in Dubbo 3 provides the ability to retrieve the status of each route in real time through the qos command tool.

Operations personnel can obtain the status of the route via the `getRouterSnapshot` command. For specific command usage, please refer to the [getRouterSnapshot command](/en/overview/mannual/java-sdk/reference-manual/qos/qos-list/) documentation.

**Note: This feature only supports `StateRoute`, and `StateRouter` needs to implement the `doBuildSnapshot` interface based on `AbstractStateRouter`.**

### View Actual Request Route Calculation Results

In Dubbo 3, the route calculation node status is printed by default when the route filtering result is empty. Operations personnel can determine whether the calculation results for each route meet expectations through logs.

#### Log Format

```
No provider available after route for the service Service from registry Registry Address on the consumer Consumer IP using the dubbo version 3.0.7. Router snapshot is below: 
[ Parent (Input: Current Node Input Address Count) (Current Node Output: Current Node Calculation Result Count) (Chain Node Output: Current Node and Subsequent Nodes Intersection Result Count) ] Input: Input Address Example (showing up to 5) -> Chain Node Output: Current Node Output Address Example (showing up to 5)
  [ Route Name (Input: Current Node Input Address Count) (Current Node Output: Current Node Calculation Result Count) (Chain Node Output: Current Node and Subsequent Nodes Intersection Result Count) Router message: Route Log ] Current Node Output: Current Node Output Address Example (showing up to 5)
    [ Route Name (Input: Current Node Input Address Count) (Current Node Output: Current Node Calculation Result Count) (Chain Node Output: Current Node and Subsequent Nodes Intersection Result Count) Router message: Route Log ] Current Node Output: Current Input Address Example (showing up to 5)
```

#### Note:
- Route logs rely on the route implementation to judge the `needToPrintMessage` parameter and write to `messageHolder` route logs when necessary.
- Due to the results of multi-level routing being intersections, the current node calculation result count may be empty after the subsequent filter.

#### Log Example

```
[19/07/22 07:42:46:046 CST] main  WARN cluster.RouterChain:  [DUBBO] No provider available after route for the service org.apache.dubbo.samples.governance.api.DemoService from registry 30.227.64.173 on the consumer 30.227.64.173 using the dubbo version 3.0.7. Router snapshot is below: 
[ Parent (Input: 2) (Current Node Output: 2) (Chain Node Output: 0) ] Input: 30.227.64.173:20881,30.227.64.173:20880 -> Chain Node Output: Empty
  [ MockInvokersSelector (Input: 2) (Current Node Output: 2) (Chain Node Output: 0) Router message: invocation.need.mock not set. Return normal Invokers. ] Current Node Output: 30.227.64.173:20881,30.227.64.173:20880
    [ StandardMeshRuleRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 0) Router message: MeshRuleCache has not been built. Skip route. ] Current Node Output: 30.227.64.173:20881,30.227.64.173:20880
      [ TagStateRouter (Input: 2) (Current Node Output: 0) (Chain Node Output: 0) Router message: FAILOVER: return all Providers without any tags ] Current Node Output: Empty, dubbo version: 3.0.7, current host: 30.227.64.173
```

#### Open Full Route Sampling

In some special cases, requests may call an incorrect server, but since the selection is not empty, the routing process information cannot be viewed. In this case, you can [enable full route sampling through qos](/en/overview/mannual/java-sdk/reference-manual/qos/router-snapshot/). The `getRecentRouterSnapshot` command of qos can be used to remotely obtain the most recent route snapshots.

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

#### Note:
For cases where logs are empty due to incompatibility with the logging framework, you can refer to [Log Framework Adaptation and Runtime Management](../../others/logger-management/) to dynamically modify the log output framework.

