---
title: "Dubbo 基本用法 - Dubbo Consumer 配置"
linkTitle: "Dubbo 基本用法 - Dubbo Consumer 配置"
tags: ["Java"]
date: 2018-08-14
description: >
    XML配置，API调用方式配置，注解方式配置
---

## Dubbo Consumer配置

### Consumer配置详解

配置Dubbo Consumer有3种方式：XML配置，API调用方式配置，注解方式配置。

#### XML配置

###### 最简单的配置的样例：

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



> 支持的配置标签及对应的配置项详解，参考provider中的用法。

> 接下来重点讲解下&lt;dubbo:reference/&gt;的配置。



* &lt;dubbo:reference/&gt;支持的主要属性列表：  

| 属性名 | 说明 | 
| -------- | ----- |
| id | 服务引用id，作为java bean id，需要唯一 | 
| interface | 接口名，用于查找服务 | 
| version | 版本号，与服务提供者的版本一致 | 
| timeout | 服务方法调用超时时间(毫秒) | 
| retries | 远程服务调用重试次数，不包括第一次调用，不需要重试请设为0 | 
| connections | 对每个提供者的最大连接数，rmi、http、hessian等短连接协议表示限制连接数，dubbo等长连接协表示建立的长连接个数 | 
| loadbalance | 负载均衡策略，可选值：random,roundrobin,leastactive，分别表示：随机，轮询，最少活跃调用 | 
| async | 是否异步执行，不可靠异步，只是忽略返回值，不阻塞执行线程 | 
| generic | 泛化调用，可以绕过 | 
| check | 启动时检查提供者是否存在，true报错，false忽略 | 
| actives | 每服务消费者每服务每方法最大并发调用数 | 



其他配置属性请参考xsd：http://dubbo.apache.org/schema/dubbo/dubbo.xsd



* &lt;dubbo:method/&gt;作为&lt;dubbo:reference/&gt;的子元素，它可以针对方法进行配置。比较常用的属性有：  



| 属性名 | 说明 | 
| -------- | ----- |
| executes | 服务执行的请求上限 | 
| retries | 超时重试次数 | 
| timeout | 调用超时时间 | 
| loadbalance | 负载均衡策略，可选值：random,roundrobin,leastactive，分别表示：随机，轮询，最少活跃调用 | 
| async | 是否异步执行，不可靠异步，只是忽略返回值，不阻塞执行线程 | 
| actives | 每服务消费者最大并发调用限制 | 

其他属性，可以参考上面的xsd。

###### 配置的覆盖关系

![undefined](/imgs/blog/2018/08/14/dubbo-usage/1536496436861-1b63bc4e-3e59-4aa3-800e-a32cfe64950d.png)   

<center>配置的覆盖关系图</center> 

其中包含了consumer端和provider的配置，注意区分。

#### annotation


###### Reference注解远程服务 

```

public class AnnotationConsumeService { 

    @com.alibaba.dubbo.config.annotation.Reference 
    public AnnotateService annotateService; 

    // ...

}

```



这种方式的配置和前面用xml配置的方式是一样的效果。



> 指定dubbo扫描路径的方式，可以参考前一章节中provider的实现。





#### api直接触发

```
import com.alibaba.dubbo.rpc.config.ApplicationConfig;
import com.alibaba.dubbo.rpc.config.RegistryConfig;
import com.alibaba.dubbo.rpc.config.ConsumerConfig;
import com.alibaba.dubbo.rpc.config.ReferenceConfig;
import com.xxx.XxxService;
// 当前应用配置

ApplicationConfig application = new ApplicationConfig();
application.setName("yyy");
// 连接注册中心配置
RegistryConfig registry = new RegistryConfig();
registry.setAddress("10.20.130.230:9090");
registry.setUsername("aaa");
registry.setPassword("bbb");
 
// 注意：ReferenceConfig为重对象，内部封装了与注册中心的连接，以及与服务提供方的连接
// 引用远程服务
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>(); // 此实例很重，封装了与注册中心的连接以及与提供者的连接，请自行缓存，否则可能造成内存和连接泄漏

reference.setApplication(application);
reference.setRegistry(registry); // 多个注册中心可以用setRegistries()
reference.setInterface(XxxService.class);
reference.setVersion("1.0.0");

// 和本地bean一样使用xxxService
XxxService xxxService = reference.get(); 
```

###### method特殊设置

```

// 方法级配置
List<MethodConfig> methods = new ArrayList<MethodConfig>();
MethodConfig method = new MethodConfig();
method.setName("createXxx");
method.setTimeout(10000);
method.setRetries(0);
methods.add(method); 
// 引用远程服务
ReferenceConfig<XxxService> reference = new ReferenceConfig<XxxService>(); // 此实例很重，封装了与注册中心的连接以及与提供者的连接，请自行缓存，否则可能造成内存和连接泄漏
...
reference.setMethods(methods); // 设置方法级配置
```

### Consumer 调用远程服务
上面章节更多从配置角度出发，接下来通过一个完整的例子，来讲解下dubbo consumer的完整使用。

这个例子中只有一个服务UserReadService，有一个方法 getUserById。 需要将通过Dubbo调用远程的服务。具体的步骤如下：

1.创建一个工程
如果本来已经有工程，可以忽略。创建一个spring boot工程，可以通过 https://start.spring.io/ 创建。  
服务的提供方，已经在provider章节中进行了定义。
2.调用服务
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
3.Dubbo配置
```

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">  
    <dubbo:application name="hello-world-app" />  
    <dubbo:registry address="multicast://224.5.6.7:1234" />  
    <dubbo:protocol name="dubbo" port="20880" />  
    <dubbo:reference id="userReadService" interface="com.package.UserReadService"check="false" />  
</beans>
```
Dubbo配置的其他方式可以参考上一章节的相关配置，或者使用集成dubbo spring boot starter方式。

 
