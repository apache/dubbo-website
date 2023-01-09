
---
type: docs
title: "部署服务"
linkTitle: "部署服务"
description: ""
weight: 10
no_list: true
feature:
  title: 云原生友好
  description: >
    Kubernetes 部署、Kubernetes 原生服务、Service Mesh。
---

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./deploy-on-k8s/" >}}'>传统虚拟机环境部署</a>
                </h4>
                <p></p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./deploy-on-k8s/" >}}'>Docker 环境部署</a>
                </h4>
                <p>以 API-SERVER 为注册中心，将 Dubbo 应用部署到 Kubernetes 并复用 Kubernetes Native Service 的使用示例</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "../mesh/" >}}'>Kubernetes 部署</a>
                </h4>
                <p>通过 Dubbo Control Plane 屏蔽服务治理细节，保留适配 kubernetes 原生能力的同时从架构上实现数据面与 kubernetes 的解耦，避免数据面与 kubernetes 直接通信带来的各种问题。<br/><br/>具体请参见 Mesh解决方案 小节</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}