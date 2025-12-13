---
aliases:
    - /zh-cn/overview/reference/setup/install/
description: Dubbo 控制面是微服务治理的核心依赖。本文档描述了如何快速安装 Dubbo Admin 控制面、控制台以及服务发现和监控等组件。
linkTitle: 安装 Dubbo
title: 安装 Dubbo Admin 和治理组件
toc_hide: true
type: docs
weight: 50
---

## Dubboctl 安装
### 下载
下载 Dubbo Admin 发布版本
```shell
curl -L https://dubbo.apache.org/installer.sh | VERSION=0.1.0 sh -
# Admin 需要整理好发布版本
```

将 dubboctl 放入可执行路径
```shell
ln -s dubbo-admin-0.1.0/bin/dubboctl /usr/local/bin/dubboctl
```
### 安装
安装过程将依次：

1. 安装一些由 Admin 自定义的资源
2. 拉起不同的组件服务，如 Admin、Nacos、Zookeeper 等
```shell
dubboctl install # 使用默认清单安装

# 或

dubboctl manifests | kubectl apply -f -
```

```shell
dubboctl install --set profile=minimal # 指定不同的配置文件，即安装组件的组合
```

```shell
dubboctl install --set admin.nacos.enabled=true, admin.nacos.namespace=test
# 指定不同的覆盖参数
```

检查安装结果
```shell
kubectl get pod -n dubbo-system
```

### 打开 Admin 控制台
```shell
kubectl port-forward svc/dubbo-admin -n dubbo-system 38080:38080
```

打开浏览器并访问：`http://127.0.0.1:38080/`
## Helm 安装
### 先决条件

- [安装 Helm 客户端](https://helm.sh/docs/intro/install/)，版本 3.6 或更高。
- Kubernetes 集群
- 配置 helm 仓库
```shell
$ helm repo add dubbo https://dubbo.apache.org/charts
$ helm repo update
```
### 安装步骤
#### 方法一
```shell
helm install dubbo-admin dubbo/dubbo-stack -n dubbo-system

helm install dubbo-admin-nacos dubbo/dubbo-stack -n dubbo-system

helm install dubbo-admin-zookeeper dubbo/dubbo-stack -n dubbo-system
```

```shell
helm install dubbo-admin-grafana dubbo/dubbo-stack -n dubbo-system

helm install dubbo-admin-prometheus dubbo/dubbo-stack -n dubbo-system
```
#### 方法二
```shell
helm install dubbo-admin-all dubbo/dubbo-stack -n dubbo-system
```

> 问题。需要明确哪些组件是生产就绪的，哪些仅用于展示，例如 nacos/zookeeper/admin 用于生产就绪，prometheus/grafana 仅用于展示。
> 基于以上结论，在大多数情况下，不建议在生产环境中安装 dubbo-admin-all；更推荐的是使用类似 dubbo-admin-nacos 的生产就绪包，并自行使用 prometheus 社区生产安装包。


检查安装状态
```shell
helm ls -n dubbo-system

kubectl get deployments -n dubbo-system --output wide
```

## VM 安装
### 下载
下载 Dubbo Admin 发布版本
```shell
curl -L https://dubbo.apache.org/installer.sh | VERSION=0.1.0 sh -
# Admin 需要整理好发布版本
```

将 dubbo-admin 放入可执行路径
```shell
ln -s dubbo-admin-0.1.0/bin/dubbo-admin /usr/local/bin/dubbo-admin
```
### 运行
```shell
dubbo-admin run -f override-configuration.yml
```
### 配置
配置以控制 dubbo-admin 的行为
