---
type: docs
title: "Annotation configuration"
linkTitle: "Annotation Configuration"
weight: 3
description: "Develop Dubbo application with Annotation and Spring Boot"
---

This article uses the Spring Boot + Annotation mode to describe Dubbo application development. Check out the Spring Annotation development mode without Spring Boot here [complete example](https://github.com/apache/dubbo-samples/tree/master/1-basic/ dubbo-samples-annotation)

In Dubbo Spring Boot development, you only need to add a few annotations and configure the `application.properties` or `application.yml` file to complete the Dubbo service definition:
* Annotations include `@DubboService`, `@DubboReference` and `EnableDubbo`. Among them, `@DubboService` and `@DubboReference` are used to mark Dubbo services, and `EnableDubbo` starts Dubbo-related configuration and specifies the Spring Boot scanning package path.
* Configuration file `application.properties` or `application.yml`

For complete examples of the following content, please refer to [dubbo-samples](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-spring-boot)

## Add Maven dependency

Use Dubbo Spring Boot Starter to first introduce the following Maven dependencies
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

Then add it to the pom of the corresponding module
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
> Distinguish between ** and ** above

## application.yml or application.properties

Components other than service and reference can be set in the application.yml file. If you want to extend the annotation configuration of service or reference, you need to add `dubbo.properties` configuration file or use other non-annotation methods such as Java Config. For details, please See [Extended Annotation Configuration](#Extended Annotation Configuration) below.

Service and reference components can also be associated with global components in the application through `id`, take the following configuration as an example:

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

Associate the service with the specific registry defined above via annotations
```java
@DubboService(registry="zk-registry")
public class DemoServiceImpl implements DemoService {}
```

The same is true for association through Java Config configuration
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
## Annotation
### @DubboService annotation

> The `@Service` annotation has been deprecated since version 3.0, use `@DubboService` to distinguish it from Spring's `@Service` annotation

After defining the Dubbo service interface, provide the implementation logic of the service interface and mark it with `@DubboService` annotation to realize the service exposure of Dubbo

```java
@DubboService
public class DemoServiceImpl implements DemoService {}
```

If you want to set service parameters, `@DubboService` also provides a way to set common parameters. If you have more complex parameter setting requirements, you can consider using other setting methods
```java
@DubboService(version = "1.0.0", group = "dev", timeout = 5000)
public class DemoServiceImpl implements DemoService {}
```

### @DubboReference annotation

> The `@Reference` annotation has been deprecated since version 3.0, use `@DubboReference` to distinguish it from Spring's `@Reference` annotation

```java
@Component
public class DemoClient {
    @DubboReference
    private DemoService demoService;
}
```

The `@DubboReference` annotation will be automatically injected as a Dubbo service proxy instance, and remote service calls can be initiated using demoService

### @EnableDubbo annotation
The `@EnableDubbo` annotation must be configured, otherwise the service defined by the Dubbo annotation will not be loaded, `@EnableDubbo` can be defined on the main class

```java
@SpringBootApplication
@EnableDubbo
public class ProviderApplication {
    public static void main(String[] args) throws Exception {
        SpringApplication.run(ProviderApplication.class, args);
    }
}
```

Spring Boot annotations will only scan the package where the main class is located by default. If the service is defined in other packages, you need to add the configuration `EnableDubbo(scanBasePackages = {"org.apache.dubbo.springboot.demo.provider"})`

### Extended annotation configuration
Although the configuration parameters can be adjusted through `@DubboService` and `DubboReference` (as shown in the code snippet below), overall the configuration items provided by annotations are still very limited. In this case, if there are more complex parameter setting requirements, you can use `Java Config` or `dubbo.properties` two ways.

```java
@DubboService(version = "1.0.0", group = "dev", timeout = 5000)
@DubboReference(version = "1.0.0", group = "dev", timeout = 5000)
```

### Use Java Config instead of annotations

Note that Java Config is an alternative to `DubboService` or `DubboReference`, which is recommended for services with complex configuration requirements.

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
        service. setParameters(parameters);
        return service;
    }
}
```

### Supplementary configuration through dubbo.properties
For scenarios using `DubboService` or `DubboReference`, you can use dubbo.properties as a configuration supplement, [specific format](../principle/#1-configuration format) is explained in more detail here.

```properties
dubbo.service.org.apache.dubbo.springboot.demo.DemoService.timeout=5000
dubbo.service.org.apache.dubbo.springboot.demo.DemoService.parameters=[{myKey:myValue},{anotherKey:anotherValue}]
dubbo.reference.org.apache.dubbo.springboot.demo.DemoService.timeout=6000
```

> Properties format configuration is currently not very structural, for example, the key field is more redundant, and support for yaml format will be considered in the future.