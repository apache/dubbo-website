---
description: "The process of starting multiple instances of Dubbo and the dependency relationships between modules."
linkTitle: Startup Process and Module Dependency
title: Startup Process and Module Dependency
type: docs
weight: 3
---

1. Application Startup Process  
Initialize application configuration, start internal modules, and start other modules.  
The application startup methods include: DubboBootstrap.start(), ApplicationModel.getDeployer().start()  
![Dubbo start process.svg](https://cdn.nlark.com/yuque/0/2021/svg/2391732/1634895625292-99fdac6f-3371-4147-9ad5-9428296cb083.svg#clientId=u82d0d5c2-bff3-4&from=drop&id=u8db161d3&originHeight=2594&originWidth=1050&originalType=binary&ratio=1&size=64242&status=done&style=none&taskId=u8976fa81-5bc5-469a-ab4a-b4cda12cd6d)  
2. Module Startup Process  
Starting from ModuleDeployer.start() in the diagram above, automatically initialize application configuration, start internal modules, and then start the current module.  
Module startup methods include:  
1) Spring context loads dubbo xml configuration or annotations  
2) Manually start the module: ModuleModel.getDeployer().start()  

3. Service Interface API Startup  
ServiceConfig.export() or ReferenceConfig.get() first automatically starts the module, and then executes export/refer service interfaces  

