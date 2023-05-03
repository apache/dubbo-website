---
aliases:
    - /zh/docs/languages/java/java-specific/
description: ""
linkTitle: Java 定义服务
title: Java 语言定义服务
type: docs
weight: 10
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/quick-start/)。
{{% /pageinfo %}}

示例使用 Spring XML 配置方式进行演示。

除此之外，Dubbo Java 还提供了包括注解、API、配置文件、spring boot等多种启动与接入方式，具体可参见配置章节具体描述。

## 下载示例代码
示例代码在 [dubbo-samples](https://github.com/apache/dubbo-samples) 中
1. 下载源码
```shell script
$ git clone -b master https://github.com/apache/dubbo-samples.git
```
2. 进入示例目录
```shell script
$ cd dubbo-samples/dubbo-samples-basic
```

## 快速运行示例
在 dubbo-samples-basic 目录

1. 编译 Provider
```shell script
$ mvn clean package -Pprovider
```

2. 运行 Provider
```shell script
$ java -jar ./target/provider.jar 
```

3. 编译 Consumer
```shell script
$ mvn clean package -Pconsumer
```

4. 运行 consumer
```shell script
$ java -jar ./target/consumer.jar 
```

## 详细解释

### 定义服务接口

DemoService.java

```java
package org.apache.dubbo.samples.basic.api;

public interface DemoService {
    String sayHello(String name);
}
```

### 在服务提供方实现接口

DemoServiceImpl.java

```java
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        System.out.println("[" + new SimpleDateFormat("HH:mm:ss").format(new Date()) + "] Hello " + name +
                ", request from consumer: " + RpcContext.getContext().getRemoteAddress());
        return "Hello " + name + ", response from provider: " + RpcContext.getContext().getLocalAddress();
    }
}
```

### 用 Spring 配置声明暴露服务 

provider.xml：

```xml
<bean id="demoService" class="org.apache.dubbo.samples.basic.impl.DemoServiceImpl"/>

<dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService" ref="demoService"/>
```

## 服务消费者

### 引用远程服务

consumer.xml：

```xml
<dubbo:reference id="demoService" check="true" interface="org.apache.dubbo.samples.basic.api.DemoService"/>
```

### 加载Spring配置，并调用远程服务

Consumer.java

```java
public static void main(String[] args) {
    ...
    DemoService demoService = (DemoService) context.getBean("demoService");
    String hello = demoService.sayHello("world");
    System.out.println(hello);
}
```
