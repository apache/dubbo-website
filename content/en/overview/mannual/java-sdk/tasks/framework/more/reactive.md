---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/reactive/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/service/reactive/
description: Using the Reactive API for Triple Streaming Calls
linkTitle: Reactive Programming
title: Reactive Programming
type: docs
weight: 100
---

{{% alert title="Outdated Risk Reminder" color="warning" %}}
Please note that the Reactive usage methods described in this document may be outdated. Always refer to the latest reactive examples in apache/dubbo-samples for usage.
{{% /alert %}}

## Feature Description

This feature is based on the Triple protocol and implemented using Project Reactor, supported from version `3.1.0` onwards. Users only need to write an IDL file and specify the corresponding Generator for the protobuf plugin to generate and use Stub code that supports the reactive API.

There are four call modes: OneToOne, OneToMany, ManyToOne, and ManyToMany, corresponding to Unary calls, server streams, client streams, and bidirectional streams, respectively. In Reactor's implementation, One corresponds to Mono, and Many corresponds to Flux.

Reactive Streams provide a standard asynchronous stream processing API that allows applications to write event-driven programs while ensuring stability through BackPressure. The Triple protocol adds support for streaming scenarios in the Dubbo framework at the communication protocol level, enabling business needs such as large file transfers and push mechanisms.

The combination of Dubbo + Reactive Stream Stub offers the most convenient streaming usage and improved end-to-end asynchronous performance.

> Reference use case
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple-reactor](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple-reactor)

## Usage Scenarios

The system needs to handle large volumes of concurrent requests without overloading any server. Systems that provide real-time data to a large number of users need to ensure that they can handle the load without crashing or slowing down.

## Usage Method

For Triple usage and configuration, please refer to [Using Triple with IDL](/en/overview/mannual/java-sdk/reference-manual/protocol/triple/idl/), and ensure Dubbo version >= 3.1.0.

### Adding Necessary Dependencies

To use Reactor Triple, you need to add the following dependencies.

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

### Configuring Protobuf Maven Plugin

Simply change mainClass to `org.apache.dubbo.gen.tri.reactive.ReactorDubbo3TripleGenerator`, and ensure `${compiler.version}` >= 3.1.0

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

### Writing and Compiling IDL Files

The IDL file is written in exactly the same way as the native Triple protocol, and the corresponding code will be generated by default in the `target/generated-sources/protobuf/java` directory after compilation.

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

### Usage Example

1. Implement Server Interface

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

2. Add Server Interface Startup Class

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

3. Add Client Startup Class and Consumer Program

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

4. Start Server

5. Start Consumer

