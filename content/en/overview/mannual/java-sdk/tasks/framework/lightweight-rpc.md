---
description: Develop RPC Server and Client with Lightweight Java SDK
linkTitle: Server and Client
title: Develop RPC Server and Client with Lightweight Java SDK
type: docs
weight: 1
---
This example demonstrates how to use the lightweight Dubbo SDK to develop RPC Server and Client. The example uses Java Interface to define, publish, and access RPC services, with Triple protocol communication at the core. For the complete code of this example, please refer to <a href="https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api" target="_blank">dubbo-samples</a>.

Based on the Triple protocol defined by Dubbo, you can easily write browser and gRPC-compatible RPC services that can run on both HTTP/1 and HTTP/2. The Dubbo Java SDK supports defining services using IDL or language-specific methods and provides a lightweight API for publishing or invoking these services.

## Maven Dependency

Before coding based on Dubbo RPC, you only need to add a very lightweight `dubbo` dependency to your project. Here’s an example in Maven:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo</artifactId>
    <version>3.3.0</version>
</dependency>

<!-- To avoid Netty dependency conflicts, you can also choose to use the dubbo-shaded version! -->
<!--
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-shaded</artifactId>
    <version>3.3.0</version>
</dependency>
-->
```

## Define Service

Define a standard Java interface named `DemoService` as the Dubbo service (Dubbo also supports [IDL-based service definition](/en/overview/mannual/java-sdk/quick-start/)).

```java
public interface DemoService {
   String sayHello(String name);
}
```

Implement the `DemoService` interface and write the business logic code.

```java
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        return "Hello " + name + ", response from provider.";
    }
}
```

## Register Service and Start Server

Start the server and listen for RPC requests on the specified port. Before that, we registered the following information with the server:

- Use `Triple` as the communication RPC protocol and listen on port `50051`
- Register Dubbo service to `DemoService` server

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

## Access Service

The simplest way is to use HTTP/1.1 POST requests to access the service, with parameters passed in standard JSON format as HTTP payload. Here’s an example of accessing using cURL:

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50051/org.apache.dubbo.demo.DemoService/sayHello
```

> Parameters must be passed in array format; if there are multiple parameters, the format looks like `["param1", {"param2-field": "param2-value"}, ...]`. Please refer to the triple protocol specification for details.

Next, you can also use a standard Dubbo client to request services by specifying the server address to initiate an RPC call in the format `protocol://ip:host`.

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

Congratulations! You have now learned the basic usage of Dubbo Java RPC communication! 🎉

## More Content

- The Triple protocol is fully compatible with gRPC; you can refer here to learn how to [write gRPC-compatible services using IDL](/en/overview/mannual/java-sdk/quick-start/), or [use other communication protocols]()
- As an RPC framework, Dubbo supports asynchronous calls, connection management, context, etc. Please refer to [RPC framework core features]()
- You can continue to [add more microservice governance capabilities to your application using API]() but we encourage you to use [Dubbo Spring Boot to develop microservice applications](../../microservice/develop/)

