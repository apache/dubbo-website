---
type: docs
title: "Nacos"
linkTitle: "Nacos"
weight: 2
description: "Basic use and working principle of Nacos metadata center"
---

## 1 Preparations
- Understand [Dubbo basic development steps](/en/docs3-v2/java-sdk/quick-start/spring-boot/)
- Refer to [Nacos Quick Start](https://nacos.io/zh-cn/docs/quick-start.html) to start the Nacos server

> When Dubbo uses `3.0.0` and above, it needs to use Nacos `2.0.0` and above

## 2 Instructions for use
The operation steps for Dubbo to integrate Nacos into a metadata center are very simple, roughly divided into two steps: `adding Maven dependencies` and `configuring the metadata center`.
> If the metadata address (dubbo.metadata-report.address) is not configured, the address of the registration center will be used as the metadata center.

### 2.1 Add Maven dependency
If the project has enabled Nacos as the registration center, no additional configuration is required.

If the Nacos registry is not enabled, please refer to [Adding Nacos dependencies to the registry](../../registry/nacos/#21-Add dependencies).

### 2.2 Enable Nacos Configuration Center
```xml
<dubbo:metadata-report address="nacos://127.0.0.1:8848"/>
```

or

```yaml
dubbo
  metadata-report
    address: nacos://127.0.0.1:8848
```

or

```properties
dubbo.metadata-report.address=nacos://127.0.0.1:8848
```

or

```java
MetadataReportConfig metadataConfig = new MetadataReportConfig();
metadataConfig.setAddress("nacos://127.0.0.1:8848");
```

For `address` format, please refer to [Nacos Registry - Enable Configuration](../../registry/nacos/#22-configure and enable-nacos)

## 3 Advanced configuration

For complete configuration parameters, please refer to [metadata-report-config](../../config/properties/#metadata-report-config).

## 4 How it works

### 4.1 [Service Operation and Maintenance Metadata](../overview/#2-Service Operation and Maintenance Metadata)

On the Nacos console, you can see the metadata information related to the service operation and maintenance registered by the service provider and consumer:

![image-dubbo-metadata-nacos-1.png](/imgs/blog/dubbo-metadata-nacos-1.png)

In Nacos, the concept of configuration center itself exists, which happens to be used for metadata storage. In the scenario of the configuration center, there is a concept of namespace - namespace, and under the namespace, there is also the concept of group. That is, locate a configuration item through namespace, group, and dataId. If no namespace is specified, ```public``` is used as the default namespace by default.

```properties
Provider: namespace: 'public', dataId: '{service name}:{version}:{group}:provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:{version}:{group}:consumer:{application name}', group: 'dubbo'
```
`:` remains when version or group does not exist:
```properties
Provider: namespace: 'public', dataId: '{service name}:::provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:::consumer:{application name}', group: 'dubbo'
```

Providers interface metadata details (use `report-definition=true` to control whether this part of data needs to be reported):

![image-dubbo-metadata-nacos-3.png](/imgs/blog/dubbo-metadata-nacos-3.png)

Consumers interface meta information details (whether reporting is controlled by `report-consumer-definition=true`, the default is false):

![image-dubbo-metadata-nacos-4.png](/imgs/blog/dubbo-metadata-nacos-4.png)

### 4.2 [Address Discovery - Interface-Application Mapping](../overview//#11-Interface---Application Mapping Relationship)
As mentioned above, service name and application name may be one-to-many. In nacos, a single key-value is used for storage, and multiple application names are separated by English commas `,`. Since a single key-value is used to save data, there may be a problem of concurrent coverage in the case of multiple clients. Therefore, we use the ability of publishConfigCas in nacos to solve this problem. In nacos, using publishConfigCas will allow the user to pass a parameter casMd5, which means the md5 value of the previous configuration content. Before updating, different clients first check the content value of nacos, calculate the md5 value, and use it as a local certificate. When updating, pass the md5 of the credential to the server to compare the md5 value. If it is inconsistent, it means that it has been modified by other clients during this period. Re-obtain the credential and try again (CAS). At present, if the 6 retries fail, the update mapping behavior is abandoned.

Nacos api:
```java
ConfigService configService = ...
configService.publishConfigCas(key, group, content, ticket);
```

The mapping information is located in namespace: 'public', dataId: '{service name}', group: 'mapping'.

![nacos-metadata-report-service-name-mapping.png](/imgs/user/nacos-metadata-report-service-name-mapping.png)

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

The details of metadata information in Nacos server are as follows:

![image-dubbo-metadata-nacos-2.png](/imgs/blog/dubbo-metadata-nacos-2.png)