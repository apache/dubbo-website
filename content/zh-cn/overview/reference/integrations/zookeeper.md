---
aliases:
- /zh/overview/reference/integrations/skywalking/
description: "如何安装与配置 Zookeeper，涵盖本地、docker、kubernetes等环境。"
linkTitle: Zookeeper
title: Zookeeper
type: docs
weight: 6
---

这篇文章讲解如何安装与配置 Zookeeper，涵盖本地、docker、kubernetes 等环境。以下仅为快速示例安装指南，如想搭建生产可用集群请参考 Zookeeper 官方文档。

## 本地下载

#### 下载Zookeeper
请到 Apache Zookeeper <a href="https://zookeeper.apache.org/releases.html" target="_blank">下载页面</a> 下载最新版本的 zookeeper 发行包。

解压下载的 zookeeper 包：

```shell
tar -zxvf apache-zookeeper-3.8.3.tar.gz
cd apache-zookeeper-3.8.3
```

#### 启动 Zookeeper

在启动 zookeeper 之前，首先需要在根目录以下位置创建文件 `conf/zoo.cfg`：

```
tickTime=2000
clientPort=2181
admin.enableServer=false
```

以下是一些参数的详细解释：
* tickTime : Zookeeper 用到的基本时间设置，tickTime 为心跳检测间隔， 2*tickTime 是最大 session 超时时间等（单位是毫秒 ms）。
* clientPort : 监听端口，客户端可通过这个端口方案 zookeeper server
* admin.enableServer：运维端口，默认为 8080，建议关闭防止和 Spring Web 应用程序冲突

接下来，可以以 standalone 模式启动 Zookeeper 了：

```shell
bin/zkServer.sh start
```

#### 测试连接到 ZooKeeper

运行以下命令，连接到刚刚启动的 zookeeper server：

```shell
$ bin/zkCli.sh -server 127.0.0.1:2181
```

连接成功后，可看到以下输出：

```shell
Connecting to localhost:2181
...
Welcome to ZooKeeper!
JLine support is enabled
[zkshell: 0]
```

执行以下命令查看根节点内容：

```shell
[zkshell: 8] ls /
[zookeeper]
```

## docker

使用 docker 启动 zookeeper，请首先确保您已经在本地机器正确 <a href="https://docs.docker.com/engine/install/" target="_blank">下载页面</a> 安装 docker</a>。

运行以下命令启动 zookeeper server：

```shell
docker run --name some-zookeeper -p 2181:2181 -e JVMFLAGS="-Dzookeeper.admin.enableServer=false" --restart always -d zookeeper:3.8.3
```

如果你要指定 `/conf` 配置文件，可通过 mount 本地文件到 docker 容器：
```shell
$ docker run --name some-zookeeper --restart always  -e JVMFLAGS="-Dzookeeper.admin.enableServer=false" -d -v $(pwd)/zoo.cfg:/conf/zoo.cfg
```

## kubernetes

您可以使用 Dubbo 社区提供的示例配置快速安装 Zookeeper 到 Kubernetes 集群。

```shell
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-kubernetes/master/deploy/kubernetes/zookeeper.yaml
```