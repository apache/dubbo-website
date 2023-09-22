---
description: "Dubbo 是一款轻量的 RPC 框架，提供 Java、Go、Node.js、Javascript 等语言支持，帮助开发者构建浏览器、gRPC 兼容的 HTTP API。"
linkTitle: RPC
no_list: true
title: Dubbo 作为轻量 RPC 框架解决组件通信问题
type: docs
weight: 1
---

 基于 Dubbo3 定义的 Triple 协议，你可以轻松编写浏览器、移动端、gRPC 兼容的 RPC 服务，并让这些服务同时运行在 HTTP/1 和 HTTP/2 上。Dubbo Node.js SDK 支持使用 IDL 或编程语言特有的方式定义服务，并提供一套轻量的 API 来发布或调用这些服务。

 当前提供完整 Triple 协议通信的多语言 SDK 如下：

<!-- <img src="/imgs/v3/quickstart/rpc-arc.png" style="width:700px;height:auto;"/> -->

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div><header class="article-meta">
    </header><div class="row">
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./java" >}}'>Java RPC</a>
                </h4>
                <p>使用轻量的 Java SDK 开发 RPC Server 和 Client。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./go" >}}'>Go RPC</a>
                </h4>
                <p>使用轻量的 Go SDK 开发 RPC Server 和 Client。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./nodejs" >}}'>Node.js RPC</a>
                </h4>
                <p>使用轻量的 Node.js SDK 开发 RPC Server 和 Client。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./web" >}}'>Web</a>
                </h4>
                <p>基于 Dubbo Javascript 客户端，开发在浏览器中访问后端服务的 Web 页面。</p>
            </div>
        </div>
    </div>
    <div class="col-sm col-md-6 mb-4">
        <div class="h-100 card shadow" href="#">
            <div class="card-body">
                <h4 class="card-title">
                     <a href='{{< relref "./rust" >}}'>Rust RPC</a>
                </h4>
                <p>使用轻量的 Rust SDK 开发 RPC Server 和 Client。</p>
            </div>
        </div>
    </div>
</div>
<hr>
</div>

{{< /blocks/section >}}
