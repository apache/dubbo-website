---
type: docs
title: "基准测试"
linkTitle: "基准测试"
weight: 1
description: ""
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/reference-manual/performance/benchmarking/)。
{{% /pageinfo %}}

## 1 Benchmark 结论

对比 2.x 版本，Dubbo3 版本

- 服务发现资源利用率显著提升。
  - 对比接口级服务发现，单机常驻内存下降  50%，地址变更期 GC 消耗下降一个数量级 (百次 -> 十次)
  - 对比应用级服务发现，单机常驻内存下降 75%，GC 次数趋零
- Dubbo 协议性能持平，Triple 协议在网关、Stream吞吐量方面更具优势。
  - Dubbo协议 （3.0 vs 2.x），3.0 实现较 2.x 总体 qps rt 持平，略有提升
  - Triple协议 vs Dubbo协议，直连调用场景 Triple 性能并无优势，其优势在网关、Stream调用场景。



以下是详细压测过程与数据

## 2 应用级服务发现（地址推送链路）

此部分压测数据是由工商银行 Dubbo 团队基于内部生产数据给出，压测过程模拟了“生产环境地址+zookeeper”的服务发现架构。

### 2.1 环境

|  | 描述 |
| ------------ | ------------------------------------------------------------ |
| **压测数据** | 提供者<br/>500运行实例✖️8interface✖️5protocol，即每个提供者向注册中心注册40个URL，总计20000个URL，每个URL字符长度约1k。<br/><br/>注册中心<br/>2个独立zookeeper注册中心，服务提供者消费者采用并行配置。<br/><br/>消费者<br/>配置1c2g，xmx=768，开启GC，从2个注册中心订阅，每5秒调用一次服务。运行20小时。 |
| **压测环境** | Java version "1.8.0"<br/>Java(TM) SE Runtime Enviroment (build pxa6480sr3fp12-20160919_01(SR3 FP12))<br/>IBM J9 VM (Build 2.8, JRE 1.8.0 Linux amd64-64 Compressed References 20160915_318796, JIT enabled, AOT enabled) |


### 2.2 数据分析

![//imgs/v3/performance/registry-mem.svg](/imgs/v3/performance/registry-mem.svg)

<br />图一 服务发现模型内存占用变化<br /><br />

- Dubbo3 接口级服务发现模型，常驻内存较 2.x 版本下降约  50%
- Dubbo3 应用级服务发现模型，常驻内存较 2.x 版本下降约  75%


![//imgs/v3/performance/registry-gc.svg](/imgs/v3/performance/registry-gc.svg)

<br />图二 服务发现模型 GC 变化<br /><br />

- Dubbo3 接口级服务发现模型，YGC 次数 2.x 版本大幅下降，从数百次下降到十几次
- Dubbo3 应用级服务发现模型，FGC 次数 2.x 版本大幅下降，从数百次下降到零次



## 3 RPC 协议（远程调用链路）

- Dubbo3 的 _Dubbo协议 _实现与 Dubbo2 版本在性能上基本持平。
- 由于 Triple协议 本身是基于 HTTP/2 构建，因此在单条链路上的 RPC 调用并未比基于 TCP 的 Dubbo2 有提升，反而在某些调用场景出现一定下降。但 _Triple协议 _更大的优势在于网关穿透性、通用性，以及 Stream 通信模型带来的总体吞吐量提升。
- Triple 预期在网关代理场景下一定会有更好的性能表现，鉴于当前压测环境，本轮 benchmark 暂未提供。



### 3.1 环境


|     | 描述 |
| ------------ | ------------------------------------------------------------ |
| **机器**     | 4C8G Linux JDK 1.8（Provider）4C8G Linux JDK 1.8 （Consumer） |
| **压测用例** | RPC 方法类型包括：无参无返回值、普通pojo返回值、pojo列表返回值<br /><br />2.7 版本 Dubbo 协议（Hessian2 序列化）<br />3.0 版本 Dubbo 协议（Hessian2 序列化）<br />3.0 版本 Dubbo 协议（Protobuf 序列化）<br />3.0 版本 Triple 协议（Protobuf 序列化）<br />3.0 版本 Triple 协议（Protobuf 套 Hessian2 序列化） |
| **压测方法** | 单链接场景下，消费端起 32 并发线程（当前机器配置 qps rt 较均衡的并发数），持续压后采集压测数据<br /> 压测数据通过 https://github.com/apache/dubbo-benchmark 得出 |

<br />

### 3.2 数据分析

|                    | **Dubbo + Hessian2<br />2.7** | **Dubbo + Hessian2<br />3.0** | **Dubbo + Protobuf<br />3.0** | **Triple + Protobuf<br />3.0** | **Triple + Protobuf(Hessian)<br />3.0** |
| ------------------ | ----------------------------- | ----------------------------- | ----------------------------- | ------------------------------ | --------------------------------------- |
| **无参方法**       | 30333 ops/s<br />2.5ms P99    | 30414 ops/s<br />2.4ms P99    | 24123 ops/s<br />3.2ms P99    | 7016 ops/s<br />8.7ms P99      | 6635 ops/s<br />9.1ms P99               |
| **pojo返回值**     | 8984 ops/s<br />6.1 ms P99    | 12279 ops/s<br />5.7 ms P99   | 21479 ops/s<br />3.0 ms P99   | 6255 ops/s<br />8.9 ms P99     | 6491 ops/s<br />10 ms P99               |
| **pojo列表返回值** | 1916 ops/s<br />34 ms P99     | 2037 ops/s<br />34 ms P99     | 12722 ops/s<br />7.7 ms P99   | 6920 ops/s<br />9.6 ms P99     | 2833 ops/s<br />27 ms P99               |

#### 3.2.1 Dubbo 协议不同版本实现对比

![//imgs/v3/performance/rpc-dubbo.svg](/imgs/v3/performance/rpc-dubbo.svg)

<br />图三  Dubbo协议在不同版本的实现对比<br />

- 就 Dubbo RPC + Hessian 的默认组合来说，Dubbo3 与 Dubbo2 在性能上在不同调用场景下基本持平

#### 3.2.2 Dubbo协议 vs Triple协议

![//imgs/v3/performance/rpc-triple.svg](/imgs/v3/performance/rpc-triple.svg)

<br />图四 Triple vs Dubbo<br />

- 单纯看 Consumer <-> Provider 的点对点调用，可以看出 Triple 协议本身并不占优势，同样使用 Protobuf 序列化方式，Dubbo RPC 协议总体性能还是要优于 Triple。<br /><br />
- Triple 实现在 3.0 版本中将会得到持续优化，但不能完全改变在某些场景下“基于 HTTP/2 的 RPC 协议”对比“基于 TCP 的 RPC 协议”处于劣势的局面

#### 3.2.3 补充网关场景

TBD<br /><br />

#### 3.3.4 模拟 Stream 通信场景的吞吐量提升

TBD
