---
aliases:
    - /zh/overview/tasks/observability/
description: 基于 Admin、Metrics、Grafana 等可视化的观测集群状态。
linkTitle: 观测服务
no_list: true
title: 观测服务
type: docs
weight: 5
---



{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div>
    <header class="article-meta"></header>
    <div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./admin/" >}}'>Admin 可视化控制台</a>
                </h4>
                <p>演示如何通过 Admin 控制台可视化管控 Dubbo 微服务集群，包括查询服务、实例运行状态、服务测试、文档管理、流量规则下发等。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./grafana/" >}}'>Grafana 可视化展示集群指标</a>
                </h4>
                <p>演示如何通过 Grafana 可视化展示 Dubbo 集群的 Metrics 埋点监控指标。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./grafana/" >}}'>使用 Prometheus 查询指标</a>
                </h4>
                <p>演示如何根据条件从 Prometheus 中查询 Metrics 指标。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./tracing/zipkin/" >}}'>Zipkin 全链路追踪</a>
                </h4>
                <p>演示如果通过 Zipkin 实现对 Dubbo 服务的全链路追踪。
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./tracing/skywalking/" >}}'>Skywalking 全链路追踪</a>
                </h4>
                <p>演示如果通过 Skywalking 实现对 Dubbo 服务的全链路追踪。
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./tracing/otlp/" >}}'>OTlp 全链路追踪</a>
                </h4>
                <p>演示如果通过 OpenTelemetry 的 Otlp Collector 实现对 Dubbo 服务的全链路追踪。
                </p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>
{{< /blocks/section >}}
