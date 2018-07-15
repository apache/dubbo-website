
# Quick start

The most common way to configure Dubbo is to use Spring.
If you don't want to use the Spring configuration, you can try using [API configuration](./configuration/api.md).

The following content will guide you to start dubbo using Spring configuration.

First let's create a root directory called dubbo-demo:

```
mkdir dubbo-demo
cd dubbo-demo
```

Next, we are going to create 3 sub-directories under root directory: 

* dubbo-demo-api: the common service api
* dubbo-demo-provider: the demo provider codes
* dubbo-demo-consumer: the demo consumer codes

## Service provider

### Defining service interfaces

DemoService.java [^1]：

```java
package org.apache.dubbo.demo;

public interface DemoService {
    String sayHello(String name);

}
```

The proejct structure should look like this:

```
.
├── dubbo-demo-api
│   ├── pom.xml
│   └── src
│       └── main
│           └── java
│               └── org
│                   └── apache
│                       └── dubbo
│                           └── demo
│                               └── DemoService.java
```

### Implement interface in service provider

DemoServiceImpl.java [^2]：

```java
package org.apache.dubbo.demo.provider;
import org.apache.dubbo.demo.DemoService;

public class DemoServiceImpl implements DemoService {
    public String sayHello(String name) {
        return "Hello " + name;
    }
}
```

### Exposing service with Spring configuration

provider.xml：

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">

    <!-- provider's application name, used for tracing dependency relationship -->
    <dubbo:application name="demo-provider"/>
    <!-- use multicast registry center to export service -->
    <dubbo:registry address="multicast://224.5.6.7:1234"/>
    <!-- use dubbo protocol to export service on port 20880 -->
    <dubbo:protocol name="dubbo" port="20880"/>
    <!-- service implementation, as same as regular local bean -->
    <bean id="demoService" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>
    <!-- declare the service interface to be exported -->
    <dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService"/>
</beans>
```

The demo uses multicast as the registry since it is simple and does not require to extra installation.
If you prefer a registiry like zookeeper, please check out examples [here](https://github.com/dubbo/dubbo-samples).

### Configure the logging system

Dubbo use log4j as logging system by default, it also support slf4j, Apache Commons Logging, and JUL logging.

Following is a sample configuration:

log4j.properties

```
###set log levels###
log4j.rootLogger=info, stdout
###output to the console###
log4j.appender.stdout=org.apache.log4j.ConsoleAppender
log4j.appender.stdout.Target=System.out
log4j.appender.stdout.layout=org.apache.log4j.PatternLayout
log4j.appender.stdout.layout.ConversionPattern=[%d{dd/MM/yy hh:mm:ss:sss z}] %t %5p %c{2}: %m%n
```

### Bootstrap the service provider

Provider.java

```java
package org.apache.dubbo.demo.provider;

import org.springframework.context.support.ClassPathXmlApplicationContext;

public class Provider {

    public static void main(String[] args) throws Exception {
        System.setProperty("java.net.preferIPv4Stack", "true");
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"META-INF/spring/dubbo-demo-provider.xml"});
        context.start();
        System.out.println("Provider started.");
        System.in.read(); // press any key to exit
    }
}
```

Finally, the project structure should look like this:

```
├── dubbo-demo-provider
│   ├── pom.xml
│   └── src
│       └── main
│           ├── java
│           │   └── org
│           │       └── apache
│           │           └── dubbo
│           │               └── demo
│           │                   └── provider
│           │                       ├── DemoServiceImpl.java
│           │                       └── Provider.java
│           └── resources
│               ├── META-INF
│               │   └── spring
│               │       └── dubbo-demo-provider.xml
│               └── log4j.properties
```

## Service consumer

Complete installation steps, see：[Consumer demo installation](../admin/install/consumer-demo.md)

### Using the Spring configuration to reference a remote service 

consumer.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">

    <!-- consumer's application name, used for tracing dependency relationship (not a matching criterion),
    don't set it same as provider -->
    <dubbo:application name="demo-consumer"/>
    <!-- use multicast registry center to discover service -->
    <dubbo:registry address="multicast://224.5.6.7:1234"/>
    <!-- generate proxy for the remote service, then demoService can be used in the same way as the
    local regular interface -->
    <dubbo:reference id="demoService" check="false" interface="org.apache.dubbo.demo.DemoService"/>
</beans>
```

### Bootstrap the consumer

Consumer.java [^3]：

```java
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.apache.dubbo.demo.DemoService;
 
public class Consumer {
    public static void main(String[] args) throws Exception {
        ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[] {"META-INF/spring/dubbo-demo-consumer.xml"});
        context.start();
        // Obtaining a remote service proxy
        DemoService demoService = (DemoService)context.getBean("demoService");
        // Executing remote methods
        String hello = demoService.sayHello("world");
        // Display the call result
        System.out.println(hello);
    }
}
```

### Config the logging system

This is the same as how to config it on provider side.

Finally, the project structure should be look like this:

```
├── dubbo-demo-consumer
│   ├── pom.xml
│   └── src
│       └── main
│           ├── java
│           │   └── org
│           │       └── apache
│           │           └── dubbo
│           │               └── demo
│           │                   └── consumer
│           │                       └── Consumer.java
│           └── resources
│               ├── META-INF
│               │   └── spring
│               │       └── dubbo-demo-consumer.xml
│               └── log4j.properties
```

## Start the demo

### Start service provider

Run the `org.apache.dubbo.demo.provider.Provider` class to start the provider.

### Start service consumer

Run the `org.apache.dubbo.demo.provider.Consumer` class to start the consumer, and you should be able to see the following result:

```
Hello world
```

## Complete example 

You can find the complete example code in the Github repository.

* [Provider demo](../admin/install/provider-demo.md)
* [Consumer demo](../admin/install/consumer-demo.md)

[^1]: The interface needs to be packaged separately, shared by the service provider and the consumer
[^2]: Hidden realization of service consumer
[^3]: IoC injection can also be used