# Use Annotations In Dubbo

With the widely promotion and implementation of Microservices Architecture, the Microservices Architecture represented by Spring Boot and Spring Cloud, in Java ecosystem, introduced some brand new programming model, like:
 - Annotation-Driven
 - External Configuration
 - Auto-Configure

New programming model have some advantages, for example, it does not require `XML` configuration, it can simplify deployment process, beyond that，it can promote development efficiency. In order to implement the microservice architecture better，Dubbo has provided more perfect support for the above three scenarios since version 2.5.8. This article focuses on introduce annotations rather than discuss the traditional XML configuration approach. There are two kinds of automatic assembly, external configuration and automatic assembly, will be introduced in another aricle.


## Introduce Annotations

### @EnableDubbo
The annotations of `@EnableDubbo` is a combination of both `@EnableDubboConfig` and `@DubboComponentScan`.Related to the annotation driver is  `@DubboComponentScan`.

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

The `@bableDubbo` can be used to scan Dubbo's service provider (marked by `@Service`) and Dubbo's service consumer (marked by `Reference`) under the specified package name (via `scanBasePackages`) or in the specified class (via `scanBasePackageClasses`). After Dubbo's service providers and consumers have been scanned,  they have been assembled corresponding and been initialized, and finally the service is exposed or referenced, if you do not use `External Configuration`, you can use `@DubboComponentScan` directly.

### @Service

`@service` is used to configure Dubbo's Service provider,for example:

```java
@Service
public class AnnotatedGreetingService implements GreetingService {
    public String sayHello(String name) {
        return "hello, " + name;
    }
}
```

Via `@Service`'s properties, you can customize Dubbo's Service provider:

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

Which is more important:
1. **@Service**:        Can only be defined on a class, represent a service
2. **interfaceClass**: specified `interface`'s class implemented by the service provider
3. **interfaceName**: specified `interface`'s class name implemented by the service provider
4. **version**: specified the version number of the service
5. **group**:specified the group of services
6. **export**:whether to expose service
7. **registry**:Whether to register service to the registry
8. **application**:application configuration
9. **module**:module configuration
10. **provider**:service provider configuration
11. **protocol**:protocol configuration
12. **monitor**:monitoring center configuration
13. **registr**:registry configuration

In addition, it should be noted that, `application`, `module`, `provider`, `protocol`, `monitor`, `registry` (from 8 to 13) need to provide the name of the corresponding `spring bean`,These bean assembly completed either through traditional XML configuration,or by the modern Java Config. This article will show you how to use `Java Config`.

### @Reference

`@Reference` is used to configure Dubbo's Service consumer,for example:

```Java
@Component
public class GreetingServiceConsumer {
    @Reference
    private GreetingService greetingService;

    public String doSayHello(String name) {
        return greetingService.sayHello(name);
    }
}
```

Via `@Reference`'s properties, you can customize Dubbo's Service consumer:

```Java
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

Which is more important:

1. **@Reference**:you can define it on a field in a class, you can define it on a method, you can even modify another annotation, it represent a reference to a service.Normally `@Reference` is defined in one field
2. **interfaceClass** : specified `interface`'s class implemented by the service provider
3. **interfaceName**: specified `interface`'s class name implemented by the service provider
4. **version**: specified the version number of the service
5. **group**:pecified the group of services
6. **url**: invoking the registry directly by specifying the URL of the service provider
7. **application**:application configuration
8. **module**:module configuration
9. **consumer**:service consumer configuration
10. **protocol**:protocol configuration
11. **monitor**:monitoring center configuration
12. **registr**:registry configuration

In addition, it should be noted that, `application`, `module`, `consumer`, `protocol`, `monitor`, `registry` (from 7 to 12) need to provide the name of the corresponding `spring bean`,These bean assembly completed either through traditional XML configuration,or by the modern Java Config. This article will show you how to use `Java Config`.

## Example practice

After learn what `@EnableDubbo`, `@Service`, `@Reference` is, there is a practical example showing how to use the annotation to develop a Dubbo application.The following code can be found at https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-annotation

### 1.Interface Definition

Define a simple `GreetingService` interface with only a simple method `sayHello` to the caller.
```Java
public interface GreetingService {
    String sayHello(String name);
}
```

### 2.Server:Service Implementation

Implement the `GreetingService` interface, and mark it as a service for Dubbo via @Service.

```Java
@Service
public class AnnotatedGreetingService implements GreetingService {
    public String sayHello(String name) {
        return "hello, " + name;
    }
}
```

### 3.Server:Assembly Service Provider

You can discover, assemble, and provide Dubbo's services through the Java config technology (@Configuration) and annotation scan (@EnableDubbo) in Spring.

```Java
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

Description：
 - Scan all classes marked with `@Service` under `com.alibaba.dubbo.samples.impl` with `@EnableDubbo`
 - Via @Configuration, all @Beans in the ProviderConfiguration are assembled using the way of `Java Config` and then injected into the Dubbo service, which means the class marked with `@Service`.Which included:
i. **ProviderConfig**:Service provider configuration
ii. **ApplicationConfig**:Application configuration
iii.**RegistryConfig**:registry configuration
iv. **ProtocolConfig**:Protocol configuration
  
 ### 4.Server:Start Service
 
