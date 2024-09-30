---
title: "Quick Integration of Dubbo + Hystrix in Spring Applications"
linkTitle: "Quick Integration of Dubbo + Hystrix in Spring Applications"
date: 2018-08-22
tags: ["Ecosystem", "Java"]
description: >
    This article describes how to combine Dubbo and Hystrix in a Spring application.
---


## Background

Hystrix is designed to provide more robust fault tolerance by controlling the nodes that access remote systems, services, and third-party libraries, thus providing stronger resilience against latency and failures. Hystrix includes thread and signal isolation, fallback mechanisms, circuit breaker functionality, request caching, request bundling, as well as monitoring and configuration.

Dubbo is an open-source Java RPC framework from Alibaba and is currently the most popular in China.

This article describes how to combine Dubbo and Hystrix in a Spring application.

- <https://github.com/Netflix/Hystrix>
- <https://github.com/apache/dubbo>

## Spring Boot Application

Demo address: <https://github.com/dubbo/dubbo-samples/tree/master/4-governance/dubbo-samples-spring-boot-hystrix>

### Generate a Dubbo integrated Spring Boot application

For those unfamiliar with integrating Dubbo into Spring Boot applications, you can directly generate a Dubbo + Spring Boot project here: <http://start.dubbo.io/>

### Configure spring-cloud-starter-netflix-hystrix

Spring Boot provides official integration with Hystrix. Simply add the dependency in your pom.xml:

```xml
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
            <version>1.4.4.RELEASE</version>
        </dependency>
```

Then add `@EnableHystrix` on the Application class to enable the Hystrix starter:

```java
@SpringBootApplication
@EnableHystrix
public class ProviderApplication {
```

### Configure the Provider side

Add `@HystrixCommand` configuration on the Dubbo Provider, so the calls will go through the Hystrix proxy.

```java
@Service(version = "1.0.0")
public class HelloServiceImpl implements HelloService {
    @HystrixCommand(commandProperties = {
                    @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold", value = "10"),
                    @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds", value = "2000") })
    @Override
    public String sayHello(String name) {
        // System.out.println("async provider received: " + name);
        // return "annotation: hello, " + name;
        throw new RuntimeException("Exception to show hystrix enabled.");
    }
}
```

### Configure the Consumer side

For the Consumer side, an additional method call can be added, with `@HystrixCommand` configured on the method. When a call fails, it will fall back to the `fallbackMethod = "reliable"`.

```java
    @Reference(version = "1.0.0")
    private HelloService demoService;

    @HystrixCommand(fallbackMethod = "reliable")
    public String doSayHello(String name) {
        return demoService.sayHello(name);
    }
    public String reliable(String name) {
        return "hystrix fallback value";
    }
```

With the above configuration, the integration of Dubbo + Hystrix in Spring Boot is easily completed.

## Traditional Spring Annotation Application

Demo address: <https://github.com/dubbo/dubbo-samples/tree/master/4-governance/dubbo-samples-spring-hystrix>

The configuration of a traditional Spring annotation application is also straightforward, differing from Spring Boot applications in that:

1. Explicitly configure Spring AOP support: `@EnableAspectJAutoProxy`
2. Explicitly configure the `HystrixCommandAspect` Bean via `@Configuration`.

```java
    @Configuration
    @EnableDubbo(scanBasePackages = "com.alibaba.dubbo.samples.annotation.action")
    @PropertySource("classpath:/spring/dubbo-consumer.properties")
    @ComponentScan(value = {"com.alibaba.dubbo.samples.annotation.action"})
    @EnableAspectJAutoProxy
    static public class ConsumerConfiguration {

        @Bean
        public HystrixCommandAspect hystrixCommandAspect() {
            return new HystrixCommandAspect();
        }
    }
```

## Hystrix Integration with Spring AOP Principle

In the example above, it can be seen that Hystrix integrates with Spring through Spring AOP. Let's briefly analyze the implementation.

