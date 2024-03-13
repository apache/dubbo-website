---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/registry/overview/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/registry/overview/
description: ""
linkTitle: 注册中心概述
title: 注册中心概述
type: docs
weight: 1
---


注册中心是 Dubbo 服务治理的核心组件，Dubbo 依赖注册中心的协调实现服务（地址）发现，自动化的服务发现是微服务实现动态扩缩容、负载均衡、、流量治理的基础。Dubbo 的服务发现机制经历了 Dubbo2 时代的接口级服务发现、Dubbo3 时代的应用级服务发现，具体可参见 [服务发现机制](/zh-cn/overview/mannual/java-sdk/concepts-and-architecture/service-discovery/) 解析了解具体演进过程。

## 基本使用
开发应用时必须指定 Dubbo 注册中心（registry）组件，配置很简单，只需指定注册中心的集群地址即可：

以 Spring Boot 开发为例，在 application.yml 增加 registry 配置项目

```yaml
dubbo
 registry
  address: {protocol}://{cluster-address}
```
其中，protocol 为选择的配置中心类型，cluster-address 为访问注册中心的集群地址，如

`address: nacos://localhost:8848`

如需集群格式地址可使用 backup 参数

`address: nacos://localhost:8848?backup=localshot:8846,localshot:8847`

> 应用必须指定 Dubbo 注册中心，即使不启用注册中心也要配置（可通过设置地址为空 address='N/A' ）。

