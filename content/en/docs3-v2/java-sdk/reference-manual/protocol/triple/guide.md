---
type: docs
title: "Instructions for Use"
linkTitle: "Instructions for use"
weight: 2
---

The Triple protocol is the main protocol of Dubbo3, fully compatible with gRPC over HTTP/2, and has expanded load balancing and flow control related mechanisms at the protocol level. This document is intended to guide users to use the Triple protocol correctly.

Before starting, you need to decide the serialization method used by the service. If it is a new service, it is recommended to use protobuf as the default serialization, which will have better performance and cross-language effects. If the original service wants to upgrade the protocol, the Triple protocol already supports other serialization methods, such as Hessian / JSON, etc.



### Protobuf

1. Write the IDL file
    ```protobuf
    syntax = "proto3";

    option java_multiple_files = true;
    option java_package = "org.apache.dubbo.hello";
    option java_outer_classname = "HelloWorldProto";
    option objc_class_prefix = "HLW";

    package helloworld;

    // The request message containing the user's name.
    message HelloRequest {
      string name = 1;
    }

    // The response message containing the greetings
    message HelloReply {
      string message = 1;
    }
    ```

2. Add the extension and plugin for compiling protobuf (take maven as an example)
    ```xml
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
                        <protocArtifact>com.google.protobuf:protoc:3.7.1:exe:${os.detected.classifier}</protocArtifact>
                        <pluginId>triple-java</pluginId>
                        <outputDirectory>build/generated/source/proto/main/java</outputDirectory>
                    </configuration>
                    <executions>
                        <execution>
                            <goals>
                                <goal>compile</goal>
                                <goal>test-compile</goal>
                            </goals>
                        </execution>
                    </executions>
                </plugin>
            </plugins>
    ```

3. Build/compile to generate protobuf Message class
    ```shell
    $ mvn clean install
    ```

### Unary way

4. Writing the Java interface
    ```java
    import org.apache.dubbo.hello.HelloReply;
    import org.apache.dubbo.hello.HelloRequest;

    public interface IGreeter {
        /**
         * <pre>
         * Sends a greeting
         * </pre>
         */
        HelloReply sayHello(HelloRequest request);

    }
    ```

5. Create a Provider
    ```java
        public static void main(String[] args) throws InterruptedException {
            ServiceConfig<IGreeter> service = new ServiceConfig<>();
            service.setInterface(IGreeter.class);
            service.setRef(new IGreeter1Impl());
            // Here you need to show that the protocol used by the declaration is triple
            service.setProtocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051));
            service.setApplication(new ApplicationConfig("demo-provider"));
            service.setRegistry(new RegistryConfig("zookeeper://127.0.0.1:2181"));
            service. export();
            System.out.println("dubbo service started");
            new CountDownLatch(1). await();
        }

    ```


6. Create Consumer

    ```java
    public static void main(String[] args) throws IOException {
        ReferenceConfig<IGreeter> ref = new ReferenceConfig<>();
        ref. setInterface(IGreeter. class);
        ref. setCheck(false);
        ref.setProtocol(CommonConstants.TRIPLE);
        ref. setLazy(true);
        ref. setTimeout(100000);
        ref. setApplication(new ApplicationConfig("demo-consumer"));
        ref.setRegistry(new RegistryConfig("zookeeper://127.0.0.1:2181"));
        final IGreeter iGreeter = ref. get();

        System.out.println("dubbo ref started");
        try {
            final HelloReply reply = iGreeter.sayHello(HelloRequest.newBuilder()
                    .setName("name")
                    .build());
            TimeUnit. SECONDS. sleep(1);
            System.out.println("Reply:" + reply);
        } catch (Throwable t) {
            t. printStackTrace();
        }
        System.in.read();
    }
    ```

7. Run Provider and Consumer, you can see that the request returns normally
   > Reply: message: "name"

### stream mode

8. Writing Java Interfaces
    ```java
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

9. Write the implementation class
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

10. Create a Provider

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

11. Create Consumer

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

12. Run Provider and Consumer, you can see that the request returns normally
    > onNext\
    > receive name:tony\
    > onNext\
    > receive name:nick\
    > onCompleted

### Other serialization methods
Omit steps 1-3 above, and specify the protocol used by Provider and Consumer to complete the protocol upgrade.

### Example program
The sample program of this article can be found in [triple-samples](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple)