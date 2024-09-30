---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description: "Demonstrates how to use Zookeeper as a registration center to achieve automatic service discovery through examples."
linkTitle: zookeeper
title: Use Zookeeper as a Registration Center to Achieve Automatic Service Discovery
type: docs
weight: 3
---

This example demonstrates how Zookeeper is used as a registration center for automatic service discovery, based on a Spring Boot application. You can view the [full example code](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-zookeeper).

## 1 Basic Configuration
### 1.1 Add Maven Dependencies
Add dependencies like dubbo and zookeeper. The `dubbo-spring-boot-starter` will automatically add Zookeeper-related client dependencies for the application, reducing the cost of using Zookeeper. If you encounter version compatibility issues, you can also choose to add Curator, Zookeeper Client, and other dependencies manually.

For Spring Boot applications, you can use the following dependencies:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>${dubbo.version}</version>
</dependency>
<!-- Recommended Zookeeper Server version 3.8.0+ -->
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-zookeeper-curator5-spring-boot-starter</artifactId>
    <version>${dubbo.version}</version>
</dependency>
```

Among them, `dubbo-zookeeper-spring-boot-starter` or `dubbo-zookeeper-curator5-spring-boot-starter` is responsible for managing Zookeeper-related dependencies.

{{% alert title="Note" color="info" %}}
If you are not using Spring Boot, you can also manage dependencies using the following approach:

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>${dubbo.version}</version>
    </dependency>
    <!-- This dependency helps to introduce Curator and Zookeeper dependencies that are necessary for Dubbo to work with zookeeper as transitive dependencies. -->
    <!-- Use this dependency only when Zookeeper Server version is 3.4.x or below -->
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-dependencies-zookeeper</artifactId>
        <version>${dubbo.version}</version>
        <type>pom</type>
    </dependency>
</dependencies>
```
{{% /alert %}}

### 1.2 Choose Zookeeper Version

Since Dubbo uses Curator as the programming client to interact with Zookeeper Server, special attention must be paid to the compatibility of Zookeeper Server with Dubbo version dependencies.

Dubbo provides a helper management component for Zookeeper dependencies, allowing developers to choose dependency versions based on the current Zookeeper Server version:

**1. If you are a user of Dubbo3 version 3.3 or above, please choose components according to the following table:**

| **Zookeeper Server Version** | **Dubbo Dependency** | **Dubbo Starter Dependency (Spring Boot Users)** |
| --- | --- | --- |
| 3.4.x and below | dubbo-dependencies-zookeeper | dubbo-zookeeper-spring-boot-starter |
| 3.5.x and above | dubbo-dependencies-zookeeper-curator5 | dubbo-zookeeper-curator5-spring-boot-starter |

**2. If you are a user of Dubbo3 version 3.2 or below, or Dubbo2 2.7.x:**

| **Zookeeper Server Version** | **Dubbo Dependency** | **Dubbo Starter Dependency (Spring Boot Users)** |
| --- | --- | --- |
| 3.4.x and below | dubbo-dependencies-zookeeper | Not supported (manage it yourself) |
| 3.5.x and above | Not supported (manage it yourself) | Not supported (manage it yourself) |

{{% alert title="Note" color="info" %}}
* Starting from Dubbo version 3.3.0, JDK 17 is officially supported. If you are using JDK 17, you must choose the dependencies `dubbo-dependencies-zookeeper-curator5` or `dubbo-zookeeper-curator5-spring-boot-starter`, with the recommended Zookeeper Server version being 3.8.0 or above.
* If you manage Zookeeper dependencies on your own, make sure to include the correct versions of Zookeeper and Curator dependencies in your project, referring to how `dubbo-dependencies-zookeeper` or `dubbo-dependencies-zookeeper-curator5` components are implemented in Dubbo version 3.3.0.
{{% /alert %}}


### 1.3 Configure and Enable Zookeeper
```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
```
or
```properties
# dubbo.properties
dubbo.registry.address=zookeeper://localhost:2181
```
or
```xml
<dubbo:registry address="zookeeper://localhost:2181" />
```

The `address` is the only required property to enable the Zookeeper registration center, and in a production environment, it is usually specified as a cluster address, such as

`address=zookeeper://10.20.153.10:2181?backup=10.20.153.11:2181,10.20.153.12:2181`

