---
aliases:
    - /zh/overview/quickstart/java/brief/
description: 本文将基于 Dubbo Samples 示例演示如何快速搭建并部署一个微服务应用。
linkTitle: 部署微服务示例
title: 部署微服务示例
type: docs
weight: 2
---

在这个示例中，我们将之前开发的 Dubbo 微服务应用以容器镜像模式部署到 Kubernetes 集群，并使用 dubboctl 简化整个部署过程。

## 前置条件
dubbo 提供了相应的工具和解决方案来简化整个 Kubernetes 环境的打包与部署过程，所以开始前我们需要先安装相关工具。

1. 安装 dubboctl
    ```sh
    curl -L https://dubbo.apache.org/downloadAdmin | sh -
    ```

    ```shell
    cd dubbo-kube-$version
    ```

    ```sh
    export PATH=$PWD/bin:$PATH
    ```

2. dubboctl 安装完成之后，接下来通过以下命令初始化微服务开发环境。

    ```sh
    dubboctl install --profile=demo
    ```

    `--profile=demo` 指定了安装的组件列表，作为示例用途，以上命令会一键安装 Nacos、Console、Prometheus、Grafana、Zipkin、Ingress 等组件，关于 profile 更多解释及可选值请参见文档说明。

3. 检查环境准备就绪

    ```sh
    kubectl get services -n dubbo-system
    ```

## 部署应用
准备 kubernetes manifests，执行以下命令会在当前目录下生成 `deployment.yml` 文件（其中包括 deployment、service 等资源定义）。
```sh
dubboctl deploy --image=ghcr.io/dubbo-demo:latest
```

> 设计在生成的 deployment.yml 中自动加入 nacos注册中心地址

> 以上命令默认:
> * 使用 Docker Hub 仓库，可以通过 `--registry=xxx` 参数指定仓库，通过 `--file=xxx` 指定输出文件地址。
> * 通过 `--image` 指定了官方预先准备好的容器镜像，你也可以自行打包镜像，具体请参见 `dubboctl build` 命令。

接下来，将应用部署到 Kubernetes 环境。

```shell
kubectl apply -f ./deployment.yml
```

检查部署状态
```shell
kubectl get services
```

## 访问应用

```shell
dubboctl dashboard admin
```

打开浏览器访问 http://localhost:38080/admin，可以看到 Dubbo 微服务已经成功注册。

> 截图

通过 triple 协议，可以继续测试 Dubbo 服务：
```shell
curl xxx
```

## 总体架构图

![部署后的总体架构图]()

* 如果您是非 Kubernetes - 暨传统虚拟机模式的 Dubbo 部署，请参考我们的 [部署任务]()。
* 如果您计划将 Dubbo 部署到服务网格体系，请参考 [服务网格]()