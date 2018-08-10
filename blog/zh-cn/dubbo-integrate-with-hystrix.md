# Spring应用快速集成Dubbo + Hystrix

## 背景

Hystrix 旨在通过控制那些访问远程系统、服务和第三方库的节点，从而对延迟和故障提供更强大的容错能力。Hystrix具备拥有回退机制和断路器功能的线程和信号隔离，请求缓存和请求打包，以及监控和配置等功能。

Dubbo是Alibaba开源的，目前国内最流行的java rpc框架。

本文介绍在spring应用里，怎么把Dubbo和Hystrix结合起来使用。

- <https://github.com/Netflix/Hystrix>
- <https://github.com/apache/incubator-dubbo>

## Spring Boot应用

Demo地址： <https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-spring-boot-hystrix>

### 生成dubbo集成spring boot的应用

对于不熟悉dubbo 集成spring boot应用的同学，可以在这里直接生成dubbo + spring boot的工程： <http://start.dubbo.io/>

### 配置spring-cloud-starter-netflix-hystrix

spring boot官方提供了对hystrix的集成，直接在pom.xml里加入依赖：

```
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
            <version>1.4.4.RELEASE</version>
        </dependency>
```

然后在Application类上增加`@EnableHystrix`来启用hystrix starter：

```
@SpringBootApplication
@EnableHystrix
public class ProviderApplication {
```

### 配置Provider端

在Dubbo的Provider上增加`@HystrixCommand`配置，这样子调用就会经过Hystrix代理。

```
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

```
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

Demo地址： <https://github.com/dubbo/dubbo-samples/tree/master/dubbo-samples-spring-hystrix>

传统spring annotation应用的配置其实也很简单，和spring boot应用不同的是：

1. 显式配置Spring AOP支持：`@EnableAspectJAutoProxy`
2. 显式通过`@Configuration`配置`HystrixCommandAspect` Bean。

```
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

```
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

   ```
   @EnableCircuitBreaker
   public @interface EnableHystrix {
   }
   
   @Import(EnableCircuitBreakerImportSelector.class)
   public @interface EnableCircuitBreaker {
   }
   ```

2. `EnableCircuitBreakerImportSelector`继承了`SpringFactoryImportSelector<EnableCircuitBreaker>`，使spring加载`META-INF/spring.factories`里的`EnableCircuitBreaker`声明的配置

   在`META-INF/spring.factories`里可以找到下面的配置，也就是引入了`HystrixCircuitBreakerConfiguration`。

   ```
   org.springframework.cloud.client.circuitbreaker.EnableCircuitBreaker=\
   org.springframework.cloud.netflix.hystrix.HystrixCircuitBreakerConfiguration
   ```

3. 在`HystrixCircuitBreakerConfiguration`里可以发现创建了`HystrixCommandAspect`

   ```
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

## 链接

- <https://github.com/Netflix/Hystrix>
- <https://github.com/apache/incubator-dubbo>
- <http://start.dubbo.io/>
- <https://cloud.spring.io/spring-cloud-netflix/single/spring-cloud-netflix.html#_circuit_breaker_hystrix_clients>