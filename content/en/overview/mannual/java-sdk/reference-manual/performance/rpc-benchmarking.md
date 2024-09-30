---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/performance/rpc-benchmarking/
    - /en/docs3-v2/java-sdk/reference-manual/performance/rpc-benchmarking/
description: ""
linkTitle: RPC Benchmark
title: RPC Protocol Triple&Dubbo Benchmark Testing
type: docs
weight: 1
---






- The implementation of the _Dubbo protocol_ in Dubbo3 is basically on par with the Dubbo2 version in terms of performance.
- Since the Triple protocol is built on HTTP/2, RPC calls over a single link do not show an improvement compared to Dubbo2 based on TCP, and there is actually a certain decrease in some calling scenarios. However, the _Triple protocol_ has greater advantages in gateway penetration, universality, and overall throughput improvement brought by the Stream communication model.
- Triple is expected to perform better under gateway proxy scenarios, and benchmarks were not provided in the current stress test environment.

## 1.1 Environment


|     | Description |
| ------------ | ------------------------------------------------------------ |
| **Machine**     | 4C8G Linux JDK 1.8 (Provider) 4C8G Linux JDK 1.8 (Consumer) |
| **Stress Test Cases** | RPC method types include: no-parameter no return value, ordinary pojo return value, pojo list return value<br /><br />Version 2.7 Dubbo protocol (Hessian2 serialization)<br />Version 3.0 Dubbo protocol (Hessian2 serialization)<br />Version 3.0 Dubbo protocol (Protobuf serialization)<br />Version 3.0 Triple protocol (Protobuf serialization)<br />Version 3.0 Triple protocol (Protobuf plus Hessian2 serialization) |
| **Stress Testing Method** | In a single link scenario, the consumer starts 32 concurrent threads (the current machine configuration has a balanced qps rt concurrency), continuously collecting test data<br /> Test data is obtained from https://github.com/apache/dubbo-benchmark |

<br />

## 1.2 Data Analysis

|                    | **Dubbo + Hessian2<br />2.7** | **Dubbo + Hessian2<br />3.0** | **Dubbo + Protobuf<br />3.0** | **Triple + Protobuf<br />3.0** | **Triple + Protobuf(Hessian)<br />3.0** |
| ------------------ | ----------------------------- | ----------------------------- | ----------------------------- | ------------------------------ | --------------------------------------- |
| **No-parameter Method**       | 30333 ops/s<br />2.5ms P99    | 30414 ops/s<br />2.4ms P99    | 24123 ops/s<br />3.2ms P99    | 7016 ops/s<br />8.7ms P99      | 6635 ops/s<br />9.1ms P99               |
| **Pojo Return Value**     | 8984 ops/s<br />6.1 ms P99    | 12279 ops/s<br />5.7 ms P99   | 21479 ops/s<br />3.0 ms P99   | 6255 ops/s<br />8.9 ms P99     | 6491 ops/s<br />10 ms P99               |
| **Pojo List Return Value** | 1916 ops/s<br />34 ms P99     | 2037 ops/s<br />34 ms P99     | 12722 ops/s<br />7.7 ms P99   | 6920 ops/s<br />9.6 ms P99     | 2833 ops/s<br />27 ms P99               |

### 1.2.1 Comparison of Different Versions of Dubbo Protocol Implementations

![//imgs/v3/performance/rpc-dubbo.svg](/imgs/v3/performance/rpc-dubbo.svg)

<br />Figure 3  Comparison of Dubbo protocol implementations across different versions<br />

- In terms of the default combination of Dubbo RPC + Hessian, Dubbo3 and Dubbo2 are basically on par in performance across different calling scenarios.

### 1.2.2 Dubbo Protocol vs. Triple Protocol

![//imgs/v3/performance/rpc-triple.svg](/imgs/v3/performance/rpc-triple.svg)

<br />Figure 4 Triple vs Dubbo<br />

- Looking solely at point-to-point calls between Consumer and Provider, it can be seen that the Triple protocol does not have an advantage; similarly using Protobuf serialization, Dubbo RPC protocol overall performance still outperforms Triple.<br /><br />
- The implementation of Triple in version 3.0 will continue to be optimized, but it cannot completely change the disadvantage of "HTTP/2-based RPC protocol" compared to "TCP-based RPC protocol" in certain scenarios.

### 1.2.3 Additional Gateway Scenarios

TBD<br /><br />

### 1.2.4 Throughput Improvement Simulating Stream Communication Scenarios

TBD

