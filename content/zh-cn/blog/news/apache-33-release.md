---
title: "Apache Dubbo 3.3 全新发布：Triple X 领衔，开启微服务通信新时代"
linkTitle: "Apache Dubbo 3.3 全新发布"
date: 2024-09-11
tags: ["新闻动态"]
description: >
  在 Apache Dubbo 突破 4w Star 之际，Apache Dubbo 团队正式宣布，Dubbo 3.3 正式发布！作为全球领先的开源微服务框架，Dubbo 一直致力于为开发者提供高性能、可扩展且灵活的分布式服务解决方案。此次发布的 Dubbo 3.3，通过 Triple X 的全新升级，突破了以往局限，实现了对南北向与东西向流量的全面支持，并提升了对云原生架构的友好性。
---

在 Apache Dubbo 突破 4w Star 之际，Apache Dubbo 团队正式宣布，Dubbo 3.3 正式发布！作为全球领先的开源微服务框架，Dubbo 一直致力于为开发者提供高性能、可扩展且灵活的分布式服务解决方案。此次发布的 Dubbo 3.3，通过 Triple X 的全新升级，突破了以往局限，实现了对南北向与东西向流量的全面支持，并提升了对云原生架构的友好性。

## Dubbo 的基础介绍

**Apache Dubbo** 是一个高性能、轻量级的微服务框架，最初由 Java 开发，但现在已扩展支持 **Go、Rust、Python** 等多种语言，为全球企业构建跨语言、跨平台的分布式系统提供了强有力的支持。Dubbo 提供了丰富的服务治理能力，包括服务注册与发现、负载均衡、容错机制和调用链追踪，帮助开发者构建高效、灵活的微服务架构。

随着 Dubbo 逐渐演进，其通信性能、服务治理能力和跨语言兼容性得到了大幅提升，成为支持现代微服务架构的理想工具。

## Triple X 全新升级背景

在 Dubbo 的早期应用中，虽然其在数据中心内部的服务互通中展现了卓越的性能，但随着技术演进和应用场景的扩展，原有架构逐渐暴露出了一些瓶颈。这些瓶颈在跨区域、跨云的环境中尤为明显，尤其是在 Web 框架与 RPC 框架之间的频繁切换中，开发复杂性和系统性能都受到了影响。

**传统架构的痛点主要体现在：**

1.  **局限于数据中心内的应用场景**：在跨地域或跨云应用中，Dubbo 的传统架构缺乏对广域环境的原生支持，导致开发者需要在多种协议和框架中切换，增加了复杂性。

2.  **南北向与东西向流量的双重挑战**：在现代微服务架构下，传统的 RPC 框架往往更侧重服务间（东西向）流量优化，而南北向通信的性能要求日益增加，对传统 Dubbo 架构提出了新的挑战。

3.  **云原生与跨语言互操作性要求**：随着云原生技术的普及，系统需要对 HTTP 协议有更深层次的支持，并具备跨语言的通信能力，然而传统 Dubbo 在这一点上并未原生优化。


**Triple X 的变革和突破：** Triple X 的诞生，直接回应了这些痛点，它不仅延续了 Dubbo 一贯的高性能通信能力，还实现了与 gRPC 协议的全面兼容，通过支持 HTTP/1、HTTP/2、HTTP/3 等协议，为跨云、跨区域的广泛应用场景提供了更具灵活性和高效性的解决方案。

![image.png](/imgs/blog/33-release/ee5812e0-a90b-4a02-abab-b658cdddefc1.png)

## Triple X 核心能力概述

*   **全面支持南北向与东西向流量**：Triple X 无缝支持从客户端到服务器的南北向流量及服务间通信的东西向流量，并确保灵活转换，提升通信链路的整体效率。

*   **遵循 gRPC 协议标准**：Triple X 遵循了 gRPC 协议标准，支持通过 Protobuf 进行通信，与 gRPC 服务无缝交互，扩展了 Dubbo 的跨语言、跨平台通信能力。

*   **基于 HTTP 协议，原生支持云原生架构**：Triple X 构建于 HTTP/1、HTTP/2 和 HTTP/3 协议栈之上，全面优化了网络通信性能，并与现代云原生基础设施无缝集成，支持各种网关和服务网格。

*   **高性能优化**：Triple X 提供了极致的性能提升，尤其在高并发和弱网环境下表现卓越，极大提高了系统吞吐量与响应速度。

*   **平滑迁移与框架兼容**：支持从现有的 Spring Web 项目无缝迁移，开发者无需更改现有代码即可切换至 Triple X，提升性能，并保留对 Spring MVC 等框架的支持。

