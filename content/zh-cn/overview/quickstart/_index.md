---
aliases:
    - /zh/overview/quickstart/
description: Dubbo 入门
linkTitle: 入门
no_list: true
title: Dubbo 入门
type: docs
weight: 2
---

**Dubbo 既能作为轻量 RPC 框架解决组件之间的通信问题，又能为复杂的微服务集群提供完善的服务治理解决方案。**

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./rpc/" >}}'>轻量级 RPC SDK</a>
                </h4>
                    <p>演示如何使用 Dubbo 提供的轻量级 SDK 编写 RPC 通信服务与客户端，涵盖 Java、Go、Node.js、Javascript、Rust 等语言</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow">
            <div class="card-body">
                <h4 class="card-title">
                    <a href='{{< relref "./microservice/" >}}'>微服务解决方案</a>
                </h4>
                    <p>通过一个完整的微服务示例，演示基于 Dubbo 的微服务开发、部署与治理基本步骤。</p>
            </div>
        </div>
    </div>

{{< /blocks/section >}}

下图展示了 Dubbo 的多语言生态：在端上有 dubbo-web 和 dubbo-mobile 以标准的 http+json 格式与后端微服务体系通信；后端实现则涵盖 Java、Go、Node.js、Rust 等语言。基于 Triple 协议打通了端上设备、后端微服务、异构体系如 gRPC 等之间的数据通信。

<img src="/imgs/v3/quickstart/rpc-arc.png" style="width:700px;height:auto;"/>

