#Annotation-Driven




##Annotation-Driven





### `@DubboComponentScan`





#### Start version： `2.5.7`







#### `<dubbo:annotation> `Historical issues





##### 1. Insufficient support for annotations



In Dubbo 2.5.7version before, Dubbo provides two core notes `@Service`and `@Reference`, Dubbo Dubbo and service delivery service references are used.


Among them, `@Service` as an XML element <dubbo:service>replacement annotated with Spring Framework @org.springframework.stereotype.Serviceis similar to the service provider Dubbo service exposure. Corresponding to `@Reference` it is an alternative <dubbo:referenceelement, similar to Spring `@Autowired`.



`2.5.7` The previous Dubbo, similar to the earlier Spring Framework 2.5, has insufficient annotation support. The annotation needs to be used with an XML configuration file as follows:

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





##### 2.  `@Service` Bean does not support Spring AOP



Meanwhile, the use of `<dubbo:annotation>`Dubbo scanned after `@Service`a problem in terms Spring agents, such as the issue GitHub [https://github.com/alibaba/dubbo/issues/794:](https://github.com/alibaba/dubbo/issues/794%EF%BC%9A)


> About the dubbo @Service annotation when generating the ServiceBean, the interface gets the bug of the spring proxy object.
>
> >In the project, I used it.
> >
> >```java
> >@Service
> >@Transactional
> >@com.alibaba.dubbo.config.annotation.Service
> >public class SUserJpushServiceImp
> >```
> >
> >In the form of to expose the service. But when publishing services, interface class is by
> >``
> >serviceConfig.setInterface(bean.getClass().getInterfaces()[0]);
> >``
> >obtaining a form, just, I have used the service @Transactional annotation, the object is a proxy. So the interface obtained is Spring's proxy interface...



Many enthusiastic partners not only discovered this legacy, but also proposed some repairs. At the same time, in order to better adapt to the Spring life cycle and transition Dubbo completely to the annotation-driven programming model, a new Dubbo component scan annotation was introduced `@DubboComponentScan`.



> Note: `<dubbo:annotation>` the Spring AOP issue will be `2.5.9`fixed in: [https://github.com/alibaba/dubbo/issues/1125](https://github.com/alibaba/dubbo/issues/1125)






##### 3. @Reference does not support field inheritance



Suppose there is a Spring Bean `AnnotationAction` directly from the fields `annotationService` labeled `@Reference` reference `AnnotationService`:

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



When `AnnotationAction` the XML element `<dubbo:annotation>` after the scan:

```xml
<dubbo:annotation package="com.alibaba.dubbo.examples.annotation.action"/>
```



Field `annotationService` can be referenced to `AnnotationService`, performing `doSayHello` the method can return to normal.

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



After the transformation, perform again `doSayHello` the method, `NullPointerException` will be thrown. Note Field inheritance is <dubbo:annotation>not supported `@Reference`.


Understand the historical issues, gather the overall vision, and introduce `@DubboComponentScan` the design principles below .







#### Design Principles





Spring Framework 3.1 introduces a new Annotation -`@ComponentScan` that completely replaces XML elements `<context:component-scan>`. Similarly, `@DubboComponentScan` as Dubbo `2.5.7` new Annotation, also XML elements `<dubbo:annotation>` alternatives.


In terms of naming (class names and attribute methods), in order to simplify the use and associated memory, the Dubbo component scans Annotation `@DubboComponentScan`, borrowing from Spring Boot 1.3 `@ServletComponentScan`. The definition is as follows:

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



> Note: `basePackages()` and `value()` can support a placeholder (placeholder) specified package name



In terms of responsibilities, it `@DubboComponentScan` is `@ServletComponentScan` more cumbersome than Spring Boot because it handles the Dubbo `@Service` class to expose Dubbo services, and also helps Spring Bean `@Reference` fields or methods to inject Dubbo service agents.



 In the scenario, the Spring Framework `@ComponentScan` component scan logic is more complicated. In `@DubboComponentScan` just concerned about `@Service` and `@Reference` deal with.


Functionally, ·@DubboComponentScan· not only the ability to provide full Spring AOP support, but also the ability to ·@Reference· inherit from fields.



After understanding the basic design principles, the following is a complete example, an introduction to `@DubboComponentScan` usage, and considerations.







#### Instructions



The following methods are introduced through the service provider ( `@Serivce`) and the service consumer (`@Reference`)` @DubboComponentScan`.


Assume that both the service provider and the service consumption score depend on the service interface `DemoService`:

```java
package com.alibaba.dubbo.demo;

public interface DemoService {

    String sayHello(String name);

}
```





##### Service provider ( `@Serivce`)



###### achieve `DemoService`



The service provider implements `DemoService` - `AnnotationDemoService` and also marks Dubbo `@Service`:

```java
package com.alibaba.dubbo.demo.provider;

import com.alibaba.dubbo.config.annotation.Service;
import com.alibaba.dubbo.demo.DemoService;

/**
 * Annotation {@link DemoService} implementation
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





###### Service Provider Annotation Configuration



The `AnnotationDemoService` exposure to Dubbo service, Bean relies on the `ApplicationConfig` Spring: , `ProtocolConfig` and `RegistryConfig` . These three Spring Beans used to assemble Spring Beans as XML files:

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-2.5.xsd
    http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd
    ">

    <!-- Service Provider Annotation Configuration -->
    <dubbo:application name="dubbo-annotation-provider"/>

    <!-- Connect to the registry configuration -->
    <dubbo:registry id="my-registry" address="N/A"/>

    <dubbo:protocol name="dubbo" port="12345"/>

</beans>
```

 

The above assembly method is not recommended. It is recommended to use the Annotation configuration, so it can be replaced `@Configuration` with the form of Spring Bean:


```java
package com.alibaba.dubbo.demo.config;

import com.alibaba.dubbo.config.ApplicationConfig;
import com.alibaba.dubbo.config.ProtocolConfig;
import com.alibaba.dubbo.config.RegistryConfig;
import com.alibaba.dubbo.config.spring.context.annotation.DubboComponentScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Service provider configuration
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
@Configuration
@DubboComponentScan("com.alibaba.dubbo.demo.provider") // 扫描 Dubbo 组件
public class ProviderConfiguration {

    /**
     * Current application configuration
     */
    @Bean("dubbo-annotation-provider")
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("dubbo-annotation-provider");
        return applicationConfig;
    }

    /**
     * Current connection registry configuration
     */
    @Bean("my-registry")
    public RegistryConfig registryConfig() {
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress("N/A");
        return registryConfig;
    }

    /**
     * Current connection registry configuration
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





###### Service provider guide class



```java
package com.alibaba.dubbo.demo.bootstrap;

import com.alibaba.dubbo.demo.DemoService;
import com.alibaba.dubbo.demo.config.ProviderConfiguration;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * Service provider guide class
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
public class ProviderBootstrap {

    public static void main(String[] args) {
        // Create an Annotation configuration context
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        // Registration configuration bean
        context.register(ProviderConfiguration.class);
        // Startup context
        context.refresh();
        // Get the DemoService Bean
        DemoService demoService = context.getBean(DemoService.class);
        // Execute the sayHello method
        String message = demoService.sayHello("World");
        // Console output information
        System.out.println(message);
    }
    
}
```



`ProviderBootstrap` After startup and execution, the control output is as expected:

```
Hello , World
```



A direct result of the above description `@DubboComponentScan` ("com.alibaba.dubbo.demo.provider")after scanning, mark Dubbo `@Service`is `AnnotationDemoService` being registered as Spring Bean, available free from the Spring ApplicationContext.





##### Service consumer ( `@Reference`)



###### service `DemoService`



```java
package com.alibaba.dubbo.demo.consumer;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.dubbo.demo.DemoService;

/**
 * Annotation Driver {@link DemoService} Consumer
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





###### Service Consumer Annotation Configuration


Similar to the service provider configuration, the service consumer may have a Dubbo related configuration bean - `ConsumerConfiguration`

```java
package com.alibaba.dubbo.demo.config;

import com.alibaba.dubbo.config.ApplicationConfig;
import com.alibaba.dubbo.config.RegistryConfig;
import com.alibaba.dubbo.config.spring.context.annotation.DubboComponentScan;
import com.alibaba.dubbo.demo.consumer.AnnotationDemoServiceConsumer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Service consumer configuration
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
@Configuration
@DubboComponentScan
public class ConsumerConfiguration {

    /**
     * Current application configuration
     */
    @Bean
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("dubbo-annotation-consumer");
        return applicationConfig;
    }

    /**
     * Current connection registry configuration
     */
    @Bean
    public RegistryConfig registryConfig() {
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress("N/A");
        return registryConfig;
    }

    /**
     * Register AnnotationDemoServiceConsumer, @DubboComponentScan will process the @Reference field.
     * If AnnotationDemoServiceConsumer is not a Spring Bean,
     * Even if @DubboComponentScan specifies package , it will not be processed, just like Spring @Autowired
     */
    @Bean
    public AnnotationDemoServiceConsumer annotationDemoServiceConsumer() {
        return new AnnotationDemoServiceConsumer();
    }

}
```



###### Service consumer guide class



The service consumer needs to first boot the service provider. The following instance will launch two Spring application contexts, first guiding the service provider Spring application context, and at the same time, need to reuse the previous Annotation configuration `ProviderConfiguration`:

```java
    /**
     * <pre class="tw-data-text tw-ta tw-text-medium" data-placeholder="translation" id="tw-target-text" dir="ltr" style="unicode-bidi: isolate; font-size: 29px; line-height: 36px; background-color: transparent; border: none; padding: 0px 0.14em 0px 0px; position: relative; margin: 0px; resize: none; font-family: inherit; overflow: hidden; text-align: left; width: 283px; white-space: pre-wrap; overflow-wrap: break-word;"> Start the service provider context</pre>

     */
    private static void startProviderContext() {
        // Create an Annotation configuration context
        AnnotationConfigApplicationContext providerContext = new AnnotationConfigApplicationContext();
        // Registration configuration bean
        providerContext.register(ProviderConfiguration.class);
        // Start the service provider context
        providerContext.refresh();
    }