*   **高扩展性**：Triple X 新引入 20+ SPI 扩展点，支持自定义核心行为，包括路由映射、参数解析、序列化及异常处理等。显著提升框架的灵活性和可定制性，使开发者能够根据特定业务需求和场景自定义行为，提高开发效率并降低定制化成本。


## Triple X 使用场景

**Triple X** 在 Dubbo 3.3 中为微服务架构提供了灵活的接入方式，能够适应不同场景下的系统需求。根据系统架构的不同，Triple X 提供了 **中心化接入方式** 和 **去中心化接入方式**，适用于多种应用场景。

### 1. 中心化接入方式

在 **中心化接入方式** 中，外部流量通过一个统一的服务网关进入 Dubbo 后端服务。网关负责处理 HTTP 流量的解析、转发，并将请求路由到合适的后端服务中。这种方式适用于对流量统一管理、流量控制、权限校验等有较高要求的系统，能够集中式地控制流量的进入点。

![lQLPJxkYhOcUzFfNA3bNC0Sw5rRkqBkcwQ4GwaypwVc_AA_2884_886.png](/imgs/blog/33-release/78d6744b-928a-41d4-857c-ff91ad69c896.png)

*   **使用场景**：当系统需要集中管理外部请求、对流量进行监控和限流等操作时，Triple X 能够通过服务网关处理 HTTP/1、HTTP/2 和 HTTP/3 的流量，并高效地转发给 Dubbo 服务进行处理。

*   **优势**：集中化控制、易于管理，适合大规模系统中的统一流量治理。


### 2. 去中心化接入方式

在 **去中心化接入方式** 中，外部客户端可以直接通过 HTTP 协议访问后端 Dubbo 服务，而不需要依赖中间的网关层。这种方式适合对性能和低延迟有较高要求的系统，通过减少网关的转发，直接将流量路由到服务节点，从而降低通信开销，提升系统响应速度。网关节点的消除，能避免网关故障造成的系统不可用，简化部署架构，提升系统稳定性。

![lQLPJw7B47rI7FfNAzjNCYiwStDS2ladC3oGwaypwZe9AA_2440_824.png](/imgs/blog/33-release/68b69954-9df2-48b2-bd63-fe07ba8cb25b.png)

*   **使用场景**：当系统希望通过直接的 HTTP 流量接入 Dubbo 服务，减少中间环节，提高系统的响应速度时，Triple X 提供了直接暴露 REST API 的能力，无需借助网关即可完成服务导出。

*   **优势**：去除中间环节，提升性能和响应速度，简化了架构，适合对低延迟有需求的应用场景。


## Triple X 核心能力拆解说明

### 1. 支持全面的流量管理与高效通信

在复杂的微服务架构中，南北向流量（客户端到服务器）和东西向流量（服务间通信）需要采用不同的技术进行处理，系统往往面临性能瓶颈与复杂的开发和运维问题。

Triple X 协议通过统一的通信协议，同时支持南北向与东西向流量。无需在 Web 框架与 RPC 框架之间切换，简化了开发流程，提升了系统的整体性能和可维护性。

开发者可以通过 Triple X 实现全方位的流量支持，无论是用户发起的请求，还是服务间的通信，均可通过 Triple X 实现高效传输。

```java
package org.apache.test;

@DubboService
public class UserServiceImpl implements UserService {
    // 处理东西向请求
}

// Triple X 也支持南北向流量处理
@DubboService
public class OrderService {
    @GetMapping("/order/{orderId}")
    public Order getOrderById(@PathVariable("orderId") String orderId) {}
}
```

调用方式：

1.  Dubbo Client 直接发起 RPC 调用

2.  前端使用 HTTP 直接请求，目标路径为 `http://server:50051/order/{orderId}`

3.  使用 Dubbo 默认发布的路径进行请求，目标路径为 `http://server:50051/org.apache.test.OrderService/getOrderById?orderId=xxx`


### 2. 遵循 gRPC 协议标准

跨语言服务之间的通信经常成为分布式系统中的难题，gRPC 是常用的解决方案之一，但传统 Dubbo 需要借助额外工具实现与 gRPC 的互操作性。

Triple X 遵循 **gRPC 协议标准**，通过 Protobuf 实现与 gRPC 的无缝交互，简化了开发流程，增强了跨语言和跨平台通信能力。

使用 Triple X 的服务可直接与基于 gRPC 的服务进行互通，无需额外适配，系统之间即可高效互访。

### 3. 基于 HTTP 协议，原生支持云原生架构

在云原生环境下，服务需要与各种网络设施（如 API 网关、服务网格）进行高效集成，同时支持多种 HTTP 协议以优化网络性能。

