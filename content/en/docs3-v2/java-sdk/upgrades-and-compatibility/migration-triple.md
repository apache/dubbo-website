---
type: docs
title: "Guide to Migrating Dubbo Protocol to Triple Protocol"
linkTitle: "Guide to migrating Dubbo protocol to Triple protocol"
weight: 2
description: "Triple Protocol Migration Guide"
---

## Triple Introduction

For the format and principle of the `Triple` protocol, please refer to [RPC Communication Protocol](/zh-cn/docs/concepts/rpc-protocol/)

According to the goals of Triple design, the `Triple` protocol has the following advantages:

- Capable of cross-language interaction. Both the traditional multi-language and multi-SDK mode and the Mesh cross-language mode require a more general and scalable data transmission protocol.
- Provide a more complete request model. In addition to supporting the traditional Request/Response model (Unary one-way communication), it also supports Stream (streaming communication) and Bidirectional (two-way communication).
- Easy to expand, high penetration, including but not limited to Tracing / Monitoring and other support, should also be recognized by devices at all levels, gateway facilities, etc. can identify data packets, friendly to Service Mesh deployment, and reduce the difficulty of understanding for users.
- Fully compatible with grpc, the client/server can communicate with the native grpc client.
- Components in the existing grpc ecosystem can be reused to meet cross-language, cross-environment, and cross-platform intercommunication requirements in cloud-native scenarios.

For Dubbo users currently using other protocols, the framework provides migration capabilities compatible with existing serialization methods. Without affecting existing online businesses, the cost of migrating protocols is almost zero.

Dubbo users who need to add new connection to Grpc service can directly use the Triple protocol to achieve the connection, and do not need to introduce the grpc client separately to complete it. Not only can the existing Dubbo ease of use be retained, but also the complexity of the program and the development and maintenance can be reduced. Cost, it can be connected to the existing ecology without additional adaptation and development.

For Dubbo users who need gateway access, the Triple protocol provides a more native way to make gateway development or use open source grpc gateway components easier. The gateway can choose not to parse the payload, which greatly improves the performance. When using the Dubbo protocol, the language-related serialization method is a big pain point for the gateway, and the traditional HTTP-to-Dubbo method is almost powerless for cross-language serialization. At the same time, since Triple's protocol metadata is stored in the request header, the gateway can easily implement customized requirements, such as routing and current limiting.


## Dubbo2 protocol migration process

Dubbo2 users use dubbo protocol + custom serialization, such as hessian2 to complete remote calls.

By default, Grpc only supports Protobuf serialization, and it cannot support multi-parameter and method overloading in the Java language.

At the beginning of Dubbo3, one goal was to be perfectly compatible with Dubbo2. Therefore, in order to ensure the smooth upgrade of Dubbo2, the Dubbo framework has done a lot of work to ensure that the upgrade is seamless. Currently, the default serialization is consistent with Dubbo2 as `hessian2`.

Therefore, if you decide to upgrade to the `Triple` protocol of Dubbo3, you only need to modify the protocol name in the configuration to `tri` (note: not triple).

Next we use a [project] (https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/ org/apache/dubbo/sample/tri/migration) as an example, how to upgrade safely step by step.

1. Only use the `dubbo` protocol to start `provider` and `consumer`, and complete the call.
2. Use `dubbo` and `tri` protocols to start `provider`, use `dubbo` protocol to start `consumer`, and complete the call.
3. Start `provider` and `consumer` using only `tri` protocol, and complete the call.

### Define the service

1. Define the interface
```java
public interface IWrapperGreeter {

    //...
    
    /**
     * This is a normal interface, not serialized using pb
     */
    String sayHello(String request);

}
```

2. The implementation class is as follows
```java
public class IGreeter2Impl implements IWrapperGreeter {

    @Override
    public String sayHello(String request) {
        return "hello," + request;
    }
}
```

### Only use dubbo protocol

To ensure compatibility, we first upgrade some providers to the `dubbo3` version and use the `dubbo` protocol.

