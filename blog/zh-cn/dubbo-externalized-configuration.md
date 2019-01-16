# Dubbo 外部化配置（Externalized Configuration）




## 外部化配置（External Configuration）



在[Dubbo 注解驱动](Dubbo-Annotation-Driven.md)例子中，无论是服务提供方，还是服务消费方，均需要转配相关配置Bean：

```java
    @Bean
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("dubbo-annotation-consumer");
        return applicationConfig;
    }
```



虽然实现类似于`ProviderConfiguration` 和 `ConsumerConfiguration` 这样的 Spring  `@Configuration` Bean 成本并不高，不过通过 Java Code 的方式定义配置 Bean，或多或少是一种 Hard Code（硬编码）的行为，缺少弹性。



尽管在 Spring 应用中，可以通过 `@Value` 或者 `Environment` 的方式获取外部配置，其代码简洁性以及类型转换灵活性存在明显的不足。因此，Spring Boot  提出了外部化配置（External Configuration）的感念，即通过程序以外的配置源，动态地绑定指定类型。



随着 Spring Boot / Spring Cloud 应用的流行，开发人员逐渐地接受并且使用 Spring Boot 外部化配置（External Configuration），即通过 `application.properties` 或者 `bootstrap.properties` 装配配置 Bean。



下列表格记录了 Dubbo 内置配置类：

| 配置类                 | 标签                     | 用途     | 解释                                       |
| ------------------- | ---------------------- | ------ | ---------------------------------------- |
| `ProtocolConfig`    | `<dubbo:protocol/>`    | 协议配置   | 用于配置提供服务的协议信息，协议由提供方指定，消费方被动接受           |
| `ApplicationConfig` | `<dubbo:application/>` | 应用配置   | 用于配置当前应用信息，不管该应用是提供者还是消费者                |
| `ModuleConfig`      | `<dubbo:module/>`      | 模块配置   | 用于配置当前模块信息，可选                            |
| `RegistryConfig`    | `<dubbo:registry/>`    | 注册中心配置 | 用于配置连接注册中心相关信息                           |
| `MonitorConfig`     | `<dubbo:monitor/>`     | 监控中心配置 | 用于配置连接监控中心相关信息，可选                        |
| `ProviderConfig`    | `<dubbo:provider/>`    | 提供方配置  | 当 ProtocolConfig 和 ServiceConfig 某属性没有配置时，采用此缺省值，可选 |
| `ConsumerConfig`    | `<dubbo:consumer/>`    | 消费方配置  | 当 ReferenceConfig 某属性没有配置时，采用此缺省值，可选     |
| `MethodConfig`      | `<dubbo:method/>`      | 方法配置   | 用于 ServiceConfig 和 ReferenceConfig 指定方法级的配置信息 |
| `ArgumentConfig`    | `<dubbo:argument/>`    | 参数配置   | 用于指定方法参数配置                               |



通过申明对应的 Spring 扩展标签，在 Spring 应用上下文中将自动生成相应的配置 Bean。



