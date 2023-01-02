---
type: docs
title: "Service Group"
linkTitle: "Service Group"
weight: 2
description: "Use service groups to differentiate between different implementations of a service interface"
---

## Feature description
The same interface can use service grouping to distinguish different implementation methods for different business scenarios, different usage requirements, or different functional modules. At the same time, the services provided by these different implementations can coexist and support mutual calls.

## scenes to be used
When an interface has multiple implementations, it can be distinguished by group.

## Reference use case

[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-group](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-group)

## How to use

### Annotation configuration

#### Service provider (annotation configuration)

Use @DubboService annotation, add group parameter

```java
@DubboService(group = "demo")
public class DemoServiceImpl implements DemoService {
 ...
}

@DubboService(group = "demo2")
public class Demo2ServiceImpl implements DemoService {
 ...
}
```

Start the Dubbo service, and you can see services with the same service name and different groups in the registry. Taking Nacos as the registry as an example, the following content is displayed:

![image-service-group-1.png](/imgs/blog/service-group-1.png)

#### Service consumer (annotation configuration)

Use @DubboReference annotation to add group parameter

```java
@DubboReference(group = "demo")
private DemoService demoService;

@DubboReference(group = "demo2")
private DemoService demoService2;

//group value is *, the identifier matches any service group
@DubboReference(group = "*")
private DemoService demoService2;
```

After starting the Dubbo service, you can see the references of the same service name in different groups in the registration center. Taking Nacos as the registration center as an example, the following content is displayed:
![image-service-group-2.png](/imgs/blog/service-group-2.png)

### xml configuration

#### Service provider (xml configuration)

Use <dubbo:service /> tag, add group parameter

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo
       http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
...
    <dubbo:service interface="org.apache.dubbo.example.service.DemoService" group="demo"/>

<dubbo:service interface="org.apache.dubbo.example.service.DemoService" group="demo2"/>
...
</beans>
```

Start the Dubbo service, and you can see services with the same service name and different groups in the registry. Taking Nacos as the registry as an example, the following content is displayed:

![image-service-group-1.png](/imgs/blog/service-group-1.png)

#### Service consumer (xml configuration)

Use <dubbo:reference/> annotation to add group parameter

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
       http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo
       http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    ...
    <!-- reference service interface -->
    <dubbo:reference id="demoService" interface="org.apache.dubbo.example.service.DemoService" group="demo"/>

    <dubbo:reference id="demoService2" interface="org.apache.dubbo.example.service.DemoService" group="demo2"/>

    <!-- The group value is *, and the identifier matches any service group -->
    <dubbo:reference id="demoService3" interface="org.apache.dubbo.example.service.DemoService" group="*"/>
    ...
</beans>
```

After starting the Dubbo service, you can see the references of the same service name in different groups in the registration center. Taking Nacos as the registration center as an example, the following content is displayed:

![image-service-group-2.png](/imgs/blog/service-group-2.png)

### API configuration

#### Service provider (API configuration)

Use org.apache.dubbo.config.ServiceConfig class, add group parameter

```java
// ServiceConfig is a heavy object, which internally encapsulates the connection with the registration center and opens the service port
// Please cache by yourself, otherwise it may cause memory and connection leaks
ServiceConfig<DemoService> service = new ServiceConfig<>();
service.setInterface(DemoService.class);
service.setGroup("demo");
...

ServiceConfig<DemoService> service2 = new ServiceConfig<>();
service.setInterface(DemoService.class);
service.setGroup("demo2");
...
```

Start the Dubbo service, and you can see services with the same service name and different groups in the registry. Taking Nacos as the registry as an example, the following content is displayed:

![image-service-group-1.png](/imgs/blog/service-group-1.png)

#### Service consumer (API configuration)

Use org.apache.dubbo.config.ReferenceConfig, add group parameter

```java
// ReferenceConfig is a heavy object, which internally encapsulates the connection with the registration center and opens the service port
// Please cache by yourself, otherwise it may cause memory and connection leaks
ReferenceConfig<DemoService> reference = new ReferenceConfig<>();
reference.setInterface(DemoService.class);
reference.setGroup("demo");
...

ReferenceConfig<DemoService> reference2 = new ReferenceConfig<>();
reference2.setInterface(DemoService.class);
reference2.setGroup("demo2");
...

ReferenceConfig<DemoService> reference3 = new ReferenceConfig<>();
reference3.setInterface(DemoService.class);
reference3.setGroup("*");
...

```
After starting the Dubbo service, you can see the references of the same service name in different groups in the registration center. Taking Nacos as the registration center as an example, the following content is displayed:
![image-service-group-2.png](/imgs/blog/service-group-2.png)


> Always *call** only one available group implementation