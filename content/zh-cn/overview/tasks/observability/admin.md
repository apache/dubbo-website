---
aliases:
    - /zh/overview/tasks/observability/admin/
description: ""
linkTitle: Admin
no_list: true
title: 使用 Admin 可视化查看集群状态
type: docs
weight: 1
---

前面章节我们提到 Dubbo 框架提供了丰富的服务治理功能如流量控制、动态配置、服务 Mock、服务测试等，而 Dubbo Admin 控制台的一部分重要作用在于将 dubbo 框架提供的服务治理能力提供一个开箱即用的可视化平台。本文将介绍 Dubbo Admin 控制台所提供的功能，让大家快速了解和使用 Admin 并对 Dubbo 所提供的服务治理能力有个更直观的了解。

> Dubbo Admin 已经升级为 Dubbo 服务治理统一入口，涵盖的范围非常广泛，本文讲解的只是 Admin 可视化控制台部分。

## 安装 Admin
首先，需要正确 [安装&配置 Dubbo Admin](../../../reference/admin/architecture/) 控制台

## 功能介绍
Admin 控制台提供了从开发、测试到流量治理等不同层面的丰富功能，功能总体上可分为以下几类：
* 服务状态与依赖关系查询
* 服务在线测试与文档管理
* 集群状态监控
* 实例诊断
* 流量管控

### 服务状态与依赖关系查询
服务状态查询以接口为维度展示 dubbo 集群信息，包含服务提供者、消费者信息和服务的元数据等。元数据包含了服务定义、方法名和参数列表等信息。Admin 支持最新版本 dubbo3 所提供的应用级发现模型，以统一的页面交互展示了应用级&接口级地址信息，并以特殊的标记对记录进行区分。

#### 基于服务名查询
![img](/imgs/v3/tasks/observability/admin/1-search-by-service.png)

#### 基于应用名查询
![img](/imgs/v3/tasks/observability/admin/1-search-by-appname.png)

#### 基于实例地址查询
![img](/imgs/v3/tasks/observability/admin/1-search-by-ip.png)

#### 服务实例详情
![img](/imgs/v3/tasks/observability/admin/1-service-detail.png)

### 服务在线测试与文档管理
#### 服务测试
服务测试相，主要用于模拟服务消费方，验证 Dubbo 服务的使用方式与正确性。

![img](/imgs/v3/tasks/observability/admin/2-service-test2.png)

![img](/imgs/v3/tasks/observability/admin/2-service-test.png)

#### 服务 Mock
服务Mock通过无代码嵌入的方式将Consumer对Provider的请求进行拦截，动态的对Consumer的请求进行放行或返回用户自定义的Mock数据。从而解决在前期开发过程中，Consumer所依赖的Provider未准备就绪时，造成Consumer开发方的阻塞问题。
只需要以下两步，即可享受服务Mock功能带来的便捷：

第一步：
Consumer应用引入服务Mock依赖，添加JVM启动参数-Denable.dubbo.admin.mock=true开启服务Mock功能。
```xml
<denpendency>
  <groupId>org.apache.dubbo.extensions</groupId>
  <artifactId>dubbo-mock-admin</artifactId>
  <version>${version}</version>
</denpendency>
```

第二步：在Dubbo Admin中配置对应的Mock数据。

![img](/imgs/v3/tasks/observability/admin/2-service-mock.png)

#### 服务文档管理
Admin 提供的接口文档，相当于 swagger 对于 RESTful 风格的 Web 服务的作用。使用该功能可以有效的管理 Dubbo 接口文档。

![img](/imgs/v3/tasks/observability/admin/2-service-doc.png)

### 集群状态监控
#### 首页大盘
TBD

#### Grafana
![img](/imgs/v3/tasks/observability/admin/3-grafana.png)

#### Tracing
![img](/imgs/v3/tasks/observability/admin/3-tracing-zipkin.png)

### 流量管控
Admin 提供了四种路由规则的可视化管理支持，分别是条件路由规则、标签路由规则、动态配置规则、脚本路由规则，所提供的功能可以轻松实现黑白名单、灰度环境隔离、多套测试环境、金丝雀发布等服务治理诉求。接下来以条件路由为例，可以可视化的创建条件路由规则。

#### 条件路由

条件路由可以编写一些自定义路由规则实现服务治理的需求比如同区域优先、参数路由、黑白名单、读写分离等。路由规则在发起一次RPC调用前起到过滤目标服务器地址的作用，过滤后的地址列表，将作为消费端最终发起RPC调用的备选地址。

![img](/imgs/v3/tasks/observability/admin/4-traffic-management.png)

请参考 [流量管控任务](../../traffic-management/) 中关于如何进行路由规则配置的更多详细描述。