在 Dubbo 官方用户手册的[“属性配置”](http://dubbo.io/books/dubbo-user-book/configuration/properties.html)章节中，`dubbo.properties` 配置属性能够映射到  `ApplicationConfig` 、`ProtocolConfig` 以及 `RegistryConfig` 的字段。从某种意义上来说，`dubbo.properties`  也是 Dubbo 的外部化配置。



其中，引用“映射规则”的内容：

>## 映射规则
>
>将 XML 配置的标签名，加属性名，用点分隔，多个属性拆成多行
>
>* 比如：`dubbo.application.name=foo`等价于`<dubbo:application name="foo" />`
>* 比如：`dubbo.registry.address=10.20.153.10:9090`等价于`<dubbo:registryaddress="10.20.153.10:9090" />`
>
>如果 XML 有多行同名标签配置，可用 id 号区分，如果没有 id 号将对所有同名标签生效
>
>* 比如：`dubbo.protocol.rmi.port=1234`等价于`<dubbo:protocol id="rmi" name="rmi" port="1099" />`[2](http://dubbo.io/books/dubbo-user-book/configuration/properties.html#fn_2)
>* 比如：`dubbo.registry.china.address=10.20.153.10:9090`等价于`<dubbo:registry id="china"address="10.20.153.10:9090" />`
>
>下面是 dubbo.properties 的一个典型配置：
>
>```
>dubbo.application.name=foo
>dubbo.application.owner=bar
>dubbo.registry.address=10.20.153.10:9090
>```



根据“映射规则”，Dubbo 即支持单配置 Bean 映射，也支持多 Bean 映射。综合以上需求，既要兼容 Dubbo 已有的一个或多个 Bean 字段映射绑定，也支持外部化配置。

> 特别提醒：外部化配置（External Configuration）并非 Spring Boot 特有，即使在 Spring Framework 场景下亦能支持。也就是说 Dubbo 外部化配置即可在 Spring Framework 中工作，也能在 Spring Boot 中运行。



Dubbo 外部化配置（External Configuration） 支持起始版本为：`2.5.8`





### `@EnableDubboConfig`



#### 起始版本：`2.5.8`



#### 使用说明



##### `@EnableDubboConfig` 定义

```java
public @interface EnableDubboConfig {

    /**
     * It indicates whether binding to multiple Spring Beans.
     *
     * @return the default value is <code>false</code>
     * @revised 2.5.9
     */
    boolean multiple() default false;

}
```



* `multiple` : 表示是否支持多Dubbo 配置 Bean 绑定。默认值为 `false` ，即单 Dubbo 配置 Bean 绑定



##### 单 Dubbo 配置 Bean 绑定



为了更好地向下兼容，`@EnableDubboConfig` 提供外部化配置属性与 Dubbo 配置类之间的绑定，其中映射关系如下：

| 配置类                 | 外部化配置属性前缀           | 用途     |
| ------------------- | ------------------- | ------ |
| `ProtocolConfig`    | `dubbo.protocol`    | 协议配置   |
| `ApplicationConfig` | `dubbo.application` | 应用配置   |
| `ModuleConfig`      | `dubbo.module`      | 模块配置   |
| `RegistryConfig`    | `dubbo.registry`    | 注册中心配置 |
| `MonitorConfig`     | `dubbo.monitor`     | 监控中心配置 |
| `ProviderConfig`    | `dubbo.provider`    | 提供方配置  |
| `ConsumerConfig`    | `dubbo.consumer`    | 消费方配置  |



当标注 `@EnableDubboConfig` 的类被扫描注册后，同时  Spring（Spring Boot）应用配置（`PropertySources`）中存在`dubbo.application.*` 时，`ApplicationConfig`  Bean 将被注册到在 Spring 上下文。否则，不会被注册。如果出现`dubbo.registry.*`的配置，那么，`RegistryConfig` Bean 将会创建，以此类推。即按需装配 Dubbo 配置 Bean。



如果需要指定配置 Bean的 id，可通过`**.id` 属性设置，以`dubbo.application` 为例：

```properties
## application
dubbo.application.id = applicationBean
dubbo.application.name = dubbo-demo-application
```



以上配置等同于以下 Java Config Bean：

```java
    @Bean("applicationBean")
    public ApplicationConfig applicationBean() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("dubbo-demo-application");
        return applicationConfig;
    }
```



大致上配置属性与配置类绑定模式 - `dubbo.application.* ` 映射到 `ApplicationConfig` 中的字段。

> 注：当配置属性名称无法在配置类中找到字段时，将会忽略绑定





##### 多 Dubbo 配置 Bean 绑定



Dubbo `@Service` 和 `@Reference` 允许 Dubbo 应用关联`ApplicationConfig` Bean 或者指定多个`RegistryConfig` Bean 等能力。换句话说，Dubbo 应用上下文中可能存在多个`ApplicationConfig` 等 Bean定义。



为了适应以上需要，因此从Dubbo `2.5.9` 开始，`@EnableDubboConfig` 支持多 Dubbo 配置 Bean 绑定，同时按照业界规约标准，与单 Dubbo 配置 Bean 绑定约定不同，配置属性前缀均为英文复数形式：

> 详情请参考 ：https://github.com/alibaba/dubbo/issues/1141



* `dubbo.applications`
* `dubbo.modules`
* `dubbo.registries`
* `dubbo.protocols`
* `dubbo.monitors`
* `dubbo.providers`
* `dubbo.consumers`



以`dubbo.applications` 为例，基本的模式如下：

```properties
dubbo.applications.${bean-name}.property-name = ${property-value}
```



请读者注意，在单 Dubbo 配置 Bean 绑定时，可以通过指定`id` 属性的方式，定义`ApplicationConfig` Bean 的ID，即`dubbo.application.id`。

而在多 Dubbo 配置 Bean 绑定时，Bean ID 则由`dubbo.applications.`与属性字段名称（`.property-name`)之间的字符来表达。



如下配置：

```properties
# multiple Bean definition
dubbo.applications.applicationBean.name = dubbo-demo-application
dubbo.applications.applicationBean2.name = dubbo-demo-application2
dubbo.applications.applicationBean3.name = dubbo-demo-application3
```



该配置内容中，绑定了三个`ApplicationConfig` Bean，分别是`applicationBean`、`applicationBean2`以及`applicationBean3`



#### 示例说明



`@EnableDubboConfig` 的使用方法很简答， 再次强调一点，当规约的外部配置存在时，相应的 Dubbo 配置类 才会提升为 Spring Bean。简言之，按需装配。





##### 单 Dubbo 配置 Bean 绑定



###### 外部化配置文件



将以下内容的外部化配置文件物理路径为：`classpath:/META-INF/config.properties`:

```properties
# 单 Dubbo 配置 Bean 绑定
## application
dubbo.application.id = applicationBean
dubbo.application.name = dubbo-demo-application

## module
dubbo.module.id = moduleBean
dubbo.module.name = dubbo-demo-module

## registry
dubbo.registry.address = zookeeper://192.168.99.100:32770

## protocol
dubbo.protocol.name = dubbo
dubbo.protocol.port = 20880

## monitor
dubbo.monitor.address = zookeeper://127.0.0.1:32770

## provider
dubbo.provider.host = 127.0.0.1

## consumer
dubbo.consumer.client = netty
```



###### `@EnableDubboConfig` 配置 Bean



```java
/**
 * Dubbo 配置 Bean
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
@EnableDubboConfig
@PropertySource("META-INF/config.properties")
@Configuration
public class DubboConfiguration {

}
```



###### 实现引导类



```java
/**
 * Dubbo 配置引导类
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
public class DubboConfigurationBootstrap {

    public static void main(String[] args) {
        // 创建配置上下文
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        // 注册当前配置 Bean
        context.register(DubboConfiguration.class);
        context.refresh();
 	    // application
        ApplicationConfig applicationConfig = context.getBean("applicationBean", ApplicationConfig.class);
        System.out.printf("applicationBean.name = %s \n", applicationConfig.getName());

        // module
        ModuleConfig moduleConfig = context.getBean("moduleBean", ModuleConfig.class);
        System.out.printf("moduleBean.name = %s \n", moduleConfig.getName());

        // registry
        RegistryConfig registryConfig = context.getBean(RegistryConfig.class);
        System.out.printf("registryConfig.name = %s \n", registryConfig.getAddress());

        // protocol
        ProtocolConfig protocolConfig = context.getBean(ProtocolConfig.class);
        System.out.printf("protocolConfig.name = %s \n", protocolConfig.getName());
        System.out.printf("protocolConfig.port = %s \n", protocolConfig.getPort());

        // monitor
        MonitorConfig monitorConfig = context.getBean(MonitorConfig.class);
        System.out.printf("monitorConfig.name = %s \n", monitorConfig.getAddress());

        // provider
        ProviderConfig providerConfig = context.getBean(ProviderConfig.class);
        System.out.printf("providerConfig.name = %s \n", providerConfig.getHost());

        // consumer
        ConsumerConfig consumerConfig = context.getBean(ConsumerConfig.class);
        System.out.printf("consumerConfig.name = %s \n", consumerConfig.getClient());
    }
}
```



###### 执行结果



```
applicationBean.name = dubbo-demo-application 
moduleBean.name = dubbo-demo-module 
registryConfig.name = zookeeper://192.168.99.100:32770 
protocolConfig.name = dubbo 
protocolConfig.port = 20880 
monitorConfig.name = zookeeper://127.0.0.1:32770 
providerConfig.name = 127.0.0.1 
consumerConfig.name = netty 
```



不难发现，`@EnableDubboConfig` 配置 Bean 配合外部化文件 `classpath:/META-INF/config.properties`，与执行输出内容相同。





##### 多 Dubbo 配置 Bean 绑定



###### 外部化配置文件



将以下内容的外部化配置文件物理路径为：`classpath:/META-INF/multiple-config.properties`:

```properties
# 多 Dubbo 配置 Bean 绑定
## dubbo.applications
dubbo.applications.applicationBean.name = dubbo-demo-application
dubbo.applications.applicationBean2.name = dubbo-demo-application2
dubbo.applications.applicationBean3.name = dubbo-demo-application3
```



######  `@EnableDubboConfig`  配置 Bean（多）



```java
@EnableDubboConfig(multiple = true)
@PropertySource("META-INF/multiple-config.properties")
private static class DubboMultipleConfiguration {

}	
```



###### 实现引导类



```java
/**
 * Dubbo 配置引导类
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
public class DubboConfigurationBootstrap {
    public static void main(String[] args) {
        // 创建配置上下文
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        // 注册当前配置 Bean
        context.register(DubboMultipleConfiguration.class);
        context.refresh();

        // 获取 ApplicationConfig Bean："applicationBean"、"applicationBean2" 和 "applicationBean3"
        ApplicationConfig applicationBean = context.getBean("applicationBean", ApplicationConfig.class);
        ApplicationConfig applicationBean2 = context.getBean("applicationBean2", ApplicationConfig.class);
        ApplicationConfig applicationBean3 = context.getBean("applicationBean3", ApplicationConfig.class);

        System.out.printf("applicationBean.name = %s \n", applicationBean.getName());
        System.out.printf("applicationBean2.name = %s \n", applicationBean2.getName());
        System.out.printf("applicationBean3.name = %s \n", applicationBean3.getName());
    }
}
```



###### 执行结果



```
applicationBean.name = dubbo-demo-application 
applicationBean2.name = dubbo-demo-application2 
applicationBean3.name = dubbo-demo-application3 
```



`@EnableDubboConfig(multiple = true)` 执行后，运行结果说明`ApplicationConfig` Bean 以及 ID 的定义方式。 





### `@EnableDubboConfigBinding` & `@EnableDubboConfigBindings`



`@EnableDubboConfig`适合绝大多数外部化配置场景，然而无论是单 Bean 绑定，还是多 Bean 绑定，其**外部化配置属性前缀**是固化的，如`dubbo.application` 以及 `dubbo.applications` 。



当应用需要自定义**外部化配置属性前缀**，`@EnableDubboConfigBinding`能提供更大的弹性，支持单个外部化配置属性前缀（`prefix`) 与 Dubbo 配置 Bean 类型（`AbstractConfig` 子类）绑定，如果需要多次绑定时，可使用`@EnableDubboConfigBindings`。

