---
aliases:
    - /zh/docsv2.7/admin/ops/introduction/
description: Dubbo 管理控制台介绍
linkTitle: Dubbo 管理控制台介绍
title: Dubbo 管理控制台介绍
type: docs
weight: 2
---



目前的管理控制台已经发布 0.1 版本，结构上采取了前后端分离的方式，前端使用 Vue 和 Vuetify 分别作为 Javascript 框架和UI框架，后端采用 Spring Boot 框架。既可以按照标准的 Maven 方式进行打包，部署，也可以采用前后端分离的部署方式，方便开发，功能上，目前具备了服务查询，服务治理(包括 Dubbo 2.7 中新增的治理规则)以及服务测试三部分内容。

### Maven方式部署  

* 安装

```sh
git clone https://github.com/apache/dubbo-admin.git
cd dubbo-admin
mvn clean package
cd dubbo-admin-distribution/target
java -jar dubbo-admin-0.1.jar
```

* 访问  

http://localhost:8080


### 前后端分离部署  

* 前端  

```sh
cd dubbo-admin-ui 
npm install 
npm run dev 
```

* 后端  

```sh
cd dubbo-admin-server
mvn clean package 
cd target
java -jar dubbo-admin-server-0.1.jar
```

* 访问  

http://localhost:8081  

* 前后端分离模式下，前端的修改可以实时生效  

### 配置: [^1]

配置文件为：

```sh
dubbo-admin-server/src/main/resources/application.properties
```

主要的配置有：

```properties
admin.config-center=zookeeper://127.0.0.1:2181
admin.registry.address=zookeeper://127.0.0.1:2181
admin.metadata-report.address=zookeeper://127.0.0.1:2181
```

三个配置项分别指定了配置中心，注册中心和元数据中心的地址，关于这三个中心的详细说明，可以参考[这里](../../../user/configuration/config-center)。

也可以和 Dubbo 2.7 一样，在配置中心指定元数据和注册中心的地址，以 zookeeper 为例，配置的路径和内容如下: 

```properties
# /dubbo/config/dubbo/dubbo.properties
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181
```
配置中心里的地址会覆盖掉本地 `application.properties` 的配置

其他配置请访问 github 中的文档:

```sh
https://github.com/apache/dubbo-admin
```

[^1]: 当前版本中未实现登录功能，会在后续版本加上