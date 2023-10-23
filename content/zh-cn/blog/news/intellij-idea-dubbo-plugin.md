---
title: "IntelliJ IDEA❤️Apache Dubbo，IDEA官方插件正式发布！"
linkTitle: "IntelliJ IDEA❤️Apache Dubbo，IDEA官方插件正式发布！"
date: 2023-10-23
tags: ["新闻动态"]
authors: Dubbo 社区
description: >
   IntelliJ IDEA loves Apache Dubbo，IDEA 官方正式发布 Apache Dubbo in Spring Framework 插件，支持 Dubbo 脚手架与项目模板创建。
---

最受欢迎的 Java 集成开发环境 IntelliJ IDEA 与开源微服务框架 Apache Dubbo 社区强强合作，给广大微服务开发者带来了福音。与 IntelliJ IDEA 2023.2 版本一起，**Jetbrains 官方发布了一款全新插件 - Apache Dubbo in Spring Framework**。

![IntelliJ IDEA loves️ Apache Dubbo](/imgs/blog/2023/10/plugin/img_6.png)

这款插件可以帮助开发者解决 Dubbo 项目初始化问题，同时方便识别项目开发过程中的 Dubbo 服务及其依赖关系，基于 Apache Dubbo 的微服务开发将变得非常简单。

## 安装插件
在安装 Apache Dubbo 插件之前，请确保您使用的 IntelliJ IDEA 为 2023.2 及以上版本。
![image.png](/imgs/blog/2023/10/plugin/img.png)

有两种方式可以完成 Apache Dubbo 插件的安装

### 方式一
使用浏览器打开插件 [Apache Dubbo in Spring Framework](https://plugins.jetbrains.com/plugin/20938-apache-dubbo-in-spring-framework) 官方地址，在页面右上角，点击 “Install to IntelliJ IDEA 2023.2” 按钮即可完成插件安装。
![image.png](/imgs/blog/2023/10/plugin/img_1.png)

### 方式二
打开 Preferences -> Plugins，输入 'Apache Dubbo' 搜索插件，安装即可。
![image.png](/imgs/blog/2023/10/plugin/img_2.png)

## 使用插件新建应用
插件安装完成，接下来，我们看一下如何使用插件创建和开发 Apache Dubbo 微服务应用。

### 打开弹窗
通过 "File -> New -> Project" 打开新建项目对话框，在对话框中，可以看到 Apache Dubbo 插件已经出现在左侧模版列表中，点击选中即可。
![image.png](/imgs/blog/2023/10/plugin/img_3.png)

根据应用需要，录入项目名称、保存路径、坐标、JDK版本等信息了，录入完毕之后，点击 "Next" 进入下一步。
### 选择组件
![image.png](/imgs/blog/2023/10/plugin/img_4.png)

插件将使用 `dubbo-spring-boot-starter` 创建 Spring Boot 项目，因此我们

- 首先，需要选择 Dubbo 与 Spring Boot 的版本。
- 其次，根据项目需要，选择相应的 Dubbo 与业务组件

最后，点击 “Create”，完成项目创建。
![image.png](/imgs/blog/2023/10/plugin/img_5.png)
## 总结
IntelliJ IDEA 官方插件的发布，极大的简化了 Dubbo 项目初始化的成本，接下来，Apache Dubbo 社区会继续与 IntelliJ 官方合作，将更多的 Dubbo 特性抽象为插件组件，以简化 Dubbo 使用中的依赖、配置管理等难题。
除了插件形式外，您也可以直接打开 [start.dubbo.apache.org](https://start.dubbo.apache.org) 在线服务，通过浏览器快速创建 Dubbo 项目。
