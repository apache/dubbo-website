---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/template/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/template/
description: 应用模板
title: 应用模板
type: docs
weight: 1
---

> 确保 dubbogo-cli 工具和相关依赖工具已安装。

## 创建目录
```shell
$ mkdir cli-create-server && cd cli-create-server
```

## 创建项目模板
```shell
$ dubbogo-cli newApp . 
```

## 查看项目目录结构
```shell
$  tree .
.
├── Makefile
├── api
│   └── api.proto
├── build
│   └── Dockerfile
├── chart
│   ├── app
│   │   ├── Chart.yaml
│   │   ├── templates
│   │   │   ├── _helpers.tpl
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── serviceaccount.yaml
│   │   └── values.yaml
│   └── nacos_env
│       ├── Chart.yaml
│       ├── templates
│       │   ├── _helpers.tpl
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       └── values.yaml
├── cmd
│   └── app.go
├── conf
│   └── dubbogo.yaml
├── go.mod
├── go.sum
└── pkg
    └── service
        └── service.go
```

## 生成项目目录

- `api`：放置接口文件：proto文件和生成的pb.go文件

- `build`：放置构建相关文件

- `chart`：放置发布用 chart 包、基础环境 chart 包：nacos、mesh（开发中）

- `cmd`：程序入口

- `conf`：框架配置

- `pkg/service`：RPC 服务实现

- `Makefile`：

    - 镜像、应用名：

        - IMAGE = `$(your_repo)/$(namespace)/$(image_name)`
          TAG = `1.0.0`

        - APPNAME = `dubbo-go-app` # 用于 helm 发布，对应 chart 名、应用名和服务名（service 名）

    - 提供脚本，例如：

        - `make build` # 打包镜像并推送

        - `make buildx-publish` # arm 架构本地打包 amd64 镜像并推送，依赖 `docker buildx`

        - `make deploy`  # 通过 helm 发布应用

        - `make remove`  # 删除已经发布的 helm 应用

        - `make proto-gen` # `api/` 下生成 `pb.go` 文件
