---
type: docs
title: "Dubbo 生态"
linkTitle: "生态系统"
weight: 4
---

### Dashboard
* [Dubbo-admin](https://github.com/apache/dubbo-admin)

### 支持的组件与部署架构

Dubbo 实现普遍支持以下产品或部署架构，具体多语言 SDK 实现可能有差异。

* 注册中心
  * Zookeeper
  * [Nacos](https://nacos.io/zh-cn/docs/use-nacos-with-dubbo.html)
  * Kubernetes
* 元数据中心
  * Zookeeper
  * [Nacos](https://nacos.io/zh-cn/docs/use-nacos-with-dubbo.html)
  * Redis
* 配置中心
  * Zookeeper
  * [Nacos](https://nacos.io/zh-cn/docs/use-nacos-with-dubbo.html)
  * Redis
  * Apollo
* Mesh
  * 数据面 Envoy
  * 控制面 Istio

### 协议与互通性
* 基于 Triple 协议可实现与 gRPC 体系互通
* 基于 REST 协议以及应用级服务发现可实现 Spring Cloud 体系在协议和地址发现层面的互通

### SPI 集成
这里有众多的 Dubbo 扩展实现，包括协议、序列化、注册中心等
* [dubbo-spi-extensions]()

### 网关组件
* [Apache Shenyu(Incubating)](https://dubbo.apache.org/zh/blog/2022/05/04/%E5%A6%82%E4%BD%95%E9%80%9A%E8%BF%87-apache-shenyu-%E7%BD%91%E5%85%B3%E4%BB%A3%E7%90%86-dubbo-%E6%9C%8D%E5%8A%A1/)
* [Apache APISIX](https://dubbo.apache.org/zh/blog/2022/01/18/%E4%BB%8E%E5%8E%9F%E7%90%86%E5%88%B0%E6%93%8D%E4%BD%9C%E8%AE%A9%E4%BD%A0%E5%9C%A8-apache-apisix-%E4%B8%AD%E4%BB%A3%E7%90%86-dubbo-%E6%9C%8D%E5%8A%A1%E6%9B%B4%E4%BE%BF%E6%8D%B7/)
* [Apache Dubbo-pixiu]()
* [Tengine]()

### 链路追踪
* [Zipkin]()
* [Apache Skywalking]()

### 其他微服务组件
* 限流 [Sentinel]()
* 事务 [Seata]()

### 多语言实现
* Golang
* Java
* Rust
* Node
* Python
* PHP
