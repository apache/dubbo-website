---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/triple/streaming/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/triple/streaming/
description: Streaming 通信
linkTitle: Streaming流式通信
title: Streaming 通信
type: docs
weight: 4
---
如在本章《选择 RPC 通信协议》一节提到的，Streaming 是 Dubbo3 新提供的一种 RPC 数据传输模式，适用于以下场景:

- 接口需要发送大量数据，这些数据无法被放在一个 RPC 的请求或响应中，需要分批发送，但应用层如果按照传统的多次 RPC 方式无法解决顺序和性能的问题，如果需要保证有序，则只能串行发送
- 流式场景，数据需要按照发送顺序处理, 数据本身是没有确定边界的
- 推送类场景，多个消息在同一个调用的上下文中被发送和处理

Streaming 分为以下三种:
- SERVER_STREAM(服务端流)
- CLIENT_STREAM(客户端流)
- BIDIRECTIONAL_STREAM(双向流)

以下示例演示 triple streaming 流式通信的基本使用方法，涵盖了客户端流、服务端流、双向流等三种模式，示例使用 Protocol Buffers 的服务开发模式，对于 Java 接口模式的开发者可以在本文最后查看相应说明。

可在此查看 [本示例完整代码](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-streaming)。

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
与 [使用 Protobuf(IDL) 开发 triple 协议服务]() 一节中提到的一样，这个示例使用 protobuf 定义服务，因此示例需要的依赖、配置等基本是一致的，请参考那一节了解完整详情。接下来，我们将重点讲解流式通信部分的内容。

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
参照以下grpc的文章写一份：

https://grpc.io/docs/languages/java/basics/#generating-client-and-server-code

### Server
#### 服务端流


#### 双向流

### Client

#### 服务端流


#### 双向流

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
