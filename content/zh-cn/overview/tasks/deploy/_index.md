---
aliases:
    - /zh/overview/tasks/deploy/
description: 部署 Dubbo 应用
feature:
    description: |
        一键拉起服务治理体系，屏蔽底层跨平台的微服务基础设施复杂度，支持虚拟机、Docker、Kubernetes、服务网格等多种部署模式。
    title: 灵活部署模式
linkTitle: 部署服务
no_list: true
title: 部署服务
type: docs
weight: 2
---



{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./deploy-on-vm/" >}}'>虚拟机环境部署</a>
                </h4>
                <p>部署在虚拟机环境</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./deploy-on-docker/" >}}'>Docker 部署</a>
                </h4>
                <p>部署在 docker 环境</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./deploy-on-k8s-docker/" >}}'>Kubernetes + Docker 部署</a>
                </h4>
                <p>部署在 docker 环境的 kubernetes</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./deploy-on-k8s-containerd/" >}}'>Kubernetes + Containerd 部署</a>
                </h4>
                <p>部署在 containerd 环境的 kubernetes </p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
