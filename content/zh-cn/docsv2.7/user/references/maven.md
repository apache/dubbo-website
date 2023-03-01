---
aliases:
    - /zh/docsv2.7/user/references/maven/
description: Dubbo 的 Maven 插件
linkTitle: Maven 插件参考手册
title: Maven 插件参考手册
type: docs
weight: 12
---




## 启动一个简易注册中心

以指定的 9099 端口启动一个简易注册中心 [^1]：

```sh
mvn dubbo:registry -Dport=9099 
```

## 生成 demo 服务提供者应用

生成指定接口和版本的服务提供者应用 [^2]：

```sh
mvn dubbo:create -Dapplication=xxx -Dpackage=com.alibaba.xxx -Dservice=XxxService,YyyService -Dversion=1.0.0 
```

[^1]: 如果端口不指定，默认端口为 9090
[^2]: 参见 [容器扩展](../../../dev/impls/container)