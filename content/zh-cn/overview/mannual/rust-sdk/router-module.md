---
aliases:
  - /zh/docs3-v2/rust-sdk/router-module/
  - /zh-cn/docs3-v2/rust-sdk/router-module/
description: "服务路由"
linkTitle: 服务路由
title: 服务路由规则
type: docs
weight: 2
---

## 条件路由
使用模式与 [条件路由文档](/zh/overview/core-features/traffic/condition-rule/) 中的模式类似，但配置格式略有不同，以下是条件路由规则示例。

基于以下示例规则，所有 `org.apache.dubbo.sample.tri.Greeter` 服务 `greet` 
方法的调用都将被转发到有 `port=8888` 标记的地址子集 

```yaml
configVersion: v1.0
scope: "service"
force: false
enabled: true
key: "org.apache.dubbo.sample.tri.Greeter"
conditions:
  - method=greet => port=8888
```
注：<br>
dubbo rust目前还没有实现对于**应用粒度**的区分，无法区分服务来自哪个应用<br>
因此对于标签路由和条件路由，都仅能配置一条应用级别的配置<br>
对于应用级别的配置，默认key指定为application，此配置将对全部服务生效<br>
例如：
```yaml
configVersion: v1.0
scope: "application"
force: false
enabled: true
key: application
conditions:
  - ip=127.0.0.1 => port=8000~8888
```

#### 匹配/过滤条件

**参数支持**

* 服务调用上下文，如：service_name, method等
* URL 本身的字段，如：location, ip, port等
* URL params中存储的字段信息

**条件支持**

* 等号 = 表示 "匹配"，如：method = getComment
* 不等号 != 表示 "不匹配"，如：method != getComment

**值支持**

* 以逗号 , 分隔多个值，如：ip != 10.20.153.10,10.20.153.11
* 以星号 * 结尾，表示通配，如：ip != 10.20.*
* 整数值范围，如：port = 80~8080


## 标签路由
使用模式与 [标签路由文档](/zh/overview/core-features/traffic/tag-rule/)中的模式类似，但配置格式略有不同，以下是标签路由规则示例
```yaml
configVersion: v1.0
force: false
enabled: true
key: application
tags:
  - name: local
    match:
      - key: ip
        value: 127.0.0.1
```
在此配置中，所有ip=127.0.0.1的服务提供者/消费者均会被打上local的标签

## 动态配置
### 动态下发配置 简介
动态下发配置使用 Nacos 作为配置中心实现，需要在项目的 application.yaml 配置文件中对 Nacos 进行配置,若不进行配置则使用本地路由配置。
### 使用方式：
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


#### 配置条件路由

在nacos中创建条件路由配置项时，
app和namespace为配置nacos时所填写的信息;
group：固定为condition;
name：需要和 服务名称 保持一致;


#### 配置标签路由
在nacos中创建标签路由配置项时，

app：配置nacos时所填写的app;
namespace：配置nacos时所填写的namespace;
group：固定为tag;
name：固定为application;

#### 注意事项
dubbo rust目前还没有实现对于**应用**的区分，无法区分服务来自哪个应用；
故对于应用级别的配置项，默认对所有服务生效
因此对于标签路由和条件路由，都仅能配置一条应用级别的配置，配置名称（name）指定为application

#### 例：
![nacos-example.png](/imgs/rust/router-example/nacos-example.png)
#### 对应的配置项：

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
  - name: local
    match:
      - key: ip
        value: 127.0.0.1
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