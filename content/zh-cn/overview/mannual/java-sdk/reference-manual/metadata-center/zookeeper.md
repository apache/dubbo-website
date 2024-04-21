---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/metadata-center/zookeeper/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/metadata-center/zookeeper/
    - /zh-cn/overview/what/ecosystem/metadata-center/zookeeper/
description: Zookeeper 元数据中心基本使用与工作原理
linkTitle: Zookeeper
title: Zookeeper
type: docs
weight: 3
---


## 1 预备工作
- 了解 [Dubbo 基本开发步骤](/zh-cn/overview/mannual/java-sdk/quick-start/spring-boot/)
- 安装并启动 [Zookeeper](https://zookeeper.apache.org/)

## 2 使用说明

### 2.1 增加 Maven 依赖
如果项目已经启用 Zookeeper 作为注册中心，则无需增加任何额外配置。

如果未使用 Zookeeper 注册中心，则请参考 [为注册中心增加 Zookeeper 相关依赖](../../registry/zookeeper/#21-增加-maven-依赖)。

### 2.2 启用 Zookeeper 配置中心
```xml
<dubbo:metadata-report address="zookeeper://127.0.0.1:2181"/>
```

或者

```yaml
dubbo
  metadata-report
    address: zookeeper://127.0.0.1:2181
```

或者

```properties
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181
```

或者

```java
MetadataReportConfig metadataConfig = new MetadataReportConfig();
metadataConfig.setAddress("zookeeper://127.0.0.1:2181");
```

`address` 格式请参考 [zookeeper 注册中心 - 启用配置](../../registry/zookeeper/#22-配置并启用-zookeeper)

## 3 高级配置

完整配置参数请参考 [metadata-report-config](../../config/properties/#metadata-report-config)。

## 4 工作原理

### 4.1 [服务运维元数据](../overview/#2-服务运维元数据)

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

### 4.2 [地址发现 - 接口-应用名映射](../overview/#11-接口---应用映射关系)
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

### 4.3 [地址发现 - 接口配置元数据](../overview/#12-接口配置元数据)

要开启远程接口配置元数据注册，需在应用中增加以下配置，因为默认情况下 Dubbo3 应用级服务发现会启用服务自省模式，并不会注册数据到元数据中心。

```properties
 dubbo.application.metadata-type=remote
 ```

或者，在自省模式下仍开启中心化元数据注册

```properties
dubbo.application.metadata-type=local
dubbo.metadata-report.report-metadata=true
```

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