---
type: docs
title: "Reactive Programming"
linkTitle: "Reactive Programming"
weight: 1
description: "Using the Reactive API to operate Triple streaming calls"
---

## Feature description

This feature is implemented based on the Triple protocol and Project Reactor, and is supported in versions above `3.1.0`. Users only need to write the IDL file and specify the corresponding Generator of the protobuf plug-in to generate and use the Stub code that supports the responsive API.

There are four call modes, namely OneToOne, OneToMany, ManyToOne, and ManyToMany, corresponding to Unary calls, server streams, client streams, and bidirectional streams. In the implementation of Reactor, One corresponds to Mono, and Many corresponds to Flux.

#### background

Reactive Stream provides a set of standard asynchronous stream processing APIs. While allowing applications to write event-driven programs, it also ensures node stability through BackPressure. The Triple protocol adds support for streaming scenarios to the Dubbo framework at the communication protocol level. On this basis, it can realize the business requirements of the upper layer including large file transmission and push mechanisms.

The combined mode of Dubbo + Reactive Stream Stub can bring users the most convenient way of streaming and improve the asynchronous performance of the whole link.

## Reference use case

[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple-reactor](https://github.com/apache/dubbo-samples/tree/master/3-extensions/ protocol/dubbo-samples-triple-reactor)

## scenes to be used

The system needs to handle a large number of concurrent requests without overloading any servers. Systems with large numbers of users providing real-time data and want to ensure that the system can handle the load without crashing or slowing down.

## How to use

For Triple usage and configuration, please refer to [Using Triple in IDL](/zh-cn/overview/mannual/java-sdk/reference-manual/protocol/triple/idl/), and ensure that the Dubbo version> = 3.1.0.

### Add the necessary dependencies

To use Reactor Triple, you need to add the following additional dependencies.

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

### Setup protobuf Maven plugin

Just change mainClass to `org.apache.dubbo.gen.tri.reactive.ReactorDubbo3TripleGenerator` and make sure `${compiler.version}` >= 3.1.0

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

### Write and compile the IDL file

The writing of the IDL file is completely consistent with the native Triple protocol, and the corresponding code will be seen in the `target/generated-sources/protobuf/java` directory by default after compilation.

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

### use

1. Add server interface implementation

```java
package org.apache.dubbo.samples.triple.reactor.impl;

import org.apache.dubbo.samples.triple.reactor.DubboGreeterServiceTriple;
import org.apache.dubbo.samples.triple.reactor.GreeterReply;
import org.apache.dubbo.samples.triple.reactor.GreeterRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Flux;

public class GreeterServiceImpl extends DubboGreeterServiceTriple.GreeterServiceImplBase {
    
    private static final Logger LOGGER = LoggerFactory. getLogger(GreeterServiceImpl. class);

    @Override
    public Flux<GreeterReply> greetManyToMany(Flux<GreeterRequest> request) {
        return request.doOnNext(req -> LOGGER.info("greetManyToMany get data: {}", req))
                .map(req -> GreeterReply. newBuilder(). setMessage(req. getName() + " -> server get"). build())
                .doOnNext(res -> LOGGER.info("greetManyToMany response data: {}", res));
    }
}
```

2. Add the server interface startup class

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

        DubboBootstrap bootstrap = DubboBootstrap. getInstance();
        bootstrap. application(new ApplicationConfig("tri-reactor-stub-server"))
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
                .protocol(new ProtocolConfig(CommonConstants.TRIPLE, PORT))
                .service(reactorService)
                .start();
    }
}
```

3. Add client startup class and consumer program

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

    private static final Logger LOGGER = LoggerFactory. getLogger(ReactorConsumer. class);

    private final GreeterService greeterService;

    public ReactorConsumer() {
        ReferenceConfig<GreeterService> referenceConfig = new ReferenceConfig<>();
        referenceConfig.setInterface(GreeterService.class);
        referenceConfig.setProtocol(CommonConstants.TRIPLE);
        referenceConfig.setProxy(CommonConstants.NATIVE_STUB);
        referenceConfig.setTimeout(10000);

        DubboBootstrap bootstrap = DubboBootstrap. getInstance();
        bootstrap. application(new ApplicationConfig("tri-reactor-stub-server"))
                .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
                .reference(referenceConfig)
                .start();
        GreeterService greeterService = referenceConfig. get();
    }
    
    public static void main(String[] args) throws IOException {
        ReactorConsumer reactorConsumer = new ReactorConsumer();
        reactorConsumer.consumeManyToMany();
        System.in.read();
    }
    
    private void consumeManyToMany() {
        greeterService. greetManyToMany(Flux. range(1, 10)
                    .map(num->
                        GreeterRequest.newBuilder().setName(String.valueOf(num)).build())
                    .doOnNext(req -> LOGGER.info("consumeManyToMany request data: {}", req)))
                .subscribe(res -> LOGGER.info("consumeManyToMany get response: {}", res));
    }
}
```

4. Start the server

5. Start the consumer
