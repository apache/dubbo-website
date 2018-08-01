# 在 Dubbo 中使用注解

随着微服务架构的广泛地推广和实施。在 Java 生态系统中，以 Spring Boot 和 Spring Cloud 为代表的微服务框架，引入了全新的编程模型，包括：

* 注解驱动（Annotation-Driven）
* 外部化配置（External Configuration）
* 以及自动装配（Auto-Configure）

新的编程模型无需 XML 配置、简化部署、提升开发效率。为了更好地实践微服务架构，Dubbo 从 `2.5.8` 版本开始， 分别针对了上述的三个场景，提供了更完善的支持。本文不讨论传统的 XML 配置方式，而是侧重介绍注解这种方式。外部配置、自动装配两种自动装配会在另外的文章中专门介绍。

## 注解介绍
### @EnableDubbo

`@EnableDubbo` 注解是 `@EnableDubboConfig` 和 `@DubboComponentScan`两者组合的便捷表达方式。与注解驱动相关的是 `@DubboComponentScan`。

```java
package org.apache.dubbo.config.spring.context.annotation;

@EnableDubboConfig
@DubboComponentScan
public @interface EnableDubbo {
    /**
     * Base packages to scan for annotated @Service classes.
     * <p>
     * Use {@link #scanBasePackageClasses()} for a type-safe alternative to String-based
     * package names.
     *
     * @return the base packages to scan
     * @see DubboComponentScan#basePackages()
     */
    @AliasFor(annotation = DubboComponentScan.class, attribute = "basePackages")
    String[] scanBasePackages() default {};

    /**
     * Type-safe alternative to {@link #scanBasePackages()} for specifying the packages to
     * scan for annotated @Service classes. The package of each class specified will be
     * scanned.
     *
     * @return classes from the base packages to scan
     * @see DubboComponentScan#basePackageClasses
     */
    @AliasFor(annotation = DubboComponentScan.class, attribute = "basePackageClasses")
    Class<?>[] scanBasePackageClasses() default {};    
}
```

通过 `@EnableDubbo` 可以在指定的包名下（通过 `scanBasePackages`），或者指定的类中（通过 `scanBasePackageClasses`）扫描 Dubbo 的服务提供者（以 `@Service` 标注）以及 Dubbo 的服务消费者（以 `Reference` 标注）。

扫描到 Dubbo 的服务提供方和消费者之后，对其做相应的组装并初始化，并最终完成服务暴露或者引用的工作。

当然，如果不使用外部化配置（External Configuration）的话，也可以直接使用 `@DubboComponentScan`。

### @Service

`@Service` 用来配置 Dubbo 的服务提供方，比如：

```java
@Service
public class AnnotatedGreetingService implements GreetingService {
    public String sayHello(String name) {
        return "hello, " + name;
    }
}
```

通过 `@Service` 上提供的属性，可以进一步的定制化 Dubbo 的服务提供方：

```java
package org.apache.dubbo.config.annotation;

@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE}) // #1
@Inherited
public @interface Service {
    Class<?> interfaceClass() default void.class; // #2
    String interfaceName() default ""; // #3
    String version() default ""; // #4
    String group() default ""; // #5
    boolean export() default true; // #6
    boolean register() default true; // #7
    
    String application() default ""; // #8
    String module() default ""; // #9
    String provider() default ""; // #10
    String[] protocol() default {}; // #11
    String monitor() default ""; // #12
    String[] registry() default {}; // #13
}
```

其中比较重要的有：

1. @Service 只能定义在一个类上，表示一个服务的具体实现
1. interfaceClass：指定服务提供方实现的 interface 的类
1. interfaceName：指定服务提供方实现的 interface 的类名
1. version：指定服务的版本号
1. group：指定服务的分组
1. export：是否暴露服务
1. registry：是否向注册中心注册服务
1. application：应用配置
1. module：模块配置
1. provider：服务提供方配置
1. protocol：协议配置
1. monitor：监控中心配置
2. registry：注册中心配置

另外，需要注意的是，application、module、provider、protocol、monitor、registry（从 8 到 13）需要提供的是对应的 spring bean 的名字，而这些 bean 的组装要么通过传统的 XML 配置方式完成，要么通过现代的 Java Config 来完成。在本文中，将会展示 Java Config 的使用方式。

### @Reference

`@Reference` 用来配置 Dubbo 的服务消费方，比如：

```java
@Component
public class GreetingServiceConsumer {
    @Reference
    private GreetingService greetingService;

    public String doSayHello(String name) {
        return greetingService.sayHello(name);
    }
}
```

通过 `@Reference` 上提供的属性，可以进一步的定制化 Dubbo 的服务消费方：

```java
package org.apache.dubbo.config.annotation;

@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.ANNOTATION_TYPE}) // #1
public @interface Reference {
    Class<?> interfaceClass() default void.class; // #2
    String interfaceName() default ""; // #3
    String version() default ""; // #4
    String group() default ""; // #5
    String url() default ""; // #6
    
    String application() default ""; // #7
    String module() default ""; // #8
    String consumer() default ""; // #9
    String protocol() default ""; // #10
    String monitor() default ""; // #11
    String[] registry() default {}; // #12
}
```

