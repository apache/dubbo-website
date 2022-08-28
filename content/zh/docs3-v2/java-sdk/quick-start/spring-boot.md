
---
type: docs
title: "Spring Boot"
linkTitle: "Spring Boot 开发服务"
weight: 1
description: "示例演示了如何使用 Spring Boot 方式快速开发 Dubbo 应用。"
---

> Dubbo 还提供了包括[XML](../../reference-manual/config/xml)、[API](../../reference-manual/config/api)等多种启动与接入方式，更多开发方式和配置细节可参见[配置手册](../../reference-manual/config/)。

## 下载示例代码
完整示例代码在 [dubbo-samples](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-spring-boot) 中。

1. 下载源码
```shell script
git clone -b master https://github.com/apache/dubbo-samples.git
```
2. 进入示例目录
```shell script
cd dubbo-samples/dubbo-samples-spring-boot
ls # 查看目录结构
```

## 快速运行示例

1. 编译 Provider
在 dubbo-samples-spring-boot 目录执行 maven 命令
```shell script
mvn clean package
```

2. 运行 Provider
进入 dubbo-samples-spring-boot-provider/target 目录并启动 java 进程
```shell script
cd ./dubbo-samples-spring-boot-provider
java -jar ./target/dubbo-samples-spring-boot-provider-1.0-SNAPSHOT.jar
```

3. 运行 consumer
进入 dubbo-samples-spring-boot-consumer 目录并启动 java 进程
```shell script
java -jar ./target/dubbo-samples-spring-boot-consumer-1.0-SNAPSHOT.jar
```

4. 查看结果
在 consumer 侧会输出如下信息：
```
result: Hello World
```
在 provider 侧会输出如下信息：
```
Hello World, request from consumer: xxx.xxx.xxx.xxx
```

至此就把 Dubbo 的基本功能都实现了，可以在 Dubbo 的基础上进行更多的开发。

## 示例核心流程

关于示例的更详细解读可参见 [注解配置](../../reference-manual/config/annotation/)

### 1. 定义服务接口

dubbo-samples-spring-boot-interface/DemoService.java

```java
package org.apache.dubbo.samples.basic.api;

public interface DemoService {
    String sayHello(String name);
}
```

### 2. 提供方实现接口并暴露服务

dubbo-samples-spring-boot-provider/DemoServiceImpl.java

```java
@DubboService
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        System.out.println("Hello " + name + ", request from consumer: " + RpcContext.getContext().getRemoteAddress());
        return "Hello " + name;
    }
}
```

### 3. 配置 application.yml 文件

dubbo-samples-spring-boot-provider/resources/application.yml

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

### 4. 定义 Spring Boot 主函数

dubbo-samples-spring-boot-provider/ProviderApplication.java

```java
@SpringBootApplication
@EnableDubbo
public class ProviderApplication {
    public static void main(String[] args) throws Exception {
        new EmbeddedZooKeeper(2181, false).start();

        SpringApplication.run(ProviderApplication.class, args);
        System.out.println("dubbo service started");
        new CountDownLatch(1).await();
    }
}
```
其中，`@EnableDubbo` 必须配置。

### 5. 引用远程服务

dubbo-samples-spring-boot-consumer/ConsumerApplication.java

```java
public class ConsumerApplication {
    @DubboReference
    private DemoService demoService;
}
```

### 6. 定义 application.yml

dubbo-samples-spring-boot-consumer/application.yml

```yaml
dubbo:
  application:
    name: dubbo-springboot-demo-consumer
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

### 7. 加载 Spring 配置，并调用远程服务

dubbo-samples-spring-boot-consumer/ConsumerApplication.java

```java
@SpringBootApplication
@Service
@EnableDubbo
public class ConsumerApplication {
    @DubboReference
    private DemoService demoService;

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(ConsumerApplication.class, args);
        ConsumerApplication application = context.getBean(ConsumerApplication.class);
        String result = application.doSayHello("world");
        System.out.println(application.sayHello(result));
    }
}
```

其中，`@EnableDubbo` 必须配置。
