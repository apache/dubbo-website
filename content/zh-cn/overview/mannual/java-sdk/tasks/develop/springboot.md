---
description: Spring Boot
linkTitle: Spring Boot Starter
title: Spring Boot
type: docs
weight: 1
---

Dubbo 提供了对 Spring 框架的完整支持，我们推荐使用官方提供的丰富的 `dubbo-spring-boot-starter` 高效开发 Dubbo 微服务应用。

## 创建项目
创建 Dubbo 应用最快捷的方式就是使用官方项目脚手架工具 - <a href="https://start.dubbo.apache.org" target="_blank">start.dubbo.apache.org</a> 在线服务。它可以帮助开发者创建 Spring Boot 结构应用，自动管理 `dubbo-spring-boot-starter` 等依赖和必要配置。

另外，Jetbrain 官方也提供了 Apache Dubbo 项目插件，可用于快速创建 Dubbo Spring Boot 项目，能力与 start.dubbo.apache.org 对等，具体安装使用请查看 [博客文章](zh-cn/blog/2023/10/23/intellij-idea%EF%B8%8Fapache-dubboidea官方插件正式发布/)

## dubbo-spring-boot-starter
在 [快速开始](/zh-cn/overview/mannual/java-sdk/quick-start/) 中，我们已经详细介绍了典型的 Dubbo Spring Boot 工程源码及其项目结构，不熟悉的开发者可以前往查看。

`dubbo-spring-boot-starter` 可为项目引入 dubbo 核心依赖，自动扫描 dubbo 相关配置与注解。

### Maven 依赖

使用 Dubbo Spring Boot Starter 首先引入以下 Maven 依赖

```xml
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.apache.dubbo</groupId>
                <artifactId>dubbo-bom</artifactId>
                <version>3.3.0-beta.1</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
```

然后在相应的模块的 pom 中增加必要的 starter 依赖：
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

dubbo-spring-boot-starter 的版本号与 Dubbbo 框架版本号完全一致，因此你可以根据想要的 dubbo 版本选择 dubbo-spring-boot-starter 版本。以下是一些 dubbo-spring-boot-starter 版本对应的 SpringBoot、JDK 依赖：

| Dubbo Starter | 推荐 Spring Boot 版本 | 兼容 Spring Boot 范围 | JDK 要求 |
| --- | --- | --- | --- |
| 3.3.0 | 3.1.0 | [3.0.x ～ 3.2.x] | 17 |
| 3.2.21 | 2.6.10 | [2.x ~ 3.0.x) | 8 |
| 3.1.11 | 2.6.10 | [2.x ~ 3.0.x) | 8 |
| 2.7.21 | 2.3.10 |  | 8 |
| 2.6.0 |  |  | 7 |

以下是 Dubbo 官方提供的 starter 列表
* `dubbo-spring-boot-starter`，管理 dubbo 核心依赖，同时用于识别 application.properties 或 application.yml 中 `dubbo.` 开头的配置项，扫描 @DubboService 等注解。
* `dubbo-nacos-spring-boot-starter`，管理 nacos-client 等依赖，使用 Nacos 作为注册中心、配置中心时引入。
* `dubbo-zookeeper-spring-boot-starter`，管理 zookeeper、curator 等依赖，使用 Zookeeper 作为注册中心、配置中心时引入（Zookeeper server 3.4 及以下版本使用）。
* `dubbo-zookeeper-curator5-spring-boot-starter`，管理 zookeeper、curator5 等依赖，使用 Zookeeper 作为注册中心、配置中心时引入。
* `dubbo-sentinel-spring-boot-starter`，管理 sentinel 等依赖，使用 Sentinel 进行限流降级时引入。
* `dubbo-seata-spring-boot-starter`，管理 seata 等依赖，使用 Seata 作为分布式事务解决方案时引入。
* `dubbo-observability-spring-boot-starter`，加入该依赖将自动开启 Dubbo 内置的 metrics 采集，可用于后续的 Prometheus、Grafana 等监控系统。
* `dubbo-tracing-brave-spring-boot-starter`，管理 brave/zipkin、micrometer 等相关相关依赖，使用 Brave/Zipkin 作为 Tracer，将 Trace 信息 export 到 Zipkin
* `dubbo-tracing-otel-otlp-spring-boot-starter`，管理 brave/zipkin、micrometer 等相关相关依赖，使用 Brave/Zipkin 作为 Tracer，将 Trace 信息 export 到 Zipkin
* `dubbo-tracing-otel-zipkin-spring-boot-starter`，管理 brave/zipkin、micrometer 等相关相关依赖，使用 Brave/Zipkin 作为 Tracer，将 Trace 信息 export 到 Zipkin

