---
description: Dubbo 服务网格的介绍
linkTitle: 概述
title: 概述
type: docs
weight: 1
---
> 目前服务网格处于初步实验阶段。后续标准功能将逐步完善和支持。

Dubbo 在 2025 年推出 proxyless 模式的 gRPC 服务网格模型，该模型没有额外代理转发开销，适合所有性能敏感的应用，并且适用于所有部署环境。

- 每个已部署的应用都会注入 Dubbo 代理，代理在初始化阶段与控制平面通信，不参与服务间调用流量的处理。
- 所有注入的代理均使用 Kubernetes Gateway API 实现服务与外部系统之间的通信。

转到 Dubbo 发布页面，下载适用于您操作系统的安装文件或自动下载并获取最新版本（Linux 或 macOS）：
```bash
curl -L https://dubbo.apache.org/downloadDubbo | sh -
```

转到 Dubbo 包目录
```bash
cd dubbo-x.xx.x
```

使用 default 配置文件安装 Dubbo
```bash
dubboctl install -y
```

给命名空间添加标签，指示 Dubbo 在部署应用的时候，自动注入
```bash
kubectl label namespace default dubbo-injection=enabled
```



