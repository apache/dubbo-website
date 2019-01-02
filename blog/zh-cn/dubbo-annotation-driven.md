# Dubbo 注解驱动（Annotation-Driven）




## 注解驱动（Annotation-Driven）





### `@DubboComponentScan`





#### 起始版本： `2.5.7`







#### `<dubbo:annotation> `历史遗留问题





##### 1. 注解支持不充分



在 Dubbo  `2.5.7`之前的版本 ，Dubbo 提供了两个核心注解 `@Service` 以及 `@Reference`，分别用于Dubbo 服务提供和 Dubbo 服务引用。



其中，`@Service` 作为 XML 元素 `<dubbo:service>`的替代注解，与 Spring Framework `@org.springframework.stereotype.Service` 类似，用于服务提供方 Dubbo 服务暴露。与之相对应的`@Reference`，则是替代`<dubbo:reference` 元素，类似于 Spring 中的 `@Autowired`。



 `2.5.7` 之前的Dubbo，与早期的 Spring Framework 2.5 存在类似的不足，即注解支持不够充分。注解需要和 XML 配置文件配合使用，如下所示：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
	http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">

    <dubbo:application name="annotation-provider"/>
    <dubbo:registry address="127.0.0.1:4548"/>
    <dubbo:annotation package="com.alibaba.dubbo.config.spring.annotation.provider"/>

</beans>
```





##### 2.  `@Service` Bean 不支持 Spring AOP



同时，使用 `<dubbo:annotation> ` 方式扫描后的Dubbo `@Service` ，在 Spring 代理方面存在问题，如 GitHub 上的 issue https://github.com/alibaba/dubbo/issues/794：

> 关于dubbo @Service注解生成ServiceBean时, interface获取成spring 的代理对象的bug
>
> >在项目里， 我使用了
> >
> >```java
> >@Service
> >@Transactional
> >@com.alibaba.dubbo.config.annotation.Service
> >public class SUserJpushServiceImp
> >```
> >
> >的形式， 来暴露服务。但是在发布服务的时候， interface class 是通过
> >``
> >serviceConfig.setInterface(bean.getClass().getInterfaces()[0]);
> >``
> >的形式获取， 刚好， 我的service都使用了@Transactional注解， 对象被代理了。所以获取到的interface是Spring的代理接口...



不少热心的小伙伴不仅发现这个历史遗留问题，而且提出了一些修复方案。同时，为了更好地适配 Spring 生命周期以及将 Dubbo 完全向注解驱动编程模型过渡，因此，引入了全新 Dubbo 组件扫描注解 - `@DubboComponentScan`。



> 注： `<dubbo:annotation> `  Spring AOP 问题将在 `2.5.9` 中修复：https://github.com/alibaba/dubbo/issues/1125





##### 3. @Reference 不支持字段继承性



假设有一个 Spring Bean `AnnotationAction` 直接通过字段`annotationService` 标记 `@Reference` 引用 `AnnotationService` ：

```java
package com.alibaba.dubbo.examples.annotation.action;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.dubbo.examples.annotation.api.AnnotationService;
import org.springframework.stereotype.Component;


@Component("annotationAction")
public class AnnotationAction {

    @Reference
    private AnnotationService annotationService;

    public String doSayHello(String name) {
        return annotationService.sayHello(name);
    }

}
```



当`AnnotationAction`  被 XML 元素 `<dubbo:annotation>` 扫描后：

```xml
<dubbo:annotation package="com.alibaba.dubbo.examples.annotation.action"/>
```



字段 `annotationService` 能够引用到 `AnnotationService`，执行 `doSayHello` 方法能够正常返回。



如果将字段`annotationService`  抽取到`AnnotationAction` 的父类`BaseAction` 后，`AnnotationService` 无法再被引用，改造如下所示：

`AnnotationAction.java`

```java
@Component("annotationAction")
public class AnnotationAction extends BaseAction {

    public String doSayHello(String name) {
        return getAnnotationService().sayHello(name);
    }

}
```



`BaseAction.java`

```java
public abstract class BaseAction {

    @Reference
    private AnnotationService annotationService;

