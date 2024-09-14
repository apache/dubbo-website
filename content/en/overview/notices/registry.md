---
title: "注册中心安全"
linkTitle: "注册中心安全"
weight: 3
type: docs
description: "在 Dubbo 中更安全的使用注册中心"
---

Dubbo 支持注册中心的扩展，理论上用户可以基于该扩展机制启用任意的注册中心，这带来了极大的灵活的，但同时也要意识到其中潜藏的安全性风险。

Dubbo 2.7 官方版本提供的注册中心有如下几种：
* Zookeeper
* Redis
* Nacos
* Etcd
* Consul
* ……

从 Dubbo 3.0 开始默认仅提供以下注册中心支持：
* Zookeeper
* Nacos

对于注册中心，Dubbo 只能完全信任其推送的数据，因此如果注册中心存在安全漏洞，可能会导致 Dubbo 服务被恶意注册或者是被恶意推送数据，从而导致服务被攻击。
因此为了保证注册中心的安全性，Dubbo 官方建议您：
* 开启注册中心的鉴权机制，如 Zookeeper 的 ACL 机制、Nacos 的用户名密码机制等
* 避免将注册中心暴露在公网环境下，尽量将注册中心部署在可信内网环境下
