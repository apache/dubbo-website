---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/metadata-center/overview/
    - /en/docs3-v2/java-sdk/reference-manual/metadata-center/overview/
description: Overview of the Metadata Center
linkTitle: Overview of the Metadata Center
title: Overview of the Metadata Center
type: docs
weight: 1
---


The Metadata Center provides access to two types of metadata in Dubbo:
- 1. Address discovery metadata, used for application-level service discovery.
- 2. Service operation and maintenance metadata, used for peripheral operation and maintenance systems such as visualization consoles for service queries, testing, etc.

## 1 Address Discovery Metadata
Dubbo3 introduces the [application-level service discovery mechanism](/en/overview/core-features/service-discovery/) to address performance issues in heterogeneous microservice systems and large-scale cluster practices. Application-level service discovery will fully replace the interface-level service discovery of version 2.x. To maintain Dubbo's usability oriented towards services/interfaces and flexibility in service governance, Dubbo has built a metadata mechanism around application-level service discovery, specifically `interface-application mapping relations` and `interface configuration metadata`.

### 1.1 Interface-Application Mapping Relation
Dubbo has always been capable of precise address discovery, subscribing only to the list of services and addresses declared by the Consumer. Achieving precise address subscription in the application-level service discovery model is not easy, as the Dubbo Consumer only declares the list of interfaces to consume. Therefore, the Consumer needs to convert the interface into the Provider's application name for accurate service subscription.

For this, Dubbo must maintain this mapping of `interface name -> application name` in the metadata center, reported actively by the provider during startup in Dubbo3.
The mapping relation of interfaces (service names) to applications (Provider application names) can be one-to-many, where one service name may correspond to multiple application names.

Taking Zookeeper as an example, the mapping is stored in the following location:

```shell
$ ./zkCli.sh
$ get /dubbo/mapping/org.apache.dubbo.demo.DemoService
$ demo-provider,two-demo-provider,dubbo-demo-annotation-provider
```

*① The node path is `/dubbo/mapping/{interface name}`*

*② Multiple application names are separated by a comma `,`*

### 1.2 Interface Configuration Metadata

`Interface-level configuration metadata` supplements address discovery. Unlike address discovery models like Spring Cloud, which can only sync IP and port information, Dubbo's service discovery mechanism can sync interface lists, interface definitions, and interface-level parameter configurations.
This part of the content is calculated based on the application's current information and interface information. Moreover, from a performance perspective, it generates metadata revisions for metadata aggregation across different machine instances.

> Metadata reporting can be disabled by setting `dubbo.metadata-report.report-metadata=false`.

Using Zookeeper as an example, the interface configuration metadata is stored in the following location. If multiple instances generate the same revision, they will eventually share the same metadata configuration:

`/dubbo/metadata/{application name}/{revision}`

```bash
[zk: localhost:2181(CONNECTED) 33] get /dubbo/metadata/demo-provider/da3be833baa2088c5f6776fb7ab1a436
```

```json
{
    "app":"demo-provider",
    "revision":"da3be833baa2088c5f6776fb7ab1a436",
    "services":{
        "org.apache.dubbo.demo.DemoService:dubbo":{
            "name":"org.apache.dubbo.demo.DemoService",
            "protocol":"dubbo",
            "path":"org.apache.dubbo.demo.DemoService",
            "params":{
                "side":"provider",
                "release":"",
                "methods":"sayHello,sayHelloAsync",
                "deprecated":"false",
                "dubbo":"2.0.2",
                "pid":"38298",
                "interface":"org.apache.dubbo.demo.DemoService",
                "service-name-mapping":"true",
                "timeout":"3000",
                "generic":"false",
                "metadata-type":"remote",
                "delay":"5000",
                "application":"demo-provider",
                "dynamic":"true",
                "REGISTRY_CLUSTER":"registry1",
                "anyhost":"true",
                "timestamp":"1626887121829"
            }
        },
        "org.apache.dubbo.demo.RestDemoService:1.0.0:rest":{
            "name":"org.apache.dubbo.demo.RestDemoService",
            "version":"1.0.0",
            "protocol":"rest",
            "path":"org.apache.dubbo.demo.RestDemoService",
            "params":{
                "side":"provider",
                "release":"",
                "methods":"getRemoteApplicationName,sayHello,hello,error",
                "deprecated":"false",
                "dubbo":"2.0.2",
                "pid":"38298",
                "interface":"org.apache.dubbo.demo.RestDemoService",
                "service-name-mapping":"true",
                "version":"1.0.0",
                "timeout":"5000",
                "generic":"false",
                "revision":"1.0.0",
                "metadata-type":"remote",
                "delay":"5000",
                "application":"demo-provider",
                "dynamic":"true",
                "REGISTRY_CLUSTER":"registry1",
                "anyhost":"true",
                "timestamp":"1626887120943"
            }
        }
    }
}
```

## 2 Service Operation and Maintenance Metadata

The service operation and maintenance metadata reported by Dubbo is typically used by various operation and maintenance systems, such as service testing, gateway data mapping, and service static dependency analysis.

Various third-party systems can directly read and use this part of the data; specific integration methods can refer to the several third-party systems mentioned in this chapter.

> Metadata reporting can be disabled by setting `dubbo.metadata-report.report-definition=false`.

### 2.1 Metadata Reported by Providers
The metadata content stored on the provider side is as follows:

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

*① `parameters` are details of service configuration and parameters.*

*② `types` contains service definition information.*

##### Metadata Reported by Consumers:

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

*Configuration metadata used when the Consumer process subscribes.*

## 3 Metadata Reporting Work Mechanism

Metadata reporting is an asynchronous process by default. To better control asynchronous behavior, the metadata reporting component (metadata-report) exposes two configuration items:
* Failure retry
* Daily scheduled retry refresh

### 3.1 retrytimes Failure Retry
Failure retry can be set through retrytimes (number of retries, default 100) and retryperiod (retry period, default 3000ms).

### 3.2 Scheduled Refresh
Enabled by default, can be disabled by setting cycleReport=false.

### 3.3 Complete Configuration Items

```properties
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181
dubbo.metadata-report.username=xxx         ## optional
dubbo.metadata-report.password=xxx         ## optional
dubbo.metadata-report.retry-times=30       ## optional, default is 100
dubbo.metadata-report.retry-period=5000    ## optional, default is 3000
dubbo.metadata-report.cycle-report=false   ## optional, default is true
dubbo.metadata-report.sync.report=false    ## optional, default is false
```
> If the metadata address (dubbo.metadata-report.address) is not configured, it will judge whether the protocol of the registry center supports the metadata center. If supported, it will use the registry center's address as the metadata center.

Please refer to [metadata-report](../../spi/description/metadata-report/) for details on how to extend custom third-party implementations.

