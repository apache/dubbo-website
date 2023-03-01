---
aliases:
    - /zh/docsv2.7/admin/install/provider-demo/
description: 示例提供者安装
linkTitle: 示例提供者安装
title: 示例提供者安装
type: docs
weight: 2
---



安装：

```sh
git clone https://github.com/apache/dubbo.git
cd dubbo/dubbo-demo/dubbo-demo-xml
运行 dubbo-demo-xml-provider中的org.apache.dubbo.demo.provider.Application
如果使用Intellij Idea 请加上-Djava.net.preferIPv4Stack=true
```

配置：

```sh
resources/spring/dubbo-provider.xml
修改其中的dubbo:registry，替换成真实的注册中心地址，推荐使用zookeeper，如：
<dubbo:registry address="zookeeper://127.0.0.1:2181"/>
```