Triple X 同时支持 **HTTP/1、HTTP/2 和 HTTP/3** 协议，开发者无需进行额外配置即可利用这些协议的优势，包括长连接、多路复用和头部压缩，从而实现高效的网络通信。使用 **HTTP/3** 还能彻底解决队头阻塞问题，同时基于 UDP 的通讯方式，在弱网下能够维持较高的连接质量和服务性能，同等环境 TCP 在高丢包率下可能已不可用。

Triple X 支持复用 Spring Boot 现有 **Servlet** 端口接入 HTTP 流量，无需新增 Netty 监听端口。网络架构的简化，可以降低使用和维护成本，提升安全性，流量易于通过企业防火墙和网关。

![image.png](/imgs/blog/33-release/0e6b75c3-3340-4bed-a566-88c46a03ada6.png)

### 4. 高性能优化，提升 5 倍 QPS

在高并发场景中，传统通信协议并未做深度优化，容易造成瓶颈，影响系统的整体响应时间和吞吐量。

Triple X 通过 **Radix Tree** 和 **Zero Copy** 等技术降低了 CPU 使用和内存用量，显著提升了系统性能，尤其在高并发和弱网环境下表现突出：

*   **高效路由**：采用 Radix Tree 前缀树结构进行路由匹配，优化 key hash 算法并支持动态更新，减少内存占用，提高匹配效率。

*   **内存使用优化**：结合 Zero Copy 技术和对象复用技术，减少数据复制和对象创建开销，降低垃圾回收压力，提升吞吐量。

*   **HTTP/3 支持**：引入基于 QUIC 的 HTTP/3 协议，显著提升弱网环境下的性能表现，解决队头阻塞问题，减少延迟并提高连接可靠性。

*   **多协议压测优化**：Dubbo 团队对各种协议进行了全面压测，基于测试结果进行了多轮性能优化，确保在不同场景下都能达到最佳表现。


经过压测，简单 Rest 服务相较于传统 Spring Boot REST 服务，Triple X 服务的平均响应时间降低至 1/3，高压力下 QPS 提升 5 倍，同时内存分配量减少 50%，显著提升了系统整体性能和资源利用效率。

![image.png](/imgs/blog/33-release/c7d4f983-f619-4d39-94b6-5d62fd5a430e.png)

![image.png](/imgs/blog/33-release/53a6f3c7-20ad-49f6-abc0-4e2d80a9597d.png)

![image.png](/imgs/blog/33-release/7e4f3ced-9932-472f-bb8f-272ec97a7fbe.png)

![image.png](/imgs/blog/33-release/5f8ebef5-08f3-463a-bb86-14b32a09ebb2.png)

### 5. 平滑迁移与框架兼容

此外，Triple X 还支持对于已有 Spring Web 的项目，在不大幅修改代码的前提下提升性能，向微服务架构迁移。

Triple X 支持零侵入式的迁移方案，开发者无需更改现有代码即可将现有的 Spring Web 项目迁移至 Triple X，同时保留对 Spring MVC 等框架的支持。

```java
@DubboService    // 仅需添加服务发布配置
@RestController
public class DemoController {

    @GetMapping("/spring-test")
    public String sayHello(@RequestParam("name") String name) {
        return "Hello " + name;
    }
}
```

## 此次版本升级其他的能力优化概述

### 1. Native Image AOT 支持

Dubbo 3.3 引入了对 **Native Image AOT（Ahead-of-Time 编译）** 的支持，开发者可以将 Dubbo 应用编译为原生二进制文件，极大缩短启动时间，降低内存占用，特别适合无服务器（Serverless）场景。

### 2. Project Loom 支持

Dubbo 3.3 提供了对 **Project Loom** 的支持，通过虚拟线程优化了高并发场景下的线程管理，简化了异步编程模型，提升了并发处理能力。

### 3. 全新路由规则

在路由机制上，Dubbo 3.3 引入了全新的路由规则，支持更加灵活的流量控制和服务治理，增强了微服务系统在大规模部署中的适应性。

## 总结

**Apache Dubbo 3.3** 的发布标志着微服务通信技术迈向新高度。通过 **Triple X**，Dubbo 不仅实现了对南北向与东西向流量的全面支持，还通过与 gRPC 的无缝集成、基于 HTTP 协议的云原生支持以及高性能优化，为开发者提供了更强大、灵活的工具，帮助他们构建现代分布式系统。

无论是提升服务间通信的高效性、实现跨语言兼容，还是优化云原生环境下的通信性能，Dubbo 3.3 都是开发者应对现代分布式系统挑战的理想选择。立即升级至 Dubbo 3.3，体验 **Triple X** 带来的变革，开启微服务通信的新时代！

更多升级指南和兼容性说明，请参考[Dubbo 3.2 升级 3.3 指南](/zh-cn/overview/mannual/java-sdk/reference-manual/upgrades-and-compatibility/version/3.2-to-3.3-compatibility-guide/)。
