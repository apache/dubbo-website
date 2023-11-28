---
title: "阿里巴巴升级 Dubbo3 全面取代 HSF2"
linkTitle: "阿里巴巴"
tags: ["用户案例"]
date: 2023-01-16
weight: 1
---

继业务全面上云后，2022 双十一，阿里巴巴微服务技术栈全面迁移到以 Dubbo3 为代表的云上开源标准中间件体系。在业务上，基于 Dubbo3 首次实现了关键业务不停推、不降级的全面用户体验提升，从技术上，大幅提高研发与运维效率的同时地址推送等关键资源利用率提升超 40%，基于三位一体的 Dubbo3 开源中间件体系打造了阿里在云上的单元化最佳实践和统一标准，同时将规模化实践经验与技术创新贡献开源社区，成为微服务开源技术与标准发展的核心源泉与推动力。
## 1 阿里电商
![image.png](/imgs/blog/users/tmall.png) ![image.png](/imgs/blog/users/taobao.png) ![image.png](/imgs/blog/users/kaola.png) ......

整个电商体系的所有核心应用，包括交易相关、导购相关都都升级到了 Dubbo3 体系，用来升级原有的 HSF 框架，阿里电商是对 Dubbo3 实践最广泛、需求最强烈的体系，基于 Dubbo3 实现了以下关键目标。
2022 618大促、双11 大促期间 超 2000+ 应用、40w 节点均跑在 Dubbo3 之上。

- 应用级服务发现，解决了大促期间地址推送降级的问题，部分关键链路提升单机资源利用率 40%，大促期间地址推送SLA保障、资源利用率。
- Triple协议，解决跨网关高效互通的问题，同时部分业务线升级了 Streaming 编程和通信模式。
- 统一的流量治理规则，阿里电商场景的路由规则非常复杂，基于实现了云原生体系的结合。
- Service Mesh 解决方案，Thin SDK + Proxyless 的解决方案
- 服务柔性，目前正在落地和探索自适应负载均衡、自适应限流等策略。

## 2 蚂蚁金服
![image.png](/imgs/blog/users/antpay.png) ![image.png](/imgs/blog/users/feizhu.png) ![image.png](/imgs/blog/users/1688.png)![image.png](/imgs/blog/users/taobao.png)

阿里集团内与蚂蚁体系的互通，目前都跑在 Dubbo3 Triple 互通链路上，与原有基于 HSF 的互通方案对比，Triple 协议链路的 RT 降低了 50%。集团与蚂蚁东西向流量的核心链路，飞猪、手淘、口碑、饿了么、1688、部分导购应用、商品库、评价等业务都采用此方案。

## 3 本地生活
![image.png](/imgs/blog/users/eleme.png)  ![image.png](/imgs/blog/users/amap.png)

截止 2022 年初，Dubbo3 实现了在饿了么全量业务的生产上线，取代了之前自建的微服务体系，在过去的近一年时间内，饿了么线上有 2000 应用、15w 实例节点平稳跑在 Dubbo3 之上。

饿了么成功升级 Dubbo3 及应用级服务发现模型，实现了和阿里电商系统互通、单元化体系互通架构的升级，实现了去 proxy 架构的目标，在饿了么关心的服务发现数据链路上：

- 数据注册与订阅的传输量下降 90%
- 注册中心数据存储的总体资源占用下降 90%
- 消费端服务框架自身的常驻内存消耗下降达 50%

集群总体的稳定性、性能都得到明显提升，也为未来容量扩展做好准备。
## 4 钉钉
![image.png](/imgs/blog/users/alibaba/1670649135935-0d6804cc-00ca-4acb-a7b3-842377d1a6b0.png)

钉钉核心业务在 2021 年实现了 Dubbo3 升级，基于 Triple 协议解决了云上、云下混合部署环境的互通问题。


## 5 阿里云
![image.png](/imgs/blog/users/alibaba/1670649159068-ed9ba59b-9e3d-4268-be7e-c327227baa7b.png)

阿里云公有云、转有云核心底座目前正全面迁移到 Dubbo3 体系，取代老版本的 Dubbo2 体系，预计本财年结束就能全部跑在 Dubbo3 之上。
除此之外，阿里云平台上的大部分对外售卖产品，目前都基于 Dubbo3 提供服务或提供 Dubbo3 支持，如微服务引擎MSE、达摩院店小蜜、教育平台、视频云业务等。

## 6 菜鸟
![image.png](/imgs/blog/users/alibaba/1670650418063-31eee85d-9e6a-474c-ade7-4a45fc956ae4.png)

2022 年中下旬，菜鸟网络部分核心业务开始推进 Dubbo3 的全面升级，目前生产数据正在采集中。



