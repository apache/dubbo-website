---
type: docs
title: "Triple协议迁移指南"
linkTitle: "Triple"
weight: 4
description: "Triple协议迁移指南"
---

## Triple Basic

## Why Should I Migrate From Origin Protocols to Triple

## dubbo2 迁移到 dubbo3 的 Triple 协议需要做哪些事呢？

dubbo3的之初就有一条目标是完美兼容 dubbo2，所以对于 dubbo2 (dubbo协议+hessian2) 用户升级是非常简单的。为了升级的无感，目前默认的序列化和 dubbo2 保持一致为`hessian2`。

所以，如果决定了要升级 dubbo3 的 `Triple`协议，只需要修改配置中的协议名称为`tri`(注意:不是triple)即可。

接下来我们我们以一个使用 dubbo2 协议的[工程](https://github.com/apache/dubbo-website/pull/941)来举例，如何一步一步安全的升级。

1. 仅使用 `dubbo` 协议启动 `provider` 和 `consumer`，并完成调用。
2. 使用 `dubbo` 和 `Triple` 协议 启动`provider`，以`dubbo`协议启动`consumer`，并完成调用。
3. 仅使用`Triple` 协议 启动`provider`和 `consumer`，并完成调用。

### 定义服务

1. 定义接口

```java
public interface IWrapperGreeter {

    //... 
    
    /**
     * unray
     */
    String sayHello(String request);

}
```

2. 实现类如下

```java
public class IGreeter2Impl implements IWrapperGreeter {

    @Override
    public String sayHello(String request) {
        return "hello," + request;
    }
}
```
> 对于 dubbo2 用户来说，可能会对StreamObserver感到陌生，这是dubbo3定义的一种流类型，dubbo2 中并不存在 stream 的类型，所以对于迁移来说，这没有任何影响。
> 

### 仅使用 dubbo 协议

为了验证兼容性，首先以 `Dubbo` 协议启动 [`Provider`](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/com/apache/dubbo/sample/basic/migration/ApiMigrationDubboProvider) 和 [`Consumer`](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/com/apache/dubbo/sample/basic/migration/ApiMigrationDubboConsumer),完成调用，输出如下:
![result](/static/imgs/v3/migration/tri/dubbo3-tri-migration-dubbo-dubbo-result.png)

###  同时使用 dubbo 和 triple 两种协议

如果有一些consumer 服务不想立刻升级，可以让 provider 使用两种协议进行暴露。

使用`Dubbo`协议和`Triple`协议启动[`Provider`](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/com/apache/dubbo/sample/basic/migration/ApiMigrationBothProvider)和[`Consumer`](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/com/apache/dubbo/sample/basic/migration/ApiMigrationBothConsumer),完成调用，输出如下:

![result](/static/imgs/v3/migration/tri/dubbo3-tri-migration-both-dubbo-tri-result.png)


### 仅使用 triple 协议

最终，仅使用`Triple`协议启动[`Provider`](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/com/apache/dubbo/sample/basic/migration/ApiMigrationTriProvider)和[`Consumer`](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src/main/java/com/apache/dubbo/sample/basic/migration/ApiMigrationTriConsumer),完成调用，输出如下:

![result](/static/imgs/v3/migration/tri/dubbo3-tri-migration-tri-tri-result.png)

当所有 consumer 都升级为`Triple`协议时，就可以将 provider 改为`Triple`单协议暴露,升级完成。

### 实现原理

通过上面介绍的升级过程，我们可以很简单的通过修改协议类型来完成升级。框架是怎么帮我们做到这些的呢？

通过对`Triple`协议的介绍，我们知道dubbo3的`Triple`的数据类型是 `protobuf`对象，那为什么非 `protobuf`的 java 对象也可以被正常传输呢。

这里 dubbo3 用了个很取巧的设计，首先判断参数类型，判断是否为`protobuf`对象，如果不是。用一个`protobuf`对象将`request`和`response`进行 wrapper，这样就屏蔽了其他各种序列化带来的复杂度。在 wrapper 对象内部声明序列化类型，来支持序列化的扩展。

wrapper 的`protobuf`的 IDL如下:
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

> 对于请求参数，可以看到 args 被`repeated`修饰，这是因为需要支持 java 方法的多个参数。当然，序列化只能是一种。序列化的实现沿用dubbo2实现的 spi


## For multiple languages users (Already use protobuf) (建议新服务均使用该方法)

对于 dubbo3 和 Triple 来说，主推的是使用 `protobuf`序列化。并且使用`proto`定义的`IDL`进行生成.`IDL`做为多语言中的接口文档，又因为`Triple`协议与`GRPC`互通，可以轻松的与其他语言(比如 go)使用的进行调用。


编写好的`.proto`文件使用 `dubbo-compiler` 插件进行编译并编写实现类。完成方法调用

![result](/static/imgs/v3/migration/tri/dubbo3-tri-migration-tri-tri-result.png)

从上面升级的例子我们可以知道，`Triple`协议使用`protbuf`对象序列化后进行传输，所以对于本身就是`protobuf`对象的方法来说，没有任何其他逻辑。

2. 使用 `protobuf` 插件编译后接口如下
```java
public interface PbGreeter {

    static final String JAVA_SERVICE_NAME = "org.apache.dubbo.sample.tri.PbGreeter";
    static final String SERVICE_NAME = "org.apache.dubbo.sample.tri.PbGreeter";

    static final boolean inited = PbGreeterDubbo.init();

    org.apache.dubbo.sample.tri.GreeterReply greet(org.apache.dubbo.sample.tri.GreeterRequest request);

    default CompletableFuture<org.apache.dubbo.sample.tri.GreeterReply> greetAsync(org.apache.dubbo.sample.tri.GreeterRequest request){
        return CompletableFuture.supplyAsync(() -> greet(request));
    }

    void greetServerStream(org.apache.dubbo.sample.tri.GreeterRequest request, org.apache.dubbo.common.stream.StreamObserver<org.apache.dubbo.sample.tri.GreeterReply> responseObserver);

    org.apache.dubbo.common.stream.StreamObserver<org.apache.dubbo.sample.tri.GreeterRequest> greetStream(org.apache.dubbo.common.stream.StreamObserver<org.apache.dubbo.sample.tri.GreeterReply> responseObserver);
}
```

## stream(流)

stream 是什么?

stream 是 dubbo3 新提供的一种方法类型，在以下场景时建议使用流的方式:

- 接口需要发送大数据量的场景
- 实时要求高的场景

stream 分为以下三种:

- SERVER_STREAM(服务端流)
- CLIENT_STREAM(客户端流)
- BIDIRECTIONAL_STREAM(双向流)

> 由于`java`语言的限制，BIDIRECTIONAL_STREAM和CLIENT_STREAM的实现是一样的。

### wrapper stream

1. api
```java
public interface IWrapperGreeter {

    StreamObserver<String> sayHelloStream(StreamObserver<String> response);

    void sayHelloServerStream(String request, StreamObserver<String> response);
}
```

> 这里 stream 方法的方法入参和返回值和严格约定的，为了防止用户写错而导致了一些奇怪的问题，dubbo3目前做了对参数的检查来避免该问题。
> 特别的，对于`双向流(BIDIRECTIONAL_STREAM)`,需要注意的是参数中的 `StreamObserver` 是响应，返回参数中的 `StreamObserver` 为请求。

2. 实现类
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

3. 调用方式
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

## protobuf stream

对于`protobuf`实现，推荐编写`IDL`使用`compiler`插件进行编译生成。生成的代码大致如下:
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

### Stream Mode Principle of Implementation

`Triple`协议支持了流模式，他是怎么支持的呢？

- 从协议来说层面，`Triple`是建立在`HTTP2`基础上的，所以直接拥有所有`HTTP2`的能力，故拥有了 stream 的能力。

- 对于框架来说，`StreamObserver`只是个接口，并用于入参和出参而已。框架在收发 stream data 时进行相应的接口调用即可。

## Triple on Application Level Discovery

## Interop with GRPC

## The Future: Everything on Stub

