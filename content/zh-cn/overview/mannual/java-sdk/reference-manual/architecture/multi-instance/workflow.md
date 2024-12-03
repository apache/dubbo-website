---
description: "Dubbo 多实例启动流程与模块依赖关系。"
linkTitle: 启动流程与模块依赖关系
title: 多实例启动流程与模块依赖关系
type: docs
weight: 3
---

1、应用启动流程
初始化应用配置，启动内部模块，启动其它模块。
应用启动方式包括：DubboBootstrap.start(),  ApplicationModel.getDeployer().start()
![Dubbo start process.svg](https://cdn.nlark.com/yuque/0/2021/svg/2391732/1634895625292-99fdac6f-3371-4147-9ad5-9428296cb083.svg#clientId=u82d0d5c2-bff3-4&from=drop&id=u8db161d3&originHeight=2594&originWidth=1050&originalType=binary&ratio=1&size=64242&status=done&style=none&taskId=u8976fa81-5bc5-469a-ab4a-b4cda12cd6d)
2、模块启动流程
上图中从ModuleDeployer.start() 开始，自动初始化应用配置，启动内部模块，然后启动当前模块。
模块启动方式包括：
1) Spring context 加载dubbo xml配置或者注解
2) 手工启动模块：ModuleModel.getDeployer().start()

3、服务接口API方式启动
ServiceConfig.export() 或者 ReferenceConfig.get() 先自动启动module，然后执行export/refer服务接口





