## 示例源码说明（可选阅读）
### Maven 依赖
示例项目中 Dubbo 相关核心依赖如下：

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

以下是标准的 Dubbo 服务定义。

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
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
```
