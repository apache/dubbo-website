---
aliases:
    - /zh/docs/references/metadata/
description: Dubbo 服务元数据参考手册
linkTitle: 元数据参考手册
title: 元数据参考手册
type: docs
weight: 5
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/metadata-center/)。
{{% /pageinfo %}}

## 背景

dubbo provider中的服务配置项有接近[30个配置项](/zh-cn/docsv2.7/user/references/xml/dubbo-provider/)。 排除注册中心服务治理需要之外，很大一部分配置项是provider自己使用，不需要透传给消费者。这部分数据不需要进入注册中心，而只需要以key-value形式持久化存储。
dubbo consumer中的配置项也有[20+个配置项](/zh-cn/docsv2.7/user/references/xml/dubbo-consumer/)。在注册中心之中，服务消费者列表中只需要关注application，version，group，ip，dubbo版本等少量配置，其他配置也可以以key-value形式持久化存储。
这些数据是以服务为维度注册进入注册中心，导致了数据量的膨胀，进而引发注册中心(如zookeeper)的网络开销增大，性能降低。  
除了上述配置项的存储之外，dubbo服务元数据信息也需要被存储下来。元数据信息包括服务接口，及接口的方法信息。这些信息将被用于服务mock，服务测试。

以上的元数据都是基于接口级别。在3.0版本中，引入了应用元数据的概念，应用元数据描述的是整个应用的信息概览。并且引入了服务自省映射，用于应用级别的服务发现。


## 目标

需要将注册中心原来的数据信息和元数据信息保存到独立的key-value的存储中，这个key-value可以是DB，redis或者其他持久化存储。核心代码中支持了zookeeper，redis, nacos(推荐)的默认支持。
>因为是基于key-value存储，key不会改变，最新的value会将原来的value进行覆盖

Provider存储内容的格式，参见：org.apache.dubbo.metadata.definition.model.FullServiceDefinition。是该类型gson化之后的存储。
Consumer存储内容，为Map格式。从Consumer端注册到注册中心的URL中的获取参数信息。即通过URL.getParameterMap()获取到的Map，进行gson化之后进行存储。

详细的内容，可以参考下面的sample输出。



## 配置

默认的元数据存储，额外支持以下几个特性：
* 失败重试
* 每天定时重刷

#### 失败重试
失败重试可以通过retrytimes （重试次数,默认100），retryperiod（重试周期，默认3000ms）进行设置。 

#### 定时刷新
默认开启，可以通过设置cycleReport=false进行关闭。

#### 完整的配置项：

```properties
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181
dubbo.metadata-report.username=xxx         ##非必须
dubbo.metadata-report.password=xxx         ##非必须
dubbo.metadata-report.retry-times=30       ##非必须,default值100
dubbo.metadata-report.retry-period=5000    ##非必须,default值3000
dubbo.metadata-report.cycle-report=false   ##非必须,default值true
dubbo.metadata-report.sync.report=false    ##非必须,default值为false
```
> 如果元数据地址(dubbo.metadata-report.address)也不进行配置，会判断注册中心的协议是否支持元数据中心，如果支持，会使用注册中心的地址来用作元数据中心。


接下来看几个sample的配置。无论哪种配置方式，都需要引入maven依赖：

zookeeper:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metadata-report-zookeeper</artifactId>
</dependency>
```

redis:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metadata-report-redis</artifactId>
</dependency>
```

