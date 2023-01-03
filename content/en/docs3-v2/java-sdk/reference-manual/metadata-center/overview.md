---
type: docs
title: "Overview of Metadata Center"
linkTitle: "Overview of Metadata Center"
weight: 1
---

The metadata center provides access to two types of metadata in Dubbo:
- 1 address discovery metadata
  - 1.1 'Interface-Application' mapping relationship
  - 1.2 Interface configuration data
- 2 Service operation and maintenance metadata
  - 2.1 Interface definition description data
  - 2.2 Consumers subscribe to relational data

For how to configure and open the metadata center, please refer to the specific implementation document.

## 1 Address Discovery Metadata
[Application-level service discovery mechanism](/en/docs3-v2/java-sdk/concepts-and-architecture/service-discovery/#Application-level service discovery introduction) is introduced in Dubbo3 to solve the problem of heterogeneous microservice system interoperability and For performance issues in large-scale cluster practice, application-level service discovery will fully replace interface-level service discovery in the 2.x era.
At the same time, in order to maintain Dubbo's service/interface-oriented ease of use and flexibility of service governance, Dubbo has built a set of metadata mechanisms around application-level service discovery, namely `interface-application mapping relationship` and `interface configuration metadata`.

### 1.1 Interface - application mapping relationship
Dubbo has always been able to achieve precise address discovery, that is, only subscribe to the services and related address lists that the Consumer declares to care about. Compared with pulling/subscribing to the full address list, this has a good performance advantage.
In the application-level service discovery model, it is not easy to subscribe to precise addresses, because Dubbo Consumer only declares the list of interfaces to be consumed, and Consumers need to be able to convert interfaces into Provider application names to subscribe to precise services.

For this reason, Dubbo needs to maintain the corresponding relationship of `interface name->application name` in the metadata center, and Dubbo3 actively reports to the metadata center when it is started through the provider.
The mapping relationship between interface (service name) and application (Provider application name) can be one-to-many, that is, one service name may correspond to multiple different application names.

Taking zookeeper as an example, the mapping relationship is stored in the following locations:

```shell
$ ./zkCli.sh
$ get /dubbo/mapping/org.apache.dubbo.demo.DemoService
$ demo-provider, two-demo-provider, dubbo-demo-annotation-provider
```

1. The node path is `/dubbo/mapping/{interface name}`
2. Multiple application names are separated by English commas `,`

### 1.2 Interface Configuration Metadata

`Interface-level configuration metadata` is a supplement to address discovery. Compared with address discovery models such as Spring Cloud, which can only synchronize ip and port information, Dubbo's service discovery mechanism can synchronize information such as interface list, interface definition, and interface-level parameter configuration. .
This part of the content is calculated based on the current application's own information and interface information, and from a performance perspective, a revision is also generated based on metadata to achieve metadata aggregation between different machine instances.

Taking Zookeeper as an example, the interface configuration metadata is stored in the following locations. If multiple instances generate the same revision, they will eventually share the same metadata configuration:

/dubbo/metadata/{application name}/{revision}

```shell script
[zk: localhost:2181(CONNECTED) 33] get /dubbo/metadata/demo-provider/da3be833baa2088c5f6776fb7ab1a436
```

```json
{
    "app": "demo-provider",
    "revision": "da3be833baa2088c5f6776fb7ab1a436",
    "services": {
        "org.apache.dubbo.demo.DemoService:dubbo":{
            "name": "org.apache.dubbo.demo.DemoService",
            "protocol": "dubbo",
            "path": "org.apache.dubbo.demo.DemoService",
            "params": {
                "side": "provider",
                "release": "",
                "methods": "sayHello, sayHelloAsync",
                "deprecated": "false",
                "dubbo": "2.0.2",
                "pid": "38298",
                "interface": "org.apache.dubbo.demo.DemoService",
                "service-name-mapping": "true",
                "timeout": "3000",
                "generic": "false",
                "metadata-type": "remote",
                "delay": "5000",
                "application": "demo-provider",
                "dynamic": "true",
                "REGISTRY_CLUSTER": "registry1",
                "anyhost": "true",
                "timestamp":"1626887121829"
            }
        },
        "org.apache.dubbo.demo.RestDemoService:1.0.0:rest":{
            "name": "org.apache.dubbo.demo.RestDemoService",
            "version": "1.0.0",
            "protocol": "rest",
            "path": "org.apache.dubbo.demo.RestDemoService",
            "params": {
                "side": "provider",
                "release": "",
                "methods": "getRemoteApplicationName, sayHello, hello, error",
                "deprecated": "false",
                "dubbo": "2.0.2",
                "pid": "38298",
                "interface": "org.apache.dubbo.demo.RestDemoService",
                "service-name-mapping": "true",
                "version": "1.0.0",
                "timeout": "5000",
                "generic": "false",
                "revision": "1.0.0",
                "metadata-type": "remote",
                "delay": "5000",
                "application": "demo-provider",
                "dynamic": "true",
                "REGISTRY_CLUSTER": "registry1",
                "anyhost": "true",
                "timestamp": "1626887120943"
            }
        }
    }
}
```

## 2 Service operation and maintenance metadata

The service operation and maintenance metadata reported by Dubbo is usually used by various operation and maintenance systems, such as service testing, gateway data mapping, service static dependency analysis, etc. Various third-party systems can directly read and use this part of the data. For specific connection methods, please refer to the third-party systems mentioned in this chapter.

### 2.1 Metadata reported by Provider
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
  "parameterTypes": ["java. lang. String"],
  "returnType": "java.lang.String"
 }],
 "types": [{
  "type": "java. lang. String",
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

There are two main parts:
* `parameters` is the service configuration and parameter details.
* `types` defines information for the service.

##### Metadata reported by Consumer:

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

Configuration metadata used by the Consumer process when subscribing.

## 3 Metadata reporting mechanism

Metadata reporting is an asynchronous process by default. In order to better control the asynchronous behavior, the metadata configuration component (metadata-report) opens up two configuration items:
* Retry on failure
* Refresh regularly every day

### 3.1 retrytimes failed retry
Failure retries can be set through retrytimes (retry times, default 100), retryperiod (retry period, default 3000ms).

### 3.2 Timing Refresh
It is enabled by default and can be disabled by setting cycleReport=false.

### 3.3 Complete configuration items

```properties
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181
dubbo.metadata-report.username=xxx ##Not required
dubbo.metadata-report.password=xxx ##Not required
dubbo.metadata-report.retry-times=30 ##Non-required, default value 100
dubbo.metadata-report.retry-period=5000 ##Not required, default value is 3000
dubbo.metadata-report.cycle-report=false ##Not required, default value is true
dubbo.metadata-report.sync.report=false ##Not required, the default value is false
```
> If the metadata address (dubbo.metadata-report.address) is not configured, it will judge whether the protocol of the registration center supports the metadata center. If yes, the address of the registration center will be used as the metadata center.

## 4 Learn how to extend
See [Extending metadata-report](../../spi/description/metadata-report/) for how to extend custom third-party implementations.