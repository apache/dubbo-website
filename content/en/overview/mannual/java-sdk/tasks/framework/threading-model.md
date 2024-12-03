---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/threading-model/consumer/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/threading-model/consumer/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/performance/threading-model/consumer/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/performance/threading-model/
description: Usage of Dubbo consumer thread pool model
linkTitle: Thread Model
title: Consumer Thread Model, Provider Thread Model
type: docs
weight: 2
---

## Consumer Thread Model

For Dubbo applications prior to version 2.7.5, especially some consumer applications, when faced with consuming a large number of services with a high concurrency scenario (typical in gateway scenarios), there often arises the issue of excessive thread allocation on the consumer side. For specific discussions, refer to [Need a limited Threadpool in consumer side #2013](https://github.com/apache/dubbo/issues/2013).

The improved consumer thread pool model effectively addresses this issue by reusing the blocked business threads on the service side.

**Old Thread Pool Model**

![Consumer Thread Pool.png](/imgs/user/consumer-threadpool0.png)

We focus on the Consumer part:

1. Business threads issue a request and obtain a Future instance.
2. The business thread immediately calls future.get to block while waiting for the business result to return.
3. Once the business data returns, it is processed by a dedicated Consumer thread pool for deserialization, and future.set is called to place the deserialized business result back.
4. The business thread directly returns the result.

**Current Thread Pool Model**

![New Consumer Thread Pool.png](/imgs/user/consumer-threadpool1.png)

1. Business threads issue a request and obtain a Future instance.
2. Before calling future.get(), it first calls ThreadlessExecutor.wait(), which makes the business thread wait in a blocking queue until an element is added to the queue.
3. When the business data returns, a Runnable Task is created and placed into the ThreadlessExecutor queue.
4. The business thread retrieves the Task and executes it in its thread: deserializes the business data and sets it to Future.
5. The business thread directly returns the result.

This way, compared to the old thread pool model, the business thread is responsible for monitoring and parsing return results, saving the overhead of an additional consumer thread pool.

## Provider Thread Model
The current thread models for the Dubbo protocol and the Triple protocol have not yet been aligned. Below, the thread models for the Triple protocol and Dubbo protocol will be introduced separately.

### Dubbo Protocol

Before introducing the Provider-side thread model of the Dubbo protocol, it is important to first explain that Dubbo abstracts channel operations into five behaviors:

- Establish connection: connected, responsible for recording read and write times on the channel, as well as processing callback logic after establishing a connection.
- Disconnect: disconnected, responsible for removing read and write times on the channel and processing callback logic after disconnecting.
- Send message: sent, including sending requests and responses, and recording write times.
- Receive message: received, including receiving requests and responses, and recording read times.
- Exception capture: caught, used to handle various exceptions occurring on the channel.

The thread model of the Dubbo framework is closely related to these five behaviors, and the Provider thread model of the Dubbo protocol can be divided into five types: AllDispatcher, DirectDispatcher, MessageOnlyDispatcher, ExecutionDispatcher, ConnectionOrderedDispatcher.

#### Configuration Method
| Thread Model  | Configuration Value |
| ---- | -- |
All Dispatcher | all
Direct Dispatcher | direct
Execution Dispatcher | execution
Message Only Dispatcher | message
Connection Ordered Dispatcher | connection

Taking the configuration method in application.yaml as an example: configuring dispatcher: all under protocol can adjust the thread model of the Dubbo protocol to All Dispatcher

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
  protocol:
    name: dubbo
    port: -1
    dispatcher: all
  registry:
    id: zk-registry
    address: zookeeper://127.0.0.1:2181
```

#### All Dispatcher

The following figure illustrates the thread model of the All Dispatcher:

![dubbo-provider-alldispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-alldispatcher.png)

- Operations executed in IO threads:
  1. The sent operation is executed in the IO thread.
  2. The serialization response is executed in the IO thread.
- Operations executed in Dubbo threads:
  1. Received, connected, disconnected, and caught are executed in the Dubbo thread.
  2. The behavior of deserializing requests is done in Dubbo.

#### Direct Dispatcher

The following figure illustrates the thread model of the Direct Dispatcher:

![dubbo-provider-directDispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-directDispatcher.png)

- Operations executed in IO threads:
  1. Received, connected, disconnected, caught, and sent operations are executed in the IO thread.
  2. The deserialization of requests and the serialization of responses occur in the IO thread.
- There are no operations performed in the Dubbo thread.

#### Execution Dispatcher

The following figure illustrates the thread model of the Execution Dispatcher:

![dubbo-provider-ExecutionDispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-executionDispatcher.png)

- Operations executed in IO threads:
  1. Sent, connected, disconnected, and caught operations are executed in the IO thread.
  2. The serialization response is executed in the IO thread.
- Operations executed in Dubbo threads:
  1. Received is executed in the Dubbo thread.
  2. The behavior of deserializing requests is done in Dubbo.

#### Message Only Dispatcher

On the Provider side, the thread model of Message Only Dispatcher is consistent with that of Execution Dispatcher, so the following figure is the same as the Execution Dispatcher.

The following figure illustrates the thread model of the Message Only Dispatcher:

![dubbo-provider-ExecutionDispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-executionDispatcher.png)

- Operations executed in IO threads:
  1. Sent, connected, disconnected, and caught operations are executed in the IO thread.
  2. The serialization response is executed in the IO thread.
- Operations executed in Dubbo threads:
  1. Received is executed in the Dubbo thread.
  2. The behavior of deserializing requests is done in Dubbo.

#### Connection Ordered Dispatcher

The following figure illustrates the thread model of the Connection Ordered Dispatcher:

![dubbbo-provider-connectionOrderedDispatcher](/imgs/v3/feature/performance/threading-model/dubbbo-provider-connectionOrderedDispatcher.png)

- Operations executed in IO threads:
  1. The sent operation is executed in the IO thread.
  2. The serialization response is executed in the IO thread.
- Operations executed in Dubbo threads:
  1. Received, connected, disconnected, and caught are executed in the Dubbo thread; however, the connected and disconnected behaviors are isolated from the other two behaviors through a thread pool and provide link limitation and alarm capabilities in the Dubbo connected thread pool.
  2. The behavior of deserializing requests is done in Dubbo.

### Triple Protocol

The following figure shows the thread model of the Triple protocol Provider side.

![triple-provider](/imgs/v3/feature/performance/threading-model/triple-provider.png)

The thread model for Triple protocol Provider is currently quite simple, with both serialization and deserialization operations working in the Dubbo thread, while the IO thread does not carry these tasks.


## Thread Pool Isolation
A new thread pool management method isolates the thread pools of each service within the provider application, making them independent from each other. If a service's thread pool resources are exhausted, it will not affect other normal services. Thread pool configuration is supported, allowing users to specify their desired configuration.

Thread pool isolation ensures that the threads used for invoking remote methods by Dubbo are separate from the threads used by the microservice to execute its tasks. This helps improve system performance and stability by preventing thread blocking or competition.

Currently, configuration can be done via API, XML, or Annotation.

**Configuration Parameters**
- `ApplicationConfig` adds `String executor-management-mode` parameter with values default and isolation, defaulting to default.
    - `executor-management-mode = default` uses the original **thread pool management method shared between services granular by protocol port**
    - `executor-management-mode = isolation` uses the new **thread pool management method isolated between services granular by service tuple**
- `ServiceConfig` adds `Executor executor` parameter, **for the thread pool isolated between services**, which can be user-configurable. If not specified, a default thread pool for service isolation will be built using the protocol's configuration (`ProtocolConfig`).

> The new `Executor executor` configuration parameter in `ServiceConfig` is only valid if `executor-management-mode = isolation` is specified.
#### API
```java
    public void test() {
        // provider app
        DubboBootstrap providerBootstrap = DubboBootstrap.newInstance();

        ServiceConfig serviceConfig1 = new ServiceConfig();
        serviceConfig1.setInterface(DemoService.class);
        serviceConfig1.setRef(new DemoServiceImpl());
        serviceConfig1.setVersion(version1);
        // Set executor1 for serviceConfig1, max threads is 10
        NamedThreadFactory threadFactory1 = new NamedThreadFactory("DemoService-executor");
        ExecutorService executor1 = Executors.newFixedThreadPool(10, threadFactory1);
        serviceConfig1.setExecutor(executor1);

        ServiceConfig serviceConfig2 = new ServiceConfig();
        serviceConfig2.setInterface(HelloService.class);
        serviceConfig2.setRef(new HelloServiceImpl());
        serviceConfig2.setVersion(version2);
        // Set executor2 for serviceConfig2, max threads is 100
        NamedThreadFactory threadFactory2 = new NamedThreadFactory("HelloService-executor");
        ExecutorService executor2 = Executors.newFixedThreadPool(100, threadFactory2);
        serviceConfig2.setExecutor(executor2);

        ServiceConfig serviceConfig3 = new ServiceConfig();
        serviceConfig3.setInterface(HelloService.class);
        serviceConfig3.setRef(new HelloServiceImpl());
        serviceConfig3.setVersion(version3);
        // Because executor is not set for serviceConfig3, the default executor of serviceConfig3 is built using
        // the threadpool parameter of the protocolConfig ( FixedThreadpool , max threads is 200)
        serviceConfig3.setExecutor(null);

        // It takes effect only if [executor-management-mode=isolation] is configured
        ApplicationConfig applicationConfig = new ApplicationConfig("provider-app");
        applicationConfig.setExecutorManagementMode("isolation");

        providerBootstrap
        .application(applicationConfig)
        .registry(registryConfig)
        // export with tri and dubbo protocol
        .protocol(new ProtocolConfig("tri", 20001))
        .protocol(new ProtocolConfig("dubbo", 20002))
        .service(serviceConfig1)
        .service(serviceConfig2)
        .service(serviceConfig3);

        providerBootstrap.start();
    }
```

#### XML
```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">

  <!-- NOTE: we need config executor-management-mode="isolation" -->
  <dubbo:application name="demo-provider" executor-management-mode="isolation">
  </dubbo:application>

  <dubbo:config-center address="zookeeper://127.0.0.1:2181"/>
  <dubbo:metadata-report address="zookeeper://127.0.0.1:2181"/>
  <dubbo:registry id="registry1" address="zookeeper://127.0.0.1:2181?registry-type=service"/>

  <dubbo:protocol name="dubbo" port="-1"/>
  <dubbo:protocol name="tri" port="-1"/>

  <!-- expose three service with dubbo and tri protocol-->
  <bean id="demoServiceV1" class="org.apache.dubbo.config.spring.impl.DemoServiceImpl"/>
  <bean id="helloServiceV2" class="org.apache.dubbo.config.spring.impl.HelloServiceImpl"/>
  <bean id="helloServiceV3" class="org.apache.dubbo.config.spring.impl.HelloServiceImpl"/>

  <!-- customized thread pool -->
  <bean id="executor-demo-service"
        class="org.apache.dubbo.config.spring.isolation.spring.support.DemoServiceExecutor"/>
  <bean id="executor-hello-service"
        class="org.apache.dubbo.config.spring.isolation.spring.support.HelloServiceExecutor"/>

  <!-- this service use [executor="executor-demo-service"] as isolated thread pool-->
  <dubbo:service executor="executor-demo-service"
                 interface="org.apache.dubbo.config.spring.api.DemoService" version="1.0.0" group="Group1"
                 timeout="3000" ref="demoServiceV1" registry="registry1" protocol="dubbo,tri"/>

  <!-- this service use [executor="executor-hello-service"] as isolated thread pool-->
  <dubbo:service executor="executor-hello-service"
                 interface="org.apache.dubbo.config.spring.api.HelloService" version="2.0.0" group="Group2"
                 timeout="5000" ref="helloServiceV2" registry="registry1" protocol="dubbo,tri"/>

  <!-- not set executor for this service, the default executor built using threadpool parameter of the protocolConfig -->
  <dubbo:service interface="org.apache.dubbo.config.spring.api.HelloService" version="3.0.0" group="Group3"
                 timeout="5000" ref="helloServiceV3" registry="registry1" protocol="dubbo,tri"/>

</beans>
```
#### Annotation
```java
@Configuration
@EnableDubbo(scanBasePackages = "org.apache.dubbo.config.spring.isolation.spring.annotation.provider")
public class ProviderConfiguration {
    @Bean
    public RegistryConfig registryConfig() {
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress("zookeeper://127.0.0.1:2181");
        return registryConfig;
    }

    // NOTE: we need config executor-management-mode="isolation"
    @Bean
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig("provider-app");

        applicationConfig.setExecutorManagementMode("isolation");
        return applicationConfig;
    }

    // expose services with dubbo protocol
    @Bean
    public ProtocolConfig dubbo() {
        ProtocolConfig protocolConfig = new ProtocolConfig("dubbo");
        return protocolConfig;
    }

    // expose services with tri protocol
    @Bean
    public ProtocolConfig tri() {
        ProtocolConfig protocolConfig = new ProtocolConfig("tri");
        return protocolConfig;
    }

    // customized thread pool
    @Bean("executor-demo-service")
    public Executor demoServiceExecutor() {
        return new DemoServiceExecutor();
    }

    // customized thread pool
    @Bean("executor-hello-service")
    public Executor helloServiceExecutor() {
        return new HelloServiceExecutor();
    }
}
```
```java
// custom thread pool
public class DemoServiceExecutor extends ThreadPoolExecutor {
    public DemoServiceExecutor() {
        super(10, 10, 60, TimeUnit.SECONDS, new LinkedBlockingDeque<>(),
            new NamedThreadFactory("DemoServiceExecutor"));
    }
}
```

```java
// custom thread pool
public class HelloServiceExecutor extends ThreadPoolExecutor {
    public HelloServiceExecutor() {
        super(100, 100, 60, TimeUnit.SECONDS, new LinkedBlockingDeque<>(),
            new NamedThreadFactory("HelloServiceExecutor"));
    }
}
```
```java
// "executor-hello-service" is beanName
@DubboService(executor = "executor-demo-service", version = "1.0.0", group = "Group1")
public class DemoServiceImplV1 implements DemoService {

