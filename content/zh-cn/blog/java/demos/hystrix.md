---
aliases:
    - /zh-cn/overview/what/ecosystem/rate-limit/hystrix/
    - /zh/overview/tasks/rate-limit/hystrix/
    - /zh-cn/overview/tasks/rate-limit/hystrix/
description: "使用 Hystrix 对 Dubbo 服务进行熔断限流保护"
linkTitle: 待整合-Hystrix 熔断降级
title: 使用 Hystrix 对 Dubbo 服务进行熔断限流保护
tags: ["Java", "Hystrix", "限流降级"]
date: 2023-12-14
---

## 背景

Hystrix 旨在通过控制那些访问远程系统、服务和第三方库的节点，从而对延迟和故障提供更强大的容错能力。Hystrix具备拥有回退机制和断路器功能的线程和信号隔离，请求缓存和请求打包，以及监控和配置等功能。

本文介绍在spring应用里，怎么把 Dubbo 和 Hystrix 结合起来使用。

- <https://github.com/Netflix/Hystrix>
- <https://github.com/apache/dubbo>

## Spring Boot应用

Demo 地址： <https://github.com/dubbo/dubbo-samples/tree/master/4-governance/dubbo-samples-spring-boot-hystrix>

### 生成dubbo集成spring boot的应用

对于不熟悉dubbo 集成spring boot应用的同学，可以在这里直接生成dubbo + spring boot的工程： <http://start.dubbo.apache.org/bootstrap.html/>

### 配置spring-cloud-starter-netflix-hystrix

spring boot官方提供了对hystrix的集成，直接在pom.xml里加入依赖：

```xml
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
            <version>1.4.4.RELEASE</version>
        </dependency>
```

然后在Application类上增加`@EnableHystrix`来启用hystrix starter：

```java
@SpringBootApplication
@EnableHystrix
public class ProviderApplication {
```
### 配置Provider端
在Dubbo的Provider上增加`@HystrixCommand`配置，这样子调用就会经过Hystrix代理。
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
### 配置Consumer端
对于Consumer端，则可以增加一层method调用，并在method上配置`@HystrixCommand`。当调用出错时，会走到`fallbackMethod = "reliable"`的调用里。
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
通过上面的配置，很简单地就完成了Spring Boot里Dubbo + Hystrix的集成。
## 传统Spring Annotation应用
Demo地址： <https://github.com/dubbo/dubbo-samples/tree/master/4-governance/dubbo-samples-spring-hystrix>
传统spring annotation应用的配置其实也很简单，和spring boot应用不同的是：
1. 显式配置Spring AOP支持：`@EnableAspectJAutoProxy`
2. 显式通过`@Configuration`配置`HystrixCommandAspect` Bean。
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
## Hystrix集成Spring AOP原理
在上面的例子里可以看到，Hystrix对Spring的集成是通过Spring AOP来实现的。下面简单分析下实现。
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
1. `HystrixCommandAspect`里定义了两个注解的AspectJ Pointcut：`@HystrixCommand`, `@HystrixCollapser`。所有带这两个注解的spring bean都会经过AOP处理
2. 在`@Around` AOP处理函数里，可以看到Hystrix会创建出`HystrixInvokable`，再通过`CommandExecutor`来执行
## spring-cloud-starter-netflix-hystrix的代码分析
1. `@EnableHystrix` 引入了`@EnableCircuitBreaker`，`@EnableCircuitBreaker`引入了`EnableCircuitBreakerImportSelector`
   ```java
   @EnableCircuitBreaker
   public @interface EnableHystrix {
   }

   @Import(EnableCircuitBreakerImportSelector.class)
   public @interface EnableCircuitBreaker {
   }
   ```
2. `EnableCircuitBreakerImportSelector`继承了`SpringFactoryImportSelector<EnableCircuitBreaker>`，使spring加载`META-INF/spring.factories`里的`EnableCircuitBreaker`声明的配置
   在`META-INF/spring.factories`里可以找到下面的配置，也就是引入了`HystrixCircuitBreakerConfiguration`。
   ```properties
   org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker=\
   org.springframework.cloud.netflix.hystrix.HystrixCircuitBreakerConfiguration
   ```