```



Then guide the service consumer Spring application context:

```java
    /**
     * Start and return the service consumer context
     *
     * @return AnnotationConfigApplicationContext
     */
    private static ApplicationContext startConsumerContext() {
        // Create a service consumer Annotation configuration context
        AnnotationConfigApplicationContext consumerContext = new AnnotationConfigApplicationContext();
        // Registration Service Consumer Configuration Bean
        consumerContext.register(ConsumerConfiguration.class);
        // Start service consumer context
        consumerContext.refresh();
        // Return to service consumer Annotation configuration context
        return consumerContext;
    }
```



Complete guide class implementation:

```java
package com.alibaba.dubbo.demo.bootstrap;

import com.alibaba.dubbo.demo.config.ConsumerConfiguration;
import com.alibaba.dubbo.demo.config.ProviderConfiguration;
import com.alibaba.dubbo.demo.consumer.AnnotationDemoServiceConsumer;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * Service consumer boot class
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
public class ConsumerBootstrap {

    public static void main(String[] args) {
        // Start the service provider context
        startProviderContext();
        // Start and return the service consumer context
        ApplicationContext consumerContext = startConsumerContext();
        // Get the AnnotationDemoServiceConsumer Bean
        AnnotationDemoServiceConsumer consumer = consumerContext.getBean(AnnotationDemoServiceConsumer.class);
        // Execute the doSayHello method
        String message = consumer.doSayHello("World");
        // Output execution result
        System.out.println(message);
    }

