---
aliases:
    - /zh/overview/tasks/extensibility/
    - /zh-cn/overview/tasks/extensibility/
description: 演示 Dubbo 扩展能力特性的使用方式。
linkTitle: 自定义扩展
no_list: true
title: 自定义扩展
type: docs
weight: 6
---

通过如下任务项分别来介绍 Dubbo 的扩展特性。

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./filter/" >}}'>自定义过滤器</a>
                </h4>
                <p>通过SPI机制动态加载自定义过滤器，可以对返回的结果进行统一的处理、验证等，减少对开发人员的打扰。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./router/" >}}'>自定义路由</a>
                </h4>
                <p>在服务调用的过程中根据实际使用场景自定义路由策略，可以有效的改善服务吞吐量和耗时。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./protocol/" >}}'>自定义协议</a>
                </h4>
                <p>针对不同的异构系统可以使用自定义传输协议，为系统之间的整合屏蔽了协议之间的差异。
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./registry/" >}}'>自定义注册中心</a>
                </h4>
                <p>将不同注册中心中的服务都纳入到 Dubbo 体系中，自定义注册中心是打通异构服务体系之间的利刃。
                </p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