3. 在`HystrixCircuitBreakerConfiguration`里可以发现创建了`HystrixCommandAspect`
   ```java
   @Configuration
   public class HystrixCircuitBreakerConfiguration {

       @Bean
       public HystrixCommandAspect hystrixCommandAspect() {
           return new HystrixCommandAspect();
       }
   ```
可见`spring-cloud-starter-netflix-hystrix`实际上也是创建了`HystrixCommandAspect`来集成Hystrix。
另外`spring-cloud-starter-netflix-hystrix`里还有metrics, health, dashboard等集成。

## 总结
- 对于dubbo provider的`@Service`是一个spring bean，直接在上面配置`@HystrixCommand`即可
- 对于dubbo consumer的`@Reference`，可以通过加一层简单的spring method包装，配置`@HystrixCommand`即可
- Hystrix本身提供`HystrixCommandAspect`来集成Spring AOP，配置了`@HystrixCommand`和`@HystrixCollapser`的spring method都会被Hystrix处理

### Sentinel 与 Hystrix 的比较

目前业界常用的熔断降级/隔离的库是 Netflix 的 [Hystrix](https://github.com/Netflix/Hystrix)，那么 Sentinel 与 Hystrix 有什么异同呢？Hystrix 的关注点在于以 _隔离_ 和 _熔断_ 为主的容错机制，而 Sentinel 的侧重点在于多样化的流量控制、熔断降级、系统负载保护、实时监控和控制台，可以看到解决的问题还是有比较大的不同的。

Hystrix 采用命令模式封装资源调用逻辑，并且资源的定义与隔离规则是强依赖的，即在创建 HystrixCommand 的时候就要指定隔离规则（因其执行模型依赖于隔离模式）。Sentinel 的设计更为简单，不关注资源是如何执行的，资源的定义与规则的配置相分离。用户可以先定义好资源，然后在需要的时候配置规则即可。Sentinel 的原则非常简单：根据对应资源配置的规则来为资源执行相应的限流/降级/负载保护策略，若规则未配置则仅进行统计。从 0.1.1 版本开始，Sentinel 还引入了[注解支持](https://github.com/alibaba/Sentinel/wiki/%E6%B3%A8%E8%A7%A3%E6%94%AF%E6%8C%81)，可以更方便地定义资源。

隔离是 Hystrix 的核心功能。Hystrix 通过线程池或信号量的方式来对依赖（即 Sentinel 中对应的资源）进行隔离，其中最常用的是资源隔离。Hystrix 线程池隔离的好处是比较彻底，但是不足之处在于要开很多线程池，在应用本身线程数目比较多的时候上下文切换的 overhead 会非常大；Hystrix 的信号量隔离模式可以限制调用的并发数而不显式创建线程，这样的方式比较轻量级，但缺点是无法对慢调用自动进行降级，只能等待客户端自己超时，因此仍然可能会出现级联阻塞的情况。Sentinel 可以通过并发线程数模式的流量控制来提供信号量隔离的功能。并且结合基于响应时间的熔断降级模式，可以在不稳定资源的平均响应时间比较高的时候自动降级，防止过多的慢调用占满并发数，影响整个系统。

Hystrix 熔断降级功能采用熔断器模式，在某个服务失败比率高时自动进行熔断。Sentinel 的熔断降级功能更为通用，支持平均响应时间与失败比率两个指标。Sentinel 还提供各种调用链路关系和流量控制效果支持，同时还可以根据系统负载去实时地调整流量来保护系统，应用场景更为丰富。同时，Sentinel 还提供了实时的监控 API 和控制台，可以方便用户快速了解目前系统的状态，对服务的稳定性了如指掌。

更详细的对比请参见 [Sentinel 与 Hystrix 的对比](https://github.com/alibaba/Sentinel/wiki/Sentinel-%E4%B8%8E-Hystrix-%E7%9A%84%E5%AF%B9%E6%AF%94)。

### 链接
- <https://github.com/Netflix/Hystrix>
- <https://github.com/apache/dubbo>
- <http://start.dubbo.io/>
- <https://cloud.spring.io/spring-cloud-netflix/single/spring-cloud-netflix.html#_circuit_breaker_hystrix_clients>