> 尽管 Dubbo 推荐使用 Java 8 ，然而实际的情况，运行时的 JDK 的版本可能从 6到8 均有。因此，`@EnableDubboConfigBinding` 没有实现`java.lang.annotation.Repeatable`，即允许实现类不支持重复标注`@EnableDubboConfigBinding`。



`@EnableDubboConfigBinding`  在支持外部化配置属性与 Dubbo 配置类绑定时，与 Dubbo 过去的映射行为不同，被绑定的 Dubbo 配置类将会提升为 Spring Bean，无需提前装配 Dubbo 配置类。同时，支持多 Dubbo 配置Bean 装配。其 Bean 的绑定规则与`@EnableDubboConfig`一致。



#### 起始版本： `2.5.8`



#### 使用说明



##### `@EnableDubboConfigBinding` 定义



```java
public @interface EnableDubboConfigBinding {

    /**
     * The name prefix of the properties that are valid to bind to {@link AbstractConfig Dubbo Config}.
     *
     * @return the name prefix of the properties to bind
     */
    String prefix();

    /**
     * @return The binding type of {@link AbstractConfig Dubbo Config}.
     * @see AbstractConfig
     * @see ApplicationConfig
     * @see ModuleConfig
     * @see RegistryConfig
     */
    Class<? extends AbstractConfig> type();

    /**
     * It indicates whether {@link #prefix()} binding to multiple Spring Beans.
     *
     * @return the default value is <code>false</code>
     */
    boolean multiple() default false;

}
```