nacos:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metadata-report-nacos</artifactId>
</dependency>
```


> **完整的sample，查看[sample-2.7](https://github.com/dubbo/dubbo-samples/tree/master)**

### 方式一：在配置中心配置

参考sample：dubbo-samples-metadata-report/dubbo-samples-metadata-report-configcenter 工程。

##### 配置中心配置

配置中心的配置，可以参考configcenter的文档。配置的内容如下：

```properties
dubbo.registry.address=zookeeper://127.0.0.1:2181
### 注意驼峰式风格
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181 ###元数据存储的地址
```

在sample中，使用了Zookeeper作为配置中心。启动本地zookeeper服务之后，直接运行：org.apache.dubbo.samples.metadatareport.configcenter.ZKTools 就可以完成写入。
如果配置中心使用了nacos，apollo，这些产品本身支持ops配置。

##### 应用配置

```properties
###dubbo.properties
dubbo.config-center.address=zookeeper://127.0.0.1:2181
... 
```

完成上述两步之后，注册中心地址、元数据地址将从配置中心进行获取。现在可以依次运行Provider类和Consumer类，会在console中得到对应的输出或者直接通过zookeeper的cli查看。

##### Provider配置

provider端存储的元数据内容如下：

```json
{
 "parameters": {
  "side": "provider",
  "methods": "sayHello",
  "dubbo": "2.0.2",
  "threads": "100",
  "interface": "org.apache.dubbo.samples.metadatareport.configcenter.api.AnnotationService",
  "threadpool": "fixed",
  "version": "1.1.1",
  "generic": "false",
  "revision": "1.1.1",
  "valid": "true",
  "application": "metadatareport-configcenter-provider",
  "default.timeout": "5000",
  "group": "d-test",
  "anyhost": "true"
 },
 "canonicalName": "org.apache.dubbo.samples.metadatareport.configcenter.api.AnnotationService",
 "codeSource": "file:/Users/cvictory/workspace/work-mw/dubbo-samples/dubbo-samples-metadata-report/dubbo-samples-metadata-report-configcenter/target/classes/",
 "methods": [{
  "name": "sayHello",
  "parameterTypes": ["java.lang.String"],
  "returnType": "java.lang.String"
 }],
 "types": [{
  "type": "java.lang.String",
  "properties": {
   "value": {
    "type": "char[]"
   },
   "hash": {
    "type": "int"
   }
  }
 }, {
  "type": "int"
 }, {
  "type": "char"
 }]
}

```

provider存储的内容包括了provider服务往注册中心填写的全部参数，以及服务的方法信息（方法名，入参出参的格式）。

##### Consumer配置：

```json
{
 "valid": "true",
 "side": "consumer",
 "application": "metadatareport-configcenter-consumer",
 "methods": "sayHello",
 "default.timeout": "6666",
 "dubbo": "2.0.2",
 "interface": "org.apache.dubbo.samples.metadatareport.configcenter.api.AnnotationService",
 "version": "1.1.1",
 "revision": "1.1.1",
 "group": "d-test"
}
```

consumer端存储了consumer往注册中心填写的全部参数。



上面的例子，主要是将元数据地址放在配置中心，在元数据区存储下来的provider端服务信息和consumer端服务信息的展示。
接下来的两个例子，主要讲解在工程中配置：xml方式，annotation方式。

### 方式二：配置在项目中-properties方式引入配置

参考sample：dubbo-samples-metadata-report/dubbo-samples-metadata-report-local-properties工程。

##### dubbo.properties

```properties
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181
```

配置完成这个之后，其余的不用特别关注。也可以直接查看对应的provider和consumer端的服务信息。

##### provider存储的某个服务的内容：

```json
{
 "parameters": {
  "valid": "true",
  "async": "true",
  "side": "provider",
  "application": "metadatareport-local-xml-provider",
  "methods": "sayHello",
  "dubbo": "2.0.2",
  "interface": "org.apache.dubbo.samples.metadatareport.local.xml.api.DemoService",
  "generic": "false",
  "anyhost": "true"
 },
 "canonicalName": "org.apache.dubbo.samples.metadatareport.local.xml.api.DemoService",
 "codeSource": "file:/Users/cvictory/workspace/work-mw/dubbo-samples/dubbo-samples-metadata-report/dubbo-samples-metadata-report-local-xml/target/classes/",
 "methods": [{
  "name": "sayHello",
  "parameterTypes": ["java.lang.String"],
  "returnType": "java.lang.String"
 }],
 "types": [{
  "type": "int"
 }, {
  "type": "char"
 }, {
  "type": "java.lang.String",
  "properties": {
   "value": {
    "type": "char[]"
   },
   "hash": {
    "type": "int"
   }
  }
 }]
}

```

##### consumer端存储的内容：

```json
{
 "valid": "true",
 "side": "consumer",
 "application": "metadatareport-local-xml-consumer",
 "methods": "sayHello",
 "dubbo": "2.0.2",
 "interface": "org.apache.dubbo.samples.metadatareport.local.xml.api.DemoService"
}

```



### 方式三：配置在项目中-annotation方式引入配置

参考sample：dubbo-samples-metadata-report/dubbo-samples-metadata-report-local-annotaion工程。

##### @Bean 引入bean

```java
@Bean
public MetadataReportConfig metadataReportConfig() {
    MetadataReportConfig metadataReportConfig = new MetadataReportConfig();
    metadataReportConfig.setAddress("zookeeper://127.0.0.1:2181");
    return metadataReportConfig;
}

