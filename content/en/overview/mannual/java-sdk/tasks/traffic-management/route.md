---
description: Spring Boot
linkTitle: Conditional Traffic Routing
title: Conditional Traffic Routing
type: docs
weight: 5
---

Routing is the core traffic control mechanism in Dubbo. Based on it, we can implement canary releases, proportional traffic forwarding, same-region prioritization, full-link grayscale, and other traffic strategies. The design and basic principles of the routing (Router) mechanism in Dubbo, along with several built-in routing rules.

## Common Traffic Control Scenarios
The built-in traffic strategies in Dubbo are very flexible, but there is also a certain understanding and usage cost. Therefore, we summarize some common usage scenarios and provide configuration methods:

| **Scenario** | **Effect** | **Target** | **Description** |
| --- | --- | --- | --- |
| Timeout |  |  |  |
| Access Log |  |  |  |
| Call Retry |  |  |  |

Next, let's take a conditional routing example to see how to use the Dubbo traffic control mechanism.
## A Conditional Routing Example
The requirements are very straightforward.

- Forward traffic matching this condition to this batch of machines
- Forward traffic matching another condition to another batch of machines

![Draw a diagram of traffic matching and forwarding]()

This is implemented in Dubbo through conditional routing, and its detailed working principle is explained in our introduction. In the above example, xxx represents; yyy represents.

We need to deploy the rules to the running Dubbo SDK. In the Dubbo system, this is done as follows.

![Routing Rule Distribution and Effect Principle Diagram]()

A zk/nacos distributes a rule, and the Dubbo instance receives the rule push. During the RPC call, rules are applied to filter, selecting a subset of addresses to call.

{{% alert title="Note" color="info" %}}
In the traditional Nacos/Zookeeper microservice deployment scheme, the routing rule configuration center stores and forwards to the Dubbo SDK. However, in Kubernetes Service or service mesh scenarios, the storage and push mechanisms for routing rules may change. For specifics, please refer to [Kubernetes Best Practices]().
{{% /alert %}}

At this point, if we send a request to the xxx service,

There is one very important point.

## More Content
- Routing rules not taking effect? [Dubbo Routing Rule Troubleshooting Methods]()
- Current routing rules not flexible enough to achieve the desired effect? Check out [Script Routing]() 
- You can also customize your traffic strategy by [Extending Dubbo's Routing Implementation]()

