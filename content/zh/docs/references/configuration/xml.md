---
type: docs
title: "XML 配置"
linkTitle: "XML 配置"
weight: 30
description: "以 XML 配置的方式来配置你的 Dubbo 应用"
---

有关 XML 的详细配置项，请参见：[XML配置参考手册](../../../references/xml)。如果不想使用 Spring 配置，而希望通过 API 的方式进行调用，请参见：[API配置](../api)。想知道如何使用配置，请参见：[快速启动](../../quick-start)。

请在此查看文档描述的[完整示例](https://github.com/apache/dubbo-samples/tree/master/java/dubbo-samples-basic)

## provider.xml 示例

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <dubbo:application name="demo-provider"/>
    <dubbo:registry address="zookeeper://127.0.0.1:2181"/>
    <dubbo:protocol name="dubbo" port="20890"/>
    <bean id="demoService" class="org.apache.dubbo.samples.basic.impl.DemoServiceImpl"/>
    <dubbo:service interface="org.apache.dubbo.samples.basic.api.DemoService" ref="demoService"/>
</beans>
```

## consumer.xml示例

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <dubbo:application name="demo-consumer"/>
    <dubbo:registry group="aaa" address="zookeeper://127.0.0.1:2181"/>
    <dubbo:reference id="demoService" check="false" interface="org.apache.dubbo.samples.basic.api.DemoService"/>
</beans>
```

所有标签都支持自定义参数，用于不同扩展点实现的特殊配置，如：

```xml
<dubbo:protocol name="jms">
    <dubbo:parameter key="queue" value="your_queue" />
</dubbo:protocol>
```

或： [^1]

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xmlns:p="http://www.springframework.org/schema/p"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">  
    <dubbo:protocol name="jms" p:queue="your_queue" />  
</beans>
```

## 配置之间的关系

![dubbo-config](/imgs/user/dubbo-config.jpg)

标签  | 用途 | 解释
------------- | ------------- | -------------
`<dubbo:service/>` | 服务配置  | 用于暴露一个服务，定义服务的元信息，一个服务可以用多个协议暴露，一个服务也可以注册到多个注册中心
`<dubbo:reference/>` [^2]  | 引用配置  | 用于创建一个远程服务代理，一个引用可以指向多个注册中心
`<dubbo:protocol/>`  | 协议配置  | 用于配置提供服务的协议信息，协议由提供方指定，消费方被动接受
`<dubbo:application/>`  | 应用配置  | 用于配置当前应用信息，不管该应用是提供者还是消费者
`<dubbo:module/>`  | 模块配置  | 用于配置当前模块信息，可选
`<dubbo:registry/>`  | 注册中心配置 | 用于配置连接注册中心相关信息
`<dubbo:monitor/>`  | 监控中心配置  | 用于配置连接监控中心相关信息，可选
`<dubbo:provider/>`  | 提供方配置  | 当 ProtocolConfig 和 ServiceConfig 某属性没有配置时，采用此缺省值，可选
`<dubbo:consumer/>`  | 消费方配置  | 当 ReferenceConfig 某属性没有配置时，采用此缺省值，可选
`<dubbo:method/>`  | 方法配置  | 用于 ServiceConfig 和 ReferenceConfig 指定方法级的配置信息
`<dubbo:argument/>`  | 参数配置  | 用于指定方法参数配置


## 不同粒度配置的覆盖关系

以 timeout 为例，下图显示了配置的查找顺序，其它 retries, loadbalance, actives 等类似：

* 方法级优先，接口级次之，全局配置再次之。
* 如果级别一样，则消费方优先，提供方次之。

其中，服务提供方配置，通过 URL 经由注册中心传递给消费方。

![dubbo-config-override](/imgs/user/dubbo-config-override.jpg)

（建议由服务提供方设置超时，因为一个方法需要执行多长时间，服务提供方更清楚，如果一个消费方同时引用多个服务，就不需要关心每个服务的超时设置）。

理论上 ReferenceConfig 中除了`interface`这一项，其他所有配置项都可以缺省不配置，框架会自动使用ConsumerConfig，ServiceConfig, ProviderConfig等提供的缺省配置。

[^1]: `2.1.0` 开始支持，注意声明：`xmlns:p="http://www.springframework.org/schema/p"`
[^2]: 引用缺省是延迟初始化的，只有引用被注入到其它 Bean，或被 `getBean()` 获取，才会初始化。如果需要饥饿加载，即没有人引用也立即生成动态代理，可以配置：`<dubbo:reference ... init="true" />`
