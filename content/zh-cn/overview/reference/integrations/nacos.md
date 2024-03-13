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

您可以 <a href="https://github.com/alibaba/nacos/releases" target="_blank">下载最新稳定版本 Nacos</a>，解压缩二进制包：

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
使用 docker 启动 nacos，请首先确保您已经在本地机器正确 <a href="https://docs.docker.com/engine/install/" target="_blank">下载页面</a> 安装 docker</a>。

```shell
docker run --name nacos-quick -e MODE=standalone -p 8849:8848 -d nacos/nacos-server:2.3.1
```

## kubernetes

请参考 <a href="https://github.com/nacos-group/nacos-k8s/blob/master/operator/README-CN.md" target="_blank">nacos-operator</a> 了解如何部署 Nacos 到 Kubernetes 集群。
