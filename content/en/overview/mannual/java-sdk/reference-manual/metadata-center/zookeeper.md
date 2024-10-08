---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/metadata-center/zookeeper/
    - /en/docs3-v2/java-sdk/reference-manual/metadata-center/zookeeper/
    - /en/overview/what/ecosystem/metadata-center/zookeeper/
description: Basic usage and working principle of Zookeeper metadata center
linkTitle: Zookeeper
title: Zookeeper
type: docs
weight: 3
---


## 1 Preparation
- Understand [Dubbo Basic Development Steps](/en/overview/mannual/java-sdk/quick-start/spring-boot/)
- Install and start [Zookeeper](/en/overview/reference/integrations/zookeeper/)

## 2 Instructions

### 2.1 Adding Maven Dependency
If the project has already enabled Zookeeper as the registry center, no additional configuration is needed.

If Zookeeper is not used as the registry center, please refer to [Add Zookeeper-related dependencies for the registry center](/en/overview/mannual/java-sdk/reference-manual/registry/zookeeper/#11-add-maven-dependency).

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

For the format of `address`, please refer to [zookeeper register center - Enable Configuration](../../registry/zookeeper/#22-configure-and-enable-zookeeper)

## 3 Advanced Configuration

For complete configuration parameters, please refer to [metadata-report-config](/en/overview/mannual/java-sdk/reference-manual/config/properties/#dubbometadata-report).

## 4 Working Principle

### 4.1 [Service Operation Metadata](../overview/#2-service-operation-metadata)

Zookeeper stores data based on a tree structure, and its metadata information is located at the following nodes:
```text
Provider: /dubbo/metadata/{interface name}/{version}/{group}/provider/{application name}
Consumer: /dubbo/metadata/{interface name}/{version}/{group}/consumer/{application name}
```

When version or group does not exist, the version path and group path will be removed, paths are as follows:
```text
Provider: /dubbo/metadata/{interface name}/provider/{application name}
Consumer: /dubbo/metadata/{interface name}/consumer/{application name}
```

Use zkCli get command to view data.

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

### 4.2 [Address Discovery - Interface-Application Name Mapping](../overview/#11-interface---application-mapping-relationship)
In Dubbo 3.0, the service introspection mechanism is used by default to achieve service discovery. For service introspection, you can refer to [Service Introspection](https://mercyblitz.github.io/2020/05/11/Apache-Dubbo-%E6%9C%8D%E5%8A%A1%E8%87%AA%E7%9C%81%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1/)

In short, the service introspection mechanism needs to find the corresponding application name through the interface name. This relationship can be one-to-many, meaning a service name may correspond to multiple different application names. In 3.0, the metadata center provides this mapping capability.

##### Zookeeper
As mentioned above, service name and application name may be one-to-many. In Zookeeper, a single key-value pair is used for storage, with multiple application names separated by commas `,`. Since it is a single key-value for data storage, there may be concurrent overwrite issues in a multi-client scenario. Therefore, we use Zookeeper's version mechanism to address this issue. In Zookeeper, each modification to data increases the dataVersion, allowing the use of the version mechanism to resolve concurrent issues during updates by multiple clients. Different clients check the version before updating, treating it as a local credential. During the update, the version credential is sent to the server for comparison. If they do not match, it indicates modification by another client, and the credential should be re-obtained for retry (CAS). Currently, if 6 retries fail, the update mapping action is abandoned.

Curator api.
```java
CuratorFramework client = ...
client.setData().withVersion(ticket).forPath(path, dataBytes);
```

Mapping information is located at:
```text
/dubbo/mapping/{service name}
```

Use zkCli get command to view data.

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

### 4.3 [Address Discovery - Interface Configuration Metadata](../overview/#12-interface-configuration-metadata)

To enable remote interface configuration metadata registration, the following configuration must be added to the application, as by default Dubbo3 application-level service discovery will enable service introspection mode and will not register data to the metadata center.

```properties
 dubbo.application.metadata-type=remote
 ```

Or to enable centralized metadata registration while in introspection mode

```properties
dubbo.application.metadata-type=local
dubbo.metadata-report.report-metadata=true
```

The application-level metadata in Zookeeper is located at /dubbo/metadata/{application name}/{revision}

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

