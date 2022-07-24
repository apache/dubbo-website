---
type: docs
title: "Maven 插件参考手册"
linkTitle: "Maven 插件参考手册"
weight: 12
description: "Dubbo 的 Maven 插件"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/java-sdk/reference-manual/)。
{{% /pageinfo %}}


## 启动一个简易注册中心

以指定的 9099 端口启动一个简易注册中心 [^1]：

```sh
mvn dubbo:registry -Dport=9099 
```

## 生成 demo 服务提供者应用

生成指定接口和版本的服务提供者应用：

```sh
mvn dubbo:create -Dapplication=xxx -Dpackage=com.alibaba.xxx -Dservice=XxxService,YyyService -Dversion=1.0.0 
```

[^1]: 如果端口不指定，默认端口为 9090
