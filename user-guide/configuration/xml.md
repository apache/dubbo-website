> ![check](../sources/images/check.gif)**配置项说明**  
> 详细配置项，请参见：配置参考手册 (+)

> ![check](../sources/images/check.gif)**API使用说明**  
如果不想使用Spring配置，而希望通过API的方式进行调用，请参见：API配置 (+)

> ![check](../sources/images/check.gif)**配置使用说明**  
想知道如何使用配置，请参见：快速启动 (+)

示例：
<center style="align=center;">provider.xml</center>

``` xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">  
    <dubbo:application name="hello-world-app"  />  
    <dubbo:registry address="multicast://224.5.6.7:1234" />  
    <dubbo:protocol name="dubbo" port="20880" />  
    <dubbo:service interface="com.alibaba.dubbo.demo.DemoService" ref="demoServiceLocal" />  
    <dubbo:reference id="demoServiceRemote" interface="com.alibaba.dubbo.demo.DemoService" />  
</beans>
```

> ![check](../sources/images/check.gif)所有标签者支持自定义参数，用于不同扩展点实现的特殊配置。

如：
``` xml
<dubbo:protocol name="jms">
    <dubbo:parameter key="queue" value="http://10.20.160.198/wiki/display/dubbo/10.20.31.22" />
</dubbo:protocol>
```
或：(2.1.0开始支持)
> ![check](../sources/images/warning-3.gif) 注意声明：xmlns:p="http://www.springframework.org/schema/p"
``` xml
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
    xmlns:p="http://www.springframework.org/schema/p"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">  
    <dubbo:protocol name="jms" p:queue="http://10.20.160.198/wiki/display/dubbo/10.20.31.22" />  
</beans>
```
**Configuration Relation:**  
![check](../sources/images/dubbo-config.jpg)
* <dubbo:service/> 服务配置，用于暴露一个服务，定义服务的元信息，一个服务可以用多个协议暴露，一个服务也可以注册到多个注册中心。
* <dubbo:reference/> 引用配置，用于创建一个远程服务代理，一个引用可以指向多个注册中心。
* <dubbo:protocol/> 协议配置，用于配置提供服务的协议信息，协议由提供方指定，消费方被动接受。
* <dubbo:application/> 应用配置，用于配置当前应用信息，不管该应用是提供者还是消费者。
* <dubbo:module/> 模块配置，用于配置当前模块信息，可选。
* <dubbo:registry/> 注册中心配置，用于配置连接注册中心相关信息。
* <dubbo:monitor/> 监控中心配置，用于配置连接监控中心相关信息，可选。
* <dubbo:provider/> 提供方的缺省值，当ProtocolConfig和ServiceConfig某属性没有配置时，采用此缺省值，可选。
* <dubbo:consumer/> 消费方缺省配置，当ReferenceConfig某属性没有配置时，采用此缺省值，可选。
* <dubbo:method/> 方法配置，用于ServiceConfig和ReferenceConfig指定方法级的配置信息。
* <dubbo:argument/> 用于指定方法参数配置。

**Configuration Override:**  
![check](../sources/images/dubbo-config-override.jpg)

* 上图中以timeout为例，显示了配置的查找顺序，其它retries, loadbalance, actives等类似。
    * 方法级优先，接口级次之，全局配置再次之。
    * 如果级别一样，则消费方优先，提供方次之。
* 其中，服务提供方配置，通过URL经由注册中心传递给消费方。
* 建议由服务提供方设置超时，因为一个方法需要执行多长时间，服务提供方更清楚，如果一个消费方同时引用多个服务，就不需要关心每个服务的超时设置。
* 理论上ReferenceConfig的非服务标识配置，在ConsumerConfig，ServiceConfig, ProviderConfig均可以缺省配置。
