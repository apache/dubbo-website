---
type: docs
title: "注册信息简化"
linkTitle: "注册信息简化"
weight: 37
description: "减少注册中心上服务的注册数据"
---

## 背景

Dubbo provider 中的服务配置项有接近 [30 个配置项](http://dubbo.apache.org/en-us/docs/user/references/xml/dubbo-service.html)。 排除注册中心服务治理需要之外，很大一部分配置项是 provider 自己使用，不需要透传给消费者。这部分数据不需要进入注册中心，而只需要以 key-value 形式持久化存储。

Dubbo consumer 中的配置项也有 [20+个配置项](http://dubbo.apache.org/en-us/docs/user/references/xml/dubbo-reference.html)。在注册中心之中，服务消费者列表中只需要关注 application，version，group，ip，dubbo 版本等少量配置，其他配置也可以以 key-value 形式持久化存储。

这些数据是以服务为维度注册进入注册中心，导致了数据量的膨胀，进而引发注册中心(如 zookeeper)的网络开销增大，性能降低。

## 现有功能 sample

当前现状一个简单展示。通过这个展示，分析下为什么需要做简化配置。

参考 sample 子工程： dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-nosimple （跑 sample 前，先跑下 ZKClean 进行配置项清理）

dubbo-provider.xml配置

```
<dubbo:application name="simplified-registry-nosimple-provider"/>
<dubbo:registry address="zookeeper://127.0.0.1:2181"/>
<bean id="demoService" class="org.apache.dubbo.samples.simplified.registry.nosimple.impl.DemoServiceImpl"/>
<dubbo:service async="true" interface="org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService" 
               version="1.2.3" group="dubbo-simple" ref="demoService" 
               executes="4500" retries="7" owner="vict" timeout="5300"/>
```

启动 provider 的 main 方法之后，查看 zookeeper 的叶子节点（路径为：/dubbo/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService/providers 目录下）的内容如下：

```
dubbo%3A%2F%2F30.5.124.158%3A20880%2Forg.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
%3Fanyhost%3Dtrue%26application%3Dsimplified-registry-xml-provider%26async%3Dtrue%26dubbo%3D
2.0.2%26**executes**%3D4500%26generic%3Dfalse%26group%3Ddubbo-simple%26interface%3D
org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService%26methods%3D
sayHello%26**owner**%3Dvict%26pid%3D2767%26**retries**%3D7%26revision%3D1.2.3%26side%3D
provider%26**timeout**%3D5300%26timestamp%3D1542361152795%26valid%3Dtrue%26version%3D1.2.3
```

从加粗字体中能看到有：executes, retries, owner, timeout。但是这些字段不是每个都需要传递给 dubbo ops 或者 dubbo consumer。 同样的，consumer 也有这个问题，可以在例子中启动 Consumer 的 main 方法进行查看。

## 设计目标和宗旨

期望简化进入注册中心的 provider 和 consumer 配置数量。
期望将部分配置项以其他形式存储。这些配置项需要满足：不在服务调用链路上，同时这些配置项不在注册中心的核心链路上(服务查询，服务列表)。

## 配置

简化注册中心的配置，只在 2.7 之后的版本中进行支持。
开启 provider 或者 consumer 简化配置之后，默认保留的配置项如下：

provider：

| Constant Key  | Key  | remark |
| ------ | ------ | ------ |
| APPLICATION_KEY | application |  |
| CODEC_KEY | codec |  |
| EXCHANGER_KEY | exchanger |   |
| SERIALIZATION_KEY | serialization |   |
| CLUSTER_KEY | cluster |  |
| CONNECTIONS_KEY | connections |   |
| DEPRECATED_KEY | deprecated |  |
| GROUP_KEY | group |   |
| LOADBALANCE_KEY | loadbalance |  |
| MOCK_KEY | mock |  |
| PATH_KEY | path |  |
| TIMEOUT_KEY | timeout |  |
| TOKEN_KEY | token |  |
| VERSION_KEY | version |  |
| WARMUP_KEY | warmup |  |
| WEIGHT_KEY | weight |  |
| TIMESTAMP_KEY | timestamp |  |
| DUBBO_VERSION_KEY | dubbo |  |
| SPECIFICATION_VERSION_KEY | **specVersion** | 新增，用于表述dubbo版本，如2.7.0 |


consumer：

| Constant Key  | Key  | remark |
| ------ | ------ | ------ |
| APPLICATION_KEY | application |  |
| VERSION_KEY |  version |  |
| GROUP_KEY | group |  |
| DUBBO_VERSION_KEY | dubbo |  |
| SPECIFICATION_VERSION_KEY | **specVersion** | 新增，用于表述dubbo版本，如2.7.0 |

Constant Key 表示来自于类 org.apache.dubbo.common.Constants 的字段。

下面介绍几种常用的使用方式。所有的 sample，都可以查看[sample-2.7](https://github.com/dubbo/dubbo-samples/tree/master)

### 方式1. 配置dubbo.properties

sample 在 dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-xml 工程下 （跑 sample 前，先跑下ZKClean 进行配置项清理）  

dubbo.properties

```properties

dubbo.registry.simplified=true
dubbo.registry.extra-keys=retries,owner
```

怎么去验证呢？

##### provider端验证

provider端配置

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">
    <!-- optional -->
    <dubbo:application name="simplified-registry-xml-provider"/>
    <dubbo:registry address="zookeeper://127.0.0.1:2181"/>
    <bean id="demoService" class="org.apache.dubbo.samples.simplified.registry.nosimple.impl.DemoServiceImpl"/>
    <dubbo:service async="true" interface="org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService" version="1.2.3" group="dubbo-simple"
                   ref="demoService" executes="4500" retries="7" owner="vict" timeout="5300"/>

</beans>
```

得到的 zookeeper 的叶子节点的值如下：

```
dubbo%3A%2F%2F30.5.124.149%3A20880%2Forg.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService%3F
application%3Dsimplified-registry-xml-provider%26dubbo%3D2.0.2%26group%3Ddubbo-simple%26**owner**%3D
vict%26**retries**%3D7%26**timeout**%3D5300%26timestamp%3D1542594503305%26version%3D1.2.3
```

和上面的**现有功能 sample**进行对比，上面的 sample 中，executes, retries, owner, timeout 四个配置项都进入了注册中心。但是本实例不是：
* 配置了：dubbo.registry.simplified=true， 默认情况下，timeout 在默认的配置项列表，所以还是会进入注册中心；
* 配置了：dubbo.registry.extra-keys=retries,owner ， 所以 retries，owner 也会进入注册中心。

总结：timeout，retries,owner 进入了注册中心，而 executes 没有进入。

consumer 端配置  

```xml

<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">

    <!-- optional -->
    <dubbo:application name="simplified-registry-xml-consumer"/>

    <dubbo:registry address="zookeeper://127.0.0.1:2181" username="xxx" password="yyy" check="true"/>

    <dubbo:reference id="demoService" interface="org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService"
                     owner="vvv" retries="4" actives="6" timeout="4500" version="1.2.3" group="dubbo-simple"/>

</beans>
```

得到的 zookeeper 的叶子节点的值如下：

```
consumer%3A%2F%2F30.5.124.149%2Forg.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService%3F
actives%3D6%26application%3Dsimplified-registry-xml-consumer%26category%3D
consumers%26check%3Dfalse%26dubbo%3D2.0.2%26group%3Ddubbo-simple%26owner%3Dvvv%26version%3D1.2.3
```

* 配置了：dubbo.registry.simplified=true ， 默认情况下，application,version,group,dubbo 在默认的配置项列表，所以还是会进入注册中心；


### 方式2. 声明spring bean

sample在dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-annotation 工程下 （跑 sample 前，先跑下ZKClean 进行配置项清理）

##### Provider配置

privide 端 bean 配置：

```java
// 等同于dubbo.properties配置，用@Bean形式进行配置
@Bean
public RegistryConfig registryConfig() {
    RegistryConfig registryConfig = new RegistryConfig();
    registryConfig.setAddress("zookeeper://127.0.0.1:2181");
    registryConfig.setSimplified(true);
    registryConfig.setExtraKeys("retries,owner");
    return registryConfig;
}
```

```java
// 暴露服务
@Service(version = "1.1.8", group = "d-test", executes = 4500, retries = 7, owner = "victanno", timeout = 5300)
public class AnnotationServiceImpl implements AnnotationService {
    @Override
    public String sayHello(String name) {
        System.out.println("async provider received: " + name);
        return "annotation: hello, " + name;
    }
}
```

和上面 sample 中的 dubbo.properties 的效果是一致的。结果如下：
* 默认情况下，timeout 在默认的配置项列表，所以还是会进入注册中心；
* 配置了 retries,owner 作为额外的 key 进入注册中心 ， 所以 retries，owner 也会进入注册中心。

总结：timeout，retries,owner 进入了注册中心，而 executes 没有进入。

##### Consumer配置

consumer 端 bean 配置：

```java
@Bean
public RegistryConfig registryConfig() {
    RegistryConfig registryConfig = new RegistryConfig();
    registryConfig.setAddress("zookeeper://127.0.0.1:2181");
    registryConfig.setSimplified(true);
    return registryConfig;
  }
```

消费服务：

```java
@Component("annotationAction")
public class AnnotationAction {

    @Reference(version = "1.1.8", group = "d-test", owner = "vvvanno", retries = 4, actives = 6, timeout = 4500)
    private AnnotationService annotationService;
    public String doSayHello(String name) {
        return annotationService.sayHello(name);
    }
}
```

和上面 sample 中 consumer 端的配置是一样的。结果如下：
* 默认情况下，application,version,group,dubbo 在默认的配置项列表，所以还是会进入注册中心。

###### 注意：
如果一个应用中既有provider又有consumer，那么配置需要合并成：

```java
@Bean
public RegistryConfig registryConfig() {
    RegistryConfig registryConfig = new RegistryConfig();
    registryConfig.setAddress("zookeeper://127.0.0.1:2181");
    registryConfig.setSimplified(true);
    //只对provider生效
    registryConfig.setExtraKeys("retries,owner");
    return registryConfig;
}
```

## 后续规划

本版本还保留了大量的配置项，接下来的版本中，会逐渐删除所有的配置项。
