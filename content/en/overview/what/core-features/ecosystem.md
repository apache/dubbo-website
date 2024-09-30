---
aliases:
    - /en/overview/what/ecosystem/
    - /en/overview/core-features/ecosystem/
description: Microservices Ecosystem
feature:
    description: |
        One-stop microservices ecosystem adaptation: registry center, gateway, rate limiting and degradation, load balancing, consistent transactions, asynchronous messaging, tracing, etc.
    title: Rich Ecosystem
linkTitle: Microservices Ecosystem
title: Microservices Ecosystem
type: docs
weight: 10
---

The Dubbo community, along with many excellent open-source projects, has established a rich microservices ecosystem around Dubbo. This ensures that developers do not need to worry about subsequent service governance demands from the first day they choose Dubbo as their development framework. Dubbo provides production-grade solutions for every common issue.

The following table shows the support status of ecosystem components based on the latest Dubbo Java 3.2.x version. It will be continuously updated according to development progress. The completeness of components supported by each language may vary, so please refer to the detailed descriptions in each [language reference manual](../../mannual/).

| Function | Component List | Component List | Component List | Component List | Component List |
| --- | --- | --- | --- | --- | --- |
| Service Discovery | [Zookeeper](../../mannual/java-sdk/reference-manual/registry/zookeeper) | [Nacos](../../mannual/java-sdk/reference-manual/registry/nacos) | [Kubernetes Service](/) | DNS [In Development] | <a href="https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-registry-extensions" target="_blank">More</a> |
| Dynamic Configuration | [Zookeeper](../../mannual/java-sdk/reference-manual/config-center/zookeeper) | [Nacos](../../mannual/java-sdk/reference-manual/config-center/nacos) | [Apollo](../../mannual/java-sdk/reference-manual/config-center/apollo) | Kubernetes [In Development] | <a href="https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-configcenter-extensions" target="_blank">More</a> |
| Metadata Management | [Zookeeper](../../mannual/java-sdk/reference-manual/metadata-center/zookeeper) | [Nacos](../../mannual/java-sdk/reference-manual/metadata-center/nacos) | [Redis](../../mannual/java-sdk/reference-manual/metadata-center/redis) | Kubernetes [In Development] | <a href="https://github.com/apache/dubbo-spi-extensions/tree/master/dubbo-metadata-report-extensions" target="_blank">More</a> |
| RPC Protocol | [HTTP/2 (Triple)](../../reference/protocols/triple) | [TCP](../../reference/protocols/tcp) | [HTTP/REST [Alpha]](../../reference/protocols/http) | [gRPC](../../reference/protocols/triple) | [More](../../reference/protocols/) |
| Visualization and Observability Platform | [Admin](../../tasks/observability/admin/) | [Grafana](../../tasks/observability/grafana/) | [Prometheus](../../tasks/observability/prometheus/) | - | - |
| Full Link Tracing | [Zipkin](../../tasks/observability/tracing/zipkin/) | [Skywalking](../../tasks/observability/tracing/skywalking/) | <a href="https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-spring-boot3-tracing#2-adding-micrometer-tracing-bridge-to-your-project" target="_blank">OpenTelemetry</a> | - | - |
| Rate Limiting and Degradation | [Sentinel](../../tasks/rate-limit/sentinel) | [Resilience4j](../../tasks/rate-limit/resilience4j) | [Hystrix](../../tasks/rate-limit/hystrix) | - | - |
| Distributed Transactions | [Seata](../../tasks/ecosystem/transaction/) | - | - | - | - |
| Gateway | [Higress]({{< relref "../../../../blog/integration/how-to-proxy-dubbo-in-higress" >}}) | [APISIX](../../tasks/ecosystem/gateway/) | [Shenyu]({{< relref "../../../../blog/integration/how-to-proxy-dubbo-in-apache-shenyu" >}}) | [Envoy](https://www.envoyproxy.io/docs/envoy/latest/configuration/listeners/network_filters/dubbo_proxy_filter) | - |
| Service Mesh | Istio [In Development] | <a href="https://www.aeraki.net/" target="_blank">Aeraka</a> | OpenSergo [In Development] | Proxyless [Alpha] | More |

## Microservices Ecosystem Example Architecture

{{< mse >}}

{{< blocks/section color="white" height="auto" >}}
<div class="msemap-section">
 <div class="msemap-container">
    <div id="mse-arc-container"></div>
  </div>
</div>
{{< /blocks/section >}}
