---
description: "使用 Dubbo 开发 Triple 协议通信服务"
linkTitle: Protobuf(IDL)方式
title: 使用 Protobuf(IDL) 开发 triple 通信服务
type: docs
weight: 2
---

本示例演示如何使用 Protocol Buffers 定义服务，并将其发布为对外可调用的 triple 协议服务。如果你有多语言业务互调、gRPC互通，或者熟悉并喜欢 Protobuf 的开发方式，则可以使用这种模式，否则可以考虑下一篇基于Java接口的 triple 开发模式。

可在此查看 [本示例的完整代码](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api-idl)。

{{% alert title="注意" color="info" %}}
本文使用的示例是基于原生 API 编码的，这里还有一个 [Spring Boot 版本的示例]() 供参考，同样是 `protobuf+triple` 的模式，但额外加入了服务发现配置。
{{% /alert %}}

## 运行示例

首先，可通过以下命令下载示例源码：
```shell
git clone --depth=1 https://github.com/apache/dubbo-samples.git
```

进入示例源码目录：
```shell
cd dubbo-samples/1-basic/dubbo-samples-api-idl
```

编译项目，由 IDL 生成代码，这会调用 dubbo 提供的 protoc 插件生成对应的服务定义代码：
```shell
mvn clean compile
```

生成代码如下

```text
├── build
│   └── generated
│       └── source
│           └── proto
│               └── main
│                   └── java
│                       └── org
│                           └── apache
│                               └── dubbo
│                                   └── samples
│                                       └── tri
│                                           └── unary
│                                               ├── DubboGreeterTriple.java
│                                               ├── Greeter.java
│                                               ├── GreeterOuterClass.java
│                                               ├── GreeterReply.java
│                                               ├── GreeterReplyOrBuilder.java
│                                               ├── GreeterRequest.java
│                                               └── GreeterRequestOrBuilder.java
```

### 启动Server
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

## 源码讲解

### 项目依赖
由于使用 IDL 开发模式，因此要添加 dubbo、protobuf-java 等依赖，同时还要配置 protobuf-maven-plugin 等插件，用于生成桩代码。

```xml
<dependency>
	<groupId>org.apache.dubbo</groupId>
	<artifactId>dubbo</artifactId>
	<version>3.3.0-beta.1</version>
</dependency>
<dependency>
	<groupId>com.google.protobuf</groupId>
	<artifactId>protobuf-java</artifactId>
	<version>3.19.6</version>
</dependency>
<dependency>
	<groupId>com.google.protobuf</groupId>
	<artifactId>protobuf-java-util</artifactId>
	<version>3.19.6</version>
</dependency>
```

```xml
<plugin>
	<groupId>org.xolstice.maven.plugins</groupId>
	<artifactId>protobuf-maven-plugin</artifactId>
	<version>0.6.1</version>
	<configuration>
		<protocArtifact>com.google.protobuf:protoc:${protoc.version}:exe:${os.detected.classifier}</protocArtifact>
		<outputDirectory>build/generated/source/proto/main/java</outputDirectory>
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
```

### 服务定义
使用 Protocol Buffers 定义 Greeter 服务

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

### 服务实现
在运行 `mvn clean compile` 后可生成 Dubbo 桩代码。接下来继承生成的基础类 `DubboGreeterTriple.GreeterImplBase`，添加具体的业务逻辑实现：

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
        ServiceConfig<Greeter> service = new ServiceConfig<>();
        service.setInterface(Greeter.class);
        service.setRef(new GreeterImpl());

        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        bootstrap.protocol(new ProtocolConfig(CommonConstants.TRIPLE, 50052))
                .service(service)
                .start().await();
    }
}
```

### 编写 client 逻辑
```java
public class TriUnaryClient {
    public static void main(String[] args) throws IOException {
        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        ReferenceConfig<Greeter> ref = new ReferenceConfig<>();
        ref.setInterface(Greeter.class);
        ref.setUrl("tri://localhost:50052");

        bootstrap.reference(ref).start();
        Greeter greeter = ref.get();
		final GreeterReply reply = greeter.greet(GreeterRequest.newBuilder().setName("name").build());
    }
}
```

## 常见问题

### protobuf 类找不到

由于 Triple 协议底层需要依赖 protobuf 协议进行传输，即使定义的服务接口不使用 protobuf 也需要在环境中引入 protobuf 的依赖。

```xml
<dependency>
	<groupId>com.google.protobuf</groupId>
	<artifactId>protobuf-java</artifactId>
	<version>3.19.4</version>
</dependency>
```

同时，为了支持 `application/json` 格式请求直接访问，还需要增加如下依赖。
```xml
<dependency>
	<groupId>com.google.protobuf</groupId>
	<artifactId>protobuf-java-util</artifactId>
	<version>3.19.4</version>
</dependency>
```
