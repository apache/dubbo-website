---
type: docs
title: "XML Configuration"
linkTitle: "XML Configuration"
weight: 4
description: "Develop Dubbo application with Spring XML"
---

Dubbo has custom configuration components based on Spring Schema extensions, and the configuration capabilities that can be achieved using XML are generally equivalent to [Configuration Reference Manual](../properties).


For complete examples of the following content, please refer to [dubbo-samples](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-spring-xml)

## service provider


### Define service interface

DemoService.java:

```java
package org.apache.dubbo.demo;

public interface DemoService {
    String sayHello(String name);
}
```

### Implement the interface on the service provider side

DemoServiceImpl.java:

```java
package org.apache.dubbo.demo.provider;
import org.apache.dubbo.demo.DemoService;

public class DemoServiceImpl implements DemoService {
    public String sayHello(String name) {
        return "Hello " + name;
    }
}
```

### Expose services with Spring configuration declarations

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans" xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd http://www.springframework.org/schema/context http://www.springframework .org/schema/context/spring-context.xsd">
    <context:property-placeholder/>

    <dubbo:application name="demo-provider"/>

    <dubbo:registry address="zookeeper://${zookeeper.address:127.0.0.1}:2181"/>

    <dubbo:provider token="true"/>

    <bean id="demoService" class="org.apache.dubbo.samples.basic.impl.DemoServiceImpl"/>

    <dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService" ref="demoService"/>

</beans>
```

### Load Spring configuration

```java
public class DemoServiceImpl implements DemoService {
    @Override
    public String sayHello(String name) {
        System.out.println("[" + new SimpleDateFormat("HH:mm:ss").format(new Date()) + "] Hello " + name +
                ", request from consumer: " + RpcContext. getContext(). getRemoteAddress());
        return "Hello " + name + ", response from provider: " + RpcContext.getContext().getLocalAddress();
    }
}
```

## Service Consumer

### Reference remote services through Spring configuration

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans" xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd http://www.springframework.org/schema/context http://www.springframework .org/schema/context/spring-context.xsd">
    <context:property-placeholder/>

    <dubbo:application name="demo-consumer"/>

    <dubbo:registry address="zookeeper://${zookeeper.address:127.0.0.1}:2181"/>

    <dubbo:reference id="demoService" check="true" interface="org.apache.dubbo.samples.basic.api.DemoService"/>

</beans>
```

### Load Spring configuration and call remote service

```java
public class BasicConsumer {
    public static void main(String[] args) {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext("spring/dubbo-demo-consumer.xml");
        context. start();
        DemoService demoService = (DemoService) context. getBean("demoService");
        String hello = demoService.sayHello("world");
        System.out.println(hello);
    }
}
```
