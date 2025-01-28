---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/performance/threading-model/consumer/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/performance/threading-model/consumer/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/performance/threading-model/consumer/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/performance/threading-model/
description: Dubbo 消费端线程池模型用法
linkTitle: 线程模型
title: 消费端线程模型，提供者端线程模型
type: docs
weight: 2
---

## 消费端线程模型

对 2.7.5 版本之前的 Dubbo 应用，尤其是一些消费端应用，当面临需要消费大量服务且并发数比较大的大流量场景时（典型如网关类场景），经常会出现消费端线程数分配过多的问题，具体问题讨论可参见 [Need a limited Threadpool in consumer side #2013](https://github.com/apache/dubbo/issues/2013)

改进后的消费端线程池模型，通过复用业务端被阻塞的线程，很好的解决了这个问题。

**老的线程池模型**

![消费端线程池.png](/imgs/user/consumer-threadpool0.png)

我们重点关注 Consumer 部分：

1. 业务线程发出请求，拿到一个 Future 实例。
2. 业务线程紧接着调用 future.get 阻塞等待业务结果返回。
3. 当业务数据返回后，交由独立的 Consumer 端线程池进行反序列化等处理，并调用 future.set 将反序列化后的业务结果置回。
4. 业务线程拿到结果直接返回

**当前线程池模型**

![消费端线程池新.png](/imgs/user/consumer-threadpool1.png)

1. 业务线程发出请求，拿到一个 Future 实例。
2. 在调用 future.get() 之前，先调用 ThreadlessExecutor.wait()，wait 会使业务线程在一个阻塞队列上等待，直到队列中被加入元素。
3. 当业务数据返回后，生成一个 Runnable Task 并放入 ThreadlessExecutor 队列
4. 业务线程将 Task 取出并在本线程中执行：反序列化业务数据并 set 到 Future。
5. 业务线程拿到结果直接返回

这样，相比于老的线程池模型，由业务线程自己负责监测并解析返回结果，免去了额外的消费端线程池开销。

## 提供端线程模型
Dubbo协议的和Triple协议目前的线程模型还并没有对齐，下面分开介绍Triple协议和Dubbo协议的线程模型。

### Dubbo协议

介绍Dubbo协议的Provider端线程模型之前，先介绍Dubbo对channel上的操作抽象成了五种行为：

- 建立连接：connected，主要是的职责是在channel记录read、write的次数，以及处理建立连接后的回调逻辑，比如dubbo支持在断开后自定义回调的hook（onconnect），即在该操作中执行。
- 断开连接：disconnected，主要是的职责是在channel移除read、write的时间，以及处理断开连接后的回调逻辑，比如dubbo支持在断开后自定义回调的hook（ondisconnect），即在该操作中执行。
- 发送消息：sent，包括发送请求和发送响应。记录write的时间。
- 接收消息：received，包括接收请求和接收响应。记录read的时间。
- 异常捕获：caught，用于处理在channel上发生的各类异常。

Dubbo框架的线程模型与以上这五种行为息息相关，Dubbo协议Provider线程模型可以分为五类，也就是AllDispatcher、DirectDispatcher、MessageOnlyDispatcher、ExecutionDispatcher、ConnectionOrderedDispatcher。

#### 配置方式
| 线程模型  | 配置值 |
| ---- | -- |
All Dispatcher | all
Direct Dispatcher | direct
Execution Dispatcher | execution
Message Only Dispatcher | message
Connection Ordered Dispatcher | connection

拿 application.yaml 的配置方式举例：在protocol下配置dispatcher: all，即可把dubbo协议的线程模型调整为All Dispatcher

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

下图是All Dispatcher的线程模型说明图：

![dubbo-provider-alldispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-alldispatcher.png)

- 在IO线程中执行的操作有：
  1. sent操作在IO线程上执行。
  2. 序列化响应在IO线程上执行。
- 在Dubbo线程中执行的操作有：
  1. received、connected、disconnected、caught都是在Dubbo线程上执行的。
  2. 反序列化请求的行为在Dubbo中做的。

#### Direct Dispatcher

下图是Direct Dispatcher的线程模型说明图：

![dubbo-provider-directDispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-directDispatcher.png)

- 在IO线程中执行的操作有：
  1. received、connected、disconnected、caught、sent操作在IO线程上执行。
  2. 反序列化请求和序列化响应在IO线程上执行。
- 1. 并没有在Dubbo线程操作的行为。

#### Execution Dispatcher

下图是Execution Dispatcher的线程模型说明图：

![dubbo-provider-ExecutionDispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-executionDispatcher.png)

- 在IO线程中执行的操作有：
  1. sent、connected、disconnected、caught操作在IO线程上执行。
  2. 序列化响应在IO线程上执行。
- 在Dubbo线程中执行的操作有：
  1. received都是在Dubbo线程上执行的。
  2. 反序列化请求的行为在Dubbo中做的。

#### Message Only Dispatcher

在Provider端，Message Only Dispatcher和Execution Dispatcher的线程模型是一致的，所以下图和Execution Dispatcher的图一致，区别在Consumer端。见下方Consumer端的线程模型。

下图是Message Only Dispatcher的线程模型说明图：

![dubbo-provider-ExecutionDispatcher](/imgs/v3/feature/performance/threading-model/dubbo-provider-executionDispatcher.png)

- 在IO线程中执行的操作有：
  1. sent、connected、disconnected、caught操作在IO线程上执行。
  2. 序列化响应在IO线程上执行。
- 在Dubbo线程中执行的操作有：
  1. received都是在Dubbo线程上执行的。
  2. 反序列化请求的行为在Dubbo中做的。

#### Connection Ordered Dispatcher

下图是Connection Ordered Dispatcher的线程模型说明图：

![dubbbo-provider-connectionOrderedDispatcher](/imgs/v3/feature/performance/threading-model/dubbbo-provider-connectionOrderedDispatcher.png)

- 在IO线程中执行的操作有：
  1. sent操作在IO线程上执行。
  2. 序列化响应在IO线程上执行。
- 在Dubbo线程中执行的操作有：
  1. received、connected、disconnected、caught都是在Dubbo线程上执行的。但是connected和disconnected两个行为是与其他两个行为通过线程池隔离开的。并且在Dubbo connected thread pool中提供了链接限制、告警灯能力。
  2. 反序列化请求的行为在Dubbo中做的。


### Triple协议

下图为Triple协议 Provider端的线程模型

![triple-provider](/imgs/v3/feature/performance/threading-model/triple-provider.png)

Triple协议Provider线程模型目前还比较简单，目前序列化和反序列化操作都在Dubbo线程上工作，而IO线程并没有承载这些工作。


## 线程池隔离
一种新的线程池管理方式，使得提供者应用内各个服务的线程池隔离开来，互相独立，某个服务的线程池资源耗尽不会影响其他正常服务。支持线程池可配置化，由用户手动指定。

使用线程池隔离来确保 Dubbo 用于调用远程方法的线程与微服务用于执行其任务的线程是分开的。可以通过防止线程阻塞或相互竞争来帮助提高系统的性能和稳定性。

目前可以以 API、XML、Annotation 的方式进行配置

**配置参数**
- `ApplicationConfig` 新增 `String executor-management-mode` 参数，配置值为 `default` 和 `isolation` ，默认为 `default`。
    - `executor-management-mode = default` 使用原有 **以协议端口为粒度、服务间共享** 的线程池管理方式
    - `executor-management-mode = isolation` 使用新增的 **以服务三元组为粒度、服务间隔离** 的线程池管理方式
- `ServiceConfig` 新增 `Executor executor` 参数，**用以服务间隔离的线程池**，可以由用户配置化、提供自己想要的线程池，若没有指定，则会根据协议配置(`ProtocolConfig`)信息构建默认的线程池用以服务隔离。

> `ServiceConfig` 新增 `Executor executor` 配置参数只有指定`executor-management-mode = isolation` 才生效。
#### API
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



## 线程池状态导出
dubbo 通过 Jstack 自动导出线程堆栈来保留现场，方便排查问题。

默认策略

* 导出路径: user.home标识的用户主目录
* 导出间隔: 最短间隔允许每隔10分钟导出一次
* 导出开关: 默认打开

当业务线程池满时，我们需要知道线程都在等待哪些资源、条件，以找到系统的瓶颈点或异常点。

#### 导出开关控制
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



#### 导出路径

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
