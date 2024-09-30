---
title: "How to Proxy Dubbo Services through Apache ShenYu Gateway"
linkTitle: "How to Proxy Dubbo Services through Apache ShenYu Gateway"
date: 2022-05-04
tags: ["Gateway", "Ecosystem", "Java"]
description: >
  This article introduces how to access `Dubbo` services through the `Apache ShenYu` gateway, covering the main content from simple examples to core calling process analysis, and summarizing design principles.
aliases:
    - /en/overview/what/gateway/shenyu/
---

![img](/imgs/blog/shenyu-dubbo/ApacheShenYu-Dubbo-en.png)


## 1. Introduction

- Apache ShenYu

![img](/imgs/blog/shenyu-dubbo/shenyu.png)


[Apache ShenYu(Incubating)](https://shenyu.apache.org/docs/index) is an asynchronous, high-performance, cross-language, and responsive `API` gateway. Compatible with various mainstream framework systems, it supports hot swapping, and users can customize development to meet various current and future needs through large-scale scenario testing.

In May 2021, `ShenYu` was donated to the `Apache` Software Foundation, which was fully approved by the Apache Foundation and successfully entered the incubator.


- Apache Dubbo

`Apache Dubbo` is a microservices development framework that provides two key capabilities: `RPC` communication and microservice governance. This means that microservices developed using `Dubbo` will have remote discovery and communication capabilities among themselves, while utilizing the rich service governance capabilities provided by Dubbo to implement service governance requirements such as service discovery, load balancing, and traffic scheduling. Additionally, `Dubbo` is highly extensible, allowing users to customize their implementations at almost any function point to change the default behavior of the framework to meet their business needs.


## 2. Quick Start with Dubbo

This section introduces how to integrate `Dubbo` services into the `ShenYu` gateway. You can find the [example code](https://github.com/apache/shenyu/tree/master/shenyu-examples/shenyu-examples-dubbo) for this section directly under the project.


### 2.1 Start shenyu-admin

`shenyu-admin` is the backend management system for `Apache ShenYu`. There are various ways to start it; this article will start it via `[local deployment](https://shenyu.apache.org/docs/deployment/deployment-local)`. Once successfully started, you need to enable the `dubbo` plugin in the basic configuration `->` plugin management, and set your registration address. Please ensure that the registration center is already running.

![img](/imgs/blog/shenyu-dubbo/dubbo-enable-en.png)


### 2.2 Start shenyu gateway

Here we start it through the [source code](https://github.com/apache/incubator-shenyu/tree/master/shenyu-bootstrap), running `ShenyuBootstrapApplication` in `shenyu-bootstrap` directly.

Before starting, please ensure that the gateway has relevant dependencies introduced. If the client is `apache dubbo`, and the registration center uses `zookeeper`, please refer to the following configuration:

```java
        <!-- apache shenyu  apache dubbo plugin start-->
        <dependency>
            <groupId>org.apache.shenyu</groupId>
            <artifactId>shenyu-spring-boot-starter-plugin-apache-dubbo</artifactId>
            <version>${project.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo</artifactId>
            <version>2.7.5</version>
        </dependency>
        <!-- Dubbo zookeeper registry dependency start -->
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-client</artifactId>
            <version>4.0.1</version>
            <exclusions>
                <exclusion>
                    <artifactId>log4j</artifactId>
                    <groupId>log4j</groupId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-framework</artifactId>
            <version>4.0.1</version>
        </dependency>
        <dependency>
            <groupId>org.apache.curator</groupId>
            <artifactId>curator-recipes</artifactId>
            <version>4.0.1</version>
        </dependency>
        <!-- Dubbo zookeeper registry dependency end -->
        <!-- apache dubbo plugin end-->
```

### 2.3 Start shenyu-examples-dubbo

Taking the example provided by the official website [shenyu-examples-dubbo](https://github.com/apache/shenyu/tree/master/shenyu-examples/shenyu-examples-dubbo) as an example. Suppose the `dubbo` service is defined as follows:

```xml
<beans /* ...... * />

    <dubbo:application name="test-dubbo-service"/>
    <dubbo:registry address="${dubbo.registry.address}"/>
    <dubbo:protocol name="dubbo" port="20888"/>

    <dubbo:service timeout="10000" interface="org.apache.shenyu.examples.dubbo.api.service.DubboTestService" ref="dubboTestService"/>

</beans>
```

Declare the application service name, registration center address, use the `dubbo` protocol, and declare the service interface corresponding to the implementation class:

```java
/**
 * DubboTestServiceImpl.
 */
@Service("dubboTestService")
public class DubboTestServiceImpl implements DubboTestService {
    
    @Override
    @ShenyuDubboClient(path = "/findById", desc = "Query by Id")
    public DubboTest findById(final String id) {
        return new DubboTest(id, "hello world shenyu Apache, findById");
    }

    //......
}
```

In the interface implementation class, use the annotation `@ShenyuDubboClient` to register the service in `shenyu-admin`.

In the configuration file `application.yml`:

```yaml
server:
  port: 8011
  address: 0.0.0.0
  servlet:
    context-path: /
spring:
  main:
    allow-bean-definition-overriding: true
dubbo:
  registry:
    address: zookeeper://localhost:2181  # dubbo registration center
    
shenyu:
  register:
    registerType: http # Registration method
    serverLists: http://localhost:9095 # Registration address
    props:
      username: admin 
      password: 123456
  client:
    dubbo:
      props:
        contextPath: /dubbo  
        appName: dubbo

```

In the configuration file, declare the registration center address used by `dubbo`, register the `dubbo` service with `shenyu-admin`, using the method `http`, and the registration address is `http://localhost:9095`.

For information on registration methods, please refer to `[Application Client Access](https://shenyu.apache.org/docs/design/register-center-design/)`.


### 2.4 Call dubbo service

Once the `shenyu-examples-dubbo` project starts successfully, the interfaces with the `@ShenyuDubboClient` annotation will automatically register with the gateway.


Open `Plugin List -> Proxy -> dubbo` to view the plugin rule configuration list:


![img](/imgs/blog/shenyu-dubbo/dubbo-service-list-en.png)

Successfully registered selector information:

![img](/imgs/blog/shenyu-dubbo/dubbo-selector-en.png)

Successfully registered rule information:

![img](/imgs/blog/shenyu-dubbo/dubbo-rule-en.png)

> Selectors and rules are the essence of the `Apache ShenYu` gateway. Mastering them allows you to manage any traffic. The corresponding selector and rule matching conditions (conditions) can handle various complex scenarios based on different traffic filtering rules. Traffic filtering can retrieve data from `Header`, `URI`, `Query`, `Cookie`, etc. in the HTTP request.
>
> You can then use matching methods such as `Match`, `=`, `Regex`, `Groovy`, and `Exclude` to match your expected data. Multiple matching conditions can be added with `And/Or` strategies.
>
> For specific introductions and usage, please see: `[Selector and Rule Management](https://shenyu.apache.org/docs/user-guide/admin-usage/selector-and-rule)`.


Initiate a `GET` request to call `dubbo` service through `ShenYu` gateway:

```
GET http://localhost:9195/dubbo/findById?id=100
Accept: application/json
```

After a successful response, the result is as follows:

```
{
  "name": "hello world shenyu Apache, findById",
  "id": "100"
}
```

Thus, the `dubbo` service has been accessed successfully through the `http` request, and the `ShenYu` gateway has converted the `http` protocol into the `dubbo` protocol through the `shenyu-plugin-dubbo` module.


## 3. In-Depth Understanding of Dubbo Plugin

During the running of the above `demo`, you may have some questions:

- How is the `dubbo` service registered to `shenyu-admin`?
- How does `shenyu-admin` synchronize data to the `ShenYu` gateway?
- How does `DubboPlugin` convert the `http` protocol to the dubbo protocol?

With these questions, let's dive into understanding the `dubbo` plugin.


### 3.1 Application Client Access

Application client access refers to integrating microservices into the `Apache ShenYu` gateway, currently supporting protocols like `Http`, `Dubbo`, `Spring Cloud`, `gRPC`, `Motan`, `Sofa`, and `Tars`.

Integrating the application client into the `Apache ShenYu` gateway is achieved through a registration center, involving client registration and server data synchronization. The registration center supports `Http`, `Zookeeper`, `Etcd`, `Consul`, and `Nacos`, with the default being `Http` for registration.

For related configuration on client access, please refer to `[Client Access Configuration](https://shenyu.apache.org/docs/user-guide/register-center-access)`.

#### 3.1.1 Client Registration

![img](/imgs/blog/shenyu-dubbo/register-client.png)

In your microservice configuration, declare the registration center client type, such as `Http` or `Zookeeper`.
When the application starts, it loads and initializes the corresponding registration center client using `SPI`, implementing the Spring Bean-related post-processor interface, fetching service interface information to register, and placing the information into `Disruptor`.

The registration center client reads data from `Disruptor` and registers the interface information to `shenyu-admin`, where `Disruptor` decouples data from operations, facilitating extension.

#### 3.1.2 Server Registration

![img](/imgs/blog/shenyu-dubbo/register-server.png)

In `shenyu-admin`, declare the registration center server type, such as `Http` or `Zookeeper`. When `shenyu-admin` starts, it reads the configuration type, loads and initializes the corresponding registration center server. Once the registration center server receives interface information registered by `shenyu-client`, it places it in `Disruptor`, triggering registration logic to update and publish synchronization events.

`Disruptor` decouples data from operations for better extension. If there are too many registration requests causing registration exceptions, it provides data buffering.

### 3.2 Data Synchronization Principles

Data synchronization refers to how data is synchronized from the `shenyu-admin` backend to the `Apache ShenYu` gateway after operating the data. The `Apache ShenYu` gateway currently supports `ZooKeeper`, `WebSocket`, `Http long polling`, `Nacos`, `Etcd`, and `Consul` for data synchronization, with the default being through `WebSocket`.

For related configuration on data synchronization, please refer to `[Data Synchronization Configuration](https://shenyu.apache.org/docs/user-guide/use-data-sync)`.

#### 3.2.1 Significance of Data Synchronization

The gateway is the entry point for traffic requests, playing a crucial role in the microservice architecture. The importance of the gateway's high availability is self-evident. During the use of the gateway, to meet business demands, configurations often need to change, such as flow control rules and routing rules. Therefore, dynamic configuration of the gateway is a significant factor in ensuring its high availability.

Current data synchronization features include:

- All configurations are cached in `Apache ShenYu` gateway memory, utilizing local caches for each request, providing very fast speeds.
- Users can modify data in the `shenyu-admin` backend at will, and immediately synchronize it to the gateway memory.
- Synchronization supports data synchronization for plugin, selector, rule data, metadata, signature data, etc., of `Apache ShenYu`.
- All plugins, selectors, and rules are dynamically configured and take effect immediately, without requiring service restarts.
- Data synchronization methods support `Zookeeper`, `Http long polling`, `Websocket`, `Nacos`, `Etcd`, and `Consul`.

#### 3.2.2 Analysis of Data Synchronization Principles

The diagram below illustrates the data synchronization process of `Apache ShenYu`. When the `Apache ShenYu` gateway starts, it synchronizes configuration data from the configuration service and supports push-pull modes to receive configuration change information, then updates the local cache. Administrators can modify user permissions, rules, plugins, traffic configurations in the management background (`shenyu-admin`), and synchronize this information to the `Apache ShenYu` gateway using either `push` or `pull` mode, depending on the synchronization method used.

![img](/imgs/blog/shenyu-dubbo/data-sync.png)

In earlier versions, the configuration service depended on `Zookeeper` for realization, pushing change notifications to the gateway from the management backend. Now it supports `WebSocket`, `Http long polling`, `Zookeeper`, `Nacos`, `Etcd`, and `Consul`, allowing configuration of `shenyu.sync.${strategy}` to specify the corresponding synchronization strategy, with the default using the `webosocket` synchronization strategy for sub-second data synchronization. However, it is crucial that the `Apache ShenYu` gateway and `shenyu-admin` use the same synchronization strategy.

As shown in the diagram below, after a configuration change occurs in the management backend (`shenyu-admin`), it issues a change notification through `EventPublisher`. The `EventDispatcher` processes this change notification, and according to the specified synchronization strategy (`http, websocket, zookeeper, naocs, etcd, consul`), sends the configuration to the corresponding event processor.

- If the synchronization strategy is `websocket`, the altered data is actively pushed to `shenyu-web`, and there is a corresponding `WebsocketDataHandler` in the gateway to handle the data push from `shenyu-admin`.
- If the synchronization strategy is `zookeeper`, it updates the changed data to `zookeeper`, while `ZookeeperSyncCache` listens to changes in `zookeeper` data and processes it.
- If the synchronization strategy is `http`, the gateway actively initiates long polling requests with a default timeout of `90s`. If there are no data changes from `shenyu-admin`, the `http` request is blocked; if data changes occur, it responds with the changed data information. If there are no data changes after `60s`, it responds with empty data. Upon receiving the response, the gateway initiates another `http` request, repeating the same request process.

### 3.3 Process Analysis

Process analysis shows service registration, data synchronization, and service calling processes from the source code perspective.

#### 3.3.1 Service Registration Process

- Read dubbo service

Use the annotation `@ShenyuDubboClient` to mark the `dubbo` service that needs to be registered to the gateway.

Annotation scanning is accomplished through `ApacheDubboServiceBeanListener`, which implements the `ApplicationListener<ContextRefreshedEvent>` interface. During the `Spring` container startup, when a context refresh event occurs, it executes the event handling method `onApplicationEvent()`. In the overridden method logic, it reads the `Dubbo` service `ServiceBean`, builds metadata and `URI` objects, and registers with `shenyu-admin`.

For specific registration logic, please refer to `[Client Access Principles](https://shenyu.apache.org/docs/design/register-center-design/)`.

- Handle registration information

The metadata and `URI` data registered by the client through the registration center are processed on the `shenyu-admin` end, responsible for storing in the database and synchronizing with the `shenyu` gateway. The client registration handling logic of the `Dubbo` plugin is in `ShenyuClientRegisterDubboServiceImpl`. The inheritance relationship is as follows:

![img](/imgs/blog/shenyu-dubbo/ShenyuClientRegisterDubboServiceImpl.png)

- ShenyuClientRegisterService: Client registration service, top-level interface;
- FallbackShenyuClientRegisterService: Registration failure, provides retry operation;
- AbstractShenyuClientRegisterServiceImpl: Abstract class implementing some common registration logic;
- ShenyuClientRegisterDubboServiceImpl: Implements the `Dubbo` plugin registration;

Registration information includes selectors, rules, and metadata.


The overall `dubbo` service registration process is as follows:

![img](/imgs/blog/shenyu-dubbo/dubbo-register-en.png)

#### 3.3.2 Data Synchronization Process

- Admin updates data

Suppose a new selector data is added in the backend management system; the request enters the `SelectorController` class's `createSelector()` method, responsible for data validation, adding, or updating data, and returning result information.

In the `SelectorServiceImpl` class, the data is transformed and saved to the database, publishing the event and updating the `upstream`.

In the `Service` class, data persistence operations are completed, namely saving data to the database. The change data publication is done through `eventPublisher.publishEvent()`. The `eventPublisher` object is an instance of the `ApplicationEventPublisher` class, with the fully qualified name `org.springframework.context.ApplicationEventPublisher`, and the data publishing functionality is accomplished through Spring-related capabilities.

Once the event publication is complete, it automatically enters the `DataChangedEventDispatcher` class's `onApplicationEvent()` method to handle events based on different data types and synchronization methods.

- Gateway Data Synchronization

Upon startup, the gateway loads different configuration classes based on the specified data synchronization method, initializing relevant data synchronization classes.

After data is received, deserialization operations take place to read the data type and operation type. Different data types have different data handling methods and corresponding implementation classes. However, shared logic can be implemented through a template method design pattern, placing common logic in the `handle()` method of the abstract class `AbstractDataHandler`, while differing logic is left to their respective implementation classes.

Adding a new selector data is an addition operation that enters the specific data processing logic within `SelectorDataHandler.doUpdate()`.

The general plugin data subscriber, `CommonPluginDataSubscriber`, is responsible for handling all plugin, selector, and rule information.

The data is saved into the gateway's memory; `BaseDataCache` is the final cache data class, achieved through the singleton pattern. Selector data is stored in the `SELECTOR_MAP` Map. In subsequent usage, data is also fetched from here.

The above logic is represented in the flowchart as follows:

![img](/imgs/blog/shenyu-dubbo/data-sync-seq-en.png)

#### 3.3.3 Service Calling Process

In the `Dubbo` plugin system, the class inheritance relationship is as follows:

![img](/imgs/blog/shenyu-dubbo/ApacheDubboPlugin.png)

> ShenyuPlugin: Top-level interface defining interface methods;
>
> AbstractShenyuPlugin: Abstract class implementing shared plugin logic;
>
> AbstractDubboPlugin: Abstract class for the dubbo plugin implementing shared `dubbo` logic (ShenYu gateway supports ApacheDubbo and AlibabaDubbo);
>
> ApacheDubboPlugin: ApacheDubbo plugin.


- org.apache.shenyu.web.handler.ShenyuWebHandler.DefaultShenyuPluginChain#execute()

Once proxied by the `ShenYu` gateway, the request entry is `ShenyuWebHandler`, which implements the `org.springframework.web.server.WebHandler` interface, connecting all plugins through the chain of responsibility design pattern.

- org.apache.shenyu.plugin.base.AbstractShenyuPlugin#execute()

When the request reaches the gateway, determining whether a plugin executes is achieved through specified matching logic. In the `execute()` method, selector and rule matching logic is executed.


- org.apache.shenyu.plugin.global.GlobalPlugin#execute()

The first to be executed is `GlobalPlugin`, a global plugin that builds context information in its `execute()` method.

- org.apache.shenyu.plugin.base.RpcParamTransformPlugin#execute()

Next is `RpcParamTransformPlugin`, which reads parameters from the `http` request, saves them to `exchange`, and passes them to the `rpc` service. In the `execute()` method, this plugin's core logic executes: retrieving request information from `exchange` and processing parameters based on the request's content format.

- org.apache.shenyu.plugin.dubbo.common.AbstractDubboPlugin

Then comes the execution of `DubboPlugin`. In the `doExecute()` method, it mainly checks metadata and parameters. In the `doDubboInvoker()` method, it sets special context information and then begins generic `dubbo` calls.

In the `genericInvoker()` method:

- Retrieve the `ReferenceConfig` object;
- Get the generic service `GenericService` object;
- Construct the request parameter `pair` object;
- Initiate an asynchronous generic call.

By generic calling, the gateway can invoke `dubbo` services.

The `ReferenceConfig` object is the key object supporting generic calls, and its initialization occurs during data synchronization.

- org.apache.shenyu.plugin.response.ResponsePlugin#execute()

Finally, the `ResponsePlugin` is executed, handling the response result information from the gateway uniformly. The processing type is determined by `MessageWriter`, with the class inheritance relationship shown below:

![img](/imgs/blog/shenyu-dubbo/MessageWriter.png)

> MessageWriter: Interface defining message processing methods;
>
> NettyClientMessageWriter: Handling results from `Netty` calls;
>
> RPCMessageWriter: Handling results from `RPC` calls;
>
> WebClientMessageWriter: Handling results from `WebClient` calls;

Response processing for `Dubbo` service calls is handled by `RPCMessageWriter`.

- org.apache.shenyu.plugin.response.strategy.RPCMessageWriter#writeWith()

In the `writeWith()` method, the response result is processed, retrieving the result or handling exceptions.

With this analysis, the source code analysis regarding the `Dubbo` plugin is complete, illustrated by the following flowchart:

![img](/imgs/blog/shenyu-dubbo/dubbo-execute-en.png)


## 4. Conclusion

This article starts from practical cases and gradually analyzes the proxying process of `Dubbo` services by the `ShenYu` gateway. The main knowledge points covered include:

- Executing plugins through the chain of responsibility design pattern;
- Implementing `AbstractShenyuPlugin` using the template method design pattern to handle generic operation types;
- Implementing the cache data class `BaseDataCache` using the singleton design pattern;
- Expanding functionality easily via `springboot starter` to incorporate various registration centers and data synchronization methods;
- Supporting hot updates of rules through `admin` for convenient traffic control;
- Using the `Disruptor` queue to decouple data from operations and buffer data.