其中比较重要的有：

1. @Reference 可以定义在类中的一个字段上，也可以定义在一个方法上，甚至可以用来修饰另一个 annotation，表示一个服务的引用。通常 @Reference 定义在一个字段上
2. interfaceClass：指定服务的 interface 的类
3. interfaceName：指定服务的 interface 的类名
4. version：指定服务的版本号
5. group：指定服务的分组
6. url：通过指定服务提供方的 URL 地址直接绕过注册中心发起调用
7. application：应用配置
8. module：模块配置
9. consumer：服务消费方配置
10. protocol：协议配置
11. monitor：监控中心配置
12. registry：注册中心配置

另外，需要注意的是，application、module、consumer、protocol、monitor、registry（从 7 到 12）需要提供的是对应的 spring bean 的名字，而这些 bean 的组装要么通过传统的 XML 配置方式完成，要么通过现代的 Java Config 来完成。在本文中，将会展示 Java Config 的使用方式。

## 示例实战

了解了 `@EnableDubbo`， `@Service`，`@Reference` 的作用，下面以一个实际的例子来展示如何使用 annotation 来开发 Dubbo 应用。以下的代码可以在 https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-annotation 中找到。

### 1. 接口定义

定义一个简单的 `GreetingService` 接口，里面只有一个简单的方法 `sayHello` 向调用者问好。

```java
public interface GreetingService {
    String sayHello(String name);
}
```

### 2. 服务端：服务实现

实现 `GreetingService` 接口，并通过 `@Service` 来标注其为 Dubbo 的一个服务。

```java
@Service
public class AnnotatedGreetingService implements GreetingService {
    public String sayHello(String name) {
        return "hello, " + name;
    }
}
```

### 3. 服务端：组装服务提供方

通过 Spring 中 Java Config 的技术（`@Configuration`）和 annotation 扫描（`@EnableDubbo`）来发现、组装、并向外提供 Dubbo 的服务。

```java
@Configuration
@EnableDubbo(scanBasePackages = "com.alibaba.dubbo.samples.impl")
static class ProviderConfiguration {
    @Bean // #1
    public ProviderConfig providerConfig() {
        ProviderConfig providerConfig = new ProviderConfig();
        providerConfig.setTimeout(1000);
        return providerConfig;
    }

    @Bean // #2
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("dubbo-annotation-provider");
        return applicationConfig;
    }

    @Bean // #3
    public RegistryConfig registryConfig() {
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setProtocol("zookeeper");
        registryConfig.setAddress("localhost");
        registryConfig.setPort(2181);
        return registryConfig;
    }

    @Bean // #4
    public ProtocolConfig protocolConfig() {
        ProtocolConfig protocolConfig = new ProtocolConfig();
        protocolConfig.setName("dubbo");
        protocolConfig.setPort(20880);
        return protocolConfig;
    }
}
```

说明：

* 通过 `@EnableDubbo` 指定在 `com.alibaba.dubbo.samples.impl` 下扫描所有标注有 `@Service` 的类
* 通过 `@Configuration` 将 ProviderConfiguration 中所有的 `@Bean` 通过 Java Config 的方式组装出来并注入给 Dubbo 服务，也就是标注有 `@Service` 的类。这其中就包括了：

  1. ProviderConfig：服务提供方配置
  2. ApplicationConfig：应用配置
  3. RegistryConfig：注册中心配置
  4. ProtocolConfig：协议配置


### 4. 服务端：启动服务 

在 `main` 方法中通过启动一个 Spring Context 来对外提供 Dubbo 服务。

```java
public class ProviderBootstrap {
    public static void main(String[] args) throws Exception {
        new EmbeddedZooKeeper(2181, false).start(); // #1
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ProviderConfiguration.class); // #2
        context.start(); // #3
        System.in.read(); // #4
    }
}
```

说明：

1. 启动一个嵌入式的 zookeeper 在 2181 端口上提供注册中心的服务
2. 初始化一个 `AnnotationConfigApplicationContext` 的示例，并将 `ProviderConfiguration` 传入以完成 Dubbo 服务的自动发现和装配
3. 启动 Spring Context，开始提供对外的 Dubbo 服务
4. 因为是服务端，需要通过阻塞主线程来防止进程退出



启动服务端的 `main` 方法，将会看到下面的输出，代表服务端启动成功，并在注册中心（ZookeeperRegistry）上注册了 `GreetingService` 这个服务：

```sh
[01/08/18 02:12:51:051 CST] main  INFO transport.AbstractServer:  [DUBBO] Start NettyServer bind /0.0.0.0:20880, export /192.168.99.1:20880, dubbo version: 2.6.2, current host: 192.168.99.1

[01/08/18 02:12:51:051 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Register: dubbo://192.168.99.1:20880/com.alibaba.dubbo.samples.api.GreetingService?anyhost=true&application=dubbo-annotation-provider&default.timeout=1000&dubbo=2.6.2&generic=false&interface=com.alibaba.dubbo.samples.api
```

### 5. 客户端：引用服务

