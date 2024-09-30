---
aliases:
    - /en/overview/core-features/observability/
    - /en/overview/core-features/observability/
description: Observability Service
feature:
    description: |
        Multi-dimensional observable metrics (Metrics, Tracing, Accesslog) help understand the service running status. Admin console, Grafana, etc., help achieve data metrics visualization.
    title: Observability
linkTitle: Observability Service
title: Observability Service
type: docs
weight: 7
---



Dubbo internally maintains multiple dimensions of observable metrics and supports various ways of visual monitoring. Observable metrics are generally divided into three measurement dimensions:

* **Admin** The Admin console visually displays applications, services, instances, and dependencies in the cluster. It supports the issuance of traffic governance rules and provides tools such as service testing, mock, and document management to improve R&D testing efficiency.

* **Metrics** Dubbo collects a series of traffic metrics such as QPS, RT, number of successful requests, number of failed requests, etc., as well as a series of internal component statuses such as thread pool count, service health status, etc.

* **Tracing** Dubbo is adapted to mainstream link tracing works in the industry, including Skywalking, Zipkin, and Jaeger, all of which support Dubbo service link tracing.

* **Logging** Dubbo supports multiple log framework adaptations. For example, in the Java ecosystem, it supports Slf4j, Log4j2, Log4j, Logback, Jcl, etc. Users can choose the appropriate framework based on business needs. Dubbo also supports Access Log to record request traces.

## Admin
The Admin console visually displays applications, services, instances, and dependencies in the cluster. It supports the issuance of traffic governance rules and provides tools such as service testing, mock, and document management to improve R&D testing efficiency.

![Admin Effect](/imgs/v3/feature/observability/admin.jpg)

* [Admin Deployment and Effect Demonstration](../../tasks/observability/admin/)

## Metrics
Dubbo runtime collects core service metrics including qps, rt, total calls, successful calls, failed calls, and failure reasons statistics. To better monitor the service running status, Dubbo also provides monitoring of core component statuses such as thread pool count and service health status.

Metrics can be visualized through Grafana.

![Grafana Effect](/imgs/v3/feature/observability/provider-stat.png)

* [Visualize Metrics with Grafana](../../tasks/observability/grafana/)
* [How to Query Specific Metrics from Prometheus](../../tasks/observability/prometheus/)

## Tracing
Full link tracing is of great value for monitoring the running status of distributed systems. Dubbo implements runtime request tracking through Filter interceptors. By exporting tracking data to some mainstream implementations such as Zipkin, Skywalking, Jaeger, etc., full link tracking data analysis and visualization can be achieved.

![Tracing Effect](/imgs/v3/feature/observability/tracing.png)

> In the future, we plan to support dynamically adjusting Dubbo's link tracing sampling rate through governance platforms such as Dubbo Admin.

* [Implement Full Link Tracing with Skywalking](../../tasks/observability/tracing/skywalking/)
* [Implement Full Link Tracing with Zipkin](../../tasks/observability/tracing/zipkin/)
* [Associate Logs with Link Tracing](../../mannual/java-sdk/advanced-features-and-usage/observability/tracing/)

## Logging
Access logs can help analyze the system's traffic situation. In some scenarios, enabling access logs is also very helpful for troubleshooting issues.

* [Enable Access Log](../../mannual/java-sdk/advanced-features-and-usage/service/accesslog/)
* [Enable Access Log at Runtime](../../tasks/traffic-management/accesslog/)
