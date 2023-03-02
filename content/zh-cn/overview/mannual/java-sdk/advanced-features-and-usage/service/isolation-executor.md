---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/isolation-executor/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/isolation-executor/
description: 提供一种新的线程池管理方式，用于隔离服务之间的线程池
linkTitle: 线程池隔离
title: 线程池隔离
type: docs
weight: 4
---






## 特性说明
一种新的线程池管理方式，使得提供者应用内各个服务的线程池隔离开来，互相独立，某个服务的线程池资源耗尽不会影响其他正常服务。支持线程池可配置化，由用户手动指定。

## 使用场景
使用线程池隔离来确保 Dubbo 用于调用远程方法的线程与微服务用于执行其任务的线程是分开的。可以通过防止线程阻塞或相互竞争来帮助提高系统的性能和稳定性。


## 使用方式

目前可以以 API、XML、Annotation 的方式进行配置

**配置参数**
- `ApplicationConfig` 新增 `String executor-management-mode` 参数，配置值为 `default` 和 `isolation` ，默认为 `default`。
    - `executor-management-mode = default` 使用原有 **以协议端口为粒度、服务间共享** 的线程池管理方式
    - `executor-management-mode = isolation` 使用新增的 **以服务三元组为粒度、服务间隔离** 的线程池管理方式
- `ServiceConfig` 新增 `Executor executor` 参数，**用以服务间隔离的线程池**，可以由用户配置化、提供自己想要的线程池，若没有指定，则会根据协议配置(`ProtocolConfig`)信息构建默认的线程池用以服务隔离。

> `ServiceConfig` 新增 `Executor executor` 配置参数只有指定`executor-management-mode = isolation` 才生效。
### API
```java
    public void test() {
        // provider app
        DubboBootstrap providerBootstrap = DubboBootstrap.newInstance();

        ServiceConfig serviceConfig1 = new ServiceConfig();
        serviceConfig1.setInterface(DemoService.class);
        serviceConfig1.setRef(new DemoServiceImpl());
        serviceConfig1.setVersion(version1);
        // set executor1 for serviceConfig1, max threads is 10
        NamedThreadFactory threadFactory1 = new NamedThreadFactory("DemoService-executor");
        ExecutorService executor1 = Executors.newFixedThreadPool(10, threadFactory1);
        serviceConfig1.setExecutor(executor1);

        ServiceConfig serviceConfig2 = new ServiceConfig();
        serviceConfig2.setInterface(HelloService.class);
        serviceConfig2.setRef(new HelloServiceImpl());
        serviceConfig2.setVersion(version2);
        // set executor2 for serviceConfig2, max threads is 100
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
        super(10, 10, 60, TimeUnit.SECONDS, new LinkedBlockingDeque<>(),
            new NamedThreadFactory("DemoServiceExecutor"));
    }
}
```

```java
// customized thread pool
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