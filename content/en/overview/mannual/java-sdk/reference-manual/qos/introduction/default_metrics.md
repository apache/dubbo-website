---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/qos/logger-management/
    - /en/docs3-v2/java-sdk/reference-manual/qos/logger-management/
description: The default monitoring metrics command can be used when the user has not connected to Prometheus.
linkTitle: Default Monitoring Metrics Command
title: Default Monitoring Metrics Command
type: docs
weight: 10
---


### Query All Monitoring Metrics

Command: `metrics_default`

Example:
```bash
> telnet 127.0.0.1 22222
> metrics_default
```

Output:
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

### Query Monitoring Metrics by Keyword

Command: `metrics_default {applicationName} {keyword}`

applicationName: Application name  
keyword: Keyword

Example:
```bash
> telnet 127.0.0.1 22222
> metrics_default dubbo-springboot-demo-provider registry
```

Output:
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

