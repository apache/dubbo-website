---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/triple/streaming/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/triple/streaming/
description: ""
linkTitle: Streaming 通信模式
title: Streaming 通信模式
type: docs
weight: 3
---






具体用例可以参考：[dubbo-samples-triple/pojo](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/pojo);

## Stream (流)
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

> 由于 `java` 语言的限制，BIDIRECTIONAL_STREAM 和 CLIENT_STREAM 的实现是一样的。

在 Dubbo3 中，流式接口以 `SteamObserver` 声明和使用，用户可以通过使用和实现这个接口来发送和处理流的数据、异常和结束。

> 对于 Dubbo2 用户来说，可能会对StreamObserver感到陌生，这是Dubbo3定义的一种流类型，Dubbo2 中并不存在 Stream 的类型，所以对于迁移场景没有任何影响。

流的语义保证
- 提供消息边界，可以方便地对消息单独处理
- 严格有序，发送端的顺序和接收端顺序一致
- 全双工，发送不需要等待
- 支持取消和超时

## 非 PB 序列化的流
1. api
```java
public interface IWrapperGreeter {

    StreamObserver<String> sayHelloStream(StreamObserver<String> response);

    void sayHelloServerStream(String request, StreamObserver<String> response);
}
```

> Stream 方法的方法入参和返回值是严格约定的，为防止写错而导致问题，Dubbo3 框架侧做了对参数的检查, 如果出错则会抛出异常。
> 对于 `双向流(BIDIRECTIONAL_STREAM)`, 需要注意参数中的 `StreamObserver` 是响应流，返回参数中的 `StreamObserver` 为请求流。

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

## 使用 Protobuf 序列化的流

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

### 完整用例

1. 编写 Java 接口
    ```java
    import org.apache.dubbo.common.stream.StreamObserver;
    import org.apache.dubbo.hello.HelloReply;
    import org.apache.dubbo.hello.HelloRequest;

    public interface IGreeter {
        /**
         * <pre>
         *  Sends greeting by stream
         * </pre>
         */
        StreamObserver<HelloRequest> sayHello(StreamObserver<HelloReply> replyObserver);

    }
    ```

2. 编写实现类
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

3. 创建 Provider

   ```java
   public class StreamProvider {
       public static void main(String[] args) throws InterruptedException {
           ServiceConfig<IStreamGreeter> service = new ServiceConfig<>();
           service.setInterface(IStreamGreeter.class);
           service.setRef(new IStreamGreeterImpl());
           service.setProtocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051));
           service.setApplication(new ApplicationConfig("stream-provider"));
           service.setRegistry(new RegistryConfig("zookeeper://127.0.0.1:2181"));
           service.export();
           System.out.println("dubbo service started");
           new CountDownLatch(1).await();
       }
   }
   ```

4. 创建 Consumer

   ```java
   public class StreamConsumer {
       public static void main(String[] args) throws InterruptedException, IOException {
           ReferenceConfig<IStreamGreeter> ref = new ReferenceConfig<>();
           ref.setInterface(IStreamGreeter.class);
           ref.setCheck(false);
           ref.setProtocol(CommonConstants.TRIPLE);
           ref.setLazy(true);
           ref.setTimeout(100000);
           ref.setApplication(new ApplicationConfig("stream-consumer"));
           ref.setRegistry(new RegistryConfig("zookeeper://mse-6e9fda00-p.zk.mse.aliyuncs.com:2181"));
           final IStreamGreeter iStreamGreeter = ref.get();

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
               t.printStackTrace();
           }
           System.in.read();
       }
   }
   ```

5. 运行 Provider 和 Consumer ,可以看到请求正常返回了
    > onNext\
    > receive name:tony\
    > onNext\
    > receive name:nick\
    > onCompleted

### 常见问题

1. protobuf 类找不到

由于 Triple 协议底层需要依赖 protobuf 协议进行传输，即使定义的服务接口不使用 protobuf 也需要在环境中引入 protobuf 的依赖。

```xml
        <dependency>
            <groupId>com.google.protobuf</groupId>
            <artifactId>protobuf-java</artifactId>
            <version>3.19.4</version>
        </dependency>
```
