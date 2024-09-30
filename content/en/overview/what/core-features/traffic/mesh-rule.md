---
type: docs
title: "Mesh Routing Rules"
linkTitle: "Mesh Routing"
weight: 50
description: ""
---

Dubbo Mesh routing rules are based on Istio's VirtualService and DestinationRule modifications. The overall idea and format can refer to Istio's traffic control rules reference manual: [Istio VirtualService](https://istio.io/latest/docs/reference/config/networking/virtual-service/) and [Istio DestinationRule](https://istio.io/latest/docs/reference/config/networking/destination-rule/)

This article describes the design principles of Dubbo Mesh routing rules, as well as the differences between them and Istio rules. Reference link: https://www.yuque.com/docs/share/c132d5db-0dcb-487f-8833-7c7732964bd4?#.

### Basic Idea
Based on the routing chain, the Pipeline processing method is adopted, as shown in the figure below:

![route-rule1.png](/imgs/user/route-rule1.png)

The logic of the routing chain can be simply understood as target = rn(...r3(r2(r1(src)))). For the internal logic of each router, it can be abstracted as the input address addrs-in and the n mutually exclusive address pools addrs-pool-1 ... addrs-pool-n that are split according to the full address addrs-all in the router. The intersection is taken as the output addrs-out according to the rules defined by the implementation. By analogy, the calculation of the entire routing chain is completed.

![route-rule2.png](/imgs/user/route-rule2.png)

On the other hand, if router(n) needs to execute fallback logic, then after passing through router(n), the fallback logic should be determined.

### Fallback Handling Principles

Due to multiple conditional components between multiple routers, it is easy for the address to be filtered out. In this case, we need to perform fallback handling to ensure that the business can smoothly find a valid address under the premise of correctness.

First, let's look at the following rule

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo-route
spec:
  hosts:
  - demo
  dubbo:
  - service:
    - exact: com.taobao.hsf.demoService:1.0.0
    - exact: com.taobao.hsf.demoService:2.0.0
    routedetail:
    - name: sayHello-String-method-route
      match:
      - method:
          name_match:
            exact: "sayHello"
            .....
          argp:
          - string
      route:
      - destination:
          host: demo
          subset: v1
        fallback:
          destination:
            host: demo
            subset: v2
          fallback:
            destination:
              host: demo
              subset: v3

      - name: sayHello-method-route
        match:
        - method:
            name_match:
              exact: "s-method"
        route:
        - destination:
            host: demo
            subset: v2
          fallback:
            destination:
              host: demo
              subset: v3

      - name: interface-route
        route:
        - destination:
          host: demo
          subset: v3

  - service:

      ....
---
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo-route
spec:
  host: demo
  subsets:
  - name: v1
    labels:
      sigma.ali/mg: v1-host

  - name: v2
    labels:
      sigma.ali/mg: v2-host

  - name: v3
    labels:
      sigma.ali/mg: v3-host

```

Taking script routing as an example, the matching condition of this script routing follows a principle, which is that the matching range is a process from precise to broad. In this example, it is a matching search process from the sayHello(string) parameter -> sayHello method -> interface-level routing.

So if we have met a certain condition but the selected subset address is empty, how do we perform fallback handling?

Taking the matching sayHello(string) parameter condition as an example, we select the v1 subset. If it is empty, we can look for the address at the next level, which is to look for the address at the method level. The specific configuration is as follows

```yaml
       - name: sayHello-String-method-route
         match:
          - method:
             name_match:
               exact: "sayHello"
               .....
             argp:
              - string
         route:
          - destination:
              host: demo
              subset: v1
            fallback:
              destination:
                host: demo
                subset: v2
              fallback:
                destination:
                  host: demo
                  subset: v3
```

At this time, the address we selected is the v2 method-level address. If v2 still has no address, according to the definition of the rule, we can fallback to the v3 interface level.

Suppose we have a method match, if there is no address, we need not to perform fallback and directly report an error. We can configure it like this

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo-route
spec:
  hosts:
  - demo
  dubbo:
  - service:
    - exact: com.taobao.hsf.demoService:1.0.0
    - exact: com.taobao.hsf.demoService:2.0.0
    routedetail:
      - name: sayHello-String-method-route
        match:
        - method:
            name_match:
              exact: "sayHello"
              .....
            argp:
            - string
        route:
        - destination:
            host: demo
            subset: v1
          fallback:
            destination:
              host: demo
              subset: v2
            fallback:
              destination:
                host: demo
                subset: v3

      - name: sayHello-method-route
        match:
        - method:
            name_match:
              exact: "s-method"
        route:
        - destination:
            host: demo
            subset: v2
          fallback:
            destination:
              host: demo
              subset: v3
      - name: some-method-route
        match:
        - method:
            name_match:
              exact: "some-method"
        route:
        - destination:
            host: demo
            subset: v4

      - name: interface-route
        route:
        - destination:
          host: demo
          subset: v3

  - service:

      ....
---
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo-route
spec:
  host: demo
  subsets:
  - name: v1
    labels:
      sigma.ali/mg: v1-host

  - name: v2
    labels:
      sigma.ali/mg: v2-host

  - name: v3
    labels:
      sigma.ali/mg: v3-host
```

From this rule, we can see that when matching the some-method condition, the corresponding v4 subset is selected. When v4 is empty, because there is no fallback configured, an error will be reported directly.

#### Summary of Fallback Handling Principles

- We should configure the fallback handling logic of the Destination in the VirtualService route.
- When falling back to a subset, if the corresponding subset is also configured with a fallback subset, it should also be handled recursively; the relationship between fallback subsets should also be from specific to broad.
- When writing matching conditions, we should follow the principle of from specific conditions to broad conditions.

### RouteChain Assembly Mode (Not yet implemented)

![route-rule3.png](/imgs/user/route-rule3.png)

As we can see in the above figure, in the routing process, we use the Pipeline processing method. The Router nodes in the Pipeline are sequential, and each Router has a unique corresponding VirtualService and **multiple** corresponding DestinationRules for description.

Taking the routing rule configuration stored in Nacos as an example, the configuration format is as follows:

```yaml
DataId: Demo.rule.yaml
GROUP: HSF

content:

VirtualService A
---
DestinationRule A1
---
DestinationRule A2
---
VirtualService B
---
DestinationRule B
---
VirtualService C
---
DestinationRule C
---
...
```

`VirtualService A` and `DestinationRule A1`, `DestinationRule A2` form a Router A, `VirtualService B` and `DestinationRule B` form Router B, and so on, completing the assembly of the entire router chain.

### Example: Proportional Traffic Routing Rules

> Note, although the following rules are very similar to Istio's VirtualService and DestinationRule, there are some differences in the working process and specific rules compared to Istio. Dubbo only references Istio's design. If you want to integrate with the native Istio service mesh governance system, please refer to Integrating Service Mesh Traffic Governance.

In some scenarios, we need to distribute traffic with the same attributes proportionally to different instance groups. A typical example scenario is A/B testing, where we need to forward 20% of the traffic to the new version v2 of the service to verify the stability of the new version, or to direct a portion of internal company users to the new version v2 for testing and verification. Another application scenario is to achieve canary releases of services, gradually adjusting the traffic distribution ratio so that the new version's traffic gradually increases and eventually fully migrates all traffic to the new version.

#### Example of Proportional Traffic Rules

The following example will proportionally forward all requests to the `getDetail` method of the service `org.apache.dubbo.demo.DetailService`.

```yaml
...
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: details
spec:
  dubbo:
   - name: detail-service-traffic-split
     match:
      - name:
        services:
         - exact: "org.apache.dubbo.demo.DetailService"
        method:
         name_match:
          exact: "getDetail"
     route:
      - destination:
         subset: details-v1
        weight: 60
      - destination:
         subset: details-v2
        weight: 40
---
...
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: reviews-route
spec:
  subsets:
    - name: details-v1
      labels:
        detail_version: v1 # 'version' is a reserved key in Dubbo, so must not be used.
    - name: details-v2
      labels:
        detail_version: v2 # 'version' is a reserved key in Dubbo, so must not be used.
---
```

##### Dubbo VirtualService

> This part can fully refer to the semantics of Istio VirtualService, as they are almost identical. Dubbo adds the `dubbo` protocol label (corresponding to the http protocol position) and enriches the `match` conditions.

The `match` condition sets the traffic rule to be effective only for requests to the `getDetail` method of the service "org.apache.dubbo.demo.DetailService".

```yaml
match:
  - name:
    services:
     - exact: "org.apache.dubbo.demo.DetailService"
    method:
     name_match:
      exact: "getDetail"
```

The following `route` specifies the target instance subsets for the matched traffic. The instance subsets `details-v1` and `details-v2` are defined through the DestinationRule below. For unmatched traffic, it can access any instance by default without any filtering.

```yaml
route:
  - destination:
     subset: details-v1
    weight: 60
  - destination:
     subset: details-v2
    weight: 40
```

##### Dubbo DestinationRule

> This part can fully refer to the semantics of Istio DestinationRule, as they are identical.

The following rule divides the application details into two deployment versions `v1` and `v2` by matching the `detail_version` value, named `details-v1` and `details-v2` respectively. At the same time, `details-v1` and `details-v2` will become the traffic forwarding target objects of Dubbo VirtualService.

```yaml
subsets:
 - name: details-v1
   labels:
     detail_version: v1 # 'version' is a reserved key in Dubbo, so must not be used.
 - name: details-v2
   labels:
     detail_version: v2 # 'version' is a reserved key in Dubbo, so must not be used.
```

> Similar to label routing, this involves how to label your instances (here it is `detail_version`). Please refer to the section How to Label Instances below.

In addition to the functions introduced above that are very similar to Istio's traffic rules, Dubbo's VirtualService and DestinationRule can also achieve things that Istio rules cannot, such as method parameter routing. For details, see the [Reference Manual]().
