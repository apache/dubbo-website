---
type: docs
title: "Application-Level Service Discovery Benchmark"
linkTitle: "Application-Level Service Discovery Benchmark"
weight: 1
description: ""
---


## 1 Benchmark Conclusion

Compared with 2.x version, Dubbo3 version

- Significantly improved service discovery resource utilization.
  - Compared with interface-level services, it is found that the resident memory of a single machine is reduced by 50%, and the GC consumption during the address change period is reduced by an order of magnitude (hundred times -> ten times)
  - Comparing application-level services, it is found that the resident memory of a single machine is reduced by 75%, and the number of GCs tends to zero


The following is the detailed pressure measurement process and data

## 2 Application-level service discovery (address push link)

This part of the stress test data is given by the ICBC Dubbo team based on internal production data. The stress test process simulates the service discovery architecture of "production environment address + zookeeper".

### 2.1 Environment

| | Description |
| ------------ | ------------------------------------ ------------------------ |
| **Pressure test data** | Provider<br/>500 running instances✖️8interface✖️5protocol, that is, each provider registers 40 URLs with the registration center, a total of 20,000 URLs, and the length of each URL is about 1k characters. <br/><br/>Registration center<br/>2 independent zookeeper registration centers, service providers and consumers adopt parallel configuration. <br/><br/>Consumer<br/>Configure 1c2g, xmx=768, enable GC, subscribe from 2 registries, and call the service every 5 seconds. Run for 20 hours. |
| **Pressure test environment** | Java version "1.8.0"<br/>Java(TM) SE Runtime Environment (build pxa6480sr3fp12-20160919_01(SR3 FP12))<br/>IBM J9 VM (Build 2.8, JRE 1.8 .0 Linux amd64-64 Compressed References 20160915_318796, JIT enabled, AOT enabled) |


### 2.2 Data Analysis

![//imgs/v3/performance/registry-mem.svg](/imgs/v3/performance/registry-mem.svg)

<br />Figure 1 Changes in memory usage of the service discovery model<br /><br />

- Dubbo3 interface-level service discovery model, the resident memory is reduced by about 50% compared with version 2.x
- Dubbo3 application-level service discovery model, the resident memory is reduced by about 75% compared with version 2.x


![//imgs/v3/performance/registry-gc.svg](/imgs/v3/performance/registry-gc.svg)

<br />Figure 2 Service Discovery Model GC Changes<br /><br />

- Dubbo3 interface-level service discovery model, the number of YGC times in version 2.x has dropped significantly, from hundreds of times to more than a dozen times
- Dubbo3 application-level service discovery model, the number of FGC times in version 2.x has dropped significantly, from hundreds of times to zero