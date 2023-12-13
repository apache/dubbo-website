---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/reactive/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/reactive/
description: 使用 Reactive API 操作 Triple 流式调用
linkTitle: 响应式编程
title: 响应式编程
type: docs
weight: 1
---






## 特性说明

此特性基于 Triple 协议和 Project Reactor 实现，`3.1.0` 版本以上支持。用户仅需编写 IDL 文件，并指定 protobuf 插件的相应 Generator，即可生成并使用支持响应式API的 Stub 代码。

有四种调用模式，分别是 OneToOne、OneToMany、ManyToOne、ManyToMany，分别对应 Unary调用、服务端流、客户端流、双向流。在 Reactor 的实现中，One 对应 Mono，Many 对应 Flux。



Reactive Stream 提供了一套标准的异步流处理 API， 在能够让应用写出事件驱动的程序的同时，也通过 BackPressure 的方式保证了节点的稳定。Triple 协议在通信协议层面为 Dubbo 框架增加了流式场景的支持，在此基础上能够实现上层包括大文件传输和推送机制的业务需求。

Dubbo + Reactive Stream Stub 的组合模式可以给用户带来最方便的流式使用方式以及全链路异步性能提升。

> 参考用例
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple-reactor](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple-reactor)

## 使用场景

系统需要处理大量并发请求而不会使任何服务器过载。大量用户提供实时数据的系统，希望确保系统能够处理负载而不会崩溃或变慢。

## 使用方式

Triple 使用及配置可参考 [IDL 方式使用 Triple](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/triple/idl/)，并确保 Dubbo 版本 >= 3.1.0。

### 添加必要的依赖

若要使用 Reactor Triple，需要额外添加如下依赖。

```xml
<dependency>
    <groupId>org.reactivestreams</groupId>
    <artifactId>reactive-streams</artifactId>
</dependency>
<dependency>
    <groupId>io.projectreactor</groupId>
    <artifactId>reactor-core</artifactId>
</dependency>
```

### 设置 protobuf Maven 插件

仅需将 mainClass 修改为 `org.apache.dubbo.gen.tri.reactive.ReactorDubbo3TripleGenerator`，并确保 `${compiler.version}` >= 3.1.0

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.xolstice.maven.plugins</groupId>
            <artifactId>protobuf-maven-plugin</artifactId>
            <version>0.6.1</version>
            <configuration>
                <protocArtifact>com.google.protobuf:protoc:${protoc.version}:exe:${os.detected.classifier}
                </protocArtifact>
                <pluginId>grpc-java</pluginId>
                <pluginArtifact>io.grpc:protoc-gen-grpc-java:${grpc.version}:exe:${os.detected.classifier}
                </pluginArtifact>
                <protocPlugins>
                    <protocPlugin>
                        <id>dubbo</id>
                        <groupId>org.apache.dubbo</groupId>
                        <artifactId>dubbo-compiler</artifactId>
                        <version>${compiler.version}</version>
                        <mainClass>org.apache.dubbo.gen.tri.reactive.ReactorDubbo3TripleGenerator</mainClass>
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
    </plugins>
</build>
```

### 编写并编译 IDL 文件

IDL 文件编写与原生的 Triple 协议完全一致，编译后默认会在 `target/generated-sources/protobuf/java` 目录下看到相应代码。

```protobuf
syntax = "proto3";

option java_multiple_files = true;

package org.apache.dubbo.samples.triple.reactor;

// The request message containing the user's name.
message GreeterRequest {
  string name = 1;
}

// The response message containing the greetings
message GreeterReply {
  string message = 1;
}

service GreeterService {

  rpc greetOneToOne(GreeterRequest) returns (GreeterReply);

  rpc greetOneToMany(GreeterRequest) returns (stream GreeterReply);

  rpc greetManyToOne(stream GreeterRequest) returns (GreeterReply);

  rpc greetManyToMany(stream GreeterRequest) returns (stream GreeterReply);
}
```

### 使用示例

1. 添加服务端接口实现

```java
package org.apache.dubbo.samples.triple.reactor.impl;

import org.apache.dubbo.samples.triple.reactor.DubboGreeterServiceTriple;
import org.apache.dubbo.samples.triple.reactor.GreeterReply;
import org.apache.dubbo.samples.triple.reactor.GreeterRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Flux;

public class GreeterServiceImpl extends DubboGreeterServiceTriple.GreeterServiceImplBase {
    
    private static final Logger LOGGER = LoggerFactory.getLogger(GreeterServiceImpl.class);

    @Override
    public Flux<GreeterReply> greetManyToMany(Flux<GreeterRequest> request) {
        return request.doOnNext(req -> LOGGER.info("greetManyToMany get data: {}", req))
                .map(req -> GreeterReply.newBuilder().setMessage(req.getName() + " -> server get").build())
                .doOnNext(res -> LOGGER.info("greetManyToMany response data: {}", res));
    }
}
```

2. 添加服务端接口启动类

```java
package org.apache.dubbo.samples.triple.reactor;

import org.apache.dubbo.common.constants.CommonConstants;
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.ProtocolConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.ServiceConfig;
import org.apache.dubbo.config.bootstrap.DubboBootstrap;
import org.apache.dubbo.samples.triple.reactor.impl.GreeterServiceImpl;

public class ReactorServer {

    private static final int PORT = 50052;

    public static void main(String[] args) {
        ServiceConfig<GreeterService> reactorService = new ServiceConfig<>();
        reactorService.setInterface(GreeterService.class);
        reactorService.setRef(new GreeterServiceImpl());

        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        bootstrap.application(new ApplicationConfig("tri-reactor-stub-server"))
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
                .protocol(new ProtocolConfig(CommonConstants.TRIPLE, PORT))
                .service(reactorService)
                .start();
    }
}
```

3. 添加客户端启动类和消费程序

```java
package org.apache.dubbo.samples.triple.reactor;

import org.apache.dubbo.common.constants.CommonConstants;
import org.apache.dubbo.config.ApplicationConfig;
import org.apache.dubbo.config.ReferenceConfig;
import org.apache.dubbo.config.RegistryConfig;
import org.apache.dubbo.config.bootstrap.DubboBootstrap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.IOException;

public class ReactorConsumer {

    private static final Logger LOGGER = LoggerFactory.getLogger(ReactorConsumer.class);

    private final GreeterService greeterService;

    public ReactorConsumer() {
        ReferenceConfig<GreeterService> referenceConfig = new ReferenceConfig<>();
        referenceConfig.setInterface(GreeterService.class);
        referenceConfig.setProtocol(CommonConstants.TRIPLE);
        referenceConfig.setProxy(CommonConstants.NATIVE_STUB);
        referenceConfig.setTimeout(10000);

        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        bootstrap.application(new ApplicationConfig("tri-reactor-stub-server"))
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
                .reference(referenceConfig)
                .start();
        GreeterService greeterService = referenceConfig.get();
    }
    
    public static void main(String[] args) throws IOException {
        ReactorConsumer reactorConsumer = new ReactorConsumer();
        reactorConsumer.consumeManyToMany();
        System.in.read();
    }
    
    private void consumeManyToMany() {
        greeterService.greetManyToMany(Flux.range(1, 10)
                    .map(num ->
                        GreeterRequest.newBuilder().setName(String.valueOf(num)).build())
                    .doOnNext(req -> LOGGER.info("consumeManyToMany request data: {}", req)))
                .subscribe(res -> LOGGER.info("consumeManyToMany get response: {}", res));
    }
}
```

4. 启动服务端

5. 启动消费者端