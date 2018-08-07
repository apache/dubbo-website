Dubbo基本用法-Dubbo Provider配置
---

# Dubbo基本用法

本章节主要讲述如何配置dubbo，按照配置方式上分，可以分为：XML配置，properties方式配置，注解方式配置，API调用方式配置。
按照功能角度进行划分，可以分为Dubbo Provider和Dubbo Consumer。接下来章节中，分别对dubbo provider和Dubbo consumer进行讲解。

## Dubbo Provider配置

### Provider 配置详解

配置Dubbo Provider有4种方式：XML配置，properties方式配置，API调用方式配置，注解方式配置。

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
    <dubbo:service interface="com.alibaba.dubbo.demo.DemoService" ref="demoServiceLocal" />  
    <dubbo:reference id="demoServiceRemote" interface="com.alibaba.dubbo.demo.DemoService" />  
</beans>
```
上面样例中，注意下dubbo schema的写法：  
```
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://code.alibabatech.com/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://code.alibabatech.com/schema/dubbo http://code.alibabatech.com/schema/dubbo/dubbo.xsd">
```

###### 支持的配置标签

| 标签 | 用途 | 解释 |
| -------- | ----- | :---- |
| &lt;dubbo:service/&gt; | 服务配置 | 用于暴露一个服务，定义服务的元信息，一个服务可以用多个协议暴露，一个服务也可以注册到多个注册中心 |
| &lt;dubbo:reference/&gt; | 引用配置 | 用于创建一个远程服务代理，一个引用可以指向多个注册中心 |
| &lt;dubbo:protocol/&gt; | 协议配置 | 用于配置提供服务的协议信息，协议由提供方指定，消费方被动接受 |
| &lt;dubbo:application/&gt; | 应用配置 | 用于配置当前应用信息，不管该应用是提供者还是消费者 |
| &lt;dubbo:module/&gt; | 模块配置 | 用于配置当前模块信息，可选 |
| &lt;dubbo:registry/&gt; | 注册中心配置 | 用于配置连接注册中心相关信息 |
| &lt;dubbo:monitor/&gt; | 监控中心配置 | 用于配置连接监控中心相关信息，可选 |
| &lt;dubbo:provider/&gt; | 提供方配置 | 当 ProtocolConfig 和 ServiceConfig 某属性没有配置时，采用此缺省值，可选 |
| &lt;dubbo:consumer/&gt; | 消费方配置 | 当 ReferenceConfig 某属性没有配置时，采用此缺省值，可选 |
| &lt;dubbo:method/&gt; | 方法配置 | 用于 ServiceConfig 和 ReferenceConfig 指定方法级的配置信息 |
| &lt;dubbo:argument/&gt; | 参数配置 | 用于指定方法参数配置 |

![undefined](https://cdn.yuque.com/lark/0/2018/png/15841/1527849348155-8423d401-9ea4-4dc6-8720-d9e3d90963b6.png) 

 <center>配置之间关系图</center>

###### 配置项详解

* &lt;dubbo:application name="hello-world-app" /&gt;   
用于指定应用名，这里需要保证应用名唯一，这个应用名在后续的console admin中可以在列表中显示，方便管理。

* &lt;dubbo:registry address="multicast://224.5.6.7:1234" /&gt;   
注册中心配置，和服务发现的具体机制有关系。可以是zookeeper地质，也可以eureka地质。上面这个是广播地址，在本地服务调用的测试过程中非常方便。

* &lt;dubbo:protocol name="dubbo" port="20880" /&gt;   
这里是传输的协议和默认端口，一般不需要更改。

> 接下来重点讲解下&lt;dubbo:service/&gt;的配置。

* &lt;dubbo:service/&gt;支持的主要属性列表：
| 属性名 | 说明 | 
| -------- | ----- |
| version | 版本号 | 
| scope | 服务可见性, 值为：local 或者 remote，默认为remote | 
| actives | 最大的激活的请求数 | 
| async | 方法调用是否异步，默认为false | 
| cache | 服务缓存，可选值：lru/threadlocal/jcache | 
| callbacks | callback实例的限制 | 
| generic | 泛化调用，可以绕过 | 
| class | Service的实现的类名 | 
| connections | 这个服务里的连接数 | 
| delay | 发布服务延迟的毫秒数 | 
| executes | 服务执行的请求上限 | 
| retries | 超时重试次数 | 
| timeout | 调用超时时间 | 

其他配置属性请参考xsd：http://dubbo.apache.org/schema/dubbo/dubbo.xsd

* &lt;dubbo:method/&gt;作为&lt;dubbo:service/&gt;的子元素，它可以针对方法进行配置。比较常用的属性有：  

| 属性名 | 说明 | 
| -------- | ----- |
| executes | 服务执行的请求上限 | 
| retries | 超时重试次数 | 
| timeout | 调用超时时间 | 

其他属性，可以参考上面的xsd。

###### 配置的覆盖关系  
![undefined](https://cdn.yuque.com/lark/0/2018/png/15841/1527849374313-94a5ea24-0e72-4d83-871b-e0e95eab646a.png) 

<center>配置的覆盖关系图</center>

这里的覆盖关系包含了Provider和Consumer两端的配置，如果对consumer有疑问，可以参考后一章节的consumer章节之后再来理解。

#### dubbo.properties方式配置  

> 如果公共配置很简单，没有多注册中心，多协议等情况，或者想多个 Spring 容器想共享配置，可以使用 dubbo.properties 作为缺省配置。

Dubbo 将自动加载 classpath 根目录下的 dubbo.properties，可以通过JVM启动参数 -Ddubbo.properties.file=xxx.properties 改变缺省配置位置。

###### dubbo.properties配置样例
```
# 应用名
dubbo.application.name=dubbodemo-provider
# 注册中心地址
dubbo.registry.address=zookeeper://localhost:2181
# 广播的注册中心样例
#dubbo.registry.address=multicast://224.5.6.7:1234
# 调用协议地址
dubbo.protocol.name=dubbo
dubbo.protocol.port=28080
```
###### 映射规则   
将 XML 配置的标签名，加属性名，用点分隔，多个属性拆成多行  
* 比如：dubbo.application.name=foo等价于<dubbo:application name="foo" />
* 比如：dubbo.registry.address=10.20.153.10:9090等价于<dubbo:registry address="10.20.153.10:9090" />

如果 XML 有多行同名标签配置，可用 id 号区分，如果没有 id 号将对所有同名标签生效  
* 比如：dubbo.protocol.rmi.port=1234等价于<dubbo:protocol id="rmi" name="rmi" port="1099" /> 2
* 比如：dubbo.registry.china.address=10.20.153.10:9090等价于<dubbo:registry id="china" address="10.20.153.10:9090" />

###### 覆盖策略  
![undefined](https://cdn.yuque.com/lark/0/2018/png/15841/1527849393591-2c3de248-1b3d-47d3-bd10-8b415e9fcd39.png) 

* JVM 启动 -D 参数优先，这样可以使用户在部署和启动时进行参数重写，比如在启动时需改变协议的端口。
* XML 次之，如果在 XML 中有配置，则 dubbo.properties 中的相应配置项无效。
* Properties 最后，相当于缺省值，只有 XML 没有配置时，dubbo.properties 的相应配置项才会生效，通常用于共享公共配置，比如应用名。

> 注意：
1. 如果 classpath 根目录下存在多个 dubbo.properties，比如多个 jar 包中有 dubbo.properties，Dubbo 会任意加载，并打印 Error 日志，后续可能改为抛异常。 ↩
2. 协议的 id 没配时，缺省使用协议名作为 id 

#### annotation

###### Service注解暴露服务  
```
import com.alibaba.dubbo.config.annotation.Service;

