---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/subscribe-only/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/subscribe-only/
description: 只订阅不注册
linkTitle: 只订阅
title: 只订阅
type: docs
weight: 6
---





## 特性说明

为方便开发测试，经常会在线下共用一个所有服务可用的注册中心，这时，如果一个正在开发中的服务提供者注册，可能会影响消费者不能正常运行。

可以让服务提供者开发方，只订阅服务(开发的服务可能依赖其它服务)，而不注册正在开发的服务，通过直连测试正在开发的服务。

![/user-guide/images/subscribe-only.jpg](/imgs/user/subscribe-only.jpg)

## 使用场景

- 消费者是一个正在开发但尚未部署的新应用程序。消费者希望订阅未注册的服务，以确保在部署后能够访问所需的服务。
- 消费者是正在更新或修改的现有应用程序。消费者希望订阅未注册的服务以确保它能够访问更新或修改的服务。
- 消费者是在暂存环境中开发或测试的应用程序。消费者希望订阅未注册的服务，以确保在开发或测试时能够访问所需的服务。

## 使用方式

### 禁用注册配置

```xml
<dubbo:registry address="10.20.153.10:9090" register="false" />
```
**或者**

```xml
<dubbo:registry address="10.20.153.10:9090?register=false" />
```