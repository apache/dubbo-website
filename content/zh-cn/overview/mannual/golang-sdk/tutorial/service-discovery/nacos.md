---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/registry/nacos-2/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/registry/nacos-2/
description: 使用 Nacos 作为注册中心
title: 使用 Nacos 作为注册中心
type: docs
weight: 10
---


本文演示 dubbo-go 使用 Nacos 作为注册中心的服务发现能力，可在
<a href="https://github.com/apache/dubbo-go-samples/tree/main/registry/nacos" target="_blank">dubbo-go-samples/registry/nacos</a>
查看完整示例源码。

## 如何启动

### 启动 Nacos 服务端
遵循这个步骤以[安装并启动Nacos服务端](../../../../reference/integrations/nacos.md)。

## 服务端注册配置说明

### API 配置方式

```go
ins, _ := dubbo.NewInstance(
		dubbo.WithName("dubbo_registry_nacos_server"),
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress(nacosAddr),
		),
		dubbo.WithProtocol(
			protocol.WithTriple(),
			protocol.WithPort(20000),
		),
	)
```

各配置项的作用如下：

- `dubbo.WithName()` 设置应用名。
    `dubbo_registry_nacos_server` 服务注册后会在 Nacos 中生成对应的应用节点。（此为示例名称）
- `dubbo.WithRegistry()` 添加注册中心配置。
    - `registry.WithNacos()` 指定注册中心类型为 Nacos 。
	- `registry.WithAddress()` 设置 Nacos 地址。
- `dubbo.WithProtocol()` 添加服务提供者的协议配置。
  - `protocol.WithTriple()` 指定使用 Triple 协议对外提供服务。
  - `protocol.WithPort()` 设置协议监听端口，示例使用 `20000`。

服务注册成功后，可以在 Nacos 的
`/services/dubbo_registry_nacos_server` 节点下看到服务地址。

### YAML 配置方式

如果使用配置文件方式传入配置，而不是 API 的方式，请参考以下 YAML 配置。
```yaml
dubbo:
  registries:
    demoNacos:
      protocol: nacos
      timeout: 10s
      address: 127.0.0.1:8848
  protocols:
    tripleProtocol:
      name: tri
      port: 20000
  provider:
    services:
      GreetTripleServer:
        interface: greet.GreetService
```

## 客户端发现服务配置说明

### API 配置方式

```go
ins, _ := dubbo.NewInstance(
		dubbo.WithName("dubbo_registry_nacos_client"),
		dubbo.WithRegistry(
			registry.WithNacos(),
			registry.WithAddress("127.0.0.1:8848"),
		),
	)
```
这里不需要使用`dubbo.WithProtocol()`配置协议相关内容。

### YAML 配置方式

```yaml
dubbo:
  registries:
    demoNacos:
      protocol: nacos
      timeout: 3s
      address: 127.0.0.1:8848
  consumer:
    references:
      GreetServiceImpl:
        protocol: tri
        interface: greet.GreetService
        registry: demoNacos
        retries: 3
        timeout: 3000

```

## 如何运行

在运行示例之前，请确保 Nacos 已启动。你可以参考 [安装并启动 Nacos 服务端](../../../../reference/integrations/nacos.md) 完成启动，又或者可以选择使用 Docker 镜像启动：

```shell
docker run -d --name dubbo-go-nacos -e MODE=standalone -p 8848:8848 -p 9848:9848 nacos/nacos-server:v2.3.2
```

Nacos 的 JVM 内存大小可按需配置，例如通过 `-e JVM_XMS=256m -e JVM_XMX=256m` 限制其堆内存。

```shell
docker ps --filter name=dubbo-go-nacos
```

预期可以显示 Nacos 正在运行

随后先下载示例仓库并进入 Nacos 示例目录：

```shell
git clone https://github.com/apache/dubbo-go-samples.git
cd dubbo-go-samples/registry/nacos
```

### 启动服务端

在第一个终端运行：

```shell
go run ./go-server/cmd/server.go
```

服务提供者会监听 `20000` 端口。新开一个终端，通过 HTTP 请求确认服务可用：

```shell
$ curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:20000/greet.GreetService/Greet
```

预期返回：

```json
{"greeting":"Dubbo"}
```

#### 查看注册数据

**方式一：通过 Nacos 控制台**

用浏览器打开 `http://localhost:8848/nacos/`，进入“服务管理 → 服务列表”，查看是否存在 `dubbo_registry_nacos_server` 服务。表内还可查看IP、端口、临时实例、权重、健康状态、元数据等相关数据。

**方式二：通过 Nacos OpenAPI**

```shell
curl -X GET 'http://127.0.0.1:8848/nacos/v1/ns/instance/list?serviceName=dubbo_registry_nacos_server&groupName=DEFAULT_GROUP'
```

预期输出中 hosts 列表不为空，且 healthy 为 true。



### 运行客户端

保证服务端持续运行，新开第二个终端运行指令

```shell
$ go run ./go-client/cmd/client.go
```

命令执行后，终端会输出多行服务发现和调用日志，其中包含以下响应：

```text
Greet response: greeting:"hello world"
```

这说明客户端已经通过 Nacos 找到服务提供者并完成调用。

