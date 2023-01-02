---
type: docs
title: "Streaming Communication"
linkTitle: "Streaming communication"
weight: 10
---
## Implementation principle of stream

Stream mode for the `Triple` protocol

- From the perspective of the protocol layer, `Triple` is built on the basis of `HTTP2`, so it directly has all the capabilities of `HTTP2`, so it has the ability to split `stream` and full-duplex.

- In terms of the framework layer, `StreamObserver` is provided to users as a stream interface to provide stream processing for input and output parameters. The framework makes corresponding interface calls when sending and receiving stream data, so as to ensure the integrity of the life cycle of the stream.

## Enable new features of Triple
### Stream stream
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

## Non-PB serialized stream
### APIs
```java
public interface IWrapperGreeter {

    StreamObserver<String> sayHelloStream(StreamObserver<String> response);

    void sayHelloServerStream(String request, StreamObserver<String> response);
}
```

> The method input parameters and return values of the Stream method are strictly agreed. In order to prevent problems caused by writing errors, the Dubbo3 framework side checks the parameters, and throws an exception if there is an error.
> For `BIDIRECTIONAL_STREAM`, it should be noted that `StreamObserver` in the parameter is the response stream, and `StreamObserver` in the return parameter is the request stream.
### Implementation class
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

### Call method
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