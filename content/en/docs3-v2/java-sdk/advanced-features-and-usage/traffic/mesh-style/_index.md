---
type: docs
title: "Mesh Routing Rules"
linkTitle: "Mesh Routing Rules"
weight: 40
description: "Dubbo supports Mesh routing types and cooperation methods"
---

### Basic idea
Based on the routing chain, the Pipeline processing method is adopted, as shown in the following figure:

![route-rule1.png](/imgs/user/route-rule1.png)


The logic of the routing chain can be simply understood as target = rn(...r3(r2(r1(src)))). For the internal logic of each router, it can be abstracted as n disjoint address pools addrs-pool-1 ... addrs-pool- n According to the implementation-defined rules, the intersection is taken as the output addrs-out. By analogy, the calculation of the entire routing chain is completed.

![route-rule2.png](/imgs/user/route-rule2.png)

On the other hand, if router(n) needs to execute fallback logic, then the fallback logic should be determined after router(n)


### fallback processing principle

After multiple conditional components between multiple routers, it is easy for the address to be filtered to be empty, so we need to perform fallback processing for this situation to ensure that the business can successfully find a valid address under the premise of correctness.

First we look at the following rules

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo-route
spec:
  hosts:
  - demo // Uniformly defined as the application name
  dubbo:
  - service:
    - exact: com.taobao.hsf.demoService:1.0.0
    - exact: com.taobao.hsf.demoService:2.0.0
    route details:
    - name: sayHello-String-method-route
      match:
      -method:
          name_match:
            exact: "sayHello"
            .....
          argp:
          - string
      route:
      -destination:
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
        -method:
            name_match:
              exact: "s-method"
        route:
        -destination:
            host: demo
            subset: v2
          fallback:
            destination:
              host: demo
              subset: v3

      - name: interface-route
        route:
        -destination:
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
      sigma.ali/mg:v3-host

```

Let's take script routing as an example. The matching conditions of this script routing follow a principle, that is, the matching range is a process from precise to broad. In this example, it is sayHello(string) parameter -> sayHello method -> A matching lookup process for interface-level routing.

So if we have met a certain condition, but the selected subset address is empty, how will we perform fallback processing?

Take the condition of matching sayHello(string) parameters as an example. We selected the v1 subset. If it is empty, we can go up to the next level to find the address, that is, to find the address at the method level. The specific configuration is as follows

```yaml
       - name: sayHello-String-method-route
         match:
          -method:
             name_match:
               exact: "sayHello"
               .....
             argp:
              - string
         route:
          -destination:
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

At this time, the address we selected is the v2 method-level address. If v2 still has no address, according to the definition of the rules, we can fallback to the v3 interface level.

Suppose we have a method matching, if there is no address, we need to report an error directly without fallback, we can configure it like this


```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo-route
spec:
  hosts:
  - demo // Uniformly defined as the application name
  dubbo:
  - service:
    - exact: com.taobao.hsf.demoService:1.0.0
    - exact: com.taobao.hsf.demoService:2.0.0
    route details:
      - name: sayHello-String-method-route
        match:
        -method:
            name_match:
              exact: "sayHello"
              .....
            argp:
            - string
        route:
        -destination:
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
        -method:
            name_match:
              exact: "s-method"
        route:
        -destination:
            host: demo
            subset: v2
          fallback:
            destination:
              host: demo
              subset: v3
      - name: some-method-route
        match:
        -method:
            name_match:
              exact: "some-method"
        route:
        -destination:
            host: demo
            subset: v4
            
      - name: interface-route
        route:
        -destination:
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
      sigma.ali/mg:v3-host
```

From this rule, we can see that when the some-method condition is matched, it corresponds to the v4 subset, then when v4 is empty, because no fallback is configured, an error will be reported directly at this time

#### Summary of fallback processing principles

- We should configure the fallback processing logic of Destination in the VirtualService route
- In fallback subset, if the corresponding subset is also configured with fallback subset, it should also be processed recursively; the relationship between fallback subsets should also be from specific to broad
- When we write matching conditions, we should follow the principle of moving from specific conditions to broad conditions

### Assembly mode of RouteChain (currently not implemented)

![route-rule3.png](/imgs/user/route-rule3.png)


We see the above figure, in the routing process, we are the processing method of Pipeline, the Router nodes of Pipeline exist in order, and each Router has a unique corresponding VirtualService and **multiple** corresponding DestinationRules for description .

Take the routing rule configuration stored on Nacos as an example, the format of the configuration is as follows:

```yaml
DataId: Demo.rule.yaml
GROUP: HSF

content:

Virtual Service A
---
DestinationRule A1
---
DestinationRule A2
---
Virtual Service B
---
DestinationRule B
---
VirtualServiceC
---
DestinationRule C
---
...
```

`VirtualService A` and `DestinationRule A1`, `DestinationRule A2` form a Router A, `VirtualService B` and `DestinationRule B` form a Router B, and so on to complete the assembly of the entire router chain.