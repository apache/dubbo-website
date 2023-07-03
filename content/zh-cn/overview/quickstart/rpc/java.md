---
description: 使用轻量的 Java SDK 开发 RPC Server 和 Client
linkTitle: Java
title: 使用轻量的 Java SDK 开发 RPC Server 和 Client
type: docs
weight: 1
---

基于 Dubbo 定义的 Triple 协议，你可以轻松编写浏览器、gRPC 兼容的 RPC 服务，并让这些服务同时运行在 HTTP/1 和 HTTP/2 上。Dubbo Java SDK 支持使用 IDL 或编程语言特有的方式定义服务，并提供一套轻量的 API 来发布或调用这些服务。

本示例演示了基于 Triple 协议的 RPC 通信模式，示例使用 Java Interface 方式定义、发布和访问 RPC 服务。本示例完整代码请参见 [xxx](a)。

## 前置条件

在基于 Dubbo RPC 编码之前，您只需要在项目添加一个非常轻量的 `dubbo-core`依赖包即可，以 Maven 为例：
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-core</artifactId>
    <version>${dubbo.version}</version>
</dependency>

<!-- dubbo-core 的唯一传递依赖是 Netty，为了避免依赖冲突，您也可以是选择使用shade版本，这样就不会有任何传递依赖！ -->
<!--
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-core-shaded</artifactId>
    <version>${dubbo.version}</version>
</dependency>
-->
```

## 定义服务

定义一个名为 `DemoService`的标准 Java 接口作为 Dubbo 服务。
```java
public interface DemoService {
   String sayHello(String name);
}
```

实现 `DemoService` 接口并编写业务逻辑代码。
```java
package org.apache.dubbo.demo.provider;

import org.apache.dubbo.demo.DemoService;

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
package org.apache.dubbo.demo.provider;

import org.apache.dubbo.common.constants.CommonConstants;
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.ProtocolConfig;
import org.apache.dubbo.config.bootstrap.builders.ServiceBuilder;
import org.apache.dubbo.config.bootstrap.DubboBootstrap;
import org.apache.dubbo.demo.DemoService;

public class Application {

    public static void main(String[] args) {
        DubboBootstrap.getInstance()
            .application(new ApplicationConfig("demo-provider"))
            .protocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051))
            .service(ServiceBuilder.newBuilder().interfaceClass(DemoService.class).ref(new DemoServiceImpl()).build())
            .start()
            .await();
    }

}
```

## 访问服务

最简单方式是使用 HTTP/1.1 POST 请求访问服务，参数则作以[标准 JSON 格式](aa)作为 HTTP 负载传递。如下是使用 cURL 命令的访问示例：
```shell
curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:50051/org.apache.dubbo.demo.DemoService/sayHello
```

也可以使用标准的 Dubbo client 请求服务，指定 server 地址即可发起 RPC 调用，其格式为 `protocol://ip:host`
```java
package org.apache.dubbo.demo.consumer;

import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.bootstrap.builders.ReferenceBuilder;
import org.apache.dubbo.demo.DemoSer·vice;

public class Application {
    public static void main(String[] args) {
        DemoService demoService =
            ReferenceBuilder.newBuilder()
            .application(new ApplicationConfig("demo-consumer"))
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

- Triple 协议完全兼容 gRPC，您可以参考这里了解如何  [使用 IDL 编写 gRPC 兼容的服务]()
- 如果您准备构建完善的微服务体系，参考这里可轻松的 [为 Dubbo RPC 加入地址发现等微服务治理能力]()





