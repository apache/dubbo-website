---
aliases:
    - /zh/overview/tasks/traffic-management/timeout/
description: 在 Dubbo-Admin 动态调整服务超时时间
linkTitle: 调整超时时间
title: 动态调整服务超时时间
type: docs
weight: 1
---



Dubbo 提供动态调整服务超时时间的能力，在无需重启应用的情况下调整服务的超时时间，这对于临时解决一些服务上下游依赖不稳定而导致的调用失败问题非常有效。

## 开始之前
* [部署 Shop 商城项目](../#部署商场系统)
* 部署并打开 [Dubbo Admin](../.././../reference/admin/architecture/)

## 任务详情

商城项目通过 `org.apache.dubbo.samples.UserService` 提供用户信息管理服务，访问 `http://localhost:8080/` 打开商城并输入任意账号密码，点击 `Login` 即可以正常登录到系统。

![timeout1.png](/imgs/v3/tasks/timeout/timeout1.png)

有些场景下，User 服务的运行速度会变慢，比如存储用户数据的数据库负载过高导致查询变慢，这时就会出现 `UserService` 访问超时的情况，导致登录失败。

![timeout2.png](/imgs/v3/tasks/timeout/timeout2.png)

在示例系统中，可通过下图 `Timeout Login` 模拟突发的 `UserService` 访问超时异常

![timeout4.png](/imgs/v3/tasks/timeout/timeout4.png)

### 通过规则动态调整超时时间

为了解决突发的登录超时问题，我们只需要适当增加 `UserService` 服务调用的等待时间即可。

![timeout3.png](/imgs/v3/tasks/timeout/timeout3.png)

#### 操作步骤
1. 打开 Dubbo Admin 控制台
2. 在左侧导航栏选择【服务治理】>【动态配置】
3. 点击 "创建"，输入服务 `org.apache.dubbo.samples.UserService` 和新的超时时间如 `2000` 即可。

![Admin 超时时间设置截图](/imgs/v3/tasks/timeout/timeout_admin.png)

保存后，再次点击 `Timeout Login`，此时在经过短暂的等待后系统可以正常登录。

#### 规则详解

**规则 key** ：`org.apache.dubbo.samples.UserService`

**规则体**

```yaml
configVersion: v3.0
enabled: true
configs:
  - side: provider
    parameters:
      timeout: 2000
```

从 `UserService` 服务提供者视角，将超时时间总体调整为 2s。

```yaml
parameters:
  timeout: 2000
```

`side: provider` 配置会将规则发送到服务提供方实例，所有 `UserService` 服务实例会基于新的 timeout 值进行重新发布，并通过注册中心通知给所有消费方。

## 清理
为了不影响其他任务效果，通过 Admin 删除或者禁用刚刚配置的超时规则。