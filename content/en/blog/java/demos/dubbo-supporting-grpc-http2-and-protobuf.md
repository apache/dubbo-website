---
title: "Exploration of Apache Dubbo in Cross-Language and Protocol Penetration: Support for HTTP/2 gRPC and Protobuf"
linkTitle: "Support for HTTP/2 gRPC and Protobuf"
tags: ["Java"]
date: 2019-10-28
description: > 
    This article is compiled from Liu Jun's presentation on "Exploration of Dubbo in Multi-Language and Protocol Penetration" at the Dubbo Chengdu meetup.
---

The article can be broadly divided into three parts: an introduction to the basic product, Dubbo's support for gRPC (HTTP/2) and Protobuf, and example demonstrations. The introduction covers the basic concepts and characteristics of Dubbo, HTTP/2, gRPC, and Protobuf; the second part explains why Dubbo supports gRPC (HTTP/2) and Protobuf, as well as the benefits and differences this support brings to gRPC and Dubbo development; the third part demonstrates the usage of Dubbo gRPC and Dubbo Protobuf through two examples.

## Basic Introduction

### Dubbo Protocol

From a protocol perspective, here are the Dubbo protocols supported in version 2.7.

![image-20191029103919557](/imgs/blog/grpc/dubbo-ptotocol.png)

As we know, the Dubbo protocol is directly defined on top of the TCP transport layer protocol. The high reliability and full-duplex nature of TCP provide maximum flexibility for defining the Dubbo protocol. However, due to this flexibility, RPC protocols are generally custom private protocols, and Dubbo faces the same issue. Here, we focus on the areas where Dubbo's protocol generality can be improved. For a detailed analysis of the protocol, please refer to the [official blog](/en/blog/2018/10/05/dubbo-协议详解/).

* The body of the Dubbo protocol has an extendable attachments section, which allows for additional attributes to be passed beyond RPC methods and is a good design. However, a similar attachments section is lacking in the header part, which can be compared to the Ascii Header design defined by HTTP, dividing responsibilities between Body Attachments and Header Attachments.
* Some RPC request locators in the body protocol, such as Service Name, Method Name, Version, etc., can be moved to the header, decoupled from the specific serialization protocol, to be better identified by network infrastructure or used for traffic control.
* The extensibility is insufficient, lacking design for protocol upgrades, such as no reserved status bits in the header or special packets specifically designed for protocol upgrades or negotiations.
* In the Java version of the implementation, it is not concise and generic enough. For instance, during link transmission, there are some language bindings; redundant content exists in the message body, such as Service Name being present in both Body and Attachments.

### HTTP/1 

Compared to directly building a private RPC protocol on TPC transport layers, a remote call solution built on HTTP will have better generality, such as WebServices or REST architecture; using HTTP + JSON can be considered a de facto standard solution.

I believe there are two main advantages to building on HTTP:

1. The semantics and scalability of HTTP can well meet the requirements for RPC calls.
2. Generality; the HTTP protocol is supported by almost all devices on the network and has good protocol penetration.

![image-20191029113404906](/imgs/blog/grpc/http1.png)

Specifically, the advantages and limitations of HTTP/1 are:

* The typical Request – Response model, where only one waiting Request can exist on a link at a time.

* HTTP/1 supports Keep-Alive links, avoiding the overhead of repeatedly creating links.

* Human Readable Headers, using a more universal and human-readable header transmission format.

* No direct Server Push support; requires using Polling or Long-Polling as workarounds.


### HTTP/2

HTTP/2 retains all semantics of HTTP/1, while making significant improvements in communication models and transmission efficiency.

![image-20191029113416731](/imgs/blog/grpc/http2.png)

* Supports Multiplexing on a single link, achieving higher efficiency by utilizing frames as compared to the exclusive link of Request - Response.

* Request - Stream semantics, natively supports Server Push and Stream data transmission.

* Flow Control, granular flow control at the granularity of a single Stream and the entire link.

* Header compression HPACK.

* Binary Frame.

* Native TLS support.


### gRPC

