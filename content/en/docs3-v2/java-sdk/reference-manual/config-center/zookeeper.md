---
type: docs
title: "Zookeeper"
linkTitle: "Zookeeper"
weight: 2
description: "The basic usage and working principle of the Zookeeper configuration center."
---

## 1 precondition
* Understand [Dubbo basic development steps](../../../quick-start/spring-boot/)
* Install and start [Zookeeper](https://zookeeper.apache.org/)

## 2 Instructions for use
View [full sample code](https://github.com/apache/dubbo-samples/tree/master/3-extensions/configcenter/dubbo-samples-configcenter-annotation) here

### 2.1 Add Maven dependency
If the project has enabled Zookeeper as the registry, no additional configuration is required.

If the Zookeeper registry is not used, please refer to [Add Zookeeper-related dependencies for the registry](../../registry/zookeeper/#21-add-maven-dependency).

### 2.2 Enable Zookeeper Configuration Center
```xml
<dubbo:config-center address="zookeeper://127.0.0.1:2181"/>
```

or

```yaml
dubbo
  config-center
    address: zookeeper://127.0.0.1:2181
```

or

```properties
dubbo.config-center.address=zookeeper://127.0.0.1:2181
```

or

```java
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setAddress("zookeeper://127.0.0.1:2181");
```

For `address` format, please refer to [zookeeper registry - enable configuration](../../registry/zookeeper/#22-configure and enable-zookeeper)

## 3 Advanced configuration
To enable authentication, please refer to [zookeeper registry - enable authentication](../../registry/zookeeper/#31-authentication and authentication)

### 3.1 Customize external configuration key
**1. Enable external configuration and specify key**
```yaml
dubbo
  config-center
    address: zookeeper://127.0.0.1:2181
    config-file: dubbo.properties
```

`config-file` - externalized configuration file key value, default `dubbo.properties`. `config-file` represents the key value corresponding to the file in the configuration center when the Dubbo configuration file is stored in the remote registration center, and it is generally not recommended to modify this configuration item.

**2. Add configuration to Zookeeper configuration center**
The storage structure of the externalized configuration is shown in the figure below

![zk-configcenter.jpg](/imgs/user/zk-configcenter.jpg)

- namespace, used for environment isolation of different configurations.
- config, a fixed node agreed by Dubbo, cannot be changed, and all configuration and traffic governance rules are stored under this node.
- dubbo and application are used to isolate global configuration and application-level configuration respectively: dubbo is the default group value, and application corresponds to the application name
- dubbo.properties, the node value of this node stores the specific configuration content

> Here is to explain the working principle, it is recommended to use dubbo-admin for configuration management.

### 3.2 Set group and namespace
```yaml
dubbo
  config-center
    address: zookeeper://127.0.0.1:2181
    group: dubbo-cluster1
    namespace: dev1
```

For the configuration center, `group` and `namespace` should be unified across the company (cluster), avoid using different values for different applications, and external configuration and governance rules should also be stored in the corresponding group and namespace.

## 4 Traffic Governance Rules
All traffic governance rules are stored under the `/dubbo/config` node by default. The specific node structure diagram is as follows. It is recommended to add, delete, and modify traffic governance rules through dubbo-admin. For more information, please refer to the specific traffic governance capabilities supported by Dubbo

![zk-configcenter-governance](/imgs/user/zk-configcenter-governance.jpg)

- namespace, used for environment isolation of different configurations.
- config, a fixed node agreed by Dubbo, cannot be changed, and all configuration and traffic governance rules are stored under this node.
- dubbo, all service governance rules are global, dubbo is the default node
- configurators/tag-router/condition-router/migration, different service governance rule types, node value stores specific rule content