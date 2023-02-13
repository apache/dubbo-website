---
type: docs
title: "部署服务"
linkTitle: "部署服务"
description: "部署 Dubbo 应用"
weight: 10
no_list: true
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