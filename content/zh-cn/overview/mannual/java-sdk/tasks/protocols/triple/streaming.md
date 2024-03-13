---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/triple/streaming/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/triple/streaming/
description: "演示了服务端流、双向流等 Streaming 流式通信的基本使用方法。"
linkTitle: Streaming流式通信
title: Streaming 通信
type: docs
weight: 4
---
在 [选择 RPC 通信协议](../../protocol/) 一节提到，Streaming 是 Dubbo3 新提供的一种 RPC 数据传输模式，适用于以下场景:

- 接口需要发送大量数据，这些数据无法被放在一个 RPC 的请求或响应中，需要分批发送，但应用层如果按照传统的多次 RPC 方式无法解决顺序和性能的问题，如果需要保证有序，则只能串行发送
- 流式场景，数据需要按照发送顺序处理, 数据本身是没有确定边界的
- 推送类场景，多个消息在同一个调用的上下文中被发送和处理

Streaming 分为以下三种:
- SERVER_STREAM(服务端流)
- CLIENT_STREAM(客户端流)
- BIDIRECTIONAL_STREAM(双向流)

以下示例演示 triple streaming 流式通信的基本使用方法，涵盖了客户端流、服务端流、双向流等三种模式，示例使用 Protocol Buffers 的服务开发模式，对于 Java 接口模式的开发者可以在本文最后查看相应说明。可在此查看 [本示例完整代码](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-streaming)。

## 运行示例

首先，可通过以下命令下载示例源码：
```shell
git clone --depth=1 https://github.com/apache/dubbo-samples.git
```

进入示例源码目录：
```shell
cd dubbo-samples/2-advanced/dubbo-samples-triple-streaming
```

编译项目，由 IDL 生成代码，这会调用 dubbo 提供的 protoc 插件生成对应的服务定义代码：
```shell
mvn clean compile
```

### 启动server

运行以下命令，启动 server：
```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.streaming.TriStreamServer"
```

#### 启动client
运行以下命令，启动 client：

```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.streaming.TriStreamClient"
```

## 源码解读
与 [使用 Protobuf(IDL) 开发 triple 协议服务](../idl/) 一节中提到的一样，这个示例使用 protobuf 定义服务，因此示例需要的依赖、配置等基本是一致的，请参考那一节了解完整详情。接下来，我们将重点讲解流式通信部分的内容。

### protobuf服务定义

```protobuf
syntax = "proto3";
option java_multiple_files = true;
package org.apache.dubbo.samples.tri.streaming;

message GreeterRequest {
  string name = 1;
}
message GreeterReply {
  string message = 1;
}

service Greeter{
  rpc biStream(stream GreeterRequest) returns (stream GreeterReply);
  rpc serverStream(GreeterRequest) returns (stream GreeterReply);
}
```

在上面的 proto 文件中，我们定义了两个方法：
* `biStream(stream GreeterRequest) returns (stream GreeterReply)` 双向流
* `serverStream(GreeterRequest) returns (stream GreeterReply)` 服务端流

### 生成代码
接下来，我们需要从 .proto 服务定义生成 Dubbo 客户端和服务器接口。protoc dubbo 插件可以帮助我们生成需要的代码，在使用 Gradle 或 Maven 时，protoc 构建插件可以生成必要的代码作为构建的一部分。具体 maven 配置及代码生成步骤我们在 [上一节](/zh-cn/overview/mannual/java-sdk/tasks/protocols/triple/idl/) 中有具体的描述。

target/generated-sources/protobuf/java/org/apache/dubbo/samples/tri/streaming/ 目录中可以发现如下生成代码，其中我们将重点讲解 `DubboGreeterTriple.java`：

```
├── DubboGreeterTriple.java
├── Greeter.java
├── GreeterOuterClass.java
├── GreeterReply.java
├── GreeterReplyOrBuilder.java
├── GreeterRequest.java
└── GreeterRequestOrBuilder.java
```

