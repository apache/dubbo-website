---
aliases:
    - /zh/docsv2.7/user/references/metadata/
description: Dubbo 服务元数据参考手册
linkTitle: 元数据参考手册
title: 元数据参考手册
type: docs
weight: 5
---



## 背景

dubbo provider中的服务配置项有接近[30个配置项](/zh-cn/docsv2.7/user/references/xml/dubbo-provider/)。 排除注册中心服务治理需要之外，很大一部分配置项是provider自己使用，不需要透传给消费者。这部分数据不需要进入注册中心，而只需要以key-value形式持久化存储。
dubbo consumer中的配置项也有[20+个配置项](/zh-cn/docsv2.7/user/references/xml/dubbo-consumer/)。在注册中心之中，服务消费者列表中只需要关注application，version，group，ip，dubbo版本等少量配置，其他配置也可以以key-value形式持久化存储。
这些数据是以服务为维度注册进入注册中心，导致了数据量的膨胀，进而引发注册中心(如zookeeper)的网络开销增大，性能降低。  
除了上述配置项的存储之外，dubbo服务元数据信息也需要被存储下来。元数据信息包括服务接口，及接口的方法信息。这些信息将被用于服务mock，服务测试。



## 目标

需要将注册中心原来的数据信息和元数据信息保存到独立的key-value的存储中，这个key-value可以是DB，redis或者其他持久化存储。核心代码中支持了zookeeper，redis(推荐)的默认支持。

provider存储内容的格式，参见：org.apache.dubbo.metadata.definition.model.FullServiceDefinition。是该类型gson化之后的存储。
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
dubbo.metadata-report.username=xxx        ##非必须
dubbo.metadata-report.password=xxx        ##非必须
dubbo.metadata-report.retry-times=30       ##非必须,default值100
dubbo.metadata-report.retry-period=5000    ##非必须,default值3000
dubbo.metadata-report.cycle-report=false   ##非必须,default值true
```
> 如果元数据地址(dubbo.metadata-report.address)也不进行配置，整个元数据的写入不会生效，但是不影响程序运行。


接下来看几个sample的配置。无论哪种配置方式，都需要引入maven依赖：

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metadata-report-zookeeper</artifactId>
</dependency>
```
如果需要使用redis，可以引入对应的redis的依赖：

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metadata-report-redis</artifactId>
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