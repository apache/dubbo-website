---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/protocol/triple/streaming/
    - /en/docs3-v2/java-sdk/reference-manual/protocol/triple/streaming/
description: "Demonstrates basic usage of Streaming communication such as server streaming, bidirectional streaming, etc."
linkTitle: Streaming Communication
title: Streaming Communication
type: docs
weight: 4
---
In the section [Choosing RPC Communication Protocol](../../protocol/), it is mentioned that Streaming is a new RPC data transmission model provided by Dubbo3, suitable for the following scenarios:

- The interface needs to send a large amount of data that cannot be placed in a single RPC request or response and needs to be sent in batches. If the application layer cannot solve sequence and performance issues using traditional multiple RPC methods, it can only be sent serially to ensure order.
- In streaming scenarios, data needs to be processed in the order it is sent, and the data itself does not have fixed boundaries.
- In push scenarios, multiple messages are sent and processed within the same call context.

Streaming is divided into the following three types:
- SERVER_STREAM
- CLIENT_STREAM
- BIDIRECTIONAL_STREAM

The following example demonstrates the basic usage of triple streaming communication, covering client streams, server streams, bidirectional streams, etc. The example uses the service development model of Protocol Buffers; developers using the Java interface model can refer to the corresponding instructions at the end of this article. You can view [the complete code for this example](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-triple-streaming).

## Running the Example

First, download the example source code using the following command:
```shell
git clone --depth=1 https://github.com/apache/dubbo-samples.git
```

Navigate to the example source directory:
```shell
cd dubbo-samples/2-advanced/dubbo-samples-triple-streaming
```

Compile the project, generating code from IDL, which will call the protoc plugin provided by Dubbo to generate the corresponding service definition code:
```shell
mvn clean compile
```

### Start Server

Run the following command to start the server:
```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.streaming.TriStreamServer"
```

#### Start Client
Run the following command to start the client:

```shell
$ mvn compile exec:java -Dexec.mainClass="org.apache.dubbo.samples.tri.streaming.TriStreamClient"
```

## Source Code Interpretation
As mentioned in the section [Using Protobuf (IDL) to Develop Triple Protocol Services](../idl/), this example uses protobuf to define services, so the dependencies and configurations required by the example are basically the same; please refer to that section for complete details. Next, we will focus on the streaming communication part.

### Protobuf Service Definition

```protobuf
syntax = "proto3";
option java_multiple_files = true;
package org.apache.dubbo.samples.tri.streaming;

message GreeterRequest {
  string name = 1;
}
message GreeterReply {
  string message = 1;
}

service Greeter{
  rpc biStream(stream GreeterRequest) returns (stream GreeterReply);
  rpc serverStream(GreeterRequest) returns (stream GreeterReply);
}
```

In the above proto file, we define two methods:
* `biStream(stream GreeterRequest) returns (stream GreeterReply)` bidirectional stream
* `serverStream(GreeterRequest) returns (stream GreeterReply)` server stream

### Generate Code
Next, we need to generate Dubbo client and server interfaces from the .proto service definition. The protoc dubbo plugin can help us generate the required code, and when using Gradle or Maven, the protoc build plugin can generate necessary code as part of the build. Specific Maven configurations and code generation steps are described in [the previous section](/en/overview/mannual/java-sdk/tasks/protocols/triple/idl/).

In the target/generated-sources/protobuf/java/org/apache/dubbo/samples/tri/streaming/ directory, you can find the following generated code, where we will focus on `DubboGreeterTriple.java`:

```
├── DubboGreeterTriple.java
├── Greeter.java
├── GreeterOuterClass.java
├── GreeterReply.java
├── GreeterReplyOrBuilder.java
├── GreeterRequest.java
└── GreeterRequestOrBuilder.java
```

### Server
First, let's look at how to define the service implementation and start the provider:
1. Implement the service base class defined during the IDL code generation process, providing custom business logic.
2. Run the Dubbo service to listen for requests from clients and return service responses.

#### Provide Service Implementation `GreeterImplBase`
Define class `GreeterImpl` implementing `DubboGreeterTriple.GreeterImplBase`.

```java
public class GreeterImpl extends DubboGreeterTriple.GreeterImplBase {
   // ...
}
```
##### Server Stream

`GreeterImpl` implements all methods defined in the rpc. Next, we look at the specific definition of the server-side streaming.

Unlike ordinary method definitions, the `serverStream` method has two parameters; the first parameter `request` is the input parameter, and the second parameter `responseObserver` is the response value, which has a parameter type of `StreamObserver<GreeterReply>`. In the method implementation, we continuously call `responseObserver.onNext(...)` to send the result back to the consumer and finally call `onCompleted()` to indicate the end of the stream response.

```java
@Override
public void serverStream(GreeterRequest request, StreamObserver<GreeterReply> responseObserver) {
	LOGGER.info("receive request: {}", request.getName());
	for (int i = 0; i < 10; i++) {
		GreeterReply reply = GreeterReply.newBuilder().setMessage("reply from serverStream. " + i).build();
		responseObserver.onNext(reply);
	}
	responseObserver.onCompleted();
}
```

##### Bidirectional Stream
The parameters and return values of the bidirectional stream method `biStream` are both of type `StreamObserver<...>`. However, it should be noted that it is reversed from our traditional understanding of method definitions, where the parameter `StreamObserver<GreeterReply> responseObserver` is the response, and we continuously write back responses through `responseObserver`.

