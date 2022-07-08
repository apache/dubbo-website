
---
type: docs
title: "快速入门"
linkTitle: "快速入门"
weight: 2
---

这篇教程会通过一个简单的示例工程来演示如何使用 Dubbo Java

## 前置条件
- [JDK](https://jdk.java.net/) 版本 >= 8
- 已安装 [Maven](https://maven.apache.org/)
- 已安装并启动 [Zookeeper](https://zookeeper.apache.org/)

## 获取示例工程的代码
示例工程是 [Dubbo-Samples](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-triple/src) 的一部分。
1. [下载源码 zip 包](https://github.com/apache/dubbo-samples/archive/refs/heads/master.zip)或 clone 示例工程
    ```
   $ git clone --depth 1 https://github.com/apache/dubbo-samples.git
   ```
2. 切换到示例工程
   ```
   $ cd dubbo-samples-triple
   ```
   
## 运行示例工程
在 `dubbo-samples-triple` 目录下，
1. 编译工程
    ```
   $ mvn clean install -Dmaven.test.skip=true
   ```
2. 启动 Server
   ```
   $  mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.sample.tri.stub.TriStubServer"
   Dubbo triple stub server started, port=50052
   ```
3. 在另一个终端启动 Client
   ```
   $ mvn org.codehaus.mojo:exec-maven-plugin:3.0.0:java -Dexec.mainClass="org.apache.dubbo.sample.tri.stub.TriStubClient"
   INFO stub.TriStubClient: tri-stub Start unary
   INFO stub.TriStubClient: tri-stub Unary reply <-message: "hello,name"
   ```
恭喜，一个简单的客户端-服务端 Dubbo 应用运行成功了

## 服务提供方

### `Service`注解暴露服务

```java
@DubboService
public class AnnotationServiceImpl implements AnnotationService {
    @Override
    public String sayHello(String name) {
        return "annotation: hello, " + name;
    }
}
```

使用

### 增加应用共享配置

```properties
# dubbo-provider.properties
dubbo.application.name=annotation-provider
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.protocol.name=dubbo
dubbo.protocol.port=20880
```

### 指定Spring扫描路径

```java
@Configuration
@EnableDubbo(scanBasePackages = "org.apache.dubbo.samples.simple.annotation.impl")
@PropertySource("classpath:/spring/dubbo-provider.properties")
static public class ProviderConfiguration {

}
```

## 服务消费方

### `Reference`注解引用服务

```java
@Component("annotationAction")
public class AnnotationAction {

    @Reference
    private AnnotationService annotationService;

    public String doSayHello(String name) {
        return annotationService.sayHello(name);
    }
}

```

### 增加应用共享配置

```properties
# dubbo-consumer.properties
dubbo.application.name=annotation-consumer
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.consumer.timeout=3000
```

### 指定Spring扫描路径

```java
@Configuration
@EnableDubbo(scanBasePackages = "org.apache.dubbo.samples.simple.annotation.action")
@PropertySource("classpath:/spring/dubbo-consumer.properties")
@ComponentScan(value = {"org.apache.dubbo.samples.simple.annotation.action"})
static public class ConsumerConfiguration {

}
```

### 调用服务

```java
public static void main(String[] args) throws Exception {
    AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext(ConsumerConfiguration.class);
    context.start();
    final AnnotationAction annotationAction = (AnnotationAction) context.getBean("annotationAction");
    String hello = annotationAction.doSayHello("world");
}
```