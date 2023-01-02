---
type: docs
title: "Streaming communication mode"
linkTitle: "Streaming communication mode"
weight: 3
description: ""
---

For specific use cases, please refer to: [dubbo-samples-triple/pojo](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java /org/apache/dubbo/sample/tri/pojo);

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

### Complete use case

1. Writing the Java interface
     ```java
     import org.apache.dubbo.common.stream.StreamObserver;
     import org.apache.dubbo.hello.HelloReply;
     import org.apache.dubbo.hello.HelloRequest;

     public interface IGreeter {
         /**
          * <pre>
          * Sends greeting by stream
          * </pre>
          */
         StreamObserver<HelloRequest> sayHello(StreamObserver<HelloReply> replyObserver);

     }
     ```

2. Write the implementation class
     ```java
     public class IStreamGreeterImpl implements IStreamGreeter {

         @Override
         public StreamObserver<HelloRequest> sayHello(StreamObserver<HelloReply> replyObserver) {

             return new StreamObserver<HelloRequest>() {
                 private List<HelloReply> replyList = new ArrayList<>();

                 @Override
                 public void onNext(HelloRequest helloRequest) {
                     System.out.println("onNext receive request name:" + helloRequest.getName());
                    replyList.add(HelloReply.newBuilder()
                        .setMessage("receive name:" + helloRequest.getName())
                        .build());
                }

                @Override
                public void onError(Throwable cause) {
                    System.out.println("onError");
                    replyObserver.onError(cause);
                }

                @Override
                public void onCompleted() {
                    System.out.println("onComplete receive request size:" + replyList.size());
                    for (HelloReply reply : replyList) {
                        replyObserver.onNext(reply);
                    }
                    replyObserver.onCompleted();
                }
            };
        }
    }
    ```
3. Create a Provider

    ```java
    public class StreamProvider {
        public static void main(String[] args) throws InterruptedException {
            ServiceConfig<IStreamGreeter> service = new ServiceConfig<>();
            service.setInterface(IStreamGreeter.class);
            service.setRef(new IStreamGreeterImpl());
            service.setProtocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051));
            service.setApplication(new ApplicationConfig("stream-provider"));
            service.setRegistry(new RegistryConfig("zookeeper://127.0.0.1:2181"));
            service. export();
            System.out.println("dubbo service started");
            new CountDownLatch(1). await();
        }
    }
    ```

4. Create Consumer

    ```java
    public class StreamConsumer {
        public static void main(String[] args) throws InterruptedException, IOException {
            ReferenceConfig<IStreamGreeter> ref = new ReferenceConfig<>();
            ref. setInterface(IStreamGreeter. class);
            ref. setCheck(false);
            ref.setProtocol(CommonConstants.TRIPLE);
            ref. setLazy(true);
            ref. setTimeout(100000);
            ref. setApplication(new ApplicationConfig("stream-consumer"));
            ref.setRegistry(new RegistryConfig("zookeeper://mse-6e9fda00-p.zk.mse.aliyuncs.com:2181"));
            final IStreamGreeter iStreamGreeter = ref. get();

            System.out.println("dubbo ref started");
            try {

                StreamObserver<HelloRequest> streamObserver = iStreamGreeter.sayHello(new StreamObserver<HelloReply>() {
                    @Override
                    public void onNext(HelloReply reply) {
                        System.out.println("onNext");
                        System.out.println(reply.getMessage());
                    }

                    @Override
                    public void onError(Throwable throwable) {
                        System.out.println("onError:" + throwable.getMessage());
                    }

                    @Override
                    public void onCompleted() {
                        System.out.println("onCompleted");
                    }
                });

                streamObserver.onNext(HelloRequest.newBuilder()
                    .setName("tony")
                    .build());

                streamObserver.onNext(HelloRequest.newBuilder()
                    .setName("nick")
                    .build());

                streamObserver.onCompleted();
            } catch (Throwable t) {
                t. printStackTrace();
            }
            System.in.read();
        }
    }
    ```

5. Run Provider and Consumer, you can see that the request returns normally
   > onNext\
   > receive name:tony\
   > onNext\
   > receive name:nick\
   > onCompleted

### common problem

1. protobuf class not found

Since the bottom layer of the Triple protocol needs to rely on the protobuf protocol for transmission, even if the defined service interface does not use protobuf, it is necessary to introduce protobuf dependencies into the environment.

```xml
         <dependency>
    <groupId>com.google.protobuf</groupId>
    <artifactId>protobuf-java</artifactId>
    <version>3.19.4</version>
</dependency>
```