* `prefix()` : 指定待绑定 Dubbo 配置类的外部化配置属性的前缀，比如`dubbo.application`  为 `ApplicationConfig` 的外部化配置属性的前缀。`prefix()` 支持占位符（Placeholder）, 并且其关联前缀值是否以"." 作为结尾字符是可选的，即`prefix() = "dubbo.application"` 与 `prefix() = "dubbo.application."` 效果相同 
* `type()` : 指定 Dubbo 配置类，所有 `AbstractConfig` 的实现子类即可，如`ApplicationConfig` 、`RegistryConfig` 以及 `ProtocolConfig` 等
* `multiple()` : 表明是否需要将`prefix()`   作为多个 `type()`   类型的 Spring Bean 外部化配置属性。默认值为`false`，即默认支持单个类型的 Spring 配置 Bean




假设标注 `@EnableDubboConfigBinding` 的实现类被 Spring 应用上下文扫描并且注册后，其中`prefix()` =  `dubbo.app` 、 `type()` = `ApplicationConfig.class` ，且外部配置内容为：

```properties
dubbo.app.id = applicationBean
dubbo.app.name = dubbo-demo-application
```



Spring 应用上下文启动后，一个 ID 为 "applicationBean"   的 `ApplicationConfig`  Bean 被初始化，其 `name` 字段被设置为 "dubbo-demo-application"。



##### `EnableDubboConfigBindings` 定义