    /**
     * Start and return the service consumer context
     *
     * @return AnnotationConfigApplicationContext
     */
    private static ApplicationContext startConsumerContext() {
        // Create a service consumer Annotation configuration context
        AnnotationConfigApplicationContext consumerContext = new AnnotationConfigApplicationContext();
        // Registration Service Consumer Configuration Bean
        consumerContext.register(ConsumerConfiguration.class);
        // Start service consumer context
        consumerContext.refresh();
        // Return to service consumer Annotation configuration context
        return consumerContext;
    }

    /**
     * Start the service provider context
     */
    private static void startProviderContext() {
        // Create an Annotation configuration context
        AnnotationConfigApplicationContext providerContext = new AnnotationConfigApplicationContext();
        // Registration configuration bean
        providerContext.register(ProviderConfiguration.class);
        // Start the service provider context
        providerContext.refresh();
    }

}
```



The `ConsumerBootstrap` result of the operation , still in line with expectations, `AnnotationDemoServiceConsumer` output:

```
Hello , World
```







####  Spring AOP support



The aforementioned `<dubbo:annotation>` registration Dubbo `@Service` after assembly, there is a problem AOP support in Spring. Business as Spring AOP capabilities expand, naturally in `<dubbo:annotation>` does not support the.



`@DubboComponentScan` In response to the above problems, it is fully compatible with Spring AOP. Make certain adjustments, annotations, `@EnableTransactionManagement` and custom implementations for the above service provider Annotation configuration `PlatformTransactionManager`:

```java
@Configuration
@DubboComponentScan("com.alibaba.dubbo.demo.provider") // Scan Dubbo components
@EnableTransactionManagement // Activate transaction management
public class ProviderConfiguration {
  // Omit other configuration Bean definitions
  