通过 `@Reference` 来标记 `GreetingService` 接口的成员变量 greetingService 是一个 Dubbo 服务的引用，也就是说，可以简单的通过该接口向远端的服务提供方发起调用，而客户端并没有实现 `GreetingService` 接口。

```java
@Component("annotatedConsumer")
public class GreetingServiceConsumer {
    @Reference
    private GreetingService greetingService;

    public String doSayHello(String name) {
        return greetingService.sayHello(name);
    }
}
```

### 6. 客户端：组装服务消费者

与 **3. 服务端：组装服务提供方** 类似，通过 Spring 中 Java Config 的技术（`@Configuration`）和 annotation 扫描（`@EnableDubbo`）来发现、组装 Dubbo 服务的消费者。

```java
@Configuration
@EnableDubbo(scanBasePackages = "com.alibaba.dubbo.samples.action")
@ComponentScan(value = {"com.alibaba.dubbo.samples.action"})
static class ConsumerConfiguration {
    @Bean // #1
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("dubbo-annotation-consumer");
        return applicationConfig;
    }

    @Bean // #2
    public ConsumerConfig consumerConfig() {
        ConsumerConfig consumerConfig = new ConsumerConfig();
        consumerConfig.setTimeout(3000);
        return consumerConfig;
    }

    @Bean // #3
    public RegistryConfig registryConfig() {
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setProtocol("zookeeper");
        registryConfig.setAddress("localhost");
        registryConfig.setPort(2181);
        return registryConfig;
    }
}
```

说明：

- 通过 `@EnableDubbo` 指定在 `com.alibaba.dubbo.samples.impl` 下扫描所有标注有 `@Reference 的类
- 通过 `@Configuration` 将 ConsumerConfiguration 中所有的 `@Bean` 通过 Java Config 的方式组装出来并注入给 Dubbo 服务消费者，也就是标注有 `@Reference 的类。这其中就包括了：
  1. ApplicationConfig：应用配置
  2. ConsumerConfig：服务消费者配置
  3. RegistryConfig：注册中心配置，注意：这里的配置需要与服务提供方启动的 EmbeddedZooKeeper 的配置信息保持一致

### 客户端：发起远程调用

在 `main` 方法中通过启动一个 Spring Context，从其中查找到组装好的 Dubbo 的服务消费者，并发起一次远程调用。

```java
public class ConsumerBootstrap {
    public static void main(String[] args) {
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ConsumerConfiguration.class); // #1
        context.start(); // #2
        GreetingServiceConsumer greetingServiceConsumer = context.getBean(GreetingServiceConsumer.class); // #3
        String hello = greetingServiceConsumer.doSayHello("annotation"); // #4
        System.out.println("result: " + hello); // #5
    }
}
```

说明：

1. 初始化一个 `AnnotationConfigApplicationContext` 的示例，并将 `ConsumerConfiguration` 传入以完成 Dubbo 服务消费者的自动发现和装配

2. 启动 Spring Context

3. 从 Context 中查找出类型为 `GreetingServiceConsumer` 的 Bean

4. 调用 `doSayHello` 方法，最终通过 Dubbo 的服务引用（由 `@Reference` 标注）发起一次远程调用

5. 打印调用结果

   

启动客户端的 `main` 方法，将会看到下面的输出，其中返回结果为 result: hello, annotation：

```sh
[01/08/18 02:38:40:040 CST] main  INFO config.AbstractConfig:  [DUBBO] Refer dubbo service com.alibaba.dubbo.samples.api.GreetingService from url zookeeper://localhost:2181/com.alibaba.dubbo.registry.RegistryService?anyhost=true&application=dubbo-annotation-consumer&check=false&default.timeout=3000&dubbo=2.6.2&generic=false&interface=com.alibaba.dubbo.samples.api.GreetingService&methods=sayHello&pid=33001&register.ip=192.168.99.1&remote.timestamp=1533105502086&side=consumer&timestamp=1533105519216, dubbo version: 2.6.2, current host: 192.168.99.1
[01/08/18 02:38:40:040 CST] main  INFO annotation.ReferenceBeanBuilder: <dubbo:reference object="com.alibaba.dubbo.common.bytecode.proxy0@673be18f" singleton="true" interface="com.alibaba.dubbo.samples.api.GreetingService" uniqueServiceName="com.alibaba.dubbo.samples.api.GreetingService" generic="false" id="com.alibaba.dubbo.samples.api.GreetingService" /> has been built.
result: hello, annotation
```



## 总结

通过本文的学习，读者可以掌握 Dubbo 专属的 annotation `@EnableDubbo`、`@Service`、`@Reference` 的基本概念，并通过一个简单 Dubbo 应用的实战开发掌握其基本的用法。

Spring 除了传统的 XML 配置之外，还提供了注解驱动、外部化配置、以及自动装配等更现代的配置方式。本文专注在介绍通过注解方式来开发 Dubbo 应用，可以看到，与 XML 配置相比，注解方式编程更加简洁明快。在今后的博文中，会进一步的介绍在 Dubbo 中使用外部化配置、以及自动装配的方法。