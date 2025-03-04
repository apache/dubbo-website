---
aliases:
    - /zh/overview/tasks/deploy/deploy-on-vm/
    - /zh-cn/overview/tasks/deploy/deploy-on-vm/
description: "传统基于 Zookeeper、Nacos 的注册中心部署架构，部署 Dubbo 应用到虚拟机环境"
linkTitle: 传统注册中心
title: 传统基于 Zookeeper、Nacos 的注册中心部署架构，部署 Dubbo 应用到虚拟机环境
type: docs
weight: 1
working_in_progress: true
---

下图是使用 Nacos、Zookeeper 作为注册中心的典型 Dubbo 微服务部署架构。

<img src="/imgs/v3/manual/java/tutorial/kubernetes/kubernetes.png" style="max-width:650px;height:auto;" />

## 安装 Nacos
请参考以下文档了解如何在本地 [安装 Nacos]()。

## 部署应用
我们仍然以 [快速开始]() 中的项目为例，演示应用打包部署的具体步骤。

克隆示例项目到本地：
```shell
$ git clone -b master --depth 1 https://github.com/apache/dubbo-samples
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

见 [dubbo 通过环境变量设置 host](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-docker)

有些部署场景需要动态指定服务注册的地址，如 docker bridge 网络模式下要指定注册宿主机 ip 以实现外网通信。dubbo 提供了两对启动阶段的系统属性，用于设置对外通信的ip、port地址。

* **DUBBO_IP_TO_REGISTRY**：注册到注册中心的 ip 地址
* **DUBBO_PORT_TO_REGISTRY**：注册到注册中心的 port 端口
* **DUBBO_IP_TO_BIND**：监听 ip 地址
* **DUBBO_PORT_TO_BIND**：监听 port 端口

以上四个配置项均为可选项，如不配置 dubbo 会自动获取 ip 与端口，请根据具体的部署场景灵活选择配置。
dubbo 支持多协议，如果一个应用同时暴露多个不同协议服务，且需要为每个服务单独指定 ip 或 port，请分别在以上属性前加协议前缀。 如：

* **HESSIAN_DUBBO_PORT_TO_BIND**：hessian 协议绑定的 port
* **DUBBO_DUBBO_PORT_TO_BIND**：dubbo 协议绑定的 port
* **HESSIAN_DUBBO_IP_TO_REGISTRY**：hessian 协议注册的 ip
* **DUBBO_DUBBO_IP_TO_REGISTRY**：dubbo 协议注册的 ip

PORT_TO_REGISTRY 或 IP_TO_REGISTRY 不会用作默认 PORT_TO_BIND 或 IP_TO_BIND，但是反过来是成立的。如：

* 设置 `PORT_TO_REGISTRY=20881` 和 `IP_TO_REGISTRY=30.5.97.6`，则 `PORT_TO_BIND` 和 `IP_TO_BIND` 不受影响
* 设置 `PORT_TO_BIND=20881` 和 `IP_TO_BIND=30.5.97.6`，则默认 `PORT_TO_REGISTRY=20881`  且 `IP_TO_REGISTRY=30.5.97.6`

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