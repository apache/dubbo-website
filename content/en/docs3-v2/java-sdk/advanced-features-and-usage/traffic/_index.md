---
type: docs
title: "Traffic Governance Rules"
linkTitle: "Traffic Governance"
weight: 2
no_list: true
hide_summary: true
---



### Traffic Management

The essence of traffic management is to distribute requests to application services according to established routing rules, as shown in the following figure:

![What is traffic control](/imgs/v3/concepts/what-is-traffic-control.png)

in:
+ There can be multiple routing rules, and different routing rules have priorities. Such as: Router(1) -> Router(2) -> ... -> Router(n)
+ A routing rule can route to multiple different application services. For example: Router(2) can route to Service(1) or Service(2)
+ Multiple different routing rules can route to the same application service. For example: both Router(1) and Router(2) can route to Service(2)
+ Routing rules can also not route to any application service. For example: Router(m) is not routed to any Service, all requests hitting Router(m) will cause errors because there is no corresponding application service processing
+ Application service can be a single instance or an application cluster.

### Dubbo Mesh format traffic management introduction

Dubbo provides a traffic management strategy that supports the mesh method, which can easily implement [A/B testing](./mesh-style/ab-testing-deployment/), [canary release](./mesh-style/canary -deployment/), [blue-green deployment](./mesh-style/blue-green-deployment/) and other capabilities.

Dubbo divides the entire traffic management into two parts: [VirtualService](./mesh-style/virtualservice/) and [DestinationRule](./mesh-style/destination-rule/). When Consumer receives a request, it will follow [DubboRoute](./mesh-style/virtualservice/#dubboroute) and [DubboRouteDetail](./mesh- style/virtualservice/#dubboroutedetail) is matched to the corresponding subnet in [DubboDestination](./mesh-style/virtualservice/#dubbodestination), and finally according to the configuration in [DestinationRule](./mesh-style/destination-rule/) The labels in [subnet](./mesh-style/destination-rule/#subset) information find the corresponding Provider cluster that needs specific routing. in:

+ [VirtualService](./mesh-style/virtualservice/) mainly deals with rules for inbound traffic diversion, and supports service-level and method-level diversion.
+ [DubboRoute](./mesh-style/virtualservice/#dubboroute) mainly solves the problem of service level shunting. At the same time, it also provides retry mechanism, timeout, fault injection, mirroring traffic and other capabilities.
+ [DubboRouteDetail](./mesh-style/virtualservice/#dubboroutedetail) mainly solves the method-level shunt problem in a service. Supports shunting capabilities in various dimensions such as method name, method parameters, number of parameters, parameter types, headers, etc. At the same time, it also supports method-level retry mechanism, timeout, fault injection, mirroring traffic and other capabilities.
+ [DubboDestination](./mesh-style/virtualservice/#dubbodestination) is used to describe the destination address of routing traffic, and supports host, port, subnet and other methods.
+ [DestinationRule](./mesh-style/destination-rule/) mainly deals with destination address rules, which can be associated with Provider clusters through hosts, subnet, etc. At the same time, load balancing can be achieved through [trafficPolicy](./mesh-style/destination-rule/#trafficpolicy).

This design concept solves the coupling problem between traffic diversion and destination address very well. Not only simplifies the configuration rules to effectively avoid the problem of configuration redundancy, but also supports any combination of [VirtualService](./mesh-style/virtualservice/) and [DestinationRule](./mesh-style/destination-rule/), It can flexibly support various business usage scenarios.