---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/triple/streaming/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/triple/streaming/
description: Streaming 通信
linkTitle: Streaming 通信
title: Streaming 通信
type: docs
weight: 10
---





## 流实现原理

`Triple`协议的流模式

- 从协议层来说，`Triple` 是建立在 `HTTP2` 基础上的，所以直接拥有所有 `HTTP2` 的能力，故拥有了分 `stream` 和全双工的能力。

- 框架层来说，`StreamObserver` 作为流的接口提供给用户，用于入参和出参提供流式处理。框架在收发 stream data 时进行相应的接口调用, 从而保证流的生命周期完整。

## 流使用方式 

### Stream 流
Stream 是 Dubbo3 新提供的一种调用类型，在以下场景时建议使用流的方式:

- 接口需要发送大量数据，这些数据无法被放在一个 RPC 的请求或响应中，需要分批发送，但应用层如果按照传统的多次 RPC 方式无法解决顺序和性能的问题，如果需要保证有序，则只能串行发送
- 流式场景，数据需要按照发送顺序处理, 数据本身是没有确定边界的
- 推送类场景，多个消息在同一个调用的上下文中被发送和处理

Stream 分为以下三种:
- SERVER_STREAM(服务端流)
  ![SERVER_STREAM](/imgs/v3/migration/tri/migrate-server-stream.png)
- CLIENT_STREAM(客户端流)
  ![CLIENT_STREAM](/imgs/v3/migration/tri/migrate-client-stream.png)
- BIDIRECTIONAL_STREAM(双向流)
  ![BIDIRECTIONAL_STREAM](/imgs/v3/migration/tri/migrate-bi-stream.png)

由于 `java` 语言的限制，BIDIRECTIONAL_STREAM 和 CLIENT_STREAM 的实现是一样的。

在 Dubbo3 中，流式接口以 `SteamObserver` 声明和使用，用户可以通过使用和实现这个接口来发送和处理流的数据、异常和结束。

对于 Dubbo2 用户来说，可能会对StreamObserver感到陌生，这是Dubbo3定义的一种流类型，Dubbo2 中并不存在 Stream 的类型，所以对于迁移场景没有任何影响。

{{% alert title="流的语义保证" color="primary" %}}
- 提供消息边界，可以方便地对消息单独处理
- 严格有序，发送端的顺序和接收端顺序一致
- 全双工，发送不需要等待
- 支持取消和超时 
{{% /alert %}}

### Protobuf 序列化的流

对于 `Protobuf` 序列化方式，推荐编写 `IDL` 使用 `compiler` 插件进行编译生成。生成的代码大致如下:
```java
public interface PbGreeter {

    static final String JAVA_SERVICE_NAME = "org.apache.dubbo.sample.tri.PbGreeter";
    static final String SERVICE_NAME = "org.apache.dubbo.sample.tri.PbGreeter";

    static final boolean inited = PbGreeterDubbo.init();
    
    //...

    void greetServerStream(org.apache.dubbo.sample.tri.GreeterRequest request, org.apache.dubbo.common.stream.StreamObserver<org.apache.dubbo.sample.tri.GreeterReply> responseObserver);

    org.apache.dubbo.common.stream.StreamObserver<org.apache.dubbo.sample.tri.GreeterRequest> greetStream(org.apache.dubbo.common.stream.StreamObserver<org.apache.dubbo.sample.tri.GreeterReply> responseObserver);
}
```

## 非 Protobuf 序列化的流
### api
```java
public interface IWrapperGreeter {

    StreamObserver<String> sayHelloStream(StreamObserver<String> response);

    void sayHelloServerStream(String request, StreamObserver<String> response);
}
```

> Stream 方法的方法入参和返回值是严格约定的，为防止写错而导致问题，Dubbo3 框架侧做了对参数的检查, 如果出错则会抛出异常。
> 对于 `双向流(BIDIRECTIONAL_STREAM)`, 需要注意参数中的 `StreamObserver` 是响应流，返回参数中的 `StreamObserver` 为请求流。
### 实现类
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

### 调用方式
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
