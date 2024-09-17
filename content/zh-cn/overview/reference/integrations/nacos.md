---
aliases:
- /zh/overview/reference/integrations/skywalking/
description: "如何安装与配置 Nacos，涵盖本地、docker、kubernetes等环境。"
linkTitle: Nacos
title: Nacos
type: docs
weight: 5
---

本文档讲解如何安装与配置 Nacos，涵盖本地、docker、kubernetes 等环境。以下仅为快速示例安装指南，如想搭建生产可用集群请参考 Nacos 官方文档。

## 本地下载

Nacos 依赖 <a href="https://sdkman.io/" target="_blank">Java 环境</a> 来运行，目前支持 Linux、MacOS、Windows 等环境。

您可以 <a href="https://nacos.io/download/nacos-server/" target="_blank">下载最新稳定版本 Nacos</a>，解压缩二进制包：

```shell
unzip nacos-server-$version.zip
cd nacos/bin
#tar -xvf nacos-server-$version.tar.gz
```

#### 启动命令
```shell
# Linux/Unix/Mac
sh startup.sh -m standalone

# Ubuntu
bash startup.sh -m standalone

# Windows
startup.cmd -m standalone
```

#### 验证 nacos 正常启动

通过浏览器访问以下链接打开控制台：http://127.0.0.1:8848/nacos/

## docker
下载 nacos-docker 项目。

```shell
git clone https://github.com/nacos-group/nacos-docker.git
cd nacos-docker
```

执行 docker-compose 命令启动Nacos。

```shell
docker-compose -f example/standalone-derby.yaml up
```

## kubernetes

下载 nacos-k8s 项目

```shell
git clone https://github.com/nacos-group/nacos-k8s.git
cd nacos-k8s
```

快速启动（注意：使用此方式快速启动,请注意这是没有使用持久化卷的,可能存在数据丢失风险）

```shell
cd nacos-k8s
chmod +x quick-startup.sh
./quick-startup.sh
```

请参考 <a href="https://nacos.io/docs/latest/quickstart/quick-start-kubernetes/" target="_blank">nacos-operator</a> 了解如何部署 Nacos 到 Kubernetes 集群。
