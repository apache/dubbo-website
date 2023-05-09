---
aliases:
    - /zh/overview/tasks/traffic-management/host/
description: ""
linkTitle: 固定机器导流
title: 将流量点对点引导到一台机器 (如排查问题)
type: docs
weight: 9
---



自动的地址发现和负载均衡机制有很多优势，它让我们构建可伸缩的分布式微服务系统成为可能，但这种动态的流量分配也带来很多复杂性。一个典型问题是我们无法再预测一次请求具体会落到那一台提供者机器上，但有时能预期或控制请求固定的发往某一台提供者机器在一些场景下会非常有用处，比如当开发者在测试甚至线上环境排查一些复杂问题时，如果能在某一台指定的机器上稳定复现问题现象，对于最终的问题排查肯定会带来很大帮助。

## 开始之前

* [部署 Shop 商城项目](../#部署商场系统)
* 部署并打开 [Dubbo Admin](../.././../reference/admin/architecture/)

## 任务详情

本任务我们将以 User 服务作为示例，将商城中 Frontend 应用对用户详情方法的调用 `UserService#getInfo` 全部导流到一台固定实例上去。

![host1.png](/imgs/v3/tasks/host/host1.png)

### 将用户详情服务调用导流到一台固定机器

首先，确定部署 User 应用的实际机器列表

```sh
$ kubectl get pods -n dubbo-demo
# list result here
```

为 `org.apache.dubbo.samples.UserService` 服务的 `getInfo` 方法调用设置条件路由规则，所有这个方法的调用全部转发到一台指定机器。

#### 操作步骤
1. 打开 Dubbo Admin 控制台
2. 在左侧导航栏选择【服务治理】>【条件路由】
3. 点击 "创建"，输入服务 `org.apache.dubbo.samples.UserService` 。

![Admin 指定机器导流配置截图](/imgs/v3/tasks/host/host_admin.png)

打开机器日志，刷新页面多触发机器用户详情服务调用，可以看到只有规则中指定的实例中在持续刷新以下日志：
```text
Received getInfo request......
```

#### 规则详解

**规则 key** ：`org.apache.dubbo.samples.UserService`

**规则体**
```yaml
configVersion: v3.0
enabled: true
force: false
conditions:
  - 'method=getInfo => host = {your ip address}'
```

替换 `{your ip address}` 为 User 实际的部署地址。

## 清理
为了不影响其他任务效果，通过 Admin 删除或者禁用刚刚配置的条件路由规则。

## 其他事项
在生产环境中引导流量到固定机器要做好安全性评估，避免单机负载过高影响系统稳定性，另外，云原生背景下的 IP 地址的变化更加频繁，IP 地址可能随时会失效，要注意及时清理绑定特定 IP 的路由规则。