  @Override
  public String sayName(String name) {
    return "server name";
  }

  @Override
  public Box getBox() {
    return null;
  }
}

```

```java
// not set executor for this service, the default executor built using threadpool parameter of the protocolConfig
@DubboService(version = "3.0.0", group = "Group3")
public class HelloServiceImplV2 implements HelloService {
    private static final Logger logger = LoggerFactory.getLogger(HelloServiceImplV2.class);

    @Override
    public String sayHello(String name) {
        return "server hello";
    }
}

```

```java
@DubboService(executor = "executor-hello-service", version = "2.0.0", group = "Group2")
public class HelloServiceImplV3 implements HelloService {
    private static final Logger logger = LoggerFactory.getLogger(HelloServiceImplV3.class);

    @Override
    public String sayHello(String name) {
        return "server hello";
    }
}
```



## Thread Pool Status Export
Dubbo automatically exports thread stacks through Jstack to preserve the scene for troubleshooting.

Default strategy

* Export path: user.home identifies the user's home directory
* Export interval: the shortest interval allows exports every 10 minutes
* Export switch: defaults to open

When the business thread pool is full, we need to know what resources and conditions the threads are waiting for to find bottlenecks or exceptions in the system.

#### Export Switch Control
```properties
# dubbo.properties
dubbo.application.dump.enable=true
```
```xml
<dubbo:application name="demo-provider" dump-enable="false"/>
```

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
    dump-enable: false
```



#### Export Path

```properties
# dubbo.properties
dubbo.application.dump.directory=/tmp
```

```xml
<dubbo:application name="demo-provider" dump-directory="/tmp"/>
```

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
    dump-directory: /tmp
```
