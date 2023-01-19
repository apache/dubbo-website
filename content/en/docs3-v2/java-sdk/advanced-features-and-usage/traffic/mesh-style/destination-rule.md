---
type: docs
title: "DestinationRule"
linkTitle: "DestinationRule"
weight: 40
description: "Destination address rule"
---


### DestinationRule
`DestinationRule` is used to process the rules of the target address, and `ServiceEntry`, `WorkloadEntry` and other definitions related to `DestinationRule` are consistent with open source
+ Example of use

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
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | The name of the rule, easy to identify the purpose of the rule | YES |
| host | string | The corresponding key value in the registry, now it is the interface name | YES |
| trafficPolicy | TrafficPolicy | traffic policy | NO |
| subsets | Subset[] | naming of single or multiple versions of the service | YES |

### Subset
The name of the `Subset` application service, which can be single or multiple versions
+ Example of use

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
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | service version name | YES |
| labels | map<string, string> | labels on the service | YES |

### TrafficPolicy
`TrafficPolicy` represents the load balancing policy
+ Example of use

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo-route
spec:
  trafficPolicy: #TrafficPolicy
    loadBalancer:
```
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| loadBalancer | LoadBalancerSettings | Load Balancer Settings | YES |

### LoadBalancerSettings
`LoadBalancerSettings` is used to represent the configuration related to load balancing
+ Example of use

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
+ property description

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| simple | string | load balancing strategy, including: `ROUND_ROBIN`, `LEAST_CONN`, `RANDOM`, `PASSTHROUGH` | YES |
| consistentHash | ConsistentHashLB | Consistent Hash strategy (not implemented) NO
| NO |