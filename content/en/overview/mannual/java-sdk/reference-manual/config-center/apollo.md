---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/config-center/apollo/
    - /en/docs3-v2/java-sdk/reference-manual/config-center/apollo/
    - /en/overview/what/ecosystem/config-center/apollo/
description: The basic usage and working principles of Apollo Configuration Center.
linkTitle: Apollo
title: Apollo
type: docs
weight: 4
---

## 1 Preconditions
* Understand [the basic development steps of Dubbo](../../../quick-start/spring-boot/)
* Install and start [Apollo](https://www.apolloconfig.com/#/zh/README)

## 2 Usage Instructions
View the [complete example code](https://github.com/apache/dubbo-samples/tree/master/3-extensions/configcenter/dubbo-samples-configcenter-apollo)

### 2.1 Add Maven Dependency

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

## 3 Advanced Configuration
A core concept in Apollo is the namespace, which is different from the namespace concepts of Zookeeper and Nacos. Therefore, the usage is somewhat special; it is recommended to fully understand Apollo's usage before reading the following document content.

Generally speaking, for adaptation to Apollo:
* group is specifically used for the isolation of externalized configurations, see 3.1
* namespace is specifically used for the isolation of traffic governance rules, see 3.2

### 3.1 Externalized Configuration

```xml
<dubbo:config-center group="demo-provider" address="apollo://localhost:8080"/>
```

The `group` of config-center determines the location of the externalized configuration `dubbo.properties` file in Apollo:
1. If the group is empty, it defaults to reading configurations from the `dubbo` namespace, and users must write externalized configurations under the `dubbo` namespace.
2. If the group is not empty
  2.1 If the group value is the application name, it reads configurations from the current namespace of the application, and users must write externalized configurations under the automatically designated default namespace of Apollo.
  2.2 If the group value is any other value, it reads configurations from the corresponding namespace, and users must write externalized configurations under that namespace.

For example, the following example uses the default group='dubbo' for global externalized configuration, meaning this configuration can be read by all applications.
![apollo-configcenter-dubbo.png](/imgs/user/apollo-configcenter-dubbo.png)

If the group is set to 'application name', then it is application-specific configuration, and only that application can read it.

> The external file configuration hosting means that the contents of the `dubbo.properties` configuration file are stored in Apollo. Each application can inherit common configurations through the associated shared `dubbo` namespace and can individually override specific configuration items.

### 3.2 Traffic Governance Rules
**Traffic governance rules are globally shared, so the namespace configurations within each application should remain consistent.**

```xml
<dubbo:config-center namespace="governance" address="apollo://localhost:8080"/>
```

The `namespace` of config-center determines the location of the traffic governance rules in Apollo:
1. If the namespace is empty, it defaults to accessing configurations from the `dubbo` namespace, and governance rules must be written under the `dubbo` namespace.
2. If the namespace is not empty, it reads rules from the corresponding namespace value, and governance rules must be written under that namespace.

For example, the following example uses `namespace='governance'` to place traffic governance rules in the `governance` namespace.
![apollo-configcenter-governance-dubbo.png](/imgs/user/apollo-configcenter-governance-dubbo.png)

### 3.3 More Apollo Specific Configurations
Currently, Dubbo has adapted specific configuration items such as env, apollo.meta, apollo.cluster, and apollo.id, which can be configured via the extension parameters of config-center.

For example,
```properties
dubbo.config-center.address=apollo://localhost:8080
```

or

```properties
dubbo.config-center.parameters.apollo.meta=xxx
dubbo.config-center.parameters.env=xxx
```

