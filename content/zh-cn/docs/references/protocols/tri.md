---
aliases:
    - /zh/docs/references/protocols/tri/
description: Triple 协议使用
linkTitle: Triple 协议
title: Triple 协议
type: docs
weight: 12
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/triple/)。
{{% /pageinfo %}}

Triple 协议是 Dubbo3 的主力协议，完整兼容 gRPC over HTTP/2，并在协议层面扩展了负载均衡和流量控制相关机制。本文档旨在指导用户正确的使用 Triple 协议。

在开始前，需要决定服务使用的序列化方式，如果为新服务，推荐使用 protobuf 作为默认序列化，在性能和跨语言上的效果都会更好。如果是原有服务想进行协议升级，Triple 协议也已经支持其他序列化方式，如 Hessian / JSON 等



### Protobuf 

1. 编写 IDL 文件
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

2. 添加编译 protobuf 的 extension 和 plugin (以 maven 为例)
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

3. 构建/ 编译生成 protobuf Message 类
    ```shell
    $ mvn clean install
    ```

### Unary 方式

4.  编写 Java 接口
    ```java
    import org.apache.dubbo.hello.HelloReply;
    import org.apache.dubbo.hello.HelloRequest;

    public interface IGreeter {
        /**
         * <pre>
         *  Sends a greeting
         * </pre>
         */
        HelloReply sayHello(HelloRequest request);

    }
    ```

5. 创建 Provider 
    ```java
        public static void main(String[] args) throws InterruptedException {
            ServiceConfig<IGreeter> service = new ServiceConfig<>();
            service.setInterface(IGreeter.class);
            service.setRef(new IGreeter1Impl());
            // 这里需要显示声明使用的协议为triple 
            service.setProtocol(new ProtocolConfig(CommonConstants.TRIPLE, 50051));
            service.setApplication(new ApplicationConfig("demo-provider"));
            service.setRegistry(new RegistryConfig("zookeeper://127.0.0.1:2181"));
            service.export();
            System.out.println("dubbo service started");
            new CountDownLatch(1).await();
        }

    ```


6. 创建 Consumer

    ```java
    public static void main(String[] args) throws IOException {
        ReferenceConfig<IGreeter> ref = new ReferenceConfig<>();
        ref.setInterface(IGreeter.class);
        ref.setCheck(false);
        ref.setInterface(IGreeter.class);
        ref.setCheck(false);
        ref.setProtocol(CommonConstants.TRIPLE);
        ref.setLazy(true);
        ref.setTimeout(100000);
        ref.setApplication(new ApplicationConfig("demo-consumer"));
        ref.setRegistry(new RegistryConfig("zookeeper://127.0.0.1:2181"));
        final IGreeter iGreeter = ref.get();

        System.out.println("dubbo ref started");
        try {
            final HelloReply reply = iGreeter.sayHello(HelloRequest.newBuilder()
                    .setName("name")
                    .build());
            TimeUnit.SECONDS.sleep(1);
            System.out.println("Reply:" + reply);
        } catch (Throwable t) {
            t.printStackTrace();
        }
        System.in.read();
    }
    ```

7. 运行 Provider 和 Consumer ,可以看到请求正常返回了
    > Reply:message: "name"

### stream 方式

8.  编写 Java 接口
    ```java
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

9. 编写实现类
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

10. 创建 Provider

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

11. 创建 Consumer

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

12. 运行 Provider 和 Consumer ,可以看到请求正常返回了
    > onNext\
    > receive name:tony\
    > onNext\
    > receive name:nick\
    > onCompleted

### 其他序列化方式
省略上文中的 1-3 步，指定 Provider 和 Consumer 使用的协议即可完成协议升级。

### 示例程序
本文的示例程序可以在 [triple-samples](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple) 找到
