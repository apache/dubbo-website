---
aliases:
    - /zh/overview/tasks/traffic-management/accesslog/
description: ""
linkTitle: 访问日志
title: 通过动态开启访问日志跟踪服务调用情况
type: docs
weight: 3
---



访问日志可以很好的记录某台机器在某段时间内处理的所有服务请求信息，包括请求接收时间、远端 IP、请求参数、响应结果等，运行态动态的开启访问日志对于排查问题非常有帮助。

## 开始之前
* [部署 Shop 商城项目](../#部署商场系统)
* 部署并打开 [Dubbo Admin](../.././../reference/admin/architecture/)

## 任务详情

商城的所有用户服务都由 `User` 应用的 UserService 提供，通过这个任务，我们为 `User` 应用的某一台或几台机器开启访问日志，以便观察用户服务的整体访问情况。

### 动态开启访问日志

Dubbo 通过 `accesslog` 标记识别访问日志的开启状态，我们可以指定日志文件的输出位置，也可以单独打开某台机器的访问日志。

![accesslog.png](/imgs/v3/tasks/accesslog/accesslog1.png)

#### 操作步骤
1. 打开 Dubbo Admin 控制台
2. 在左侧导航栏选择【服务治理】>【动态配置】
3. 点击 "创建"，输入应用名 `shop-user` 并勾选 "开启访问日志"（此时访问日志将和普通日志打印在一起）。

![Admin 访问日志设置截图](/imgs/v3/tasks/accesslog/accesslog_admin.png)

再次访问登录页面，登录到 `User` 应用的任意一台机器，可以看到如下格式的访问日志。

```text
[2022-12-30 12:36:31.15900] -> [2022-12-30 12:36:31.16000] 192.168.0.103:60943 -> 192.168.0.103:20884 - org.apache.dubbo.samples.UserService login(java.lang.String,java.lang.String) ["test",""], dubbo version: 3.2.0-beta.4-SNAPSHOT, current host: 192.168.0.103
[2022-12-30 12:36:33.95900] -> [2022-12-30 12:36:33.95900] 192.168.0.103:60943 -> 192.168.0.103:20884 - org.apache.dubbo.samples.UserService getInfo(java.lang.String) ["test"], dubbo version: 3.2.0-beta.4-SNAPSHOT, current host: 192.168.0.103
[2022-12-30 12:36:31.93500] -> [2022-12-30 12:36:34.93600] 192.168.0.103:60943 -> 192.168.0.103:20884 - org.apache.dubbo.samples.UserService getInfo(java.lang.String) ["test"], dubbo version: 3.2.0-beta.4-SNAPSHOT, current host: 192.168.0.103
```

#### 规则详解

**规则 key ：** shop-user

**规则体**

```yaml
configVersion: v3.0
enabled: true
configs:
  - side: provider
    parameters:
      accesslog: true
```

以下是开启访问日志的关键配置

```yaml
parameters:
  accesslog: true
```

accesslog 的有效值如下：
* `true` 或 `default` 时，访问日志将随业务 logger 一同输出，此时可以在应用内提前配置 `dubbo.accesslog` appender 调整日志的输出位置和格式
* 具体的文件路径如 `/home/admin/demo/dubbo-access.log`，这样访问日志将打印到指定的文件内

在 Admin 界面，还可以单独指定开启某一台机器的访问日志，以方便精准排查问题，对应的后台规则如下：

```yaml
configVersion: v3.0
enabled: true
configs:
  - match
     address:
       oneof:
        - wildcard: "{ip}:*"
    side: provider
    parameters:
      accesslog: true
```

其中，`{ip}` 替换为具体的机器地址即可。