---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/config-center/remote_config/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/config-center/remote_config/
description: 远程加载配置启动
title: 远程加载配置启动
type: docs
weight: 3
---






# 远程加载配置启动

## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装
- 创建一个新的 demo 应用
- 本地/远程启动一个 Nacos 实例，登录控制台

## 2. 在配置中心创建配置

Dubbogo 服务框架支持将配置文件 'dubbogo.yaml' 的内容预先放入配置中心，再通过配置注册中心的地址。在本地 dubbogo.yaml 配置文件内只需写入配置中心的信息即可，目前支持作为配置中心的中间件有：apollo、nacos、zookeeper

可参考 [配置中心 samples](https://github.com/apache/dubbo-go-samples/tree/master/configcenter)，凡是正确配置了config-center 配置的服务，都会优先从配置中心加载整个配置文件。

```yaml
dubbo:
  config-center:
    protocol: nacos
    address: 127.0.0.1:8848
    data-id: dubbo-go-samples-configcenter-nacos-server
    group: myGroup # nacos group, default is DEFAULT_GROUP
#    namespace: 9fb00abb-278d-42fc-96bf-e0151601e4a1 # nacos namespaceID, default is public namespace

## set in config center, group is 'dubbo', dataid is 'dubbo-go-samples-configcenter-nacos-server', namespace is default
#dubbo:
#  registries:
#    demoZK:
#      protocol: nacos
#      timeout: 3s
#      address: 127.0.0.1:8848
#  protocols:
#    triple:
#      name: tri
#      port: 20000
#  provider:
#    services:
#      GreeterProvider:
#        interface: com.apache.dubbo.sample.basic.IGreeter # must be compatible with grpc or dubbo-java
```