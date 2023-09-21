---
description: 本文会部署一个经典的商城系统，并演示如何使用 Dubbo 的流量治理规则管控商城系统流量，包括灰度发布、金丝雀发布、按比例流量转发等。
linkTitle: 尝试治理微服务
title: 尝试治理微服务
type: docs
weight: 3
---

在前面两篇文档中，我们介绍了一个 Dubbo 应用的完整开发与部署过程。接下来，我们会通过一个更复杂、更完整的微服务商城系统，演示 Dubbo 的服务治理相关能力。

示例商城系统的总体架构图如下所示：

![shop 应用总体架构图](/imgs/v3/traffic/shop-arc.png)

## 部署示例应用

有两种方式可以完成商城系统部署。

### 方式一
{{% alert title="注意" color="primary" %}}
这种方式依赖 `dubboctl manifest install` 安装的注册中心等组件，如果您还没有在 Kubernetes 集群中安装相关组件，请 [按照上一步指令完成安装](../develop#前置条件)。
{{% /alert %}}

首先要为目标 kubernetes namespace 开启自动注入模式，以便应用部署后能够自动连接到注册中心等组件。

```shell
kubectl label namespace dubbo-demo dubbo-injection=enabled --overwrite
```

接下来，使用以下命令部署整个商城系统，所有应用会自动连接到之前安装的注册中心进行地址发现：

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/10-task/dubbo-samples-shop/deploy/App.yml
```

### 方式二

这种方式不需要使用 dubboctl 工具单独安装组件。因为我们已经将相关组件的安装全部集成到示例脚本中，您可以运行以下命令快速部署示例应用及相关依赖组件：

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/10-task/dubbo-samples-shop/deploy/All.yml
```

运行以下命令查看示例应用是否部署成功：

```shell
kubectl get deployments -n dubbo-demo
```

## 可视化监控服务状态

应用启动成功后，可以通过 admin 控制台查看部署状态，根据你使用的 Kubernetes 集群，请按照以下步骤操作：

{{< tabpane text=true >}}
{{< tab header="根据部署集群选择：" disabled=true />}}
{{% tab header="本地集群" lang="en" %}}
如果使用的本地 Kubernetes 集群，请使用以下方式访问应用验证部署状态，执行以下命令：
<br/>
<br/>

<em>dubboctl dashboard admin</em>
<br/>
<br/>

以上命令会自动打开 admin 控制台，如果在您的环境下没有打开，请使用浏览器访问以下地址：
<br/>
<br/>

http://localhost:38080/admin <br/><br/>

Admin 控制台显示的服务注册情况界面如下：<br/><br/>

![Admin 服务列表截图]()<br/><br/>

通过`监控统计`菜单， 可以查看集群的调用情况：<br/><br/>

![Admin 内嵌 Grafana 截图]()<br/><br/>

{{% /tab %}}

{{% tab header="阿里云ACK" lang="zh-cn" %}}
对于云上托管的哦 Kubernetes 集群，可以使用以下方式验证，这里以阿里云 ACK 集群为例：<br/><br/>

ACK ingerss-controller 的访问方式......<br/><br/>

Admin 控制台显示的服务注册情况界面如下：<br/><br/>

![Admin 服务列表截图]()<br/><br/>

通过`监控统计`菜单， 可以查看集群的调用情况：<br/><br/>

![Admin 内嵌 Grafana 截图]()<br/><br/>

{{% /tab %}}
{{< /tabpane >}}


## 流量管控

我们围绕商城系统由 5 个微服务应用组成：
* `Frontend 商城主页`，作为与用户交互的 web 界面，通过调用 `User`、`Detail`、`Order` 等提供用户登录、商品展示和订单管理等服务。
* `User 用户服务`，负责用户数据管理、身份校验等。
* `Order 订单服务`，提供订订单创建、订单查询等服务，依赖 `Detail` 服务校验商品库存等信息。
* `Detail 商品详情服务`，展示商品详情信息，调用 `Comment` 服务展示用户对商品的评论记录。
* `Comment 评论服务`，管理用户对商品的评论数据。

在此基础之上，我们设计了一系列的流量治理任务，多个应用部署有 v1、v2 两个不同的版本，我们会演示通过规则引导流量到不同的版本。完整的部署架构图如下：

![shop-arc](/imgs/v3/traffic/shop-arc-deploy2.png)

`Order 订单服务`有两个版本 `v1` 和 `v2`，`v2` 是订单服务优化后发布的新版本。
* 版本 v1 只是简单的创建订单，不展示订单详情
* 版本 v2 在订单创建成功后会展示订单的收货地址详情

`Detail` 和 `Comment` 服务也分别有两个版本 `v1` 和 `v2`，我们通过多个版本来演示流量导流后的效果。
* 版本 `v1` 默认为所有请求提供服务
* 版本 `v2` 模拟被部署在特定的区域的服务，因此 `v2` 实例会带有特定的标签

接下来，就请根跟随 [示例任务](/zh-cn/overview/tasks/traffic-management/) 体验 Dubbo 的流量治理能力吧。

## 更多内容

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./customize" >}}'>部署示例应用到 Kubernetes 集群</a>
                </h4>
                <p>演示如何将当前应用打包为 Docker 镜像，并部署到 Kubernetes 集群。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../java-sdk/quick-start/spring-boot/" >}}'>示例源码解读</a>
                </h4>
                <p>关于示例应用的源码讲解，学习如何定制 Dubbo Spring Boot 应用。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../java-sdk/quick-start/spring-boot/" >}}'>使用 dubboctl 创建多语言应用</a>
                </h4>
                <p>如何使用 dubboctl 快速创建 go、node.js、web、rust 等多语言应用。</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}


