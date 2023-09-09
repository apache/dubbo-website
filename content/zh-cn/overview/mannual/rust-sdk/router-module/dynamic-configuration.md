---
aliases:
  - /zh/docs3-v2/rust-sdk/router-module/dynamic-configuration/
  - /zh-cn/docs3-v2/rust-sdk/router-module/dynamic-configuration/
description: "动态路由配置"
linkTitle: 动态配置
title: 动态路由配置
type: docs
weight: 2
---




## 动态下发配置 简介
动态下发配置使用 Nacos 作为配置中心实现，需要在项目的 application.yaml 配置文件中对 Nacos 进行配置,若不进行配置则使用本地路由配置。
## 使用方式：
```yaml
nacos:
    addr: "127.0.0.1:8848"
    namespace: "namespace-name"
    app: "app-name"
    enable_auth: 
      auth_username: username
      auth_password: password
```
app：路由配置项在Nacos中所处的app
namespace：配置信息在Nacos所处的namespace
addr：Nacos服务地址
enable_auth：可选配置项，若启用了Nacos的认证功能，则需要配置此项，auth_username对应帐号，auth_password对应密钥


## 配置条件路由

在nacos中创建条件路由配置项时，
app和namespace为配置nacos时所填写的信息;
group：固定为condition;
name：需要和 服务名称 保持一致;


## 配置标签路由
在nacos中创建标签路由配置项时，

app：配置nacos时所填写的app;
namespace：配置nacos时所填写的namespace;
group：固定为tag;
name：固定为application;

## 注意事项
dubbo rust目前还没有实现对于**应用**的区分，无法区分服务来自哪个应用；
故对于应用级别的配置项，默认对所有服务生效
因此对于标签路由和条件路由，都仅能配置一条应用级别的配置，对于应用级配置，配置名称（name）指定为application

## 例：
![nacos-example.png](/imgs/rust/router-example/nacos-example.png)
### 对应的配置项：

*服务级别的条件路由配置：*
```yaml
configVersion: v1.0
scope: "service"
force: false
enabled: true
key: "org.apache.dubbo.sample.tri.Greeter"
conditions:
  - method=greet => ip=127.*
```
*标签路由配置：*
```yaml
configVersion: v1.0
force: true
enabled: true
key: shop-detail
tags:
  - name: gray
    match:
      - key: env
        value: gray
  - name: red
    match:
      - key: env
        value: red
```

*应用级别的条件路由配置：*
```yaml
configVersion: v1.0
scope: "application"
force: false
enabled: true
key: application
conditions:
  - ip=127.0.0.1 => port=8000~8888
```