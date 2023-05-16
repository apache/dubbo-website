---
aliases:
    - /zh/overview/tasks/develop/service_reference/
description: 通过示例简单展示一个Dubbo服务的发布和调用
linkTitle: 发布和调用 Dubbo 服务
title: 开发服务
type: docs
weight: 2
---


## 发布和调用
通过一个简单的Springboot实例代码，展示Dubbo服务的发布和调用

本文将基于 Dubbo Samples 示例演示如何快速搭建并部署一个微服务应用。
代码地址：[dubbo-samples-develop](https://github.com/apache/dubbo-samples/tree/master/10-task/dubbo-samples-develop)
代码分为三个模块
* api
* develop-provider
* develop-consumer

## 准备
本示例代码基于Springboot 3.0

1、首先需要一个可用的注册中心 Zookeeper，Nacos，Redis 均可。

2、新建一个maven工程，添加如下依赖
```xml
        <!-- registry dependency -->
        <dependency>
            <groupId>com.alibaba.nacos</groupId>
            <artifactId>nacos-client</artifactId>
            <version>${nacos.version}</version>
        </dependency>

        <!-- dubbo dependency-->
        <dependency>
            <groupId>org.apache.dubbo</groupId>
            <artifactId>dubbo-spring-boot-starter</artifactId>
            <version>${dubbo.version}</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
        </dependency>

```
本示例使用的注册中心为Nacos，使用ZK请将nacos-client包替换为对应版本zk客户端包。

## 发布服务
1、定义服务接口
```java
public interface DevelopService {
    String invoke(String param);
}
```
2、服务接口实现
```java
@DubboService(group = "group1",version = "1.0")
public class DevelopProviderServiceV1 implements DevelopService{
    @Override
    public String invoke(String param) {
        StringBuilder s = new StringBuilder();
        s.append("ServiceV1 param:").append(param);
        return s.toString();
    }
}
```
使用@DubboService 注解，Dubbo会将对应的服务注册到spring，
在spring启动后调用对应的服务导出方法，将服务注册到注册中心，
这样Consumer端才能发现我们发布的服务并调用

3、添加Dubbo配置

添加application.properties相关配置，也可新建dubbo.properties保存dubbo相关配置，内容如下：
```properties
dubbo.application.name=provider

# Enable token verification for each invocation
dubbo.provider.token=false

# Specify the registry address
# dubbo.registry.address=nacos://localhost:8848?username=nacos&password=nacos
dubbo.registry.address=nacos://${nacos.address:localhost}:8848?username=nacos&password=nacos

dubbo.protocol.name=dubbo
dubbo.protocol.port=20881
```

4、启动服务

创建Springboot启动类，需添加@EnableDubbo注解，开启Dubbo自动配置功能
```java
@EnableDubbo
@SpringBootApplication
public class DevelopApplication {

    public static void main(String[] args) {
        SpringApplication.run(DevelopApplication.class, args);
    }
}

```
启动成功后，在注册中心可以看到对应的服务列表，如图：
`![serviceList](/imgs/v3/develop/develop-service-list.png)`

## 调用服务

创建DemoTask类，通过@DubboReference注解对需要调用的服务进行引入。即可像调用本地方法一样调用远程服务了。

```java
//实现CommandLineRunner 让Springboot启动后调用run方法
@Component
public class DemoTask implements CommandLineRunner {
    @DubboReference(group = "group1",version = "1.0")
    private DevelopService developService;

    @Override
    public void run(String... args) throws Exception {
        //调用DevelopService的group1分组实现
        System.out.println("Dubbo Remote Return ======> " + developService.invoke("1"));
    }
}
```

启动服务 打印

`Dubbo Remote Return ======> ServiceV1 param:1`

说明服务调用成功