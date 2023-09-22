---
aliases:
    - /zh/overview/quickstart/java/brief/
description: 演示如何快速开发一个 Dubbo 微服务应用
linkTitle: 快速创建一个应用
title: 演示如何快速开发一个 Dubbo 微服务应用
type: docs
weight: 1
---

以下文档将引导您从头创建一个基于 Spring Boot 的 Dubbo 应用，应用将开启 Triple 通信协议、服务发现等微服务基础能力。

## 快速创建应用
Dubbo 提供了 `dubboctl cli` 和`在线 web 服务`两种方式帮助开发者快速初始化项目，可以根据需要选择其中一种方式。
* `dubboctl` 可以生成任意语言的项目模板，如 Java、Go、Node.js、Web 等；
* 在线 web 服务的访问地址是：<a href="https://start.dubbo.apache.org" target="_blank">start.dubbo.apache.org</a>，它是针对 Java 语言定制的，和 Spring Initializr 效果一致。

### 方式一：dubboctl
首先，确保本地已安装 [dubboctl]()，如未安装可运行以下命令完成安装：

```sh
curl -L https://dubbo.apache.org/downloadKube.sh | sh -

cd dubbo-kube-$version
export PATH=$PWD/bin:$PATH
```

在任意目录，运行以下命令即可基于预置模板生成新项目：

```shell
dubboctl create -l java dubbo-demo
```

进入 `dubbo-demo` 目录，可看到如下项目结构：

```shell

```

### 方式二：start.dubbo.apache.org 在线服务
如果您是 Java 开发者，我们更推荐使用 `start.dubbo.apache.org` 在线服务创建面向生产环境的复杂项目，这里有更多的组件供您选择。

请打开 <a href="https://start.dubbo.apache.org" target="_blank">start.dubbo.apache.org</a>（支持浏览器页面和 IntelliJ IDEA 插件），参照以下视频步骤可在一分钟之内快速创建一个 Dubbo 应用。

<div class="col-lg-6 mt-5 mt-lg-3 mb-3 d-sm-block">
    <div class="column bg-texture center" style="min-height:320px" >
        <iframe style="height: 315px;position:relative;width: 100%; max-width:800px;" height="315" src="//player.bilibili.com/player.html?aid=703709539&bvid=BV17m4y1577g&cid=1273129142&p=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
</div>

下载生成的示例应用并解压，可看到以下项目结构：


## 定制开发与本地调试

{{% alert title="注意" color="primary" %}}
如果你想快速体验如何部署 Dubbo 应用，完全可以跳过接下来的代码定制和本地启动环节，直接 [进入下一小节学习如何部署应用](../deploy)。
{{% /alert %}}

将应用导入您喜爱的 IDE 工具，接下来就可以对您的微服务应用进行定制化开发了，更多开发及 SDK 使用方式请参考 [Dubbo Java 用户手册](/zh-cn/overview/mannual/java-sdk/quick-start/)。在 IDE 开发环境中，通过以下入口类可以快速启动 Dubbo 应用。

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

## 更多内容
{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./deploy" >}}'>部署示例应用到 Kubernetes 集群</a>
                </h4>
                <p>演示如何将当前应用打包为 Docker 镜像，并部署到 Kubernetes 集群。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/java-sdk/quick-start/spring-boot/" >}}'>示例源码解读 & 定制开发</a>
                </h4>
                <p>关于示例应用的源码讲解，学习如何定制 Dubbo Spring Boot 应用。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../../mannual/java-sdk/quick-start/spring-boot/" >}}'>使用 dubboctl 创建多语言应用</a>
                </h4>
                <p>如何使用 dubboctl 快速创建 go、node.js、web、rust 等多语言应用。</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
