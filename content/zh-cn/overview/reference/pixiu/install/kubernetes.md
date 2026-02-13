---
description: 使用 Kubernetes YAML 安装
linkTitle: Kubernetes
title: Kubernetes
type: docs
weight: 2
---
本章节介绍如何在 Kubernetes 集群中安装 Pixiu Gateway。需要注意的是，手动安装方式在配置灵活性方面不如 Helm 安装方式。如果需要对 Pixiu Gateway 的安装过程进行更精细的控制，建议使用 Helm 方式进行部署。

## 使用 YAML 安装

```
kubectl apply --server-side -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.3.0/standard-install.yaml
kubectl apply -k https://github.com/apache/dubbo-go-pixiu/controllers/config/crd?ref=develop
```

## 创建 Pixiu Gateway
```
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-go-pixiu-samples/main/gateway/k8s/pixiu-gateway.yaml
```

```
NAME                              READY   STATUS    RESTARTS   AGE
pixiu-3465d618-7456884484-5rzs9   1/1     Running   0          37s
pixiu-gateway-864764d586-wgvsx    1/1     Running   0          57s
```