    /**
     * Custom transaction manager
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



Simultaneous adjustment `AnnotationDemoService` - increase `@Transactional` Note:

```java
@Service
@Transactional
public class AnnotationDemoService implements DemoService {
	// Omit implementation, stay the same
}
```



Run `ConsumerBootstrap` it again , observe the console output:

```
get transaction ...
commit transaction ...
Hello , World
```



Enter two lines of content in multiple, custom instructions `PlatformTransactionManager` getTransaction(TransactionDefinition)`and `commit(TransactionStatus)` method is executed, then explain `AnnotationDemoService` the `sayHello(String)` execution of a method, the transaction is also accompanied by the implementation.





#### Precautions



`ConsumerConfiguration` On `@DubboComponentScan` does not specify `basePackages` the scan, this will `ConsumerConfiguration` assume `basePackageClasses` that the scanned `ConsumerConfiguration` package belongs `com.alibaba.dubbo.demo.config` and a sub-package. Since there is no `@Service` class annotating Dubbo in the current example, the runtime log (if enabled) will output a warning message:

```
WARN :  [DUBBO] No Spring Bean annotating Dubbo's @Service was found in Spring BeanFactory, dubbo version: 2.0.0, current host: 127.0.0.1
```



The above information need not worry, because `@DubboComponentScan` in addition to the scanning Dubbo `@Service` assembly, will also handle `@Reference` field injection. However, readers are particularly concerned `@Reference` with the rules of field injection.



Above achieve, for example, AnnotationDemoServiceConsumermust be declared as Spring `@Bean` or `@Component`(or its derivative notes), otherwise it `@DubboComponentScan`will not take the initiative to label `@Reference` declaring class fields where mention become Spring Bean, in other words, if `@Reference`the statement is not a class field where the Spring Bean, then, `@DubboComponentScan` will not Processing `@Reference` injection, the principle is `@Autowired` consistent with Spring .



Improper use of the above may lead to related issues, such as a small partner question on GitHub: [https://github.com/alibaba/dubbo/issues/825](https://github.com/alibaba/dubbo/issues/825)


> **Li362692680**Question :
>
> > The @DubboComponentScan annotation scans the @Service annotation when scanning the package on the consumer side? ? Not @Reference annotation? ?
> > Startup Times 
> > DubboComponentScanRegistrar-85]-[main]-[INFO] 0 annotated @Service Components { [] }
>
> The author (** mercyblitz** ) replies:
>
> > `@Reference` Like `@Autowired`, like, the first of its kind to be declared as a Spring context Bean, therefore, Dubbo and not directly to `@Reference` class field where the upgrade to Bean.

> >
> > In summary, this is not a problem, but improper usage!





#### Known issue



In the latest release of Dubbo `2.5.8`, `@DubboComponentScan` Spring `@Service` incompatibility exists in the following special scenarios :

> Suppose there are two service implementation class `A` and `B` while stored in `com.acme` the package:
>
> * `A`  Mark Dubbo `@Service`
> * `B` Mark Dubbo `@Service`and Spring `@Service`
>
> When Spring `@ComponentScan` scans `com.acme` packages first , it Bis used as a candidate for Spring Beans. Subsequently, the `@DubboComponentScan` same package is also scanned. When the application starts, `A` and `B` though they are Spring Bean, may only `A` be exposed Dubbo service `B` is lost.



Problem in `2.5.7`versions: ,`2.5.8`

Details of the problem: [https://github.com/alibaba/dubbo/issues/1120](https://github.com/alibaba/dubbo/issues/1120)

Fix version: `2.5.9`(Next version)








