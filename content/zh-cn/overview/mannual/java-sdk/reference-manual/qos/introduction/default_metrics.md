---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/qos/logger-management/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/qos/logger-management/
description: 当用户未接入 prometheus 时可以使用默认的监控指标命令
linkTitle: 默认监控指标命令
title: 默认监控指标命令
type: docs
weight: 10
---


### 查询所有监控指标

命令：`metrics_default`

示例：
```bash
> telnet 127.0.0.1 22222
> metrics_default
```

输出：
```
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____     
  / _ \ / / / // _ ) / _ ) / __ \  
 / // // /_/ // _  |/ _  |/ /_/ /    
/____/ \____//____//____/ \____/   
dubbo>metrics_default
dubbo.registry.directory.num.disable.total{application.module.id=1.1,application.name=dubbo-springboot-demo-provider,application.version=,git.commit.id=,hostname=hujundeMacBook-Pro.local,interface=dubbo-springboot-demo-provider/org.apache.dubbo.metrics.service.MetricsService:1.0.0,ip=10.224.214.80,} 0.0
dubbo.register.rt.milliseconds.max{application.module.id=1.1,application.name=dubbo-springboot-demo-provider,application.version=,git.commit.id=,hostname=hujundeMacBook-Pro.local,ip=10.224.214.80,} 153.0

```

### 根据关键词查询监控指标

命令：`metrics_default {applicationName} {keyword}`

applicationName: 应用名称  
keyword: 关键词

示例：
```bash
> telnet 127.0.0.1 22222
> metrics_default dubbo-springboot-demo-provider registry
```

输出：
```
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
   ___   __  __ ___   ___   ____     
  / _ \ / / / // _ ) / _ ) / __ \  
 / // // /_/ // _  |/ _  |/ /_/ /    
/____/ \____//____//____/ \____/   
dubbo> metrics_default dubbo-springboot-demo-provider registry
dubbo.registry.subscribe.num.total{application.module.id=1.1,application.name=dubbo-springboot-demo-provider,application.version=,git.commit.id=,hostname=hujundeMacBook-Pro.local,ip=10.224.214.80,} 0.0
dubbo.registry.directory.num.disable.total{application.module.id=1.1,application.name=dubbo-springboot-demo-provider,application.version=,git.commit.id=,hostname=hujundeMacBook-Pro.local,interface=dubbo-springboot-demo-provider/org.apache.dubbo.metrics.service.MetricsService:1.0.0,ip=10.224.214.80,} 0.0
```