{{% alert title="注意" color="info" %}}
* 关于每个 starter 适配的第三方组件版本，请查看 [组件版本映射表]()。
* 每个 starter 都有对应的 application.yml 配置，请到具体功能模块了解具体配置项与使用方法，我们对每个 starter 都有提供的使用示例。
{{% /alert %}}

### application.yml 配置文件
[参考手册 - 完整的配置项列表]()

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

### Dubbo 注解
* `application.properties` 或 `application.yml` 配置文件。
* `@DubboService`、`@DubboReference` 与 `EnableDubbo` 注解。其中 `@DubboService` 与 `@DubboReference` 用于标记 Dubbo 服务，`EnableDubbo` 启动 Dubbo 相关配置并指定 Spring Boot 扫描包路径。

#### @DubboService 注解

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

#### @DubboReference 注解

> `@Reference` 注解从 3.0 版本开始就已经废弃，改用 `@DubboReference`，以区别于 Spring 的 `@Reference` 注解

```java
@Component
public class DemoClient {
    @DubboReference
    private DemoService demoService;
}
```

`@DubboReference` 注解将自动注入为 Dubbo 服务代理实例，使用 demoService 即可发起远程服务调用

#### @EnableDubbo 注解
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

#### 扩展注解配置
虽然可以通过 `@DubboService` 和 `DubboReference` 调整配置参数（如下代码片段所示），但总体来说注解提供的配置项还是非常有限。在这种情况下，如果有更复杂的参数设置需求，可以使用 `Java Config` 或 `dubbo.properties` 两种方式。

```java
@DubboService(version = "1.0.0", group = "dev", timeout = 5000)
@DubboReference(version = "1.0.0", group = "dev", timeout = 5000)
```

#### 使用 Java Config 代替注解

注意，Java Config 是 `DubboService` 或 `DubboReference` 的替代方式，对于有复杂配置需求的服务建议使用这种方式。

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


#### 通过 dubbo.properties 补充配置
对于使用 `DubboService` 或 `DubboReference` 的场景，可以使用 dubbo.properties 作为配置补充，[具体格式](../principle/#1-配置格式)这里有更详细解释。

```properties
dubbo.service.org.apache.dubbo.springboot.demo.DemoService.timeout=5000
dubbo.service.org.apache.dubbo.springboot.demo.DemoService.parameters=[{myKey:myValue},{anotherKey:anotherValue}]
dubbo.reference.org.apache.dubbo.springboot.demo.DemoService.timeout=6000
```

> properties 格式配置目前结构性不太强，比如体现在 key 字段冗余较多，后续会考虑提供对于 yaml 格式的支持。

### actuator

## 更多微服务开发模式
* 纯 API 开发模式
* 其他 Spring
    * Spring XML 应用配置
    * Spring Annotation [完整示例](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-annotation)

## Dubbo 与 Spring Cloud 的关系
Dubbo 与 Spring Cloud 是两套平行的微服务开发与解决方案，两者都提供了微服务定义、发布、治理的相关能力，对于微服务开发者来说，我们建议在开发之初就确定好 Apache Dubbo 与 Spring Cloud 之间的选型，尽量避免两个不同体系在同一集群中出现，以降低集群维护复杂度。而对于一些确需两套体系共存的场景，为了解决相互之间的通信问题，我们提供了 [Dubbo 与 Spring Cloud 异构微服务体系互通最佳实践]() 解决方案。

 Dubbo 与 Spring Boot 是互补的关系，Dubbo 在 Spring Boot 体系之上提供了完整的微服务开发、治理能力，关于这一点我们在另一篇文章中有更详尽的说明：[Dubbo、Spring Cloud 与 Istio]()。



