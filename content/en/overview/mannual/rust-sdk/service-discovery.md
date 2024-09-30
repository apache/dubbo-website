---
aliases:
    - /en/docs3-v2/rust-sdk/service-discovery/
    - /en/docs3-v2/rust-sdk/service-discovery/
description: Service Discovery
linkTitle: Service Discovery
title: Service Discovery
type: docs
weight: 2
---

## Introduction to Dubbo Rust Service Discovery
Dubbo Rust provides a client-based service discovery mechanism that relies on third-party registry components to coordinate the service discovery process. Supported registries: Nacos, Zookeeper.

The following is a basic working principle diagram of the Dubbo Rust service discovery mechanism:

![service-discovery](/imgs/rust/dubbo-rust-service-discovery.png)

Service discovery involves three participant roles: provider, consumer, and registry. The Dubbo provider instance registers its URL with the registry, which is responsible for aggregating the data. The Dubbo consumer reads the address list from the registry and subscribes to changes. Whenever the address list changes, the registry notifies all subscribed consumer instances with the latest list.

* Dubbo Rust aggregates instance data at the service granularity, allowing consumers to accurately subscribe based on their consumption needs.

An example of Dubbo Rust service discovery: [example](https://github.com/apache/dubbo-rust/tree/feat/cluster/examples/greeter)

## Efficient Address Push Implementation

From the perspective of the registry, it aggregates the instance addresses of the entire cluster by service name (e.g., org.apache.dubbo.sample.tri.Greeter). Each service-providing instance registers its IP:port address information (e.g., 127.0.0.1:8848) with the registry.

## Configuration Methods
Dubbo Rust service discovery supports two types of registry components: Nacos and Zookeeper. Different registries can be created and bound to the Dubbo Rust framework as follows.

Configuration method:
Assuming there is a service: Greeter, the corresponding service implementation is GreeterServerImpl.

Server:
```
// Register service
register_server(GreeterServerImpl {
    name: "greeter".to_string(),
});

// Create registry
let zkr = ZookeeperRegistry::default();

let r = RootConfig::new();
let r = match r.load() {
    Ok(config) => config,
    Err(_err) => panic!("err: {:?}", _err), // response was dropped
};

// Start Dubbo framework
let mut f = Dubbo::new()
    .with_config(r)
    // Bind the created registry to the Dubbo framework
    .add_registry("zookeeper", Box::new(zkr));
f.start().await;
```
For the above process, the registry used can be changed by modifying the steps to create the registry.

Client:
```
let mut builder = ClientBuilder::new();

// Get registry address via env
if let Ok(zk_servers) = env::var("ZOOKEEPER_SERVERS") {
    // Create registry
    let zkr = ZookeeperRegistry::new(&zk_servers);
    // Bind registry
    let directory = RegistryDirectory::new(Box::new(zkr));
    builder = builder.with_directory(Box::new(directory));
} else if let Ok(nacos_url_str) = env::var("NACOS_URL") {
    // NACOS_URL=nacos://mse-96efa264-p.nacos-ans.mse.aliyuncs.com
    // Create registry
    let nacos_url = Url::from_url(&nacos_url_str).unwrap();
    let registry = NacosRegistry::new(nacos_url);
    // Bind registry
    let directory = RegistryDirectory::new(Box::new(registry));
    builder = builder.with_directory(Box::new(directory));
} else {
    builder = builder.with_host("http://127.0.0.1:8888");
}

let mut cli = GreeterClient::new(builder);
```

Create Nacos registry:
```
// Create registry instance through Url
let nacos_url = Url::from_url("127.0.0.1:1221").unwrap();
let registry = NacosRegistry::new(nacos_url);
```
Create Zookeeper registry:
```
// Directly create Zookeeper registry
let zkr = ZookeeperRegistry::new("127.0.0.1:1221");
```
```
// Using the default method to create Zookeeper registry will use the value of ZOOKEEPER_SERVERS in the environment variables by default
let zkr = ZookeeperRegistry::default();
```

