---
aliases:
    - /zh/overview/tasks/develop/version_group/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/service-group/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/multi-versions/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/version_group/
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/group-merger/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/service-group/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/service-version/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/multi-versions/
    - /zh-cn/overview/mannual/java-sdk/advanced-features-and-usage/service/group-merger/
description: ""
linkTitle: 版本与分组
title: 版本与分组
type: docs
weight: 4
---

Dubbo服务中，接口并不能唯一确定一个服务，只有 `接口+分组+版本号` 的三元组才能唯一确定一个服务。

* 当同一个接口针对不同的业务场景、不同的使用需求或者不同的功能模块等场景，可使用服务分组来区分不同的实现方式。同时，这些不同实现所提供的服务是可并存的，也支持互相调用。
* 当接口实现需要升级又要保留原有实现的情况下，即出现不兼容升级时，我们可以使用不同版本号进行区分。

本文示例完整源码可在以下链接查看：
* [dubbo-samples-group](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-group)
* [dubbo-samples-version](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-version)
* [dubbo-samples-merge](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-merge)

## 使用方式
使用 @DubboService 注解，配置 `group` 参数和 `version` 参数：

接口定义：
```java
public interface DevelopService {
    String invoke(String param);
}
```

接口实现1：
```java
@DubboService(group = "group1", version = "1.0")
public class DevelopProviderServiceV1 implements DevelopService{
    @Override
    public String invoke(String param) {
        StringBuilder s = new StringBuilder();
        s.append("ServiceV1 param:").append(param);
        return s.toString();
    }
}
```
接口实现2：
```java
@DubboService(group = "group2", version = "2.0")
public class DevelopProviderServiceV2 implements DevelopService{
    @Override
    public String invoke(String param) {
        StringBuilder s = new StringBuilder();
        s.append("ServiceV2 param:").append(param);
        return s.toString();
    }
}
```

客户端接口调用：

> 使用 @DubboReference 注解，添加 group 参数和 version 参数

```java
@DubboReference(group = "group1", version = "1.0")
private DevelopService developService;

@DubboReference(group = "group2", version = "2.0")
private DevelopService developServiceV2;

@Override
public void run(String... args) throws Exception {
    //调用DevelopService的group1分组实现
    System.out.println("Dubbo Remote Return ======> " + developService.invoke("1"));
    //调用DevelopService的另一个实现
    System.out.println("Dubbo Remote Return ======> " + developServiceV2.invoke("2"));
}
```

#### 服务消费端(注解配置)

使用 @DubboReference 注解，添加 group 参数

```java
@DubboReference(group = "demo")
private DemoService demoService;

@DubboReference(group = "demo2")
private DemoService demoService2;

//group值为*，标识匹配任意服务分组
@DubboReference(group = "*")
private DemoService demoService2;
```

同样启动 Dubbo 服务后，可在注册中心看到相同服务名不同分组的引用者，以 Nacos 作为注册中心为例，显示如下内容：
![image-service-group-2.png](/imgs/blog/service-group-2.png)

#### 服务提供端( xml 配置)

使用 <dubbo:service /> 标签，添加 group 参数

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

启动 Dubbo 服务，可在注册中心看到相同服务名不同分组的服务，以 Nacos 作为注册中心为例，显示如下内容：

![image-service-group-1.png](/imgs/blog/service-group-1.png)

#### 服务消费端( xml 配置)

使用 <dubbo:reference/> 注解，添加 group 参数

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

同样启动 Dubbo 服务后，可在注册中心看到相同服务名不同分组的引用者，以 Nacos 作为注册中心为例，显示如下内容：

![image-service-group-2.png](/imgs/blog/service-group-2.png)

#### 服务提供端( API 配置)

使用 org.apache.dubbo.config.ServiceConfig 类，添加 group 参数

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

启动 Dubbo 服务，可在注册中心看到相同服务名不同分组的服务，以 Nacos 作为注册中心为例，显示如下内容：

![image-service-group-1.png](/imgs/blog/service-group-1.png)

#### 服务消费端( API 配置)

使用 org.apache.dubbo.config.ReferenceConfig，添加 group 参数

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
同样启动 Dubbo 服务后，可在注册中心看到相同服务名不同分组的引用者，以 Nacos 作为注册中心为例，显示如下内容：
![image-service-group-2.png](/imgs/blog/service-group-2.png)


> 总是 **只调** 一个可用组的实现


## 分组聚合
通过分组对结果进行聚合并返回聚合后的结果，比如菜单服务，用 group 区分同一接口的多种实现，现在消费方需从每种 group 中调用一次并返回结果，对结果进行合并之后返回，这样就可以实现聚合菜单项。

相关代码可以参考 [dubbo 项目中的示例](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-merge)

将多个服务提供者分组作为一个提供者进行访问。应用程序能够像访问一个服务一样访问多个服务，并允许更有效地使用资源。

### 搜索所有分组

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*" merger="true" />
```

### 合并指定分组

```xml
<dubbo:reference interface="com.xxx.MenuService" group="aaa,bbb" merger="true" />
```
### 指定方法合并

指定方法合并结果，其它未指定的方法，将只调用一个 Group

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger="true" />
</dubbo:reference>
```
### 某个方法不合并

某个方法不合并结果，其它都合并结果

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*" merger="true">
    <dubbo:method name="getMenuItems" merger="false" />
</dubbo:reference>
```
### 指定合并策略

指定合并策略，缺省根据返回值类型自动匹配，如果同一类型有两个合并器时，需指定合并器的名称 [合并结果扩展](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/merger)

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger="mymerge" />
</dubbo:reference>
```
### 指定合并方法

指定合并方法，将调用返回结果的指定方法进行合并，合并方法的参数类型必须是返回结果类型本身

```xml
<dubbo:reference interface="com.xxx.MenuService" group="*">
    <dubbo:method name="getMenuItems" merger=".addAll" />
</dubbo:reference>
```

{{% alert title="提示" color="primary" %}}
`2.1.0` 开始支持
{{% /alert %}}





## 跨版本升级
**按照以下的步骤进行版本迁移**

1. 在低压力时间段，先升级一半提供者为新版本
2. 再将所有消费者升级为新版本
3. 然后将剩下的一半提供者升级为新版本

#### 配置
- 新老版本服务提供者
- 新老版本服务消费者

当一个接口实现，出现不兼容升级时，可以用版本号过渡，版本号不同的服务相互间不引用。

>参考用例
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-version](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-version)

### 服务提供者
老版本服务提供者配置
```xml
<dubbo:service interface="com.foo.BarService" version="1.0.0" />
```
新版本服务提供者配置
```xml
<dubbo:service interface="com.foo.BarService" version="2.0.0" />
```
### 服务消费者
老版本服务消费者配置
```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="1.0.0" />
```
新版本服务消费者配置
```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="2.0.0" />
```
### 不区分版本
如果不需要区分版本，可以按照以下的方式配置
```xml
<dubbo:reference id="barService" interface="com.foo.BarService" version="*" />
```


