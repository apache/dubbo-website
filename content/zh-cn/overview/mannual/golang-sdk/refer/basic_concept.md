---
aliases:
    - /zh/docs3-v2/golang-sdk/refer/basic_concept/
    - /zh-cn/docs3-v2/golang-sdk/refer/basic_concept/
description: 配置基本概念
keywords: 配置基本概念
title: 配置基本概念
type: docs
---






## 1. 框架配置

Dubbo-go 框架需要依赖配置进行启动。配置中包含了开发者希望使用框架的各种能力。

### 配置格式

yaml

### 配置路径

默认从 `../conf/dubbogo.yaml ` 加载框架配置

可通过指定环境变量：DUBBO_GO_CONFIG_PATH=$(your_config_path)/dubbogo.yaml 来修改配置文件路径。

### 配置根结构

位于 [dubbo.apache.org/dubbo-go/v3/config/root_config.go: RootConfig](https://github.com/apache/dubbo-go/blob/e00cf8d6fb2be3cd9c6e42cc3d6efa54e10229d3/config/root_config.go#L50)

框架加载时，任何形式的配置都会被解析成 RootConfig，在 RootConfig.Init 方法中加载。

## 2. 配置API

开发者可以使用 API 的形式构建配置，从而启动框架。该方法较适合 dubbo-go 作为第三方组件引入的情况。

## 3. 配置中心

开发者可以将配置放置在配置中心，从而便于配置的管理和修改。