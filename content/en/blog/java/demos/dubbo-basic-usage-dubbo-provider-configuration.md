---
title: "Dubbo Basic Usage - Provider Configuration"
linkTitle: "Dubbo Basic Usage - Provider Configuration"
tags: ["Java"]
date: 2018-08-14
description: >
    Mainly describes how to configure Dubbo, which can be classified into four types: XML configuration, properties configuration, annotation configuration, and API invocation configuration.
---

## Dubbo Basic Usage

This chapter mainly discusses how to configure Dubbo, which can be classified into four types based on configuration methods: XML configuration, properties configuration, annotation configuration, and API invocation configuration. From a functional perspective, it can be divided into Dubbo Provider and Dubbo Consumer. The following chapters will explain Dubbo Provider and Dubbo Consumer separately.

### Dubbo Provider Configuration

#### Provider Configuration Details

There are four ways to configure Dubbo Provider: XML configuration, properties configuration, API invocation configuration, and annotation configuration.

##### XML Configuration

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
    <dubbo:service interface="com.alibaba.dubbo.demo.DemoService" ref="demoServiceLocal" />  
    <dubbo:reference id="demoServiceRemote" interface="com.alibaba.dubbo.demo.DemoService" />  
</beans>
```
In the above example, pay attention to the writing of the dubbo schema:  
```
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">
```

###### Supported Configuration Tags

| Tag | Purpose | Explanation |
| -------- | ----- | :---- |
| &lt;dubbo:service/&gt; | Service Configuration | Used to expose a service and define its metadata; a service can be exposed by multiple protocols and registered with multiple registries |
| &lt;dubbo:reference/&gt; | Reference Configuration | Used to create a remote service proxy; a reference can point to multiple registries |
| &lt;dubbo:protocol/&gt; | Protocol Configuration | Used to configure the protocol information of the service provided; specified by the provider and passive for the consumer |
| &lt;dubbo:application/&gt; | Application Configuration | Used to configure information about the current application, regardless of whether it is a provider or consumer |
| &lt;dubbo:module/&gt; | Module Configuration | Used to configure information about the current module, optional |
| &lt;dubbo:registry/&gt; | Registry Configuration | Used to configure connection information related to the registry |
| &lt;dubbo:monitor/&gt; | Monitoring Center Configuration | Used to configure connection information related to the monitoring center, optional |
| &lt;dubbo:provider/&gt; | Provider Configuration | When certain attributes of ProtocolConfig and ServiceConfig are not configured, this default value is used, optional |
| &lt;dubbo:consumer/&gt; | Consumer Configuration | When certain attributes of ReferenceConfig are not configured, this default value is used, optional |
| &lt;dubbo:method/&gt; | Method Configuration | Used to specify method-level configuration information in ServiceConfig and ReferenceConfig |
| &lt;dubbo:argument/&gt; | Argument Configuration | Used to specify method parameter configurations |

![Configuration Relationship Diagram](/imgs/user/dubbo-config.jpg)

###### Configuration Item Details

* &lt;dubbo:application name="hello-world-app" /&gt;   
Specifies the application name, which must be unique; this application name will be displayed in the console admin list for easier management.

* &lt;dubbo:registry address="multicast://224.5.6.7:1234" /&gt;   
Registry configuration, related to the specific mechanism of service discovery. It can be a Zookeeper address or an Eureka address. The above is a broadcast address, very convenient for local service invocation testing.

* &lt;dubbo:protocol name="dubbo" port="20880" /&gt;   
This is for the transmission protocol and default port, which generally does not need to be changed.

> Next, we'll focus on the configuration of &lt;dubbo:service/&gt;.

* Main attribute list supported by &lt;dubbo:service/&gt;:

| Attribute Name | Description | 
| -------- | ----- |
| version | Version number | 
| scope | Service visibility, value: local or remote, default is remote | 
| actives | Maximum number of activated requests | 
| async | Whether method calls are asynchronous, default is false | 
| cache | Service cache, optional values: lru/threadlocal/jcache | 
| callbacks | Restriction on the number of callback instances | 
| generic | Generic invocation, can be bypassed | 
| class | Class name of the service implementation | 
| connections | Connection count in this service | 
| delay | Delay in milliseconds for publishing the service | 
| executes | Maximum execution limit for service requests | 
| retries | Timeout retry count | 
| timeout | Timeout period for invocation | 

For other configuration properties, please refer to the xsd: http://dubbo.apache.org/schema/dubbo/dubbo.xsd

* &lt;dubbo:method/&gt; as a child element of &lt;dubbo:service/&gt; can be configured for methods. Common properties include:  

| Attribute Name | Description | 
| -------- | ----- |
| executes | Maximum execution limit for service requests | 
| retries | Timeout retry count | 
| timeout | Timeout period for invocation | 

Other properties can refer to the above xsd.

###### Configuration Override Relationship  
![Configuration Override Relationship Diagram](/imgs/user/dubbo-config-override.jpg)

This override relationship includes configurations on both the Provider and Consumer sides; if there are doubts about the consumer, it can be understood after referring to the later chapter on consumers.

#### dubbo.properties Configuration  

> If the public configuration is simple, without multiple registries, multiple protocols, etc., or if you want multiple Spring containers to share configurations, you can use dubbo.properties as the default configuration.

Dubbo will automatically load dubbo.properties from the root classpath, and you can change the default configuration location using the JVM startup parameter -Ddubbo.properties.file=xxx.properties.

###### Example of dubbo.properties Configuration
```
# Application name
dubbo.application.name=dubbodemo-provider
# Registry center address
dubbo.registry.address=zookeeper://localhost:2181
# Broadcast registry center example
#dubbo.registry.address=multicast://224.5.6.7:1234
# Invocation protocol address
dubbo.protocol.name=dubbo
dubbo.protocol.port=28080
```
###### Mapping Rules   
Separate the XML configuration tag names and attribute names with dots, split multiple properties into multiple lines  
* For example: dubbo.application.name=foo is equivalent to &lt;dubbo:application name="foo" /&gt;
* For example: dubbo.registry.address=10.20.153.10:9090 is equivalent to &lt;dubbo:registry address="10.20.153.10:9090" /&gt;

If there are multiple XML tags with the same name configuration, you can distinguish them by id number; if there is no id number, it will take effect for all tags of the same name  
* For example: dubbo.protocol.rmi.port=1234 is equivalent to &lt;dubbo:protocol id="rmi" name="rmi" port="1234" /&gt; 
* For example: dubbo.registry.china.address=10.20.153.10:9090 is equivalent to &lt;dubbo:registry id="china" address="10.20.153.10:9090" /&gt;

###### Override Strategy  
![Override Strategy](/imgs/user/dubbo-config.jpg)

* JVM startup -D parameters take precedence, allowing users to rewrite parameters during deployment and startup, such as changing the protocol port upon startup.
* XML takes precedence next; if there are configurations in XML, the corresponding entries in dubbo.properties become invalid.
* Properties come last, serving as default values; corresponding entries in dubbo.properties will only take effect if XML has no configurations, usually used to share public configurations like the application name.

> Note:
1. If there are multiple dubbo.properties under the root classpath, for example, multiple jar packages contain dubbo.properties, Dubbo will load them at random and print an error log; this may be changed to throw an exception in the future. ↩
2. If no id for the protocol is configured, the protocol name will be used as the default id.

##### Annotation Configuration

###### Service Annotation Exposing Service  
```
import com.alibaba.dubbo.config.annotation.Service;

