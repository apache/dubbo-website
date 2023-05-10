---
aliases:
    - /zh/overview/core-features/service-definition/
description: 微服务开发
linkTitle: 微服务开发
title: 微服务开发
type: docs
weight: 1
---


Dubbo 解决企业微服务从开发、部署到治理运维的一系列挑战，Dubbo 为开发者提供从项目创建、开发测试，到部署、可视化监测、流量治理，再到生态集成的全套服务。
* **开发层面**，Dubbo 提供了 Java、Go、Rust、Node.js 等语言实现并定义了一套微服务开发范式，配套脚手架可用于快速创建微服务项目骨架
* **部署层面**，Dubbo 应用支持虚拟机、Docker 容器、Kubernetes、服务网格架构部署
* **服务治理层面**，Dubbo 提供了地址发现、负载均衡、流量管控等治理能力，官方还提供 Admin 可视化控制台、丰富的微服务生态集成

## 开发

接下来以 Java 体系 Spring Boot 项目为例讲解 Dubbo 应用开发的基本步骤，整个过程非常直观简单，其他语言开发过程类似。

### 创建项目
<a href="https://start.dubbo.apache.org/bootstrap.html" target="_blank">Dubbo 微服务项目脚手架</a>（支持浏览器页面、命令行和 IDE）可用于快速创建微服务项目，只需要告诉脚手架期望包含的功能或组件，脚手架最终可以帮助开发者生成具有必要依赖的微服务工程。更多脚手架使用方式的讲解，请参见任务模块的 [通过模板生成项目脚手架](../../tasks/develop/template/)

![脚手架示例图](/imgs/v3/advantages/initializer.png)

### 开发服务

**1. 定义服务**

```java
public interface DemoService {
    String hello(String arg);
}
```

**2. 提供业务逻辑实现**

```java
@DubboService
public class DemoServiceImpl implements DemoService {
    public String hello(String arg) {
        // put your microservice logic here
    }
}
```

### 发布服务
**1. 发布服务定义**

为使消费方顺利调用服务，服务提供者首先要将服务定义以 Jar 包形式发布到 Maven 中央仓库。

**2. 对外暴露服务**

补充 Dubbo 配置并启动 Dubbo Server

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

### 调用服务

首先，消费方通过 Maven/Gradle 引入 `DemoService` 服务定义依赖。

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-demo-interface</artifactId>
    <version>3.2.0</version>
</dependency>
```

编程注入远程 Dubbo 服务实例

```java
@Bean
public class Consumer {
    @DubboReference
    private DemoService demoService;
}
```

以上是 Dubbo 微服务开发的流程性说明，实际开发的详细指导步骤请参见：
* [Java 微服务开发入门](../../quickstart/java)
* [Go 微服务开发入门](../../quickstart/go)
* [Rust 微服务开发入门](../../quickstart/rust)
* [Node.js 微服务开发入门](https://github.com/apache/dubbo-js)

## 部署
Dubbo 原生服务可打包部署到 Docker 容器、Kubernetes、服务网格 等云原生基础设施和微服务架构。

关于不同环境的部署示例，可参考：
* [部署 Dubbo 服务到 Docker 容器](../../tasks/deploy/deploy-on-docker)
* [部署 Dubbo 服务到 Kubernetes](../../tasks/deploy/deploy-on-k8s-docker)

## 治理
对于服务治理，绝大多数应用只需要增加以下配置即可，Dubbo 应用将具备地址发现和负载均衡能力。

```yaml
dubbo:
  registry:
    address: zookeeper://127.0.0.1:2181
```

部署并打开 [Dubbo Admin 控制台](../../tasks/deploy)，可以看到集群的服务部署和调用数据

![Admin](/imgs/v3/what/admin.png)

除此之外，Dubbo Amin 还可以通过以下能力提升研发测试效率
* 文档管理，提供普通服务、IDL 文档管理
* 服务测试 & 服务 Mock
* 服务状态查询

对于更复杂的微服务实践场景，Dubbo 还提供了更多高级服务治理特性，具体请参见文档了解更多。包括：
* 流量治理
* 动态配置
* 限流降级
* 数据一致性
* 可观测性
* 多协议
* 多注册中心
* 服务网格
