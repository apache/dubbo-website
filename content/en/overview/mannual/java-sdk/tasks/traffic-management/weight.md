---
aliases:
    - /en/overview/tasks/traffic-management/weight/
    - /en/overview/tasks/traffic-management/weight/
description: ""
linkTitle: Weight Ratio
title: Proportional Traffic Forwarding Based on Weight Values
type: docs
weight: 7
---



Dubbo provides a weight-based load balancing algorithm that allows for proportional traffic distribution: machines with higher weight receive more request traffic, while those with lower weight receive relatively less.

Based on a weight-based traffic scheduling algorithm, dynamically adjusting the weight of a single machine or a group of machines via rules can change the distribution of request traffic at runtime, enabling dynamic proportional traffic routing, which is useful for several typical scenarios.
* When a certain group of machines is overloaded, dynamically reducing the weight can effectively reduce incoming new requests, improving overall success rates while giving overburdened machines a breather.
* For newly launched versions of a service, initially assigning a low weight to control a small proportion of traffic, waiting for stable operation verification before restoring to normal weight and completely replacing the old version.
* During multi-region or non-peer deployments, controlling traffic ratios for different deployment areas through high and low weight settings.

## Before You Begin

* Deploy Shop Mall Project
* Deploy and open [Dubbo Admin](../.././../reference/admin/architecture/)

## Task Details

In the example project, we have released Order Service version 2 and optimized the ordering experience: after users create an order, the delivery address information is displayed.

![weight2.png](/imgs/v3/tasks/weight/weight2.png)

Now, if you try to place orders frantically (by continuously clicking "Buy Now"), you'll find that both v1 and v2 appear with an overall probability of 50%, indicating that both currently have the same default weight. However, to ensure the overall stability of the mall system, we will control and guide 20% of traffic to version v2, while 80% of traffic will still access version v1.

![weight1.png](/imgs/v3/tasks/weight/weight1.png)

### Implement Traffic Distribution of 80% v1 and 20% v2 in Order Service
Before adjusting weights, we need to know that the weight of Dubbo instances is absolute, with each instance's default weight being 100. For example, if a service is deployed with two instances: Instance A has a weight of 100, and Instance B has a weight of 200, the traffic distribution between A and B will be 1:2.

Next, we will begin adjusting the traffic ratio for the Order Service to access v1 and v2. The order creation service is provided by the `org.apache.dubbo.samples.OrderService` interface; we will then dynamically adjust the weight of the new version `OrderService` instances through rules.

#### Steps to Operate
1. Open the Dubbo Admin console.
2. In the left navigation bar, select [Service Governance] > [Dynamic Configuration].
3. Click "Create," enter the `org.apache.dubbo.samples.OrderService`, the target instance matching conditions, and the weight value.

![Admin Weight Ratio Setting Screenshot](/imgs/v3/tasks/weight/weight_admin.png)

Click "Buy Now" frantically again to try to create orders multiple times; now there's only about a 20% chance of seeing the version v2 order details.

After confirming that the v2 version of the Order Service operates stably, further increase the weight of v2 until all old version services are replaced by the new version, thus completing a stable service version upgrade.

#### Rule Details

**Rule Key**: `org.apache.dubbo.samples.UserService`

**Rule Body**

```yaml
configVersion: v3.0
scope: service
key: org.apache.dubbo.samples.OrderService
configs:
  - side: provider
    match:
      param:
        - key: orderVersion
          value:
            exact: v2
    parameters:
      weight: 25
```

The following matching condition indicates that the weight rule applies to all instances tagged with `orderVersion=v2` (all v2 versions of the Order service have this tag).

```yaml
match:
  param:
    - key: orderVersion
      value:
        exact: v2
```

`weight: 25` is because the default weight of the v1 version is `100`, thus changing the traffic received by v2 and v1 to a ratio of 25:100, which is 1:4.

```yaml
parameters:
  weight: 25
```

## Cleanup
To avoid affecting other tasks, delete or disable the just configured weight rules through Admin.

## Other Matters
`weight=0`

