---
type: docs
title: "Apollo"
linkTitle: "Apollo"
weight: 4
description: "The basic usage and working principle of Apollo Configuration Center."
---

## 1 precondition
* Understand [Dubbo basic development steps](../../../quick-start/spring-boot/)
* Install and start [Apollo](https://www.apolloconfig.com/#/zh/README)

## 2 Instructions for use
Check here [full sample code](https://github.com/apache/dubbo-samples/tree/master/3-extensions/configcenter/dubbo-samples-configcenter-apollo)

### 2.1 Add Maven dependency

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo</artifactId>
    <version>3.0.9</version>
</dependency>
<dependency>
    <groupId>com.ctrip.framework.apollo</groupId>
    <artifactId>apollo-openapi</artifactId>
    <version>2.0.0</version>
</dependency>
<dependency>
    <groupId>com.ctrip.framework.apollo</groupId>
    <artifactId>apollo-client</artifactId>
    <version>2.0.0</version>
</dependency>
```

### 2.2 Enable Apollo Configuration Center
```xml
<dubbo:config-center address="apollo://localhost:8080"/>
```

or

```yaml
dubbo
  config-center
    address: apollo://localhost:8080
```

or

```properties
dubbo.config-center.address=apollo://localhost:8080
```

or

```java
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setAddress("apollo://localhost:8080");
```

## 3 Advanced configuration
A core concept in Apollo is the namespace - namespace, which is different from the namespace concepts of Zookeeper and Nacos above, so the usage method is also special. It is recommended to read the following documents after fully understanding the usage of Apollo itself.

But in general, for the adaptation of Apollo:
* namespace is specially used for isolation of traffic governance rules, see 3.1
* group is specially used for isolation of externalized configuration, see 3.2

### 3.1 External configuration

```xml
<dubbo:config-center group="demo-provider" address="apollo://localhost:8080"/>
```

The `group` of config-center determines where Apollo reads the externalized configuration `dubbo.properties` file:
1. If the group is empty, the configuration will be read from the `dubbo` namespace by default, and the user must write the externalized configuration under the `dubbo` namespace.
2. If group is not empty
   2.1 If the group value is the application name, the configuration is read from the current namespace of the application, and the user must write the externalized configuration under the default namespace of the application automatically designated by Apollo.
   2.2 If the group value is any value, the configuration is read from the corresponding namespace, and the user must write the externalized configuration under the namespace.

For example, the following example uses the default global externalization configuration of group='dubbo', that is, the configuration can be read by all applications.
![apollo-configcenter-dubbo.png](/imgs/user/apollo-configcenter-dubbo.png)

If the configuration group='application name' is an application-specific configuration, only this application can read it.

> Regarding externalized file configuration hosting, it is equivalent to storing the contents of the `dubbo.properties` configuration file in Apollo. Each application can inherit the public configuration by associating with the shared `dubbo` namespace, and then can override individual configuration items individually.

### 3.2 Traffic Governance Rules
**Traffic governance rules must be shared globally, so the namespace configuration in each application should be consistent. **

```xml
<dubbo:config-center namespace="governance" address="apollo://localhost:8080"/>
```

The `namespace` of config-center determines where Apollo accesses `traffic governance rules`:
1. If the namespace is empty, the configuration will be accessed from the `dubbo` namespace by default, and the governance rules must be written under the `dubbo` namespace.
2. If the namespace is not empty, read the rules from the corresponding namespace value, and the governance rules must be written under this namespace.

For example, the following example puts the traffic governance rules under the `governance` namespace through `namespace='governance'`.
![apollo-configcenter-governance-dubbo.png](/imgs/user/apollo-configcenter-governance-dubbo.png)

### 3.3 More Apollo-specific configurations
Currently Dubbo is adapted to env, apollo.meta, apollo.cluster, apollo.id and other unique configuration items, which can be configured through the extended parameters of config-center.

Such as
```properties
dubbo.config-center.address=apollo://localhost:8080
```

or

```properties
dubbo.config-center.prameters.apollo.meta=xxx
dubbo.config-center.prameters.env=xxx
```