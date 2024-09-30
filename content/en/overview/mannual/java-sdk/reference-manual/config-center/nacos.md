---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/config-center/nacos/
    - /en/docs3-v2/java-sdk/reference-manual/config-center/nacos/
    - /en/overview/what/ecosystem/config-center/nacos/
description: Basic usage and working principles of the Nacos configuration center.
linkTitle: Nacos
title: Nacos
type: docs
weight: 3
---

## 1 Prerequisites
* Understand [Basic Development Steps of Dubbo](/en/overview/mannual/java-sdk/quick-start/starter/)
* Install and start [Nacos](/en/overview/reference/integrations/nacos/)

> When Dubbo uses version `3.0.0` or above, Nacos version `2.0.0` or above is required. Please refer to [nacos registry]( /en/overview/mannual/java-sdk/reference-manual/registry/nacos/#12-nacos-version) for Nacos version compatibility.

## 2 Instructions

### 2.1 Add Maven Dependency
If the project has already enabled Nacos as a registry, no additional configuration is required.

If Nacos registry is not enabled, please refer to [Add Nacos dependency for registry](/en/overview/mannual/java-sdk/reference-manual/registry/nacos/#11-add-dependency).

### 2.2 Enable Nacos Configuration Center
```xml
<dubbo:config-center address="nacos://127.0.0.1:8848"/>
```

or

```yaml
dubbo
  config-center
    address: nacos://127.0.0.1:8848
```

or

```properties
dubbo.config-center.address=nacos://127.0.0.1:8848
```

or

```java
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setAddress("nacos://127.0.0.1:8848");
```

For `address` format, please refer to [Nacos Registry - Enable Configuration](../../registry/nacos/#22-configure-and-enable-nacos)

## 3 Advanced Configuration
To enable authentication, please refer to [Nacos Registry - Enable Authentication](../../registry/nacos/#31-authentication)

### 3.1 Externalized Configuration
#### 3.1.1 Global Externalized Configuration
**1. Application enable config-center configuration**
```yaml
dubbo
  config-center
    address: nacos://127.0.0.1:2181
    config-file: dubbo.properties # optional
```
`config-file` - Key for global externalized configuration file, default is `dubbo.properties`. It represents the key in the configuration center when storing the Dubbo configuration file remotely. It is generally not recommended to modify this configuration.

**2. Add Configuration to Nacos Server**

![nacos-configcenter-global-properties.png](/imgs/user/nacos-configcenter-global-properties.png)

dataId is `dubbo.properties`, group is the same as config-center, default is `dubbo` if not set.

#### 3.1.2 Application-Specific Externalized Configuration

**1. Application enable config-center configuration**
```yaml
dubbo
  config-center
    address: nacos://127.0.0.1:2181
    app-config-file: dubbo.properties # optional
```

`app-config-file` - Key for the application-specific externalized configuration file, such as `app-name-dubbo.properties`, configured only when needing to override the global externalization `config-file`.

**2. Add Configuration to Nacos Server**

![nacos-configcenter-application-properties.png](/imgs/user/nacos-configcenter-application-properties.png)

dataId is `dubbo.properties`, group is the application name `demo-provider`.

### 3.2 Set Group and Namespace
```yaml
dubbo
  config-center
    address: zookeeper://127.0.0.1:2181
    group: dubbo-cluster1
    namespace: dev1
```

For the configuration center, `group` and `namespace` should be consistent across the company (cluster) and avoid different values for different applications.

### 3.3 Nacos Extended Configuration
For more Nacos sdk/server supported parameter configurations, refer to [Nacos Registry - More Configurations](../../registry/nacos/#35-more-configurations)

## 4 Traffic Governance Rules
For Nacos, all traffic governance rules and externalized configurations should be globally visible, thus applications in the same logical cluster must use the same namespace and group. The default value for namespace is `public` and the default value for group is `dubbo`. Applications must not modify the namespace and group without maintaining global consistency.

Changes to traffic governance rules are recommended to be made through dubbo-admin; for more details, see Dubbo's supported traffic governance capabilities.

![nacos-configcenter-governance.jpg](/imgs/user/nacos-configcenter-governance.png)

There are various types of traffic governance rules, and different types of rules have different suffixes for dataId:

- configurators [override rules](/en/overview/core-features/traffic/configuration-rule/)
- tag-router [tag routing](/en/overview/core-features/traffic/tag-rule/) and condition-router [condition routing](/en/overview/core-features/traffic/condition-rule/)

