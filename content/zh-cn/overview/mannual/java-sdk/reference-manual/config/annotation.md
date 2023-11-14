---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config/annotation/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config/annotation/
description: 以 Annotation、Spring Boot 开发 Dubbo 应用
linkTitle: Annotation 配置
title: Annotation 配置
type: docs
weight: 3
---






本文以 Spring Boot + Annotation 模式描述 Dubbo 应用开发，在此查看无 Spring Boot 的 Spring 注解开发模式

> [完整示例](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-annotation)

在 Dubbo Spring Boot 开发中，你只需要增加几个注解，并配置 `application.properties` 或 `application.yml` 文件即可完成 Dubbo 服务定义：
* 注解有 `@DubboService`、`@DubboReference` 与 `EnableDubbo`。其中 `@DubboService` 与 `@DubboReference` 用于标记 Dubbo 服务，`EnableDubbo` 启动 Dubbo 相关配置并指定 Spring Boot 扫描包路径。
* 配置文件 `application.properties` 或 `application.yml`

> [dubbo-samples](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-spring-boot)

## 增加 Maven 依赖

使用 Dubbo Spring Boot Starter 首先引入以下 Maven 依赖
```xml
    <dependencyManagement>
        <dependencies>
            <!-- Spring Boot -->
            <dependency>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-dependencies</artifactId>
                <version>${spring-boot.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <!-- Dubbo -->
            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-bom</artifactId>
                <version>${dubbo.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
            <!-- Zookeeper -->
            <!-- NOTICE: Dubbo only provides dependency management module for Zookeeper, add Nacos or other product dependency directly if you want to use them. -->
            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-dependencies-zookeeper</artifactId>
                <version>${dubbo.version}</version>
                <type>pom</type>
            </dependency>
        </dependencies>
    </dependencyManagement>
```

然后在相应的模块的 pom 中增加
```xml
    <dependencies>
        <!-- dubbo -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-dependencies-zookeeper</artifactId>
            <type>pom</type>
        </dependency>

        <!-- dubbo starter -->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
        </dependency>

        <!-- spring starter -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-autoconfigure</artifactId>
        </dependency>
    </dependencies>
```
> 区分上面的 **与**

## application.yml 或 application.properties

除 service、reference 之外的组件都可以在 application.yml 文件中设置，如果要扩展 service 或 reference 的注解配置，则需要增加 `dubbo.properties` 配置文件或使用其他非注解如 Java Config 方式，具体请看下文 [扩展注解的配置](#扩展注解配置)。

service、reference 组件也可以通过 `id` 与 application 中的全局组件做关联，以下面配置为例：

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
  protocol:
    name: dubbo
    port: -1
  registry:
    id: zk-registry
    address: zookeeper://127.0.0.1:2181
  config-center:
    address: zookeeper://127.0.0.1:2181
  metadata-report:
    address: zookeeper://127.0.0.1:2181
```

通过注解将 service 关联到上文定义的特定注册中心
```java
@DubboService(registry="zk-registry")
public class DemoServiceImpl implements DemoService {}
```

通过 Java Config 配置进行关联也是同样道理
```java
@Configuration
public class ProviderConfiguration {
    @Bean
    public ServiceConfig demoService() {
        ServiceConfig service = new ServiceConfig();
        service.setRegistry("zk-registry");
        return service;
    }
}
```
## 注解
### @DubboService 注解

> `@Service` 注解从 3.0 版本开始就已经废弃，改用 `@DubboService`，以区别于 Spring 的 `@Service` 注解

定义好 Dubbo 服务接口后，提供服务接口的实现逻辑，并用 `@DubboService` 注解标记，就可以实现 Dubbo 的服务暴露

```java
@DubboService
public class DemoServiceImpl implements DemoService {}
```

如果要设置服务参数，`@DubboService` 也提供了常用参数的设置方式。如果有更复杂的参数设置需求，则可以考虑使用其他设置方式
```java
@DubboService(version = "1.0.0", group = "dev", timeout = 5000)
public class DemoServiceImpl implements DemoService {}
```

### @DubboReference 注解

> `@Reference` 注解从 3.0 版本开始就已经废弃，改用 `@DubboReference`，以区别于 Spring 的 `@Reference` 注解

```java
@Component
public class DemoClient {
    @DubboReference
    private DemoService demoService;
}
```

`@DubboReference` 注解将自动注入为 Dubbo 服务代理实例，使用 demoService 即可发起远程服务调用

### @EnableDubbo 注解
`@EnableDubbo` 注解必须配置，否则将无法加载 Dubbo 注解定义的服务，`@EnableDubbo` 可以定义在主类上

```java
@SpringBootApplication
@EnableDubbo
public class ProviderApplication {
    public static void main(String[] args) throws Exception {
        SpringApplication.run(ProviderApplication.class, args);
    }
}
```

Spring Boot 注解默认只会扫描 main 类所在的 package，如果服务定义在其它 package 中，需要增加配置 `EnableDubbo(scanBasePackages = {"org.apache.dubbo.springboot.demo.provider"})`

### 扩展注解配置
虽然可以通过 `@DubboService` 和 `DubboReference` 调整配置参数（如下代码片段所示），但总体来说注解提供的配置项还是非常有限。在这种情况下，如果有更复杂的参数设置需求，可以使用 `Java Config` 或 `dubbo.properties` 两种方式。

```java
@DubboService(version = "1.0.0", group = "dev", timeout = 5000)
@DubboReference(version = "1.0.0", group = "dev", timeout = 5000)
```

### 使用 Java Config 代替注解

注意，Java Config 是 `DubboService` 或 `DubboReference` 的替代方式，对于有复杂配置需求的服务建议使用这种方式。

```java
@Configuration
public class ProviderConfiguration {
    @Bean
    public ServiceConfig demoService() {
        ServiceConfig service = new ServiceConfig();
        service.setInterface(DemoService.class);
        service.setRef(new DemoServiceImpl());
        service.setGroup("dev");
        service.setVersion("1.0.0");
        Map<String, String> parameters = new HashMap<>();
        service.setParameters(parameters);
        return service;
    }
}
```

### 通过 dubbo.properties 补充配置
对于使用 `DubboService` 或 `DubboReference` 的场景，可以使用 dubbo.properties 作为配置补充，[具体格式](../principle/#1-配置格式)这里有更详细解释。

```properties
dubbo.service.org.apache.dubbo.springboot.demo.DemoService.timeout=5000
dubbo.service.org.apache.dubbo.springboot.demo.DemoService.parameters=[{myKey:myValue},{anotherKey:anotherValue}]
dubbo.reference.org.apache.dubbo.springboot.demo.DemoService.timeout=6000
```

> properties 格式配置目前结构性不太强，比如体现在 key 字段冗余较多，后续会考虑提供对于 yaml 格式的支持。
