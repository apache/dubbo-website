---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/triple/pojo/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/triple/pojo/
description: "Triple 协议完全兼容 gRPC，但易用性更好不绑定 Protobuf，你可以继续使用 `Java 接口` 直接定义服务。"
linkTitle: Java接口方式
title: 使用 Java 接口方式开发 triple 通信服务
type: docs
weight: 1
---

**不同于谷歌官方 gRPC 实现，Dubbo 实现的 triple 协议易用性更好（不绑定 Protobuf），你可以继续使用 `Java 接口` 直接定义服务。对于期望平滑升级、没有多语言业务或者不熟悉 Protobuf 的用户而言，`Java 接口`方式是最简单的使用 triple 的方式。**

以下是一个使用`Java 接口`开发 Dubbo 服务的基本示例，示例使用 triple 协议通信，可在此查看 [本示例的完整代码](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api)。

{{% alert title="注意" color="info" %}}
本文使用的示例是基于原生 API 编码的，这里还有一个 [Spring Boot 版本的示例](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-spring-boot) 供参考，同样是 `Java接口+triple` 的模式，此示例还额外加入了服务发现配置。
{{% /alert %}}

## 运行示例
首先，可通过以下命令下载示例源码
```shell
git clone --depth=1 https://github.com/apache/dubbo-samples.git
```

进入示例源码目录：
```shell
cd dubbo-samples/1-basic/dubbo-samples-api
```

### 启动Server
运行以下命令启动 server

```bash
mvn -Dexec.mainClass=org.apache.dubbo.samples.provider.Application exec:java
```

### 启动Client

有两种方式可以调用 server 发布的服务
* 使用标准的 http 工具，如 cURL
* 使用 Dubbo SDK 开发一个 client

#### cURL
```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50052/org.apache.dubbo.samples.api.GreetingsService/sayHi/
```

#### SDK Client

```bash
mvn -Dexec.mainClass=org.apache.dubbo.samples.client.Application exec:java
```

## 源码讲解
如果您是 Dubbo 老用户，你会发现以下内容与之前 Dubbo2 的开发模式基本一样，只是协议名称从 `dubbo` 换成了 `tri`。

### 定义服务
首先是服务定义，使用 Java 接口定义 Dubbo 服务。
```java
public interface GreetingsService {
    String sayHi(String name);
}
```

### 服务提供者
其次，对于提供者一侧而言，需要提供服务的具体实现：
```java
public class GreetingsServiceImpl implements GreetingsService {
    @Override
    public String sayHi(String name) {
        return "hi, " + name;
    }
}
```

最后，是将服务发布出去：
```java
public static void main(String[] args) {
	DubboBootstrap.getInstance()
			.protocol(ProtocolBuilder.newBuilder().name("tri").port(50052).build())
			.service(ServiceBuilder.newBuilder().interfaceClass(GreetingsService.class).ref(new GreetingsServiceImpl()).build())
			.start()
			.await();
}
```

### 服务消费者

接下来，就可以发起对远程服务的 RPC 调用了：
```java
public static void main(String[] args) throws IOException {
	ReferenceConfig<GreetingsService> reference =
			ReferenceBuilder.<GreetingsService>newBuilder()
			.interfaceClass(GreetingsService.class)
			.url("tri://localhost:50052")
			.build();
	DubboBootstrap.getInstance().reference(reference).start();
	GreetingsService service = reference.get();

	String message = service.sayHi("dubbo");
}
```

## 注意事项

### 序列化编码

Dubbo 是如何做到同时支持普通 Java 对象、Protobuf 对象的那？Dubbo 实现中有一个对象类型判断，首先判断参数类型是否为 protobuf 对象，如果不是。用一个 protobuf 对象将 request 和 response 进行包装（wrapper），将普通的 Java 对象传输在底层统一为 protobuf 对象传输。在 wrapper 对象内部声明序列化类型，来支持序列化的扩展。

wrapper 的 IDL 如下:
```proto
syntax = "proto3";

package org.apache.dubbo.triple;

message TripleRequestWrapper {
    // hessian4
    // json
    string serializeType = 1;
    repeated bytes args = 2;
    repeated string argTypes = 3;
}

message TripleResponseWrapper {
    string serializeType = 1;
    bytes data = 2;
    string type = 3;
}
```

对于请求，使用`TripleRequestWrapper`进行包装，对于响应使用`TripleResponseWrapper`进行包装。

> 对于请求参数，可以看到 args 被`repeated`修饰，这是因为需要支持 java 方法的多个参数。当然，序列化只能是一种。序列化的实现沿用 Dubbo2 实现的 spi

### 性能表现
由于链路上传输的数据额外经过了一层序列化编码（如 hessian2），同时，server 端的方法调用基于反射，因此相比于 `protobuf+triple` 的编码模式，Java 接口方式在性能上会存在一定的下降。

Protobuf 模式固然有一定的性能优势，但易用性与使用成本也会陡然增加，我们建议还是优先考虑业务场景，如果没有多语言业务、dubbo2老用户，则继续保持 Java 接口模式是一个比较好、低成本的选择。

### gRPC兼容性
由于 gRPC 仅支持 protobuf 模式，因此本文介绍的 `接口+triple` 的模式无法与谷歌官方原生的 gRPC 协议互调。

### 前端流量接入
对于来自前端的 HTTP 流量（比如浏览器或 web 应用），要想通过网关接入 triple，就要走 triple 内置的 `application/json` 模式发起调用，具体请参见[【使用教程-HTTP网关接入】](/zh-cn/overview/mannual/java-sdk/tasks/gateway/triple/)。