---
type: docs
title: "Nacos"
linkTitle: "Nacos"
weight: 3
description: "The basic usage and working principle of Nacos Configuration Center."
---

## 1 precondition
* Understand [Dubbo basic development steps](../../../quick-start/spring-boot/)
* Install and start [Nacos](https://nacos.io/zh-cn/docs/quick-start.html)
> When Dubbo uses `3.0.0` and above, it needs to use Nacos `2.0.0` and above.

## 2 Instructions for use

### 2.1 Add Maven dependency
If the project has enabled Nacos as the registration center, no additional configuration is required.

If the Nacos registry is not enabled, please refer to [Adding Nacos dependencies to the registry](../../registry/nacos/#21-Add dependencies).

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

For `address` format, please refer to [Nacos Registry - Enable Configuration](../../registry/nacos/#22-configure and enable-nacos)

## 3 Advanced configuration
To enable authentication authentication, please refer to [Nacos Registry - Enable Authentication Authentication](../../registry/nacos/#31-authentication)

### 3.1 External configuration
#### 3.1.1 Global externalization configuration
**1. The application opens config-center configuration**
```yaml
dubbo
  config-center
    address: nacos://127.0.0.1:2181
    config-file: dubbo.properties # optional
```
`config-file` - global externalized configuration file key value, default `dubbo.properties`. `config-file` represents the key value corresponding to the file in the configuration center when the Dubbo configuration file is stored in the remote registration center, and it is generally not recommended to modify this configuration item.

**2. Add configuration to Nacos Server**

![nacos-configcenter-global-properties.png](/imgs/user/nacos-configcenter-global-properties.png)

dataId is `dubbo.properties`, group grouping is consistent with config-center, if not set, `dubbo` will be filled by default.

#### 3.1.2 Application-specific externalization configuration

**1. The application opens config-center configuration**
```yaml
dubbo
  config-center
    address: nacos://127.0.0.1:2181
    app-config-file: dubbo.properties # optional
```

`app-config-file` - The current application-specific externalization configuration file key value, such as `app-name-dubbo.properties`, only configured when it needs to override the global externalization configuration file `config-file`.

**2. Add configuration to Nacos Server**

![nacos-configcenter-application-properties.png](/imgs/user/nacos-configcenter-application-properties.png)

The dataId is `dubbo.properties`, and the group is set to the application name, namely `demo-provider`.

### 3.2 Set group and namespace
```yaml
dubbo
  config-center
    address: zookeeper://127.0.0.1:2181
    group: dubbo-cluster1
    namespace: dev1
```

For the configuration center, `group` and `namespace` should be unified across the company (cluster), and different applications should be prevented from using different values.

### 3.3 Nacos extended configuration
For more parameter configurations supported by Nacos sdk/server, please refer to [Nacos Registry - More Configurations](../../registry/nacos/#35-More Configurations)

## 4 Traffic Governance Rules
For Nacos, all traffic governance rules and external configurations should be globally visible, so applications in the same logical cluster must use the same namespace and group. Among them, the default value of namespace is `public`, and the default value of group is `dubbo`. The application should not modify the namespace and group without authorization, unless it can maintain global consistency.

It is recommended to add, delete, and modify traffic governance rules through dubbo-admin. For more information, please refer to the traffic governance capabilities supported by Dubbo.

![nacos-configcenter-governance.jpg](/imgs/user/nacos-configcenter-governance.png)

There are many types of traffic governance rules, and the suffixes of dataId for different types of rules are different:

- configurators, [override rules](/zh-cn/overview/core-features/traffic/configuration-rule/)
- tag-router, [tag routing](/zh-cn/overview/core-features/traffic/tag-rule/)
- condition-router, [conditional routing](/zh-cn/overview/core-features/traffic/condition-rule/)