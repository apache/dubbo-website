---
title: "Alibaba Upgrades Dubbo3 to Fully Replace HSF2"
linkTitle: "Alibaba"
tags: ["User Cases"]
date: 2023-01-16
weight: 1
---

Following a comprehensive cloud migration, Alibaba's microservice technology stack fully transitioned to a cloud-native open-source middleware system represented by Dubbo3 during the 2022 Double Eleven. In terms of business, Dubbo3 achieved a significant enhancement in user experience by maintaining continuous promotion without degradation. Technically, it greatly improved R&D and operational efficiency while increasing key resources' utilization rate, such as address pushing, by over 40%. The integration of Dubbo3's open-source middleware system created Alibaba's best practices and unified standards in the cloud, contributing scalable practical experience and technological innovation to the open-source community, becoming the core source and driving force for the development of open-source microservices technology and standards.
## 1 Alibaba E-commerce
![image.png](/imgs/blog/users/tmall.png) ![image.png](/imgs/blog/users/taobao.png) ![image.png](/imgs/blog/users/kaola.png) ......

All core applications in the e-commerce system, including those related to transactions and recommendations, have been upgraded to the Dubbo3 system to replace the existing HSF framework. Alibaba's e-commerce is the most widely practiced and has the strongest demand for Dubbo3, achieving the following key objectives.
During the 2022 618 shopping festival and Double Eleven, over 2000 applications and 400,000 nodes were running on Dubbo3.

- Application-level service discovery resolved the degradation issue of address pushing during peak promotions, improving individual resource utilization in key links by 40%.
- Triple protocol addressed efficient inter-communication across gateways, with some business lines upgrading to streaming programming and communication models.
- Unified traffic governance rules tailored for the complex routing rules in Alibaba's e-commerce scenarios based on a cloud-native system.
- Service Mesh solutions, including Thin SDK + Proxyless solutions.
- Flexible services, currently exploring adaptive load balancing and rate limiting strategies.

## 2 Ant Financial
![image.png](/imgs/blog/users/antpay.png) ![image.png](/imgs/blog/users/feizhu.png) ![image.png](/imgs/blog/users/1688.png)![image.png](/imgs/blog/users/taobao.png)

Internal intercommunication within the Alibaba Group and Ant Financial is currently running on the Dubbo3 Triple interoperability link. Compared to the original HSF-based intercommunication solutions, the RT of the Triple protocol link has been reduced by 50%. This solution is adopted in the core links of cross-group flows, including Feizhu, Taobao, Koubei, Ele.me, 1688, and some recommendation applications, product libraries, and reviews.

## 3 Local Life
![image.png](/imgs/blog/users/eleme.png)  ![image.png](/imgs/blog/users/amap.png)

By early 2022, Dubbo3 was fully implemented in Ele.me's production environment, replacing the self-built microservice system. Over the past year, 2000 applications and 150,000 instance nodes have been running smoothly on Dubbo3.

The successful upgrade to Dubbo3 and application-level service discovery models have enabled interoperability with Alibaba's e-commerce system and the upgraded unit-based architecture, achieving the goal of a proxy-free architecture. In the service discovery data link concerning Ele.me:

- Data registration and subscription transmission decreased by 90%.
- Overall resource consumption of the registration center's data storage dropped by 90%.
- The memory consumption of the consumer-side service framework reduced by 50%.

Overall stability and performance of the cluster have significantly improved, preparing for future capacity expansion.
## 4 DingTalk
![image.png](/imgs/blog/users/alibaba/1670649135935-0d6804cc-00ca-4acb-a7b3-842377d1a6b0.png)

DingTalk's core business achieved a Dubbo3 upgrade in 2021, using the Triple protocol to resolve interoperability issues in hybrid cloud deployment environments.


## 5 Alibaba Cloud
![image.png](/imgs/blog/users/alibaba/1670649159068-ed9ba59b-9e3d-4268-be7e-c327227baa7b.png)

Alibaba Cloud's public and private cloud core infrastructure is currently migrating to the Dubbo3 system, replacing the older Dubbo2 version. It is expected to fully transition to Dubbo3 by the end of the fiscal year. Furthermore, most external products sold on Alibaba Cloud are now based on Dubbo3 to provide services or support, including the Microservices Engine MSE, Damo Academy Xiaomeng, education platforms, and video cloud services.

## 6 Cainiao
![image.png](/imgs/blog/users/alibaba/1670650418063-31eee85d-9e6a-474c-ade7-4a45fc956ae4.png)

In mid to late 2022, some core businesses of Cainiao Network began to push for the full upgrade to Dubbo3, and production data is currently being collected.

