---
aliases:
    - /zh/overview/core-features/service-definition/
    - /zh-cn/overview/core-features/service-definition/
description: 微服务开发
linkTitle: 微服务开发
title: 微服务开发
type: docs
weight: 1
---

## 使用在线脚手架创建项目

对于 Java 体系的微服务开发，Dubbo 提供了项目脚手架来方便项目开发。开发者可以使用脚手架在 1 分钟内创建一个基于 Dubbo Spring Boot Starter 的项目。

脚手架支持 <a href="https://start.dubbo.apache.org" target="_blank">在线 web 页面</a> 和 <a href="https://plugins.jetbrains.com/plugin/20938-apache-dubbo-in-spring-framework" target="_blank">IntelliJ IDEA 插件</a> 两种形式。

1. 在线 web 页面

    ![脚手架示例图](/imgs/v3/advantages/initializer.png)

2. IntelliJ IDEA 官方插件

    ![脚手架示例图](/imgs/v3/advantages/initializer_idea.png)

关于脚手架的具体操作讲解，请参见 [使用脚手架快速创建模板项目](/zh-cn/overview/tasks/develop/template/)。

## 使用 dubboctl 命令行创建项目

你也可以使用 dubboctl 来加速项目开发，dubboctl 支持 java、go、node.js、web、rust 等多种语言类型的项目模板创建。

1. 首先，使用以下命令下载并安装 `dubboctl` 工具。

    ```shell

    ````

2. 执行以下命令即可快速创建项目

    ```shell
    dubboctl create -l go hello
    ```

关于 dubboctl 的更多使用方式，请参考 [dubboctl 说明文档]()。
