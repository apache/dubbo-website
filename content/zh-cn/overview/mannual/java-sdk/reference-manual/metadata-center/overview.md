---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/metadata-center/overview/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/metadata-center/overview/
description: 元数据中心概述
linkTitle: 元数据中心概述
title: 元数据中心概述
type: docs
weight: 1
---






元数据中心为 Dubbo 中的两类元数据提供了存取能力
- 1 地址发现元数据
- 2 服务运维元数据

## 1 地址发现元数据
Dubbo3 中引入了 [应用级服务发现机制](/zh-cn/overview/core-features/service-discovery/#面向百万实例集群的服务发现机制) 用来解决异构微服务体系互通与大规模集群实践的性能问题，应用级服务发现将全面取代 2.x 时代的接口级服务发现。
同时为了保持 Dubbo 面向服务/接口的易用性、服务治理的灵活性，Dubbo 围绕应用级服务发现构建了一套元数据机制，即 `接口 - 应用映射关系` 与 `接口配置元数据`。

### 1.1 接口 - 应用映射关系
Dubbo 一直以来都能做到精确的地址发现，即只订阅 Consumer 声明要关心的服务及相关的地址列表，相比于拉取/订阅全量地址列表，这样做有很好的性能优势。
在应用级服务发现模型中，想做到精确地址订阅并不容易，因为 Dubbo Consumer 只声明了要消费的接口列表，Consumer 需要能够将接口转换为 Provider 应用名才能进行精准服务订阅，

为此，Dubbo 需要在元数据中心维护这一份 `接口名->应用名` 的对应关系，Dubbo3 中通过 provider 启动的时候主动向元数据中心上报实现。
接口 (service name) - 应用 (Provider application name) 的映射关系可以是一对多的，即一个 service name 可能会对应多个不同的 application name。

以 zookeeper 为例，映射关系保存在以下位置:

```shell
$ ./zkCli.sh
$ get /dubbo/mapping/org.apache.dubbo.demo.DemoService
$ demo-provider,two-demo-provider,dubbo-demo-annotation-provider
```

*① 节点路径是 `/dubbo/mapping/{interface name}`*

*② 多个应用名通过英文逗号 `,` 隔开*

### 1.2 接口配置元数据

`接口级配置元数据`是作为地址发现的补充，相比于 Spring Cloud 等地址发现模型只能同步 ip、port 信息，Dubbo 的服务发现机制可以同步接口列表、接口定义、接口级参数配置等信息。
这部分内容根据当前应用的自身信息、以及接口信息计算而来，并且从性能角度出发，还根据元数据生成 revision，以实现不同机器实例间的元数据聚合。

以 Zookeeper 为例，接口配置元数据保存在以下位置，如果多个实例生成的 revision 相同，则最终会共享同一份元数据配置：

`/dubbo/metadata/{application name}/{revision}`

```shell script
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

## 2 服务运维元数据

Dubbo 上报的服务运维元数据通常为各种运维系统所用，如服务测试、网关数据映射、服务静态依赖关系分析等。

各种第三方系统可直接读取并使用这部分数据，具体对接方式可参见本章提及的几个第三方系统。

### 2.1 Provider 上报的元数据
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

*① `parameters` 为服务配置与参数详情。*

*② `types` 为服务定义信息。*

##### Consumer 上报的元数据：

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

*Consumer 进程订阅时使用的配置元数据。*

## 3 元数据上报工作机制

元数据上报默认是一个异步的过程，为了更好的控制异步行为，元数据配置组件 (metadata-report) 开放了两个配置项：
* 失败重试
* 每天定时重试刷新

### 3.1 retrytimes 失败重试
失败重试可以通过 retrytimes （重试次数。默认 100），retryperiod（重试周期。默认 3000ms）进行设置。

### 3.2 定时刷新
默认开启，可以通过设置 cycleReport=false 进行关闭。

### 3.3 完整的配置项

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

请参见 [metadata-report](../../spi/description/metadata-report/) 了解如何扩展自定义第三方实现。
