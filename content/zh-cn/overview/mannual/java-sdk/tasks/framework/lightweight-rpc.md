---
description: 使用轻量的 Java SDK 开发 RPC Server 和 Client
linkTitle: Server与Client
title: 使用轻量的 Java SDK 开发 RPC Server 和 Client
type: docs
weight: 1
---
本示例演示如何使用轻量 Dubbo SDK 开发 RPC Server 与 Client，示例使用 Java Interface 方式定义、发布和访问 RPC 服务，底层使用 Triple 协议通信。本示例完整代码请参见 <a href="https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api" target="_blank">dubbo-samples</a>。

基于 Dubbo 定义的 Triple 协议，你可以轻松编写浏览器、gRPC 兼容的 RPC 服务，并让这些服务同时运行在 HTTP/1 和 HTTP/2 上。Dubbo Java SDK 支持使用 IDL 或编程语言特有的方式定义服务，并提供一套轻量的 API 来发布或调用这些服务。

## Maven 依赖

在基于 Dubbo RPC 编码之前，您只需要在项目添加一个非常轻量的 `dubbo`依赖包即可，以 Maven 为例：
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo</artifactId>
    <version>3.3.0</version>
</dependency>

<!-- 为了避免 Netty 依赖冲突，您也可以是选择使用 dubbo-shaded 版本！-->
<!--
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-shaded</artifactId>
    <version>3.3.0</version>
</dependency>
-->
```

## 定义服务

定义一个名为 `DemoService`的标准 Java 接口作为 Dubbo 服务（Dubbo 还支持[基于 IDL 的服务定义模式](/zh-cn/overview/mannual/java-sdk/quick-start/)）。

```java
public interface DemoService {
   String sayHello(String name);
}
```

实现 `DemoService` 接口并编写业务逻辑代码。

```java
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        return "Hello " + name + ", response from provider.";
    }
}
```

## 注册服务并启动 Server

启动 server 并在指定端口监听 RPC 请求，在此之前，我们向 server 注册了以下信息：

- 使用 `Triple` 作为通信 RPC 协议与并监听端口 `50051`
- 注册 Dubbo 服务到 `DemoService` server

```java
public class Application {
    public static void main(String[] args) {
        DubboBootstrap.getInstance()
            .protocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051))
            .service(ServiceBuilder.newBuilder().interfaceClass(DemoService.class).ref(new DemoServiceImpl()).build())
            .start()
            .await();
    }
}
```

## 访问服务

最简单方式是使用 HTTP/1.1 POST 请求访问服务，参数则以标准 JSON 格式作为 HTTP 负载传递。如下是使用 cURL 命令的访问示例：

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50051/org.apache.dubbo.demo.DemoService/sayHello
```

> 参数必须以数组格式进行传递，如果有多个参数，则格式类似 `["param1", {"param2-field": "param2-value"}, ...]`，具体请参见 triple 协议规范。

接下来，您也可以使用标准的 Dubbo client 请求服务，指定 server 地址即可发起 RPC 调用，其格式为 `protocol://ip:host`

```java
public class Application {
    public static void main(String[] args) {
        DemoService demoService =
            ReferenceBuilder.newBuilder()
            .interfaceClass(DemoService.class)
            .url("tri://localhost:50051")
            .build()
            .get();

        String message = demoService.sayHello("dubbo");
        System.out.println(message);
    }
}
```

恭喜您， 以上即是 Dubbo Java RPC 通信的基本使用方式！  🎉

## 更多内容

- Triple 协议完全兼容 gRPC，您可以参考这里了解如何  [使用 IDL 编写 gRPC 兼容的服务](/zh-cn/overview/mannual/java-sdk/quick-start/)，或者 [使用其他通信协议]()
- 作为 RPC 框架，Dubbo 支持异步调用、连接管理、context上下文等，请参考 [RPC 框架核心功能]()
- 您可以继续 [使用 API 为应用添加更多微服务治理能力]()，但我们更推进您使用 [Dubbo Spring Boot 开发微服务应用](../../microservice/develop/)
