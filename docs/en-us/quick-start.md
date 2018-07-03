
# Quick start

Dubbo uses a full Spring configuration, transparent access application,No API intrusion to your application,Just load the Dubbo configuration with Spring,Dubbo is loaded on the spring based schema extension.

If you don't want to use the Spring configuration, you can call it by [the way of API](./configuration/api.md).

## Service provider

Complete installation steps, see：[Provider demo installation](http://dubbo.apache.org/books/dubbo-admin-book-en/install/provider-demo.html)

### Defining service interfaces

DemoService.java [^1]：

```java
package com.alibaba.dubbo.demo;

public interface DemoService {
    String sayHello(String name);
}
```

### Implement interface in service provider

DemoServiceImpl.java [^2]：

```java

package com.alibaba.dubbo.demo.provider;
 
import com.alibaba.dubbo.demo.DemoService;
 
public class DemoServiceImpl implements DemoService {
    public String sayHello(String name) {
        return "Hello " + name;
    }
}
```

### Declaring exposure services with Spring configuration 

provider.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans        http://www.springframework.org/schema/beans/spring-beans-4.3.xsd        http://dubbo.apache.org/schema/dubbo        http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
 
    <!-- Provider application information for computing dependencies -->
    <dubbo:application name="hello-world-app"  />
 
    <!-- Using the multicast broadcast registry to expose service addresses -->
    <dubbo:registry address="multicast://224.5.6.7:1234" />
 
    <!-- Exposing service at port 20880 with Dubbo protocol -->
    <dubbo:protocol name="dubbo" port="20880" />
 
    <!-- Declaration of service interfaces that need to be exposed  -->
    <dubbo:service interface="com.alibaba.dubbo.demo.DemoService" ref="demoService" />
 
    <!-- Implement services like local bean -->
    <bean id="demoService" class="com.alibaba.dubbo.demo.provider.DemoServiceImpl" />
</beans>
```

### Loading  Spring Configuration

Provider.java：

```java
import org.springframework.context.support.ClassPathXmlApplicationContext;
 
public class Provider {
    public static void main(String[] args) throws Exception {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[] {"http://10.20.160.198/wiki/display/dubbo/provider.xml"});
        context.start();
        System.in.read(); // Press any key to exit
    }
}
```

## Service consumer

Complete installation steps, see : [Consumer demo installation](http://dubbo.apache.org/books/dubbo-admin-book-en/install/consumer-demo.html)

### Using the Spring configuration to reference a remote service 

consumer.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans        http://www.springframework.org/schema/beans/spring-beans-4.3.xsd        http://dubbo.apache.org/schema/dubbo        http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
 
    <!-- Consumer application names, used to calculate dependencies,not matching conditions, do not be the same as the provider -->
    <dubbo:application name="consumer-of-helloworld-app"  />
 
    <!-- Using the multicast broadcast registry to discovery the exposed  services -->
    <dubbo:registry address="multicast://224.5.6.7:1234" />
 
    <!-- Generate a remote service proxy that can be used as demoService as local bean -->
    <dubbo:reference id="demoService" interface="com.alibaba.dubbo.demo.DemoService" />
</beans>
```

### Load the Spring configuration and call a remote service

Consumer.java [^3]：

```java
import org.springframework.context.support.ClassPathXmlApplicationContext;
import com.alibaba.dubbo.demo.DemoService;
 
public class Consumer {
    public static void main(String[] args) throws Exception {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[] {"http://10.20.160.198/wiki/display/dubbo/consumer.xml"});
        context.start();
        DemoService demoService = (DemoService)context.getBean("demoService"); //Obtaining a remote service proxy
        String hello = demoService.sayHello("world"); // Executing remote methods 
        System.out.println( hello ); // Display the call result 
    }
}
```


[^1]: The interface needs to be packaged separately, shared by the service provider and the consumer
[^2]: Hidden realization of service consumer
[^3]: IoC injection can also be used
