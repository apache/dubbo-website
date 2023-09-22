---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/triple/pojo/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/triple/pojo/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/triple/wrap/
description: POJO 方式使用 Triple
linkTitle: POJO 方式使用 Triple
title: POJO 方式使用 Triple
type: docs
weight: 2
---

这篇教程演示了非 Protocol Buffers 模式下的 Triple 协议开发模式。这对于两种场景非常有用：
* **老版本基于 Java Interface 的应用，可以在不改变已有接口定义的情况下直接升级到 Triple 协议**
* **没有多语言编码诉求，想使用 Triple 协议但又想引入 IDL 复杂性的新应用**

### 前置条件
- [JDK](https://jdk.java.net/) 版本 >= 8
- 已安装 [Maven](https://maven.apache.org/)

## 运行示例
首先可通过以下命令下载示例源码
```shell
git clone https://github.com/apache/dubbo-samples.git
```

编译项目，由 IDL 生成代码
```shell
cd dubbo-samples/1-advanced/dubbo-samples-triple-no-idl/
mvn clean compile
```

### 启动 Server
运行以下命令启动 server。
```shell
mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.noidl.TriPojoServer"
```

### 访问服务
有两种方式可以访问 Triple 服务：
* 以标准 HTTP 工具访问
* 以 Dubbo client sdk 访问

#### cURL 访问
```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50052/org.apache.dubbo.samples.tri.noidl.api.PojoGreeter/greet/
```

#### Dubbo client 访问
```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.noidl.TriPojoClient"
```

## 示例讲解
可在此查看 [完整示例代码 dubbo-samples-triple-no-idl](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-triple-no-idl)。

### 项目依赖
由于依赖配置与普通 Dubbo 应用依赖完全一致，在此不再展开，感兴趣请直接点击上面链接查看源码。

### 服务定义
相比于 IDL 模式使用 Protocol Buffers 定义服务，我们直接定义 Java interface 和要传输的数据定义。

定义接口，包括 unary、streaming 模式
```java
public interface PojoGreeter {
    /**
     * unary
     */
    String greet(String request);
    /**
     * bi stream
     */
    StreamObserver<String> greetStream(StreamObserver<String> response);
    /**
     * server stream
     */
    void greetServerStream(String request, StreamObserver<String> response);
}
```

### 服务实现
直接实现以上 interface 并增加逻辑实现即可，请注意这里的 StreamObserver 等类都是由 Dubbo 框架提供，并不需要任何 gRPC 依赖。

```java
public class PojoGreeterImpl implements PojoGreeter {
    @Override
    public String greet(String request) {
        return "hello," + request;
    }

    @Override
    public StreamObserver<String> greetStream(StreamObserver<String> response) {
        return new StreamObserver<String>() {
            @Override
            public void onNext(String data) {
                LOGGER.info(data);
                response.onNext("hello," + data);
            }

            @Override
            public void onError(Throwable throwable) {
                throwable.printStackTrace();
            }

            @Override
            public void onCompleted() {
                LOGGER.info("onCompleted");
                response.onCompleted();
            }
        };
    }

    @Override
    public void greetServerStream(String request, StreamObserver<String> response) {
        for (int i = 0; i < 10; i++) {
            response.onNext("hello," + request);
        }
        response.onCompleted();
    }
}
```

注册服务到 server

```java
public class TriPojoServer {
    public static void main(String[] args) {
        ServiceConfig<PojoGreeter> service = new ServiceConfig<>();
        service.setInterface(PojoGreeter.class);
        service.setRef(new PojoGreeterImpl());

        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        bootstrap.application(new ApplicationConfig("tri-stub-server"))
                .registry(new RegistryConfig("N/A"))
                .protocol(new ProtocolConfig(CommonConstants.TRIPLE, TriSampleConstants.SERVER_PORT))
                .service(service)
                .start()
                .await();
    }
}
```

### 编写 client 逻辑

```java
public class TriPojoClient {
    public TriPojoClient() {
        ReferenceConfig<PojoGreeter> ref = new ReferenceConfig<>();
        ref.setInterface(PojoGreeter.class);
        ref.setTimeout(3000);
        ref.setProtocol(CommonConstants.TRIPLE);
        ref.setUrl("tri://localhost:" + TriSampleConstants.SERVER_PORT);

        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        bootstrap.application(new ApplicationConfig("tri-pojo-client"))
                .registry(new RegistryConfig("N/A"))
                .reference(ref)
                .start();
        this.delegate = ref.get();
    }

    public static void main(String[] args) throws IOException {
        final TriPojoClient consumer = new TriPojoClient();
        consumer.greetUnary();
        consumer.greetStream();
        consumer.greetServerStream();
        System.in.read();
    }

    public void greetUnary() {
        LOGGER.info("{} Start unary", clientName);
        String reply = delegate.greet("unary");
        LOGGER.info("{} Unary reply <-{}", clientName, reply);
    }

    public void greetServerStream() {
        LOGGER.info("{} Start server streaming", clientName);
        delegate.greetServerStream("server stream", new StdoutStreamObserver<>("greetServerStream"));
        LOGGER.info("{} Server stream done", clientName);
    }

    public void greetStream() {
        LOGGER.info("{} Start bi streaming", clientName);
        final StreamObserver<String> request = delegate.greetStream(new StdoutStreamObserver<>("greetStream"));
        for (int i = 0; i < 10; i++) {
            request.onNext("stream request");
        }
        request.onCompleted();
        LOGGER.info("{} Bi stream done", clientName);
    }
}
```