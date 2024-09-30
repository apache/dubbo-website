---
date: 2023-01-15
title: "Industrial and Commercial Bank of China Dubbo3 Application-Level Service Discovery Practice"
linkTitle: "Industrial and Commercial Bank of China"
tags: ["User Cases"]
weight: 2
---

### Problem Analysis
The following is a classic diagram of Dubbo's operating principle, where service providers and consumers coordinate to achieve automatic address discovery through the registration center.

![icbc-analyze](/imgs/user/icbc/icbc-analyze.png)

The main bottleneck faced by the Industrial and Commercial Bank of China is at the registration center and service consumer end; the number of interface-level addresses has reached a scale of hundreds of millions. On one hand, storage capacity has reached its limits, and on the other hand, push efficiency has significantly declined. At the consumer end, the resident memory of the Dubbo2 framework has exceeded 40%, and each address push brings high resource consumption rates such as CPU, affecting normal business calls.

This is an inherent problem of Dubbo2 interface-level service discovery architecture in large-scale cluster scenarios (for specific reasons, see the Application-Level Service Discovery Principle Analysis). Conventional performance optimization cannot fundamentally solve the problem. Therefore, the Industrial and Commercial Bank of China adopted the application-level service discovery model proposed in Dubbo3, which was tested and resulted in a 90% reduction in data transmission volume between nodes and the registration center, significantly reducing pressure on the registration center and achieving over 50% reduction in resident memory at the consumer end.

### Load Testing Data
Below is a set of simulated load testing data provided by the Industrial and Commercial Bank of China in collaboration with the Dubbo community, based on real service characteristics.

![icbc-data1](/imgs/user/icbc/icbc-data1.png)

The above image shows memory comparison data sampled from the consumer end process using application-level service discovery. The horizontal axis represents different versions of Dubbo, while the vertical axis shows the actual sampled memory performance. It can be seen that versions 2.6 and 2.7 performed almost identically, whereas after upgrading to version 3.0, even without upgrading application-level service discovery, memory usage reduced by nearly 40%. When switching to application-level service discovery, memory usage dropped to only 30% of the original.

![icbc-data2](/imgs/user/icbc/icbc-data2.png)

The above image depicts the GC statistics of the consumer end. Again, the horizontal axis represents different versions of Dubbo, while the vertical axis shows the actual sampled GC performance. The load testing data was obtained by simulating a scenario where the registration center continuously pushed the address list to the consumer process. It can be observed that versions 2.6 and 2.7 performed almost identically, while in version 3.0, after switching to application-level service discovery, GC has nearly approached zero occurrences.

