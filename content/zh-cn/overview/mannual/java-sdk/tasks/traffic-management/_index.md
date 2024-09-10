---
aliases: [/zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/traffic/]
description: 演示 Dubbo 流量治理特性的使用方式。
linkTitle: 流量管控
no_list: true
title: 流量管控
type: docs
weight: 5
---

我们通过一个使用 Dubbo 开发的商城微服务项目，演示 Dubbo 流量管控规则的基本使用方法，包括如下场景：

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./timeout/" >}}'>调整超时时间</a>
                </h4>
                <p>通过在运行期动态的调整服务超时时间，可以有效的应对超时设置不合理、系统突发情况等导致的服务频繁超时、服务阻塞等问题，提升系统稳定性。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./retry/" >}}'>增加重试次数</a>
                </h4>
                <p>在服务初次调用失败后，通过重试能有效的提升总体调用成功率。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./accesslog/" >}}'>访问日志</a>
                </h4>
                <p>访问日志可以很好的记录某台机器在某段时间内处理的所有服务请求信息，运行态动态的开启访问日志对于排查问题非常有帮助。
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./region/" >}}'>同机房/区域优先</a>
                </h4>
                <p>同机房/区域优先是指应用调用服务时，优先调用同机房/区域的服务提供者，避免了跨区域带来的网络延时，从而减少了调用的响应时间。
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./isolation/" >}}'>环境隔离</a>
                </h4>
                <p>通过为集群中的某一个或多个应用划分逻辑隔离环境，可用于灰度环境或多套测试环境搭建。
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./arguments/" >}}'>参数路由</a>
                </h4>
                <p>如基于用户 ID 路由流量，将一小部分用户请求转发到最新发布的产品版本，以验证新版本的稳定性、获取用户的产品体验反馈等。
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./weight/" >}}'>权重比例</a>
                </h4>
                <p>通过规则动态调整单个或一组机器的权重，可以在运行态改变请求流量的分布，实现动态的按比例的流量路由。
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./mock/" >}}'>服务降级</a>
                </h4>
                <p>服务降级的核心目标就是针对这些弱依赖项，在弱依赖不可用或调用失败时，通过返回降级结果尽可能的维持功能完整。
                </p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./host/" >}}'>固定机器导流</a>
                </h4>
                <p>通过将请求固定的转发某一台提供者机器，帮助快速复现开发或线上问题。
                </p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
