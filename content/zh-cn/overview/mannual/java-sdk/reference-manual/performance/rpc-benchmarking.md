---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/performance/rpc-benchmarking/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/performance/rpc-benchmarking/
description: ""
linkTitle: RPC 基准
title: RPC 协议 Triple&Dubbo 基准测试
type: docs
weight: 1
---






- Dubbo3 的 _Dubbo协议 _实现与 Dubbo2 版本在性能上基本持平。
- 由于 Triple协议 本身是基于 HTTP/2 构建，因此在单条链路上的 RPC 调用并未比基于 TCP 的 Dubbo2 有提升，反而在某些调用场景出现一定下降。但 _Triple协议 _更大的优势在于网关穿透性、通用性，以及 Stream 通信模型带来的总体吞吐量提升。
- Triple 预期在网关代理场景下一定会有更好的性能表现，鉴于当前压测环境，本轮 benchmark 暂未提供。

## 1.1 环境


|     | 描述 |
| ------------ | ------------------------------------------------------------ |
| **机器**     | 4C8G Linux JDK 1.8（Provider）4C8G Linux JDK 1.8 （Consumer） |
| **压测用例** | RPC 方法类型包括：无参无返回值、普通pojo返回值、pojo列表返回值<br /><br />2.7 版本 Dubbo 协议（Hessian2 序列化）<br />3.0 版本 Dubbo 协议（Hessian2 序列化）<br />3.0 版本 Dubbo 协议（Protobuf 序列化）<br />3.0 版本 Triple 协议（Protobuf 序列化）<br />3.0 版本 Triple 协议（Protobuf 套 Hessian2 序列化） |
| **压测方法** | 单链接场景下，消费端起 32 并发线程（当前机器配置 qps rt 较均衡的并发数），持续压后采集压测数据<br /> 压测数据通过 https://github.com/apache/dubbo-benchmark 得出 |

<br />

## 1.2 数据分析

|                    | **Dubbo + Hessian2<br />2.7** | **Dubbo + Hessian2<br />3.0** | **Dubbo + Protobuf<br />3.0** | **Triple + Protobuf<br />3.0** | **Triple + Protobuf(Hessian)<br />3.0** |
| ------------------ | ----------------------------- | ----------------------------- | ----------------------------- | ------------------------------ | --------------------------------------- |
| **无参方法**       | 30333 ops/s<br />2.5ms P99    | 30414 ops/s<br />2.4ms P99    | 24123 ops/s<br />3.2ms P99    | 7016 ops/s<br />8.7ms P99      | 6635 ops/s<br />9.1ms P99               |
| **pojo返回值**     | 8984 ops/s<br />6.1 ms P99    | 12279 ops/s<br />5.7 ms P99   | 21479 ops/s<br />3.0 ms P99   | 6255 ops/s<br />8.9 ms P99     | 6491 ops/s<br />10 ms P99               |
| **pojo列表返回值** | 1916 ops/s<br />34 ms P99     | 2037 ops/s<br />34 ms P99     | 12722 ops/s<br />7.7 ms P99   | 6920 ops/s<br />9.6 ms P99     | 2833 ops/s<br />27 ms P99               |

### 1.2.1 Dubbo 协议不同版本实现对比

![//imgs/v3/performance/rpc-dubbo.svg](/imgs/v3/performance/rpc-dubbo.svg)

<br />图三  Dubbo协议在不同版本的实现对比<br />

- 就 Dubbo RPC + Hessian 的默认组合来说，Dubbo3 与 Dubbo2 在性能上在不同调用场景下基本持平

### 1.2.2 Dubbo协议 vs Triple协议

![//imgs/v3/performance/rpc-triple.svg](/imgs/v3/performance/rpc-triple.svg)

<br />图四 Triple vs Dubbo<br />

- 单纯看 Consumer <-> Provider 的点对点调用，可以看出 Triple 协议本身并不占优势，同样使用 Protobuf 序列化方式，Dubbo RPC 协议总体性能还是要优于 Triple。<br /><br />
- Triple 实现在 3.0 版本中将会得到持续优化，但不能完全改变在某些场景下“基于 HTTP/2 的 RPC 协议”对比“基于 TCP 的 RPC 协议”处于劣势的局面

### 1.2.3 补充网关场景

TBD<br /><br />

### 1.2.4 模拟 Stream 通信场景的吞吐量提升

TBD