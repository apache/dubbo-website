---
type: docs
title: "部署 Dubbo 应用到 Docker 环境"
linkTitle: "部署到 Docker"
weight: 2
description: ""
---

1. 部署架构图，一目了然能看出来任务的整体部署架构

    要有 Nacos/Zookeeper、Admin、Skywalking、Provider、Consumer

2. 描述清楚任务的目标

3. 如何部署，必要的话使用 docker-compose 简化 Nacos/Admin/Skywalking 等依赖项的部署
  * docker run provider-xxx，增加必要的说明
  * docker run consumerxxx，增加必要的说明

4. 验证运行正常，尽量有 Admin/Skywalking 的可视化效果

5. 必要的话加些原理描述
