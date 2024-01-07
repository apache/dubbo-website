---
aliases:
    - /zh/overview/tasks/deploy/deploy-on-vm/
    - /zh-cn/overview/tasks/deploy/deploy-on-vm/
description: ""
linkTitle: 传统注册中心
title: 传统基于 Zookeeper、Nacos 的注册中心部署架构，部署 Dubbo 应用到虚拟机环境
type: docs
weight: 1
---

下图是使用 Nacos、Zookeeper 作为注册中心的典型 Dubbo 微服务部署架构。

<img src="/imgs/v3/manual/java/tutorial/kubernetes/kubernetes.png" style="max-width:650px;height:auto;" />

## 安装 Nacos
请参考以下文档了解如何在本地 [安装 Nacos]()。

## 部署应用
我们仍然以 [快速开始]() 中的项目为例，演示应用打包部署的具体步骤。

克隆示例项目到本地：
```shell
$ git clone -b main --depth 1 https://github.com/apache/dubbo-samples
````

切换到示例目录：
```shell
$ cd dubbo-samples/11-quickstart
```

以下是两种打包部署模式：

### 方式一：本地进程

本地打包进程：
```shell
$ mvn clean package
```

启动 Dubbo 进程：
```shell
$ java -jar ./quickstart-service/target/quickstart-service-0.0.1-SNAPSHOT.jar
```

{{% alert title="提示" color="primary" %}}
为了程序正常运行，请确保 `application.yml` 文件中的注册中心地址已经正确指向你想要的注册中心。
{{% /alert %}}

### 方式二：docker容器

```shell
$ docker build -f ./Dockerfile -t quickstart
```

```shell
$ docker run quickstart -p port1:port2
# 对于一些端口或连接注册中心的细节要写清楚
```

{{% alert title="提示" color="primary" %}}
Docker 容器环境下，不同容器间用于网络通信的地址需要特别关注，因此你可能需要设置 Dubbo 进程监听或者注册到注册中心的地址，请参考以下链接了解更多内容。
{{% /alert %}}

### 查看部署状态
安装并运行 dubbo-control-plane，查看本地服务部署状态：

1. 下载安装包

	```shell
	$ curl -L https://raw.githubusercontent.com/apache/dubbo-kubernetes/master/release/downloadDubbo.sh | sh -
	$ cd dubbo-$version/bin
	```

2. 运行以下命令，启动 dubbo-control-plane 进程
	```shell
	$ ./dubbo-cp run
	```

{{% alert title="提示" color="primary" %}}
为了 dubbo-control-plane 正常运行，请修改 `conf/dubbo-cp.yml` 以确保其指向你想要的注册中心。
{{% /alert %}}

访问 `http://xxx` 查看服务部署详情。

### 优雅上下线
在使用传统注册中心的情况下，我们需要控制实例发布到注册中心、实例从注册中心摘除的时机，以实现优雅上下线：
1. 上线阶段，通过 [延迟发布]() 机制控制实例注册到注册中心的时机，通过开启 [消费端预热]() 确保流量缓慢的被转发到新节点上。
2. 下线阶段，通过配置 `prestop` 确保先从注册中心摘除实例注册信息，之后再进入进程销毁过程。

在下线之前，建议调用以下 http 端口，先从注册中心摘除实例，然后再尝试停止进程

```shell
$ curl http://offline
$ sleep 10
$ kill dubbo-pid
```