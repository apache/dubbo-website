---
type: docs
title: "Dubbo 生态"
linkTitle: "生态系统"
weight: 4
---

### 多语言实现
* Golang
* Java
* Rust
* Node
* Python
* PHP

### Dashboard
* [Dubbo-admin](https://github.com/apache/dubbo-admin)

### 支持的组件与部署架构
Dubbo 实现普遍支持以下产品或部署架构。
* 注册中心
  * Zookeeper
  * Nacos
  * Kubernetes
* 元数据中心
  * Zookeeper
  * Nacos
  * Redis
* 配置中心
  * Zookeeper
  * Nacos
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
* [Apache Shenyu(Incubating)]()
* [Apache APISIX]()
* [Apache Dubbo-pixiu]()
* [Tengine]()

### 链路追踪
* [Zipkin]()
* [Apache Skywalking]()

### 其他微服务组件
* 限流 [Sentinel]()
* 事务 [Seata]()