```java
public @interface EnableDubboConfigBindings {

    /**
     * The value of {@link EnableDubboConfigBindings}
     *
     * @return non-null
     */
    EnableDubboConfigBinding[] value();

}
```



* `value` : 指定多个`EnableDubboConfigBinding`，用于实现外部化配置属性前缀（`prefix`) 与 Dubbo 配置 Bean 类型（`AbstractConfig` 子类）绑定。



#### 示例说明



##### 外部化配置文件



将以下内容的外部化配置文件物理路径为：`classpath:/META-INF/bindings.properties`

```properties
# classpath:/META-INF/bindings.properties
## 占位符值 : ApplicationConfig 外部配置属性前缀
applications.prefix = dubbo.apps.

## 多 ApplicationConfig Bean 绑定
dubbo.apps.applicationBean.name = dubbo-demo-application
dubbo.apps.applicationBean2.name = dubbo-demo-application2
dubbo.apps.applicationBean3.name = dubbo-demo-application3

## 单 ModuleConfig Bean 绑定
dubbo.module.id = moduleBean
dubbo.module.name = dubbo-demo-module

## 单 RegistryConfig Bean 绑定
dubbo.registry.address = zookeeper://192.168.99.100:32770
```





##### `EnableDubboConfigBindings` 配置 Bean



`DubboConfiguration` 作为 Dubbo 配置 Bean，除通过 `@EnableDubboConfigBinding` 绑定之外，还需要 `@PropertySource` 指定外部化配置文件（`classpath:/META-INF/bindings.properties`）:

```java
/**
 * Dubbo 配置 Bean
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
@EnableDubboConfigBindings({
        @EnableDubboConfigBinding(prefix = "${applications.prefix}",
                type = ApplicationConfig.class, multiple = true), // 多 ApplicationConfig Bean 绑定
        @EnableDubboConfigBinding(prefix = "dubbo.module", // 不带 "." 后缀
                type = ModuleConfig.class), // 单 ModuleConfig Bean 绑定
        @EnableDubboConfigBinding(prefix = "dubbo.registry.", // 带 "." 后缀
                type = RegistryConfig.class) // 单 RegistryConfig Bean 绑定
})
@PropertySource("META-INF/bindings.properties")
@Configuration
public class DubboConfiguration {
  
}
```





##### 实现引导类



通过之前的使用说明，当 `EnableDubboConfigBinding` 将外部配置化文件`classpath:/META-INF/dubbo.properties` 绑定到 `ApplicationConfig`后，其中 Spring Bean "applicationBean" 的 name 字段被设置成 "dubbo-demo-application"。同时， `EnableDubboConfigBinding`  所标注的 `DubboConfiguration` 需要被 Sring 应用上下文注册：

```java
/**
 * Dubbo 配置引导类
 *
 * @author <a href="mailto:mercyblitz@gmail.com">Mercy</a>
 */
public class DubboConfigurationBootstrap {

    public static void main(String[] args) {
        // 创建配置上下文
        AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext();
        // 注册当前配置 Bean
        context.register(DubboConfiguration.class);
        context.refresh();
 		// 获取 ApplicationConfig Bean："applicationBean"、"applicationBean2" 和 "applicationBean3"
        ApplicationConfig applicationBean = context.getBean("applicationBean", ApplicationConfig.class);
        ApplicationConfig applicationBean2 = context.getBean("applicationBean2", ApplicationConfig.class);
        ApplicationConfig applicationBean3 = context.getBean("applicationBean3", ApplicationConfig.class);

        System.out.printf("applicationBean.name = %s \n", applicationBean.getName());
        System.out.printf("applicationBean2.name = %s \n", applicationBean2.getName());
        System.out.printf("applicationBean3.name = %s \n", applicationBean3.getName());

        // 获取 ModuleConfig Bean："moduleBean"
        ModuleConfig moduleBean = context.getBean("moduleBean", ModuleConfig.class);

        System.out.printf("moduleBean.name = %s \n", moduleBean.getName());

        // 获取 RegistryConfig Bean
        RegistryConfig registry = context.getBean(RegistryConfig.class);

        System.out.printf("registry.address = %s \n", registry.getAddress());
    }
}
```



##### 运行结果



`DubboConfigurationBootstrap` 运行后控制台输出：

```
applicationBean.name = dubbo-demo-application 
applicationBean2.name = dubbo-demo-application2 
applicationBean3.name = dubbo-demo-application3 
moduleBean.name = dubbo-demo-module 
registry.address = zookeeper://192.168.99.100:32770 
```



输出的内容与`classpath:/META-INF/bindings.properties` 绑定的内容一致，符合期望。
