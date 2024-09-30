---
title: "Dubbo Basic Usage - Dubbo Consumer Configuration"
linkTitle: "Dubbo Basic Usage - Dubbo Consumer Configuration"
tags: ["Java"]
date: 2018-08-14
description: >
    XML configuration, API invocation method configuration, annotation method configuration
---

## Dubbo Consumer Configuration

### Detailed Consumer Configuration

There are three ways to configure Dubbo Consumer: XML configuration, API invocation method configuration, and annotation method configuration.

#### XML Configuration

###### The simplest configuration example:

```

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">  
    <dubbo:application name="hello-world-app" />  
    <dubbo:registry address="multicast://224.5.6.7:1234" />  
    <dubbo:protocol name="dubbo" port="20880" />  
    <dubbo:reference id="demoServiceRemote" interface="com.alibaba.dubbo.demo.DemoService" />  
</beans>
```

> Supported configuration tags and corresponding configuration details can be referenced in the provider's usage.

> Next, we will focus on the configuration of `<dubbo:reference/>`.

* Main attributes supported by `<dubbo:reference/>`:  

| Attribute | Description | 
| -------- | ----- |
| id | Service reference id, as Java bean id, needs to be unique | 
| interface | Interface name, used to find the service | 
| version | Version number, consistent with the service provider version | 
| timeout | Service method invocation timeout (milliseconds) | 
| retries | Remote service call retry count, excluding the first call, set to 0 if no retries are needed | 
| connections | Maximum connections per provider; for short connection protocols like rmi, http, hessian, it limits the number of connections; for long connection protocols like dubbo, it indicates the number of established long connections | 
| loadbalance | Load balancing strategy, optional values: random, roundrobin, leastactive, representing: random, polling, least active calls | 
| async | Whether to execute asynchronously, this is unreliable async, just ignores the return value and does not block the execution thread | 
| generic | Generic calls, can be bypassed | 
| check | Check whether the provider exists at startup; true reports an error, false ignores | 
| actives | Maximum concurrent calls per service consumer per service per method | 

For other configuration attributes, please refer to the xsd: http://dubbo.apache.org/schema/dubbo/dubbo.xsd

* `<dubbo:method/>` as a child element of `<dubbo:reference/>` can be configured for methods. Commonly used attributes include:  

| Attribute | Description | 
| -------- | ----- |
| executes | Maximum request limit for service executions | 
| retries | Timeout retry count | 
| timeout | Invocation timeout | 
| loadbalance | Load balancing strategy, optional values: random, roundrobin, leastactive, representing: random, polling, least active calls | 
| async | Whether to execute asynchronously, this is unreliable async, just ignores the return value and does not block the execution thread | 
| actives | Maximum concurrent call limit per service consumer | 

For other attributes, refer to the above xsd.

###### Configuration Overriding Relationships

![undefined](/imgs/blog/2018/08/14/dubbo-usage/1536496436861-1b63bc4e-3e59-4aa3-800e-a32cfe64950d.png)   

<center>Configuration overriding relationship diagram</center>

It includes the configurations for the consumer side and provider; please distinguish carefully.

#### Annotation

###### Reference Annotation for Remote Service 

```
public class AnnotationConsumeService { 

    @com.alibaba.dubbo.config.annotation.Reference 
    public AnnotateService annotateService; 

    // ...

}
```

This way of configuration has the same effect as the previous XML configuration method.

> To specify the dubbo scanning path, refer to the implementation in the previous section for the provider.

#### API Direct Trigger

```
import com.alibaba.dubbo.rpc.config.ApplicationConfig;
import com.alibaba.dubbo.rpc.config.RegistryConfig;
import com.alibaba.dubbo.rpc.config.ConsumerConfig;
import com.alibaba.dubbo.rpc.config.ReferenceConfig;
import com.xxx.XxxService;
// Current application configuration

ApplicationConfig application = new ApplicationConfig();
application.setName("yyy");
// Connection registry configuration
RegistryConfig registry = new RegistryConfig();
registry.setAddress("10.20.130.230:9090");
registry.setUsername("aaa");
registry.setPassword("bbb");
 
// Note: ReferenceConfig is a heavy object that internally encapsulates the connection with the registry and the connection with the service provider.
// Reference remote service
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>(); // This instance is heavy, encapsulating connections with the registry and provider, please cache it yourself to avoid memory and connection leaks

reference.setApplication(application);
reference.setRegistry(registry); // Multiple registries can be configured using setRegistries()
reference.setInterface(XxxService.class);
reference.setVersion("1.0.0");

// Use xxxService just like a local bean
XxxService xxxService = reference.get(); 
```

###### Method Special Settings

```
// Method-level configuration
List<MethodConfig> methods = new ArrayList<MethodConfig>();
MethodConfig method = new MethodConfig();
method.setName("createXxx");
method.setTimeout(10000);
method.setRetries(0);
methods.add(method); 
// Reference remote service
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>(); // This instance is heavy, encapsulating connections with the registry and provider, please cache it yourself to avoid memory and connection leaks
...
reference.setMethods(methods); // Set method-level configuration
```

### Consumer Calls Remote Service
The previous sections focused more on the configuration aspect. Next, through a complete example, we will explain the complete usage of the dubbo consumer.

In this example, there is only one service called UserReadService, which has a method getUserById. It needs to call the remote service through Dubbo. The specific steps are as follows:

1. Create a project
If you already have a project, you can skip this step. Create a Spring Boot project, which can be created via https://start.spring.io/.  
The service provider has already been defined in the provider section.
2. Call the service
```
@RestController
public class UserTestController{
    @Autowired 
    private UserReadService userReadService;
    @RequestMapping("/user/getById")
    public String getUserById(Long id){
        // just test
        return userReadService.getUserById(id).toString();
    }
}
```
3. Dubbo configuration
```

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">  
    <dubbo:application name="hello-world-app" />  
    <dubbo:registry address="multicast://224.5.6.7:1234" />  
    <dubbo:protocol name="dubbo" port="20880" />  
    <dubbo:reference id="userReadService" interface="com.package.UserReadService" check="false" />  
</beans>
```
Other ways of Dubbo configuration can refer to the related configurations in the previous chapter or use the integrated Dubbo Spring Boot starter method.

