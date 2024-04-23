---
description: "Dubbo 支持的消费端负载均衡策略及其使用方法。"
linkTitle: 负载均衡
title: 负载均衡策略与配置细节
type: docs
weight: 1
---

Dubbo-go 内置了 client-based 负载均衡机制，如下是当前支持的负载均衡算法，结合上文提到的自动服务发现机制，消费端会自动使用 `Weighted Random LoadBalance 加权随机负载均衡策略` 选址调用。

如果要调整负载均衡算法，以下是 Dubbo 框架内置的负载均衡策略：

| 算法                        | 特性                    | 备注                                            | 配置值                                             |
| :-------------------------- | :---------------------- | :---------------------------------------------- | :---------------------------------------------- |
| Weighted Random LoadBalance           | 加权随机                | 默认算法，默认权重相同              | random (默认) |
| RoundRobin LoadBalance       | 加权轮询                | 借鉴于 Nginx 的平滑加权轮询算法，默认权重相同 | roundrobin |
| LeastActive LoadBalance      | 最少活跃优先 + 加权随机 | 背后是能者多劳的思想                           | leastactive |
| Consistent Hash LoadBalance   | 一致性哈希             | 确定的入参，确定的提供者，适用于有状态请求        | consistenthashing |
| P2C LoadBalance   | Power of Two Choice    | 随机选择两个节点后，继续选择“连接数”较小的那个节点。         | p2c |
| Interleaved Weighted Round Robin   |  一种加权轮训算法   | https://en.wikipedia.org/wiki/Weighted_round_robin#Interleaved_WRR         | interleavedweightedroundrobin |
| Alias Method Round Robin   |        | https://en.wikipedia.org/wiki/Alias_method         | aliasmethod |

## 全局配置
Dubbo 框架的默认策略是 `random` 加权随机负载均衡。如果要调整策略，只需要设置 `loadbalance` 相应取值即可，每种负载均衡策略取值请参见文档最上方表格。

为所有服务调用指定全局配置：

```go
cli, err := client.NewClient(
	client.WithClientLoadBalance("roundrobin"),
)
```

或者一些常用的策略：

```go
cli, err := client.NewClient(
	client.WithClientLoadBalanceRoundRobin(),
)
```

## 接口级配置
```go
cli, err := client.NewClient(
	//...
)

svc, err := greet.NewGreetService(cli, client.WithLoadBalance("roundrobin"))
```

或者一些常用的策略：

```go
cli, err := client.NewClient(
	//...
)

svc, err := greet.NewGreetService(cli, client.WithLoadBalanceRoundRobin())
```


