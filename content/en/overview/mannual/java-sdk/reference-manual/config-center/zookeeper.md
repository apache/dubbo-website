---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/config-center/zookeeper/
    - /en/docs3-v2/java-sdk/reference-manual/config-center/zookeeper/
    - /en/overview/what/ecosystem/config-center/zookeeper/
description: Basic usage and working principles of the Zookeeper configuration center.
linkTitle: Zookeeper
title: Zookeeper
type: docs
weight: 2
---


## 1 Prerequisites
* Understand [Dubbo basic development steps](/en/overview/mannual/java-sdk/quick-start/starter/)
* Install and start [Zookeeper](/en/overview/reference/integrations/zookeeper/)

## 2 Usage Instructions
View the [complete sample code](https://github.com/apache/dubbo-samples/tree/master/3-extensions/configcenter/dubbo-samples-configcenter-annotation)

### 2.1 Add Maven Dependencies
If the project has already enabled Zookeeper as the registry, no additional configurations are necessary.

If Zookeeper is not used as the registry, refer to [Add Zookeeper related dependencies for the registry](/en/overview/mannual/java-sdk/reference-manual/registry/zookeeper/#11-Add-Maven-dependencies).

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

For the format of `address`, refer to [zookeeper registry - enable configuration](../../registry/zookeeper/#13-Configure-and-enable-Zookeeper)

## 3 Advanced Configuration
To enable authentication and authorization, refer to [zookeeper registry - enable authentication and authorization](../../registry/zookeeper/#21-Authentication-and-authorization)

### 3.1 Customize Externalized Configuration Key
**1. Enable externalized configuration and specify key**
```yaml
dubbo
  config-center
    address: zookeeper://127.0.0.1:2181
    config-file: dubbo.properties
```

`config-file` - key value of the externalized configuration file, default `dubbo.properties`. `config-file` represents the key value corresponding to the Dubbo configuration file when stored in the remote registry, and it is generally not recommended to change this configuration item.

**2. Add configuration to Zookeeper Configuration Center**
The storage structure of externalized configuration is shown in the diagram below.

![zk-configcenter.jpg](/imgs/user/zk-configcenter.jpg)

- namespace, used for environment isolation of different configurations.
- config, a fixed node defined by Dubbo, cannot be changed, all configurations and traffic governance rules are stored under this node.
- dubbo and application, used for isolating global configuration and application-level configuration: dubbo is the default group value, and application corresponds to the application name.
- dubbo.properties, the node value of this node stores specific configuration content.

> This is to illustrate the working principle; it is recommended to use dubbo-admin for configuration management.

### 3.2 Set Group and Namespace
```yaml
dubbo
  config-center
    address: zookeeper://127.0.0.1:2181
    group: dubbo-cluster1
    namespace: dev1
```

For the configuration center, `group` and `namespace` should be unified across the company (cluster), and different applications should avoid using different values. Externalized configurations and governance rules should also be stored under the corresponding group and namespace.

## 4 Traffic Governance Rules
All traffic governance rules are by default stored under the `/dubbo/config` node. The specific node structure diagram is as follows. It is recommended to use dubbo-control-plane (dubbo-admin) for adding, deleting, or modifying traffic governance rules. More content can be found in Dubbo's supported traffic governance capabilities.

![zk-configcenter-governance](/imgs/user/zk-configcenter-governance.jpg)

- namespace, used for environment isolation of different configurations.
- config, a fixed node defined by Dubbo, cannot be changed; all configuration and traffic governance rules are stored in this node.
- dubbo, all service governance rules are global, and dubbo is the default node.
- configurators/tag-router/condition-router/migration, different types of service governance rules, node value stores the specific rules content.

