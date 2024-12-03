---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/interflow/call_java/
    - /en/docs3-v2/golang-sdk/tutorial/develop/interflow/call_java/
description: "If you are an old user of Dubbo Java, your Dubbo Java application may not be using Protobuf (defining services directly using Java interfaces). In this case, you need to develop the Dubbo Go-client as follows to call the older version of Dubbo services."
title: Non-Protobuf Mode Protocol Interoperability (Applicable to Old Version Dubbo Java Applications)
linkTitle: Non-Protobuf Mode Protocol Interoperability
type: docs
weight: 4
---

{{% alert title="Note" color="warning" %}}
Before reading this document, please remember that we recommend using the protobuf+triple model to write services that are interoperable between Java and Go. This article only applies if you already have an old version of a Dubbo Java application; otherwise, please refer to the previous documentation for developing services using protobuf+triple.
{{% /alert %}}

You can view the [complete example source code](https://github.com/apache/dubbo-go-samples/tree/main/java_interop/non-protobuf-dubbo) here.

## Go-client Calling Java-server
If you are an old user of Dubbo Java, your Dubbo Java application may not be using Protobuf (defining services directly using Java interfaces). In this case, you need to develop the Dubbo Go-client as follows to call the older version of Dubbo services.

> The following solutions support both triple (non-Protobuf) and Dubbo protocols; you only need to adjust the protocol configuration `client.WithClientProtocolTriple()`.

Assuming our current Java service is defined as follows:

```java
package org.apache.dubbo.samples.api;

public interface GreetingsService {
    String sayHi(String name);
}
```

We need to write the Go-client as follows to achieve service invocation:

```go
// Generate shared client, specify
cliDubbo, _ := client.NewClient(
	client.WithClientProtocolDubbo(),
	client.WithClientSerialization(constant.Hessian2Serialization),
)

// Generate service proxy, specifying the full path name of the Java service
connDubbo, _ := cliDubbo.Dial("org.apache.dubbo.samples.api.GreetingsService", client.WithURL("tri://localhost:50052"))

var respDubbo string
// Initiate call, parameters specified as an array (standard JSON format, refer to Java generic calls)
connDubbo.CallUnary(context.Background(), []interface{}{"hello"}, &respDubbo, "SayHello")
```

Next, let’s try running the example:

1. Run the Java server

```java
./java/java-server/run.sh
```

Check if the service is running properly:

```shell
curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:50052/org.apache.dubbo.sample.Greeter/sayHello
```

2. Run the Go client

```go
go run go/go-server/cmd/client.go
```

## Java-client Calling Go-server

In this scenario, it means you need to develop the Go server service entirely from scratch. We recommend directly using Protobuf to develop the Go server service, and the Java client side should also use Protobuf to invoke the new service. For specific usage examples, please refer to the previous documentation.