@Service(timeout = 5000)
public class AnnotateServiceImpl implements AnnotateService { 
    // ...
}
```
###### javaconfig形式配置公共模块

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

这种方式的配置和前面用xml配置的方式是一样的效果。

###### 指定dubbo扫描路径  
```
@SpringBootApplication
@DubboComponentScan(basePackages = "com.alibaba.dubbo.test.service.impl")
public class ProviderTestApp {
    // ...
}
```
或者使用spring bean xml配置方式：
```
<dubbo:annotation package="com.chanshuyi.service.impl" />
```

#### api直接触发
```
import com.alibaba.dubbo.rpc.config.ApplicationConfig;
import com.alibaba.dubbo.rpc.config.RegistryConfig;
import com.alibaba.dubbo.rpc.config.ProviderConfig;
import com.alibaba.dubbo.rpc.config.ServiceConfig;
import com.xxx.XxxService;
import com.xxx.XxxServiceImpl;

// 服务实现
XxxService xxxService = new XxxServiceImpl();

// 当前应用配置
ApplicationConfig application = new ApplicationConfig();
application.setName("xxx");

// 连接注册中心配置
RegistryConfig registry = new RegistryConfig();
registry.setAddress("10.20.130.230:9090");
registry.setUsername("aaa");
registry.setPassword("bbb");

// 服务提供者协议配置
ProtocolConfig protocol = new ProtocolConfig();
protocol.setName("dubbo");
protocol.setPort(12345);
protocol.setThreads(200);

// 注意：ServiceConfig为重对象，内部封装了与注册中心的连接，以及开启服务端口

// 服务提供者暴露服务配置
ServiceConfig<XxxService> service = new ServiceConfig<XxxService>(); // 此实例很重，封装了与注册中心的连接，请自行缓存，否则可能造成内存和连接泄漏
service.setApplication(application);
service.setRegistry(registry); // 多个注册中心可以用setRegistries()
service.setProtocol(protocol); // 多个协议可以用setProtocols()
service.setInterface(XxxService.class);
service.setRef(xxxService);
service.setVersion("1.0.0");

// 暴露及注册服务
service.export();
```

一般在spring应用中，不推荐使用这种方式。 具体的含义这里不做解释，可以通过github查看源码。

### Provider 接口和实现
上面章节更多从配置角度出发，接下来通过一个完整的例子，来讲解下dubbo provider的完整使用。

这个例子中只有一个服务UserReadService，有一个方法 getUserById。 需要将这个服务通过Dubbo暴露给远程的服务。具体的步骤如下：

1.创建工程
如果本来已经有工程，可以忽略。创建一个spring boot工程，可以通过 https://start.spring.io/ 创建。
2.定义接口
定义接口：UserReadService
```
public interface UserReadService{
public User getUserById(Long userId);
}
```
这个接口一般来说会放到独立的jar包里，作为client包。 其他应用要消费这个服务的时候，一般来说需要应用引用这个client包。(除了泛化调用)
3.实现接口
实现UserReadService, 当前实现部署在Provider的应用中。
```
public UserReadServiceImpl implements UserReadService{
    public User getUserById(Long userId){
        return xxx;
    }
}
```
4.Dubbo配置
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
Dubbo配置的其他方式可以参考上一章节的相关配置，或者使用集成dubbo spring boot starter方式。








