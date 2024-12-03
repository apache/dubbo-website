---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/protocol/triple/pojo/
    - /en/docs3-v2/java-sdk/reference-manual/protocol/triple/pojo/
description: "The Triple protocol is fully compatible with gRPC but offers better usability without binding to Protobuf, allowing you to define services directly using `Java interfaces`."
linkTitle: Java Interface Method
title: Developing triple communication services using Java interfaces
type: docs
weight: 1
---

**Unlike the official Google gRPC implementation, the Dubbo implementation of the triple protocol offers better usability (not bound to Protobuf), allowing you to define services directly using `Java interfaces`. For users looking for smooth upgrades, having no multi-language business, or unfamiliar with Protobuf, the `Java interface` method is the simplest way to use triple.**

Below is a basic example of developing a Dubbo service using the `Java interface`, which uses triple protocol communication. You can view the [full code for this example](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-api).

{{% alert title="Note" color="info" %}}
The example used in this article is coded based on the native API. There is also a [Spring Boot version of the example](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-spring-boot) for reference, which also follows the `Java interface + triple` model, with additional service discovery configuration.
{{% /alert %}}

## Run the Example
First, you can download the example source code with the following command
```shell
git clone --depth=1 https://github.com/apache/dubbo-samples.git
```

Enter the example source code directory:
```shell
cd dubbo-samples/1-basic/dubbo-samples-api
```

### Start the Server
Run the following command to start the server

```bash
mvn -Dexec.mainClass=org.apache.dubbo.samples.provider.Application exec:java
```

### Start the Client

There are two ways to call the services published by the server:
* Use standard HTTP tools, such as cURL
* Develop a client using the Dubbo SDK

#### cURL
```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50052/org.apache.dubbo.samples.api.GreetingsService/sayHi/
```

#### SDK Client

```bash
mvn -Dexec.mainClass=org.apache.dubbo.samples.client.Application exec:java
```

## Source Code Explanation
If you are a long-time Dubbo user, you will find the following content is basically the same as the previous Dubbo2 development model, with the protocol name changed from `dubbo` to `tri`.

### Define Service
First is the service definition, using Java interfaces to define the Dubbo service.
```java
public interface GreetingsService {
    String sayHi(String name);
}
```

### Service Provider
Next, on the provider side, you need to provide the specific implementation of the service:
```java
public class GreetingsServiceImpl implements GreetingsService {
    @Override
    public String sayHi(String name) {
        return "hi, " + name;
    }
}
```

Finally, publish the service:
```java
public static void main(String[] args) {
	DubboBootstrap.getInstance()
			.protocol(ProtocolBuilder.newBuilder().name("tri").port(50052).build())
			.service(ServiceBuilder.newBuilder().interfaceClass(GreetingsService.class).ref(new GreetingsServiceImpl()).build())
			.start()
			.await();
}
```

### Service Consumer

Next, you can initiate an RPC call to the remote service:
```java
public static void main(String[] args) throws IOException {
	ReferenceConfig<GreetingsService> reference =
			ReferenceBuilder.<GreetingsService>newBuilder()
			.interfaceClass(GreetingsService.class)
			.url("tri://localhost:50052")
			.build();
	DubboBootstrap.getInstance().reference(reference).start();
	GreetingsService service = reference.get();

	String message = service.sayHi("dubbo");
}
```

## Notes

### Serialization Encoding

How does Dubbo support both ordinary Java objects and Protobuf objects? In the Dubbo implementation, there is an object type check that first determines whether the parameter type is a protobuf object. If not, a protobuf object will wrap the request and response to unify the transmission of ordinary Java objects as protobuf objects. The wrapper object declares serialization types internally to support serialization extensions.

The IDL for the wrapper is as follows:
```proto
syntax = "proto3";

package org.apache.dubbo.triple;

message TripleRequestWrapper {
    // hessian4
    // json
    string serializeType = 1;
    repeated bytes args = 2;
    repeated string argTypes = 3;
}

message TripleResponseWrapper {
    string serializeType = 1;
    bytes data = 2;
    string type = 3;
}
```

For requests, use `TripleRequestWrapper` for wrapping, and for responses, use `TripleResponseWrapper` for wrapping.

> For request parameters, note that args is marked as `repeated` to support multiple parameters for Java methods. Of course, there can only be one serialization. The serialization implementation follows the spi of Dubbo2.

### Performance
Due to an additional layer of serialization encoding for the data transmitted over the link (such as hessian2), and the method calls on the server side being based on reflection, the Java interface method may experience some performance degradation compared to the `protobuf + triple` encoding model.

While the Protobuf model does have some performance advantages, usability and cost of use will also increase sharply. We recommend considering the business scenario first; if there is no multi-language business or if you are a Dubbo2 veteran, then sticking with the Java interface model is a good, low-cost option.

### gRPC Compatibility
Since gRPC only supports the protobuf model, the `interface + triple` model introduced in this article cannot interoperate with the official native gRPC protocol from Google.

### Frontend Traffic Access
For HTTP traffic from the frontend (such as browsers or web applications), to access triple through the gateway, it must use the built-in `application/json` mode to initiate the call. For details, please refer to [【Usage Tutorial - HTTP Gateway Access】](/en/overview/mannual/java-sdk/tasks/gateway/triple/)。

