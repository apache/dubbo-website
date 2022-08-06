---
type: docs
title: "Metadata Reference"
linkTitle: "Metadata"
weight: 5
description: "References documentation for dubbo metadata"
---

## Background
There are close to [30 configurations](/en/docs/v2.7/user/references/xml/dubbo-service/) in dubbo provider. Excluding registry center governance requirements, a large part of configurations are used by the provider itself and do not need to be delivered to the consumer. This part of the data does not need to be written to the registry, but only needs to be persisted as key-value.
There are also [20+ configurations](/en/docs/v2.7/user/references/xml/dubbo-reference/) in dubbo consumer. In the registry center, only a few configurations such as application, version, group, ip, dubbo version are needed in the list of service consumers. Other configurations can also be persisted in key-value form.
This data is registered into the registry in the service dimension, which leads to the expansion of data volume, and then causes the increased network overhead of the registry (such as zookeeper) and decreased performance.
  
In addition to the storage of the above configuration items, Dubbo service metadata information also needs to be stored. Metadata information includes service interface and method information of interface. This information will be used for service mock, service test.  

## Goal

The original data and metadata information in the registry center need to be stored in a separate key-value store, which can be DB, redis or other persistent storage. The core code supports zookeeper, redis(recommended) by default.

The format of provider storage content is the storage after gson's serialization of org.apache.dubbo.metadata.definition.model.FullServiceDefinition.
Consumer gets parameter information from the URL that it wrote to the registry and stores it in Map. That is, get the Map with URL.getParameterMap() and store it after gson's serialization.

For more details, you can refer to the sample below.

## Configuration

The default metadata storage supports the following additional features:  
* Failed retry
* Refresh regularly

#### Failed retry
Failed retries can be configured by retrytimes (retry times, default 100), retryperiod (retry cycle, default 3000ms).  

#### Refresh regularly
It's opening by default and can be turned off by setting cycleReport=false.  

#### Complete configurations:

```properties
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181
dubbo.metadata-report.username=xxx        ##Not necessary
dubbo.metadata-report.password=xxx        ##Not necessary
dubbo.metadata-report.retry-times=30       ##Not necessary,default 100
dubbo.metadata-report.retry-period=5000    ##Not necessary,default 3000
dubbo.metadata-report.cycle-report=false   ##Not necessary,default true
```
> If the metadata address (dubbo.metadata-report.address) is not configured, the writing of the entire metadata will not take effect, but it will not affect the running of the program.


Let's look at a few sample configurations. Regardless of the configuration, some maven dependencies need to be introduced:  

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metadata-report-zookeeper</artifactId>
</dependency>
```
If redis is needed, the corresponding redis dependencies can be introduced:  

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-metadata-report-redis</artifactId>
</dependency>
```
> **Complete sample，refer to[sample-2.7](https://github.com/dubbo/dubbo-samples/tree/master)**

### Method 1: Config in Configcenter

Refer to the sample: dubbo-samples-metadata-report/dubbo-samples-metadata-report-configcenter.

##### Configcenter Configuration

Configurations of Configcenter，can refer to the document of Configcenter. As follows:  

```properties
dubbo.registry.address=zookeeper://127.0.0.1:2181
### Notice the hump style
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181 ###Address of metadata storage
```
In the sample, Zookeeper is used as the Configcenter. Run directly: org.Apache.Dubbo.Samples.Metadatareport.Configcenter.ZKTools after starting a local zookeeper service, then writing finished.
You can also use Nacos, Apollo as the Configcenter. These products themselves support ops configuration.

##### Application Configuration

```properties
###dubbo.properties
dubbo.config-center.address=zookeeper://127.0.0.1:2181
... 
```

After completing the above two steps, the registry address and metadata address are retrieved from the Configcenter. You can now run the Provider and the Consumer in turn and get the corresponding output in console or view it directly through the client of zookeeper.

##### Provider Configuration

The metadata stored on the Provider side is as follows:

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
The Provider side stores all the parameters that the Provider service fills in to the registry, as well as the method information of the service (method name, input and output format).

##### Consumer Configuration

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

The Consumer side stores all the parameters that the Consumer fills in to the registry.



The above example is mainly a presentation of the provider side service information and consumer side service information stored in the metadata area by placing the metadata address in the Configcenter.
The next two examples focus on configuring in a project: the XML mode and the annotation mode .

### Method 2: Config project in properties way

Refer to the sample: dubbo-samples-metadata-report/dubbo-samples-metadata-report-local-xml.

##### dubbo.properties

```properties
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181
```

After setting this configuration, have not to focus on others. You can also view the service information of the corresponding provider and consumer directly.

##### Provider stores:

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

##### Consumer stores:

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



### Method 3: Config project in annotation way

Refer to the sample: dubbo-samples-metadata-report/dubbo-samples-metadata-report-local-annotaion.

##### @Bean introduce Bean

```java
@Bean
public MetadataReportConfig metadataReportConfig() {
    MetadataReportConfig metadataReportConfig = new MetadataReportConfig();
    metadataReportConfig.setAddress("zookeeper://127.0.0.1:2181");
    return metadataReportConfig;
}

```
After introducing Bean, also have not to set others. View corresponding service information directly: 

##### Provider stores: 

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

##### Consumer stores: 

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

## Extension
### SPI Definition

Refer to: org.apache.dubbo.metadata.store.MetadataReportFactory, org.apache.dubbo.metadata.store.MetadataReport

```java
@SPI("redis")
public interface MetadataReportFactory {
    @Adaptive({"protocol"})
    MetadataReport getMetadataReport(URL url);
}
```



### Custom metadata storage

Let's take Redis storage as an example to illustrate.

Create a new project supporting the following modifications:

#### Extend AbstractMetadataReport

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

#### Extend AbstractMetadataReportFactory

```java
public class RedisMetadataReportFactory extends AbstractMetadataReportFactory {
    @Override
    public MetadataReport createMetadataReport(URL url) {
        return new RedisMetadataReport(url);
    }
}
```

#### New META-INF/dubbo/internal/org.apache.dubbo.metadata.store.MetadataReportFactory

```properties
redis=org.apache.dubbo.metadata.store.redis.RedisMetadataReportFactory
```

As long as the above modifications along with the project are packaged into a jar, then config metadata center url: redis://10.20.153.10:6379.

Up to now, a custom metadata store is ready to run.
