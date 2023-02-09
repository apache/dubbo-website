
---
type: docs
title: "流量治理"
linkTitle: "流量治理"
description: "演示 Dubbo 流量治理特性的使用方式。"
weight: 1
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
                    <a href='{{< relref "./timeout/" >}}'>动态调整请求超时时间</a>
                </h4>
                <p>给 Dubbo 请求设置超时时间可以有效的提高系统稳定性，避免个别服务阻塞占用过多资源。<br/><br/> 而通过在运行期动态的调整服务超时时间，可以有效的应对超时设置不合理、系统突发情况等导致的服务频繁超时、服务阻塞等问题，提升系统稳定性。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./weight/" >}}'>通过权重调整流量分布</a>
                </h4>
                <p>通过权重调整流量分布</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./isolation/" >}}'>临时踢除服务实例</a>
                </h4>
                <p>临时踢除服务实例</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./traffic-gray/" >}}'>流量灰度</a>
                </h4>
                <p>根据请求上下文中的标签，实现对流量进行约束，实现灰度发布</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./traffic-routing/" >}}'>根据请求条件路由</a>
                </h4>
                <p>根据请求发起方、请求的方法条件路由</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0" style="margin-bottom:20px">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./traffic-condition/" >}}'>流量隔离</a>
                </h4>
                <p>将不同环境的服务流量进行隔离，保证服务相互不受影响</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4 mb-md-0">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./zone/" >}}'>同机房/区域优先</a>
                </h4>
                <p>应用调用服务时，优先调用同机房/区域的服务提供者。</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}