    protected AnnotationService getAnnotationService() {
        return annotationService;
    }
}
```



改造后，再次执行 `doSayHello` 方法，`NullPointerException` 将会被抛出。说明`<dubbo:annotation>` 并不支持`@Reference` 字段继承性。



了解了历史问题，集合整体愿景，下面介绍`@DubboComponentScan` 的设计原则。







#### 设计原则





Spring Framework 3.1 引入了新 Annotation - `@ComponentScan` ， 完全替代了 XML 元素 ` <context:component-scan>` 。同样， `@DubboComponentScan`  作为 Dubbo `2.5.7` 新增的 Annotation，也是XML 元素  `<dubbo:annotation>` 的替代方案。



在命名上（类名以及属性方法），为了简化使用和关联记忆，Dubbo 组件扫描 Annotation `@DubboComponentScan`，借鉴了 Spring Boot 1.3 引入的 `@ServletComponentScan`。定义如下：

```java
public @interface DubboComponentScan {

    /**
     * Alias for the {@link #basePackages()} attribute. Allows for more concise annotation
     * declarations e.g.: {@code @DubboComponentScan("org.my.pkg")} instead of
     * {@code @DubboComponentScan(basePackages="org.my.pkg")}.
     *
     * @return the base packages to scan
     */
    String[] value() default {};

    /**
     * Base packages to scan for annotated @Service classes. {@link #value()} is an
     * alias for (and mutually exclusive with) this attribute.
     * <p>
     * Use {@link #basePackageClasses()} for a type-safe alternative to String-based
     * package names.
     *
     * @return the base packages to scan
     */
    String[] basePackages() default {};

    /**
     * Type-safe alternative to {@link #basePackages()} for specifying the packages to
     * scan for annotated @Service classes. The package of each class specified will be
     * scanned.
     *
     * @return classes from the base packages to scan
     */
    Class<?>[] basePackageClasses() default {};

}
```



> 注意：`basePackages()` 和 `value()` 均能支持占位符（placeholder）指定的包名



在职责上，`@DubboComponentScan` 相对于 Spring Boot `@ServletComponentScan` 更为繁重，原因在于处理 Dubbo  `@Service` 类暴露 Dubbo 服务外，还有帮助 Spring  Bean `@Reference`字段或者方法注入 Dubbo 服务代理。 



 在场景上，Spring Framework `@ComponentScan` 组件扫描逻辑更为复杂。而在 `@DubboComponentScan`  只需关注 `@Service` 和 `@Reference` 处理。



在功能上， `@DubboComponentScan`  不但需要提供完整 Spring AOP 支持的能力，而且还得具备`@Reference ` 字段可继承性的能力。



了解基本设计原则后，下面通过完整的示例，简介`@DubboComponentScan` 使用方法以及注意事项。







#### 使用方法



后续通过服务提供方（`@Serivce`）以及服务消费方（`@Reference`）两部分来介绍`@DubboComponentScan` 使用方法。



假设，服务提供方和服务消费分均依赖服务接口`DemoService`:

```java
package com.alibaba.dubbo.demo;

public interface DemoService {

    String sayHello(String name);

}
```





##### 服务提供方（`@Serivce`）



###### 实现 `DemoService`



服务提供方实现`DemoService`  - `AnnotationDemoService` ，同时标注 Dubbo `@Service` ：

```java
package com.alibaba.dubbo.demo.provider;

import com.alibaba.dubbo.config.annotation.Service;
import com.alibaba.dubbo.demo.DemoService;

