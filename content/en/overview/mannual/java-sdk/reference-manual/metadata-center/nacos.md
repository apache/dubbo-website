---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/metadata-center/nacos/
    - /en/docs3-v2/java-sdk/reference-manual/metadata-center/nacos/
    - /en/overview/what/ecosystem/metadata-center/nacos/
description: Basic usage and working principle of Nacos metadata center
linkTitle: Nacos
title: Nacos
type: docs
weight: 2
---

## 1 Preparations
- Understand [Dubbo basic development steps](/en/overview/mannual/java-sdk/quick-start/spring-boot/)
- Refer to [Nacos](/en/overview/reference/integrations/nacos/) to start Nacos server

> When Dubbo uses version `3.0.0` or higher, Nacos version `2.0.0` or higher is required.

## 2 Usage Instructions
The steps to integrate Dubbo with Nacos as a metadata center are very simple, mainly divided into `adding Maven dependency` and `configuring metadata center`.
> If the metadata address (dubbo.metadata-report.address) is also not configured, the address of the registry will be used as the metadata center.

### 2.1 Add Maven Dependency
If the project has already enabled Nacos as the registry, no additional configuration is needed.

If Nacos registry has not been enabled, please refer to [Adding Nacos Dependency for Registry](/en/overview/mannual/java-sdk/reference-manual/registry/nacos/).

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

For the format of `address`, please refer to [Nacos Registry - Enable Configuration](../../registry/nacos/).

## 3 Advanced Configuration

For complete configuration parameters, please refer to [metadata-report-config](../../config/properties/#metadata-report-config).

## 4 Working Principle

### 4.1 Service Operation Metadata

You can see the operational metadata information related to registered service providers and consumers on the Nacos console:

![image-dubbo-metadata-nacos-1.png](/imgs/blog/dubbo-metadata-nacos-1.png)

In Nacos, the concept of a configuration center exists, which is suitable for metadata storage. Under the configuration center scenario, there is the concept of a namespace. Under the namespace, there is also a group concept. That is, a configuration item is located through the namespace, group, and dataId. If the namespace is not specified, `public` is used as the default namespace.

```properties
Provider: namespace: 'public', dataId: '{service name}:{version}:{group}:provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:{version}:{group}:consumer:{application name}', group: 'dubbo'
```
When version or group does not exist, `:` is still retained:
```properties
Provider: namespace: 'public', dataId: '{service name}:::provider:{application name}', group: 'dubbo'
Consumer: namespace: 'public', dataId: '{service name}:::consumer:{application name}', group: 'dubbo'
```

Providers interface metadata details (controlled by `report-definition=true`):

![image-dubbo-metadata-nacos-3.png](/imgs/blog/dubbo-metadata-nacos-3.png)

Consumers interface information details (controlled by `report-consumer-definition=true`, default false):

![image-dubbo-metadata-nacos-4.png](/imgs/blog/dubbo-metadata-nacos-4.png)

### 4.2 Address Discovery - Interface-Application Mapping
As mentioned above, the service name and application name may be one-to-many. In Nacos, a single key-value is used for storage, with multiple application names separated by commas. Since data is stored as a single key-value, there may be concurrent overwrite issues in the case of multiple clients. Therefore, we use the publishConfigCas capability in Nacos to solve this problem. In Nacos, using publishConfigCas requires the user to provide a parameter casMd5, which is the md5 value of the previous configuration content. Different clients check the content value of Nacos before updating to compute the md5 value, which serves as a local credential. During the update, the credential md5 is sent to the server for comparison. If the values do not match, it indicates that it has been modified by another client during this time, requiring the credential to be retrieved again for a retry (CAS). Currently, if the retry fails 6 times, the mapping update action will be abandoned.

Nacos API:
```java
ConfigService configService = ...
configService.publishConfigCas(key, group, content, ticket);
```

Mapping information is located in namespace: 'public', dataId: '{service name}', group: 'mapping'.

![nacos-metadata-report-service-name-mapping.png](/imgs/user/nacos-metadata-report-service-name-mapping.png)

### 4.3 Address Discovery - Interface Configuration Metadata

To enable remote interface configuration metadata registration, the following configuration must be added to the application, as by default, Dubbo3 application-level service discovery enables service introspection mode and does not register data to the metadata center.

```properties
 dubbo.application.metadata-type=remote
 ```

Or, enable centralized metadata registration even in introspection mode:

```properties
dubbo.application.metadata-type=local
dubbo.metadata-report.report-metadata=true
```

The detailed metadata information in the Nacos server is as follows:

![image-dubbo-metadata-nacos-2.png](/imgs/blog/dubbo-metadata-nacos-2.png)

