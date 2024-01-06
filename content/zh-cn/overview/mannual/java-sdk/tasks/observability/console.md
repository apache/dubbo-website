---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/observability/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/observability/
description: 可观测性
linkTitle: 控制台
title: 可观测性
type: docs
weight: 1
---

管理 Dubbo 最直接的方式就是通过 Dubbo 控制面（即 dubbo-control-plane）提供的可视化界面，之前我们在[【快速开始 - 部署 Dubbo 应用】]()一文的最后，也有用到它查看服务启动后的状态。

**`dubbo-control-plane` 支持可视化的展示、监控集群状态，还支持实时下发流量管控规则。**

## 安装控制台
为了体验效果，我们首先需要安装 dubbo-control-plane，以下是在 Linux 环境下安装 dubbo-control-plane 的具体步骤：
1. 下载 & 解压
    ```shell
    curl -L https://dubbo.apache.org/releases/downloadDubbo.sh | sh -

    cd dubbo-$version
    export PATH=$PWD/bin:$PATH
    ```
2. 安装
    ```shell
    dubbo-cp run --mode universal --config conf/dubbo.yml
    ```
    注意，`conf/dubbo.yml` 配置需要按需调整，指向你要连接的注册中心等后台服务，具体请查看 dubbo-control-plane 架构中依赖的后台服务。
3. 访问 `http://xxx` 即可打开控制台页面。
    ![页面截图]()

{{% alert title="注意" color="info" %}}
* 请查看文档了解 dubbo-control-plane 详细安装步骤，包括多个平台的安装方法与配置指导。
* 对于 Kubernetes 环境下的 Dubbo 服务开发（包括 dubbo-control-plane 安装），我们有专门的章节说明，对于 Kubernetes 环境下的开发者可以去参考。
{{% /alert %}}

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

