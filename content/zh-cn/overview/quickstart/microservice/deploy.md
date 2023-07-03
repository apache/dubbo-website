---
aliases:
    - /zh/overview/quickstart/java/brief/
description: 本文将基于 Dubbo Samples 示例演示如何快速搭建并部署一个微服务应用。
linkTitle: 部署微服务示例
title: 部署微服务示例
type: docs
weight: 2
---

在这个示例中，我们会将之前开发的微服务 demo 部署到 Kubernetes 集群，并使用 dubboctl 简化整个部署过程。

## 准备示例镜像

git clone xxx

> 你也可以自己打包，完整示例源码在这里 xxx，源码中有详细的打包步骤说明。

## 安装微服务组件

### 安装 dubboctl


```sh
curl -L https://dubbo.apache.org/downloadAdmin | sh -
```

```sh
cd dubbo-admin-0.5.0
```

```sh
export PATH=$PWD/bin:$PATH
```

### 安装 Nacos & Admin

```sh
dubboctl install --profile=demo
```

以上命令会安装 Nacos、Admin 注册中心和控制台等关键组件，同时还会安装 Grafana、Prometheus。

## 部署

```sh
dubboctl deploy --image=ghcr.io/dubbo-admin:latest
```

> 确保在项目源码根目录
> ```sh
> cd demo-application/
> ```

## 检查部署状态
```sh
dubboctl dashboard admin
```

打开浏览器访问 http://localhost:38080/admin，可以看到应用已经成功部署。

继续访问 http://localhost:29000/，打开示例应用，访问产生流量。




更多内容，请参见
* 模块 - 安装说明
* 模块 - 服务网格