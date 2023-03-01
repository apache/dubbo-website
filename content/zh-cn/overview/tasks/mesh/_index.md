---
aliases:
    - /zh/overview/tasks/mesh/
description: '演示多种部署形态的 Dubbo Mesh 解决方案，以及 Dubbo Mesh 如何帮助用户实现架构的平滑迁移。 '
linkTitle: 服务网格
no_list: true
title: 服务网格
toc_hide: true
type: docs
weight: 70
---



{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./bookinfo-sidecar/" >}}'>Istio & Envoy Bookinfo 示例</a>
                </h4>
                <p>演示 Dubbo 服务接入基于 Envoy 代理的 Istio 服务网格体系。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./bookinfo-proxyless/" >}}'>Istio & Proxyless Bookinfo 示例</a>
                </h4>
                <p>演示 Dubbo Proxyless 接入 Istio 服务网格体系。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./migration/" >}}'>老集群平滑迁移</a>
                </h4>
                <p>演示传统 Dubbo 微服务集群如何平滑迁移到 Istio 服务网格</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}