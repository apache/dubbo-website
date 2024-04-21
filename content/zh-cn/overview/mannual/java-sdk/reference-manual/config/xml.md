---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config/xml/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config/xml/
description: 以 Spring XML 开发 Dubbo 应用
linkTitle: XML 配置
title: XML 配置
type: docs
weight: 4
---






Dubbo 有基于 Spring Schema 扩展的自定义配置组件，使用 XML 能达到的配置能力总体与 [配置参考手册](../properties) 对等。


> [dubbo-samples](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-spring-xml)

## 服务提供者


### 定义服务接口

DemoService.java：

```java
package org.apache.dubbo.demo;

public interface DemoService {
    String sayHello(String name);
}
```

### 在服务提供方实现接口

DemoServiceImpl.java：

```java
package org.apache.dubbo.demo.provider;
import org.apache.dubbo.demo.DemoService;

public class DemoServiceImpl implements DemoService {
    public String sayHello(String name) {
        return "Hello " + name;
    }
}
```

### 用 Spring 配置声明暴露服务

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans" xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    <context:property-placeholder/>

    <dubbo:application name="demo-provider"/>

    <dubbo:registry address="zookeeper://${zookeeper.address:127.0.0.1}:2181"/>

    <dubbo:provider token="true"/>

    <bean id="demoService" class="org.apache.dubbo.samples.basic.impl.DemoServiceImpl"/>

    <dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService" ref="demoService"/>

</beans>
```

### 加载 Spring 配置

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

## 服务消费者

### 通过 Spring 配置引用远程服务

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans" xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
    <context:property-placeholder/>

    <dubbo:application name="demo-consumer"/>

    <dubbo:registry address="zookeeper://${zookeeper.address:127.0.0.1}:2181"/>

    <dubbo:reference id="demoService" check="true" interface="org.apache.dubbo.samples.basic.api.DemoService"/>

</beans>
```

### 加载 Spring 配置，并调用远程服务

```java
public class BasicConsumer {
    public static void main(String[] args) {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring/dubbo-demo-consumer.xml");
        context.start();
        DemoService demoService = (DemoService) context.getBean("demoService");
        String hello = demoService.sayHello("world");
        System.out.println(hello);
    }
}
```
