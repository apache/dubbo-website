---
aliases:
- /zh/overview/reference/integrations/skywalking/
description: "如何安装与配置 Higress，涵盖本地、docker、kubernetes 等环境。"
linkTitle: Higress
title: Higress
type: docs
weight: 6
---

本文档讲解如何安装与配置 Higress，涵盖本地、docker、kubernetes 等环境。以下仅为快速示例安装指南，如想搭建生产可用集群请参考 Higress 官方文档。

## docker
使用 docker 启动 Higress，请首先确保您已经在本地机器正确 <a href="https://docs.docker.com/engine/install/" target="_blank">下载页面</a> 安装 docker</a>。

使用以下命令安装 Higress：

```shell
curl -fsSL https://higress.io/standalone/get-higress.sh | bash -s -- -a -c nacos://192.168.0.1:8848 --nacos-username=nacos --nacos-password=nacos
```

请将 `192.168.0.1` 替换为 Nacos 服务器的 IP（如果 Nacos 部署在本机，请不要使用如 `localhost` 或 `127.0.0.1` 的 Loopback 地址）。按需调整 --nacos-username 和 --nacos-password 的取值，如果 Nacos 服务未开启认证功能，则可以移除这两个参数。

{{% alert title="注意" color="info" %}}
* 如果您还没有安装 nacos，请 [参考文档完成安装](../nacos/)。
* 如果您使用 Zookeeper 做服务发现，请修改对应的集群地址为 zookeeper 集群地址。
{{% /alert %}}

在浏览器中输入 `http://127.0.0.1:8080` 进入 Higress 控制台。

## kubernetes

通过以下命令安装 Higress：

```shell
helm repo add higress.io https://higress.io/helm-charts
helm install higress -n higress-system higress.io/higress --create-namespace --render-subchart-notes --set global.local=true --set higress-console.o11y.enabled=false
```

通过以下端口映射命令，对本机访问开放端口：

```shell
kubectl port-forward service/higress-gateway -n higress-system 80:80 443:443 8080:8080
```

在浏览器中输入 `http://127.0.0.1:8080` 进入 Higress 控制台。


