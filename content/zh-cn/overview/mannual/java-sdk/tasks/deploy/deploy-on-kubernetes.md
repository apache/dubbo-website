---
aliases:
    - /zh/overview/tasks/deploy/deploy-on-vm/
    - /zh-cn/overview/tasks/deploy/deploy-on-vm/
description: "部署 Dubbo 应用到 Kubernetes 环境，使用 Nacos 或者 Zookeeper 等作为注册中心。"
linkTitle: Kubernetes
title: 部署 Dubbo 应用到 Kubernetes 环境
type: docs
weight: 2
working_in_progress: true
---
这种模式与传统的非 Kubernetes 部署并无太大差异，如下图所示，仍然使用 Nacos 或者 Zookeeper 等作为注册中心，只不过将 Kubernetes 作为应用生命周期调度的底层平台。

<img src="/imgs/v3/manual/java/tutorial/kubernetes/kubernetes.png" style="max-width:650px;height:auto;" />

## 安装 Nacos
在 Kubernetes 模式下，我们推荐使用 `dubboctl` 快速安装 Nacos、dubbo-control-plane、prometheus 等组件：

```yaml
$ dubboctl install --profile=demo
```

{{% alert title="提示" color="primary" %}}
1. 请查看 dubboctl 了解更多细节
2. 您也可以在此了解 Nacos 官方提供的 Kubernetes 集群安装方案
{{% /alert %}}


## 部署应用
我们仍然以 [快速开始]() 中的项目为例，演示应用打包部署的具体步骤。

首先，克隆示例项目到本地：
```shell
$ git clone -b master --depth 1 https://github.com/apache/dubbo-samples
````

切换到示例目录：
```shell
$ cd dubbo-samples/11-quickstart
```

### 打包镜像
```shell
$ dubboctl build
# 具体写一下推送到 docker 仓库
```

### 部署

```shell
$ dubboctl deploy
```

以下是生成的完整 Kubernetes manifests：

```yaml

```

执行以下命令，将应用部署到 Kubernetes 集群：
```shell
$ kubectl apply -f xxx.yml
```

### 查看部署状态
如果之前已经使用 `dubboctl` 安装 dubbo-control-plane，则可以通过以下方式查看服务部署情况：

```shell
$ kubectl port-forward
```

访问 `http://xxx` 查看服务部署详情。

### 优雅上下线
如上面的架构图所示，我们仍然使用 Nacos 作为注册中心，因此，与传统 Linux 部署模式类似，控制实例发布到注册中心、实例从注册中心摘除的时机，是我们实现优雅上下线的关键：
1. 上线阶段，通过 [延迟发布]() 机制控制实例注册到注册中心的时机，通过开启 [消费端预热]() 确保流量缓慢的被转发到新节点上。
2. 下线阶段，通过配置 `prestop` 确保先从注册中心摘除实例注册信息，之后再进入进程销毁过程。

优雅下线摘除实例的示例配置：

```yaml
preStop:
	exec:
	  command: ["/bin/sh","-c","curl /offline; sleep 10"]
```

{{% alert title="提示" color="primary" %}}
在这个模式下，由于 Dubbo 服务的发布与注销与注册中心强关联，因此与 Kubernetes 中的 liveness、readiness 关联并不大。在下一篇文档中，我们会讲到 Kubernetes Service 部署模式下如何配置 liveness、readiness。
{{% /alert %}}

