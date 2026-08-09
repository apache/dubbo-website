---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/registry/zookeeper/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/registry/zookeeper/
description: 使用 ZooKeeper 作为注册中心
title: 使用 ZooKeeper 作为注册中心
type: docs
weight: 11
---


本文介绍如何在 Dubbo-Go 中使用 ZooKeeper 作为注册中心。完整示例位于
<a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/zookeeper" target="_blank">dubbo-go-samples/registry/zookeeper</a>
目录。

## 启动 ZooKeeper

### 使用 Docker 启动

使用 Docker 启动一个本地 ZooKeeper 实例：

```shell
docker run --name dubbo-go-zookeeper --rm -d -p 2181:2181 zookeeper:3.9.5
```

确认容器已经启动：

```shell
docker ps --filter name=dubbo-go-zookeeper
```

### 使用发行包启动

从 [ZooKeeper 下载页面](https://zookeeper.apache.org/releases.html#download)
下载二进制发行包。解压后，复制示例配置并启动服务：

```shell
tar -xzf apache-zookeeper-3.9.5-bin.tar.gz
cd apache-zookeeper-3.9.5-bin
cp conf/zoo_sample.cfg conf/zoo.cfg
bin/zkServer.sh start
```

通过以下命令检查运行状态：

```shell
bin/zkServer.sh status
```

看到 `Mode: standalone` 表示单机 ZooKeeper 已经启动。以上两种方式使用的注册中心
地址均为 `127.0.0.1:2181`。

ZooKeeper 默认还会使用 `8080` 端口启动管理服务。如果该端口已被占用，可在
`conf/zoo.cfg` 中设置其他端口后重新启动：

```properties
admin.serverPort=18080
```

## 配置服务提供者

服务提供者通过 `registry.WithZookeeper()` 选择 ZooKeeper，并通过
`registry.WithAddress()` 指定地址：

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("dubbo_registry_zookeeper_server"),
	dubbo.WithRegistry(
		registry.WithZookeeper(),
		registry.WithAddress("127.0.0.1:2181"),
	),
	dubbo.WithProtocol(
		protocol.WithTriple(),
		protocol.WithPort(20000),
	),
)
```

各配置项的作用如下：

- `dubbo.WithName()` 设置应用名。示例使用
  `dubbo_registry_zookeeper_server`，服务注册后会在 ZooKeeper 中生成对应的应用节点。
- `dubbo.WithRegistry()` 添加注册中心配置。
  - `registry.WithZookeeper()` 指定注册中心类型为 ZooKeeper。
  - `registry.WithAddress()` 设置 ZooKeeper 地址，多个地址之间使用逗号分隔。
- `dubbo.WithProtocol()` 添加服务提供者的协议配置。
  - `protocol.WithTriple()` 指定使用 Triple 协议对外提供服务。
  - `protocol.WithPort()` 设置协议监听端口，示例使用 `20000`。

服务注册成功后，可以在 ZooKeeper 的
`/services/dubbo_registry_zookeeper_server` 节点下看到服务地址。

## 配置服务消费者

消费者使用相同的注册中心地址。创建客户端后，Dubbo-Go 会从 ZooKeeper
订阅并发现服务提供者：

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("dubbo_registry_zookeeper_client"),
	dubbo.WithRegistry(
		registry.WithZookeeper(),
		registry.WithAddress("127.0.0.1:2181"),
	),
)
```

消费者同样通过 `dubbo.WithRegistry()` 配置 ZooKeeper。这里不需要配置服务端监听
协议和端口；消费者会从注册中心获取服务提供者的地址。

## 运行示例

先下载示例仓库并进入 ZooKeeper 示例目录：

```shell
git clone https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/registry/zookeeper
```

### 启动服务提供者

在第一个终端运行：

```shell
go run ./go-server/cmd/server.go
```

服务提供者会监听 `20000` 端口。新开一个终端，通过 HTTP 请求确认服务可用：

```shell
curl \
  --header "Content-Type: application/json" \
  --data '{"name":"Dubbo"}' \
  http://localhost:20000/greet.GreetService/Greet
```

预期返回：

```json
{"greeting":"Dubbo"}
```

### 查看注册数据

如果使用前面的 Docker 命令启动 ZooKeeper，可以直接进入容器内的客户端：

```shell
docker exec -it dubbo-go-zookeeper zkCli.sh
```

如果使用本地安装的 ZooKeeper，进入发行包的 `bin` 目录（例如
`$HOST_PATH/apache-zookeeper-3.9.5-bin/bin`），然后打开命令行客户端：

```shell
./zkCli.sh
```

连接成功后输入以下命令查询服务节点：

```text
ls /services/dubbo_registry_zookeeper_server
```

预期输出类似：

```text
[<provider-ip>:20000]
```

`<provider-ip>` 是服务提供者实际注册的 IP 地址，取决于本机网络环境。能够看到
`20000` 端口对应的地址，
说明服务提供者已经注册成功。

### 启动服务消费者

保持服务提供者运行，在第二个终端执行：

```shell
go run ./go-client/cmd/client.go
```

命令执行后，终端会输出多行服务发现和调用日志，其中包含以下响应：

```text
Greet response: greeting:"hello world"
```

这说明消费者已经通过 ZooKeeper 找到服务提供者并完成调用。

如果使用 Docker 启动 ZooKeeper，示例运行结束后可通过以下命令停止容器：

```shell
docker stop dubbo-go-zookeeper
```

如果使用本地发行包启动，则回到 ZooKeeper 发行包目录执行：

```shell
bin/zkServer.sh stop
```