Note that the `request stream` and `response stream` are independent; during the process of writing back response stream data, a request stream may arrive at any time, and values are ordered for each stream.

```java
@Override
public StreamObserver<GreeterRequest> biStream(StreamObserver<GreeterReply> responseObserver) {
	return new StreamObserver<GreeterRequest>() {
		@Override
		public void onNext(GreeterRequest data) {
			GreeterReply resp = GreeterReply.newBuilder().setMessage("reply from biStream " + data.getName()).build();
			responseObserver.onNext(resp);
		}

		@Override
		public void onError(Throwable throwable) {

		}

		@Override
		public void onCompleted() {

		}
	};
}
```

#### Start Server
The process of starting a Dubbo service is entirely consistent with ordinary applications:

```java
public static void main(String[] args) throws IOException {
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
}
```

### Client
As with ordinary Dubbo service calls, we first need to declare the rpc service reference:

```java
public static void main(String[] args) throws IOException {
	ReferenceConfig<Greeter> ref = new ReferenceConfig<>();
	ref.setInterface(Greeter.class);
	ref.setProtocol(CommonConstants.TRIPLE);

	DubboBootstrap.getInstance().reference(ref).start();
	Greeter greeter = ref.get();
}
```

Next, we can use `greeter` to initiate calls as if calling local methods.

#### Server Stream
Call `serverStream()` passing a `SampleStreamObserver` object that can handle streaming responses. The call returns quickly after initiation, and thereafter streaming responses will continuously send to `SampleStreamObserver`.

```java
GreeterRequest request = GreeterRequest.newBuilder().setName("server stream request.").build();
greeter.serverStream(request, new SampleStreamObserver());
```

Below is the specific definition of the `SampleStreamObserver` class, including its specific handling logic after receiving the response.

```java
private static class SampleStreamObserver implements StreamObserver<GreeterReply> {
	@Override
	public void onNext(GreeterReply data) {
		LOGGER.info("stream <- reply:{}", data);
	}

	// ......
}
```

#### Bidirectional Stream
Calling the `greeter.biStream()` method will immediately return a `requestStreamObserver`, while you need to pass an observer object that can process the response `new SampleStreamObserver()` to the method.

Next, we can continue to send requests using the `requestStreamObserver` obtained from the return value by calling `requestStreamObserver.onNext(request)`; at this point, if there is a response returned, it will be processed by `SampleStreamObserver`, whose definition can be referred to above.

```java
StreamObserver<GreeterRequest> requestStreamObserver = greeter.biStream(new SampleStreamObserver());
for (int i = 0; i < 10; i++) {
	GreeterRequest request = GreeterRequest.newBuilder().setName("name-" + i).build();
	requestStreamObserver.onNext(request);
}
requestStreamObserver.onCompleted();
```

## Others
### Streaming Communication in Java Interface Mode
For users not using Protobuf, you can define streaming format methods directly in your interface to use streaming communication.

#### Interface Definition
```java
public interface WrapperGreeter {
    // Bidirectional stream
    StreamObserver<String> sayHelloStream(StreamObserver<String> response);
    // Server stream
    void sayHelloServerStream(String request, StreamObserver<String> response);
}
```

Among them, `org.apache.dubbo.common.stream.StreamObserver` is the parameter type for streaming communication provided by the Dubbo framework, and must be defined as demonstrated above.

> The method parameters and return values of streaming methods are strictly specified. To prevent issues from incorrect writing, the Dubbo3 framework performs parameter checks, throwing exceptions if errors occur.
> For `BIDIRECTIONAL_STREAM`, note that the `StreamObserver` in the parameters is the response stream, while the `StreamObserver` in the return parameter is the request stream.

#### Implementation Class
```java
public class WrapGreeterImpl implements WrapGreeter {

    //...

    @Override
    public StreamObserver<String> sayHelloStream(StreamObserver<String> response) {
        return new StreamObserver<String>() {
            @Override
            public void onNext(String data) {
                System.out.println(data);
                response.onNext("hello,"+data);
            }

            @Override
            public void onError(Throwable throwable) {
                throwable.printStackTrace();
            }

            @Override
            public void onCompleted() {
                System.out.println("onCompleted");
                response.onCompleted();
            }
        };
    }

    @Override
    public void sayHelloServerStream(String request, StreamObserver<String> response) {
        for (int i = 0; i < 10; i++) {
            response.onNext("hello," + request);
        }
        response.onCompleted();
    }
}
```

#### Calling Method
```java
delegate.sayHelloServerStream("server stream", new StreamObserver<String>() {
    @Override
    public void onNext(String data) {
        System.out.println(data);
    }

    @Override
    public void onError(Throwable throwable) {
        throwable.printStackTrace();
    }

    @Override
    public void onCompleted() {
        System.out.println("onCompleted");
    }
});


StreamObserver<String> request = delegate.sayHelloStream(new StreamObserver<String>() {
    @Override
    public void onNext(String data) {
        System.out.println(data);
    }

    @Override
    public void onError(Throwable throwable) {
        throwable.printStackTrace();
    }

    @Override
    public void onCompleted() {
        System.out.println("onCompleted");
    }
});
for (int i = 0; i < n; i++) {
    request.onNext("stream request" + i);
}
request.onCompleted();
```

