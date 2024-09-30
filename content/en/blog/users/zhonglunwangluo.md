---
date: 2023-01-15
title: "Zhonglun Network Dubbo3 Upgrade Practice"
linkTitle: "Zhonglun Network"
tags: ["User Cases"]
weight: 4
---

Zhonglun Network completed a full upgrade from Dubbo2 to Dubbo3 in 2022, deeply utilizing core capabilities such as application-level service discovery, Kubernetes native service deployment, and service governance. The technical leader from Zhonglun Network, Lai Binbin, provided an in-depth summary of the selection, upgrade process, and benefits of Dubbo3.

It's worth mentioning that the recent [Dubbo3 official documentation](/en/) has undergone significant enhancements, and the community has committed substantial effort to improving the documentation in the near term, which is crucial for the use of Dubbo3 and the enhancement of user confidence.

### 1. Company Business and Technical Architecture Overview

[Suzhou Zhonglun Network Technology Co., Ltd.](https://www.zhonglunnet.com/guanyu.html) is a company focused on "increasing revenue services for retail stores," dedicated to providing integrated operational solutions for retailers to help them boost revenue. Zhonglun Network, centered around retail technology, has built a new retail ecosystem that includes cash register systems, Zhonglun Manager, micro-mall, Huilin Life platform, big data platform, mobile payment, smart agricultural trade, and Huilin store operation services, achieving comprehensive online and offline integration to empower retailers and increase revenue. The technology team initially chose Dubbo 2.5.3 + Zookeeper to build the microservice foundation supporting business development, later migrating to Alibaba Cloud, using cloud-native infrastructure ACK (Kubernetes) + MSE (Zookeeper) + Dubbo + PolarDB to achieve dynamically scalable service capabilities. With over 3,000 partners and a market presence in over 300 cities, serving over 300,000 retailers across various industries, the system's availability faced significant challenges due to the rapid increase in system numbers and deployment nodes.

### 2. Dubbo3 Upgrade Summary

The upgrade focused on addressing past pain points: service governance capabilities, cloud-native friendliness, and service registration and discovery. The design philosophy of Dubbo3 closely aligns with our business development needs.

### 1. Service Governance Capability

Dubbo 3 provides rich service governance capabilities, enabling service discovery, load balancing, and traffic scheduling. We have two options: use the Dubbo management console for configuration or integrate relevant API capabilities into the system. Dubbo's extensibility allows for customization at many functional points to meet specific business needs. Through the SPI mechanism, we implemented custom whole-link monitoring and testing environment isolation for quick verification of multi-version services based on routing tags. 

![image2](/imgs/v3/users/zhonglunwangluo-2.png)
Figure 2

### 2. Cloud-Native Friendliness

Dubbo is designed in accordance with cloud-native microservice development principles, integrating service and container lifecycles. We use MSE (Zookeeper) for microservice management, requiring our service exposure to align with it. We custom-defined Startup probes for smooth service transitions. The upgrade process followed a staged approach to ensure a non-disruptive rollout.

![image3](/imgs/v3/users/zhonglunwangluo-3.png)
Figure 3

### 3. Instance-Level Upgrade Switch

The introduction of an application-level service discovery mechanism in Dubbo 3.x significantly improves performance and stability over the interface-level mechanism in 2.x. During the upgrade, we also introduced a configuration center and metadata center, which greatly reduced interface configuration data and improved clarity in responsibilities.

### 3. Conclusion and Outlook

Throughout the upgrade process, we had some hesitations, like whether to replace interface-level with application-level registration. However, the upgrade brought enhanced resource utilization and functional expansions, and we've now completed the switch across all business areas.

### 4. Collaboration with the Dubbo Community

We would like to thank the Dubbo community for their professional and efficient support during Zhonglun Network’s architecture upgrade. Those interested can **join the contributor DingTalk group: 31982034**.

The Dubbo community is organizing weekly microservices technical sharing sessions, covering Dubbo usage, source code, and various cloud-native microservice knowledge.

