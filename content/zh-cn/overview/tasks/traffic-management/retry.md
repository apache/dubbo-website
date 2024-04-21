---
aliases:
    - /zh/overview/tasks/traffic-management/retry/
description: ""
linkTitle: 服务重试
title: 通过重试提高服务调用成功率
type: docs
weight: 2
---



在服务初次调用失败后，通过重试能有效的提升总体调用成功率。但也要注意重试可能带来的响应时间增长，系统负载升高等，另外，重试一般适用于只读服务，或者具有幂等性保证的写服务。

## 开始之前
* [部署 Shop 商城项目](../#部署商场系统)
* 部署并打开 [Dubbo Admin](../.././../reference/admin/architecture/)

## 任务详情

成功登录商城项目后，商城会默认在首页展示当前登录用户的详细信息。

![retry1.png](/imgs/v3/tasks/retry/retry1.png)

但有些时候，提供用户详情的 Dubbo 服务也会由于网络不稳定等各种原因变的不稳定，比如我们提供用户详情的 User 服务就很大概率会调用失败，导致用户无法看到账户的详细信息。

![retry2.png](/imgs/v3/tasks/retry/retry2.png)

用户账户详情查询失败后的系统界面如下：

![retry2.png](/imgs/v3/tasks/retry/retry4.png)

商城为了获得带来更好的使用体验，用户信息的加载过程是异步的，因此用户信息加载失败并不会影响对整个商城页面的正常访问，但如果能始终展示完整的用户信息总能给使用者留下更好的印象。
### 增加重试提高成功率

考虑到访问用户详情的过程是异步的（隐藏在页面加载背后），只要最终数据能加载出来，适当的增加等待时间并不是大的问题。因此，我们可以考虑通过对每次用户访问增加重试次数的方式，提高服务详情服务的整体访问成功率。

![retry3.png](/imgs/v3/tasks/retry/retry3.png)

#### 操作步骤
1. 打开 Dubbo Admin 控制台
2. 在左侧导航栏选择【服务治理】>【动态配置】
3. 点击 "创建"，输入服务 `org.apache.dubbo.samples.UserService` 和失败重试次数如 `4` 即可。

![Admin 重试次数设置截图](/imgs/v3/tasks/retry/retry_admin.png)

保存后，尝试多次刷新页面，发现用户详情数据总是能正常显示，虽然有时由于重试的缘故加载时间会明显变长。

#### 规则详解

**规则 key** ：`org.apache.dubbo.samples.UserService`

**规则体**

```yaml
configVersion: v3.0
enabled: true
configs:
  - side: consumer
    parameters:
      retries: 5
```

从 `UserService` 服务消费者视角（即 Frontend 应用）增加了调用失败后的重试次数。

```yaml
parameters:
  retries: 5
```

`side: consumer` 配置会将规则发送到服务消费方实例，所有 `UserService` 服务实例会基于新的 timeout 值进行重新发布，并通过注册中心通知给所有消费方。

## 清理
为了不影响其他任务效果，通过 Admin 删除或者禁用刚刚配置的重试规则。
