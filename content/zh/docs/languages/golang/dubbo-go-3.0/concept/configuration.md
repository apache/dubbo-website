---
type: docs
title: Dubbo-go的配置
keywords: Dubbo-go的配置
linkTitle: 框架配置
description: Dubbo-go的配置
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/golang-sdk/concept/config/basic_concept/)。
{{% /pageinfo %}}

# Dubbo-go 配置项

## 1. 配置结构

### 1.1 框架配置结构

- 根配置

![](/imgs/golang/3.0/config-root-config.png)

- ProviderConfig

![](/imgs/golang/3.0/config-provider-config.png)

- ConsumerConfig

![](/imgs/golang/3.0/config-consumer-config.png)

### 1.2 配置例子

```yaml
dubbo:
  application: # 应用配置
    name: dubbo-go
    module: local
    version: 1.0.0 
    owner: zhaoyunxing
    organization: dubbo-go 
    metadata-type: local # 元数据上报方式，默认为本地
  metadata-report: # 元数据上报配置, 不包含此字段则不开启元数据上报，应用级服务发现依赖此字段，参考例子：https://github.com/apache/dubbo-go-samples/tree/master/registry/servicediscovery
    protocol: nacos # 元数据上报方式，支持nacos/zookeeper 
    address: 127.0.0.1:8848 
    username: ""
    password: ""
    timeout: "3s"
    group: "dubbo"
  protocols:
    tripleProtocol: # triple协议定义，参考例子https://github.com/apache/dubbo-go-samples/tree/master/rpc/tri
      name: tri # 网络协议，支持tri/dubbo/jsonrpc/grpc
      port: 20001
    dubboProtocol:  # dubbo协议定义，参考例子https://github.com/apache/dubbo-go-samples/tree/master/rpc/dubbo
      name: dubbo
      port: 20000
      params: # dubbo 传输层配置，此字段不配置则使用协议默认值
        reconnect-interval: 0
        connection-number: 1
        heartbeat-period: 5s
        session-timeout: 180s
        pool-size: 64
        pool-ttl: 600
        getty-session-param:
          compress-encoding: false
          tcp-no-delay: true
          tcp-keep-alive: true
          keep-alive-period: 120s
          tcp-r-buf-size: 262144
          tcp-w-buf-size: 65536
          pkg-rq-size: 1024
          pkg-wq-size: 512
          tcp-read-timeout: 1s
          tcp-write-timeout: 5s
          wait-timeout: 1s
          max-msg-len: 1024000
          session-name: client
  config-center: # 配置中心，参考例子：https://github.com/apache/dubbo-go-samples/tree/master/configcenter
    protocol: nacos # 支持 nacos/zookeeper/apollo
    address: 127.0.0.1:8848
    group: dubbo
    namespace: dubbo
    timeout: 10s
    params:
      username: nacos
      password: 123456
  registries: # 注册中心配置，参考例子 https://github.com/apache/dubbo-go-samples/tree/master/metrics
    zk:
      protocol: zookeeper
      timeout: 3s
      address: 127.0.0.1:2181
    nacos:
      timeout: 5s
      address: 127.0.0.1:8848
    etcd:
      address: 127.0.0.1:2379
  consumer: # 客户端配置
    request_timeout: 3s
    filter: myClientFilter # 客户端 filters name，多个则逗号隔开
    registry-ids: zk # 使用上面定义的注册中心id
    max-wait-time-for-service-discovery: 3s # 服务发现最长等待时间
    references:
      GreeterImpl:
        protocol: dubboProtocol
        serialization: hessian2 # 序列化方式
        interface: com.apache.dubbo.sample.basic.IGreeter # 接口名，需要与服务端一致
  provider: # 服务端配置
    registry-ids: zk # 使用上面定义的注册中心id
    services:
      DubboGreeterImpl:
        filter: myServerFilter, myServerFilter2 # server filters name 
        protocol-ids: dubboProtocol # 使用上面定义的协议id
        serialization: hessian2 # hessian 序列化方式
        interface: com.apache.dubbo.sample.basic.IGreeter # 接口名，需要与客户端一致
      TripleGreeterImpl:
        protocol-ids: tripleProtocol # 使用上面定义的协议id
        serialization: protobuf # pb 序列化方式
        interface: com.apache.dubbo.sample.basic.TripleService # 接口名，需要与客户端一致
  logger: # 日志配置，参考例子：https://github.com/apache/dubbo-go-samples/tree/master/logger
    zap-config:
      level: info # 日志级别
    lumberjack-config: 
      filename: logs.log # 文件输出目录
      maxSize: 1
      maxAge: 3
      maxBackups: 5
      localTime: true
      compress: false
   metrics: # 数据上报配置，参考例子：https://github.com/apache/dubbo-go-samples/tree/master/metrics
     enable: true # 数据上报开关，默认开启
     path: /custom-metrics-path # 拉模式数据上报本地监听path 默认/metrics
     port: 9091 # 拉模式数据上报本地监听端口，默认9090
 
```

