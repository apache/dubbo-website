---
description: 快速尝试 Dubbo 特性
linkTitle: 入门介绍
title: 快速入门
type: docs
weight: 1
---
> 目前服务网格处于初步实验阶段。后续标准功能将逐步完善和支持。

Dubbo 在 2025 年推出的基于 Proxyless 的模式的服务网格模型，该模式没有额外代理转发开销，适合所有性能敏感的应用，并且适用于所有部署环境。

- 每个已部署的应用都会注入 Dubbo 代理，仅提供 XDS 和 SDS 服务，并通过原生 gRPC xDS 客户端实现服务间直连通信。
- 所有注入的代理均基于 Kubernetes Gateway API 实现服务与外部系统之间的通信。

## 下载 Dubbo

转到 Dubbo 发布页面，下载适用于您操作系统的安装文件或自动下载并获取最新版本（Linux 或 macOS）：
```bash
curl -L https://dubbo.apache.org/downloadDubbo | sh -
```

转到 Dubbo 包目录
```bash
cd dubbo-x.xx.x
```

## 安装 Dubbo

使用 default 配置文件安装 Dubbo
```bash
dubboctl install -y
```

给命名空间添加标签，指示 Dubbo 在部署应用的时候，自动注入
```bash
kubectl label namespace default dubbo-injection=enabled
```

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div>
    <header class="article-meta"></header>

    <div style="width:100%; text-align:center;">
        <a
            class="btn btn-lg btn-primary"
            href='{{< relref "./setup/install" >}}'
            style="min-width:200px; color: white; display: inline-block; margin: 0 auto; transform: translateX(-40px);"
        >
            开始使用 Proxyless 模式
        </a>
    </div>
</div>
{{< /blocks/section >}}



