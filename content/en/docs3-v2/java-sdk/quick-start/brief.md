---
type: docs
title: "1 - Rapidly deploy a microservice application"
linkTitle: "Quickly deploy a microservice application"
weight: 1
description: "This article will demonstrate how to quickly build and deploy a microservice application based on Dubbo Samples."
---

## Background

![arch-service-discovery](/imgs/architecture.png)

As a microservice framework, Dubbo is most important to provide users with cross-process RPC remote call capabilities. As shown in the figure above, Dubbo's service consumer (Consumer) sends requests to the service provider (Provider) through a series of tasks.

In order to achieve such a goal, Dubbo introduces the Registry component. Through the Registry, service consumers can perceive the connection method of the service provider, so as to send the request to the correct service provider.

## Target

Understand the way of calling microservices and the capabilities of Dubbo

## Difficulty

Low

## Environmental requirements

- System: Windows, Linux, MacOS

- JDK 8 and above (JDK17 is recommended)

- Git

- Docker (optional)

## Hands

This chapter will teach you step by step how to deploy and run the simplest Dubbo use case through a few simple commands.

### 1. Get the test project

Before starting the whole tutorial, we need to get the code of the test project. All test case codes of Dubbo are stored in the repository [apache/dubbo-samples](https://github.com/apache/dubbo-samples), the following command can help you get all the codes in the Samples repository.

```bash
git clone --depth=1 --branch master git@github.com:apache/dubbo-samples.git
```

### 2. Understand the project structure of Dubbo Samples

After the [apache/dubbo-samples](https://github.com/apache/dubbo-samples) warehouse is cloned locally, this section will explain the specific organization of the warehouse.

```
.
├── codestyle // style configuration file for development

├── 1-basic // basic introductory use cases
├── 2-advanced // advanced usage
├── 3-extensions // Example of extension usage
├── 4-governance // service governance use cases
├── 10-task // Example of Dubbo learning series

├── 99-integration // integration test use
├── test // integration test use
└── tools // three-party component quick start tool
```

As shown in the above table, [apache/dubbo-samples](https://github.com/apache/dubbo-samples) mainly consists of three parts: code style file, test code, and integration test.

1. The code style file can be used when developing Dubbo code, including the configuration file of IntelliJ IDEA.

2. The test code is the core content required by this textbook. It currently includes 5 parts: basic entry use cases for beginners, advanced advanced usage for developers, extensions Dubbo peripheral extension usage examples for middleware maintainers, governance service governance use cases for production, and Dubbo learning series. This article will explain the simplest way to use Dubbo API based on the basic introductory use case.

3. Integration testing is an important part of Dubbo's quality assurance system. Each version of Dubbo will perform regression verification on all samples to ensure that all changes in Dubbo will not affect the use of samples.

### 3. Start a simple registration center

Starting from this section, a microservice application will be formally deployed through three commands.

From the [Background](#background) section, we can see that a major prerequisite for running Dubbo applications is to deploy a registry. In order to make this tutorial easier to use, we provide a simple starter based on the Apache Zookeeper registry. If You need to deploy the registration center in the production environment. Please refer to [Production Environment Initialization](/) to deploy a highly available registration center.

```bash
Windows:
./mvnw.cmd clean compile exec:java -pl tools/embedded-zookeeper

Linux / MacOS:
./mvnw clean compile exec:java -pl tools/embedded-zookeeper

Note: You need to open an independent terminal to run, and the command will keep executing.

Docker:
docker run --name some-zookeeper --restart always -d zookeeper
```

After executing the above command, wait for a while for the log as shown in the figure below to appear, which means that the registration center is started, and you can continue to perform subsequent tasks.

![registry](/imgs/docs3-v2/java-sdk/quickstart/2023-01-19-15-55-23-image.png)

### 4. Start the service provider

After starting the registry, the next step is to start a service provider that provides services externally. Corresponding samples are also provided in dubbo-samples, which can be quickly pulled up by the following command.

```bash
Windows:
./mvnw.cmd clean compile exec:java -pl 1-basic/dubbo-samples-api -Dexec.mainClass="org.apache.dubbo.samples.provider.Application"

Linux / MacOS:
./mvnw clean compile exec:java -pl 1-basic/dubbo-samples-api -Dexec.mainClass="org.apache.dubbo.samples.provider.Application"

Note: You need to open an independent terminal to run, and the command will keep executing.
```

After executing the above command, wait for a while for the log (`DubboBootstrap awaiting`) as shown in the figure below to appear, which means that the service provider has started, indicating that the service provider can provide services externally.

![provider](/imgs/docs3-v2/java-sdk/quickstart/2023-01-19-15-56-09-image.png)

``` log
[19/01/23 03:55:49:049 CST] org.apache.dubbo.samples.provider.Application.main() INFO bootstrap.DubboBootstrap: [DUBBO] DubboBootstrap awaiting ..., dubbo version: 3.2.0 -beta.3, current host: 169.254.44.42
```

### 5. Start service consumer

The last step is to start a service consumer to call the service provider, which is the core of the RPC call, providing a bridge for the service consumer to call the service provider.

```bash
Windows:
./mvnw.cmd clean compile exec:java -pl 1-basic/dubbo-samples-api -Dexec.mainClass="org.apache.dubbo.samples.client.Application"

Linux / MacOS:
./mvnw clean compile exec:java -pl 1-basic/dubbo-samples-api -Dexec.mainClass="org.apache.dubbo.samples.client.Application"
```

After executing the above command, wait for a while for the log (`hi, dubbo`) to appear as shown in the figure below. The printed data is returned after the service provider processes it, marking the success of a service call.

![consumer](/imgs/docs3-v2/java-sdk/quickstart/2023-01-19-16-30-14-image.png)

``` log
Receive result ======> hi, dubbo
```

## Further reading

### 1. How does the consumer find the server?

In step 3 of this use case, a Zookeeper registration center is started, and the service provider will write its own address into the registration center for service consumers to obtain.

Dubbo will write the connection information of the service provider under `/dubbo/interfaceName` and `/services/appName` of Zookeeper.

The following is an example of data on Zookeeper:

```
[zk: localhost:2181(CONNECTED) 5] ls /dubbo/org.apache.dubbo.samples.api.GreetingsService/providers
[dubbo%3A%2F%2F30.221.146.35%3A20880%2Forg.apache.dubbo.samples.api.GreetingsService%3Fanyhost%3Dtrue%26application%3Dfirst-dubbo-provider%26background%3Dfalse%26deprecated%3Dfalse%26dubbo%3D2 .0.2%26dynamic%3Dtrue%26environment%3Dproduct%26generic%3Dfalse%26interface%3Dorg.apache.dubbo.samples.api.GreetingsService%26ipv6%3Dfd00%3A1%3A5%3A5200%3A3218%3A774a%3A4f67%3A23ho1% %26pid%3D85639%26release%3D3.1.4%26service-name-mapping%3Dtrue%26side%3Dprovider%26timestamp%3D1674960780647]

[zk: localhost:2181(CONNECTED) 2] ls /services/first-dubbo-provider
[30.221.146.35:20880]
[zk: localhost:2181(CONNECTED) 3] get /services/first-dubbo-provider/30.221.146.35:20880
{"name":"first-dubbo-provider","id":"30.221.146.35:20880","address":"30.221.146.35","port":20880,"sslPort":null,"payload" :{"@class":"org.apache.dubbo.registry.zookeeper.ZookeeperInstance","id":"30.221.146.35:20880","name":"first-dubbo-provider","metadata":{ "dubbo.endpoints":"[{\"port\":20880,\"protocol\":\"dubbo\"}]", "dubbo.metadata-service.url-params": "{\"connections\ ":\"1\",\"version\":\"1.0.0\",\"dubbo\":\"2.0.2\",\"release\":\"3.1.4\", \"side\":\"provider\",\"ipv6\":\"fd00:1:5:5200:3218:774a:4f67:2341\",\"port\":\"20880\", \"protocol\":\"dubbo\"}","dubbo.metadata.revision":"871fbc9cb2730caea9b0d858852d5ede","dubbo.metadata.storage-type":"local","ipv6":"fd00:1:5 :5200:3218:774a:4f67:2341","timestamp":"1674960780647"}},"registrationTimeUTC":1674960781893,"serviceType":"DYNAMIC","uriSpec":null}
```

For more details about Dubbo's service discovery model, please refer to [Service Discovery](/zh-cn/overview/mannual/java-sdk/concepts-and-architecture/service-discovery/).

### 2. How does the consumer initiate the request?

In Dubbo's invocation model, the bridge that connects service consumers and service providers is the interface.

The service provider implements the specified interface, and the service consumer subscribes to this interface through Dubbo. When the service consumer calls the interface, Dubbo will encapsulate the request into a network request, and then send it to the service provider for the actual call.

In this use case, an interface `GreetingsService` is defined, which has a method called `sayHi`.

```java
// 1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/api/GreetingsService.java

package org.apache.dubbo.samples.api;

public interface GreetingsService {

    String sayHi(String name);

}
```

Service consumers can obtain the proxy of the `GreetingsService` interface through Dubbo's API, and then call it in the normal way of calling the interface. **Thanks to Dubbo's dynamic proxy mechanism, all this is like a local call. **

```java
// 1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/client/Application.java

// Get the subscribed Stub
GreetingsService service = reference. get();
// call like a normal java interface
String message = service.sayHi("dubbo");
```

### 3. Can multiple servers be deployed?

Yes, this section will demonstrate how to start a server-side **cluster**.

1) To start a registration center, you can refer to the [Tutorial] in Section 3 of the hands-on practice (#3-start a simple registration center)

2) Modify the data returned by the service provider so that the first started service provider returns `hi, dubbo. I am provider 1.`

Modify line 25 of `1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/provider/GreetingsServiceImpl.java` file as follows.

```java
// 1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/provider/GreetingsServiceImpl.java

package org.apache.dubbo.samples.provider;

import org.apache.dubbo.samples.api.GreetingsService;

public class GreetingsServiceImpl implements GreetingsService {
    @Override
    public String sayHi(String name) {
        return "hi, " + name + ". I am provider 1.";
    }
}
```

3) To start the first service provider, you can refer to the [Tutorial] in Section 4 of the hands-on practice (#4-Start the service provider)

4) Modify the data returned by the service provider so that the second started service provider returns `hi, dubbo. I am provider 2.`

Modify line 25 of `1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/provider/GreetingsServiceImpl.java` file as follows.

```java
// 1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/provider/GreetingsServiceImpl.java

package org.apache.dubbo.samples.provider;

import org.apache.dubbo.samples.api.GreetingsService;

public class GreetingsServiceImpl implements GreetingsService {
    @Override
    public String sayHi(String name) {
        return "hi, " + name + ". I am provider 2.";
    }
}
```

4) Start the second service provider, you can refer to the [Tutorial] in Section 4 of the hands-on practice (#4-Start the service provider)

5) To start the service consumer, you can refer to the [Tutorial] in Section 5 of the hands-on practice (#5-Start the service consumer). If you start the consumer multiple times, you can see that the returned results are different.

In dubbo-samples, there is also a consumer application `org.apache.dubbo.samples.client.AlwaysApplication` that will initiate calls periodically, which can be started by the following command.

```bash
Windows:
./mvnw.cmd clean compile exec:java -pl 1-basic/dubbo-samples-api -Dexec.mainClass="org.apache.dubbo.samples.client.AlwaysApplication"

Linux / MacOS:
./mvnw clean compile exec:java -pl 1-basic/dubbo-samples-api -Dexec.mainClass="org.apache.dubbo.samples.client.AlwaysApplication"
```

After startup, you can see a log similar to the following. The consumer will randomly call different service providers, and the returned result is also the result that the remote service provider thinks.

```
Sun Jan 29 11:23:37 CST 2023 Receive result ======> hi, dubbo. I am provider 1.
Sun Jan 29 11:23:38 CST 2023 Receive result ======> hi, dubbo. I am provider 2.
Sun Jan 29 11:23:39 CST 2023 Receive result ======> hi, dubbo. I am provider 2.
Sun Jan 29 11:23:40 CST 2023 Receive result ======> hi, dubbo. I am provider 1.
Sun Jan 29 11:23:41 CST 2023 Receive result ======> hi, dubbo. I am provider 1.
```

### 4. Is this use case complex?

No, Dubbo only needs a simple configuration to achieve stable and efficient remote calls.

The following is a simple example of a service provider that can be started by defining a few configurations.

```java
// 1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/provider/Application.java

// define all services
ServiceConfig<GreetingsService> service = new ServiceConfig<>();
service.setInterface(GreetingsService.class);
service.setRef(new GreetingsServiceImpl());

// start Dubbo
DubboBootstrap. getInstance()
        .application("first-dubbo-provider")
        .registry(new RegistryConfig(ZOOKEEPER_ADDRESS))
        .protocol(new ProtocolConfig("dubbo", -1))
        .service(service)
        .start();
```

The following is a simple example of a service consumer. After defining several configurations, the corresponding proxy object can be obtained after startup. After that, the user does not need to perceive the complex implementation behind this object at all. **Everything only needs to be the same as the local call. **.

```java
// 1-basic/dubbo-samples-api/src/main/java/org/apache/dubbo/samples/client/Application.java

// define all subscriptions
ReferenceConfig<GreetingsService> reference = new ReferenceConfig<>();
reference.setInterface(GreetingsService.class);

// start Dubbo
DubboBootstrap. getInstance()
        .application("first-dubbo-consumer")
        .registry(new RegistryConfig(ZOOKEEPER_ADDRESS))
        .reference(reference)
        .start();

// Get the subscribed Stub
GreetingsService service = reference. get();
// call like a normal java interface
String message = service.sayHi("dubbo");
```

## More

This use case introduces the basic process of an RPC remote call, and simulates a microservice deployment architecture by starting three nodes: the registration center, the service provider, and the service consumer.

In the next tutorial, we will explain the configurations of service providers and service consumers, and tell you how to build a microservice application from scratch.
