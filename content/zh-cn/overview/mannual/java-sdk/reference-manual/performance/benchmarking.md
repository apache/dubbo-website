---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/performance/benchmarking/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/performance/benchmarking/
description: ""
linkTitle: 应用级服务发现基准
title: 应用级服务发现基准测试
type: docs
weight: 1
---







## 1 Benchmark 结论

对比 2.x 版本，Dubbo3 版本

- 服务发现资源利用率显著提升。
  - 对比接口级服务发现，单机常驻内存下降  50%，地址变更期 GC 消耗下降一个数量级 (百次 -> 十次)
  - 对比应用级服务发现，单机常驻内存下降 75%，GC 次数趋零


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