除了 其余根据每个配置中心的不同，可以参考 [registry 配置参考手册](/zh-cn/overview/mannual/java-sdk/reference-manual/config/properties/#registry)或通过 parameters 参数进行扩展。

## 配置中心与元数据中心
配置中心、元数据中心是实现 Dubbo 高阶服务治理能力的基础组件，相比于注册中心通常这两个组件的配置是可选的。

为了兼容 2.6 及老版本的配置，对于部分注册中心类型（如 Zookeeper、Nacos 等），Dubbo 会同时将其用作元数据中心和配置中心。

```yaml
dubbo
 registry
  address: nacos://localhost:8848
```

框架解析后的默认行为

```yaml
dubbo
 registry
  address: nacos://localhost:8848
 config-center
  address: nacos://localhost:8848
 metadata-report
  address: nacos://localhost:8848
```

可以通过以下两个参数来调整或控制默认行为

```yaml
dubbo
 registry
  address: nacos://localhost:8848
  use-as-config-center: false
  use-as-metadata-report: false
```

## 注册中心生态
Dubbo 主干目前支持的主流注册中心实现包括
* Zookeeper
* Nacos
* Redis

同时也支持 Kubernetes、Mesh 体系的服务发现。

另外，[Dubbo 扩展生态](https://github.com/apache/dubbo-spi-extensions) 还提供了 Consul、Eureka、Etcd 等注册中心扩展实现。也欢迎通过 [registry spi 扩展](../../spi/) 贡献更多的注册中心实现到 Dubbo 生态。

Dubbo 还支持在一个应用中 [指定多个注册中心](../multiple-registry/)，并将服务根据注册中心分组，这样做使得服务分组管理或服务迁移变得更容易。



## 功能说明

Dubbo provider 中的服务配置项有接近 [30 个配置项](/zh-cn/docs/references/xml/dubbo-parameter)。 排除注册中心服务治理需要之外，很大一部分配置项是 provider 自己使用，不需要透传给消费者。这部分数据不需要进入注册中心，而只需要以 key-value 形式持久化存储。

Dubbo consumer 中的配置项也有 [20+个配置项](/zh-cn/docs/references/xml/dubbo-consumer)。在注册中心之中，服务消费者列表中只需要关注 application，version，group，ip，dubbo 版本等少量配置，其他配置也可以以 key-value 形式持久化存储。
这些数据是以服务为维度注册进入注册中心，导致了数据量的膨胀，进而引发注册中心 (如 zookeeper) 的网络开销增大，性能降低。

{{% alert title="设计目标和宗旨" color="primary" %}}

1. 期望简化进入注册中心的 provider 和 consumer 配置数量。
2. 期望将部分配置项以其他形式存储。这些配置项需要满足：不在服务调用链路上，同时这些配置项不在注册中心的核心链路上(服务查询，服务列表)。
{{% /alert %}}

> 注意：简化注册中心的配置，只在 2.7 之后的版本中进行支持。开启 provider 或者 consumer 简化配置之后，默认保留的配置项。

**provider**

| Constant Key  | Key           | remark |
| ------ |---------------| ------ |
| APPLICATION_KEY | application   |  |
| CODEC_KEY | codec         |  |
| EXCHANGER_KEY | exchanger     |   |
| SERIALIZATION_KEY | serialization |   |
| CLUSTER_KEY | cluster       |  |
| CONNECTIONS_KEY | connections   |   |
| DEPRECATED_KEY | deprecated    |  |
| GROUP_KEY | group         |   |
| LOADBALANCE_KEY | loadbalance   |  |
| MOCK_KEY | mock          |  |
| PATH_KEY | path          |  |
| TIMEOUT_KEY | timeout       |  |
| TOKEN_KEY | token         |  |
| VERSION_KEY | version       |  |
| WARMUP_KEY | warmup        |  |
| WEIGHT_KEY | weight        |  |
| DUBBO_VERSION_KEY | dubbo         |  |
| RELEASE_KEY | release       |  |
| SIDE_KEY | side          |  |


**consumer**

| Constant Key  | Key  | remark |
| ------ | ------ | ------ |
| APPLICATION_KEY | application |  |
| VERSION_KEY |  version |  |
| GROUP_KEY | group |  |
| DUBBO_VERSION_KEY | dubbo |  |

Constant Key 表示来自于类 org.apache.dubbo.common.Constants 的字段。

下面介绍几种常用的使用方式。所有的 sample，都可以查看 [sample-2.7](https://github.com/dubbo/dubbo-samples/tree/master)

## 使用场景

数据量大导致注册中心的网络开销增大，性能降低。

## 使用方式

**现有功能 sample** 当前现状一个简单展示。通过这个展示，分析下为什么需要做简化配置。

参考 sample 子工程： dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-nosimple （跑 sample 前，先跑下 ZKClean 进行配置项清理）

### dubbo-provider.xml

```
<dubbo:application name="simplified-registry-nosimple-provider"/>
<dubbo:registry address="zookeeper://127.0.0.1:2181"/>
<bean id="demoService" class="org.apache.dubbo.samples.simplified.registry.nosimple.impl.DemoServiceImpl"/>
<dubbo:service async="true" interface="org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService"
               version="1.2.3" group="dubbo-simple" ref="demoService"
               executes="4500" retries="7" owner="vict" timeout="5300"/>
```

启动 provider 的 main 方法之后，查看 zookeeper 的叶子节点（路径为：/dubbo/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService/providers 目录下）的内容

```
dubbo://30.5.124.158:20880/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
?anyhost=true
&application=simplified-registry-xml-provider
&async=true
&dubbo=2.0.2
&executes=4500
&generic=false
&group=dubbo-simple
&interface=org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
&methods=sayHello
&owner=vict
&pid=2767
&retries=7
&revision=1.2.3
&side=provider
&timeout=5300
&timestamp=1542361152795
&valid=true
&version=1.2.3
```

从中能看到有：`executes`, `retries`, `owner`, `timeout`。但是这些字段不是每个都需要传递给 dubbo ops 或者 dubbo consumer。 同样的，consumer 也有这个问题，可以在例子中启动 Consumer 的 main 方法进行查看。



### 1. dubbo.properties

sample 在 dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-xml 工程下 （跑 sample 前，先跑下ZKClean 进行配置项清理）

```properties
dubbo.registry.simplified=true
dubbo.registry.extra-keys=retries,owner
```
和上面的 **现有功能 sample** 进行对比，上面的 sample 中，executes, retries, owner, timeout 四个配置项都进入了注册中心。但是本实例不是，配置情况分为：

* 配置：dubbo.registry.simplified=true， 默认情况下，timeout 在默认的配置项列表，所以还是会进入注册中心；
* 配置：dubbo.registry.extra-keys=retries,owner ， 所以 retries，owner 也会进入注册中心。

### provider 端

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
得到的 zookeeper 的叶子节点的值
```
dubbo://30.5.124.149:20880/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
?application=simplified-registry-xml-provider
&dubbo=2.0.2
&group=dubbo-simple
&owner=vict
&retries=7
&timeout=5300
&timestamp=1542594503305
&version=1.2.3
```

### consumer 端
* 配置：dubbo.registry.simplified=true
* 默认情况：application,version,group,dubbo 在默认的配置项列表，所以还是会进入注册中心。
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
得到的 zookeeper 的叶子节点的值
```
consumer://30.5.124.149/org.apache.dubbo.samples.simplified.registry.nosimple.api.DemoService
?actives=6
&application=simplified-registry-xml-consumer
&category=consumers
&check=false
&dubbo=2.0.2
&group=dubbo-simple
&owner=vvv
&version=1.2.3
```

### 2.声明 spring bean

sample 在 dubbo-samples-simplified-registry/dubbo-samples-simplified-registry-annotation 工程下 （跑 sample 前，先跑下 ZKClean 进行配置项清理）

和上面 sample 中的 dubbo.properties 的效果是一致的。

* 默认情况：timeout 在默认的配置项列表，所以还是会进入注册中心；
* 配置： retries,owner 作为额外的 key 进入注册中心 ， 所以 retries，owner 也会进入注册中心。

### Provider 配置

#### privider 端 bean 配置
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
### Consumer 配置

和上面 sample 中 **consumer 端配置** 是一样的。

默认情况：  application,version,group,dubbo 在默认的配置项列表，所以还是会进入注册中心。

#### consumer 端 bean 配置
```java
@Bean
public RegistryConfig registryConfig() {
    RegistryConfig registryConfig = new RegistryConfig();
    registryConfig.setAddress("zookeeper://127.0.0.1:2181");
    registryConfig.setSimplified(true);
    return registryConfig;
  }
```

消费服务

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
> 注意: 如果一个应用中既有 provider 又有 consumer，那么配置需要合并成如下
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
> 提示：本版本还保留了大量的配置项，接下来的版本中，会逐渐删除所有的配置项。
