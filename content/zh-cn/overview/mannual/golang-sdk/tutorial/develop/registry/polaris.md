---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/registry/polaris/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/registry/polaris/
description: 使用 Polaris 作为注册中心
title: 使用 Polaris 作为注册中心
type: docs
weight: 12
---







## 1.准备工作

- 假设您已经准备好demo工程，如果不清楚，可以参考前面的文章
- 北极星服务端安装

    [北极星服务端单机版本安装文档](https://polarismesh.cn/docs/%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97/%E6%9C%8D%E5%8A%A1%E7%AB%AF%E5%AE%89%E8%A3%85/%E5%8D%95%E6%9C%BA%E7%89%88%E5%AE%89%E8%A3%85/)

    [北极星服务端集群版本安装文档](https://polarismesh.cn/docs/%E4%BD%BF%E7%94%A8%E6%8C%87%E5%8D%97/%E6%9C%8D%E5%8A%A1%E7%AB%AF%E5%AE%89%E8%A3%85/%E9%9B%86%E7%BE%A4%E7%89%88%E5%AE%89%E8%A3%85/)

## 2.使用Polaris作为注册中心

### 2.1dubbogo.yaml 配置文件

当前 PolarisMesh 已实现了 dubbogo 的注册发现扩展点，因此你只需要调整你的 dubbogo.yaml 文件中的 registries 配置项，新增 protocol 为 polaris 的注册中心配置即可，可以参考下面的样例。

```yaml
dubbo:
  registries:
    polarisMesh:
      protocol: polaris 
      address: ${北极星服务端IP}:8091
      namespace: ${北极星命名空间信息}
      token: ${北极星资源鉴权 token}   # 如果北极星服务端开启了针对客户端的鉴权，则需要配置该参数
```

### 2.2运行服务提供者

进入 go-server 的 cmd 目录，执行以下命令

```
 export DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"
 go run .
```

当看到以下日志时即表示 server 端启动成功

```log
INFO    dubbo/dubbo_protocol.go:84      [DUBBO Protocol] Export service: 
```


### 2.3运行服务调用者

进入 go-client 的 cmd 目录，执行以下命令


```
 export DUBBO_GO_CONFIG_PATH="../conf/dubbogo.yml"
 go run .
```

当看到以下日志时即表示 go-client 成功发现 go-server 并发起了 RPC 调用

```log
INFO    cmd/main.go:75  response: &{A001 Alex Stocks 18 2022-11-19 12:52:38.092 +0800 CST}
```

## 3.使用Polaris作为注册中心
相关源码：[示例源码](https://github.com/apache/dubbo-go-samples/tree/master/polaris/registry)