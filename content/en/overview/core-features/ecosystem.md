---
description: Microservices Ecosystem
feature:
    description: |
        One-stop microservice ecosystem adaptation: service registry, gateway, rate limiting and fallback, load balancing, consistent transactions, asynchronous messaging, tracing, and more.
    title: Rich Ecosystem
linkTitle: Microservices Ecosystem
title: Microservices Ecosystem
type: docs
weight: 90
---

The Dubbo community, along with numerous outstanding open-source projects, has established a rich microservices ecosystem support around Dubbo. This allows developers to opt for Dubbo as their development framework without worrying about subsequent service governance needs. From day one, Dubbo offers production-level solutions for every common issue.

The table below shows the support for ecosystem components based on the latest Dubbo Java 3.2.x version, which will be continuously updated based on development progress. The completeness of components supported in each language may vary. For specifics, please refer to the detailed explanations in each [language reference manual](../../mannual/).



| Feature                             | Component List                                                                                       | Component List                                                         | Component List                                                                                                                                                          | Component List                                                                                                  | Component List                                                                                      |
|-------------------------------------|------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| Service Discovery                   | [Zookeeper](/en/docs3-v2/java-sdk/reference-manual/registry/zookeeper/)                              | [Nacos](/en/docs3-v2/java-sdk/reference-manual/registry/nacos/)        | [Kubernetes Service](/)                                                                                                                                                 | DNS&#8203;``oaicite:{"number":1,"invalid_reason":"Malformed citation 【Under Development】"}``&#8203;             | [More](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-registry-extensions)        |
| Dynamic Configuration               | [Zookeeper](/en/docs3-v2/java-sdk/reference-manual/config-center/zookeeper/)                         | [Nacos](/en/docs3-v2/java-sdk/reference-manual/config-center/nacos/)   | [Apollo](/en/docs3-v2/java-sdk/reference-manual/config-center/apollo/)                                                                                                  | Kubernetes&#8203;``oaicite:{"number":2,"invalid_reason":"Malformed citation 【Under Development】"}``&#8203;      | [More](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-configcenter-extensions)    |
| Metadata Management                 | [Zookeeper](/en/docs3-v2/java-sdk/reference-manual/metadata-center/zookeeper/)                       | [Nacos](/en/docs3-v2/java-sdk/reference-manual/metadata-center/nacos/) | [Redis](/zh-cn/overview/mannual/java-sdk/reference-manual/metadata-center/redis/)                                                                                       | Kubernetes&#8203;``oaicite:{"number":3,"invalid_reason":"Malformed citation 【Under Development】"}``&#8203;      | [More](https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-metadata-report-extensions) |
| RPC Protocols                       | [HTTP/2 (Triple)](/en/docs3-v2/java-sdk/reference-manual/protocol/triple/)                           | [TCP](/zh-cn/overview/reference/protocols/tcp/)                        | [HTTP/REST&#8203;``oaicite:{"number":4,"invalid_reason":"Malformed citation 【Alpha】"}``&#8203;](/en/docs3-v2/java-sdk/reference-manual/protocol/http)                   | [gRPC](/en/docs3-v2/java-sdk/reference-manual/protocol/triple)                                                | [More](/en/docs3-v2/java-sdk/reference-manual/protocol/)                                            |
| Visualization & Monitoring Platform | [Admin](/zh-cn/overview/tasks/observability/admin/)                                                  | [Grafana](/zh-cn/overview/tasks/observability/grafana/)                | [Prometheus](/zh-cn/overview/tasks/observability/prometheus/)                                                                                                           | -                                                                                                               | -                                                                                                   |
| Full-link Tracing                   | [Zipkin](/zh-cn/overview/tasks/observability/tracing/zipkin/)                                        | [Skywalking](/zh-cn/overview/tasks/observability/tracing/skywalking/)  | [OpenTelemetry](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-spring-boot3-tracing#2-adding-micrometer-tracing-bridge-to-your-project) | -                                                                                                               | -                                                                                                   |
| Rate Limiting & Fallback            | [Sentinel](/zh-cn/overview/tasks/rate-limit/sentinel)                                                | [Resilience4j](/zh-cn/overview/tasks/rate-limit/resilience4j)          | [Hystrix](/zh-cn/overview/tasks/rate-limit/hystrix)                                                                                                                     | -                                                                                                               | -                                                                                                   |
| Distributed Transactions            | [Seata](/en/overview/tasks/ecosystem/transaction/)                                                   | -                                                                      | -                                                                                                                                                                       | -                                                                                                               | -                                                                                                   |
| Gateway                             | [Higress]                                    | [APISIX](/zh-cn/overview/tasks/ecosystem/gateway/)                     | [Shenyu]                                                                                                  | [Envoy](https://www.envoyproxy.io/docs/envoy/latest/configuration/listeners/network_filters/dubbo_proxy_filter) | -                                                                                                   |
| Service Mesh                        | Istio&#8203;``oaicite:{"number":5,"invalid_reason":"Malformed citation 【Under Development】"}``&#8203; | [Aeraka](https://www.aeraki.net/)                                      | OpenSergo&#8203;``oaicite:{"number":6,"invalid_reason":"Malformed citation 【Under Development】"}``&#8203;                                                               | Proxyless&#8203;``oaicite:{"number":7,"invalid_reason":"Malformed citation 【Alpha】"}``&#8203;                   | More                                                                                                |


## Microservices Ecosystem Example Architecture

{{< mse >}}

{{< blocks/section color="white" height="auto" >}}
<div class="msemap-section">
 <div class="msemap-container">
    <div id="mse-arc-container"></div>
  </div>
</div>
{{< /blocks/section >}}
