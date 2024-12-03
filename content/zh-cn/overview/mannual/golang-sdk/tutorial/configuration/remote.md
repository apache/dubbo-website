---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/config-center/remote_config/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/config-center/remote_config/
description: 远程加载 dubbogo.yaml 配置文件
title: 远程配置文件
type: docs
weight: 3
---

Dubbo 框架支持将配置文件 'dubbogo.yaml' 的内容预先放入配置中心，再通过远程加载的方式与本地配置合并，以此实现一些配置的动态和集中式管理。

{{% alert title="注意" color="primary" %}}
凡是正确配置了config-center 地址的应用，都会优先从配置中心加载整个配置文件。
{{% /alert %}}

可在此查看  <a href="https://github.com/apache/dubbo-go-samples/tree/main/config_center" target="_blank">完整示例源码地址</a>，本文使用 zookeeper 演示，nacos 使用方法类似，并且在以上地址中有具体源码示例。

### 启用配置中心
在 dubbo-go 应用通过 `dubbo.WithConfigCenter()` 启用配置中心：

```go
ins, err := dubbo.NewInstance(
    dubbo.WithConfigCenter(
    	config_center.WithZookeeper(),
    	config_center.WithDataID("dubbo-go-samples-configcenter-zookeeper-server"),
    	config_center.WithAddress("127.0.0.1:2181"),
    	config_center.WithGroup("dubbogo"),
	),
)
if err != nil {
    panic(err)
}
```

在运行应用之前，提前将以下配置写入 zookeeper 集群，写入路径为 `/dubbo/config/dubbogo/dubbo-go-samples-configcenter-zookeeper-server`：

```yaml
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      timeout: 3s
      address: '127.0.0.1:2181'
  protocols:
    triple:
      name: tri
      port: 20000
```

### 启动服务端并注册服务

```go
srv, err := ins.NewServer()
if err != nil {
    panic(err)
}

if err := greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{}); err != nil {
    panic(err)
}

if err := srv.Serve(); err != nil {
    logger.Error(err)
}
```

可以发现，应用已经读取了远端的 dubbogo.yml 文件，并连接到文件中配置的注册中心地址、协议及端口配置。

### 启动客户端

```shell
$ go run ./go-client/cmd/main.go
```

### 预期的输出

```
Greet response: greeting:"hello world"
```
