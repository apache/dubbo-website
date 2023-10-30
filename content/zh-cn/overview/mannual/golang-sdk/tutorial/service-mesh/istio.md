---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/governance/service-mesh/istio/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/governance/service-mesh/istio/
description: 部署 Istio 环境
title: 部署 Istio 环境
type: docs
weight: 1
---






## 1. 准备工作

- docker、helm、kubectl 环境已安装。
- dubbo-go cli 工具和依赖工具已安装

## 2. 部署 Istio 环境

1. 使用helm 安装 istio 基础 CRD 和 istiod 组件。也可以参考 [Istio 文档](https://istio.io/) 使用 istioctl 安装。

```bash
$ helm repo add istio https://istio-release.storage.googleapis.com/charts
$ kubectl create namespace istio-system
$ helm install istio-base istio/base -n istio-system
$ helm install istiod istio/istiod --namespace istio-system
```

2. 删除istio 水平扩展资源

   *目前 dubbo-go 依赖单个 istiod 实例进行服务发现。

```bash
$ kubectl delete hpa istiod -n istio-system
```

安装完成后，可以在 istio-system 命名空间下看到一个 istiod pod 在正常运行。