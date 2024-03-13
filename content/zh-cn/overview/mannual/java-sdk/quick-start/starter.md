---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config/overview/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config/overview/
description: 创建基于Spring Boot的Dubbo应用。
linkTitle: 创建基于Spring Boot的Dubbo应用
title: 创建基于Spring Boot的微服务应用
type: docs
weight: 2
---

以下文档将引导您从头创建一个基于 Spring Boot 的 Dubbo 应用，并为应用配置 Triple 通信协议、服务发现等微服务基础能力。

## 快速创建应用
通过访问 <a href="https://start.dubbo.apache.org" target="_blank">start.dubbo.apache.org</a> 在线服务创建 Dubbo 微服务应用。如下图所示依次添加组件，您可以在几十秒之内快速创建一个 Dubbo 应用。下载生成的示例应用并解压源码即可。

<img style="max-width:800px;height:auto;margin-bottom:10px;" alt="项目结构截图" src="/imgs/v3/quickstart/initializer-provider.png"/>

{{% alert title="直接使用官方准备好的示例" color="info" %}}
您还可以直接下载官方预先准备好的示例项目：

```shell
$ git clone -b main --depth 1 https://github.com/apache/dubbo-samples
$ cd dubbo-samples/11-quickstart
````
{{% /alert %}}

## 源码解析
将以上准备好的示例项目导入最喜欢的 IDE 开发工具（以 IntelliJ IDEA 为例），项目结构如下：

<img style="max-width:400px;height:auto;" alt="项目结构截图" src="/imgs/v3/quickstart/project-structure2.png"/>

### Maven 依赖
打开 pom.xml，可以看到示例项目中 Dubbo 相关核心依赖如下：

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
            <artifactId>dubbo-zookeeper-spring-boot-starter</artifactId>
        </dependency>
    </dependencies>
```

其中，`dubbo-spring-boot-starter`、`dubbo-zookeeper-spring-boot-starter` 分别为我们引入了 Dubbo 内核框架与 Zookeeper 客户端相关的依赖组件，更多内容可以查看 [Dubbo 支持的 Spring Boot Starter 清单]() 。

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

在 `Task` 类中，通过`@DubboReference` 从 Dubbo 获取了一个 RPC 订阅，这个 `demoService` 可以像本地调用一样直接调用: `demoService.sayHello("world")`。

{{% alert title="提示" color="primary" %}}
通常远程调用是跨进程的，示例项目为了方便开发，直接内置了一个 `@DubboReference` 调用。如果您想学习如何开发一个独立的 Consumer（客户端）进程，以便发起对 Dubbo 服务的远程调用，我们有一个 <a target="_blank" href="https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-spring-boot">包含独立 consumer、provider 模块的示例项目</a> 可供参考。
{{% /alert %}}

### 应用入口与配置文件

由于我们创建的是一个 Spring Boot 应用，Dubbo 相关配置信息都存放在 `application.yml` 配置文件中。基于以下配置，Dubbo 进程将在 50051 端口监听 triple 协议请求，同时，实例的 ip:port 信息将会被注册到 Zookeeper server。

```yaml
# application.yml
dubbo:
  application:
    name: dubbo-demo
  protocol:
    name: tri
    port: 50051
  registry:
    address: zookeeper://${zookeeper.address:127.0.0.1}:2181
```

以下是整个应用的启动入口，`@EnableDubbo` 注解用来加载和启动 Dubbo 相关组件。

```java
@SpringBootApplication
@EnableDubbo
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```

## 本地启动应用
接下来，让我们尝试在本地启动应用。

{{% alert title="注意" color="warning" %}}
由于配置文件中启用了注册中心，为了能够成功启动应用，您需要首先在本地启动 <a href="https://nacos.io/zh-cn/docs/v2/quickstart/quick-start.html" target="_blank_">Nacos</a> 或 <a href="https://zookeeper.apache.org/doc/current/zookeeperStarted.html" target="_blank_">Zookeeper</a> 注册中心 server。
{{% /alert %}}

在应用启动成功后，本地进程使用 <a href="/zh-cn/overview/reference/protocols/triple/" target="_blank_">Triple </a>协议在指定端口发布了服务，可直接使用 cURL 测试服务是否已经正常运行：


```shell
curl \
    --header "Content-Type: application/json" \
    --data '["Dubbo"]' \
    http://localhost:50051/com.example.demo.dubbo.api.DemoService/sayHello/
```

## 发布服务定义到远端仓库

应用开发完成后，我们需要将服务定义发布到外部公开的或组织内部的 maven 仓库，以便调用这些服务的应用能够加载并使用这些服务。

如之前我们看到的，示例项目包含 api、service 两个模块，切换项目到 api 目录，以下命令即可完成发布动作:

```shell
mvn clean deploy
```

## 更多内容
- 接下来，可以 [快速部署 Dubbo 应用到微服务集群]()
- Dubbo 内置服务发现、负载均衡、流量管控规则等能力，学习 [如何配置更多服务治理能力]()