As mentioned, both HTTP and TCP protocols have their respective advantages and disadvantages for building RPC protocols. Compared to Dubbo, which is built on the TPC transport layer, Google chose to define gRPC directly on top of the HTTP/2 protocol. For a [basic introduction](https://grpc.io/docs/what-is-grpc/introduction/) and [design vision](https://grpc.io/blog/principles/?spm=ata.13261165.0.0.2be55017XbUhs8) of gRPC, please refer to these two articles. Here I'll extract a few characteristics from the design vision that reflect the design goals of gRPC.

* Coverage & Simplicity, protocol design and framework implementation should be sufficiently general and simple, able to run on any device, including resource-constrained ones like IoT and Mobile.
* Interoperability & Reach, built upon a more general protocol, which can be supported by almost all infrastructure on the network.
* General Purpose & Performant, striking a balance between scenarios and performance, so the protocol itself should be suitable for various scenarios, while striving for high performance.
* Payload Agnostic, ensuring payloads transmitted by the protocol remain language and platform neutral.
* Streaming, supporting communication models like Request - Response, Request - Stream, Bi-Stream, etc.
* Flow Control, with capabilities for flow awareness and limiting within the protocol itself.
* Metadata Exchange, providing capabilities for additional data transmission beyond RPC service definitions.

In summary, guided by such design principles, gRPC is ultimately designed as a cross-language, cross-platform, general-purpose, high-performance RPC protocol and framework based on HTTP/2.

### Protobuf 

[Protocol Buffers (Protobuf)](https://developers.google.com/protocol-buffers/docs/overview) is a cross-platform, language-neutral structured data description and serialization product introduced by Google. It defines a set of protocols for structured data definitions while also providing the corresponding [Compiler](https://github.com/protocolbuffers/protobuf/releases/tag/v3.10.0) tools to convert language-neutral descriptions into specific language representations.

Some of its features include:

* Cross-language and cross-platform, providing a language-neutral data description format with out-of-the-box support for generating multiple languages' compiler tools.
* Security, as the scope of deserialization and output format are pre-generated by the compiler during compilation, bypassing issues like Java Deserialization Vulnerability.
* Binary, high-performance.
* Strong typing.
* Backward compatibility of field changes.

```idl
message Person {
  required string name = 1;
  required int32 id = 2;
  optional string email = 3;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    required string number = 1;
    optional PhoneType type = 2 [default = HOME];
  }

  repeated PhoneNumber phone = 4;
}
```

In addition to structured data descriptions, Protobuf also supports defining RPC services. It allows us to define a service description file in `.proto`, which can then utilize the Protobuf Compiler tool to generate interfaces and stubs for specific languages and RPC frameworks. The gRPC + Protobuf, Dubbo-gRPC + Protobuf, and Dubbo + Protobuf scenarios that will be discussed later are all implemented through customized Compiler classes.

 ```idl
service SearchService {
  rpc Search (SearchRequest) returns (SearchResponse);
}
 ```

## Dubbo's Support

Cross-language service development involves multiple aspects, requiring language neutrality in service definitions, RPC protocols, and serialization protocols, alongside corresponding SDK implementations for each language. While, thanks to community contributions, Dubbo has gradually made progress in multi-language SDK implementations, now offering clients or complete versions including Java, Go, PHP, C#, Python, NodeJs, C, etc., there still exist numerous areas for improvement in the aforementioned cross-language compatibility.

* Protocol, as analyzed above, the existing flaws in the Dubbo protocol could certainly be avoided if applications are designed on top of HTTP/2. This would certainly enhance the penetration of the protocol, avoiding the need for gateway or protocol conversion components, and benefiting traffic control on the link. Considering that gRPC is built on HTTP/2 and is the recommended communication protocol in the cloud-native field, Dubbo has opted to support the gRPC protocol directly as its current HTTP/2 solution during its first phase. We also recognize that the gRPC framework itself has usability issues and lacks service governance capabilities, which is why most vendors avoid using the gRPC framework directly. By integrating it within the Dubbo framework, users can conveniently utilize combinations of the Dubbo programming model + Dubbo service governance + gRPC protocol communication.

* Service definition, the current service definition in Dubbo is tied to specific programming languages, lacking a language-neutral service description format. For instance, in Java, it is defined through an Interface, while in other languages, it requires redefinition in a different format. Thus, Dubbo provides language-neutral service definition by supporting Protobuf.
* Serialization, the serialization formats currently supported by Dubbo include Json, Hessian2, Kryo, FST, Java, etc. Among these, only Json and Hessian2 support cross-language capability. Generally, Json has inherent performance issues, while Hessian2 has shortcomings regarding efficiency and multi-language SDK support. Therefore, Dubbo aims to deliver a more efficient and user-friendly cross-language serialization solution by supporting Protobuf serialization.

## Example

### Example 1: Developing gRPC Services using Dubbo

[gRPC](https://grpc.io/) is an open-source RPC communication protocol developed by Google, built on top of HTTP/2. Dubbo leverages its flexible protocol extension mechanism to add support for gRPC (HTTP/2).

Current support is limited to the Dubbo Java language version; future support for Go or other languages will be provided similarly. Below is a [simple example](https://github.com/apache/dubbo-samples/tree/925c3d150d9030bc72988564e4f97eca1f6fcb89/3-extensions/protocol/dubbo-samples-grpc) that demonstrates how to use gRPC protocol communication in Dubbo.

#### 1. Define Service IDL

First, define the service using the standard Protobuf protocol as follows:

```idl
syntax = "proto3";

option java_multiple_files = true;
option java_package = "io.grpc.examples.helloworld";
option java_outer_classname = "HelloWorldProto";
option objc_class_prefix = "HLW";

package helloworld;

// The greeting service definition.
service Greeter {
  // Sends a greeting
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```

Here, we define a Greeter service with only one method sayHello, along with its input and output parameters.

#### 2. Compiler Generates Stub

1. Define the Maven Protobuf Compiler plugin. Here we extended the Protobuf Compiler tool to generate Dubbo-specific RPC stubs, currently released as a Maven plugin.

```xml
<plugin>
  <groupId>org.xolstice.maven.plugins</groupId>
  <artifactId>protobuf-maven-plugin</artifactId>
  <version>0.5.1</version>
  <configuration>
    <protocArtifact>com.google.protobuf:protoc:3.7.1:exe:${os.detected.classifier}	
    </protocArtifact>
    <pluginId>dubbo-grpc-java</pluginId>
    <pluginArtifact>org.apache.dubbo:protoc-gen-dubbo-java:1.19.0-SNAPSHOT:exe:${os.detected.classifier}</pluginArtifact>
    <outputDirectory>build/generated/source/proto/main/java</outputDirectory>
    <clearOutputDirectory>false</clearOutputDirectory>
    <pluginParameter>grpc</pluginParameter>
  </configuration>
  <executions>
    <execution>
      <goals>
        <goal>compile</goal>
        <goal>compile-custom</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

Here,

pluginArtifact specifies the Dubbo customized version of the Java Protobuf Compiler plugin, which generates the Dubbo customized version of the gRPC stub during the compilation.

```xml
<pluginArtifact>org.apache.dubbo:protoc-gen-dubbo-java:1.19.0-SNAPSHOT:exe:${os.detected.classifier}</pluginArtifact>
```
Due to `protoc-gen-dubbo-java` supporting both gRPC and Dubbo protocols, the default generated stub type is gRPC. For usage concerning the Dubbo protocol, please refer to [Developing Dubbo Services using Protobuf](/en/overview/mannual/java-sdk/quick-start/).

```xml
<pluginParameter>grpc</pluginParameter>
```

2. Generate Java Bean and Dubbo-gRPC stub

   ```sh
   # Run the following maven command
   $ mvn clean compile
   ```

   The generated Stub and message classes are as follows:
   ![image-20191026130516896](/imgs/blog/grpc/compiler-classes.png)

   Pay special attention to GreeterGrpc, which contains all standard gRPC stub classes/methods while adding Dubbo-specific interfaces, which will be relied upon for service exposure on the Provider side and service calls on the Consumer side.

   ```java
   /**
    * Code generated for Dubbo
    */
   public interface IGreeter {
   
   default public io.grpc.examples.helloworld.HelloReply 	sayHello(io.grpc.examples.helloworld.HelloRequest request) {
      throw new UnsupportedOperationException("No need to override this method, extend XxxImplBase and override all methods it allows.");
   }
   
   default public com.google.common.util.concurrent.ListenableFuture<io.grpc.examples.helloworld.HelloReply> sayHelloAsync(
       io.grpc.examples.helloworld.HelloRequest request) {
      throw new UnsupportedOperationException("No need to override this method, extend XxxImplBase and override all methods it allows.");
   }
   
   public void sayHello(io.grpc.examples.helloworld.HelloRequest request,
       io.grpc.stub.StreamObserver<io.grpc.examples.helloworld.HelloReply> responseObserver);
   }
   ```

#### 3. Business Logic Development

Extend `GreeterGrpc.GreeterImplBase` (from Step 2) to implement business logic, which is consistent with native gRPC.

```java
package org.apache.dubbo.samples.basic.impl;

import io.grpc.examples.helloworld.GreeterGrpc;
import io.grpc.examples.helloworld.HelloReply;
import io.grpc.examples.helloworld.HelloRequest;
import io.grpc.stub.StreamObserver;

public class GrpcGreeterImpl extends GreeterGrpc.GreeterImplBase {
    @Override
    public void sayHello(HelloRequest request, StreamObserver<HelloReply> responseObserver) 		{
        System.out.println("Received request from client.");
        System.out.println("Executing thread is " + Thread.currentThread().getName());
        HelloReply reply = HelloReply.newBuilder()
          .setMessage("Hello " + request.getName()).build();
        responseObserver.onNext(reply);
        responseObserver.onCompleted();
    }
}
```

#### 4. Expose Dubbo Service on Provider Side

Using Spring XML as an example

```xml
<dubbo:application name="demo-provider"/>

<!-- Specify the service exposure protocol as gRPC -->
<dubbo:protocol id="grpc" name="grpc"/>

<dubbo:registry address="zookeeper://${zookeeper.address:127.0.0.1}:2181"/>

<bean id="greeter" class="org.apache.dubbo.samples.basic.impl.GrpcGreeterImpl"/>

<!-- Specify the interface generated by protoc-gen-dubbo-java -->
<dubbo:service interface="io.grpc.examples.helloworld.GreeterGrpc$IGreeter" ref="greeter" protocol="grpc"/>
```

```java
public static void main(String[] args) throws Exception {
  ClassPathXmlApplicationContext context =
    new ClassPathXmlApplicationContext("spring/dubbo-demo-provider.xml");
  context.start();

  System.out.println("dubbo service started");
  new CountDownLatch(1).await();
}
```

#### 5. Referencing Dubbo Service

```xml
<dubbo:application name="demo-consumer"/>

<dubbo:registry address="zookeeper://${zookeeper.address:127.0.0.1}:2181"/>

<!-- Specify the interface generated by protoc-gen-dubbo-java -->
<dubbo:reference id="greeter" interface="io.grpc.examples.helloworld.GreeterGrpc$IGreeter" protocol="grpc"/>
```

```java
public static void main(String[] args) throws IOException {
  ClassPathXmlApplicationContext context =
    new ClassPathXmlApplicationContext("spring/dubbo-demo-consumer.xml");
  context.start();

  GreeterGrpc.IGreeter greeter = (GreeterGrpc.IGreeter) context.getBean("greeter");

  HelloReply reply = greeter.sayHello(HelloRequest.newBuilder().setName("world!").build());
  System.out.println("Result: " + reply.getMessage());

  System.in.read();
}
```

#### Example 1 Appendix: Advanced Usage

**1. Asynchronous Calls**

Let’s review the `protoc-gen-dubbo-java` generated interface again:

```java
/**
 * Code generated for Dubbo
 */
public interface IGreeter {
  default public HelloReply sayHello(HelloRequest request) {
     // ......
  }
  default public ListenableFuture<HelloReply> sayHelloAsync(HelloRequest request) {
     // ......
  }
  public void sayHello(HelloRequest request, StreamObserver<HelloReply> responseObserver);
}
```

Here three types of overloaded methods are generated for sayHello, for synchronous call, asynchronous call, and streaming call. If the consumer wants to make an asynchronous call, just call sayHelloAsync():

```java
public static void main(String[] args) throws IOException {
	// ...
  GreeterGrpc.IGreeter greeter = (GreeterGrpc.IGreeter) context.getBean("greeter");
  ListenableFuture<HelloReply> future =   
        greeter.sayHelloAsync(HelloRequest.newBuilder().setName("world!").build());
  // ...
}
```

**2. Advanced Configuration**

Since the current implementation is directly integrated with gRPC-java SDK, many configurations have not yet been aligned with Dubbo's side, or haven't been exposed in the form of Dubbo configurations. Therefore, to provide the maximum flexibility, we directly expose the gRPC-java configuration interfaces.

In the vast majority of scenarios, you may not need the following extensions, as they are more about intercepting the gRPC protocol or configuring at the HTTP/2 layer. Using these extension points may require a basic understanding of HTTP/2 or gRPC.

**Extension Points**

Currently, the supported extension points are as follows:

* org.apache.dubbo.rpc.protocol.grpc.interceptors.ClientInterceptor

* org.apache.dubbo.rpc.protocol.grpc.interceptors.GrpcConfigurator

* org.apache.dubbo.rpc.protocol.grpc.interceptors.ServerInterceptor

* org.apache.dubbo.rpc.protocol.grpc.interceptors.ServerTransportFilter

GrpcConfigurator is the most general extension point, which we will illustrate as follows:

```java
public interface GrpcConfigurator {
    // Used to customize the gRPC NettyServerBuilder
    default NettyServerBuilder configureServerBuilder(NettyServerBuilder builder, URL url) {
        return builder;
    }
    // Used to customize the gRPC NettyChannelBuilder
    default NettyChannelBuilder configureChannelBuilder(NettyChannelBuilder builder, URL url) {
        return builder;
    }
    // Used to customize gRPC CallOptions, defining data transfer between requests of a service 
    default CallOptions configureCallOptions(CallOptions options, URL url) {
        return options;
    }
}
```

Here is an example extension implementation:

```java
public class MyGrpcConfigurator implements GrpcConfigurator {
    private final ExecutorService executor = Executors
            .newFixedThreadPool(200, new NamedThreadFactory("Customized-grpc", true));

    @Override
    public NettyServerBuilder configureServerBuilder(NettyServerBuilder builder, URL url) {
        return builder.executor(executor);
    }

    @Override
    public NettyChannelBuilder configureChannelBuilder(NettyChannelBuilder builder, URL url)
    {
        return builder.flowControlWindow(10);
    }

    @Override
    public CallOptions configureCallOptions(CallOptions options, URL url) {
        return options.withOption(CallOptions.Key.create("key"), "value");
    }
}
```

The configuration is defined in Dubbo SPI, with the configuration file added in `resources/META-INF/services`.

```properties
default=org.apache.dubbo.samples.basic.comtomize.MyGrpcConfigurator
```

1. Specify the thread pool on the Provider side

   The default uses Dubbo's thread pool, with types like fixed (default), cached, direct, etc. The example demonstrates switching to a custom business thread pool:

   ```java
   private final ExecutorService executor = Executors
         .newFixedThreadPool(200, new NamedThreadFactory("Customized-grpc", true));
   
   public NettyServerBuilder configureServerBuilder(NettyServerBuilder builder, URL url) 
   {
     return builder.executor(executor);
   }
   ```

2. Set Consumer side flow control value

   Set the Consumer flow control value to 10:

   ```java
   @Override
   public NettyChannelBuilder configureChannelBuilder(NettyChannelBuilder builder, URL url)
   {
     return builder.flowControlWindow(10);
   }
   ```

3. Pass additional parameters

   The DemoService service call passes the key:

   ```java
   @Override
   public CallOptions configureCallOptions(CallOptions options, URL url) {
     if (url.getServiceInterface().equals("xxx.DemoService")) {
       return options.withOption(CallOptions.Key.create("key"), "value");
     } else {
       return options;
     }
   }
   ```

**3. TLS Configuration**

The configuration method is consistent with Dubbo's general [TLS support](/en/overview/mannual/java-sdk/reference-manual/protocol/tls/). Please refer to the documentation.

### Example 2: Using Protobuf to Develop Dubbo Services

Next, let's look at a [specific example](https://github.com/apache/dubbo-samples/tree/master/3-extensions/serialization/dubbo-samples-protobuf) of the Dubbo service development process based on Protobuf.

#### 1. Define Service

Define the service via standard Protobuf

```idl
syntax = "proto3";

option java_multiple_files = true;
option java_package = "org.apache.dubbo.demo";
option java_outer_classname = "DemoServiceProto";
option objc_class_prefix = "DEMOSRV";

package demoservice;

// The demo service definition.
service DemoService {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

// The request message containing the user's name.
message HelloRequest {
  string name = 1;
}

// The response message containing the greetings
message HelloReply {
  string message = 1;
}
```

Here, we define a DemoService service that only includes a sayHello method, along with its input and output parameters.

#### 2. Compiler Compiles the Service

1. Introduce the Protobuf Compiler Maven plugin while specifying the `protoc-gen-dubbo-java` RPC extension.

```xml
<plugin>
  <groupId>org.xolstice.maven.plugins</groupId>
  <artifactId>protobuf-maven-plugin</artifactId>
  <version>0.5.1</version>
  <configuration>
    <protocArtifact>com.google.protobuf:protoc:3.7.1:exe:${os.detected.classifier}	
    </protocArtifact>
    <pluginId>dubbo-grpc-java</pluginId>
    <pluginArtifact>org.apache.dubbo:protoc-gen-dubbo-java:1.19.0-SNAPSHOT:exe:${os.detected.classifier}</pluginArtifact>
    <outputDirectory>build/generated/source/proto/main/java</outputDirectory>
    <clearOutputDirectory>false</clearOutputDirectory>
    <pluginParameter>dubbo</pluginParameter>
  </configuration>
  <executions>
    <execution>
      <goals>
        <goal>compile</goal>
        <goal>compile-custom</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

Note that the difference here from the [Dubbo's support for gRPC](https://github.com/apache/dubbo-samples/tree/925c3d150d9030bc72988564e4f97eca1f6fcb89/3-extensions/protocol/dubbo-samples-grpc) part is: 
`<pluginParameter>dubbo</pluginParameter>`

2. Generate Dubbo stub

   ```shell
   # Run the following maven command
   $mvn clean compile
   ```

   The generated Java classes are as follows:

   ![image-20191028201240976](/imgs/blog/grpc/compiler-protobuf.png)

   DemoServiceDubbo is the Dubbo customized stub.

   ```java
   public final class DemoServiceDubbo {
   
     private static final AtomicBoolean registered = new AtomicBoolean();
   
     private static Class<?> init() {
         Class<?> clazz = null;
         try {
             clazz = Class.forName(DemoServiceDubbo.class.getName());
             if (registered.compareAndSet(false, true)) {
                 org.apache.dubbo.common.serialize.protobuf.support.ProtobufUtils.marshaller(
                     org.apache.dubbo.demo.HelloRequest.getDefaultInstance());
                 org.apache.dubbo.common.serialize.protobuf.support.ProtobufUtils.marshaller(
                     org.apache.dubbo.demo.HelloReply.getDefaultInstance());
             }
          } catch (ClassNotFoundException e) {
             // ignore 
          }
          return clazz;
     }
   
     private DemoServiceDubbo() {}
   
     public static final String SERVICE_NAME = "demoservice.DemoService";
   
     /**
      * Code generated for Dubbo
      */
     public interface IDemoService {
   
        static Class<?> clazz = init();
        org.apache.dubbo.demo.HelloReply sayHello(org.apache.dubbo.demo.HelloRequest request);
   
        java.util.concurrent.CompletableFuture<org.apache.dubbo.demo.HelloReply> sayHelloAsync(
     org.apache.dubbo.demo.HelloRequest request);
   
    }
   
   }
   ```

   The `IDemoService` interface is most noteworthy as it serves as the foundational interface for defining Dubbo services.

#### 3. Implementing Business Logic

From this point forward, the development process is identical to directly defining a Java interface. Implement the interface to define the business logic.

```java
public class DemoServiceImpl implements DemoServiceDubbo.IDemoService {
    private static final Logger logger = LoggerFactory.getLogger(DemoServiceImpl.class);

    @Override
    public HelloReply sayHello(HelloRequest request) {
        logger.info("Hello " + request.getName() + ", request from consumer: " + RpcContext.getContext().getRemoteAddress());
        return HelloReply.newBuilder()
                .setMessage("Hello " + request.getName() + ", response from provider: "
                        + RpcContext.getContext().getLocalAddress())
                .build();
    }

    @Override
    public CompletableFuture<HelloReply> sayHelloAsync(HelloRequest request) {
        return CompletableFuture.completedFuture(sayHello(request));
    }
}
```

#### 4. Configuring Provider

Expose Dubbo service

```xml
<dubbo:application name="demo-provider"/>

<dubbo:registry address="zookeeper://127.0.0.1:2181"/>

<dubbo:protocol name="dubbo"/>

<bean id="demoService" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>

<dubbo:service interface="org.apache.dubbo.demo.DemoServiceDubbo$IDemoService" ref="demoService"/>
```

```java
public static void main(String[] args) throws Exception {
  ClassPathXmlApplicationContext context = 
    new ClassPathXmlApplicationContext("spring/dubbo-provider.xml");
  context.start();
  System.in.read();
}
```

#### 5. Configuring Consumer 

Reference Dubbo service

```xml
<dubbo:application name="demo-consumer"/>

<dubbo:registry address="zookeeper://127.0.0.1:2181"/>

<dubbo:reference id="demoService" check="false" interface="org.apache.dubbo.demo.DemoServiceDubbo$IDemoService"/>
```

```java
public static void main(String[] args) throws Exception {
  ClassPathXmlApplicationContext context = 
    new ClassPathXmlApplicationContext("spring/dubbo-consumer.xml");
  context.start();
  IDemoService demoService = context.getBean("demoService", IDemoService.class);
  HelloRequest request = HelloRequest.newBuilder().setName("Hello").build();
  HelloReply reply = demoService.sayHello(request);
  System.out.println("result: " + reply.getMessage());
  System.in.read();
}
```

