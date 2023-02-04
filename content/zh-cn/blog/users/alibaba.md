---
title: "阿里巴巴升级 Dubbo3 全面取代 HSF2"
linkTitle: "阿里巴巴"
tags: ["用户案例"]
date: 2023-01-16
weight: 1
---

继业务全面上云后，2022 双十一，阿里巴巴微服务技术栈全面迁移到以 Dubbo3 为代表的云上开源标准中间件体系。在业务上，基于 Dubbo3 首次实现了关键业务不停推、不降级的全面用户体验提升，从技术上，大幅提高研发与运维效率的同时地址推送等关键资源利用率提升超 40%，基于三位一体的 Dubbo3 开源中间件体系打造了阿里在云上的单元化最佳实践和统一标准，同时将规模化实践经验与技术创新贡献开源社区，成为微服务开源技术与标准发展的核心源泉与推动力。
## 1 阿里电商
![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/54037/1670649639544-2c49fc49-b25e-4fc9-845e-8b377ceba3bc.png#clientId=u31fa6127-23e9-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=66&id=uf434669b&margin=%5Bobject%20Object%5D&name=image.png&originHeight=132&originWidth=204&originalType=binary&ratio=1&rotation=0&showTitle=false&size=13316&status=done&style=none&taskId=u81ec2327-b1f6-43a2-b908-31b91796169&title=&width=102) ![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/54037/1670649088160-85a607de-4737-4e2d-90b2-49bf5b949332.png#clientId=u31fa6127-23e9-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=81&id=l0QsD&margin=%5Bobject%20Object%5D&name=image.png&originHeight=162&originWidth=308&originalType=binary&ratio=1&rotation=0&showTitle=false&size=61949&status=done&style=none&taskId=ubb9c1593-7f65-4c84-997a-34e8e9b7f47&title=&width=154) ![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/54037/1670649669327-fe6b77b6-3f34-4a18-b5c6-726729b69331.png#clientId=u31fa6127-23e9-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=74&id=ufc994d2f&margin=%5Bobject%20Object%5D&name=image.png&originHeight=148&originWidth=404&originalType=binary&ratio=1&rotation=0&showTitle=false&size=35362&status=done&style=none&taskId=u2637ee3c-ea26-4a75-9a5c-2be5e913957&title=&width=202) ......

整个电商体系的所有核心应用，包括交易相关、导购相关都都升级到了 Dubbo3 体系，用来替换原有的 HSF 框架，阿里电商是对 Dubbo3 实践最广泛、需求最强烈的体系，基于 Dubbo3 实现了以下关键目标。
2022 618大促、双11 大促期间 超 2000+ 应用、40w 节点均跑在 Dubbo3 之上。

- 应用级服务发现，解决了大促期间地址推送降级的问题，部分关键链路提升单机资源利用率 40%，大促期间地址推送SLA保障、资源利用率。
- Triple协议，解决跨网关高效互通的问题，同时部分业务线升级了 Streaming 编程和通信模式。
- 统一的流量治理规则，阿里电商场景的路由规则非常复杂，基于实现了云原生体系的结合。
- Service Mesh 解决方案，Thin SDK + Proxyless 的解决方案
- 服务柔性，目前正在落地和探索自适应负载均衡、自适应限流等策略。

## 2 蚂蚁金服
![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/54037/1670648656034-5b9cfafc-899b-400b-9edb-4e6775febba4.png#clientId=u31fa6127-23e9-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=46&id=ub2336156&margin=%5Bobject%20Object%5D&name=image.png&originHeight=66&originWidth=162&originalType=binary&ratio=1&rotation=0&showTitle=false&size=10659&status=done&style=none&taskId=u79c80d75-a418-4b93-b16d-6c46304d343&title=&width=113) ![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/54037/1670649020622-256254e8-4ef1-43f6-b1c1-a9d29b80bdd1.png#clientId=u31fa6127-23e9-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=57&id=uf2a1d369&margin=%5Bobject%20Object%5D&name=image.png&originHeight=114&originWidth=372&originalType=binary&ratio=1&rotation=0&showTitle=false&size=25430&status=done&style=none&taskId=u685e5a50-cdcc-45d4-9806-f119df0d378&title=&width=186) ![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/54037/1670649055218-13ba694c-68e6-4e88-b981-a8db546839b0.png#clientId=u31fa6127-23e9-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=59&id=ue3ffce18&margin=%5Bobject%20Object%5D&name=image.png&originHeight=118&originWidth=414&originalType=binary&ratio=1&rotation=0&showTitle=false&size=9958&status=done&style=none&taskId=u25313916-0a19-4b21-a6c1-5da20a95dca&title=&width=207)![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/54037/1670649088160-85a607de-4737-4e2d-90b2-49bf5b949332.png#clientId=u31fa6127-23e9-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=81&id=ud329ff16&margin=%5Bobject%20Object%5D&name=image.png&originHeight=162&originWidth=308&originalType=binary&ratio=1&rotation=0&showTitle=false&size=61949&status=done&style=none&taskId=ubb9c1593-7f65-4c84-997a-34e8e9b7f47&title=&width=154)

阿里集团内与蚂蚁体系的互通，目前都跑在 Dubbo3 Triple 互通链路上，与原有基于 HSF 的互通方案对比，Triple 协议链路的 RT 降低了 50%。集团与蚂蚁东西向流量的核心链路，飞猪、手淘、口碑、饿了么、1688、部分导购应用、商品库、评价等业务都采用此方案。

## 3 本地生活
![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/54037/1670648615017-544b873b-4bc3-4e17-8eac-87bf5d42cbf3.png#clientId=u31fa6127-23e9-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=53&id=u397bea65&margin=%5Bobject%20Object%5D&name=image.png&originHeight=106&originWidth=308&originalType=binary&ratio=1&rotation=0&showTitle=false&size=15119&status=done&style=none&taskId=u727184c0-ef5b-4156-91b9-8e927657a98&title=&width=154)  ![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/54037/1670650306384-a949c14f-191f-4537-b5d5-dc28844ca490.png#clientId=u8f193c04-9173-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=45&id=u0dfaf022&margin=%5Bobject%20Object%5D&name=image.png&originHeight=84&originWidth=272&originalType=binary&ratio=1&rotation=0&showTitle=false&size=20212&status=done&style=none&taskId=u466a9278-caf7-40ad-ba03-d2fb168f83f&title=&width=147)

截止 2022 年初，Dubbo3 实现了在饿了么全量业务的生产上线，取代了之前自建的微服务体系，在过去的近一年时间内，饿了么线上有 2000 应用、15w 实例节点平稳跑在 Dubbo3 之上。

饿了么成功升级 Dubbo3 及应用级服务发现模型，实现了和阿里电商系统互通、单元化体系互通架构的升级，实现了去 proxy 架构的目标，在饿了么关心的服务发现数据链路上：

- 数据注册与订阅的传输量下降 90%
- 注册中心数据存储的总体资源占用下降 90%
- 消费端服务框架自身的常驻内存消耗下降达 50%

集群总体的稳定性、性能都得到明显提升，也为未来容量扩展做好准备。
## 4 钉钉
![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/54037/1670649135935-0d6804cc-00ca-4acb-a7b3-842377d1a6b0.png#clientId=u31fa6127-23e9-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=57&id=u6203f26b&margin=%5Bobject%20Object%5D&name=image.png&originHeight=114&originWidth=266&originalType=binary&ratio=1&rotation=0&showTitle=false&size=10659&status=done&style=none&taskId=ufd0b0ffa-2aff-4ba9-83c7-764ae24a31a&title=&width=133)

钉钉核心业务在 2021 年实现了 Dubbo3 升级，基于 Triple 协议解决了云上、云下混合部署环境的互通问题。


## 5 阿里云
![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/54037/1670649159068-ed9ba59b-9e3d-4268-be7e-c327227baa7b.png#clientId=u31fa6127-23e9-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=44&id=u90dcb125&margin=%5Bobject%20Object%5D&name=image.png&originHeight=88&originWidth=216&originalType=binary&ratio=1&rotation=0&showTitle=false&size=7597&status=done&style=none&taskId=ub661eabe-098b-4f30-b213-bd1b8dea581&title=&width=108)

阿里云公有云、转有云核心底座目前正全面迁移到 Dubbo3 体系，取代老版本的 Dubbo2 体系，预计本财年结束就能全部跑在 Dubbo3 之上。
除此之外，阿里云平台上的大部分对外售卖产品，目前都基于 Dubbo3 提供服务或提供 Dubbo3 支持，如微服务引擎MSE、达摩院店小蜜、教育平台、视频云业务等。

## 6 菜鸟
![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/54037/1670650418063-31eee85d-9e6a-474c-ade7-4a45fc956ae4.png#clientId=u8f193c04-9173-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=64&id=ud036f280&margin=%5Bobject%20Object%5D&name=image.png&originHeight=128&originWidth=290&originalType=binary&ratio=1&rotation=0&showTitle=false&size=13571&status=done&style=none&taskId=u8d7f509c-983a-483b-9fd9-00cf05f65c8&title=&width=145)

2022 年中下旬，菜鸟网络部分核心业务开始推进 Dubbo3 的全面升级，目前生产数据正在采集中。



