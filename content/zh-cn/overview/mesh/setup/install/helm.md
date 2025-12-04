---
description: 使用 Helm 安装
linkTitle: Helm
title: Helm
type: docs
weight: 2
---
请遵循本指南使用 Helm 安装和配置 Dubbo 网格。


## 先决条件

```bash
helm repo add dubbo https://charts.dubbo.apache.org
helm repo update
```

## 安装步骤

1. 安装 Dubbo Base Chart，它包含了集群范围的自定义资源定义 (CRD)，这些资源必须在部署 Dubbo 控制平面之前安装：
```bash
helm install dubbo-base dubbo/base -n dubbo-system --create-namespace
```

2. 安装 Dubbo Discovery Chart，它用于部署 dubbo 的服务：
```bash
helm install istiod dubbo/dubbod -n dubbo-system --wait
```

## 卸载

1. 列出在命名空间 dubbo-system 中安装的所有 Dubbo Chart
```bash
helm ls -n dubbo-system
```

2. 删除 Dubbo Base Chart：
```bash
helm delete dubbo-base -n dubbo-system
```

3. 删除 Dubbo Discovery Chart：
```bash
helm delete dubbod
```

4. 删除命名空间 dubbo-system：
```bash
kubectl delete namespace dubbo-system
```