## 2. 框架读取配置方式

### 2.1 从文件读取

1. 需要按照上述配置结构，定义 dubbogo.yml 文件，并在应用启动之前设置环境变量 `DUBBO_GO_CONFIG_PATH`为 dubbogo.yml 的位置。
2. 在代码中，调用 config.Load 方法，启动框架。一个例子如下：

```go
// export DUBBO_GO_CONFIG_PATH= PATH_TO_SAMPLES/helloworld/go-client/conf/dubbogo.yml
func main() {
    // set consumer struct if needed
    config.SetConsumerService(grpcGreeterImpl)
    
    // config loader start
    if err := config.Load(); err != nil {
        panic(err)
    }
    
    logger.Info("start to test dubbo")
    req := &api.HelloRequest{
        Name: "laurence",
    }
    // do RPC invocation
    reply, err := grpcGreeterImpl.SayHello(context.Background(), req)
    if err != nil {
        logger.Error(err)
    }
    logger.Infof("client response result: %v\n", reply)
}
```

### 2.2 配置 API

用户无需使用配置文件，可直接在代码中以 API 的调用的形式写入配置，如前面"快速开始"部分所提供的例子: 

```go
func main() {
    // init rootConfig with config api
    rc := config.NewRootConfigBuilder().
        SetConsumer(config.NewConsumerConfigBuilder().
            SetRegistryIDs("zookeeper").
            AddReference("GreeterClientImpl", config.NewReferenceConfigBuilder().
                SetInterface("org.apache.dubbo.UserProvider").
                SetProtocol("tri").
                Build()).
            Build()).
        AddRegistry("zookeeper", config.NewRegistryConfigWithProtocolDefaultPort("zookeeper")).
        Build()
    
    // validate consumer greeterProvider
    if err := rc.Init(); err != nil{
        panic(err)
    }
    
    // run rpc invocation
    testSayHello()
}
```

配置 API 看上去写法较为复杂，但单个配置结构的构造过程都是一致的，参考 Java Builder 的设计，我们在配置 API 模块选用 `New().SetA().SetB().Build()`的方式来构造单个配置结构。

将上述例子中的 rootConfig 构造过程，可以拆解为：

```go
referenceConfig := config.NewReferenceConfigBuilder().
    SetInterface("org.apache.dubbo.UserProvider").
    SetProtocol("tri").
    Build()

consumerConfig := config.NewConsumerConfigBuilder().
    SetRegistryIDs("zookeeper").
    AddReference("GreeterClientImpl", referenceConfig).
    Build()).

registryConfig := config.NewRegistryConfigWithProtocolDefaultPort("zookeeper")

rc := config.NewRootConfigBuilder().
    SetConsumer(consumerConfig).
    AddRegistry("zookeeper", registryConfig).
    Build()
```

### 2.3 从配置中心读取

Dubbo-go 服务框架支持将配置文件 'dubbogo.yml' 的内容预先放入配置中心，再通过配置注册中心的地址。在本地 dubbogo.yml 配置文件内只需写入配置中心的信息即可，目前支持作为配置中心的中间件有：apollo、[Nacos](https://nacos.io/)、zookeeper

可参考[配置中心Samples](https://github.com/apache/dubbo-go-samples/tree/master/configcenter)，凡是正确配置了config-center 配置的服务，都会优先从配置中心加载整个配置文件。

```yaml
dubbo:
  config-center:
    protocol: apollo
    address: localhost:8080
    app-id: demo_server
    cluster: default
    namespace: demo-provider-config
# 框架从 apollo 配置中最更新对应位置加载配置文件，并根据该配置文件启动
```

下一章：[【Dubbogo Samples 介绍】](../samples/samples_repo.html)