### Server
首先，让我们看一下如何定义服务实现并启动提供者：
1. 实现 IDL 代码生成过程中定义的服务基类，提供自定义的业务逻辑。
2. 运行 Dubbo 服务以侦听来自客户端的请求并返回服务响应。

#### 提供服务实现 GreeterImplBase
定义类 `GreeterImpl` 实现 `DubboGreeterTriple.GreeterImplBase`。

```java
public class GreeterImpl extends DubboGreeterTriple.GreeterImplBase {
   // ...
}
```
##### 服务端流

`GreeterImpl` 实现了所有 rpc 定义中的方法。接下里，我们看一下 server-side streaming 的具体定义。

不同于普通的方法定义，`serverStream` 方法有两个参数，第一个参数 `request` 是入参，第二个参数 `responseObserver` 为响应值，其参数类型是 `StreamObserver<GreeterReply>`。在方法实现中，我们不停的调用 `responseObserver.onNext(...)` 将结果发送回消费方，并在最后调用 `onCompleted()` 表示流式响应结束。

```java
@Override
public void serverStream(GreeterRequest request, StreamObserver<GreeterReply> responseObserver) {
	LOGGER.info("receive request: {}", request.getName());
	for (int i = 0; i < 10; i++) {
		GreeterReply reply = GreeterReply.newBuilder().setMessage("reply from serverStream. " + i).build();
		responseObserver.onNext(reply);
	}
	responseObserver.onCompleted();
}
```

##### 双向流
双向流方法 `biStream` 的参数和返回值都是 `StreamObserver<...>` 类型。但需要注意的是，它与我们传统方法定义中参数是请求值、返回值是响应的理解是反过来的，在这里，参数 `StreamObserver<GreeterReply> responseObserver` 是响应，我们通过 responseObserver 不停的写回响应。

请注意这里`请求流`与`响应流`是独立的，我们在写回响应流数据的过程中，随时可能有请求流到达，对于每个流而言，值都是有序的。

```java
@Override
public StreamObserver<GreeterRequest> biStream(StreamObserver<GreeterReply> responseObserver) {
	return new StreamObserver<GreeterRequest>() {
		@Override
		public void onNext(GreeterRequest data) {
			GreeterReply resp = GreeterReply.newBuilder().setMessage("reply from biStream " + data.getName()).build();
			responseObserver.onNext(resp);
		}

		@Override
		public void onError(Throwable throwable) {

		}

		@Override
		public void onCompleted() {

		}
	};
}
```

#### 启动 server
启动 Dubbo 服务的过程与普通应用完全一致：

```java
public static void main(String[] args) throws IOException {
	ServiceConfig<Greeter> service = new ServiceConfig<>();
	service.setInterface(Greeter.class);
	service.setRef(new GreeterImpl("tri-stub"));

	ApplicationConfig applicationConfig = new ApplicationConfig("tri-stub-server");
	applicationConfig.setQosEnable(false);

	DubboBootstrap bootstrap = DubboBootstrap.getInstance();
	bootstrap.application(applicationConfig)
			.registry(new RegistryConfig(TriSampleConstants.ZK_ADDRESS))
			.protocol(new ProtocolConfig(CommonConstants.TRIPLE, TriSampleConstants.SERVER_PORT))
			.service(service)
			.start();
}
```

### Client
和普通的 Dubbo 服务调用一样，我们首先需要声明 rpc 服务引用：

```java
public static void main(String[] args) throws IOException {
	ReferenceConfig<Greeter> ref = new ReferenceConfig<>();
	ref.setInterface(Greeter.class);
	ref.setProtocol(CommonConstants.TRIPLE);

	DubboBootstrap.getInstance().reference(ref).start();
	Greeter greeter = ref.get();
}
```

接下来，我们就可以利用 `greeter` 像调用本地方法一样发起调用了。

#### 服务端流
调用 `serverStream()` 传入能够处理流式响应的 `SampleStreamObserver` 对象，调用发起后即快速返回，之后流式响应会不停的发送到 `SampleStreamObserver`。

