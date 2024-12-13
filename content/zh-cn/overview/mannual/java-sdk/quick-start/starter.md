---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config/overview/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config/overview/
    - /zh-cn/overview/mannual/java-sdk/quick-start/spring-boot/
description: 快速开始，学习如何使用 dubbo-nacos-spring-boot-starter 从头创建基于一个基于Spring Boot的Dubbo应用。
linkTitle: 创建基于Spring Boot的Dubbo应用
title: 创建基于Spring Boot的微服务应用
type: docs
weight: 2
---

以下文档将引导您从头创建一个基于 Spring Boot 的 Dubbo 应用，并为应用配置 Triple 通信协议、服务发现等微服务基础能力。

## 快速创建应用
以下是我们为您提前准备好的示例项目，可通过如下命令快速下载示例源码。在实际开发中，您也可以访问 [start.dubbo.apache.org](/zh-cn/overview/mannual/java-sdk/tasks/develop/springboot/#创建项目) 快速创建一个全新的 Dubbo 应用模板。

```shell
curl -O -# https://dubbo-demo.oss-cn-hangzhou.aliyuncs.com/quickstart/dubbo-quickstart.zip
unzip dubbo-quickstart
cd dubbo-quickstart
````
{{% alert title="提示" color="info" %}}
本项目源码在 Dubbo Github 示例仓库中维护 [https://github.com/apache/dubbo-samples](https://github.com/apache/dubbo-samples/tree/master/11-quickstart)
{{% /alert %}}

## 本地启动应用
接下来，让我们尝试在本地启动应用。运行以下命令启动应用：

```shell
chmod a+x ./mvnw
./mvnw clean install -DskipTests
./mvnw compile -pl quickstart-service exec:java -Dexec.mainClass="org.apache.dubbo.samples.quickstart.QuickStartApplication"
```

{{% alert title="注意" color="warning" %}}
* 运行示例要求 JDK 17+ 版本。
* 由于配置文件中启用了注册中心，您需要首先在本地启动 <a href="/zh-cn/overview/reference/integrations/nacos/" target="_blank_">Nacos</a> 注册中心 server。或者参考下一篇 Kubernetes 部署方式。
{{% /alert %}}

在应用启动成功后，本地进程使用 <a href="overview/mannual/java-sdk/tasks/protocols/triple" target="_blank_">Triple </a>协议在指定端口发布了服务。同时可以看到消费端持续对提供端发起调用：

```text
Started QuickStartApplication in 4.38 seconds (process running for 4.629)
Receive result ======> Hello world
```

可直接使用 cURL 测试服务是否已经正常运行：

```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50051/org.apache.dubbo.samples.quickstart.dubbo.api.DemoService/sayHello/
```

除了使用命令行之外，我们还可以在 IDE 中启动项目，调整示例或进行本地 debug。

## 源码解析
将以上准备好的示例项目导入最喜欢的 IDE 开发工具（以 IntelliJ IDEA 为例），项目结构如下：

<img style="max-width:400px;height:auto;" alt="项目结构截图" src="/imgs/v3/quickstart/samples.jpg"/>

### Maven 依赖
打开 pom.xml，可以看到示例项目中 Dubbo 相关核心依赖如下：

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

    <dependencies>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-nacos-spring-boot-starter</artifactId>
        </dependency>
    </dependencies>
```

其中，`dubbo-spring-boot-starter`、`dubbo-nacos-spring-boot-starter` 分别为我们引入了 Dubbo 内核框架与 Nacos 客户端相关的依赖组件，更多内容可以查看 [Dubbo 支持的 Spring Boot Starter 清单](/zh-cn/overview/mannual/java-sdk/reference-manual/config/spring/spring-boot/#starter列表) 。

### 服务定义

以下是基于 Java Interface 的标准 Dubbo 服务定义。

```java
public interface DemoService {
    String sayHello(String name);
}
```

在 `DemoService` 中，定义了 `sayHello` 这个方法。后续服务端发布的服务，消费端订阅的服务都是围绕着 `DemoService` 接口展开的。

### 服务实现

定义了服务接口之后，可以在服务端这一侧定义对应的业务逻辑实现。

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
示例应用中有一个 consumer 包，用于模拟发起对 provider 服务的远程调用。

```java
@Component
public class Consumer implements CommandLineRunner {
    @DubboReference
    private DemoService demoService;

    @Override
    public void run(String... args) throws Exception {
        String result = demoService.sayHello("world");
        System.out.println("Receive result ======> " + result);
    }
}
```

在 `Task` 类中，通过`@DubboReference` 从 Dubbo 获取了一个 RPC 订阅代理，这个 `demoService` 代理可以像本地调用一样直接调用: `demoService.sayHello("world")`。

{{% alert title="提示" color="primary" %}}
通常远程调用是跨进程的，示例项目为了方便开发，直接内置了一个 `@DubboReference` 调用。如果您想学习如何开发一个独立的 Consumer（客户端）进程，以便发起对 Dubbo 服务的远程调用，我们有一个 <a target="_blank" href="https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-spring-boot">包含独立 consumer、provider 模块的示例项目</a> 可供参考。
{{% /alert %}}

### 应用入口与配置文件

由于我们创建的是一个 Spring Boot 应用，Dubbo 相关配置信息都存放在 `application.yml` 配置文件中。基于以下配置，Dubbo 进程将在 50051 端口监听 triple 协议请求，同时，实例的 ip:port 信息将会被注册到 Nacos server。

```yaml
# application.yml
dubbo:
  registry:
    address: nacos://${nacos.address:127.0.0.1}:8848?username=nacos&password=nacos
	# This will enable application-level service discovery only (the recommended service discovery method for Dubbo3).
	# For users upgrading from Dubbo2.x, please set the value to 'all' for smooth migration.
    register-mode: instance
  protocol:
    name: tri
    port: 50051
  application:
    name: QuickStartApplication
    logger: slf4j
```

以下是整个应用的启动入口，`@EnableDubbo` 注解用来加载和启动 Dubbo 相关组件。

```java
@SpringBootApplication
@EnableDubbo
public class QuickStartApplication {
    public static void main(String[] args) {
        SpringApplication.run(QuickStartApplication.class, args);
    }
}
```

## 发布服务定义到远端仓库

应用开发完成后，我们需要将服务定义（在此示例中是 DemoService 接口定义）发布到外部公开的或组织内部的 maven 仓库，以便调用这些服务的应用能够加载并使用这些服务定义。

如之前我们看到的，示例项目包含 api、service 两个模块，切换项目到 api 目录，以下命令即可完成发布动作:

```shell
mvn clean deploy
```

## 更多内容
- 接下来，可以 [快速部署 Dubbo 应用到微服务集群](../deploy/)
- Dubbo 内置服务发现、负载均衡、流量管控规则等能力，学习 [如何配置更多服务治理能力](/zh-cn/overview/mannual/java-sdk/tasks/service-discovery/)
