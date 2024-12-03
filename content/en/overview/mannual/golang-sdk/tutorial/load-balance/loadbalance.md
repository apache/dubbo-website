---
description: "The load balancing strategies supported by Dubbo for the consumer side and how to use them."
linkTitle: Load Balancing
title: Load Balancing Strategies and Configuration Details
type: docs
weight: 1
---

Dubbo-go has a built-in client-based load balancing mechanism. Below are the currently supported load balancing algorithms. Combined with the automatic service discovery mechanism mentioned above, the consumer side will automatically use the `Weighted Random LoadBalance` strategy for invocation.

If you want to adjust the load balancing algorithm, here are the built-in load balancing strategies in the Dubbo framework:

| Algorithm                    | Features               | Remarks                                         | Configuration Value                          |
| :--------------------------- | :--------------------- | :---------------------------------------------- | :------------------------------------------ |
| Weighted Random LoadBalance   | Weighted Random         | Default algorithm, same default weight         | random (default)                            |
| RoundRobin LoadBalance        | Weighted Round Robin    | Inspired by Nginx's smooth weighted round robin algorithm, same default weight | roundrobin                                  |
| LeastActive LoadBalance      | Least Active First + Weighted Random | Based on the idea that those who can do more should work more | leastactive                                  |
| Consistent Hash LoadBalance   | Consistent Hash        | Deterministic input, deterministic providers, suitable for stateful requests | consistenthashing                           |
| P2C LoadBalance              | Power of Two Choices    | Randomly selects two nodes and continues to select the one with fewer "connections." | p2c                                         |
| Interleaved Weighted Round Robin | A weighted round robin algorithm | https://en.wikipedia.org/wiki/Weighted_round_robin#Interleaved_WRR | interleavedweightedroundrobin              |
| Alias Method Round Robin     |                         | https://en.wikipedia.org/wiki/Alias_method     | aliasmethod                                 |

## Global Configuration
The default strategy of the Dubbo framework is `random` weighted random load balancing. To adjust the strategy, simply set the corresponding value for `loadbalance`. Refer to the table at the top of the document for different load balancing strategy values.

Specify global configuration for all service calls:

```go
cli, err := client.NewClient(
	client.WithClientLoadBalance("roundrobin"),
)
```

Or some commonly used strategies:

```go
cli, err := client.NewClient(
	client.WithClientLoadBalanceRoundRobin(),
)
```

## Interface Level Configuration
```go
cli, err := client.NewClient(
	//...
)

svc, err := greet.NewGreetService(cli, client.WithLoadBalance("roundrobin"))
```

Or some commonly used strategies:

```go
cli, err := client.NewClient(
	//...
)

svc, err := greet.NewGreetService(cli, client.WithLoadBalanceRoundRobin())
```