```java
GreeterRequest request = GreeterRequest.newBuilder().setName("server stream request.").build();
greeter.serverStream(request, new SampleStreamObserver());
```

以下是 `SampleStreamObserver` 类的具体定义，包含其收到响应后的具体处理逻辑。

```java
private static class SampleStreamObserver implements StreamObserver<GreeterReply> {
	@Override
	public void onNext(GreeterReply data) {
		LOGGER.info("stream <- reply:{}", data);
	}

	// ......
}
```

#### 双向流
调用 `greeter.biStream()` 方法会立即返回一个 `requestStreamObserver`，同时，需要为方法传入一个能处理响应的 observer 对象 `new SampleStreamObserver()`。

接下来，我们就可以用才刚才返回值中得到的 `requestStreamObserver` 持续发送请求 `requestStreamObserver.onNext(request)`；此时，如果有响应返回，则会由 `SampleStreamObserver` 接收处理，其定义请参考上文。

```java
StreamObserver<GreeterRequest> requestStreamObserver = greeter.biStream(new SampleStreamObserver());
for (int i = 0; i < 10; i++) {
	GreeterRequest request = GreeterRequest.newBuilder().setName("name-" + i).build();
	requestStreamObserver.onNext(request);
}
requestStreamObserver.onCompleted();
```

## 其他
### Java接口模式下的流式通信
对于不使用 Protobuf 的用户而言，你可以直接在接口中定义 streaming 格式的方法，这样你就能使用流式通信了。

#### 接口定义
```java
public interface WrapperGreeter {
    // 双向流
    StreamObserver<String> sayHelloStream(StreamObserver<String> response);
    // 服务端流
    void sayHelloServerStream(String request, StreamObserver<String> response);
}
```

其中，`org.apache.dubbo.common.stream.StreamObserver` 是 Dubbo 框架提供的流式通信参数类型，请务必按照以上示例所示的方式定义

> Stream 方法的方法入参和返回值是严格约定的，为防止写错而导致问题，Dubbo3 框架侧做了对参数的检查, 如果出错则会抛出异常。
> 对于 `双向流(BIDIRECTIONAL_STREAM)`, 需要注意参数中的 `StreamObserver` 是响应流，返回参数中的 `StreamObserver` 为请求流。

#### 实现类
```java
public class WrapGreeterImpl implements WrapGreeter {

    //...

    @Override
    public StreamObserver<String> sayHelloStream(StreamObserver<String> response) {
        return new StreamObserver<String>() {
            @Override
            public void onNext(String data) {
                System.out.println(data);
                response.onNext("hello,"+data);
            }

            @Override
            public void onError(Throwable throwable) {
                throwable.printStackTrace();
            }

            @Override
            public void onCompleted() {
                System.out.println("onCompleted");
                response.onCompleted();
            }
        };
    }

    @Override
    public void sayHelloServerStream(String request, StreamObserver<String> response) {
        for (int i = 0; i < 10; i++) {
            response.onNext("hello," + request);
        }
        response.onCompleted();
    }
}
```

#### 调用方式
```java
delegate.sayHelloServerStream("server stream", new StreamObserver<String>() {
    @Override
    public void onNext(String data) {
        System.out.println(data);
    }

    @Override
    public void onError(Throwable throwable) {
        throwable.printStackTrace();
    }

    @Override
    public void onCompleted() {
        System.out.println("onCompleted");
    }
});


StreamObserver<String> request = delegate.sayHelloStream(new StreamObserver<String>() {
    @Override
    public void onNext(String data) {
        System.out.println(data);
    }

    @Override
    public void onError(Throwable throwable) {
        throwable.printStackTrace();
    }

    @Override
    public void onCompleted() {
        System.out.println("onCompleted");
    }
});
for (int i = 0; i < n; i++) {
    request.onNext("stream request" + i);
}
request.onCompleted();
```
