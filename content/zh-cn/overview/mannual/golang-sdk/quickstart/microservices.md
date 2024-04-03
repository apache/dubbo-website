---
aliases:
   - /zh/docs3-v2/golang-sdk/quickstart/
   - /zh-cn/docs3-v2/golang-sdk/quickstart/
description: Dubbo-go 快速开始
linkTitle: 开发微服务应用
title: 开发微服务
type: docs
weight: 2
---

本示例演示了使用 dubbo-go 开发微服务应用，为应用增加包括服务发现、负载均衡、流量管控等微服务核心能力。

## 前置条件
本示例我们继续使用 Protobuf 开发微服务应用，请参考 [开发 rpc server 和 rpc client](../rpc) 了解如何安装 protoc、protoc-gen-go-triple 等必须插件。

## 快速运行示例
### 下载示例源码
我们在 <a href="https://github.com/apache/dubbo-go-samples/" target="_blank">apache/dubbo-go-samples</a> 仓库维护了一系列 dubbo-go 使用示例，用来帮助用户快速学习 dubbo-go 使用方式。

你可以 <a href="https://github.com/apache/dubbo-go-samples/archive/refs/heads/master.zip" target="_blank">下载示例zip包并解压</a>，或者克隆仓库：

```shell
$ git clone --depth 1 https://github.com/apache/dubbo-go-samples
```

切换到快速开始示例目录：

```shell
$ cd dubbo-go-samples/registry/nacos
```

### 启动 Nacos

由于示例应用中启用了服务发现能力且使用 Nacos 作为注册中心，在运行示例之前需要先启动注册中心。请参考 [Nacos 本地安装](/zh-cn/overview/reference/integrations/nacos/) 了解如何快速安装和启动 Nacos。

### 运行 server
在 `go-server/cmd` 示例目录：

运行以下命令，启动 server：

```shell
$ go run server.go
```

使用 `cURL` 验证 server 正常启动：

```shell
$ curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:50051/greet.v1.GreetService/Greet

Greeting: Hello world
```

### 运行 client

打开一个新的 terminal，运行以下命令，启动 client

```shell
$ go run client.go

Greeting: Hello world
```

以上就是一个完整的 dubbo-go 微服务应用工作流程。

## 源码讲解
关于 `dubbo-go-samples/registry/nacos` 示例源码，包括服务定义、代码生成、server/client 启动等均与上一篇 [rpc server & rpc client]() 类似，请点击以上链接查看具体解读。

**开发微服务最大的不同点在于：应用中增加了关于注册中心的配置，如下所示（以 server.go 为例）：**

```go
func main() {
	ins, err := dubbo.NewInstance(
		dubbo.WithName("dubbo_registry_nacos_server"),
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress("127.0.0.1:8848"),
		),
		dubbo.WithProtocol(
			protocol.WithTriple(),
			protocol.WithPort(20000),
		),
	)

	srv, _ := ins.NewServer()

	greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{})

	if err := srv.Serve(); err != nil {
		logger.Error(err)
	}
}
```

相比于开发 rpc 服务时我们直接声明 `server.NewServer(...)`，这里我们使用 `dubbo.newInstance(...)` 初始化了一些全局共享的微服务核心组件，包括应用名、注册中心、协议等：

```go
ins, err := dubbo.NewInstance(
	dubbo.WithName("dubbo_registry_nacos_server"),
	dubbo.WithRegistry(
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
	),
	dubbo.WithProtocol(
		protocol.WithTriple(),
		protocol.WithPort(20000),
	),
)
```

然后，才是创建 `ins.NewServer()` 并为 server 实例注册服务 `greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{})`，最后通过 `srv.Serve()` 启动进程。

{{% alert title="关于 dubbo.Insance 说明" color="info" %}}
* 在开发 dubbo 微服务应用时，我们推荐使用 `dubbo.Instance` 来设置一些全局性的服务治理能力，如注册中心、协议、应用名、tracing、配置中心等。
* `ins.NewServer()` 可以创建多个，通常当你需要在多个端口 [发布多个协议]() 时才需要这么做。
{{% /alert %}}

如果你要为应用添加更多服务治理能力，请参考以下内容：

## 更多内容
{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../tutorial/rpc/streaming" >}}'>服务发现与负载均衡</a>
                </h4>
                <p>更多关于 Nacos、Zookeeper 等服务发现的使用方式，负载均衡策略配置等。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "../tutorial/service-discovery" >}}'>流量管控</a>
                </h4>
                <p>学习如何实现按比例流量分配、金丝雀发布、调整超时时间、流量灰度、服务降级等流量管控。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
		<div class="h-100 card shadow" href="#">
			<div class="card-body">
				<h4 class="card-title">
					 <a href='{{< relref "../tutorial/service-discovery" >}}'>监控服务状态</a>
				</h4>
				<p>开启 Metrics 采集，通过 Prometheus、Grafana 可视化查看应用、服务、示例状态。</p>
			</div>
		</div>
	</div>
    <div class="col-sm col-md-6 mb-4">
		<div class="h-100 card shadow" href="#">
			<div class="card-body">
				<h4 class="card-title">
					 <a href='{{< relref "../tutorial/service-discovery" >}}'>全链路追踪</a>
				</h4>
				<p>开启 OpenTelemetry 全链路追踪。</p>
			</div>
		</div>
	</div>
    <div class="col-sm col-md-6 mb-4">
		<div class="h-100 card shadow" href="#">
			<div class="card-body">
				<h4 class="card-title">
					 <a href='{{< relref "../tutorial/service-discovery" >}}'>网关 HTTP 接入</a>
				</h4>
				<p>如何使用 Higress、Nginx 等网关产品，将前端 http 流量（北向流量）接入后端 dubbo-go 微服务集群。</p>
			</div>
		</div>
	</div>
    <div class="col-sm col-md-6 mb-4">
		<div class="h-100 card shadow" href="#">
			<div class="card-body">
				<h4 class="card-title">
					 <a href='{{< relref "../tutorial/service-discovery" >}}'>分布式事务</a>
				</h4>
				<p>使用 Apache Seata 作为分布式事务解决方案，解决分布式数据一致性问题。</p>
			</div>
		</div>
	</div>
</div>
<hr>
</div>
{{< /blocks/section >}}