```java
@Aspect
public class HystrixCommandAspect {
    @Pointcut("@annotation(com.netflix.hystrix.contrib.javanica.annotation.HystrixCommand)")
    public void hystrixCommandAnnotationPointcut() {
    }
    @Pointcut("@annotation(com.netflix.hystrix.contrib.javanica.annotation.HystrixCollapser)")
    public void hystrixCollapserAnnotationPointcut() {
    }

    @Around("hystrixCommandAnnotationPointcut() || hystrixCollapserAnnotationPointcut()")
    public Object methodsAnnotatedWithHystrixCommand(final ProceedingJoinPoint joinPoint) throws Throwable {
        Method method = getMethodFromTarget(joinPoint);
        Validate.notNull(method, "failed to get method from joinPoint: %s", joinPoint);
        if (method.isAnnotationPresent(HystrixCommand.class) && method.isAnnotationPresent(HystrixCollapser.class)) {
            throw new IllegalStateException("method cannot be annotated with HystrixCommand and HystrixCollapser " +
                    "annotations at the same time");
        }
        MetaHolderFactory metaHolderFactory = META_HOLDER_FACTORY_MAP.get(HystrixPointcutType.of(method));
        MetaHolder metaHolder = metaHolderFactory.create(joinPoint);
        HystrixInvokable invokable = HystrixCommandFactory.getInstance().create(metaHolder);
        ExecutionType executionType = metaHolder.isCollapserAnnotationPresent() ?
                metaHolder.getCollapserExecutionType() : metaHolder.getExecutionType();

        Object result;
        try {
            if (!metaHolder.isObservable()) {
                result = CommandExecutor.execute(invokable, executionType, metaHolder);
            } else {
                result = executeObservable(invokable, executionType, metaHolder);
            }
        } catch (HystrixBadRequestException e) {
            throw e.getCause() != null ? e.getCause() : e;
        } catch (HystrixRuntimeException e) {
            throw hystrixRuntimeExceptionToThrowable(metaHolder, e);
        }
        return result;
    }
```

1. The `HystrixCommandAspect` defines two AspectJ Pointcuts for the annotations: `@HystrixCommand`, `@HystrixCollapser`. All Spring beans with these annotations will undergo AOP processing.
2. In the `@Around` AOP processing function, it can be seen that Hystrix will create a `HystrixInvokable`, which is then executed through `CommandExecutor`.

## Code Analysis of spring-cloud-starter-netflix-hystrix

1. `@EnableHystrix` introduces `@EnableCircuitBreaker`, and `@EnableCircuitBreaker` introduces `EnableCircuitBreakerImportSelector`.

   ```java
   @EnableCircuitBreaker
   public @interface EnableHystrix {
   }
   
   @Import(EnableCircuitBreakerImportSelector.class)
   public @interface EnableCircuitBreaker {
   }
   ```

2. `EnableCircuitBreakerImportSelector` extends `SpringFactoryImportSelector<EnableCircuitBreaker>`, allowing Spring to load the configuration declared by `EnableCircuitBreaker` in `META-INF/spring.factories`.

   In `META-INF/spring.factories`, the following configuration can be found, which introduces `HystrixCircuitBreakerConfiguration`.

   ```properties
   org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker=\
   org.springframework.cloud.netflix.hystrix.HystrixCircuitBreakerConfiguration
   ```

3. In `HystrixCircuitBreakerConfiguration`, the creation of `HystrixCommandAspect` can be found.

   ```java
   @Configuration
   public class HystrixCircuitBreakerConfiguration {
   
       @Bean
       public HystrixCommandAspect hystrixCommandAspect() {
           return new HystrixCommandAspect();
       }
   ```

It can be seen that `spring-cloud-starter-netflix-hystrix` effectively creates `HystrixCommandAspect` to integrate Hystrix.

Additionally, `spring-cloud-starter-netflix-hystrix` also includes metrics, health, dashboard, and other integrations.

## Summary

- For the Dubbo provider, `@Service` is a Spring bean, and `@HystrixCommand` can be configured directly on it.
- For the Dubbo consumer's `@Reference`, a simple Spring method wrapper can be added and `@HystrixCommand` configured.
- Hystrix provides `HystrixCommandAspect` to integrate with Spring AOP, and Spring methods configured with `@HystrixCommand` and `@HystrixCollapser` will be processed by Hystrix.

## Links

- <https://github.com/Netflix/Hystrix>
- <https://github.com/apache/dubbo>
- <http://start.dubbo.io/>
- <https://cloud.spring.io/spring-cloud-netflix/single/spring-cloud-netflix.html#_circuit_breaker_hystrix_clients>

