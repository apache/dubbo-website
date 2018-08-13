Dubbo Basic Usage-Dubbo Provider Configuration
---

# Dubbo Basic Usage

This chapter mainly talking about how to configure dubbo. According to the configuration mode, it can be divided into the following mode: XML Configuration, Properties Configuration, Annotation Configuration, API Invocation Mode Configuration. And according to the function, we can divide them into Dubbo Provider and Dubbo Consumer. In the following sections, we would explain Dubbo Provider and Dubbo Consumer respectively.    

## Dubbo Provider Configuration

### Provider Configuration in Detail

The configuration mode of Dubbo Provider has 4 different ways: XML Configuration, Properties Configuration, API Invocation Mode Configuration and Annotation Configuration.    

#### XML Configuration

###### The simplest configuration example：
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
In the example above，note the way to write dubbo schema：  
```
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">
```

###### Supported Configuration Tags

| Tags | Application | Describe |
| -------- | ----- | :---- |
| &lt;dubbo:service/&gt; | Service Configuration | Expose a service, define the meta information of the service. One service can use multiple protocols to expose and can be registered to multiple registry centers |
| &lt;dubbo:reference/&gt; | Reference Configuration | Create a remote service agent, one reference can point to multiple registry centers |
| &lt;dubbo:protocol/&gt; | Protocol Configuration | Configure protocol information for providing services, protocol is specified by the provider and accepted passively by the consumer |
| &lt;dubbo:application/&gt; | Application Configuration | Configure current application information, regardless of whether the application is provider or consumer |
| &lt;dubbo:module/&gt; | Module Configuration | Configure current module information. Optional |
| &lt;dubbo:registry/&gt; | Registry Center Configuration | Configure information related to connect registry centers |
| &lt;dubbo:monitor/&gt; | Monitoring Center Configuration | Configure information related to connect monitor centers. Optional |
| &lt;dubbo:provider/&gt; | Provider Configuration | When some properties ProtocolConfig or ServiceConfig are not configured, use this default value. Optional |
| &lt;dubbo:consumer/&gt; | Consumer Configuration | When some properties of ReferenceConfig are not configured, use this default value. Optional |
| &lt;dubbo:method/&gt; | Method Configuration | Configure specific method level information of ServiceConfig and ReferenceConfig  |
| &lt;dubbo:argument/&gt; | Parameter Configuration | Configure parameters of specific method |

![undefined](https://cdn.yuque.com/lark/0/2018/png/15841/1527849348155-8423d401-9ea4-4dc6-8720-d9e3d90963b6.png) 

 <center>Configuration Diagram</center>

###### Configuration item in detail

* &lt;dubbo:application name="hello-world-app" /&gt;   
Apply to specific application name, note that you need to make sure that the application name is unique. The application name can be displayed in the following console admin for easy management.

* &lt;dubbo:registry address="multicast://224.5.6.7:1234" /&gt;   
Configure registry center, related to the specific mechanism of service discovery. It can be zookeeper address or eureka address. The address above is the broadcast address, which is very convenient in the test process of the local service invocation.

* &lt;dubbo:protocol name="dubbo" port="20880" /&gt;   
Here is the transport protocol and the default port, generally no changes are required.

> Next, we will focuse on the configuration of &lt;dubbo:service/&gt;

* &lt;dubbo:service/&gt;List of main properties supported：
| Properties Name | Description | 
| -------- | ----- |
| version | Version number | 
| scope | Service visibility, value can be local or remote，remote by default | 
| actives | Maximum number of activated requests | 
| async | Whether the method called asynchronously，false by default | 
| cache | Service cache，optional value：lru/threadlocal/jcache | 
| callbacks | Limitation of callback instance | 
| generic | Generalized calls which can be bypassed | 
| class | The implementation of the service's class name  | 
| connections | The number of connections in the service | 
| delay | The number of milliseconds delay for publicating the service | 
| executes | Upper bound of service execution requests | 
| retries | Timeout retry times | 
| timeout | Invocation timeout time | 

For other configuration properties, please refer to xsd：http://dubbo.apache.org/schema/dubbo/dubbo.xsd

* &lt;dubbo:method/&gt; as the sub-element of &lt;dubbo:service/&gt; can be configured corresponding to method. Properties that are commonly used are：  

| Properties Name | Description | 
| -------- | ----- |
| executes | Upper bound of service execution requests | 
| retries | Timeout retry times | 
| timeout | Invocation timeout time | 

For other properties，you can refer to xsd above。

###### Configuration Coverage Relationship  
![undefined](https://cdn.yuque.com/lark/0/2018/png/15841/1527849374313-94a5ea24-0e72-4d83-871b-e0e95eab646a.png) 

<center>Configuration Coverage Relationship Diagram</center>

The coverage relationship here includes the configuration of both provider end and consumer end. If you have any questions about consumer, you can refer to the next chapter, consumer chapter, to understand.

#### dubbo.properties Configuration  

> If the public configuration is very simple, no multiple registry centers, no multiple protocols, etc., or if you want multiple Spring containers to share the configuration, you can use dubbo.properties as the default configurations.

Dubbo would load dubbo.properties under the classpath root directory automaticaly，you can change the default configuration location by JVM startup parameter -Ddubbo.properties.file=xxx.properties.

###### dubbo.properties Configuration example
```
# application name
dubbo.application.name=dubbodemo-provider
# registry center address
dubbo.registry.address=zookeeper://localhost:2181
# Example of broadcasting registry center
#dubbo.registry.address=multicast://224.5.6.7:1234
# address for calling protocol
dubbo.protocol.name=dubbo
dubbo.protocol.port=28080
```