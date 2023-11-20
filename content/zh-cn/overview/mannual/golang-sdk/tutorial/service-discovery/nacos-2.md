---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/registry/nacos-2/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/registry/nacos-2/
description: 使用 Nacos 作为注册中心
title: 使用 Nacos 作为注册中心
type: docs
weight: 10
---






## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装
- 创建一个新的 demo 应用
- 启动一个 Nacos 实例，暴露 8848 端口

## 2. 配置注册中心

修改服务端配置 go-server/conf/dubbogo.yaml

```yaml
dubbo:
  registries:
    nacos: # 配置 Nacos 注册中心
      protocol: nacos
      address: 127.0.0.1:8848 # 指定 Nacos 地址
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        interface: "" # read from pb
```

修改客户端配置 go-client/conf/dubbogo.yaml

```yaml
dubbo:
  registries:
    nacos:
      protocol: nacos
      address: 127.0.0.1:8848
  consumer:
    references:
      GreeterClientImpl:
        protocol: tri
        interface: "" # read from pb
```



## 3. 使用 Nacos 进行服务发现

- 启动go-server/cmd，查看日志

  ```bash
  [Nacos Registry] Registry instance with param ...
  ```

  日志中包含 Nacos 注册信息，将当前服务接口注册在 Nacos。

  可登陆控制台 http://localhost:8848/nacos 查看注册的服务

- 启动 go-client/cmd 查看日志

  ```
   [Nacos Registry] Update begin, service event: ServiceEvent{Action{add}, Path{tri://xxx.xxx.xxx.xxx:20000/api.Greeter ...
  ```

  日志中包含 Nacos 注册组件的订阅事件信息，获取到服务端 IP 和端口号，显示调用成功。

  ```
  client response result: name:"Hello laurence" id:"12345" age:21
  ```



## 4. 更多支持的注册中心

参考 [dubbo-go-samples/registry](https://github.com/apache/dubbo-go-samples/tree/master/registry)