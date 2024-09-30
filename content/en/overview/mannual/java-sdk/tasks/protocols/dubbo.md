---
aliases:
  - /en/overview/tasks/protocols/dubbo/
  - /en/overview/tasks/protocols/dubbo/
description: "Demonstrates how to develop services based on `dubbo` protocol communication."
linkTitle: dubbo Protocol
title: "TCP-based RPC Communication Protocol - dubbo"
type: docs
weight: 2
---

This example demonstrates how to develop services based on `dubbo` protocol communication, and you can view the [full code of this example](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-dubbo):

{{% alert title="Note" color="info" %}}
To ensure compatibility with older versions, the default protocol for Dubbo 3.3.0 and earlier is `dubbo`. However, if you are a new user considering using Dubbo to build a brand-new microservices system, we recommend that you explicitly configure your application to use the `triple` protocol.
{{% /alert %}}

## Running the Example
You can follow these steps to try running the example source code corresponding to this document.

First, download the example source code using the following command:
```shell
git clone --depth=1 https://github.com/apache/dubbo-samples.git
```

Change into the example source code directory:
```shell
cd dubbo-samples/2-advanced/dubbo-samples-dubbo
```

Package the example using Maven:
```shell
mvn clean install -DskipTests
```

### Start the Provider
Run the following command to start the provider:

```shell
java -jar ./dubbo-samples-dubbo-provider/target/dubbo-samples-dubbo-provider-1.0-SNAPSHOT.jar
```

### Start the Consumer
Run the following command:

```shell
java -jar ./dubbo-samples-dubbo-consumer/target/dubbo-samples-dubbo-consumer-1.0-SNAPSHOT.jar
```

## Source Code Explanation

### Define the Service
First is the service definition. When using the `dubbo` protocol, we need to define the Dubbo service through a Java Interface.
```java
public interface DemoService {
    String sayHello(String name);
}
```

### Service Provider
Next, on the provider side, we need to provide the concrete implementation of the service.
```java
@DubboService
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        return "Hello " + name;
    }
}
```

Configure to use the `dubbo` protocol:
```yaml
dubbo:
  protocol:
    name: dubbo
    port: 20880
```

### Service Consumer

Configure the service reference as follows:
```java
@Component
public class Task implements CommandLineRunner {
    @DubboReference(url = "dubbo://127.0.0.1:20880/org.apache.dubbo.protocol.dubbo.demo.DemoService")
    private DemoService demoService;
}
```

Next, you can initiate the RPC call to the remote service:
```java
demoService.sayHello("world");
```

## More Protocol Configuration

### Serialization
The calls between the consumer and provider use the dubbo protocol, **the default data encoding format (i.e., serialization) for method parameters is hessian2.** You can also set to use any other serialization protocol; serialization does not affect the normal operation of the dubbo protocol (it only has some impact on encoding performance).

```yaml
dubbo:
  protocol:
    name: dubbo
    port: 20880
    serialization: fastjson2
```

{{% alert title="Note" color="info" %}}
Starting from version 3.2.0, Dubbo has added an automatic negotiation mechanism for serialization protocols. If the conditions `both ends are specific versions of Dubbo 3 + Fastjson2-related dependencies exist` are met, it will automatically use the fastjson2 serialization protocol; otherwise, it will use the hessian2 protocol, and the negotiation is transparent to users.

Since the default serialization protocol for Dubbo2 is hessian2, for some scenarios where RPC invocation payloads are intercepted, such as sidecars that intercept and parse link payloads, be mindful of compatibility issues during the upgrade process; other users need not worry.
{{% /alert %}}

### Shared Connections
For implementing the dubbo protocol, **the default connection between consumer machine A and provider machine B is the same link**, meaning that regardless of how many service calls exist between A and B, the same TCP connection is used by default. Of course, the Dubbo framework provides methods that allow you to adjust the number of TCP connections between A and B.

Additionally, the dubbo protocol supports configurations for payload limits, serialization, the number of connections, connection timeout, heartbeat, etc. For details, please refer to the [Reference Manual - dubbo Protocol](/en/overview/mannual/java-sdk/reference-manual/protocol/dubbo/).


