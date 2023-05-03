---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/dump/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/dump/
description: 在 Dubbo 自动导出线程堆栈来保留现场
linkTitle: 导出线程堆栈
title: 导出线程堆栈
type: docs
weight: 43
---





## 功能说明
dubbo 通过 Jstack 自动导出线程堆栈来保留现场，方便排查问题。

默认策略

* 导出路径: user.home标识的用户主目录
* 导出间隔: 最短间隔允许每隔10分钟导出一次
* 导出开关: 默认打开

## 使用场景
当业务线程池满时，我们需要知道线程都在等待哪些资源、条件，以找到系统的瓶颈点或异常点。

## 使用方式

### 导出开关控制
```properties
# dubbo.properties
dubbo.application.dump.enable=true
```
```xml
<dubbo:application name="demo-provider" dump-enable="false"/>
```

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
    dump-enable: false
```



### 指定导出路径

```properties
# dubbo.properties
dubbo.application.dump.directory=/tmp
```

```xml
<dubbo:application name="demo-provider" dump-directory="/tmp"/>
```

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
    dump-directory: /tmp
```