```
引入Bean之后，其余的地方也不需要特别配置。直接查看对应的服务信息：

##### provider存储的某个服务的内容：

```json
{
 "parameters": {
  "side": "provider",
  "methods": "sayHello",
  "dubbo": "2.0.2",
  "interface": "org.apache.dubbo.samples.metadatareport.local.annotation.api.AnnotationService",
  "version": "1.1.8",
  "generic": "false",
  "revision": "1.1.8",
  "valid": "true",
  "application": "metadatareport-local-annotaion-provider",
  "default.timeout": "1000",
  "group": "d-test",
  "anyhost": "true"
 },
 "canonicalName": "org.apache.dubbo.samples.metadatareport.local.annotation.api.AnnotationService",
 "codeSource": "file:/Users/cvictory/workspace/work-mw/dubbo-samples/dubbo-samples-metadata-report/dubbo-samples-metadata-report-local-annotaion/target/classes/",
 "methods": [{
  "name": "sayHello",
  "parameterTypes": ["java.lang.String"],
  "returnType": "java.lang.String"
 }],
 "types": [{
  "type": "int"
 }, {
  "type": "java.lang.String",
  "properties": {
   "value": {
    "type": "char[]"
   },
   "hash": {
    "type": "int"
   }
  }
 }, {
  "type": "char"
 }]
}
```

##### consumer端存储的内容：

```json
{
 "valid": "true",
 "side": "consumer",
 "application": "metadatareport-local-annotaion-consumer",
 "methods": "sayHello",
 "dubbo": "2.0.2",
 "interface": "org.apache.dubbo.samples.metadatareport.local.annotation.api.AnnotationService",
 "version": "1.1.8",
 "revision": "1.1.8",
 "group": "d-test"
}
```

## 扩展 
### SPI定义

参考：org.apache.dubbo.metadata.store.MetadataReportFactory ， org.apache.dubbo.metadata.store.MetadataReport

```java
@SPI("redis")
public interface MetadataReportFactory {
    @Adaptive({"protocol"})
    MetadataReport getMetadataReport(URL url);
}
```



### 自定义元数据的存储

下面以Redis存储为例进行说明。

新建一个project，需要支持以下修改：

#### 扩展AbstractMetadataReport

```java
public class RedisMetadataReport extends AbstractMetadataReport {
    private final static Logger logger = LoggerFactory.getLogger(RedisMetadataReport.class);
    final JedisPool pool;
	
