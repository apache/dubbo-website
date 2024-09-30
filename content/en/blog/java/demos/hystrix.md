---
aliases:
    - /en/overview/what/ecosystem/rate-limit/hystrix/
    - /en/overview/tasks/rate-limit/hystrix/
    - /en/overview/tasks/rate-limit/hystrix/
description: "Using Hystrix for Circuit Breaker Rate Limiting Protection of Dubbo Services"
linkTitle: Pending Integration-Hystrix Circuit Breaker Degradation
title: Using Hystrix for Circuit Breaker Rate Limiting Protection of Dubbo Services
tags: ["Java", "Hystrix", "Rate Limiting Degradation"]
date: 2023-12-14
---

## Background

Hystrix aims to provide robust fault tolerance by controlling the nodes that access remote systems, services, and third-party libraries, thereby enhancing resilience to latency and failures. Hystrix has features such as fallback mechanisms, circuit breaker functionality, thread and signal isolation, request caching, request bundling, as well as monitoring and configuration capabilities.

This article describes how to combine Dubbo and Hystrix in a Spring application.

- <https://github.com/Netflix/Hystrix>
- <https://github.com/apache/dubbo>

## Spring Boot Application

Demo address: <https://github.com/dubbo/dubbo-samples/tree/master/4-governance/dubbo-samples-spring-boot-hystrix>

### Generate a Dubbo Integrated Spring Boot Application

For those unfamiliar with Dubbo integration with Spring Boot, you can directly generate a Dubbo + Spring Boot project here: <http://start.dubbo.apache.org/bootstrap.html/>

### Configure spring-cloud-starter-netflix-hystrix

Spring Boot officially provides integration with Hystrix. Simply add the dependency to your pom.xml:

```xml
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
            <version>1.4.4.RELEASE</version>
        </dependency>
```

Then, add `@EnableHystrix` on the Application class to enable the Hystrix starter:

```java
@SpringBootApplication
@EnableHystrix
public class ProviderApplication {
```
### Configure Provider Side
Increase the `@HystrixCommand` configuration on the Dubbo Provider, so that the calls will go through the Hystrix proxy.
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
### Configure Consumer Side
For the consumer side, you can add an additional method call and configure `@HystrixCommand` on the method. When an error occurs, it will invoke the `fallbackMethod = "reliable"` call.
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
The configuration for traditional Spring annotation applications is also quite simple. Unlike Spring Boot applications, it requires:
1. Explicitly configure Spring AOP support: `@EnableAspectJAutoProxy`
2. Explicitly configure `HystrixCommandAspect` Bean through `@Configuration`.
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
## Hystrix Integration with Spring AOP Principles
In the above example, it can be seen that Hystrix's integration with Spring is achieved through Spring AOP. Below we briefly analyze the implementation.
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
1. `HystrixCommandAspect` defines two AspectJ Pointcuts for the annotations: `@HystrixCommand` and `@HystrixCollapser`. All Spring beans marked with these annotations will be processed via AOP.
2. In the `@Around` AOP processing function, you can see that Hystrix creates a `HystrixInvokable`, and then executes it via the `CommandExecutor`.
## Analysis of spring-cloud-starter-netflix-hystrix Code
1. `@EnableHystrix` introduces `@EnableCircuitBreaker`, and `@EnableCircuitBreaker` imports `EnableCircuitBreakerImportSelector`.
   ```java
   @EnableCircuitBreaker
   public @interface EnableHystrix {
   }

   @Import(EnableCircuitBreakerImportSelector.class)
   public @interface EnableCircuitBreaker {
   }
   ```
2. `EnableCircuitBreakerImportSelector` inherits from `SpringFactoryImportSelector<EnableCircuitBreaker>`, allowing Spring to load the configuration declared in `META-INF/spring.factories` for `EnableCircuitBreaker`.
   In `META-INF/spring.factories`, you can find the configuration that introduces `HystrixCircuitBreakerConfiguration`.
   ```properties
   org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker=\
   org.springframework.cloud.netflix.hystrix.HystrixCircuitBreakerConfiguration
   ```
