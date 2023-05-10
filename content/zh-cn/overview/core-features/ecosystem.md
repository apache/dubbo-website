---
aliases:
    - /zh-cn/overview/what/ecosystem/
description: 微服务生态
feature:
    description: |
        一站式微服务生态适配：注册中心、网关、限流降级、负载均衡、一致性事务、异步消息、Tracing 等。
    title: 丰富生态
linkTitle: 微服务生态
title: 微服务生态
type: docs
weight: 10
---

Dubbo 社区和众多优秀的开源项目一起围绕 Dubbo 建立了丰富的微服务生态支持，这让开发者从选型 Dubbo 作为开发框架的第一天，就无需担心后续的服务治理诉求，Dubbo 对每一个常见问题均提供了生产级的解决方案。

以下表格为基于最新 Dubbo Java 3.2.x 版本统计的生态组件支持情况，后续将根据开发进展持续更新。同时每个语言支持的组件完善度会有一定差异，具体请参见各个 [语言参考手册](../../mannual/) 内的详细说明

| 功能 | 组件列表 | 组件列表 | 组件列表 | 组件列表 | 组件列表 |
| --- | --- | --- | --- | --- | --- |
| 服务发现 | [Zookeeper](../../mannual/java-sdk/reference-manual/registry/zookeeper) | [Nacos](../../mannual/java-sdk/reference-manual/registry/nacos) | [Kubernetes Service](/) | DNS【开发中】 | <a href="https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-registry-extensions" target="_blank">更多</a> |
| 动态配置 | [Zookeeper](../../mannual/java-sdk/reference-manual/config-center/zookeeper) | [Nacos](../../mannual/java-sdk/reference-manual/config-center/nacos) | [Apollo](../../mannual/java-sdk/reference-manual/config-center/apollo) | Kubernetes【开发中】| <a href="https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-configcenter-extensions" target="_blank">更多</a> |
| 元数据管理 | [Zookeeper](../../mannual/java-sdk/reference-manual/metadata-center/zookeeper) | [Nacos](../../mannual/java-sdk/reference-manual/metadata-center/nacos)  | [Redis](../../mannual/java-sdk/reference-manual/metadata-center/redis)  | Kubernetes【开发中】 | <a href="https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-metadata-report-extensions" target="_blank">更多</a> |
| RPC 协议 | [HTTP/2 (Triple)](../../reference/protocols/triple) | [TCP](../../reference/protocols/tcp) | [HTTP/REST【Alpha】](../../reference/protocols/http) | [gRPC](../../reference/protocols/triple) | [更多](../../reference/protocols/) |
| 可视化观测平台 | [Admin](../../tasks/observability/admin/) | [Grafana](../../tasks/observability/grafana/) | [Prometheus](../../tasks/observability/prometheus/) | - | - |
| 全链路追踪 | [Zipkin](../../tasks/observability/tracing/zipkin/) | [Skywalking](../../tasks/observability/tracing/skywalking/) | <a href="https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-spring-boot3-tracing#2-adding-micrometer-tracing-bridge-to-your-project" target="_blank">OpenTelemetry</a> | - | - |
| 限流降级 | [Sentinel](../../tasks/rate-limit/sentinel) | [Resilience4j](../../tasks/rate-limit/resilience4j) | [Hystrix](../../tasks/rate-limit/hystrix) | - | - |
| 分布式事务 | [Seata](../../tasks/ecosystem/transaction/) | - | - | - | - |
| 网关 | [Higress]({{< relref "../../../../blog/integration/how-to-proxy-dubbo-in-higress" >}}) | [APISIX](../../tasks/ecosystem/gateway/) | [Shenyu]({{< relref "../../../../blog/integration/how-to-proxy-dubbo-in-apache-shenyu" >}}) | [Envoy](https://www.envoyproxy.io/docs/envoy/latest/configuration/listeners/network_filters/dubbo_proxy_filter) | - |
| 服务网格 | Istio【开发中】 | <a href="https://www.aeraki.net/" target="_blank">Aeraka</a> | OpenSergo【开发中】 | Proxyless【Alpha】 | 更多 |


## 微服务生态示例架构

{{< mse >}}

{{< blocks/section color="white" height="auto" >}}
<div class="msemap-section">
 <div class="msemap-container">
    <div id="mse-arc-container"></div>
  </div>
</div>
{{< /blocks/section >}}


