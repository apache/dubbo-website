---
aliases:
    - /zh/docsv2.7/admin/install/consumer-demo/
description: 示例消费者安装
linkTitle: 示例消费者安装
title: 示例消费者安装
type: docs
weight: 3
---



安装:

```sh
git clone https://github.com/apache/dubbo.git
cd dubbo/dubbo-demo/dubbo-demo-xml
运行 dubbo-demo-xml-consumer 中的 org.apache.dubbo.demo.consumer.Application
请确保先启动 Provider，如果使用 Intellij Idea 请加上 -Djava.net.preferIPv4Stack=true
```

配置:

```sh
resources/spring/dubbo-consumer.xml
修改其中的dubbo:registry，替换成Provider提供的注册中心地址, 如：
<dubbo:registry address="zookeeper://127.0.0.1:2181"/>
```