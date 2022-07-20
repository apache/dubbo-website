---
type: docs
title: "服务分组"
linkTitle: "服务分组"
weight: 2
description: "使用服务分组区分服务接口的不同实现"
---

# 特性说明
同一个接口针对不同的业务场景、不同的使用需求或者不同的功能模块等场景，可使用服务分组来区分不同的实现方式。同时，这些不同实现所提供的服务是可并存的，也支持互相调用。

## 配置
- 服务提供端
- 服务消费端

# 使用场景
当一个接口有多种实现时，可以用 group 区分。

# 参考用例

[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-group](https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-group)

# 使用方式
Dubbo服务分组可选择使用[注解配置](#properties1)、[xml配置](#properties2)或[API配置](#properties3)方式

## 注解配置

### 服务提供端

使用@DubboService注解，添加group参数

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

启动Dubbo服务，可在注册中心看到相同服务名不同分组的服务，以Nacos作为注册中心为例，显示如下内容：

![image-service-group-1.png](/imgs/blog/service-group-1.png)

### 服务消费端

使用@DubboReference注解，添加group参数

```java
@DubboReference(group = "demo")
private DemoService demoService;

@DubboReference(group = "demo2")
private DemoService demoService2;

//group值为*，标识匹配任意服务分组
@DubboReference(group = "*")
private DemoService demoService2;
```

同样启动Dubbo服务后，可在注册中心看到相同服务名不同分组的引用者，以Nacos作为注册中心为例，显示如下内容：
![image-service-group-2.png](/imgs/blog/service-group-2.png)

## xml配置

### 服务提供端

使用<dubbo:service />标签，添加group参数

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

启动Dubbo服务，可在注册中心看到相同服务名不同分组的服务，以Nacos作为注册中心为例，显示如下内容：

![image-service-group-1.png](/imgs/blog/service-group-1.png)

### 服务消费端

使用<dubbo:reference/>注解，添加group参数

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
    <!-- 引用服务接口 -->
    <dubbo:reference id="demoService" interface="org.apache.dubbo.example.service.DemoService" group="demo"/>

    <dubbo:reference id="demoService2" interface="org.apache.dubbo.example.service.DemoService" group="demo2"/>

    <!-- group值为*，标识匹配任意服务分组 -->
    <dubbo:reference id="demoService3" interface="org.apache.dubbo.example.service.DemoService" group="*"/>
    ...
</beans>
```

同样启动Dubbo服务后，可在注册中心看到相同服务名不同分组的引用者，以Nacos作为注册中心为例，显示如下内容：

![image-service-group-2.png](/imgs/blog/service-group-2.png)

## API配置

### 服务提供端

使用org.apache.dubbo.config.ServiceConfig类，添加group参数

```java
// ServiceConfig为重对象，内部封装了与注册中心的连接，以及开启服务端口
// 请自行缓存，否则可能造成内存和连接泄漏
ServiceConfig<DemoService> service = new ServiceConfig<>();
service.setInterface(DemoService.class);
service.setGroup("demo");
...

ServiceConfig<DemoService> service2 = new ServiceConfig<>();
service.setInterface(DemoService.class);
service.setGroup("demo2");
...
```

启动Dubbo服务，可在注册中心看到相同服务名不同分组的服务，以Nacos作为注册中心为例，显示如下内容：

![image-service-group-1.png](/imgs/blog/service-group-1.png)

### 服务消费端

使用org.apache.dubbo.config.ReferenceConfig，添加group参数

```java
// ReferenceConfig为重对象，内部封装了与注册中心的连接，以及开启服务端口
// 请自行缓存，否则可能造成内存和连接泄漏
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
同样启动Dubbo服务后，可在注册中心看到相同服务名不同分组的引用者，以Nacos作为注册中心为例，显示如下内容：
![image-service-group-2.png](/imgs/blog/service-group-2.png)

### 提示

总是**只调**一个可用组的实现
