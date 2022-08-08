---
type: docs
title: "路由状态采集"
linkTitle: "路由状态采集"
weight: 2
description: "路由状态采集"
---
## 功能说明
## 使用场景

Dubbo 的很多流量治理能力是基于 Router 进行实现的，在生产环境中，如果出现流量结果不符合预期的情况，可以通过路由状态命令来查看路由的状态，以此来定位可能存在的问题。

## 使用方式

### 查看路由缓存状态

Dubbo 在收到地址变更的时候，会将地址信息推送给所有的 `Router`，这些 `Router` 可以在此阶段提前计算路由的分组，缓存起来，以避免在调用时需要遍历所有的提供者计算分组参数。
在 Dubbo 3 中引入的 `StateRouter` 提供了通过 qos 命令工具实时获取每个路由的状态的能力。

运维人员可以通过 `getRouterSnapshot` 命令获取路由的状态。具体命令使用方式可以参考 [getRouterSnapshot 命令](../../..//reference-manual/qos/router-snapshot/#getroutersnapshot-%E5%91%BD%E4%BB%A4) 文档。

**注：此功能仅支持 `StateRoute`，且 `StateRouter` 需要基于 `AbstractStateRouter` 实现 `doBuildSnapshot` 接口。**

### 查看实际请求的路由计算结果

Dubbo 3 中默认在路由筛选后为空的时候打印路由计算的节点状态。运维人员可以通过日志判断每个路由的计算结果是否符合预期。

#### 日志格式

```
No provider available after route for the service 服务 from registry 注册中心地址 on the consumer 消费端IP using the dubbo version 3.0.7. Router snapshot is below: 
[ Parent (Input: 当前节点输入地址数) (Current Node Output: 当前节点计算结果数) (Chain Node Output: 当前节点和后级节点交集结果数) ] Input: 输入的地址示例（显示最多 5 个） -> Chain Node Output: 当前节点输出的地址示例（显示最多 5 个）
  [ 路由名称 (Input: 当前节点输入地址数) (Current Node Output: 当前节点计算结果数) (Chain Node Output: 当前节点和后级节点交集结果数) Router message: 路由日志 ] Current Node Output: 当前节点输出的地址示例（显示最多 5 个）
    [ 路由名称 (Input: 当前节点输入地址数) (Current Node Output: 当前节点计算结果数) (Chain Node Output: 当前节点和后级节点交集结果数) Router message: 路由日志 ] Current Node Output: 当前输入的地址示例（显示最多 5 个）
```

#### 注意：
- 路由日志需要依赖路由实现判断 `needToPrintMessage` 参数，并在需要时写入 `messageHolder` 路由日志
- 由于多级路由结果是结果取交集的，所以当前节点计算结果数可能和后级取交后为空

#### 日志示例

```
[19/07/22 07:42:46:046 CST] main  WARN cluster.RouterChain:  [DUBBO] No provider available after route for the service org.apache.dubbo.samples.governance.api.DemoService from registry 30.227.64.173 on the consumer 30.227.64.173 using the dubbo version 3.0.7. Router snapshot is below: 
[ Parent (Input: 2) (Current Node Output: 2) (Chain Node Output: 0) ] Input: 30.227.64.173:20881,30.227.64.173:20880 -> Chain Node Output: Empty
  [ MockInvokersSelector (Input: 2) (Current Node Output: 2) (Chain Node Output: 0) Router message: invocation.need.mock not set. Return normal Invokers. ] Current Node Output: 30.227.64.173:20881,30.227.64.173:20880
    [ StandardMeshRuleRouter (Input: 2) (Current Node Output: 2) (Chain Node Output: 0) Router message: MeshRuleCache has not been built. Skip route. ] Current Node Output: 30.227.64.173:20881,30.227.64.173:20880
      [ TagStateRouter (Input: 2) (Current Node Output: 0) (Chain Node Output: 0) Router message: FAILOVER: return all Providers without any tags ] Current Node Output: Empty, dubbo version: 3.0.7, current host: 30.227.64.173
```

#### 开启路由全采样

在一些特殊情况下，请求可能调用到错误的服务端，但是因为选址非空，所以无法看到路由的过程信息，此时可以 [通过 qos 开启路由全采样](../../..//reference-manual/qos/router-snapshot/)。通过 qos 的 `getRecentRouterSnapshot` 命令可以远程获取最近的路由快照。

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

#### 注意：
由于日志框架不匹配导致的日志为空可以参考[日志框架适配及运行时管理](../../others/logger-management/)动态修改日志输出框架。