In the `main` method to provide external `Dubbo` service by starting a `Spring Context`. 

```Java
public class ProviderBootstrap {
    public static void main(String[] args) throws Exception {
        new EmbeddedZooKeeper(2181, false).start(); // #1
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ProviderConfiguration.class); // #2
        context.start(); // #3
        System.in.read(); // #4
    }
}
```

Description：
1. Start an embedded `zookeeper` and provide service registry on port `2181`
2. Initialize an example of an AnnotationConfigApplicationContext and pass the `ProviderConfiguration` into the example to complete the automatic discovery and assembly of the `Dubbo` service.
3. Start the `Spring Context` and start providing external `Dubbo` services.
4. Because it is a server, you need to prevent the process exit by blocking the main thread.

Start the `main` method of the server, you will see the following output, on behalf of the server startup success, and registered the `GreetingService` service in the `ZookeeperRegistry`:
```sh
[01/08/18 02:12:51:051 CST] main  INFO transport.AbstractServer:  [DUBBO] Start NettyServer bind /0.0.0.0:20880, export /192.168.99.1:20880, dubbo version: 2.6.2, current host: 192.168.99.1

[01/08/18 02:12:51:051 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Register: dubbo://192.168.99.1:20880/com.alibaba.dubbo.samples.api.GreetingService?anyhost=true&application=dubbo-annotation-provider&default.timeout=1000&dubbo=2.6.2&generic=false&interface=com.alibaba.dubbo.samples.api
```

### 5.Server:Reference Service

Marking the member variable of the `GreetingService` via `@Reference` .The `greetingService` is a reference to the `Dubbo` service, which means that it can simply provide through the interface to the remote party to initiate service calls, and the client does not implement `GreetingService` interface.

```Java
@Component("annotatedConsumer")
public class GreetingServiceConsumer {
    @Reference
    private GreetingService greetingService;

    public String doSayHello(String name) {
        return greetingService.sayHello(name);
    }
}
```

### 6.Server:Assembly Service consumer

Just like  **3. Server:Assembly Service Provider** You can discover, assemble, and provide Dubbo's service consumer through the Java config technology (@Configuration) and annotation scan (@EnableDubbo) in Spring.

```Java
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

Description：
 - Scan all classes marked with `@Service` under `com.alibaba.dubbo.samples.impl` with `@Reference`
 - Via @Configuration, all @Beans in the ProviderConfiguration are assembled using the way of `Java Config` and then injected into the Dubbo service, which means the class marked with `@Reference`.Which included:
i. `ApplicationConfig`: Application configuration
ii. `ConsumerConfig`:Service consumer configuration
iii.`RegistryConfig`:Registry configuration.Note:The configuration here needs to be consistent with the configuration information of the EmbeddedZooKeeper when started by the service provider.

### 7.Server: Initiate Remote Calls

In the `main` method, you can start a `Spring Context` to find the service consumer of the assembled `Dubbo` from it, and initiate a remote call.

```Java
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

Description：
 - Initialize an example of an AnnotationConfigApplicationContext and pass the `ProviderConfiguration` into the example to complete the automatic discovery and assembly of the `Dubbo` service consumer.
 - start `Spring Context`.
 - Find `bean` which type is `GreetingServiceConsumer` from `Context`.
 - Call the `doSayHello` method and finally initiate a remote call via Dubbo's service reference (marked by @Reference)
 - Print call result
Start the Server's `main` method, you will see the following output, which returns the `result`:  hello, annotation:

```sh
[01/08/18 02:38:40:040 CST] main  INFO config.AbstractConfig:  [DUBBO] Refer dubbo service com.alibaba.dubbo.samples.api.GreetingService from url zookeeper://localhost:2181/com.alibaba.dubbo.registry.RegistryService?anyhost=true&application=dubbo-annotation-consumer&check=false&default.timeout=3000&dubbo=2.6.2&generic=false&interface=com.alibaba.dubbo.samples.api.GreetingService&methods=sayHello&pid=33001&register.ip=192.168.99.1&remote.timestamp=1533105502086&side=consumer&timestamp=1533105519216, dubbo version: 2.6.2, current host: 192.168.99.1
[01/08/18 02:38:40:040 CST] main  INFO annotation.ReferenceBeanBuilder: <dubbo:reference object="com.alibaba.dubbo.common.bytecode.proxy0@673be18f" singleton="true" interface="com.alibaba.dubbo.samples.api.GreetingService" uniqueServiceName="com.alibaba.dubbo.samples.api.GreetingService" generic="false" id="com.alibaba.dubbo.samples.api.GreetingService" /> has been built.
result: hello, annotation
```

## Conclusion

By studying this article, the reader can master the basic concepts of `Dubbo`'s exclusive `annotations` , `@EnableDubbo`, `@Service`, `@Reference`, and master it's basic usage through a simple `Dubbo` application.

In addition to traditional `XML` configuration, `Spring` offers more modern configurations such as annotation drivers, externalization, and auto-assembly.This article focuses on the development of `Dubbo` applications through annotations. You can be seen that annotation mode programming is more concise and simple than XML configuration. In future, we will introduce the use of externalization configuration and automatic assembly in `Dubbo`  further.
