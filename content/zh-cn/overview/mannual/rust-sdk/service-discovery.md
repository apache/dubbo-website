---
aliases:
    - /zh/docs3-v2/rust-sdk/service-discovery/
    - /zh-cn/docs3-v2/rust-sdk/service-discovery/
description: 服务发现
feature:
    description: |
        Dubbo Rust依赖第三方注册中心组件来协调服务发现过程，支持的注册中心： Nacos、Zookeeper。
    title: 服务发现
linkTitle: 服务发现
title: 服务发现
type: docs
weight: 2
---

## Dubbo Rust服务发现简介
Dubbo Rust提供的是一种 Client-Based 的服务发现机制，依赖第三方注册中心组件来协调服务发现过程，支持的注册中心： Nacos、Zookeeper 

以下是 Dubbo Rust服务发现机制的基本工作原理图： 

![service-discovery](/imgs/rust/dubbo-rust-service-discovery.png)

服务发现包含提供者、消费者和注册中心三个参与角色，其中，Dubbo 提供者实例注册 URL 地址到注册中心，注册中心负责对数据进行聚合，Dubbo 消费者从注册中心读取地址列表并订阅变更，每当地址列表发生变化，注册中心将最新的列表通知到所有订阅的消费者实例。

* Dubbo Rust注册中心以服务粒度聚合实例数据，消费者按消费需求精准订阅。

Dubbo Rust服务发现的一个示例：[example](https://github.com/apache/dubbo-rust/tree/feat/cluster/examples/greeter)

## 高效地址推送实现

从注册中心视角来看，它负责以服务名 (例如：org.apache.dubbo.sample.tri.Greeter) 对整个集群的实例地址进行聚合，每个对外提供服务的实例将自身的实例ip:port 地址信息 (例如：127.0.0.1:8848) 注册到注册中心。

## 配置方式
Dubbo Rust服务发现支持两种注册中心组件，既Nacos、Zookeeper，可以通过以下方式创建不同的注册中心，并将其绑定到Dubbo Rust框架。

配置方式：
假设有服务：Greeter，对应的服务实现为GreeterServerImpl

服务端：
```
    //注册服务
    register_server(GreeterServerImpl {
        name: "greeter".to_string(),
    });
    
    //创建注册中心
    let zkr = ZookeeperRegistry::default();
    
    let r = RootConfig::new();
    let r = match r.load() {
        Ok(config) => config,
        Err(_err) => panic!("err: {:?}", _err), // response was droped
    };
    
    //启动Dubbo框架
    let mut f = Dubbo::new()
        .with_config(r)
        //将创建出的注册中心绑定Dubbo框架
        .add_registry("zookeeper", Box::new(zkr));
    f.start().await;
```
对于上述过程，可以通过修改创建注册中心的步骤来更改所使用的注册中心

客户端：
```
    let mut builder = ClientBuilder::new();
    
    //通过env获取注册中心地址
    if let Ok(zk_servers) = env::var("ZOOKEEPER_SERVERS") {
        //创建注册中心
        let zkr = ZookeeperRegistry::new(&zk_servers);
        //绑定注册中心
        let directory = RegistryDirectory::new(Box::new(zkr));
        builder = builder.with_directory(Box::new(directory));
    } else if let Ok(nacos_url_str) = env::var("NACOS_URL") {
        // NACOS_URL=nacos://mse-96efa264-p.nacos-ans.mse.aliyuncs.com
        //创建注册中心
        let nacos_url = Url::from_url(&nacos_url_str).unwrap();
        let registry = NacosRegistry::new(nacos_url);
        //绑定注册中心
        let directory = RegistryDirectory::new(Box::new(registry));
        builder = builder.with_directory(Box::new(directory));
    } else {
        builder = builder.with_host("http://127.0.0.1:8888");
    }
    
    let mut cli = GreeterClient::new(builder);
```

创建Nacos注册中心：
```
//通过Url创建注册中心实例
let nacos_url = Url::from_url("127.0.0.1:1221").unwrap();
let registry = NacosRegistry::new(nacos_url);
```
创建Zookeeper注册中心：
```
//直接创建Zookeeper注册中心
let zkr = ZookeeperRegistry::new("127.0.0.1:1221");
```
```
//使用default方法创建Zookeeper注册中心会默认使用环境变量中的值ZOOKEEPER_SERVERS
let zkr = ZookeeperRegistry::default();
```
