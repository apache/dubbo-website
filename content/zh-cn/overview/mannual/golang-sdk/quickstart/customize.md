---
description:
linkTitle: 构建自己的 Dubbo 微服务
title: 如何定制开发 Dubbo 应用并完成打包、部署
type: docs
weight: 2
---

接下来，我们将创建一个基于 Spring Boot 的 Dubbo 微服务应用，演示如何在此基础上进行定制开发，并最终打包部署到 Kubernetes 集群。

{{% alert title="提示" color="primary" %}}
如果您只想快速体验 Dubbo 功能，请参考上一篇 [如何快速开发和部署一个 Dubbo 应用](../develop)。
{{% /alert %}}

## 前置条件
1. 本地可访问的 Kubernetes 集群
2. [安装 dubboctl](../develop/#前置条件)，确保通过以下命令初始化微服务集群

    ```shell
    dubboctl manifest install --profile=demo
    ```

## 快速创建应用
除了上一篇用到的 `dubboctl create` 之外，对于 Java 微服务体系，我们还可以使用 <a href="https://start.dubbo.apache.org" target="_blank">start.dubbo.apache.org</a>（支持浏览器页面和 IntelliJ IDEA 插件）脚手架创建功能更丰富的应用模版。

<div class="col-lg-6 mt-5 mt-lg-3 mb-3 d-sm-block">
    <div class="column bg-texture center" style="min-height:320px" >
        <iframe style="height: 315px;position:relative;width: 100%; max-width:800px;" height="315" src="//player.bilibili.com/player.html?aid=703709539&bvid=BV17m4y1577g&cid=1273129142&p=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
</div>

请参照以上视频步骤创建示例项目，整个过程只需要一分钟时间。

## 定制开发微服务

请下载上一步创建的示例项目并导入您喜爱的 IDE 工具，接下来就可以对您的微服务应用进行定制化开发了。

### 定义服务

### 发布服务

### 本地启动应用
在 IDE 开发环境中，通过以下入口类可以快速启动 Dubbo 应用。

{{% alert title="注意" color="warning" %}}
由于配置文件中启用了注册中心，为了能够成功启动应用，您需要首先在本地启动 <a href="https://nacos.io/zh-cn/docs/v2/quickstart/quick-start.html" target="_blank_">Nacos</a> 或 <a href="https://zookeeper.apache.org/doc/current/zookeeperStarted.html" target="_blank_">Zookeeper</a> 注册中心 server。
{{% /alert %}}

![SpringApplication Run](/imgs/v3/quickstart/application-run.png)

我们在本地成功使用 <a href="/zh-cn/overview/reference/protocols/triple/" target="_blank_">Triple </a>协议发布了服务，在应用启动成功后，可直接使用 cURL 测试服务是否已经正常运行：

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50051/com.example.demo.dubbo.api.DemoService/sayHello/
```

## 打包构建镜像
进入您的项目根目录，执行以下命令基于最新代码打包 Docker 镜像：

```shell
dubboctl build
```

`build` 命令会将源码打包为镜像，并推送到远端仓库，取决于网络情况，可能需要一定时间等待命令执行完成。

```shell
dubboctl deploy
```

`deploy` 命令会使用刚刚 `build` 打包的镜像生成 Kubernetes 资源清单。命令执行成功后，在当前目录看到生成的 `kube.yaml` 文件，其中包括 deployment、service 等 kubernetes 资源定义。

接下来，将应用部署到 Kubernetes 环境。

```shell
kubectl apply -f ./kube.yaml
```

检查部署状态
```shell
kubectl get services
```

## 更多内容
{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./customize" >}}'>如何在虚拟机环境部署 Dubbo 应用</a>
                </h4>
                <p>如果您当前无法使用 Kubernetes，请参考如何在虚拟机环境部署 Dubbo 应用。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./customize" >}}'>Dubbo + Istio 服务网格</a>
                </h4>
                <p>如果您计划使用服务网格，可以了解如何让 Dubbo 应用配合 Istio 控制面部署。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./customize" >}}'>Kubernetes-native 服务发现</a>
                </h4>
                <p>。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./customize" >}}'>原理讲解：如何配置 Dubbo 应用对齐 Kubernetes 生命周期</a>
                </h4>
                <p>。</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
