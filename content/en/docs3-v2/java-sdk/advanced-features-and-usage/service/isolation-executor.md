---
type: docs
linkTitle: "Thread Pool Isolation"
title: "Thread Pool Isolation"
weight: 4
description: "Provide a new thread pool management method for isolating thread pools between services"
---

## Feature description
A new thread pool management method enables the thread pools of each service in the provider application to be isolated and independent from each other. The exhaustion of the thread pool resources of a certain service will not affect other normal services. Support thread pool configurable, manually specified by the user.

## scenes to be used

## How to use

Currently, it can be configured in the form of API, XML, and Annotation

**Configuration parameters**
- `ApplicationConfig` adds `String executor-management-mode` parameter, the configuration values are `default` and `isolation`, and the default is `default`.
  - `executor-management-mode = default` use the original **thread pool management mode with the protocol port as the granularity and sharing between services**
  - `executor-management-mode = isolation` uses the newly added thread pool management method with **service triplet as granularity and isolation between services**
- `ServiceConfig` adds `Executor executor` parameter, **thread pool for isolation between services**, can be configured by the user to provide the thread pool you want, if not specified, it will be configured according to the protocol (` ProtocolConfig`) information to build a default thread pool for service isolation.

> `ServiceConfig` adds the `Executor executor` configuration parameter to take effect only if `executor-management-mode = isolation` is specified.
### APIs
```java
    public void test() {
        // provider app
        DubboBootstrap providerBootstrap = DubboBootstrap. newInstance();

        ServiceConfig serviceConfig1 = new ServiceConfig();
        serviceConfig1.setInterface(DemoService.class);
        serviceConfig1.setRef(new DemoServiceImpl());
        serviceConfig1.setVersion(version1);
        // set executor1 for serviceConfig1, max threads is 10
        NamedThreadFactory threadFactory1 = new NamedThreadFactory("DemoService-executor");
        ExecutorService executor1 = Executors. newFixedThreadPool(10, threadFactory1);
        serviceConfig1.setExecutor(executor1);

        ServiceConfig serviceConfig2 = new ServiceConfig();
        serviceConfig2.setInterface(HelloService.class);
        serviceConfig2.setRef(new HelloServiceImpl());
        serviceConfig2.setVersion(version2);
        // set executor2 for serviceConfig2, max threads is 100
        NamedThreadFactory threadFactory2 = new NamedThreadFactory("HelloService-executor");
        ExecutorService executor2 = Executors. newFixedThreadPool(100, threadFactory2);
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

### XML
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
### Annotation
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
// customized thread pool
public class DemoServiceExecutor extends ThreadPoolExecutor {
    public DemoServiceExecutor() {
        super(10, 10, 60, TimeUnit. SECONDS, new LinkedBlockingDeque<>(),
            new NamedThreadFactory("DemoServiceExecutor"));
    }
}
```

```java
// customized thread pool
public class HelloServiceExecutor extends ThreadPoolExecutor {
    public HelloServiceExecutor() {
        super(100, 100, 60, TimeUnit. SECONDS, new LinkedBlockingDeque<>(),
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