/**
 * Annotation {@link DemoService} 实现
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
@Service
public class AnnotationDemoService implements DemoService {

    @Override
    public String sayHello(String name) {
        return "Hello , " + name;
    }

}
```





###### 服务提供方 Annotation 配置



将 `AnnotationDemoService` 暴露成Dubbo 服务，需要依赖 Spring Bean：`AplicationConfig`、`ProtocolConfig` 以及 `RegistryConfig`  。这三个 Spring Bean 过去可通过 XML 文件方式组装 Spring Bean：

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
    http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd
    ">

    <!-- 当前应用信息配置 -->
    <dubbo:application name="dubbo-annotation-provider"/>

    <!-- 连接注册中心配置 -->
    <dubbo:registry id="my-registry" address="N/A"/>

    <dubbo:protocol name="dubbo" port="12345"/>

</beans>
```

 

以上装配方式不予推荐，推荐使用 Annotation 配置，因此可以换成 Spring `@Configuration` Bean 的形式：

```java
package com.alibaba.dubbo.demo.config;

import com.alibaba.dubbo.config.ApplicationConfig;
import com.alibaba.dubbo.config.ProtocolConfig;
import com.alibaba.dubbo.config.RegistryConfig;
import com.alibaba.dubbo.config.spring.context.annotation.DubboComponentScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 服务提供方配置
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
@Configuration
@DubboComponentScan("com.alibaba.dubbo.demo.provider") // 扫描 Dubbo 组件
public class ProviderConfiguration {

    /**
     * 当前应用配置
     */
    @Bean("dubbo-annotation-provider")
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("dubbo-annotation-provider");
        return applicationConfig;
    }

    /**
     * 当前连接注册中心配置
     */
    @Bean("my-registry")
    public RegistryConfig registryConfig() {
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress("N/A");
        return registryConfig;
    }

    /**
     * 当前连接注册中心配置
     */
    @Bean("dubbo")
    public ProtocolConfig protocolConfig() {
        ProtocolConfig protocolConfig = new ProtocolConfig();
        protocolConfig.setName("dubbo");
        protocolConfig.setPort(12345);
        return protocolConfig;
    }
}
```





###### 服务提供方引导类



```java
package com.alibaba.dubbo.demo.bootstrap;

import com.alibaba.dubbo.demo.DemoService;
import com.alibaba.dubbo.demo.config.ProviderConfiguration;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * 服务提供方引导类
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
public class ProviderBootstrap {

    public static void main(String[] args) {
        // 创建 Annotation 配置上下文
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        // 注册配置 Bean
        context.register(ProviderConfiguration.class);
        // 启动上下文
        context.refresh();
        // 获取 DemoService Bean
        DemoService demoService = context.getBean(DemoService.class);
        // 执行 sayHello 方法
        String message = demoService.sayHello("World");
        // 控制台输出信息
        System.out.println(message);
    }
    
}
```



`ProviderBootstrap` 启动并执行后，控制输出与预期一致：

```
Hello , World
```



以上直接结果说明 `@DubboComponentScan("com.alibaba.dubbo.demo.provider")` 扫描后，标注 Dubbo `@Service` 的 `AnnotationDemoService` 被注册成 Spring Bean，可从 Spring ApplicationContext 自由获取。





##### 服务消费方（`@Reference`）



###### 服务 `DemoService`



```java
package com.alibaba.dubbo.demo.consumer;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.dubbo.demo.DemoService;

/**
 * Annotation 驱动 {@link DemoService} 消费方
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
public class AnnotationDemoServiceConsumer {

    @Reference(url = "dubbo://127.0.0.1:12345")
    private DemoService demoService;

    public String doSayHell(String name) {
        return demoService.sayHello(name);
    }
}
```





###### 服务消费方 Annotation 配置



与服务提供方配置类似，服务消费方也许 Dubbo 相关配置 Bean - `ConsumerConfiguration`

```java
package com.alibaba.dubbo.demo.config;

import com.alibaba.dubbo.config.ApplicationConfig;
import com.alibaba.dubbo.config.RegistryConfig;
import com.alibaba.dubbo.config.spring.context.annotation.DubboComponentScan;
import com.alibaba.dubbo.demo.consumer.AnnotationDemoServiceConsumer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 服务消费方配置
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
@Configuration
@DubboComponentScan
public class ConsumerConfiguration {

    /**
     * 当前应用配置
     */
    @Bean
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("dubbo-annotation-consumer");
        return applicationConfig;
    }

    /**
     * 当前连接注册中心配置
     */
    @Bean
    public RegistryConfig registryConfig() {
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress("N/A");
        return registryConfig;
    }

    /**
     * 注册 AnnotationDemoServiceConsumer，@DubboComponentScan 将处理其中 @Reference 字段。
     * 如果 AnnotationDemoServiceConsumer 非 Spring Bean 的话，
     * 即使 @DubboComponentScan 指定 package 也不会进行处理，与 Spring @Autowired 同理
     */
    @Bean
    public AnnotationDemoServiceConsumer annotationDemoServiceConsumer() {
        return new AnnotationDemoServiceConsumer();
    }

}
```



###### 服务消费方引导类



服务消费方需要先引导服务提供方，下面的实例将会启动两个 Spring 应用上下文，首先引导服务提供方 Spring 应用上下文，同时，需要复用前面Annotation 配置 `ProviderConfiguration`：

```java
    /**
     * 启动服务提供方上下文
     */
    private static void startProviderContext() {
        // 创建 Annotation 配置上下文
        AnnotationConfigApplicationContext providerContext = new AnnotationConfigApplicationContext();
        // 注册配置 Bean
        providerContext.register(ProviderConfiguration.class);
        // 启动服务提供方上下文
        providerContext.refresh();
    }
