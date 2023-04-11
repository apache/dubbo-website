---
aliases:
    - /zh/overview/tasks/traffic-management/
description: 演示 Dubbo 流量治理特性的使用方式。
linkTitle: 流量管控
no_list: true
title: 流量管控
type: docs
weight: 3
---



此任务基于一个简单的线上商城微服务系统演示了 Dubbo 的流量管控能力。

线上商城的架构图如下：

![shop-arc](/imgs/v3/traffic/shop-arc.png)

系统由 5 个微服务应用组成：
* `Frontend 商城主页`，作为与用户交互的 web 界面，通过调用 `User`、`Detail`、`Order` 等提供用户登录、商品展示和订单管理等服务。
* `User 用户服务`，负责用户数据管理、身份校验等。
* `Order 订单服务`，提供订订单创建、订单查询等服务，依赖 `Detail` 服务校验商品库存等信息。
* `Detail 商品详情服务`，展示商品详情信息，调用 `Comment` 服务展示用户对商品的评论记录。
* `Comment 评论服务`，管理用户对商品的评论数据。

## 部署商场系统

为方便起见，我们将整个系统部署在 Kubernetes 集群，执行以下命令即可完成商城项目部署，项目源码示例在 [dubbo-samples/task](https://github.com/apache/dubbo-samples/tree/master/10-task/dubbo-samples-shop)。

```sh
kubectl apply -f https://raw.githubusercontent.com/apache/dubbo-samples/master/10-task/dubbo-samples-shop/deploy/All.yml
```

完整的部署架构图如下：

![shop-arc](/imgs/v3/traffic/shop-arc-deploy2.png)

`Order 订单服务`有两个版本 `v1` 和 `v2`，`v2` 是订单服务优化后发布的新版本。
* 版本 v1 只是简单的创建订单，不展示订单详情
* 版本 v2 在订单创建成功后会展示订单的收货地址详情

`Detail` 和 `Comment` 服务也分别有两个版本 `v1` 和 `v2`，我们通过多个版本来演示流量导流后的效果。
* 版本 `v1` 默认为所有请求提供服务
* 版本 `v2` 模拟被部署在特定的区域的服务，因此 `v2` 实例会带有特定的标签

执行以下命令，确定所有服务、Pod都已正常运行：
```sh
$ kubectl get services -n dubbo-demo

```

```sh
$ kubectl get pods -n dubbo-demo

```

为了保障系统完整性，除了商城相关的几个微服务应用，示例还在后台拉起了 Nacos 注册配置中心、Dubbo Admin 控制台 和 Skywalking 全链路追踪系统。

```sh
$ kubectl get services -n dubbo-system

```

```sh
$ kubectl get pods -n dubbo-system

```

## 获得访问地址
执行以下命令，将集群端口映射到本地端口：

```sh
kubectl port-forward -n dubbo-demo deployment/shop-frontend 8080:8080
```

```sh
kubectl port-forward -n dubbo-system service/dubbo-admin 38080:38080
```

```sh
kubectl port-forward -n dubbo-system service/skywalking-oap-dashboard 8082:8082
```

此时，打开浏览器，即可通过以下地址访问：
* 商城首页 `http://localhost:8080`
* Dubbo Admin 控制台 `http://localhost:38080`
* Skywalking 控制台 `http://localhost:8082`

## 任务项
接下来，试着通过如下任务项给商城增加一些流量管控规则吧。

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
