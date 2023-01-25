---
title: Dubbo 文档
noedit: true
type: docs
linkTitle: "主页"
main_menu: true
weight: 10
hide_feedback: true
no_list: true
hide_summary: true
menu:
  main:
    name: "文档"
    weight: 1
description: Apache Dubbo 是一款支持多语言的、易用的 web 和 rpc 框架，同时为构建企业级微服务提供服务发现、流量治理、可观测、认证鉴权等能力、工具与最佳实践。
content:
  - 快速开始:
    - name: "了解 Dubbo"
      description: aaa
      links:
        - "[为什么需要 Dubbo](../what/)"
        - "[概念与架构](../what/overview/)"
        - "[对比 gRPC、Spring Cloud、Istio](../what/xyz-difference/)"
        - "[核心特性](../what/advantages/)"
    - name: "尝试使用 Dubbo 开发微服务"
      description: aaa
      links:
        - "[Java 微服务开发](../quickstart/java/)"
        - "[Go 微服务开发](../quickstart/go/)"
        - "[Rust 微服务开发](../../quickstart/rust/)"
        - "[Node.js 微服务开发](../quickstart/nodejs/)"
    - name: "跟随示例学习 Dubbo"
      description: aaa
      links:
        - "[开发服务](../tasks/develop/)"
        - "[部署服务](../tasks/deploy/)"
        - "[流量管控](../tasks/traffic-management/)"
        - "[观测服务](../tasks/observability/)"
    - name: "生产环境的 Dubbo 微服务生态"
      description: aaa
      links:
        - "[服务发现&配置&元数据中心](../tasks/ecosystem/service-discovery/)"
        - "[限流降级](../tasks/ecosystem/rate-limit/)"
        - "[HTTP 网关](../tasks/ecosystem/gateway/)"
        - "[保证数据一致性](../tasks/ecosystem/transaction/)"
        - "[Tracing 全链路追踪](../tasks/ecosystem/tracing/)"
        - "[自定义扩展](../tasks/extensibility/)"
    - name: "Admin 可视化监测服务"
      description: aaa
      links:
        - "[服务查询](reference-manual/config/)"
        - "[流量管控](reference-manual/config/)"
        - "[Metrics 指标]()"
        - "[Grafana & Prometheus]()"
    - name: "Dubbo 与服务网格"
      description: aaa
      links:
        - "[Dubbo Mesh 架构](../core-features/service-mesh/)"
        - "[Bookinfo 任务](../tasks/mesh/bookinfo/)"
        - "[平滑迁移](../tasks/mesh/bookinfo/)"
    - name: "SDK 参考手册"
      description: aaa
      links:
        - "[Java 参考手册](../../docs3-v2/java-sdk/home/)"
        - "[Golang 参考手册](../../docs3-v2/go-sdk/home/)"
        - "[Rust 参考手册](../../docs3-v2/rust-sdk/home/)"
        - "[Node 参考手册](../../docs3-v2/nodejs-sdk/home/)"
    - name: "关心 Dubbo3"
      description: aaa
      links:
         - "[Dubbo3 概述](../what/overview/)"
         - "[IDL & Triple(HTTP/2)]()"
         - "[gRPC over Dubbo]()"
         - "[应用级服务发现](../core-features/service-discovery/)"
         - "[平滑迁移](../../docs3-v2/java-sdk/upgrades-and-compatibility/2.x-to-3.x-compatibility-guide)"

---
Apache Dubbo 是一款易用的、提供高性能通信和服务治理能力的微服务开发框架，Dubbo 提供多种语言实现，请通过以下链接跳转到对应语言示例。
<br/>
<br/>
<br/>

{{% docs/document_box %}}
