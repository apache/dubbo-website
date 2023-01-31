---
type: docs
title: "Spring Boot Development Services"
linkTitle: "Spring Boot"
weight: 10
description: "The sample demonstrates how to use Spring Boot to quickly develop Dubbo applications."
---

> Dubbo also provides a variety of startup and access including [XML](../../reference-manual/config/xml), [API](../../reference-manual/config/api) For more development methods and configuration details, please refer to [Configuration Manual](../../reference-manual/config/).

## Download sample code
The complete sample code is in [dubbo-samples](https://github.com/apache/dubbo-samples/tree/master/1-basic/dubbo-samples-spring-boot).

1. Download the source code
```shell script
git clone -b master https://github.com/apache/dubbo-samples.git
```
2. Enter the example directory
```shell script
cd dubbo-samples/1-basic/dubbo-samples-spring-boot
ls # view directory structure
```

## Quick run example

1. Compile Provider
   Execute the maven command in the dubbo-samples-spring-boot directory
```shell script
mvn clean package
```

2. Run Provider
   Enter the dubbo-samples-spring-boot-provider/target directory and start the java process
```shell script
cd ./dubbo-samples-spring-boot-provider
java -jar ./target/dubbo-samples-spring-boot-provider-1.0-SNAPSHOT.jar
```

3. Run the consumer
   Enter the dubbo-samples-spring-boot-consumer directory and start the java process
```shell script
java -jar ./target/dubbo-samples-spring-boot-consumer-1.0-SNAPSHOT.jar
```

4. View the results
   The following information will be output on the consumer side:
```
result: hello world
```
On the provider side, the following information will be output:
```
Hello World, request from consumer: xxx.xxx.xxx.xxx
```

So far, the basic functions of Dubbo have been realized, and more development can be carried out on the basis of Dubbo.

## Example core process

For a more detailed interpretation of the examples, please refer to [Annotation Configuration](../../reference-manual/config/annotation/)

### 1. Define service interface

dubbo-samples-spring-boot-interface/DemoService.java

```java
package org.apache.dubbo.samples.basic.api;

public interface DemoService {
    String sayHello(String name);
}
```

### 2. The provider implements the interface and exposes the service

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

### 3. Configure the application.yml file

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

### 4. Define Spring Boot main function

dubbo-samples-spring-boot-provider/ProviderApplication.java

```java
@SpringBootApplication
@EnableDubbo
public class ProviderApplication {
    public static void main(String[] args) throws Exception {
        new Embedded ZooKeeper(2181, false).start();

        SpringApplication.run(ProviderApplication.class, args);
        System.out.println("dubbo service started");
        new CountDownLatch(1). await();
    }
}
```
Among them, `@EnableDubbo` must be configured.

### 5. Reference remote service

dubbo-samples-spring-boot-consumer/ConsumerApplication.java

```java
public class ConsumerApplication {
    @DubboReference
    private DemoService demoService;
}
```

### 6. Define application.yml

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

### 7. Load Spring configuration and call remote service

dubbo-samples-spring-boot-consumer/ConsumerApplication.java

```java
@SpringBootApplication
@Service
@EnableDubbo
public class ConsumerApplication {
    @DubboReference
    private DemoService demoService;
    
    public String doSayHello(String name) {
        return demoService.sayHello(name);
    }

    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(ConsumerApplication.class, args);
        ConsumerApplication application = context. getBean(ConsumerApplication. class);
        String result = application. doSayHello("world");
        System.out.println("result: " + result);
    }
}
```

Among them, `@EnableDubbo` must be configured.