---
type: docs
title: "Nacos Registry Center"
linkTitle: "Nacos"
weight: 1
description: "Nacos registry center for dubbo"
---

Nacos is a very important registry center for Dubbo ecosystem, [`dubbo-registry-nacos`](https://github.com/apache/incubator-dubbo/tree/master/dubbo-registry/dubbo-registry-nacos) is the implementation of Nacos integration to Nacos.

## Prepare Work

When you integrate [`dubbo-registry-nacos`](https://github.com/apache/incubator-dubbo/tree/master/dubbo-registry/dubbo-registry-nacos) into your Dubbo project, please Make sure the Nacos service is started in the background. If you are not familiar with the basic use of Nacos, you can refer to [Nacos Quick Start](https://nacos.io/en-us/docs/quick-start.html). It is recommended to use the version equal or above Nacos `1.0.0`.


## Quick Start

The steps for Dubbo to integrate Nacos as a registry center are very simple. The general steps can be divided into "add Maven dependencies" and "configure registry center".


### Add Maven Dependencies

First, you need to add the `dubbo-registry-nacos` Maven dependency to your project's `pom.xml` file, and we strongly recommend that you use Dubbo `2.6.5`:


```xml
<dependencies>

    ...
        
    <!-- Dubbo Nacos registry dependency -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>dubbo-registry-nacos</artifactId>
        <version>0.0.2</version>
    </dependency>   
    
    <!-- Keep latest Nacos client version -->
    <dependency>
        <groupId>com.alibaba.nacos</groupId>
        <artifactId>nacos-client</artifactId>
        <version>[0.6.1,)</version>
    </dependency>
    
    <!-- Dubbo dependency -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>dubbo</artifactId>
        <version>2.6.5</version>
    </dependency>
    
    <!-- Alibaba Spring Context extension -->
    <dependency>
        <groupId>com.alibaba.spring</groupId>
        <artifactId>spring-context-support</artifactId>
        <version>1.0.2</version>
    </dependency>

    ...
    
</dependencies>
```

When you add `dubbo-registry-nacos` to your project, you don't need to explicitly program the service discovery and registration logic. The actual implementation is provided by the three-party package.


### Configure Registry Center

Assuming your Dubbo app uses the Spring Framework assembly, there are two configuration options available: [Dubbo Spring Externalization Configuration](https://mercyblitz.github.io/2018/01/18/Dubbo-%E5%A4%96%E9%83%A8%E5%8C%96%E9%85%8D%E7%BD%AE/) and the Spring XML configuration file.


### [Dubbo Spring Externalization Configuration](https://mercyblitz.github.io/2018/01/18/Dubbo-%E5%A4%96%E9%83%A8%E5%8C%96%E9%85%8D%E7%BD%AE/)


The Dubbo Spring externalization configuration is a new feature introduced by Dubbo `2.5.8` that automatically generates and binds Dubbo configuration beans through the Spring `Environment` property, simplifying configuration and lowering the microservice development threshold.

Assuming your Nacos Server is also running on server `10.20.153.10` and using the default Nacos service port `8848`, you only need to adjust the `dubbo.registry.address` property as follows:


```properties
## Other properties remain unchanged

## Nacos registry address
dubbo.registry.address = nacos://10.20.153.10:8848
...
```

Then, restart your Dubbo app, Dubbo's service provider and consumer information can be displayed on the Nacos console:

![dubbo-registry-nacos-1.png](/imgs/blog/dubbo-registry-nacos-1.png)


As shown in the figure, the information whose service name prefix is `providers:` is the meta information of the service provider, and the `consumers:` represents the meta information of the service consumer. Click on "**Details**" to view service status details:

![dubbo-registry-nacos-2.png](/imgs/blog/dubbo-registry-nacos-2.png)



If you are using the Spring XML configuration file to assemble the Dubbo registry, please refer to the next section.



### Spring XML Configuration File

Similar to [Dubbo Spring Externalization Configuration](https://mercyblitz.github.io/2018/01/18/Dubbo-%E5%A4%96%E9%83%A8%E5%8C%96%E9%85%8D%E7%BD%AE/), just adjust the `address` attribute to configure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans        http://www.springframework.org/schema/beans/spring-beans-4.3.xsd        http://dubbo.apache.org/schema/dubbo        http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
 
    <!-- Provider application information for calculating dependencies -->
    <dubbo:application name="dubbo-provider-xml-demo"  />
 
    <!-- Use Nacos as Registry Center -->
    <dubbo:registry address="nacos://10.20.153.10:8848" />
 	...
</beans>
```


After restarting the Dubbo app, you can also find that the registration meta-information of the service provider and consumer is presented on the Nacos console:

![dubbo-registry-nacos-3.png](/imgs/blog/dubbo-registry-nacos-3.png)
