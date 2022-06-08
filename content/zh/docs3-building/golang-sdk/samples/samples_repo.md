---
title: dubbo-go 3.0 示例仓库
keywords: dubbo-go 3.0 示例仓库
description: dubbo-go 3.0 示例仓库
---

为了方便 Dubbogo 框架用户的使用，我们提供了 Samples 仓库以供用户参考：

[【Dubbo-go-samples 仓库地址】](https://github.com/apache/dubbo-go-samples)

## 1. Samples 仓库包含的例子

* config-api: 使用 API 进行配置初始化
* configcenter: 使用不同的配置中心，目前支持三种：zookeeper、apollo、和 nacos
* context: 如何使用上下文传递 attachment
* direct: 直连模式
* game: 游戏服务例子
* generic: 泛化调用
* rpc: RPC 调用例子, 包含 Triple、Dubbo等协议以及跨语言/gRPC互通示例
* helloworld: RPC调用入门例子
* logger: 日志例子
* registry: 展示与不同注册中心的对接，包含了 zk、nacos、etcd
* metrics: 数据上报
* filter: 使用提供filter和自定义filter的例子
* registry/servicediscovery：应用级服务发现例子
* router: 路由例子
* tracing: 链路追踪例子

## 2. 如何运行

目前有三种方式来运行 dubbo-go 的示例:

1. 通过 bash 命令快速开始: 通过简单的命令行启动样例以及进行单元测试
2. 在 IDE 中快速开始，这也是**推荐**的方式: 在工程 ".run" 子目录下，提供了所有示例的 GoLand 运行配置文件，因此用户可以简单在 IDE 中单击运行所有的示例。
3. 在 IDE 中手工配置并运行: 为了完整性的目的，也为了万一您不使用 GoLand 而使用其他的 IDE，这里也提供了如何一步一步的配置的指南，帮助用户理解如何在 IDE 中配置，运行或者调试 dubbo-go 的示例。   

### 2.1 通过 命令行 快速开始

*前置条件：需要 docker 环境就绪*

下面我们将使用 "helloworld" 作为示例:

1. **启动注册中心（比如 zookeeper）**
   
   ```bash
   make -f build/Makefile docker-up 
   ```
   
   当看到类似下面的输出信息时，就表明 zookeeper server 启动就绪了。
   
   ```bash
   >  Starting dependency services with ./integrate_test/dockercompose/docker-compose.yml
   Docker Compose is now in the Docker CLI, try `docker compose up`
   
   Creating network "dockercompose_default" with the default driver
   Creating dockercompose_zookeeper_1 ... done
   Creating etcd                      ... done
   Creating nacos-standalone          ... done
   ```
   
   如果要停掉注册中心，可以通过运行以下的命令完成:
   
   ```bash
   make -f build/Makefile docker-down
   ```
   
2. **启动服务提供方**
   
    ```bash
    cd helloworld/go-server/cmd
    export DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"
    go run .
    ```
   
   当看到类似下面的输出信息时，就表明服务提供方启动就绪了。

   ```bash
   2021/10/27 00:33:10 Connected to 127.0.0.1:2181
   2021/10/27 00:33:10 Authenticated: id=72057926938066944, timeout=10000
   2021/10/27 00:33:10 Re-submitting `0` credentials after reconnect
   ```

3. **运行服务调用方**
   
    ```bash
   cd helloworld/go-client/cmd
   export DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"
   go run .
   ```

   当以下的信息输出时，说明 `go-client` 调用 `go-server` 成功。

   ```bash
   2021-10-27T00:40:44.879+0800    DEBUG   triple/dubbo3_client.go:106     TripleClient.Invoke: get reply = name:"Hello laurence" id:"12345" age:21 
   2021-10-27T00:40:44.879+0800    DEBUG   proxy/proxy.go:218      [makeDubboCallProxy] result: name:"Hello laurence" id:"12345" age:21 , err: <nil>
   2021-10-27T00:40:44.879+0800    INFO    cmd/client.go:51        client response result: name:"Hello laurence" id:"12345" age:21
   ```
   
4. **集成测试**
   本项目 dubbo-go-samples 除了用来展示如何使用 dubbo-go 中的功能和特性之外，还被用于 apache/dubbo-go 的集成测试。可以按照以下的步骤来运行针对 `go-server` 设计的集成测试:
   
   首先启动服务方
   ```bash
   cd helloworld/go-server/cmd
   export DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"
   go run .
   ```
   
   然后切换到单测目录， 设置环境变量，然后执行单测
   ```bash
   cd integrate_test/helloworld/tests/integration
   export DUBBO_GO_CONFIG_PATH="../../../../helloworld/go-client/conf/dubbogo.yml"
   go test -v
   ```

   当以下信息输出时，说明集成测试通过。

   ```bash
   >  Running integration test for application go-server
   ...
   --- PASS: TestSayHello (0.01s)
   PASS
   ok      github.com/apache/dubbo-go-samples/integrate_test/helloworld/tests/integration  0.119s
   ```
   
7. **关闭并清理**
   ```bash
   make -f build/Makefile clean docker-down
   ```

*以下的两种运行方式都与 IDE 有关。这里我们以 Intellij GoLand 为例来讨论。*

### 2.2 在 IDE 中快速开始

一旦在 GoLand 中打开本项目，可以发现，在 "Run Configuration" 弹出菜单中已经存在了一系列事先配置好了的用来运行相关服务提供方和调用方的选项，例如："helloworld-go-server" 和 "helloworld-go-client"。

可以选择其中的任意一个快速启动相关示例。当然在运行之前，假设需要的注册中心已经事先启动了，不然用例将会失败。您可以选择手动自行启动的方式，也可以利用工程中提供的 "docker-compose.yml" 在启动注册中心的 docker 实例。选择后者的话，可以参考[第三种方式](#3-manually-run-in-ide)中的细节。

### 2.3.在 IDE 中手工运行

这里以 *Intellij GoLand* 为例。在 GoLand 中打开 dubbo-go-samples 工程之后，按照以下的步骤来运行/调试本示例:

1. **启动 zookeeper 服务器**

   打开 "integrate_test/dockercompose/docker-compose.yml" 这个文件，然后点击位于编辑器左边 gutter 栏位中的 ▶︎▶︎ 图标运行，"Service" Tab 应当会弹出并输出类似下面的文本信息:
   ```
   Deploying 'Compose: docker'...
   /usr/local/bin/docker-compose -f ...integrate_test/dockercompose/docker-compose.yml up -d
   Creating network "docker_default" with the default driver
   Creating docker_zookeeper_1 ...
   'Compose: docker' has been deployed successfully.
   ```

2. **启动服务提供方**

   打开 "helloworld/go-server/cmd/server.go" 文件，然后点击左边 gutter 栏位中紧挨着 "main" 函数的 ▶︎ 图标，并从弹出的菜单中选择 "Modify Run Configuration..."，并确保以下配置的准确:
   * Working Directory: "helloworld/go-server" 目录的绝对路径，比如： */home/dubbo-go-samples/helloworld/go-server*
   * Environment: DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"

   这样示例中的服务端就准备就绪，随时可以运行了。

3. **运行服务消费方**

   打开 "helloworld/go-client/cmd/client.go" 这个文件，然后从左边 gutter 栏位中点击紧挨着 "main" 函数的 ▶︎ 图标，然后从弹出的菜单中选择 "Modify Run Configuration..."，并确保以下配置的准确:
   * Working Directory: "helloworld/go-client" 目录的绝对路径，比如： */home/dubbo-go-samples/helloworld/go-client*
   * Environment: DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"

   然后就可以运行并调用远端的服务了，如果调用成功，将会有以下的输出:
   ```
   [2021-02-03/16:19:30 main.main: client.go: 66] response result: &{A001 Alex Stocks 18 2020-02-04 16:19:30.422 +0800 CST}
   ```

如果需要调试该示例或者 dubbo-go 框架，可以在 IDE 中从 "Run" 切换到 "Debug"。如果要结束的话，直接点击 ◼︎ 就好了。