```



然后引导服务消费方Spring 应用上下文：

```java
    /**
     * 启动并且返回服务消费方上下文
     *
     * @return AnnotationConfigApplicationContext
     */
    private static ApplicationContext startConsumerContext() {
        // 创建服务消费方 Annotation 配置上下文
        AnnotationConfigApplicationContext consumerContext = new AnnotationConfigApplicationContext();
        // 注册服务消费方配置 Bean
        consumerContext.register(ConsumerConfiguration.class);
        // 启动服务消费方上下文
        consumerContext.refresh();
        // 返回服务消费方 Annotation 配置上下文
        return consumerContext;
    }
```



完整的引导类实现：

```java
package com.alibaba.dubbo.demo.bootstrap;

import com.alibaba.dubbo.demo.config.ConsumerConfiguration;
import com.alibaba.dubbo.demo.config.ProviderConfiguration;
import com.alibaba.dubbo.demo.consumer.AnnotationDemoServiceConsumer;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * 服务消费端引导类
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
public class ConsumerBootstrap {

    public static void main(String[] args) {
        // 启动服务提供方上下文
        startProviderContext();
        // 启动并且返回服务消费方上下文
        ApplicationContext consumerContext = startConsumerContext();
        // 获取 AnnotationDemoServiceConsumer Bean
        AnnotationDemoServiceConsumer consumer = consumerContext.getBean(AnnotationDemoServiceConsumer.class);
        // 执行 doSayHello 方法
        String message = consumer.doSayHello("World");
        // 输出执行结果
        System.out.println(message);
    }

    /**
     * 启动并且返回服务消费方上下文
     *
     * @return AnnotationConfigApplicationContext
     */
    private static ApplicationContext startConsumerContext() {
        // 创建服务消费方 Annotation 配置上下文
        AnnotationConfigApplicationContext consumerContext = new AnnotationConfigApplicationContext();
        // 注册服务消费方配置 Bean
        consumerContext.register(ConsumerConfiguration.class);
        // 启动服务消费方上下文
        consumerContext.refresh();
        // 返回服务消费方 Annotation 配置上下文
        return consumerContext;
    }

    /**
     * 启动服务提供方上下文
     */
    private static void startProviderContext() {
        // 创建 Annotation 配置上下文
        AnnotationConfigApplicationContext providerContext = new AnnotationConfigApplicationContext();
        // 注册配置 Bean
        providerContext.register(ProviderConfiguration.class);
        // 启动服务提供方上下文
        providerContext.refresh();
    }

}
```



运行`ConsumerBootstrap`结果，仍然符合期望，`AnnotationDemoServiceConsumer` 输出：

```
Hello , World
```







####  Spring AOP 支持



前面提到 `<dubbo:annotation> `  注册 Dubbo `@Service` 组件后，在 Spring AOP 支持方面存在问题。事务作为 Spring AOP 的功能扩展，自然也会在 `<dubbo:annotation> `中不支持。



`@DubboComponentScan` 针对以上问题，实现了对 Spring AOP 是完全兼容。将上述服务提供方 Annotation 配置做出一定的调整，标注`@EnableTransactionManagement` 以及自定义实现`PlatformTransactionManager` :

```java
@Configuration
@DubboComponentScan("com.alibaba.dubbo.demo.provider") // 扫描 Dubbo 组件
@EnableTransactionManagement // 激活事务管理
public class ProviderConfiguration {
  // 省略其他配置 Bean 定义
  
