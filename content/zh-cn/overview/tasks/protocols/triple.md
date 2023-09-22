---
description: "使用 Dubbo 开发 Triple 协议通信服务"
linkTitle: 使用IDL开发Triple服务
title: 使用 Dubbo 开发 Triple 协议通信服务
type: docs
weight: 1
---

本示例演示如何使用 Protocol Buffers 定义服务，并将其发布为对外可调用的 Triple 协议服务。示例采用 Java 语言编写，其他语言的 Triple 协议方式请参考快速开始部分，更多详细说明可参考多语言sdk。

* 考虑到对过往版本的兼容性，Dubbo 当前的各个发行版本均默认使用 `dubbo` 通信协议（基于 TCP 的高性能私有协议），老用户请参考文档了解[如何实现协议的平滑迁移](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/triple/migration)。对于没有特殊诉求的新用户，建议在一开始就通过配置开启 `triple` 协议。
* 更多 Triple 协议使用请参见
  * [流式通信 Streaming RPCs](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/triple/streaming)
  * [实现与标准 gRPC 协议互调](../grpc)
  * [基于 Java Interface 的开发模式(无 IDL 模式)](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/triple/pojo)
  * [如何在其他语言和浏览器上使用 Triple 协议](/zh-cn/overview/quickstart/rpc)


## 运行示例
可在此查看[本示例的完整代码](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-triple-unary)。

首先可通过以下命令下载示例源码
```shell
git clone https://github.com/apache/dubbo-samples.git
```

编译项目，由 IDL 生成代码
```shell
cd dubbo-samples/1-basic/dubbo-samples-triple-unary
mvn clean compile
```

### 启动 Server
运行以下命令启动 server。
```shell
mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.unary.TriUnaryServer"
```

### 访问服务
有两种方式可以访问 Triple 服务：
* 以标准 HTTP 工具访问
* 以 Dubbo client sdk 访问

#### cURL 访问

```shell
curl \
    --header "Content-Type: application/json" \
    --data '[{"name": "Dubbo"}]' \
    http://localhost:50052/org.apache.dubbo.samples.tri.unary.Greeter/greet/
```

#### Dubbo client 访问
运行以下命令，启动 Dubbo client 并完成服务调用
```shell
mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.unary.TriUnaryClient"
```

## 示例讲解
可在此查看 [完整示例代码](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-triple-unary)。

### 项目依赖
由于使用 IDL 开发模式，因此要添加 dubbo、protobuf-java 等依赖，同时还要配置 protobuf-maven-plugin 等插件，用于生成桩代码。

```xml
<project>
    <dependencies>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo</artifactId>
            <version>${dubbo.version}</version>
        </dependency>
        <dependency>
            <groupId>com.google.protobuf</groupId>
            <artifactId>protobuf-java</artifactId>
            <version>3.19.6</version>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-dependencies-zookeeper-curator5</artifactId>
            <version>${dubbo.version}</version>
            <type>pom</type>
        </dependency>
    </dependencies>

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
                    <protocPlugins>
                        <protocPlugin>
                            <id>dubbo</id>
                            <groupId>org.apache.dubbo</groupId>
                            <artifactId>dubbo-compiler</artifactId>
                            <version>${dubbo.version}</version>
                            <mainClass>org.apache.dubbo.gen.tri.Dubbo3TripleGenerator</mainClass>
                        </protocPlugin>
                    </protocPlugins>
                </configuration>
                <executions>
                    <execution>
                        <goals>
                            <goal>compile</goal>
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
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>build-helper-maven-plugin</artifactId>
                <version>3.3.0</version>
                <executions>
                    <execution>
                        <phase>generate-sources</phase>
                        <goals>
                            <goal>add-source</goal>
                        </goals>
                        <configuration>
                            <sources>
                                <source>target/generated-sources/protobuf/java</source>
                            </sources>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

### 服务定义
使用 Protocol Buffers 定义服务

```protobuf
syntax = "proto3";

option java_multiple_files = true;

package org.apache.dubbo.samples.tri.unary;

message GreeterRequest {
  string name = 1;
}

message GreeterReply {
  string message = 1;
}

service Greeter{
  rpc greet(GreeterRequest) returns (GreeterReply);
}
```

### 代码生成
执行 `mvn clean compile` 后，生成代码如下

```text
└── org
    └── apache
        └── dubbo
            └── samples
                └── tri
                    └── unary
                        ├── DubboGreeterTriple.java
                        ├── Greeter.java
                        ├── GreeterOuterClass.java
                        ├── GreeterReply.java
                        ├── GreeterReplyOrBuilder.java
                        ├── GreeterRequest.java
                        └── GreeterRequestOrBuilder.java
```

### 服务实现
继承生成的基础类 `DubboGreeterTriple.GreeterImplBase`，以下具体的业务逻辑实现。

```java
public class GreeterImpl extends DubboGreeterTriple.GreeterImplBase {
    @Override
    public GreeterReply greet(GreeterRequest request) {
        LOGGER.info("Server {} received greet request {}", serverName, request);
        return GreeterReply.newBuilder()
                .setMessage("hello," + request.getName())
                .build();
    }
}
```

注册服务到 server，其中 protocol 设置为 tri 代表开启 triple 协议。

```java
public class TriUnaryServer {
    public static void main(String[] args) throws IOException {
        new EmbeddedZooKeeper(TriSampleConstants.ZK_PORT, false).start();
        ServiceConfig<Greeter> service = new ServiceConfig<>();
        service.setInterface(Greeter.class);
        service.setRef(new GreeterImpl("tri-stub"));
        ApplicationConfig applicationConfig = new ApplicationConfig("tri-stub-server");
        applicationConfig.setQosEnable(false);
        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        bootstrap.application(applicationConfig)
                .registry(new RegistryConfig(TriSampleConstants.ZK_ADDRESS))
                .protocol(new ProtocolConfig(CommonConstants.TRIPLE, TriSampleConstants.SERVER_PORT))
                .service(service)
                .start();
        System.out.println("Dubbo triple unary server started, port=" + TriSampleConstants.SERVER_PORT);
    }
}
```

### 编写 client 逻辑
```java
public class TriUnaryClient {
    private static final Logger LOGGER = LoggerFactory.getLogger(TriUnaryClient.class);

    public static void main(String[] args) throws IOException {
        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        ReferenceConfig<Greeter> ref = new ReferenceConfig<>();
        ref.setInterface(Greeter.class);
        ref.setProtocol(CommonConstants.TRIPLE);
        ref.setProxy(CommonConstants.NATIVE_STUB);
        ref.setTimeout(3000);

        ApplicationConfig applicationConfig = new ApplicationConfig("tri-stub-consumer");
        applicationConfig.setQosEnable(false);
        bootstrap.application(applicationConfig).reference(ref).registry(new RegistryConfig(TriSampleConstants.ZK_ADDRESS)).start();
        Greeter greeter = ref.get();

        //sync
        unarySync(greeter);
    }

    private static void unarySync(Greeter greeter) {
        LOGGER.info("{} Start unary", "tri-unary-client");
        final GreeterReply reply = greeter.greet(GreeterRequest.newBuilder().setName("name").build());
        LOGGER.info("{} Unary reply <-{}", "tri-unary-client", reply);
    }
}
```



