---
aliases:
    - /zh/overview/tasks/protocols/web/
    - /zh-cn/overview/tasks/protocols/web/
description: ""
linkTitle: 发布REST风格服务
title: 使用 Dubbo 开发 Web 应用
type: docs
weight: 1
---

Dubbo 支持发布底层基于 `http+json` 协议的 rest 风格服务，对于框架而言支持 rest 风格服务非常重要，你可以：
1. **将后端 Dubbo 接口发布为 rest 服务**，让服务间使用 `http+json` 协议通信，虽然这样通信效率会比 dubbo、triple 差一些，但却使得协议更简单、前端流量接入更方便。
2. **实现多协议服务发布**，dubbo 二进制协议用于后端 RPC 通信，http 协议支持前端流量快速接入同时方便调试。这点我们在本文最后《dubbo&rest 多协议发布》部分有更详细的介绍，同时在 [HTTP网关接入 - dubbo协议]() 中有使用场景介绍。

接下来我们通过一个简单示例学习如何发布 `http+json` 协议的 rest 风格服务，示例使用 Spring Web 注解（Dubbo 还支持 JAX-RS 注解），本示例的完整代码请参见 [dubbo-samples]()。

## 运行示例
你可以跟随以下步骤，尝试运行本文档对应的示例源码。

首先，可通过以下命令下载示例源码
```shell
git clone --depth=1 https://github.com/apache/dubbo-samples.git
```

进入示例源码目录：
```shell
cd dubbo-samples/extensions/protocol/rest/
```

使用 maven 打包示例：
```shell
mvn clean install -DskipTests
```

### 启动server
运行以下命令启动提供者。
```shell
java -jar ./provider/target/xxx.jar
```

### 启动client
* cURL
* Dubbo Client

```shell
curl
```

运行以下命令
```shell
java -jar ./consumer/target/xxx.jar
```

## 源码讲解
### 定义服务
与开发 dubbo 协议一样，我们首先需要通过 Java Interface 定义服务，同时为接口增加注解 Spring Web 注解：
```java

```

### 服务实现
服务的具体实现，与普通 dubbo 服务实现一样：
```java
```

配置使用 `rest` 协议：
```yaml

```

### 服务消费者

配置服务引用，如下所示：
```java

```

接下来，就可以发起对远程服务的 RPC 调用了：
```java
```

或者，你可以是用任何 HTTP 工具访问刚刚发布的服务。

## dubbo&rest 多协议发布
除了单独发布 rest 服务之外，另外一个非常有用的场景是为一个服务同时发布 dubbo、http 协议，Dubbo 框架支持多协议发布，你只需要在以上示例基础上修改配置如下：

```yaml
dubbo:
  protocol:
    - name: dubbo
      port: 20880
      extra-protocols: rest
      serialization: fastjson
```

如果你想在不同的端口发布 dubbo、http 协议，可以使用如下配置：

```yaml
dubbo:
  protocol:
    - name: dubbo
      port: 20880
    - name: rest
      port: 8080
      serialization: fastjson
```

关于多协议的具体使用，我们在 [【HTTP网关接入 - dubbo协议 】]()中有一个描述了一个具体场景，尤其是在单端口同时发布 dubbo、rest 协议，让服务具备高效后端 RPC 通信的同时（使用 dubbo 协议），让服务的测试、前端 HTTP 流量接入变得更简单（使用 rest 协议）。

