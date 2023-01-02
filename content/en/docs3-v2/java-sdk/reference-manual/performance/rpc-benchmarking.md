---
type: docs
title: "RPC Protocol Triple&Dubbo Benchmark"
linkTitle: "RPC Benchmark"
weight: 1
description: ""
---

- The _Dubbo protocol_ implementation of Dubbo3 is basically the same as the Dubbo2 version in terms of performance.
- Since the Triple protocol itself is built based on HTTP/2, the RPC call on a single link is not improved compared with TCP-based Dubbo2, but has a certain decline in some call scenarios. But the greater advantage of the _Triple protocol _ lies in the gateway penetration, versatility, and overall throughput improvement brought about by the Stream communication model.
- Triple is expected to have better performance in the gateway proxy scenario. In view of the current stress testing environment, this round of benchmarks has not yet been provided.

## 1.1 Environment


| | Description |
| ------------ | ------------------------------------ ------------------------ |
| **Machine** | 4C8G Linux JDK 1.8 (Provider) 4C8G Linux JDK 1.8 (Consumer) |
| **Pressure test case** | RPC method types include: no parameters and no return value, normal pojo return value, pojo list return value<br /><br />2.7 version Dubbo protocol (Hessian2 serialization)<br /> Version 3.0 Dubbo protocol (Hessian2 serialization)<br />3.0 version Dubbo protocol (Protobuf serialization)<br />3.0 version Triple protocol (Protobuf serialization)<br />3.0 version Triple protocol (Protobuf sets Hessian2 serialization) |
| **Pressure test method** | In a single-link scenario, the consumer starts 32 concurrent threads (the current machine configuration qps rt has a more balanced number of concurrency), and collects the pressure test data after continuous pressure<br /> The pressure test data passes https: //github.com/apache/dubbo-benchmark Get |

<br />

## 1.2 Data Analysis

| | **Dubbo + Hessian2<br />2.7** | **Dubbo + Hessian2<br />3.0** | **Dubbo + Protobuf<br />3.0** | **Triple + Protobuf<br /> 3.0** | **Triple + Protobuf(Hessian)<br />3.0** |
| ------------------ | ----------------------------- | ----------------------------- | -------------------- --------- | ------------------------------ | --------- --------------------------------- |
| **No parameter method** | 30333 ops/s<br />2.5ms P99 | 30414 ops/s<br />2.4ms P99 | 24123 ops/s<br />3.2ms P99 | 7016 ops/s< br />8.7ms P99 | 6635 ops/s<br />9.1ms P99 |
| **pojo return value** | 8984 ops/s<br />6.1 ms P99 | 12279 ops/s<br />5.7 ms P99 | 21479 ops/s<br />3.0 ms P99 | 6255 ops/s< br />8.9 ms P99 | 6491 ops/s<br />10 ms P99 |
| **pojo list return value** | 1916 ops/s<br />34 ms P99 | 2037 ops/s<br />34 ms P99 | 12722 ops/s<br />7.7 ms P99 | 6920 ops/s <br />9.6 ms P99 | 2833 ops/s<br />27 ms P99 |

### 1.2.1 Comparison of different versions of Dubbo protocol

![//imgs/v3/performance/rpc-dubbo.svg](/imgs/v3/performance/rpc-dubbo.svg)

<br />Figure 3 Comparison of implementations of the Dubbo protocol in different versions<br />

- As far as the default combination of Dubbo RPC + Hessian is concerned, the performance of Dubbo3 and Dubbo2 is basically the same in different calling scenarios

### 1.2.2 Dubbo protocol vs Triple protocol

![//imgs/v3/performance/rpc-triple.svg](/imgs/v3/performance/rpc-triple.svg)

<br />Figure 4 Triple vs Dubbo<br />

- Simply looking at the point-to-point calls of Consumer <-> Provider, it can be seen that the Triple protocol itself is not dominant. Also using the Protobuf serialization method, the overall performance of the Dubbo RPC protocol is still better than Triple. <br /><br />
- Triple implementation will continue to be optimized in version 3.0, but it cannot completely change the situation where "RPC protocol based on HTTP/2" is at a disadvantage compared to "RPC protocol based on TCP" in some scenarios

### 1.2.3 Supplementary gateway scenarios

TBD<br /><br />

### 1.2.4 Simulate the throughput improvement of the Stream communication scenario

TBD