@Service(timeout = 5000)
public class AnnotateServiceImpl implements AnnotateService { 
    // ...
}
```
###### Javaconfig Configuring Public Modules

```
@Configuration
public class DubboConfiguration {

    @Bean
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("provider-test");
        return applicationConfig;
    }

    @Bean
    public RegistryConfig registryConfig() {
        RegistryConfig registryConfig = new RegistryConfig();
        registryConfig.setAddress("zookeeper://127.0.0.1:2181");
        registryConfig.setClient("curator");
        return registryConfig;
    }
}
```

This configuration method has the same effect as the previous XML configuration method.

###### Specify Dubbo Scanning Path  
```
@SpringBootApplication
@DubboComponentScan(basePackages = "com.alibaba.dubbo.test.service.impl")
public class ProviderTestApp {
    // ...
}
```
Or use spring bean XML configuration:  
```
<dubbo:annotation package="com.chanshuyi.service.impl" />
```

##### Code Configuration

```
import com.alibaba.dubbo.rpc.config.ApplicationConfig;
import com.alibaba.dubbo.rpc.config.RegistryConfig;
import com.alibaba.dubbo.rpc.config.ProviderConfig;
import com.alibaba.dubbo.rpc.config.ServiceConfig;
import com.xxx.XxxService;
import com.xxx.XxxServiceImpl;

// Service implementation
XxxService xxxService = new XxxServiceImpl();

// Current application configuration
ApplicationConfig application = new ApplicationConfig();
application.setName("xxx");

// Connection registry configuration
RegistryConfig registry = new RegistryConfig();
registry.setAddress("10.20.130.230:9090");
registry.setUsername("aaa");
registry.setPassword("bbb");

// Service provider protocol configuration
ProtocolConfig protocol = new ProtocolConfig();
protocol.setName("dubbo");
protocol.setPort(12345);
protocol.setThreads(200);

// Note: ServiceConfig is a heavy object that encapsulates the connection to the registry and opens the service port

// Service provider exposing service configuration
ServiceConfig<XxxService> service = new ServiceConfig<XxxService>(); // This instance is heavy, encapsulating the connection with the registry; please cache it yourself to avoid memory and connection leaks
service.setApplication(application);
service.setRegistry(registry); // Multiple registries can be set using setRegistries()
service.setProtocol(protocol); // Multiple protocols can be set using setProtocols()
service.setInterface(XxxService.class);
service.setRef(xxxService);
service.setVersion("1.0.0");

// Expose and register service
service.export();
```

In general, this method is not recommended for use in Spring applications. The specific meaning is not explained here; you can check the source code on GitHub.

### Provider Interface and Implementation

The above chapter is more about configuration; the next will explain the complete usage of Dubbo Provider through a complete example.

This example includes only one service UserReadService, with a method getUserById. This service needs to be exposed to remote services through Dubbo. The specific steps are as follows:

1. Create a project  
If you already have a project, you can ignore this step. Create a Spring Boot project through https://start.spring.io/.

2. Define the interface  
Define the interface: UserReadService  
```
public interface UserReadService{
public User getUserById(Long userId);
}
```
This interface is generally placed in an independent jar package as a client package. Other applications need to reference this client package to consume this service (except for generic calls).

3. Implement the interface  
Implement UserReadService, with the current implementation deployed in the Provider application.  
```
public UserReadServiceImpl implements UserReadService{
    public User getUserById(Long userId){
        return xxx;
    }
}
```

4. Dubbo configuration  
```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">  
    <dubbo:application name="hello-world-app" />  
    <dubbo:registry address="multicast://224.5.6.7:1234" />  
    <dubbo:protocol name="dubbo" port="20880" />  
    <bean id="userReadService" class="com.package.UserReadServiceImpl"/>
    <dubbo:service interface="com.package.UserReadService" ref="userReadService" />  
</beans>
```
For other ways of configuring Dubbo, you can refer to the related configurations in the previous chapter or use the integrated Dubbo Spring Boot starter.

