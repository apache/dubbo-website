---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/observability/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/observability/
description: 可观测性
linkTitle: 可视化控制台
title: 可观测性
type: docs
weight: 6
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

## 功能说明
### 查询 & 监控

### 下发流量规则
