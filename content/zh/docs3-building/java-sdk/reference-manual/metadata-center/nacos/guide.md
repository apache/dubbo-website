---
type: docs
title: "使用说明"
linkTitle: "使用说明"
weight: 2
---

# 前置条件
- 了解[Dubbo基本开发步骤](https://dubbo.apache.org/zh/docs3-building/java-sdk/quick-start/spring-boot/)
- 启动nacos server，请参考[nacos快速入门](https://nacos.io/zh-cn/docs/quick-start.html)

> 当Dubbo使用`3.0.0`及以上版本时，需要使用Nacos `2.0.0`及以上版本

# 使用说明
Dubbo 融合 Nacos 成为元数据中心的操作步骤非常简单，大致分为“增加 Maven 依赖”以及“配置元数据中心”两步。
> 如果元数据地址(dubbo.metadata-report.address)也不进行配置，会使用注册中心的地址来用作元数据中心。

## 增加Maven依赖
只需要将dubbo-metadata-report-nacos的Maven依赖添加到pom.xml文件中即可。

引入dubbo-metadata-report-nacos会自动引入dubbo-configcenter-nacos，将元数据放到配置中心。

Dubbo`3.0.0`及以上版本，dubbo-metadata-report-nacos引入nacos-client版本为`2.0.0`及以上版本。
```xml
<dependencies>
    ...
    <!-- Dubbo Nacos Metadata Report dependency -->
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-metadata-report-nacos</artifactId>
        <version>3.0.7</version>
    </dependency>   
    
    <!-- Dubbo dependency -->
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>3.0.7</version>
    </dependency>
    ...
</dependencies>
```

## 配置元数据中心
如果Dubbo使用 Spring Framework 装配，有三种配置方法分别为：[Dubbo Spring 外部化配置](#method1)、[Spring XML 配置文件](#method2)和[API配置](#method3)，推荐使用第一种配置方式。

### <a id="method1">Dubbo Spring外部化配置</a>
Dubbo Spring 外部化配置是由 Dubbo 2.5.8引入的新特性，可通过 Spring Environment 属性自动地生成并绑定 Dubbo 配置 Bean，实现配置简化，并且降低微服务开发门槛。

当Dubbo使用Nacos为注册中心，假设启动服务器IP为：10.20.153.10，端口号为：8848，则在Dubbo外部化配置文件中添加以下配置：

```properties
## application
dubbo.application.name=your-dubbo-application

## Nacos Metadata Report address
dubbo.metadata-report.address=nacos://10.20.153.10:8848

##如果要使用其他参数，可以使用以下2种方式
#第一种方式
#dubbo.metadata-report.address=nacos://10.20.153.10:8848?username=nacos&password=nacos&namespace=5cbb70a5-xxx-xxx-xxx-d43479ae0932&group=demo

#第二种方式
#dubbo.metadata-report.address=nacos://10.20.153.10:8848
#dubbo.metadata-report.username=nacos
#dubbo.metadata-report.password=nacos
#dubbo.metadata-report.parameters.namespace=5cbb70a5-xxx-xxx-xxx-d43479ae0932
#dubbo.metadata-report.group=demo
...
```
可配置的参数参考完整配置项说明

> Dubbo`3.0.0`版本以后，增加了是否注册消费者的元数据，如果需要将消费者元数据存放到nacos元数据中心上，需要将参数(report-consumer-definition)设置为true，默认是false。

设置方式如下：
```properties
 ##设置是否注册消费者的参数，可以使用以下2种方式
 #第一种方式
 #dubbo.registry.address=nacos://10.20.153.10:8848?report-consumer-definition=true

 #第二种方式
 #dubbo.registry.address=nacos://10.20.153.10:8848
 #dubbo.registry.parameters.report-consumer-definition=true
 ```
随后，重启Dubbo应用，在Nacos的控制台上可看到服务提供者和消费者的应用级别以及接口级别元数据信息：

![image-dubbo-metadata-nacos-1.png](/imgs/blog/dubbo-metadata-nacos-1.png)

#### 应用级别元数据

应用级别元数据只有当一个应用定义服务之后，才会进行暴露。会根据当前应用的自身信息，以及接口信息，去计算出该应用的 revision 修订值，用于保存应用级别元数据。

> 在Dubbo`3.0.0`及以上版本中，引入了应用元数据的概念，应用元数据描述的是整个应用的信息概览。如需暴露应用级别元数据，需要将配置参数metadata-type设置为remote(默认为local)，或将参数reportMetadata设置为true(默认为false)。

设置方式如下：
```properties
 #设置是否暴露应用级别元数据，可以使用以下2种方式
 #第一种方式
 dubbo.metadata-report.address=nacos://10.20.153.10:8848
 dubbo.application.metadata-type=remote

 #第二种方式
 #dubbo.metadata-report.address=nacos://10.20.153.10:8848
 #dubbo.metadata-report.report-metadata=true
 #或
 #dubbo.metadata-report.address=nacos://10.20.153.10:8848?report-metadata=true
 ```
元数据信息详情：

![image-dubbo-metadata-nacos-2.png](/imgs/blog/dubbo-metadata-nacos-2.png)

#### 接口级别元数据

在 Nacos 中，本身就存在配置中心这个概念，正好用于元数据存储。在配置中心的场景下，存在命名空间- namespace 的概念，在 namespace 之下，还存在 group 概念。即通过 namespace 和 group 以及 dataId 去定位一个配置项，在不指定 namespace 的情况下，默认使用 ```public``` 作为默认的命名空间。

```properties
Provider: namespace: 'public', dataId: '{service name}:{version}:{group}:provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:{version}:{group}:consumer:{application name}', group: 'dubbo'
```
当 version 或者 group 不存在时`:` 依然保留:
```properties
Provider: namespace: 'public', dataId: '{service name}:::provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:::consumer:{application name}', group: 'dubbo'
```

Providers接口元数据详情：

![image-dubbo-metadata-nacos-3.png](/imgs/blog/dubbo-metadata-nacos-3.png)

Consumers接口元信息详情：

![image-dubbo-metadata-nacos-4.png](/imgs/blog/dubbo-metadata-nacos-4.png)

### <a id="method2">Spring XML配置文件</a>
同样，当Dubbo使用Nacos为注册中心，假设启动服务器IP为：10.20.153.10，端口号为：8848，则在Spring Bean在XML文件中添加以下配置：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xsi:schemaLocation="http://www.springframework.org/schema/beans        
       http://www.springframework.org/schema/beans/spring-beans-4.3.xsd        
       http://dubbo.apache.org/schema/dubbo        
       http://dubbo.apache.org/schema/dubbo/dubbo.xsd">

    <!-- 提供方应用信息 -->
    <dubbo:application name="your-dubbo-application"/>

    <!-- 使用 Nacos 元数据中心 -->
    <dubbo:metadata-report address="nacos://10.20.153.10:8848" username="nacos" password="nacos" />

    <!-- 如果要使用其他参数可以使用下面方式 -->
	<!-- 当参数在xsd中有定义时，可用以下方式 -->
	<!-- <dubbo:metadata-report address="nacos:// 10.20.153.10:8848" username="nacos" password="nacos" group="demo" /> -->

	<!-- 或者使用以下方式，将参数配置在address中 -->
    <!-- <dubbo:metadata-report address="nacos://10.20.153.10:8848?namespace=5cbb70a5-xxx-xxx-xxx-d43479ae0932" username="nacos" password="nacos" /> -->
    ...
</beans>
```
可配置的参数参考完整配置项说明

> Dubbo`3.0.0`版本以后，增加了是否注册消费者的元数据，如果需要将消费者元数据存放到nacos元数据中心上，需要将参数(report-consumer-definition)设置为true，默认是false。

设置方式如下：
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
    <!-- 使用 Nacos 元数据中心 -->
    <dubbo:metadata-report address="nacos://10.20.153.10:8848?report-consumer-definition=true" username="nacos" password="nacos" />
   ...
 </beans>
 ```

随后，重启Dubbo应用，在Nacos的控制台上可看到服务提供者和消费者的应用级别以及接口级别元数据信息：

![image-dubbo-metadata-nacos-1.png](/imgs/blog/dubbo-metadata-nacos-1.png)

#### 应用级别元数据
应用级别元数据只有当一个应用定义服务之后，才会进行暴露。会根据当前应用的自身信息，以及接口信息，去计算出该应用的 revision 修订值，用于保存应用级别元数据。

> 在Dubbo`3.0.0`及以上版本中，引入了应用元数据的概念，应用元数据描述的是整个应用的信息概览。如需暴露应用级别元数据，需要将配置参数metadata-type设置为remote(默认为local)，或将参数reportMetadata设置为true(默认为false)。

设置方式如下：
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
   <!-- 设置是否暴露应用级别元数据，可以使用以下两种方式-->
   <!-- 第一种方式 -->
   <dubbo:application name="your-dubbo-application" metadata-type="remote"/>
 
   <!-- 第二种方式 -->
   <dubbo:metadata-report address="nacos://10.20.153.10:8848" username="nacos" password="nacos" report-metadata="true"/>
   ...
 </beans>
 ```

元数据信息详情：
![image-dubbo-metadata-nacos-2.png](/imgs/blog/dubbo-metadata-nacos-2.png)

#### 接口级别元数据
在 Nacos 中，本身就存在配置中心这个概念，正好用于元数据存储。在配置中心的场景下，存在命名空间- namespace 的概念，在 namespace 之下，还存在 group 概念。即通过 namespace 和 group 以及 dataId 去定位一个配置项，在不指定 namespace 的情况下，默认使用 ```public``` 作为默认的命名空间。

```properties
Provider: namespace: 'public', dataId: '{service name}:{version}:{group}:provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:{version}:{group}:consumer:{application name}', group: 'dubbo'
```
当 version 或者 group 不存在时`:` 依然保留:

```properties
Provider: namespace: 'public', dataId: '{service name}:::provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:::consumer:{application name}', group: 'dubbo'
```

Providers接口元数据详情：

![image-dubbo-metadata-nacos-3.png](/imgs/blog/dubbo-metadata-nacos-3.png)

Consumers接口元信息详情：

![image-dubbo-metadata-nacos-4.png](/imgs/blog/dubbo-metadata-nacos-4.png)


### <a id="method3">API配置</a>
同样，当Dubbo使用Nacos为注册中心，假设启动服务器IP为：10.20.153.10，端口号为：8848，则在Spring Bean在XML文件中添加以下配置：

```java
public class ProviderBootstrap {

    @Bean
    public MetadataReportConfig metadataReportConfig() {
        MetadataReportConfig metadataReportConfig = new MetadataReportConfig();
        // 使用 Nacos 元数据中心
        metadataReportConfig.setAddress("nacos://10.20.153.10:8848?username=nacos&password=nacos");

        //如果要使用其他参数可以使用下面方式
        //作为地址参数传入
        //metadataReportConfig.setAddress("nacos://localhost:8848?username=nacos&password=nacos&namespace=5cbb70a5-xxx-xxx-xxx-d43479ae0932");

        //直接set值，如果set没有找到相关参数，可以放入parameters中
        //metadataReportConfig.setAddress("nacos://localhost:8848");
        //metadataReportConfig.setUsername("nacos");
        //metadataReportConfig.setPassword("nacos");
        //
        //Map<String, String> map = new HashMap();
        //map.put("namespace","5cbb70a5-xxx-xxx-xxx-d43479ae0932");
        //metadataReportConfig.setParameters(map);

        return metadataReportConfig;
    }

}
```
可配置的参数参考完整配置项说明

> Dubbo`3.0.0`版本以后，增加了是否注册消费者的元数据，如果需要将消费者元数据存放到nacos元数据中心上，需要将参数(report-consumer-definition)设置为true，默认是false。

设置方式如下：

> ```java
> public class ConsumerBootstrap {
>   @Bean
>   public MetadataReportConfig metadataReportConfig() {
>       MetadataReportConfig metadataReportConfig = new MetadataReportConfig();
>       metadataReportConfig.setAddress("nacos://localhost:8848?username=nacos&password=nacos&report-consumer-definition=true");
>       return metadataReportConfig;
>   }
> }
> ```
随后，重启Dubbo应用，在Nacos的控制台上可看到服务提供者和消费者的应用级别以及接口级别元数据信息：

![image-dubbo-metadata-nacos-1.png](/imgs/blog/dubbo-metadata-nacos-1.png)

#### 应用级别元数据
应用级别元数据只有当一个应用定义服务之后，才会进行暴露。会根据当前应用的自身信息，以及接口信息，去计算出该应用的 revision 修订值，用于保存应用级别元数据。

> 在Dubbo`3.0.0`及以上版本中，引入了应用元数据的概念，应用元数据描述的是整个应用的信息概览。如需暴露应用级别元数据，需要将配置参数metadata-type设置为remote(默认为local)，或将参数reportMetadata设置为true(默认为false)。

设置方式如下：
 ```java
 public class ProviderBootstrap {

    //设置是否暴露应用级别元数据，可以使用以下两种方式
    //第一种方式
    @Bean
    public MetadataReportConfig metadataReportConfig() {
        MetadataReportConfig metadataReportConfig = new MetadataReportConfig();
        metadataReportConfig.setAddress("nacos://localhost:8848?username=nacos&password=nacos");
        metadataReportConfig.setReportMetadata(true);
        return metadataReportConfig;
    }

    //第二种方式
    @Bean
    public ApplicationConfig applicationConfig() {
        ApplicationConfig applicationConfig = new ApplicationConfig();
        applicationConfig.setName("nacos-metadata-demo-provider-annotation");
        applicationConfig.setMetadataType(REMOTE_METADATA_STORAGE_TYPE);
        return applicationConfig;
    }
}
 ```

元数据信息详情：

![image-dubbo-metadata-nacos-2.png](/imgs/blog/dubbo-metadata-nacos-2.png)

#### 接口级别元数据
在 Nacos 中，本身就存在配置中心这个概念，正好用于元数据存储。在配置中心的场景下，存在命名空间- namespace 的概念，在 namespace 之下，还存在 group 概念。即通过 namespace 和 group 以及 dataId 去定位一个配置项，在不指定 namespace 的情况下，默认使用 `public` 作为默认的命名空间。

```properties
Provider: namespace: 'public', dataId: '{service name}:{version}:{group}:provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:{version}:{group}:consumer:{application name}', group: 'dubbo'
```

当 version 或者 group 不存在时`:` 依然保留:

```properties
Provider: namespace: 'public', dataId: '{service name}:::provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:::consumer:{application name}', group: 'dubbo'
```

Providers接口元数据详情：

![image-dubbo-metadata-nacos-3.png](/imgs/blog/dubbo-metadata-nacos-3.png)

Consumers接口元信息详情：

![image-dubbo-metadata-nacos-4.png](/imgs/blog/dubbo-metadata-nacos-4.png)



# 服务自省映射 - Service Name Mapping

Dubbo`3.0.0`及以上版本中，默认使用了服务自省机制去实现服务发现，关于服务自省可以查看[服务自省](https://mercyblitz.github.io/2020/05/11/Apache-Dubbo-服务自省架构设计/)

简而言之，服务自省机制需要能够通过 interface name 去找到对应的 application name，这个关系可以是一对多的，即一个 service name 可能会对应多个不同的 application name。在 3.0 中，元数据中心提供此项映射的能力。

在上面提到，service name 和 application name 可能是一对多的，在 nacos 中，使用单个 key-value 进行保存，多个 application name 通过英文逗号,隔开。由于是单个 key-value 去保存数据，在多客户端的情况下可能会存在并发覆盖的问题。因此，我们使用 nacos 中 publishConfigCas 的能力去解决该问题。在 nacos 中，使用 publishConfigCas 会让用户传递一个参数 casMd5，该值的含义是之前配置内容的 md5 值。不同客户端在更新之前，先去查一次 nacos 的 content 的值，计算出 md5 值，当作本地凭证。在更新时，把凭证 md5 传到服务端比对 md5 值, 如果不一致说明在次期间被其他客户端修改过，重新获取凭证再进行重试(CAS)。目前如果重试6次都失败的话，放弃本次更新映射行为。

Nacos api:

```properties
ConfigService configService = ...
configService.publishConfigCas(key, group, content, ticket);
```

映射信息位于 ```namespace: ‘public’, dataId: ‘{service name}’, group: ‘mapping’```.

![image-dubbo-servicenamemapping.png](/imgs/blog/dubbo-servicenamemapping.png)

# 完整配置项

参数名 | 中文描述| 默认值
---|---|---
username|连接Nacos Server的用户名|空
paasword|连接Nacos Server的密码|空
backup|访问Nacos备用地址|空
namespace|命名空间的ID|public
group|分组名称|DEFAULT_GROUP
timeout|连接元数据中心超时时间（ms）|
retry-time|重试次数|100
retry-period|重试间隔时间(ms)|3000
cycle-report|是否每天上报元数据|true
sync-report|是否同步上报元数据|false
file|保存元数据中心动态列表的文件|空
report-metadata|当metadataType为local时是否上报应用元数据|false
report-definition|是否上报接口级别元数据|true
report-consumer-definition|是否上报消费端|false