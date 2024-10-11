---
description: "Triple 协议支持使用 Protocol Buffers (Protobuf) 定义服务，对于因为多语言、gRPC、安全性等场景选型protobuf 的用户更友好。"
linkTitle: Protobuf(IDL)方式
title: 使用 Protobuf(IDL) 开发 triple 通信服务
type: docs
weight: 2
---

## 使用方式

### POM依赖

```xml
<plugin>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-maven-plugin</artifactId>
    <version>${dubbo.version}</version> <!-- 3.3.0及以上版本 -->
    <configuration>
        <outputDir>build/generated/source/proto/main/java</outputDir> <!-- 参考下文可配置参数 -->
    </configuration>
</plugin>
```
configuration可配置参数

|        参数         |  必填参数  |                            默认值                             |        说明        |         备注         |
|:-----------------:|:------:|:----------------------------------------------------------:|:----------------:|:------------------:|
|     outputDir     |   否    | ${project.build.directory}/generated-sources/protobuf/java |  生成的java文件存放目录   |                    |
|  protoSourceDir   |   否    |                 ${basedir}/src/main/proto                  |    proto文件目录     |                    |
|  protocArtifact   |   否    |     com.google.protobuf:protoc:3.25.0:exe:操作系统名:操作系统架构     |    proto编译器组件    |                    |
|   protocVersion   |   否    |                           3.25.0                           | protobuf-java的版本 |                    |
| dubboGenerateType |   否    |                            tri                             |      代码生成类型      | 可填tri或者tri_reactor |

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

请注意以上 package 定义 `package org.apache.dubbo.samples.tri.unary;`，在此示例中 package 定义的路径将同时作为 java 包名和服务名前缀。这意味着 rpc 服务的完整定义是：`org.apache.dubbo.samples.tri.unary.Greeter`，与生成代码的路径完全一致。

但保持一致并不是必须的，你也可以将 java 包名与服务名前缀定义分开定义，对于一些跨语言调用的场景比较有用处。如以下 IDL 定义中：
* 完整服务名是 `greet.Greeter`，rpc 调用及服务发现过程中会使用这个值
* java 包名则是 java_package 定义的 `org.apache.dubbo.samples.tri.unary`，生成的 java 代码会放在这个目录。

```protobuf
package greet;
option java_package = "org.apache.dubbo.samples.tri.unary;"
option go_package = "github.com/apache/dubbo-go-samples/helloworld/proto;greet";
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

### 生成的代码无法编译
在使用 Protobuf 时，请尽量保持 dubbo 核心库版本与 protoc 插件版本一致，并运行 `mvn clean compile` 重新生成代码。

**3.3.0 版本之前的POM依赖**

3.3.0 之前的版本使用 `protobuf-maven-plugin` 配置 protoc 插件，其中 `dubbo-compiler` 必须保持和使用的内核 dubbo 版本一致：

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

## 运行示例

本示例演示如何使用 Protocol Buffers 定义服务，并将其发布为对外可调用的 triple 协议服务。如果你有多语言业务互调、gRPC互通，或者熟悉并喜欢 Protobuf 的开发方式，则可以使用这种模式，否则可以考虑上一篇基于Java接口的 triple 开发模式。

可在此查看 [本示例的完整代码](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api-idl)。

{{% alert title="注意" color="info" %}}
本文使用的示例是基于原生 API 编码的，这里还有一个 [Spring Boot 版本的示例](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-spring-boot-idl) 供参考，同样是 `protobuf+triple` 的模式，但额外加入了服务发现配置。
{{% /alert %}}

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
    --data '{"name":"Dubbo"}' \
    http://localhost:50052/org.apache.dubbo.samples.tri.unary.Greeter/greet/
```

#### Dubbo client 访问
运行以下命令，启动 Dubbo client 并完成服务调用
```shell
mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.unary.TriUnaryClient"
```
