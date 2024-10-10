---
description: "The Triple protocol supports defining services using Protocol Buffers (Protobuf), making it more user-friendly for those who choose Protobuf for various scenarios such as multi-language, gRPC, and security."
linkTitle: Protobuf (IDL) Method
title: Developing Triple Communication Services Using Protobuf (IDL)
type: docs
weight: 2
---

## Usage

### POM dependency
```xml
<plugin>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-maven-plugin</artifactId>
    <version>${dubbo.version}</version> <!-- Version 3.3.0 and above -->
    <configuration>
        <outputDir>build/generated/source/proto/main/java</outputDir> <!-- Refer to the following text for configurable parameters -->
    </configuration>
</plugin>
```
Configurable parameters

|     Parameter     |   Required    |                                           Default value                                           |                    Description                     |                 Notes                 |
|:-----------------:|:-------------:|:-------------------------------------------------------------------------------------------------:|:--------------------------------------------------:|:-------------------------------------:|
|     outputDir     |     false     |                    ${project.build.directory}/generated-sources/protobuf/java                     |       Generated java file storage directory        |                                       |
|  protoSourceDir   |     false     |                                     ${basedir}/src/main/proto                                     |                proto file directory                |                                       |
|  protocArtifact   |     false     |     com.google.protobuf:protoc:3.25.0:exe:Operating System Name:Operating System Architecture     |              proto compiler component              |                                       |
|   protocVersion   |     false     |                                              3.25.0                                               |              version of protobuf-java              |                                       |
| dubboGenerateType |     false     |                                                tri                                                |                Code generation type                | Can be filled with tri or tri_reactor |

### Service Definition
Define the Greeter service using Protocol Buffers.

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

Please note the package definition `package org.apache.dubbo.samples.tri.unary;`. In this example, the path defined in the package will also serve as the Java package name and service prefix. This means the complete definition of the rpc service is: `org.apache.dubbo.samples.tri.unary.Greeter`, which matches the path of the generated code exactly.

However, keeping consistency is not mandatory; you can define the Java package name separately from the service prefix, which is useful in some cross-language calling scenarios. For instance, in the following IDL definition:
* The complete service name is `greet.Greeter`, which will be used during rpc calls and service discovery.
* The Java package name is defined as `org.apache.dubbo.samples.tri.unary`, where the generated Java code will be placed.

```protobuf
package greet;
option java_package = "org.apache.dubbo.samples.tri.unary;"
option go_package = "github.com/apache/dubbo-go-samples/helloworld/proto;greet";
```

### Service Implementation
Running `mvn clean compile` will generate the Dubbo stub code. Next, extend the generated base class `DubboGreeterTriple.GreeterImplBase` and add specific business logic implementation:

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

Register the service to the server, where the protocol is set to tri to indicate that the Triple protocol is to be enabled.

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

### Write Client Logic
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
## Frequently Asked Questions

### Protobuf Class Not Found

Since the underlying Triple protocol depends on the protobuf protocol for transmission, even if the defined service interface does not use protobuf, the protobuf dependency must still be included in the environment.

```xml
<dependency>
	<groupId>com.google.protobuf</groupId>
	<artifactId>protobuf-java</artifactId>
	<version>3.19.4</version>
</dependency>
```

Additionally, to support direct access to `application/json` format requests, the following dependency needs to be added.
```xml
<dependency>
	<groupId>com.google.protobuf</groupId>
	<artifactId>protobuf-java-util</artifactId>
	<version>3.19.4</version>
</dependency>
```

### Generated Code Cannot Compile
When using Protobuf, ensure that the core Dubbo library version matches the protoc plugin version and run `mvn clean compile` to regenerate the code.

**Before version 3.3.0**

Versions before 3.3.0 use `protobuf-maven-plugin` to configure the protoc plugin, and the `dubbo-compiler` must match the core dubbo version used:

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
## Run the Example
This example demonstrates how to define a service using Protocol Buffers and publish it as an externally callable Triple protocol service. If you have multi-language interoperability, gRPC interaction, or are familiar with and prefer Protobuf development, you can use this approach; otherwise, consider the previous Java interface-based triple development model.

You can view the [full code for this example](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api-idl).

{{% alert title="Note" color="info" %}}
The example used in this article is based on native API coding; here is a [Spring Boot version of the example](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-spring-boot-idl) for reference, which also follows the `protobuf+triple` model but includes service discovery configuration.
{{% /alert %}}

First, download the example source code with the following command:
```shell
git clone --depth=1 https://github.com/apache/dubbo-samples.git
```

Change to the example source code directory:
```shell
cd dubbo-samples/1-basic/dubbo-samples-api-idl
```

Compile the project to generate code from the IDL, which calls the protoc plugin provided by Dubbo to generate the corresponding service definition code:
```shell
mvn clean compile
```

The generated code is as follows:

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

### Start Server
Run the following command to start the server.
```shell
mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.unary.TriUnaryServer"
```

### Access the Service
There are two ways to access the Triple service:
* Using standard HTTP tools
* Using Dubbo client SDK

#### cURL Access

```shell
curl \
    --header "Content-Type: application/json" \
    --data '{"name":"Dubbo"}' \
    http://localhost:50052/org.apache.dubbo.samples.tri.unary.Greeter/greet/
```

#### Dubbo Client Access
Run the following command to start the Dubbo client and complete the service call.
```shell
mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.unary.TriUnaryClient"
```
