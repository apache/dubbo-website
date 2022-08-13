---
type: docs
title: "DestinationRule"
linkTitle: "DestinationRule"
weight: 40
description: "目标地址规则"
---


#### DestinationRule
`DestinationRule`用来处理目标地址的规则，与`DestinationRule`相关的`ServiceEntry`, `WorkloadEntry`等定义与开源保持一致
+ 使用示例

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo-route
spec:
  host: demo
  subsets:
  trafficPolicy:
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | 规则的名字，方便识别规则用意 | YES |
| host | string | 注册中心里面对应的key值，现在是接口名 | YES |
| trafficPolicy | TrafficPolicy | 流量策略 | NO |
| subsets | Subset[] | 服务的单一版本或多版本的命名 | YES |

#### Subset
`Subset`应用服务的命名，可以是单个也可以是多个版本
+ 使用示例

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo-route
spec:
  subsets: #Subnet[]
  - name:
    labels:
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | 服务版本名称 | YES |
| labels | map<string, string> | 打在服务身上的标签 | YES |

#### TrafficPolicy
`TrafficPolicy`表示负载均衡策略
+ 使用示例

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo-route
spec:
  trafficPolicy: #TrafficPolicy
    loadBalancer:
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| loadBalancer | LoadBalancerSettings | 负载均衡设置 | YES |

#### LoadBalancerSettings
`LoadBalancerSettings`用来表示负载均衡相关的配置
+ 使用示例

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo-route
spec:
  trafficPolicy: 
    loadBalancer: #LoadBalancerSettings
      simple:
      consistentHash:
```
+ 属性说明

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| simple | string | 负载均衡策略，其中包括：`ROUND_ROBIN`, `LEAST_CONN`, `RANDOM`, `PASSTHROUGH` | YES |
| consistentHash | ConsistentHashLB | 一致性Hash策略(未实现)	NO
 | NO |