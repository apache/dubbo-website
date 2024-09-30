---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/config/xml/
    - /en/docs3-v2/java-sdk/reference-manual/config/xml/
    - /en/overview/mannual/java-sdk/reference-manual/config/xml/
description: Developing Dubbo applications with Spring XML
linkTitle: XML Configuration
title: XML Configuration
type: docs
weight: 4
---


Dubbo has a custom configuration component based on Spring Schema, and the configuration options supported by XML correspond to those described in the [configuration reference manual](../properties). Please refer to the examples used in this article at [dubbo-samples-spring-xml](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-spring-xml).

## Complete XML Example
### Service Provider

#### Define Service Interface

DemoService.java：

```java
package org.apache.dubbo.demo;

public interface DemoService {
    String sayHello(String name);
}
```

#### Implement Interface in Service Provider

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

#### Declare Service Exposure with Spring Configuration

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

#### Load Spring Configuration

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

### Service Consumer

#### Reference Remote Service through Spring Configuration

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

#### Load Spring Configuration and Call Remote Service

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

## More Examples

### Version and Group

```xml
<dubbo:service interface="com.foo.BarService" version="1.0.0" />
<dubbo:service interface="org.apache.dubbo.example.service.DemoService" group="demo2"/>
```

### Cluster Fault Tolerance
Configure failover retry count:

```xml
<dubbo:service retries="2" />

<dubbo:reference>
    <dubbo:method name="findFoo" retries="2" />
</dubbo:reference>
```

### Multiple Protocols

```xml
<dubbo:application name="world"  />
<dubbo:registry id="registry" address="10.20.141.150:9090" username="admin" password="hello1234" />
<!-- Multiple protocol configuration -->
<dubbo:protocol name="dubbo" port="20880" />
<dubbo:protocol name="rmi" port="1099" />
<!-- Use dubbo protocol to expose service -->
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" protocol="dubbo" />
<!-- Use rmi protocol to expose service -->
<dubbo:service interface="com.alibaba.hello.api.DemoService" version="1.0.0" ref="demoService" protocol="rmi" />
```

### Multiple Registries
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <dubbo:application name="world"  />
    <!-- Multiple registry configuration -->
    <dubbo:registry id="chinaRegistry" address="10.20.141.150:9090" />
    <dubbo:registry id="intlRegistry" address="10.20.154.177:9010" default="false" />
    <!-- Register with Chinese registry -->
    <dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" registry="chinaRegistry" />
    <!-- Register with international registry -->
    <dubbo:service interface="com.alibaba.hello.api.DemoService" version="1.0.0" ref="demoService" registry="intlRegistry" />
</beans>
```

### Global Default Values
Specify global default timeout, effective for all services:

```xml
<dubbo:provider timeout="5000" />
<dubbo:consumer timeout="5000" />
```

Based on group default values:

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