    public RedisMetadataReport(URL url) {
        super(url);
        pool = new JedisPool(new JedisPoolConfig(), url.getHost(), url.getPort());
    }
    @Override
    protected void doStoreProviderMetadata(ProviderMetadataIdentifier providerMetadataIdentifier, String serviceDefinitions) {
        this.storeMetadata(providerMetadataIdentifier, serviceDefinitions);
    }
    @Override
    protected void doStoreConsumerMetadata(ConsumerMetadataIdentifier consumerMetadataIdentifier, String value) {
        this.storeMetadata(consumerMetadataIdentifier, value);
    }
    private void storeMetadata(MetadataIdentifier metadataIdentifier, String v) {
        try (Jedis jedis = pool.getResource()) {
            jedis.set(metadataIdentifier.getIdentifierKey() + META_DATA_SOTRE_TAG, v);
        } catch (Throwable e) {
            logger.error("Failed to put " + metadataIdentifier + " to redis " + v + ", cause: " + e.getMessage(), e);
            throw new RpcException("Failed to put " + metadataIdentifier + " to redis " + v + ", cause: " + e.getMessage(), e);
        }
    }
}
```

#### 扩展 AbstractMetadataReportFactory

```java
public class RedisMetadataReportFactory extends AbstractMetadataReportFactory {
    @Override
    public MetadataReport createMetadataReport(URL url) {
        return new RedisMetadataReport(url);
    }
}
```

#### 增加 MetadataReportFactory

> META-INF/dubbo/internal/org.apache.dubbo.metadata.store.MetadataReportFactory

```properties
redis=org.apache.dubbo.metadata.store.redis.RedisMetadataReportFactory
```

只要将上面的修改和project打包成jar包，然后配置元数据中心的url：redis://10.20.153.10:6379。

至此，一个自定义的元数据存储就可以运行了。


### 数据存储

#### 接口级别元数据

##### Zookeeper 

```xml
<dubbo:metadata-report address="zookeeper://127.0.0.1:2181"/>
```

Zookeeper 基于树形结构进行数据存储，它的元数据信息位于以下节点:
```text
Provider: /dubbo/metadata/{interface name}/{version}/{group}/provider/{application name} 
Consumer: /dubbo/metadata/{interface name}/{version}/{group}/consumer/{application name}
```

当 version 或者 group 不存在时，version 路径和 group 路径会取消，路径如下:
```text
Provider: /dubbo/metadata/{interface name}/provider/{application name} 
Consumer: /dubbo/metadata/{interface name}/consumer/{application name}
```

通过 zkCli get 操作查看数据.

Provider node:
```shell script
[zk: localhost:2181(CONNECTED) 8] get /dubbo/metadata/org.apache.dubbo.demo.DemoService/provider/demo-provider
{"parameters":{"side":"provider","interface":"org.apache.dubbo.demo.DemoService","metadata-type":"remote","application":"demo-provider","dubbo":"2.0.2","release":"","anyhost":"true","delay":"5000","methods":"sayHello,sayHelloAsync","deprecated":"false","dynamic":"true","timeout":"3000","generic":"false"},"canonicalName":"org.apache.dubbo.demo.DemoService","codeSource":"file:/Users/apple/IdeaProjects/dubbo/dubbo-demo/dubbo-demo-interface/target/classes/","methods":[{"name":"sayHelloAsync","parameterTypes":["java.lang.String"],"returnType":"java.util.concurrent.CompletableFuture"},{"name":"sayHello","parameterTypes":["java.lang.String"],"returnType":"java.lang.String"}],"types":[{"type":"java.util.concurrent.CompletableFuture","properties":{"result":"java.lang.Object","stack":"java.util.concurrent.CompletableFuture.Completion"}},{"type":"java.lang.Object"},{"type":"java.lang.String"},{"type":"java.util.concurrent.CompletableFuture.Completion","properties":{"next":"java.util.concurrent.CompletableFuture.Completion","status":"int"}},{"type":"int"}]}
cZxid = 0x25a9b1
ctime = Mon Jun 28 21:35:17 CST 2021
mZxid = 0x25a9b1
mtime = Mon Jun 28 21:35:17 CST 2021
pZxid = 0x25a9b1
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 1061
numChildren = 0
```

Consumer node:
```shell script
[zk: localhost:2181(CONNECTED) 10] get /dubbo/metadata/org.apache.dubbo.demo.DemoService/consumer/demo-consumer
{"side":"consumer","interface":"org.apache.dubbo.demo.DemoService","metadata-type":"remote","application":"demo-consumer","dubbo":"2.0.2","release":"","sticky":"false","check":"false","methods":"sayHello,sayHelloAsync"}
cZxid = 0x25aa24
ctime = Mon Jun 28 21:57:43 CST 2021
mZxid = 0x25aa24
mtime = Mon Jun 28 21:57:43 CST 2021
pZxid = 0x25aa24
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 219
numChildren = 0
```


##### Redis

```xml
<dubbo:metadata-report address="redis://127.0.0.1:6779"/>
```

在Redis中，使用string数据结构来进行存储元数据信息:
```text
Provider: {service name}:{version}:{group}:provider:{application name}
Consumer: {service name}:{version}:{group}:consumer:{application name}
```

当 version 或者 group 不存在时，`:` 依然保留:

```text
Provider: {service name}:::provider:{application name}
Consumer: {service name}:::consumer:{application name}
``` 

通过 Redis client get key 查看数据.

Provider key:
```shell script
127.0.0.1:6379> get org.apache.dubbo.demo.DemoService:::provider:demo-provider
"{\"parameters\":{\"side\":\"provider\",\"interface\":\"org.apache.dubbo.demo.DemoService\",\"metadata-type\":\"remote\",\"application\":\"demo-provider\",\"dubbo\":\"2.0.2\",\"release\":\"\",\"anyhost\":\"true\",\"delay\":\"5000\",\"methods\":\"sayHello,sayHelloAsync\",\"deprecated\":\"false\",\"dynamic\":\"true\",\"timeout\":\"3000\",\"generic\":\"false\"},\"canonicalName\":\"org.apache.dubbo.demo.DemoService\",\"codeSource\":\"file:/Users/apple/IdeaProjects/dubbo/dubbo-demo/dubbo-demo-interface/target/classes/\",\"methods\":[{\"name\":\"sayHello\",\"parameterTypes\":[\"java.lang.String\"],\"returnType\":\"java.lang.String\"},{\"name\":\"sayHelloAsync\",\"parameterTypes\":[\"java.lang.String\"],\"returnType\":\"java.util.concurrent.CompletableFuture\"}],\"types\":[{\"type\":\"java.util.concurrent.CompletableFuture\",\"properties\":{\"result\":\"java.lang.Object\",\"stack\":\"java.util.concurrent.CompletableFuture.Completion\"}},{\"type\":\"java.lang.Object\"},{\"type\":\"java.lang.String\"},{\"type\":\"java.util.concurrent.CompletableFuture.Completion\",\"properties\":{\"next\":\"java.util.concurrent.CompletableFuture.Completion\",\"status\":\"int\"}},{\"type\":\"int\"}]}"
```

Consumer key:
```shell script
127.0.0.1:6379> get org.apache.dubbo.demo.DemoService:::consumer:demo-consumer
"{\"side\":\"consumer\",\"interface\":\"org.apache.dubbo.demo.DemoService\",\"metadata-type\":\"remote\",\"application\":\"demo-consumer\",\"dubbo\":\"2.0.2\",\"release\":\"\",\"sticky\":\"false\",\"check\":\"false\",\"methods\":\"sayHello,sayHelloAsync\"}"
```

##### Nacos
```xml
<dubbo:metadata-report address="nacos://127.0.0.1:8848"/>
```

在 Nacos 中，本身就存在配置中心这个概念，正好用于元数据存储。在配置中心的场景下，存在命名空间- namespace 的概念，在 namespace 之下，还存在 group 概念。即通过 namespace 和 group 以及 dataId 去定位一个配置项，在不指定 namespace 的情况下，默认使用 `public` 作为默认的命名空间。

```text
Provider: namespace: 'public', dataId: '{service name}:{version}:{group}:provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:{version}:{group}:consumer:{application name}', group: 'dubbo'
```

当 version 或者 group 不存在时，`:` 依然保留:

```text
Provider: namespace: 'public', dataId: '{service name}:::provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:::consumer:{application name}', group: 'dubbo'
```

可以通过 Nacos 自带的 web console 界面进行查看.

Provider data:
![nacos-metadata-report-provider-metadata.png](/imgs/user/nacos-metadata-report-provider-metadata.png)

Consumer data:
![nacos-metadata-report-consumer-metadata.png](/imgs/user/nacos-metadata-report-consumer-metadata.png)


#### 应用级别元数据
应用级别元数据只有当一个应用定义服务之后，才会进行暴露。会根据当前应用的自身信息，以及接口信息，去计算出该应用的 revision 修订值，用于保存应用级别元数据，

##### Zookeeper
Zookeeper 的应用级别元数据位于 /dubbo/metadata/{application name}/{revision}

```shell script
[zk: localhost:2181(CONNECTED) 33] get /dubbo/metadata/demo-provider/da3be833baa2088c5f6776fb7ab1a436
{"app":"demo-provider","revision":"da3be833baa2088c5f6776fb7ab1a436","services":{"org.apache.dubbo.demo.DemoService:dubbo":{"name":"org.apache.dubbo.demo.DemoService","protocol":"dubbo","path":"org.apache.dubbo.demo.DemoService","params":{"side":"provider","release":"","methods":"sayHello,sayHelloAsync","deprecated":"false","dubbo":"2.0.2","pid":"38298","interface":"org.apache.dubbo.demo.DemoService","service-name-mapping":"true","timeout":"3000","generic":"false","metadata-type":"remote","delay":"5000","application":"demo-provider","dynamic":"true","REGISTRY_CLUSTER":"registry1","anyhost":"true","timestamp":"1626887121829"}},"org.apache.dubbo.demo.RestDemoService:1.0.0:rest":{"name":"org.apache.dubbo.demo.RestDemoService","version":"1.0.0","protocol":"rest","path":"org.apache.dubbo.demo.RestDemoService","params":{"side":"provider","release":"","methods":"getRemoteApplicationName,sayHello,hello,error","deprecated":"false","dubbo":"2.0.2","pid":"38298","interface":"org.apache.dubbo.demo.RestDemoService","service-name-mapping":"true","version":"1.0.0","timeout":"5000","generic":"false","revision":"1.0.0","metadata-type":"remote","delay":"5000","application":"demo-provider","dynamic":"true","REGISTRY_CLUSTER":"registry1","anyhost":"true","timestamp":"1626887120943"}}}}
cZxid = 0x25b336
ctime = Thu Jul 22 01:05:55 CST 2021
mZxid = 0x25b336
mtime = Thu Jul 22 01:05:55 CST 2021
pZxid = 0x25b336
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 1286
numChildren = 0
```

#### Redis
Redis 元数据中心目前还不支持应用级别元数据，但已提上日程，会在近期进行实现。

##### [Nacos](https://nacos.io/)
Nacos 应用级别的元数据位于 namespace: 'public', dataId: '{application name}', group: '{revision}'

![nacos-metadata-report-application-metadata.png](/imgs/user/nacos-metadata-report-application-metadata.png)


#### 服务自省映射 - Service Name Mapping
在Dubbo 3.0 中，默认使用了服务自省机制去实现服务发现，关于服务自省可以查看[服务自省](https://mercyblitz.github.io/2020/05/11/Apache-Dubbo-%E6%9C%8D%E5%8A%A1%E8%87%AA%E7%9C%81%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1/)

简而言之，服务自省机制需要能够通过 interface name 去找到对应的 application name，这个关系可以是一对多的，即一个 service name 可能会对应多个不同的 application name。在 3.0 中，元数据中心提供此项映射的能力。


##### Zookeeper
在上面提到，service name 和 application name 可能是一对多的，在 zookeeper 中，使用单个 key-value 进行保存，多个 application name 通过英文逗号`,`隔开。由于是单个 key-value 去保存数据，在多客户端的情况下可能会存在并发覆盖的问题。因此，我们使用 zookeeper 中的版本机制 version 去解决该问题。在 zookeeper 中，每一次对数据进行修改，dataVersion 都会进行增加，我们可以利用 version 这个机制去解决多个客户端同时更新映射的并发问题。不同客户端在更新之前，先去查一次 version，当作本地凭证。在更新时，把凭证 version 传到服务端比对 version, 如果不一致说明在此期间被其他客户端修改过，重新获取凭证再进行重试(CAS)。目前如果重试6次都失败的话，放弃本次更新映射行为。

Curator api.
```java
CuratorFramework client = ... 
client.setData().withVersion(ticket).forPath(path, dataBytes);
``` 

映射信息位于: 
```text
/dubbo/mapping/{service name}
``` 

通过 zkCli get 操作查看数据.

```shell script
[zk: localhost:2181(CONNECTED) 26] get /dubbo/mapping/org.apache.dubbo.demo.DemoService
demo-provider,two-demo-provider,dubbo-demo-annotation-provider
cZxid = 0x25a80f
ctime = Thu Jun 10 01:36:40 CST 2021
mZxid = 0x25a918
mtime = Fri Jun 11 18:46:40 CST 2021
pZxid = 0x25a80f
cversion = 0
dataVersion = 2
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 62
numChildren = 0
```


##### Redis
Redis 元数据中心目前还不支持服务自省映射，但已提上日程，会在近期进行实现。


##### Nacos
在上面提到，service name 和 application name 可能是一对多的，在 nacos 中，使用单个 key-value 进行保存，多个 application name 通过英文逗号`,`隔开。由于是单个 key-value 去保存数据，在多客户端的情况下可能会存在并发覆盖的问题。因此，我们使用 nacos 中 publishConfigCas 的能力去解决该问题。在 nacos 中，使用 publishConfigCas 会让用户传递一个参数 casMd5，该值的含义是之前配置内容的 md5 值。不同客户端在更新之前，先去查一次 nacos 的 content 的值，计算出 md5 值，当作本地凭证。在更新时，把凭证 md5 传到服务端比对 md5 值, 如果不一致说明在此期间被其他客户端修改过，重新获取凭证再进行重试(CAS)。目前如果重试6次都失败的话，放弃本次更新映射行为。

Nacos api:
```java
ConfigService configService = ...
configService.publishConfigCas(key, group, content, ticket);
```

映射信息位于 namespace: 'public', dataId: '{service name}', group: 'mapping'.

![nacos-metadata-report-service-name-mapping.png](/imgs/user/nacos-metadata-report-service-name-mapping.png)
