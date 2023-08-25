---
aliases:
    - /zh/overview/quickstart/java/brief/
description:
linkTitle: 一个微服务开发示例
title: 一个微服务开发示例
type: docs
weight: 1
---

以下文档将引导您从头创建一个基于 Spring Boot 的 Dubbo 微服务应用，包含 Triple 通信协议、服务发现等能力。

## 快速创建应用
强烈推荐使用 Dubbo 官方提供的脚手架工具快速创建 Dubbo 微服务项目，只需选中需要的功能或组件，脚手架就可以生成具有必要依赖的微服务工程。

<div class="col-lg-6 mt-5 mt-lg-3 mb-3 d-sm-block">
    <div class="column bg-texture center" style="min-height:320px" >
        <iframe style="height: 315px;position:relative;width: 100%; max-width:800px;" height="315" src="//player.bilibili.com/player.html?aid=737424422&bvid=BV1YD4y1g7Qk&cid=1024306839&page=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    </div>
</div>

请打开 <a href="https://start.dubbo.apache.org" target="_blank">Dubbo 微服务项目脚手架</a> 工具（支持浏览器页面和 IntelliJ IDEA 插件），参照以上视频步骤创建示例项目生成模板项目，按指引下载&导入您喜欢的IDE工具：

![脚手架生成的项目结构截图](xxx)

接下来就可以对您的微服务应用进行定制化开发了。

## 本地快速启动应用
在 IDE 开发环境中，通过以下入口类启动 Dubbo 应用。

![SpringApplication Run](xxx)

由于应用使用 [Triple 协议]()，在应用启动成功后，可直接使用 cURL 测试服务是否已经正常运行

```shell
curl
```

> 生成的示例中设计一个embedded zookeeper

## 项目源码说明（可选阅读）
### Maven 依赖
Dubbo 相关的核心依赖如下：

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

    <dependencies>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-nacos-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-zookeeper-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-observability-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-tracing-otel-starter</artifactId>
        </dependency>
    </dependencies>
```

### 服务定义

以下是一个标准的 Dubbo 服务定义，也可以选择 [使用 Protobuf 定义服务]()。

```java
public interface DemoService {
    String sayHello(String name);
}
```

在 `DemoService` 中，定义了 `sayHello` 这个方法。后续服务端发布的服务，消费端订阅的服务都是围绕着 `DemoService` 接口展开的。

### 提供服务实现

定义了服务接口之后，可以在服务端这一侧定义对应的实现。
```java
@DubboService
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        return "Hello " + name;
    }
}
```

在`DemoServiceImpl` 类中添加了 `@DubboService` 注解，通过这个配置可以基于 Spring Boot 去发布 Dubbo 服务。

### 发起服务调用
示例中有一个 consumer 包，用于模拟发起对 provider 服务的远程调用。

```java
@Component
public class Task implements CommandLineRunner {
    @DubboReference
    private DemoService demoService;

    @Override
    public void run(String... args) throws Exception {
        String result = demoService.sayHello("world");
        System.out.println("Receive result ======> " + result);
    }
}
```

在 `Task` 类中，通过`@DubboReference` 从 Dubbo 获取了一个 RPC 订阅，这个 `demoService` 可以像本地调用一样直接调用。在 `run`方法中创建了一个线程进行调用。

### 应用入口与配置文件

由于我们创建的是一个 Spring Boot 应用，Dubbo 相关配置信息都被直接存放在 `application.yml` 配置文件中。

```yaml
# application.yml
dubbo:
  application:
    name: dubbo-demo
  protocol:
    name: tri
    port: -1
  registry:
    address: zookeeper://${zookeeper.address:127.0.0.1}:2181
```

以下是整个应用的启动入口，额外加入了 `@EnableDubbo` 注解来启动 Dubbo 相关组件。

```java
@SpringBootApplication
@EnableDubbo
public class ProviderApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProviderApplication.class, args);
    }
}
```
