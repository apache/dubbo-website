---
title: "dubbo-spi-extensions v3.2.0-RELEASE 正式发布"
linkTitle: "dubbo-spi-extensions v3.2.0-RELEASE 正式发布˚"
date: 2024-05-16
tags: ["Release Notes"]
weight: 70
authors: ["其一"]
description: >
    
---

## 优化
- 支持非本地集群的动态IP访问。
- 调整polaris的filter的引用模式，限流与熔断分开便于用户按需使用
- 增加dubbo-gateway-extensions网关扩展模块
- 支持polarismesh的新熔断设计实现
- 增加cross模块，轻量级地复制了dubbo.tag 的跨线程功能。
- 按子网生成标签，以便服务可以在相同的区域子网中进行rpc。
- 增加fury序列化框架实现
- 添加jackson 序列化扩展 
- dubbo 3.2 引入 Kubernetes 和 xDS 实现 #251

## BUG修复
-改正dubbo-mock-extensions模块错误描述
-修复Serialization全限定名配置文件错误路径
-修复ServiceConfigURL在dubbo 3.0中,application、version 等公共参数不传输的问题。
-修复Dubbo Redis不支持选择数据库
-修复INJVM协议下Protobuf对象，不能被正常深度拷贝

## 支持dubbo-3.2
- consul、rocketmq、webservice、RMI、eakewma、etcd、fastjson、gson、jackson、QUIC、serialization、dubbo-cluster-broadcast-1、dubbo-cluster-specify-address、dubbo-register-redis、dubbo-register-consul、dubbo-common-extensions、dubbo-cross-thread-extensions、dubbo-filter-seata支持 dubbo-3.2

## 版本升级
- 更新 kryo 5.3.0 -> 5.4.0 
- 更新 snakeyaml 1.32 -> 2.0 
- 更新 grpc-protobuf 1.31.1 -> 1.53.0 
- 更新 ch.qos.logback：logback-classic 1.2.11 -> 1.3.12 
- 更新 org.springframework：spring-framework-bom 4.3.29.RELEASE -> 4.3.30.RELEASE 
- 更新 ch.qos.logback：logback-classic 1.2.3 -> 1.3.12 
