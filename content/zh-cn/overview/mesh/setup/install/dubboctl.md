---
description: 使用 Dubboctl 安装
linkTitle: Dubboctl
title: dubboctl
type: docs
weight: 1
---
本安装指南使用命令行工具 dubboctl，它提供丰富的定制 Dubbo 控制平面以及数据平面 adapter。可以选取任意一个 Dubbo 内置的配置档，为您的特定需求进一步定制配置。

dubboctl 命令通过命令行的选项支持完整的 DubboOperator API，这些选项用于单独设置、以及接收包含 DubboOperator 定制资源（CR）的 yaml 文件。

## 先决条件
开始之前，检查下列先决条件
1. [下载 Dubbod 发行版](../../getting-started.md)

## 使用配置档安装 Dubbo
```bash
dubboctl install -y
```
此命令在 Kubernetes 集群上安装 default 配置档。

可以选取任意一个 dubbo 内置的配置档
```bash
dubboctl install --set profile=demo
```
可以通过在命令行传递配置档名称的方式，安装到集群。

## 安装前生成清单文件
```bash
dubboctl manifest generate > $HOME/generated-manifest.yaml
```

## 卸载
要从集群中完整卸载 Dubbo，运行下面命令
```bash
istioctl uninstall --remove -y
```
将移除所有 Dubbo 资源,后续版本将会支持指定文件。

命名空间 dubbo-system 默认不会被移除。如果不再需要用下面命令移除该命名空间
```bash
kubectl delete namespace dubbo-system
```
