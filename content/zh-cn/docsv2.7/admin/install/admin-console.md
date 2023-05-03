---
aliases:
    - /zh/docsv2.7/admin/install/admin-console/
description: 管理控制台安装
linkTitle: 管理控制台安装
title: 管理控制台安装
type: docs
weight: 1
---



目前版本的管理控制台正在开发中，已经完成了服务查询和服务治理的功能，采用前后端分离的模式，具体的安装和使用步骤如下：

安装:

```sh
git clone https://github.com/apache/dubbo-admin.git /var/tmp/dubbo-admin
cd /var/tmp/dubbo-admin
mvn clean package
```

配置 [^1]:

```sh
配置文件为：
dubbo-admin-server/src/main/resources/application.properties
主要的配置有：
admin.registry.address=zookeeper://127.0.0.1:2181
admin.config-center=zookeeper://127.0.0.1:2181
admin.metadata-report.address=zookeeper://127.0.0.1:2181
```

启动:

```sh
mvn --projects dubbo-admin-server spring-boot:run
```

其他配置请访问 github 中的文档:

```sh
https://github.com/apache/dubbo-admin
```

访问:

```
http://127.0.0.1:8080
```

[^1]: 当前版本中未实现登录功能，会在后续版本加上