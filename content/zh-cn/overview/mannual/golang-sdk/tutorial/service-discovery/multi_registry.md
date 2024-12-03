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

## API配置方式

```go
ins, _ := dubbo.NewInstance(
	dubbo.WithRegistry(
	    registryWithID("nacos"),
		registry.WithNacos(),
		registry.WithAddress("127.0.0.1:8848"),
	),
	dubbo.WithRegistry(
	    registryWithID("zookeeper"),
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

以上使用方式对 client 侧类似。

## YAML配置方式

修改服务端配置 go-server/conf/dubbogo.yaml， 同时将服务注册在两个注册中心上。

```yaml
dubbo:
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
```

## 支持的注册中心
* Nacos
* Zookeeper
* Polaris
* Kubernetes

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