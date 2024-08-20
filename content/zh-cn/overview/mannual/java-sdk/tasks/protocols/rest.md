---
aliases:
    - /zh/overview/tasks/protocols/
    - /zh-cn/overview/tasks/protocols/
description: "演示了如何以标准 `rest` 请求访问 triple、dubbo 协议发布的服务。"
hide: true
linkTitle: rest协议
title: 发布 REST 风格的服务
type: docs
weight: 3
---

**本文要讲的 "rest 协议" 实际上并不是一个真正的协议实现，而是关于如何使得 triple 协议支持以 rest 风格的 http 请求直接访问。** 我们将演示如何使用 rest 请求访问标准 triple 协议的 Dubbo 服务。

{{% alert title="注意" color="warning" %}}
自 Dubbo 3.3 版本之后，我们已经完全移除了老版本的 rest 协议实现，新版本的内置协议实现只剩下 triple 与 dubbo。因此，当我们提到 rest 时，都是指 triple 协议的 rest 访问支持能力。
{{% /alert %}}

在讲解 [triple 协议示例](../triple/interface/#curl) 时，我们曾提到 triple 协议支持以 `application/json` 格式直接访问：

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50052/org.apache.dubbo.samples.api.GreetingsService/sayHi/
```

如果你觉得以上 `http://localhost:50052/org.apache.dubbo.samples.api.GreetingsService/sayHi` 格式的 http 请求不够好，我们还可以让 triple 支持 rest 格式的 http 请求，只需要为接口增加一些注解即可 -- 目前支持 Spring Web、JAX-RS 两种注解格式。以下示例的完整代码请参见 [dubbo-samples-triple-rest](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-rest)。

## 运行示例
你可以跟随以下步骤，尝试运行本文档对应的示例源码。

首先，可通过以下命令下载示例源码
```shell
git clone --depth=1 https://github.com/apache/dubbo-samples.git
```

进入示例源码目录：
```shell
cd dubbo-samples/2-advanced/dubbo-samples-triple-rest/dubbo-samples-triple-rest-springmvc
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


## 实际应用场景
接下来，我们看一下在 triple 协议支持 rest 格式访问后，能被应用于哪些场景中解决实际问题。

### Spring Cloud 互调
首先，第一个场景就是实现 Dubbo 体系与 http 微服务体系互通。

设想你是一条业务线负责人，你们有一套基于 Dubbo 开发的微服务集群，集群内服务间都是基于 triple 二进制协议通信；公司内还有一个重要业务，是跑在基于 Spring Cloud 开发的微服务集群上，而 Spring Cloud 集群内的服务间都是 http+json 协议通信。现在要实现这两个业务的互通，服务之间如何实现互调那？triple 协议支持 rest 格式访问可以解决这个问题，对于 Dubbo 微服务集群而言，相当于是对内使用 triple 二进制协议通信，对外交互使用 triple 提供的 rest 请求格式。

关于这部分的具体使用示例，请参考博客 [微服务最佳实践零改造实现 Spring Cloud、Apache Dubbo 互通](zh-cn/blog/2023/10/07/微服务最佳实践零改造实现-spring-cloud-apache-dubbo-互通/)。

### 网关流量接入

支持 rest 格式访问的另外一个非常有价值的场景就是方便网关流量接入。二进制格式的 rpc 协议接入一直是个难题，之前 dubbo 还特意提供了 `泛化调用` 来解决这个问题，网关可以基于泛化调用实现 `http -> dubbo` 协议转换来接入后端微服务集群。

现在，有了 rest 格式支持，我们有办法让接入变得更加简单。具体请参见 [HTTP 网关流量接入](../../gateway/)

