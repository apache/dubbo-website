---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/protocol/triple/idl/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/protocol/triple/idl/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/triple/idl/
description: IDL 方式使用 Triple
linkTitle: IDL 方式使用 Triple
title: IDL 方式使用 Triple
type: docs
weight: 2
---


使用 IDL 定义服务具有更好的跨语言友好性，对于 Dubbo3 新用户而言，我们推荐使用这种方式。可在此查看[本示例的完整代码](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-triple-unary)。

然而 Triple 协议并不是和 IDL 强绑定的，也可以[使用 Java Interface + Pojo 的方式定义服务](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/pojo/)并启用 Triple 协议。

## 前置条件
- [JDK](https://jdk.java.net/) 版本 >= 8
- 已安装 [Maven](https://maven.apache.org/)

## 运行示例
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
