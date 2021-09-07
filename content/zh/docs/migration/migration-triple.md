---
type: docs
title: "Triple协议迁移指南"
linkTitle: "Triple"
weight: 4
description: "Triple协议迁移指南"
---

## Triple Basic

## Why Should I Migrate From Origin Protocols to Triple

## For Normal JAVA Users (hessian/json...etc)

dubbo3的之初就有一条目标是完美兼容 dubbo2，所以对于 dubbo2 (dubbo协议+hessian2) 用户升级是非常简单的。为了升级的无感，目前默认的序列化和 dubbo2 保持一致为`hessian2`。

所以，如果决定了要升级 dubbo3 的 `Triple`协议，只需要修改配置中的协议名称为`tri`(注意:不是triple)

### 服务 api

1. 定义接口

```java
public interface WrapGreeter {
    
    /**
     * <pre>
     *  Sends a greeting
     * </pre>
     */
    String sayHelloLong(int len);

    /**
     * unray
     */
    String sayHello(String request);

    /**
     * unray
     */
    void sayHelloResponseVoid(String request);

    /**
     * unray
     */
    String sayHelloRequestVoid();

    /**
     * bi / client stream
     */
    StreamObserver<String> sayHelloStream(StreamObserver<String> response);

    /**
     * server stream
     */
    void sayHelloServerStream(String request, StreamObserver<String> response);
}
```
> 对于 dubbo2 用户来说，可能会对StreamObserver感到陌生，这是dubbo3定义的一种流类型，dubbo2 中并不存在 stream 的类型，所以对于迁移来说，这没有任何影响。
> stream 分为 SERVER_STREAM, CLIENT_STREAM, BIDIRECTIONAL_STREAM,由于`java`语言的限制，BIDIRECTIONAL_STREAM和CLIENT_STREAM的实现是一样的。

### provider 

1. 将 api 模块引入 provider 模块中,


2. 进行接口实现

由于 unary 方法和 dubbo2 的方式没有任何区别，这里就不贴出代码了。我们来看下 stream 方法如何使用。
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

> 这里 stream 方法的方法入参和返回值和严格约定的，为了防止用户写错而导致了一些奇怪的问题，dubbo3目前做了对参数的检查来避免该问题。
> 特别的，对于`双向流(BIDIRECTIONAL_STREAM)`,需要注意的是参数中的 `StreamObserver` 是响应，返回参数中的 `StreamObserver` 为请求。

3. 注册 service,并启动 dubbo 提供者
   
在注册服务这部和 dubbo2 也没有任何区别，升级 `Triple` 协议只需要设置协议即可。可以参考如下代码

```java
ServiceConfig<WrapGreeter> wrapService = new ServiceConfig<>();
wrapService.setInterface(WrapGreeter.class);
wrapService.setRef(new WrapGreeterImpl());

DubboBootstrap bootstrap = DubboBootstrap.getInstance();
bootstrap.application(new ApplicationConfig("demo-provider"))
        .registry(new RegistryConfig(TriSampleConstants.ZK_ADDRESS))
        .protocol(new ProtocolConfig(CommonConstants.TRIPLE, TriSampleConstants.SERVER_POINT))
        .service(wrapService)
        .start()
        .await();
```

> CommonConstants.TRIPLE的值为`tri`

### consumer

对于消费者，流程和提供者一致，修改`protocol=tri`即可。

对于新的方法类型 stream 的调用，这里给出一下代码。

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

### Principle of Implementation

通过上面的介绍，我们知道dubbo3的`Triple`的数据类型是 `protobuf`对象，那为什么非 `protobuf`的 java 对象也可以被正常传输呢。

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

接下来这里给出一个使用`IDL`+`dubbo-compiler`的使用方法。

### 定义 IDL 生成 api

1. IDL定义如下
```proto
syntax = "proto3";

option java_multiple_files = true;

package org.apache.dubbo.sample.tri;


// The request message containing the user's name.
message GreeterRequest {
  string name = 1;
}

// The response message containing the greetings
message GreeterReply {
  string message = 1;
}

service PbGreeter{
  rpc greet(GreeterRequest) returns (GreeterReply);

  rpc greetWithAttachment (GreeterRequest) returns (GreeterReply);

  rpc greetException(GreeterRequest) returns (GreeterReply);

  rpc greetStream(stream GreeterRequest) returns (stream GreeterReply);

  rpc greetServerStream(GreeterRequest) returns (stream GreeterReply);
}
```

2. 在 `pom.xml` 中引入`dubbo-compiler`

```xml
<build>
    <extensions>
        <extension>
            <groupId>kr.motd.maven</groupId>
            <artifactId>os-maven-plugin</artifactId>
            <version>1.6.1</version>
        </extension>
    </extensions>
    <plugins>
        <plugin>
            <groupId>org.xolstice.maven.plugins</groupId>
            <artifactId>protobuf-maven-plugin</artifactId>
            <version>0.6.1</version>
            <configuration>
                <protocArtifact>com.google.protobuf:protoc:${protoc.version}:exe:${os.detected.classifier}</protocArtifact>
                <pluginId>grpc-java</pluginId>
                <pluginArtifact>io.grpc:protoc-gen-grpc-java:${grpc.version}:exe:${os.detected.classifier}</pluginArtifact>
                <protocPlugins>
                    <protocPlugin>
                        <id>dubbo</id>
                        <groupId>org.apache.dubbo</groupId>
                        <artifactId>dubbo-compiler</artifactId>
                        <version>0.0.3</version>
                        <mainClass>org.apache.dubbo.gen.dubbo.Dubbo3Generator</mainClass>
                    </protocPlugin>
                </protocPlugins>
            </configuration>
            <executions>
                <execution>
                    <goals>
                        <goal>compile</goal>
                        <goal>test-compile</goal>
                        <goal>compile-custom</goal>
                        <goal>test-compile-custom</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>${maven-compiler-plugin.version}</version>
            <configuration>
                <source>${source.level}</source>
                <target>${target.level}</target>
            </configuration>
        </plugin>
    </plugins>
</build>
```

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
### provider

与 wrapper 模式一致,这里不再赘述

### consumer 

与 wrapper 模式一致,这里不再赘述

### Principle of Implementation

从上面我们知道，`Triple`协议使用`protbuf`对象序列化后进行传输，所以对于本身就是`protobuf`对象的方法来说，没有任何其他逻辑。

## Stream Mode Principle of Implementation

`Triple`协议支持了流模式，他是怎么支持的呢？

从协议来说层面，`Triple`是建立在`HTTP2`基础上的，所以直接拥有所有`HTTP2`的能力，故拥有了 stream 的能力。

对于框架来说，`StreamObserver`只是个接口，并用于入参和出参而已。框架在收发 stream data 时进行相应的接口调用即可。

## Hand-on Samples

## Triple on Application Level Discovery

## Interop with GRPC

## The Future: Everything on Stub

