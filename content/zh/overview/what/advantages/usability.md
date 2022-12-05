---
type: docs
title: "易用性"
linkTitle: "易用性"
weight: 20
---
Dubbo 通过提供面向开发开发侧的编程框架和一系列服务治理套件，极大的简化了微服务构建的复杂度。从开发层面，Dubbo 通过针对不同语言实现定义了一套微服务开发范式，并提供了配套脚手架用于快速搭建微服务项目骨架；从部署上来说，Dubbo 应用可以打包部署，Dubbo 提供了多种；Dubbo 服务治理是真正从解决微服务生产实践问题的角度出发，提供了除服务发现等能力之外的高阶特性。

## 开发
Dubbo 提供了用于快速生成微服务项目脚手架的配套工具（浏览器页面或命令行工具），只需要告诉脚手架你期望包含的功能或组件，脚手架最终可以帮助开发者生成具有合理和必要依赖的工程，里面包含必要的第三方依赖、默认配置等，开发者只需要在特定的位置编写业务逻辑，并通过 Dubbo 特有的方式定义和发布服务即可。

![脚手架示例图]()

Dubbo 并没有发明一套全新的应用开发模式，而是与业界主流的应用开发框架整合，让开发者可以用流行的应用开发框架开发 Dubbo 应用 --- Dubbo 提供了与应用开发框架模式相匹配的 RPC 服务开发模式。

这点我们通过 Java 体系的 Spring Boot 解释过，如果开发者选择基于 Spring/Spring Boot 开发微服务，则 Dubbo 就是构建在 Spring Boot 之上的服务开发框架，这里还是以 Spring Boot 为基础的 Dubbo 应用开发为例，只需要增加相应的注解和配置文件就可以了。

增加 Spring Boot 风格的注解：
```java
@SpringBootApplication
@EnableDubbo
public class ProviderApplication {
}

@DubboService
public class DemoServiceImpl implements DemoService {
}
```

在 `application.yml` 配置文件中增加配置
```yaml
dubbo:
  application:
    name: dubbo-demo
  protocol:
    name: dubbo
    port: -1
  registry:
    address: zookeeper://127.0.0.1:2181
```

关于具体语言的脚手架、开发体验可参见：
* [Dubbo Java 开发指南]()
* [Dubbo Golang 开发指南]()

分布式系统中服务组件由不同团队负责开发，服务间如何透明、高效协作是非常影响开发效率的问题，这包括 API 管理、服务测试、服务静态观测等，Dubbo 对此类场景都提供了一些有用的配套工具。关于服务 API 管理，服务查询、测试、Mock 等，可参加 [Dubbo-Amin]() 的详细描述。
* Dubbo 提供了类似 Swagger 的 API 管理工具，而对于 IDL 也将开源对应的管理工具
* 支持服务测试
* 支持服务 Mock
* Admin 服务查询

### gRPC over Dubbo

### Dubbo 与 Spring Cloud 互通


### Dubbo HTTP

## 部署
Dubbo 原生服务可打包部署到 Docker 容器、Kubernetes、Service Mesh 等云原生基础设施和微服务架构。

对 Docker 部署环境，Dubbo 服务最需要解决的就是注册 IP 地址与通信 IP 地址统一的问题，对于这点

对于 Kubernetes 部署环境，有两种模式
Kubernetes Native Service

对于 Service Mesh 架构，

关于不同环境的部署示例，可参考：
* [部署 Dubbo 服务到 Docker 容器]()
* [部署 Dubbo 服务到 Kubernetes]()
* [部署 Dubbo 服务到 Service Mesh]()

## 治理
对于绝大多数用户来说，Dubbo 原生提供的服务治理定义与实现 (服务发现、负载均衡等) 就能满足微服务实践诉求，开发者只需要做两步使用服务治理

**1. 配置一条注册中心地址**
```yaml
dubbo:
  registry:
    address: zookeeper://127.0.0.1:2181
```
服务消费端、提供端都在 dubbo 配置文件中增加以上配置（以 yaml 格式为例），消费端就能自动发现并对提供端地址发起服务调用，将默认采用基于权重的随机负载均衡，且包含超时、失败重试等默认策略。

**2. 打开 Dubbo Admin 观测服务运行状态**

![Dubbo Admin 运行状态截图]()

服务的基本信息、调用数据等会如上图展示在 Dubbo Admin 之上。

对于更复杂的微服务实践场景，Dubbo 还提供了更多高级的服务治理特性，包括：
* [流量治理]()
* [动态配置]()
* [限流降级]()
* [数据一致性]()
* [可观测性]()
* [多协议]()
* [多注册中心]()
* [Dubbo Mesh]()
