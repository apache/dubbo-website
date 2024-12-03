---
description: Dubbo provides full support for the Spring framework, and we recommend using the officially provided rich `dubbo-spring-boot-starter` for efficient development of Dubbo microservice applications.
linkTitle: Spring Boot Starter
title: Spring Boot
type: docs
weight: 1
---

Dubbo provides full support for the Spring framework, and we recommend using the official `dubbo-spring-boot-starter` for efficient development of Dubbo microservice applications.

## Creating a Project
The fastest way to create a Dubbo application is to use the official project scaffold tool - <a href="https://start.dubbo.apache.org" target="_blank">start.dubbo.apache.org</a> online service. It helps developers create Spring Boot structured applications and automatically manage dependencies like `dubbo-spring-boot-starter` along with necessary configurations.

Additionally, Jetbrain also provides an Apache Dubbo project plugin for quickly creating Dubbo Spring Boot projects, which is on par with start.dubbo.apache.org. For specific installation and usage.

## dubbo-spring-boot-starter
In the [Quick Start](/en/overview/mannual/java-sdk/quick-start/), we have detailed typical Dubbo Spring Boot project source code and its project structure. Developers who are unfamiliar can refer there.

`dubbo-spring-boot-starter` can introduce Dubbo core dependencies into the project and automatically scan Dubbo-related configurations and annotations.

### Maven Dependencies

To use the Dubbo Spring Boot Starter, first include the following Maven dependency:

```xml
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-bom</artifactId>
                <version>3.3.0</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
```

Then, add the necessary starter dependencies in the respective module's pom:
```xml
    <dependencies>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-zookeeper-spring-boot-starter</artifactId>
        </dependency>
    </dependencies>
```

`dubbo-spring-boot-starter` and `dubbo-zookeeper-spring-boot-starter` are official starters that provide integration adaptations for Spring Boot, and their version numbers are fully consistent with the Dubbo main framework version.

### application.yml Configuration File
Here is an example configuration file:

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
    logger: slf4j
  protocol:
    name: tri
    port: -1
  registry:
    address: zookeeper://127.0.0.1:2181
```

Other components besides service and reference can be set in the application.yml file, and for specifics, please refer to the [configuration list](/en/overview/mannual/java-sdk/reference-manual/config/spring/spring-boot/#applicationyaml).

Service and reference components can also be associated with global components in the application by using `id`, as in the following configuration. To extend the annotation configuration of service or reference, you need to add the `dubbo.properties` configuration file or use other non-annotation methods like Java Config; please see the section on Extending Annotation Configuration for details. 

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
  protocol:
    name: tri
    port: -1
  registry:
    id: zk-registry
    address: zookeeper://127.0.0.1:2181
```

Associate the service with the specific registry defined above (linked by id) using annotations:
```java
@DubboService(registry="zk-registry")
public class DemoServiceImpl implements DemoService {}
```

Using Java Config for association works similarly:
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

### Dubbo Annotations
* `application.properties` or `application.yml` configuration files.
* `@DubboService`, `@DubboReference`, and `EnableDubbo` annotations. Among them, `@DubboService` and `@DubboReference` are used to mark Dubbo services, while `EnableDubbo` starts Dubbo-related configurations and specifies the package path for Spring Boot scanning.

#### @DubboService Annotation

> The `@Service` annotation has been deprecated since version 3.0, replaced by `@DubboService` to differentiate it from the Spring `@Service` annotation.

Once the Dubbo service interface is defined, implement the service interface logic and mark it with the `@DubboService` annotation to expose the Dubbo service:

```java
@DubboService
public class DemoServiceImpl implements DemoService {}
```

If you need to set service parameters, `@DubboService` also provides a way to set common parameters. For more complex parameter settings, consider using other configuration methods:
```java
@DubboService(version = "1.0.0", group = "dev", timeout = 5000)
public class DemoServiceImpl implements DemoService {}
```

#### @DubboReference Annotation

> The `@Reference` annotation has been deprecated since version 3.0, replaced by `@DubboReference` to differentiate it from the Spring `@Reference` annotation.

```java
@Component
public class DemoClient {
    @DubboReference
    private DemoService demoService;
}
```

The `@DubboReference` annotation will automatically inject a Dubbo service proxy instance, allowing remote service calls via demoService.

#### @EnableDubbo Annotation
The `@EnableDubbo` annotation must be configured; otherwise, services defined by Dubbo annotations will not load. `@EnableDubbo` can be defined on the main class:

```java
@SpringBootApplication
@EnableDubbo
public class ProviderApplication {
    public static void main(String[] args) throws Exception {
        SpringApplication.run(ProviderApplication.class, args);
    }
}
```

Spring Boot annotations will only scan the package where the main class is located by default. If services are defined in other packages, you need to add the configuration `EnableDubbo(scanBasePackages = {"org.apache.dubbo.springboot.demo.provider"})`.

#### Extending Annotation Configuration
While it is possible to adjust configuration parameters through `@DubboService` and `DubboReference` (as shown in the code snippet below), overall, annotations are designed for ease of use and provide only 80% of commonly used configuration items for scenarios. In such cases, if there are more complex parameter setting needs, you can use either Java Config or `dubbo.properties`.

```java
@DubboService(version = "1.0.0", group = "dev", timeout = 5000)
@DubboReference(version = "1.0.0", group = "dev", timeout = 5000)
```

#### Using Java Config in Place of Annotations

Note that Java Config is an alternative to `DubboService` or `DubboReference`. For services with complex configuration needs, this approach is recommended.

```java
@Configuration
public class ProviderConfiguration {
    @Bean
    public ServiceBean demoService() {
        ServiceBean service = new ServiceBean();
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

#### Supplementing Configuration Through dubbo.properties
For scenarios using `DubboService` or `DubboReference`, additional configuration can be provided by adding a dubbo.properties file under the project's resources directory. [Specific format](../principle/) has more detailed explanations here.

```properties
dubbo.service.org.apache.dubbo.springboot.demo.DemoService.timeout=5000
dubbo.service.org.apache.dubbo.springboot.demo.DemoService.parameters=[{myKey:myValue},{anotherKey:anotherValue}]
dubbo.reference.org.apache.dubbo.springboot.demo.DemoService.timeout=6000
```

> The properties format currently has limited structural strength, such as excessive redundancy in key fields, and support for YAML format will be considered in the future.

## More Microservice Development Patterns
* [Pure API Development Pattern](../api/)
* Other Spring Development Patterns
    * [Spring XML](/en/overview/mannual/java-sdk/reference-manual/config/spring/xml/)

## Relationship Between Dubbo and Spring Cloud

Dubbo and Spring Boot have a complementary relationship, where Dubbo provides complete microservice development and governance capabilities atop the Spring Boot framework. More detailed explanations on this can be found in another article: [Dubbo, Spring Cloud, and Istio](/en/overview/what/xyz-difference/).

