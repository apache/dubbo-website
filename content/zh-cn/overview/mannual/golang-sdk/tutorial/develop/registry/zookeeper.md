---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/registry/zookeeper/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/registry/zookeeper/
description: 使用 Zookeeper 作为注册中心
title: 使用 Zookeeper 作为注册中心
type: docs
weight: 11
---







## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装
- 创建一个新的 demo 应用
- 准备 Zookeeper 实例

## 2. 配置注册中心

修改服务端配置 go-server/conf/dubbogo.yaml

```yaml
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      timeout: 3s
      address: 127.0.0.1:2181
      group: myGroup # default is dubbo
      registry-type: interface
  protocols:
    triple:
      name: tri
      port: 20000
  provider:
    services:
      GreeterProvider:
        interface: com.apache.dubbo.sample.basic.IGreeter # must be compatible with grpc or dubbo-java
      UserProviderWithCustomGroupAndVersion:
        interface: com.apache.dubbo.sample.basic.IGreeter2
        version: myInterfaceVersion # dubbo interface version must be same with client
        group: myInterfaceGroup # dubbo interface group must be same with client
```

修改客户端配置 go-client/conf/dubbogo.yaml

```yaml
dubbo:
  registries:
    demoZK:
      protocol: zookeeper
      timeout: 3s
      address: 127.0.0.1:2181
      group: myGroup
      registry-type: interface
  consumer:
    references:
      GreeterClientImpl:
        protocol: tri
        interface: com.apache.dubbo.sample.basic.IGreeter # must be compatible with grpc or dubbo-java
      UserProviderWithCustomGroupAndVersion:
        protocol: tri
        interface: com.apache.dubbo.sample.basic.IGreeter2 # must be compatible with grpc or dubbo-java
        group: myInterfaceGroup # dubbo interface group must be same with server
        version: myInterfaceVersion # dubbo interface version must be same with server
```



## 3. 使用 Zookeeper 进行服务发现

- 启动go-server/cmd，查看日志

  ```bash
  INFO    zookeeper/registry.go:217       [Zookeeper Registry] Registry instance with root = /myGroup/com.apache.dubbo.sample.basic.IGreeter/providers
  ```

  日志中包含 Zookeeper 注册信息，将当前服务接口注册在 Zookeeper


- 启动 go-client/cmd 查看日志


  日志中包含 Zookeeper 注册组件的订阅事件信息，获取到服务端 IP 和端口号，显示调用成功。

  ```
   zookeeper/registry.go:217       [Zookeeper Registry] Registry instance with root = /myGroup/com.apache.dubbo.sample.basic.IGreeter/consumers, node = consumer%3A%2F%2F172.22.91.1%2Fcom.apache.dubbo.sample.basic.IGreeter%3Fapp.version%3D%26application%3Ddubbo.io%26async%3Dfalse%26bean.name%3DGreeterClientImpl%26cluster%3Dfailover%26config.tracing%3D%26environment%3D%26generic%3D%26group%3D%26interface%3Dcom.apache.dubbo.sample.basic.IGreeter%26loadbalance%3D%26metadata-type%3Dlocal%26module%3Dsample%26name%3Ddubbo.io%26organization%3Ddubbo-go%26owner%3Ddubbo-go%26protocol%3Dtri%26provided-by%3D%26reference.filter%3Dcshutdown%26registry.role%3D0%26release%3Ddubbo-golang-3.0.4%26retries%3D%26serialization%3D%26side%3Dconsumer%26sticky%3Dfalse%26timestamp%3D1675407574%26version%3D


  cmd/client.go:54        start to test dubbo
  cmd/client.go:62        client response result: name:"Hello laurence"  id:"12345"  age:21
  cmd/client.go:68        client response result: name:"Hello laurence from UserProviderWithCustomRegistryGroupAndVersion"  id:"12345"  age:21
  ```

- 同时，我们可以直接查看zk中的数据如下：

    ```bash
    [zk: localhost:2181(CONNECTED) 6] ls /
    [zookeeper, myGroup]
    [zk: localhost:2181(CONNECTED) 7] ls /myGroup
    [com.apache.dubbo.sample.basic.IGreeter2, com.apache.dubbo.sample.basic.IGreeter]
    ```

## 4. 更多支持的注册中心

参考 [dubbo-go-samples/registry](https://github.com/apache/dubbo-go-samples/tree/master/registry)