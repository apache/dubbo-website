---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/registry-only/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/registry-only/
description: 只注册不订阅
linkTitle: 只注册
title: 只注册
type: docs
weight: 41
---





## 特性说明
如果有两个镜像环境，两个注册中心，有一个服务只在其中一个注册中心有部署，另一个注册中心还没来得及部署，而两个注册中心的其它应用都需要依赖此服务。这个时候，可以让服务提供者方只注册服务到另一注册中心，而不从另一注册中心订阅服务。


## 使用场景
服务互不依赖的情况或者当服务提供者端发生变化时，服务提供者不需要接收通知时。

该机制通常用于提供程序相对静态且不太可能更改的场景或者提供程序和使用者互不依赖的场景。

## 使用方式
### 禁用订阅配置

```xml
<dubbo:registry id="hzRegistry" address="10.20.153.10:9090" />
<dubbo:registry id="qdRegistry" address="10.20.141.150:9090" subscribe="false" />
```

**或者**

```xml
<dubbo:registry id="hzRegistry" address="10.20.153.10:9090" />
<dubbo:registry id="qdRegistry" address="10.20.141.150:9090?subscribe=false" />
```