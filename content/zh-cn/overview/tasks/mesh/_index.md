
---
type: docs
title: "Mesh 部署方案"
linkTitle: "Mesh 部署方案"
description: "演示多种部署形态的 Dubbo Mesh 解决方案，以及 Dubbo Mesh 如何帮助用户实现架构的平滑迁移。 "
weight: 2
no_list: true
---

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./dubbo-mesh/" >}}'>Istio + Sidecar + Thin SDK</a>
                </h4>
                <p>演示 Dubbo3 的 Sidecar Mesh 形态，可完整接入 Istio 的服务治理能力，此方案限定 Dubbo3 应用级服务发现。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./dubbo-mesh/" >}}'>Istio + Proxyless</a>
                </h4>
                <p>无 Sidecar 的 Dubbo3 Proxyless Mesh 形态，可完整接入 Istio 的服务治理能力，此方案限定 Dubbo3 应用级服务发现。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
<!--                     <a href='{{< relref "./dubbo-mesh/" >}}'>Dubbo Control Plane + Thin SDK (TBD)</a> -->
                    <p>Dubbo Control Plane + Thin SDK (文档建设中)</p>
                </h4>
                <p></p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
<!--                     <a href='{{< relref "./dubbo-mesh/" >}}'>Dubbo Control Plane + Proxyless (TBD)</a> -->
                    <p>Dubbo Control Plane + Proxyless (文档建设中)</p>
                </h4>
                <p></p>
            </div>
        </div>
    </div>

</div>
<hr>
</div>

{{< /blocks/section >}}