Protocols and addresses can also be configured separately, such as

`<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181,10.20.153.11:2181,10.20.153.12:2181" />`

## 2 Advanced Configuration
### 2.1 Authentication and Authorization

If Zookeeper has authentication enabled, Dubbo supports specifying the username and password for identity verification.

```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   username: hello
   password: 1234
```

You can also directly extend parameters on the address: `address=zookeeper://hello:1234@localhost:2181`

### 2.2 Group Isolation
Logical isolation of microservice addresses can be achieved within the same Zookeeper cluster by specifying the `group` attribute. For example, you can isolate multiple development environments within a single cluster.

```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   group: daily1
```

### 2.3 Other Extended Configurations
Configure connection and session expiration time
```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   timeout: 30 * 1000* # Connection timeout, default is 30s
   session: 60 * 1000* # Session timeout, default is 60s
```

The Zookeeper registration center also supports other control parameters, please refer to the [Registry configuration manual](../../config/properties#registry)

## 3 Working Principle
In the previous section, we explained the differences between application-level service discovery and interface-level service discovery. In the Zookeeper implementation, their storage structures differ significantly. Overall, the Zookeeper registration center implementation supports the following high availability capabilities:

* When the provider experiences an abnormal shutdown due to power failure or other reasons, the registration center can automatically delete the provider's information.
* When the registration center restarts, it can automatically recover registration data and subscription requests.
* When the session expires, it can automatically recover registration data and subscription requests.
* When `registry.check=false` is set, it records failed registration and subscription requests, and re-trials them periodically in the background.

### 3.1 Interface-Level Node Structure

![/user-guide/images/zookeeper.jpg](/imgs/user/zookeeper.jpg)

Process:
* When the service provider starts: writes its URL to the directory `/dubbo/com.foo.BarService/providers`.
* When the service consumer starts: subscribes to the provider's URL in the directory `/dubbo/com.foo.BarService/providers` and writes its URL to the directory `/dubbo/com.foo.BarService/consumers`.
* When the monitoring center starts: subscribes to all provider and consumer URL addresses under the directory `/dubbo/com.foo.BarService`.

You can set the Zookeeper root node using `registry.group`; if not configured, it will use the default root node `/dubbo`.

### 3.2 Application-Level Node Structure

#### 3.2.1 Address List
<img style="max-width:500px;height:auto;" src="/imgs/v3/tasks/registry/zookeeper-hierarchy.png"/>

The address structure for application-level service discovery is simplified compared to interface-level, distributing the address list at the application name level. When the service provider starts, it writes its URL to the directory `/services/app`. Compared to interface-level URLs, application-level URLs are simpler and contain only instance-level parameters, such as `tri://ip:port?region=hangzhou`.

You can set the Zookeeper root node using `registry.group`; for example, after setting `registry.group=dubbo`, the address root node becomes `/dubbo`. If not configured, the default root node will be `/services`. In cases where it shares with Spring Cloud Gateway, using the `/services` root node can lead to Dubbo addresses being consumed by the Gateway, so you may consider setting up an independent group.

{{% alert title="Note" color="info" %}}
In the application-level service discovery model, the configuration information at the interface level is synchronized through negotiation between consumers and providers, rather than being synchronized by the registration center, greatly reducing the synchronization pressure on the registration center.
{{% /alert %}}

#### 3.2.2 Interface-Application Mapping
In application-level service discovery, the Zookeeper registration center also stores an extra metadata to solve the mapping relationship between `interface name` and `application name`, with the storage structure as follows:

<img style="max-width:400px;height:auto;" src="/imgs/v3/tasks/registry/zookeeper-mapping.png"/>

The value of the service1 node is the application list, which can be viewed by `get /dubbo/mapping/service1`: app1, app2.

#### 3.2.3 Metadata
If you are using the centralized metadata mode for application-level service discovery (the default is point-to-point metadata mode, which can be enabled by `dubbo.registry.metadata-type=remote`). In centralized metadata mode, the following node content can be found in Zookeeper:

<img style="max-width:400px;height:auto;" src="/imgs/v3/tasks/registry/zookeeper-metadata.png"/>

Each revision contains the deployment metadata information for that application, including a complete list of interface services and their configuration information.

