---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/registry/multi_registry/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/registry/multi_registry/
description: 多注册中心
title: 多注册中心
type: docs
weight: 100
---

一个 Dubbo 应用可以配置的多个接口维度的注册中心，多注册中心可用于集群隔离、迁移等多种场景，关于这部分更详细的说明可参考 <a href="https://dubbo.apache.org/zh-cn/overview/mannual/java-sdk/reference-manual/registry/multiple-registry/" target="_blank">Dubbo Java 多注册中心说明</a>。

## 应用场景

### 迁移场景

在不同注册中心之间实现平滑迁移，不进行服务的中断。例如从 ZooKeeper 迁移到 Nacos，双注册保证过渡期间业务连续。

### 灰度发布场景

部署独立的灰度注册中心，仅特定流量可访问测试。新版本先注册到灰度中心，验证通过后再全量发布，降低上线风险。

### 集群/环境隔离场景

将不同的服务环境使用完全独立的注册中心隔离，互不干扰。开发、测试、生产各自独立，避免调试服务影响线上业务。

## API配置方式

### 服务端

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("dubbo_multi_registry_server"),
	dubbo.WithRegistry(
		registry.WithID("nacos"),
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
	),
	dubbo.WithRegistry(
		registry.WithID("zookeeper"),
		registry.WithZookeeper(),
		registry.WithAddress("127.0.0.1:2181"),
	),
)

```

指定某个 server 下的服务注册到哪个注册中心：

```go
// 指定 server 下的服务注册到 zookeeper 注册中心
srv, _ := ins.NewServer(server.WithServerRegistryIDs([]string{"zookeeper"}))

// 指定 server 下的服务注册到 nacos 注册中心
srv2, _ := ins.NewServer(server.WithServerRegistryIDs([]string{"nacos"}))
```

指定某个特定服务注册到哪个注册中心：

```go
srv, _ := ins.NewServer()

greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{}, server.WithRegistryIDs([]string{"zookeeper"}))
```

### 客户端

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithName("dubbo_multi_registry_client"),
	dubbo.WithRegistry(
		registry.WithID("nacos"),
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
	),
	dubbo.WithRegistry(
		registry.WithID("zookeeper"),
		registry.WithZookeeper(),
		registry.WithAddress("127.0.0.1:2181"),
	),
)
```

指定从哪个注册中心订阅服务：

```go
// 指定从 nacos 订阅服务
cli, _ := ins.NewClient(client.WithClientRegistryIDs([]string{"nacos"}))

// 或指定从 zookeeper 订阅服务
cli2, _ := ins.NewClient(client.WithClientRegistryIDs([]string{"zookeeper"}))
```

## YAML配置方式

## YAML配置方式

如果使用配置文件方式传入配置，而不是 API 的方式，请参考以下 YAML 配置。

修改服务端配置 go-server/conf/dubbogo.yaml， 同时将服务注册在两个注册中心上。

```yaml
dubbo:
  application:
    name: dubbo_multi_registry_server
  registries:
    zookeeper: # 指定 zookeeper 注册中心
      protocol: zookeeper
      address: 127.0.0.1:2181
    nacos: # 指定 nacos 注册中心
      protocol: nacos
      address: 127.0.0.1:8848
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        registry-ids: # 同时注册到两个注册中心
          - zookeeper
          - nacos
        interface: "" # 接口名
```

### 客户端

```yaml
dubbo:
  application:
    name: dubbo_multi_registry_client
  registries:
    nacos:
      protocol: nacos
      address: 127.0.0.1:8848
    zookeeper:
      protocol: zookeeper
      address: 127.0.0.1:2181
  consumer:
    references:
      GreeterClientImpl:
        registry-ids: # 从 nacos 订阅服务
          - nacos
        protocol: tri
        interface: ""
      GreeterClientImpl2:
        registry-ids: # 从 zookeeper 订阅服务
          - zookeeper
        protocol: tri
        interface: "" # 接口名
```

## 补充说明

### 不同级别如何选择注册中心
**Server 级别**  `server.WithServerRegistryIDs` 该 Server 下所有服务的默认注册中心

**Service 级别** `server.WithRegistryIDs` 单个服务的注册中心

**Client 级别**  `client.WithClientRegistryIDs` 该 Client 从哪些注册中心订阅服务

### 如何验证同时注册到 Nacos 和 Zookeeper

完成上述配置并启动服务端和客户端后，可以通过以下方式验证多注册中心是否配置成功。

**方式一：查看客户端日志**

客户端日志中应包含类似以下内容（时间、日志级别和代码位置前缀会因运行环境而异）：

```text
nacos client resp: greeting:"from nacos", err: <nil>
zookeeper client resp: greeting:"from zookeeper", err: <nil>
```

两条日志的 err 均为 nil，说明客户端已分别从 Nacos 和 Zookeeper 发现并调用服务。

**方式二：查看两个注册中心的服务实例**

通过 Nacos OpenAPI 查询服务实例：

```shell
curl -s 'http://127.0.0.1:8848/nacos/v1/ns/instance/list?serviceName=dubbo_multi_registry_server&groupName=DEFAULT_GROUP'
```

> 注意：`serviceName` 需要替换为你配置的应用名（`dubbo.WithName()` 或 `application.name` 设置的值），Zookeeper 节点路径 `/services/<应用名>` 同理。

预期 hosts 中包含服务提供者地址（如 `<provider-ip>:20000`）且 healthy 为 true。

通过 Zookeeper 客户端查询服务节点：

```shell
docker exec dubbo-go-zookeeper zkCli.sh -server 127.0.0.1:2181 ls /services/dubbo_multi_registry_server
```

预期输出类似 `[<provider-ip>:20000]`。其中 `<provider-ip>` 是服务提供者实际注册的 IP 地址，取决于本机网络环境。

如果两个注册中心都能看到服务实例，说明服务已同时成功注册到 Nacos 和 Zookeeper，客户端也能从两个注册中心正常发现并调用服务。

## 支持的注册中心

- Nacos
- Zookeeper
- Polaris
- Kubernetes

比如使用 Polaris 作为注册中心时，你需要指定以下内容，使用 API 或 YAML 配置文件均可以：

```yaml
dubbo:
  registries:
    polarisMesh:
      protocol: polaris
      address: ${北极星服务端IP}:8091
      namespace: ${北极星命名空间信息}
      token: ${北极星资源鉴权 token}   # 如果北极星服务端开启了针对客户端的鉴权，则需要配置该参数
```

对于 Kubernetes 注册中心的使用方式，请参考 [控制面](/zh-cn/overview/mannual/control-plane/) 文档。