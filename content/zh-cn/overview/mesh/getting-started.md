---
description: 快速尝试 Dubbo 特性
linkTitle: 入门介绍
title: 快速入门
type: docs
weight: 1
---

非常感谢 [Megan Yahya 的 KubeCon EU 2021 演讲](https://www.youtube.com/watch?v=cGJXkZ7jiDk) 提供的提案思路和相关支持

Dubbo 服务网格是 2025 年研发的 Proxyless 网格模型。该模式的进程独立部署并直接通信，通过 xDS 协议与控制面直接交互。

这种模式没有额外的 Proxy 转发开销，适合对性能敏感的应用，并且适用于所有部署环境。

## 下载 Dubbo

1. 转到 Dubbo 发布页面，下载适用于您操作系统的安装文件或自动下载并获取最新版本（Linux 或 macOS）：
```bash
curl -L https://dubbo.apache.org/downloadDubbo | sh -
```

2. 转到 Dubbo 包目录。
```bash
cd dubbo-x.xx.x
```

## 安装 Dubbo

1. 使用 default 配置文件安装 Dubbo
```bash
dubboctl install -y
```
2. 给命名空间添加标签，指示 Dubbo 在部署应用的时候，自动注入 Dubbo Agent：
```bash
kubectl label namespace default dubbo-injection=enabled
```

{{< blocks/section color="white" height="auto">}}
<div class="td-content list-page">
    <div class="lead"></div>
    <header class="article-meta"></header>
    <div class="row justify-content-center">
        <div class="col-sm col-md-5 mb-4">
            <div class="h-100 text-center">
                <a class="btn btn-lg btn-primary mb-3" href='{{< relref "./setup/install" >}}' style="min-width: 200px; color: white;">
                    开始使用 Proxyless 模式
                </a>
            </div>
        </div>
    </div>
</div>
{{< /blocks/section >}}