Start a [`Provider`] using the `dubbo` protocol (https://github.com/apache/dubbo-samples/blob/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org /apache/dubbo/sample/tri/migration/ApiMigrationDubboProvider.java) and [`Consumer`](https://github.com/apache/dubbo-samples/blob/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/migration/ApiMigrationDubboConsumer.java), complete the call, the output is as follows:
![result](/imgs/v3/migration/tri/dubbo3-tri-migration-dubbo-dubbo-result.png)

### Use dubbo and triple protocol at the same time

For the upgrade of online services, it is impossible to complete the provider and consumer upgrades at the same time. It needs to be operated step by step to ensure business stability.
In the second step, the provider provides a dual-protocol way to support dubbo + tri clients at the same time.

The structure is shown in the figure:
![trust](/imgs/v3/migration/tri/migrate-dubbo-tri-strust.png)

> According to the recommended upgrade steps, the provider already supports the tri protocol, so the consumer of dubbo3 can directly use the tri protocol

Start [`Provider`] using `dubbo` protocol and `triple` protocol (https://github.com/apache/dubbo-samples/blob/master/3-extensions/protocol/dubbo-samples-triple/src/main /java/org/apache/dubbo/sample/tri/migration/ApiMigrationBothProvider.java) and [`Consumer`](https://github.com/apache/dubbo-samples/blob/master/3-extensions/protocol/ dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/migration/ApiMigrationBothConsumer.java), complete the call, the output is as follows:

![result](/imgs/v3/migration/tri/dubbo3-tri-migration-both-dubbo-tri-result.png)


### Only use triple protocol

When all consuemr are upgraded to a version that supports the `Triple` protocol, the provider can be switched to only use the `Triple` protocol to start

The structure is shown in the figure:
![trust](/imgs/v3/migration/tri/migrate-only-tri-strust.png)

[Provider](https://github.com/apache/dubbo-samples/blob/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/ migration/ApiMigrationTriProvider.java)
and [Consumer](https://github.com/apache/dubbo-samples/blob/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri /migration/ApiMigrationTriConsumer.java) to complete the call, the output is as follows:

![result](/imgs/v3/migration/tri/dubbo3-tri-migration-tri-tri-result.png)


### Implementation principle

Through the upgrade process described above, we can easily complete the upgrade by modifying the protocol type. How does the framework help us do this?

Through the introduction of the `Triple` protocol, we know that the data type of `Triple` in Dubbo3 is a `protobuf` object, so why non-`protobuf` java objects can also be transmitted normally.

Here Dubbo3 uses an ingenious design, first judge whether the parameter type is a `protobuf` object, if not. Use a `protobuf` object to wrap `request` and `response`, which shields the complexity brought by other serialization. Declare the serialization type inside the `wrapper` object to support serialization extensions.

The IDL of `protobuf` of wrapper is as follows:
```proto
syntax = "proto3";

package org.apache.dubbo.triple;

message TripleRequestWrapper {
    //hessian4
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

For requests, use `TripleRequestWrapper` for wrapping, and for responses, use `TripleResponseWrapper` for wrapping.

> For request parameters, you can see that args is modified by `repeated`, this is because multiple parameters of the java method need to be supported. Of course, serialization can only be one. The implementation of serialization follows the spi implemented by Dubbo2


## Multilingual users (using Protobuf)
> It is recommended that all new services use this method

For Dubbo3 and Triple, the main recommendation is to use `protobuf` serialization, and use `IDL` defined by `proto` to generate related interface definitions. Using `IDL` as a common interface convention in multiple languages, coupled with the natural interoperability of `Triple` and `Grpc`, can easily achieve cross-language interaction, such as Go language.


Use the `dubbo-compiler` plug-in to compile the prepared `.proto` file and write the implementation class to complete the method call:

![result](/imgs/v3/migration/tri/dubbo3-tri-migration-tri-tri-result.png)

From the upgrade example above, we can know that the `Triple` protocol uses `protbuf` objects to be serialized for transmission, so there is no other logic for methods that are themselves `protobuf` objects.

The interface after compiling with the `protobuf` plugin is as follows:
```java
public interface PbGreeter {

    static final String JAVA_SERVICE_NAME = "org.apache.dubbo.sample.tri.PbGreeter";
    static final String SERVICE_NAME = "org.apache.dubbo.sample.tri.PbGreeter";

    static final boolean inited = PbGreeterDubbo.init();

    org.apache.dubbo.sample.tri.GreeterReply greet(org.apache.dubbo.sample.tri.GreeterRequest request);

    default CompletableFuture<org.apache.dubbo.sample.tri.GreeterReply> greetAsync(org.apache.dubbo.sample.tri.GreeterRequest request){
        return CompletableFuture. supplyAsync(() -> greet(request));
    }

    void greetServerStream(org.apache.dubbo.sample.tri.GreeterRequest request, org.apache.dubbo.common.stream.StreamObserver<org.apache.dubbo.sample.tri.GreeterReply> responseObserver);

    org.apache.dubbo.common.stream.StreamObserver<org.apache.dubbo.sample.tri.GreeterRequest> greetStream(org.apache.dubbo.common.stream.StreamObserver<org.apache.dubbo.sample.tri.GreeterReply> responseObserver);
}
```

## Open the new feature of Triple - Stream (stream)
Stream is a new call type provided by Dubbo3. It is recommended to use stream in the following scenarios:

- The interface needs to send a large amount of data. These data cannot be placed in an RPC request or response, and need to be sent in batches. However, if the application layer cannot solve the order and performance problems in the traditional multiple RPC method, if the order needs to be guaranteed , it can only be sent serially
- In streaming scenarios, data needs to be processed in the order they are sent, and the data itself has no definite boundary
- In push scenarios, multiple messages are sent and processed in the context of the same call

Stream is divided into the following three types:
- SERVER_STREAM (server stream)
  ![SERVER_STREAM](/imgs/v3/migration/tri/migrate-server-stream.png)
- CLIENT_STREAM (client stream)
  ![CLIENT_STREAM](/imgs/v3/migration/tri/migrate-client-stream.png)
- BIDIRECTIONAL_STREAM (bidirectional stream)
  ![BIDIRECTIONAL_STREAM](/imgs/v3/migration/tri/migrate-bi-stream.png)

> Due to the limitations of the `java` language, the implementation of BIDIRECTIONAL_STREAM and CLIENT_STREAM is the same.

In Dubbo3, the stream interface is declared and used as `SteamObserver`, and users can use and implement this interface to send and handle stream data, exceptions, and end.

> For Dubbo2 users, they may be unfamiliar with StreamObserver, which is a stream type defined by Dubbo3. There is no Stream type in Dubbo2, so it has no impact on migration scenarios.

Stream Semantic Guarantees
- Provide message boundaries, which can easily process messages separately
- Strictly ordered, the order of the sender is consistent with the order of the receiver
- Full duplex, no need to wait for sending
- Support cancellation and timeout

### Non-PB serialized stream
1. api
```java
public interface IWrapperGreeter {

    StreamObserver<String> sayHelloStream(StreamObserver<String> response);

    void sayHelloServerStream(String request, StreamObserver<String> response);
}
```

> The method input parameters and return values of the Stream method are strictly agreed. In order to prevent problems caused by writing errors, the Dubbo3 framework side checks the parameters, and throws an exception if there is an error.
> For `BIDIRECTIONAL_STREAM`, it should be noted that `StreamObserver` in the parameter is the response stream, and `StreamObserver` in the return parameter is the request stream.

2. Implementation class
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
                throwable. printStackTrace();
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

3. Call method
```java
delegate.sayHelloServerStream("server stream", new StreamObserver<String>() {
    @Override
    public void onNext(String data) {
        System.out.println(data);
    }

    @Override
    public void onError(Throwable throwable) {
        throwable. printStackTrace();
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
        throwable. printStackTrace();
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

## Serialized stream using Protobuf

For the `Protobuf` serialization method, it is recommended to write `IDL` and use the `compiler` plugin to compile and generate. The generated code is roughly as follows:
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

### Implementation principle of stream

How does the streaming mode of the `Triple` protocol support it?

- From the perspective of the protocol layer, `Triple` is built on the basis of `HTTP2`, so it directly has all the capabilities of `HTTP2`, so it has the ability to split `stream` and full-duplex.

- In terms of the framework layer, `StreamObserver` is provided to users as a stream interface to provide stream processing for input and output parameters. The framework makes corresponding interface calls when sending and receiving stream data, so as to ensure the integrity of the life cycle of the stream.

## Triple and application-level registration discovery

The application-level service registration and discovery of the Triple protocol is consistent with other languages, and you can learn more about it through the following content.

- [Service Discovery](/zh-cn/docs/concepts/service-discovery/)
- [Application-level address discovery migration guide](/zh-cn/docs/migration/migration-service-discovery/)

## Intercommunicate with GRPC

Through the introduction of the protocol, we know that the `Triple` protocol is based on `HTTP2` and compatible with `GRPC`. In order to ensure and verify the interoperability with `GRPC`, Dubbo3 has also written various tests in slave scenarios. For details, you can learn more through [here](https://github.com/apache/dubbo-samples/blob/master/3-extensions/protocol/dubbo-samples-triple/README.MD).

## Future: Everything on Stub

Students who have used `Grpc` should be familiar with `Stub`.
Grpc uses `compiler` to compile the written `proto` file into related protobuf objects and related rpc interfaces. By default several different `stubs` will be generated at the same time

-blockingStub
- futureStub
  -reactorStub
  -...

`stub` helps us shield the details of different calling methods in a unified way. However, currently `Dubbo3` only supports the traditional way of defining and calling interfaces.

In the near future, `Triple` will also implement various commonly used `Stub`, allowing users to write a `proto` file, which can be conveniently used in any scene through `comipler`, please wait and see.