    /**
     * 自定义事务管理器
     */
    @Bean
    @Primary
    public PlatformTransactionManager transactionManager() {
        return new PlatformTransactionManager() {

            @Override
            public TransactionStatus getTransaction(TransactionDefinition definition) throws TransactionException {
                System.out.println("get transaction ...");
                return new SimpleTransactionStatus();
            }

            @Override
            public void commit(TransactionStatus status) throws TransactionException {
                System.out.println("commit transaction ...");
            }

            @Override
            public void rollback(TransactionStatus status) throws TransactionException {
                System.out.println("rollback transaction ...");
            }
        };
    }
}
```



同时调整 `AnnotationDemoService`  - 增加`@Transactional` 注解：

```java
@Service
@Transactional
public class AnnotationDemoService implements DemoService {
	// 省略实现，保持不变
}
```



再次运行`ConsumerBootstrap` , 观察控制台输出内容：

```
get transaction ...
commit transaction ...
Hello , World
```



输入内容中多处了两行，说明自定义 `PlatformTransactionManager` `getTransaction(TransactionDefinition)` 以及 `commit(TransactionStatus) ` 方法被执行，进而说明 `AnnotationDemoService` 的`sayHello(String)` 方法执行时，事务也伴随执行。





#### 注意事项



`ConsumerConfiguration` 上的  `@DubboComponentScan` 并没有指定 `basePackages` 扫描，这种情况会将`ConsumerConfiguration`  当做 `basePackageClasses` ，即扫描`ConsumerConfiguration` 所属的 package  `com.alibaba.dubbo.demo.config` 以及子 package。由于当前示例中，不存在标注 Dubbo `@Service`的类，因此在运行时日志（如果开启的话）会输出警告信息：

```
WARN :  [DUBBO] No Spring Bean annotating Dubbo's @Service was found in Spring BeanFactory, dubbo version: 2.0.0, current host: 127.0.0.1
```



以上信息大可不必担忧，因为 `@DubboComponentScan`  除了扫描 Dubbo `@Service` 组件以外，还将处理 `@Reference`字段注入。然而读者特别关注`@Reference`字段注入的规则。



以上实现为例，`AnnotationDemoServiceConsumer` 必须申明为 Spring  `@Bean` 或者 `@Component`（或者其派生注解），否则 `@DubboComponentScan` 不会主动将标注 `@Reference`字段所在的声明类提成为 Spring Bean，换句话说，如果 `@Reference`字段所在的声明类不是 Spring Bean 的话， `@DubboComponentScan` 不会处理`@Reference`注入，其原理与 Spring `@Autowired` 一致。



以上使用不当可能会导致相关问题，如 GitHub 上曾有小伙伴提问：https://github.com/alibaba/dubbo/issues/825

> **li362692680** 提问：
>
> > @DubboComponentScan注解在消费端扫描包时扫描的是 @Service注解？？不是@Reference注解？？
> > 启动时报
> > DubboComponentScanRegistrar-85]-[main]-[INFO] 0 annotated @Service Components { [] }
>
> 笔者(**mercyblitz**)回复：
>
> > `@Reference` 类似于 `@Autowired` 一样，首先其申明的类必须被 Spring 上下文当做一个Bean，因此，Dubbo 并没有直接将 `@Reference`  字段所在的类提升成 Bean。
> >
> > 综上所述，这并不是一个问题，而是用法不当！





#### 已知问题



最新发布的 Dubbo `2.5.8` 中，`@DubboComponentScan`  在以下特殊场景下存在 Spring `@Service` 不兼容情况：

> 假设有两个服务实现类 `A` 和 `B`，同时存放在`com.acme` 包下：
>
> * `A` 标注  Dubbo `@Service` 
> * `B` 标注  Dubbo `@Service` 和 Spring `@Service`
>
> 当 Spring `@ComponentScan` 先扫描`com.acme` 包时，`B` 被当做 Spring Bean 的候选类。随后，`@DubboComponentScan` 也扫描相同的包。当应用启动时，`A` 和 `B`  虽然都是  Spring Bean，可仅 `A` 能够暴露 Dubbo 服务，`B` 则丢失。



问题版本：`2.5.7`、`2.5.8`

问题详情：https://github.com/alibaba/dubbo/issues/1120

修复版本：`2.5.9`（下个版本）







