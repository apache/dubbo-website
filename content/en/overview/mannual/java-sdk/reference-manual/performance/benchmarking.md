---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/performance/benchmarking/
    - /en/docs3-v2/java-sdk/reference-manual/performance/benchmarking/
description: ""
linkTitle: Application-Level Service Discovery Benchmark
title: Application-Level Service Discovery Benchmark Testing
type: docs
weight: 1
---

## 1 Benchmark Conclusions

Compared to version 2.x, Dubbo 3 version

- Resource utilization for service discovery has significantly improved.
  - Compared to interface-level service discovery, the resident memory on a single machine decreased by 50%, and the GC consumption during address changes decreased an order of magnitude (hundreds -> tens).
  - Compared to application-level service discovery, the resident memory on a single machine decreased by 75%, and the number of GCs approached zero.


Here are the detailed pressure test processes and data

## 2 Application-Level Service Discovery (Address Push Link)

The pressure test data in this section is provided by the Industrial and Commercial Bank of China Dubbo team based on internal production data, simulating the service discovery architecture of "production environment address + zookeeper".

### 2.1 Environment

|  | Description |
| ------------ | ------------------------------------------------------------ |
| **Pressure Test Data** | Provider<br/>500 running instances✖️8 interfaces✖️5 protocols, meaning each provider registers 40 URLs with the registry, totaling 20,000 URLs, with each URL character length of approximately 1k.<br/><br/>Registry<br/>2 independent zookeeper registries, with service providers and consumers configured in parallel.<br/><br/>Consumer<br/>Configured with 1c2g, xmx=768, GC enabled, subscribing from 2 registries, calling services every 5 seconds. Run for 20 hours. |
| **Pressure Test Environment** | Java version "1.8.0"<br/>Java(TM) SE Runtime Environment (build pxa6480sr3fp12-20160919_01(SR3 FP12))<br/>IBM J9 VM (Build 2.8, JRE 1.8.0 Linux amd64-64 Compressed References 20160915_318796, JIT enabled, AOT enabled) |


### 2.2 Data Analysis

![//imgs/v3/performance/registry-mem.svg](/imgs/v3/performance/registry-mem.svg)

<br />Figure 1 Memory Usage Change in Service Discovery Model<br /><br />

- Dubbo 3 interface-level service discovery model, resident memory decreased by about 50% compared to version 2.x.
- Dubbo 3 application-level service discovery model, resident memory decreased by about 75% compared to version 2.x.


![//imgs/v3/performance/registry-gc.svg](/imgs/v3/performance/registry-gc.svg)

<br />Figure 2 GC Changes in Service Discovery Model<br /><br />

- Dubbo 3 interface-level service discovery model, YGC count significantly decreased from hundreds in version 2.x to dozens.
- Dubbo 3 application-level service discovery model, FGC count declined significantly from hundreds in version 2.x to zero.

