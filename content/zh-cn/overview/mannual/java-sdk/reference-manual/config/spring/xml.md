---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/config/xml/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/config/xml/
    - /zh-cn/overview/mannual/java-sdk/reference-manual/config/xml/
description: 以 Spring XML 开发 Dubbo 应用
linkTitle: XML 配置
title: XML 配置
type: docs
weight: 4
---


Dubbo 有基于 Spring Schema 扩展的自定义配置组件，XML 支持的配置项与 [配置参考手册](../properties) 中描述的一一对。本文使用的示例请参考 [dubbo-samples-spring-xml](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-spring-xml)

## XML完整示例
### 服务提供者

#### 定义服务接口

DemoService.java：

```java
package org.apache.dubbo.demo;

public interface DemoService {
    String sayHello(String name);
}
```

#### 在服务提供方实现接口

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

#### 用 Spring 配置声明暴露服务

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

#### 加载 Spring 配置

```java
public class Application {
    public static void main(String[] args) throws InterruptedException {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring/dubbo-demo-provider.xml");
        context.start();

        System.out.println("dubbo service started");
        // to hang up main thread
        new CountDownLatch(1).await();
    }
}
```

### 服务消费者

#### 通过 Spring 配置引用远程服务

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

#### 加载 Spring 配置，并调用远程服务

```java
public class Application {
    public static void main(String[] args) throws IOException {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring/dubbo-demo-consumer.xml");
        context.start();
        GreetingsService greetingsService = (GreetingsService) context.getBean("greetingsService");

        String message = greetingsService.sayHi("dubbo");
        System.out.println("Receive result ======> " + message);
        System.in.read();
        System.exit(0);
    }
}
```

## 更多示例

### 版本与分组

```xml
<dubbo:service interface="com.foo.BarService" version="1.0.0" />
<dubbo:service interface="org.apache.dubbo.example.service.DemoService" group="demo2"/>
```

### 集群容错
配置 failover 重试次数：

```xml
<dubbo:service retries="2" />

<dubbo:reference>
    <dubbo:method name="findFoo" retries="2" />
</dubbo:reference>
```

### 多协议

```xml
<dubbo:application name="world"  />
<dubbo:registry id="registry" address="10.20.141.150:9090" username="admin" password="hello1234" />
<!-- 多协议配置 -->
<dubbo:protocol name="dubbo" port="20880" />
<dubbo:protocol name="rmi" port="1099" />
<!-- 使用dubbo协议暴露服务 -->
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" protocol="dubbo" />
<!-- 使用rmi协议暴露服务 -->
<dubbo:service interface="com.alibaba.hello.api.DemoService" version="1.0.0" ref="demoService" protocol="rmi" />
```

### 多注册中心
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <dubbo:application name="world"  />
    <!-- 多注册中心配置 -->
    <dubbo:registry id="chinaRegistry" address="10.20.141.150:9090" />
    <dubbo:registry id="intlRegistry" address="10.20.154.177:9010" default="false" />
    <!-- 向中文站注册中心注册 -->
    <dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" registry="chinaRegistry" />
    <!-- 向国际站注册中心注册 -->
    <dubbo:service interface="com.alibaba.hello.api.DemoService" version="1.0.0" ref="demoService" registry="intlRegistry" />
</beans>
```

### 全局默认值
指定全局默认超时时间，多所有服务生效：

```xml
<dubbo:provider timeout="5000" />
<dubbo:consumer timeout="5000" />
```

基于分组的默认值：

```xml
<dubbo:provider timeout="5000">
	<dubbo:service interface="com.alibaba.hello.api.HelloService" ref="helloService"/>
	<dubbo:service interface="com.alibaba.hello.api.HelloService2" ref="helloService2"/>
</dubbo:provider>

<dubbo:provider timeout="8000">
	<dubbo:service interface="com.alibaba.hello.api.DemoService" ref="demoService"/>
	<dubbo:service interface="com.alibaba.hello.api.DemoService2" ref="demoService2"/>
</dubbo:provider>
```



