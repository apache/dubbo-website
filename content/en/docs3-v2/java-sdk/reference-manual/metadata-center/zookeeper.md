---
type: docs
title: "Zookeeper"
linkTitle: "Zookeeper"
weight: 3
description: "Basic use and working principle of Zookeeper metadata center"
---

## 1 Preparations
- Understand [Dubbo basic development steps](/en/docs3-v2/java-sdk/quick-start/spring-boot/)
- Install and start [Zookeeper](https://zookeeper.apache.org/)

## 2 Instructions for use

### 2.1 Add Maven dependency
If the project has enabled Zookeeper as the registry, no additional configuration is required.

If the Zookeeper registry is not used, please refer to [Add Zookeeper-related dependencies for the registry](../../registry/zookeeper/#21-add-maven-dependency).

### 2.2 Enable Zookeeper Configuration Center
```xml
<dubbo:metadata-report address="zookeeper://127.0.0.1:2181"/>
```

or

```yaml
dubbo
  metadata-report
    address: zookeeper://127.0.0.1:2181
```

or

```properties
dubbo.metadata-report.address=zookeeper://127.0.0.1:2181
```

or

```java
MetadataReportConfig metadataConfig = new MetadataReportConfig();
metadataConfig.setAddress("zookeeper://127.0.0.1:2181");
```

For `address` format, please refer to [zookeeper registry - enable configuration](../../registry/zookeeper/#22-configure and enable-zookeeper)

## 3 Advanced configuration

For complete configuration parameters, please refer to [metadata-report-config](../../config/properties/#metadata-report-config).

## 4 How it works

### 4.1 [Service Operation and Maintenance Metadata](../overview/#2-Service Operation and Maintenance Metadata)

Zookeeper stores data based on a tree structure, and its metadata information is located in the following nodes:
```text
Provider: /dubbo/metadata/{interface name}/{version}/{group}/provider/{application name}
Consumer: /dubbo/metadata/{interface name}/{version}/{group}/consumer/{application name}
```

When the version or group does not exist, the version path and group path will be canceled, the paths are as follows:
```text
Provider: /dubbo/metadata/{interface name}/provider/{application name}
Consumer: /dubbo/metadata/{interface name}/consumer/{application name}
```

View data via the zkCli get operation.

Provider node:
```shell script
[zk: localhost:2181(CONNECTED) 8] get /dubbo/metadata/org.apache.dubbo.demo.DemoService/provider/demo-provider
{"parameters":{"side":"provider","interface":"org.apache.dubbo.demo.DemoService","metadata-type":"remote","application":"demo-provider", "dubbo":"2.0.2","release":"","anyhost":"true","delay":"5000","methods":"sayHello,sayHelloAsync","deprecated":"false" ,"dynamic":"true","timeout":"3000","generic":"false"},"canonicalName":"org.apache.dubbo.demo.DemoService","codeSource":"file:/ Users/apple/IdeaProjects/dubbo/dubbo-demo/dubbo-demo-interface/target/classes/","methods":[{"name":"sayHelloAsync","parameterTypes":["java.lang.String" ],"returnType":"java.util.concurrent.CompletableFuture"},{"name":"sayHello","parameterTypes":["java.lang.String"],"returnType":"java.lang.String "}],"types":[{"type":"java.util.concurrent.CompletableFuture","properties":{"result":"java.lang.Object","stack":"java.util. concurrent.CompletableFuture.Completion"}},{"type":"java.lang.Object"},{"type":"java.lang.String"},{"type":"java.util.concurrent.CompletableFuture .Completion","properties":{"next":"java.util.concurrent.Co mpletableFuture. Completion", "status": "int"}}, {"type": "int"}]}
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
{"side":"consumer","interface":"org.apache.dubbo.demo.DemoService","metadata-type":"remote","application":"demo-consumer","dubbo":" 2.0.2","release":"","sticky":"false","check":"false","methods":"sayHello,sayHelloAsync"}
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

### 4.2 [Address Discovery - Interface-Application Name Mapping](../overview/#11-Interface---Application Mapping Relationship)
In Dubbo 3.0, the service introspection mechanism is used by default to realize service discovery. For service introspection, please refer to [Service Introspection](https://mercyblitz.github.io/2020/05/11/Apache-Dubbo-%E6%9C%8D%E5%8A%A1%E8%87%AA%E7%9C%81%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1/)

In short, the service introspection mechanism needs to be able to find the corresponding application name through the interface name. This relationship can be one-to-many, that is, one service name may correspond to multiple different application names. In 3.0, the metadata center provides this mapping capability.


##### Zookeeper
As mentioned above, service name and application name may be one-to-many. In zookeeper, a single key-value is used for storage, and multiple application names are separated by English commas`,`. Since a single key-value is used to save data, there may be a problem of concurrent coverage in the case of multiple clients. Therefore, we use the version mechanism version in zookeeper to solve this problem. In zookeeper, every time the data is modified, the dataVersion will increase. We can use the version mechanism to solve the concurrent problem of multiple clients updating the mapping at the same time. Before updating, different clients check the version once and use it as a local certificate. When updating, pass the credential version to the server to compare the version. If it is inconsistent, it means that it has been modified by other clients during this period. Re-obtain the credential and try again (CAS). At present, if the 6 retries fail, the update mapping behavior is abandoned.

Curator api.
```java
CuratorFramework client = ...
client.setData().withVersion(ticket).forPath(path, dataBytes);
```

Mapping information is located at:
```text
/dubbo/mapping/{service name}
```

View data via the zkCli get operation.

```shell script
[zk: localhost:2181(CONNECTED) 26] get /dubbo/mapping/org.apache.dubbo.demo.DemoService
demo-provider, two-demo-provider, dubbo-demo-annotation-provider
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

### 4.3 [Address Discovery - Interface Configuration Metadata](../overview/#12-Interface Configuration Metadata)

To enable remote interface configuration metadata registration, the following configuration needs to be added to the application, because by default Dubbo3 application-level service discovery will enable service introspection mode and will not register data to the metadata center.

```properties
 dubbo.application.metadata-type=remote
 ```

Alternatively, still enable centralized metadata registration in introspection mode

```properties
dubbo.application.metadata-type=local
dubbo.metadata-report.report-metadata=true
```

Zookeeper's application level metadata is located at /dubbo/metadata/{application name}/{revision}

```shell script
[zk: localhost:2181(CONNECTED) 33] get /dubbo/metadata/demo-provider/da3be833baa2088c5f6776fb7ab1a436
{"app":"demo-provider","revision":"da3be833baa2088c5f6776fb7ab1a436","services":{"org.apache.dubbo.demo.DemoService:dubbo":{"name":"org.apache.dubbo. demo.DemoService","protocol":"dubbo","path":"org.apache.dubbo.demo.DemoService","params":{"side":"provider","release":""," methods":"sayHello,sayHelloAsync","deprecated":"false","dubbo":"2.0.2","pid":"38298","interface":"org.apache.dubbo.demo.DemoService" ,"service-name-mapping":"true","timeout":"3000","generic":"false","metadata-type":"remote","delay":"5000","application" :"demo-provider","dynamic":"true","REGISTRY_CLUSTER":"registry1","anyhost":"true","timestamp":"1626887121829"}},"org.apache.dubbo.demo. RestDemoService:1.0.0:rest":{"name":"org.apache.dubbo.demo.RestDemoService","version":"1.0.0","protocol":"rest","path":"org .apache.dubbo.demo.RestDemoService","params":{"side":"provider","release":"","methods":"getRemoteApplicationName,sayHello,hello,error","deprecated":"false ","dubbo":"2.0.2","pid":"38298","interface":"org.apache.dubbo.demo .RestDemoService","service-name-mapping":"true","version":"1.0.0","timeout":"5000","generic":"false","revision":"1.0.0 ","metadata-type":"remote","delay":"5000","application":"demo-provider","dynamic":"true","REGISTRY_CLUSTER":"registry1","anyhost": "true","timestamp":"1626887120943"}}}}
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