3. In `HystrixCircuitBreakerConfiguration`, `HystrixCommandAspect` is created.
   ```java
   @Configuration
   public class HystrixCircuitBreakerConfiguration {

       @Bean
       public HystrixCommandAspect hystrixCommandAspect() {
           return new HystrixCommandAspect();
       }
   ```
It can be seen that `spring-cloud-starter-netflix-hystrix` also creates `HystrixCommandAspect` for the integration of Hystrix.
Additionally, it includes metrics, health, and dashboard integrations.

## Summary
- For Dubbo providers, the `@Service` is a Spring bean, and you can directly configure `@HystrixCommand` on it.
- For Dubbo consumers, you can add a simple Spring method wrapping and configure `@HystrixCommand`.
- Hystrix itself provides `HystrixCommandAspect` to integrate with Spring AOP, where Spring methods configured with `@HystrixCommand` or `@HystrixCollapser` will be processed by Hystrix.

### Comparison Between Sentinel and Hystrix

Currently, the commonly used circuit breaker degradation/isolation library in the industry is Netflix's [Hystrix](https://github.com/Netflix/Hystrix). So what are the similarities and differences between Sentinel and Hystrix? Hystrix focuses on fault tolerance mechanisms centered around _isolation_ and _circuit breaking_, while Sentinel emphasizes diverse traffic control, circuit-breaking degradation, system load protection, real-time monitoring, and console capabilities, indicating that the problems they address are quite different.

Hystrix uses the command pattern to encapsulate resource invocation logic, and the definition of resources and isolation rules are strongly dependent, meaning that when creating HystrixCommand, the isolation rules must be specified (as its execution model depends on the isolation mode). Sentinel's design is simpler, not focusing on how resources are executed; the definition of resources and the configuration of rules are separated. Users can first define resources and then configure rules as needed. The principle of Sentinel is very straightforward: execute corresponding flow control/degradation/load protection strategies based on the rules configured for the relevant resources; if no rules are configured, only statistics will be collected. Starting from version 0.1.1, Sentinel introduced [annotation support](https://github.com/alibaba/Sentinel/wiki/%E6%B3%A8%E8%A7%A3%E6%94%AF%E6%8C%81), making it easier to define resources.

Isolation is a core function of Hystrix. Hystrix isolates dependencies (corresponding to resources in Sentinel) through thread pools or semaphore methods, where resource isolation is the most commonly used. The benefit of Hystrix's thread pool isolation is thorough, but the drawback is that many thread pools need to be opened, leading to significant context-switching overhead when the number of threads in the application is large. Hystrix's semaphore isolation mode limits concurrent calls without explicitly creating threads, which is lightweight but fails to downgrade slow calls automatically, forcing the client to timeout itself, which may still lead to cascading blockages. Sentinel can provide semaphore isolation functions through flow control based on concurrent thread counts and can automatically downgrade when the average response time of unstable resources is high, thus preventing an excessive number of slow calls from occupying concurrent counts and affecting the entire system.

Hystrix's circuit breaker degradation function adopts the circuit breaker pattern, automatically breaking the circuit when the failure rate of a service is high. Sentinel's circuit breaker degradation function is more general, supporting both average response time and failure rate as indicators. Sentinel also provides support for various call chain relationships and flow control effects and can dynamically adjust traffic in real-time based on system load to protect the system, leading to a wider range of application scenarios. Additionally, Sentinel offers real-time monitoring APIs and a console, allowing users to quickly understand the current state of the system, ensuring service stability.

For a more detailed comparison, please refer to [Comparison Between Sentinel and Hystrix](https://github.com/alibaba/Sentinel/wiki/Sentinel-%E4%B8%8E-Hystrix-%E7%9A%84%E5%AF%B9%E6%AF%94).

### Links
- <https://github.com/Netflix/Hystrix>
- <https://github.com/apache/dubbo>
- <http://start.dubbo.io/>
- <https://cloud.spring.io/spring-cloud-netflix/single/spring-cloud-netflix.html#_circuit_breaker_hystrix_clients>

