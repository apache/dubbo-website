---
aliases:
  - /zh/overview/tasks/protocols/dubbo/
  - /zh-cn/overview/tasks/protocols/dubbo/
description: "使用 Dubbo 开发 TCP 通信协议服务"
linkTitle: dubbo协议
title: 使用 Dubbo 开发 TCP 通信协议服务
type: docs
weight: 2
---

本示例演示了如何开发基于 `dubbo` 协议通信的服务，可在此查看 [本示例的完整代码]()：

> 新增一个示例，使用 dubbo 通信，但不包含注册中心配置

{{% alert title="注意" color="info" %}}
为了保证老版本兼容性，Dubbo 3.3.0 及之前版本的默认协议都是 `dubbo`。但如果您是新用户，您正在考虑使用 Dubbo 构建一套全新的微服务系统，我们推荐您在应用中明确配置使用 `triple` 协议。
{{% /alert %}}

## 运行示例
你可以跟随以下步骤，尝试运行本文档对应的示例源码。

首先，可通过以下命令下载示例源码
```shell
git clone --depth=1 https://github.com/apache/dubbo-samples.git
```

进入示例源码目录：
```shell
cd dubbo-samples/extensions/protocol/dubbo/
```

使用 maven 打包示例：
```shell
mvn clean install -DskipTests
```

### 启动提供者
运行以下命令启动提供者。
```shell
java -jar ./provider/target/xxx.jar
```

### 启动消费者
运行以下命令
```shell
java -jar ./consumer/target/xxx.jar
```

## 源码讲解

### 定义服务
首先是服务定义，使用 `dubbo` 协议时，我们首选需要通过 Java Interface 定义 Dubbo 服务。
```java
```

### 服务提供者
其次，对于提供者一侧而言，需要提供服务的具体实现：
```java
```

配置使用 `dubbo` 协议：
```java
```

最后，是将服务发布出去：
```java

```

### 服务消费者

配置服务引用，如下所示：
```java
```

接下来，就可以发起对远程服务的 RPC 调用了：
```java
```

## 更多协议配置

### 序列化
消费者与提供者之间的调用使用 dubbo 协议，**参数使用的默认数据编码格式（即序列化）是 fastjson2**，同时你也可以设置使用其他任意序列化协议，序列化不影响 dubbo 协议的正常工作（只会对编码性能有一些影响）。

{{% alert title="注意" color="info" %}}
自 3.2.0 版本开始，Dubbo 增加了序列化协议的自动协商机制，如果满足条件 `两端都为 Dubbo3 特定版本 + 存在 Fastjson2 相关依赖`，则会自动使用 fastjson2 序列化协议，否则使用 hessian2 协议，协商对用户透明无感。

由于 Dubbo2 默认序列化协议是 hessian2，对于部分有拦截rpc调用payload的场景，比如sidecar等对链路payload有拦截与解析，在升级过程中需留意兼容性问题，其他用户不用担心。
{{% /alert %}}

### 共享连接
对 dubbo 协议实现来说，**消费端机器A与提供者机器B之间默认是使用的同一个链接**，即不论在 A 与 B 之间有多少服务调用，默认都始终使用同一个 tcp 连接。当然，Dubbo 框架提供了方法可以让您调整 A 与 B 之间的 tcp 连接数。

此外，dubbo 协议还支持配置如 payload 限制、序列化、连接数、连接超时时间、心跳等，具体请参见【参考手册 - dubbo协议】。

## 发布REST风格服务


### 更多内容：
* dubbo 协议规范
* RPC 框架，如超时时间、异步调用等
* 前端 HTTP 网关流量接入后端 dubbo 协议
