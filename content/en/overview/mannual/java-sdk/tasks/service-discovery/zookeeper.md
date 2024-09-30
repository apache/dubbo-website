---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/performance/loadbalance/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/others/graceful-shutdown/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/service/consistent-hash/
description: "This example demonstrates how to use Zookeeper as a registry center to achieve automatic service discovery."
linkTitle: Using Zookeeper as a Registry Center
title: Achieving Automatic Service Discovery with Zookeeper as a Registry Center
type: docs
weight: 3
---

This example demonstrates the automatic service discovery using Zookeeper as a registry center, based on a Spring Boot application. You can view the [full sample code](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-zookeeper)

## 1 Basic Configuration
### 1.1 Adding Maven Dependencies
Add dependencies for dubbo, zookeeper, etc. `dubbo-spring-boot-starter` will automatically add relevant client dependencies for Zookeeper, reducing the cost for users.

For Spring Boot applications, you can use the following dependencies:
```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-spring-boot-starter</artifactId>
    <version>3.3.0</version>
</dependency>
<!-- Use this dependency only when Zookeeper Server version is 3.4.x and below -->
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-zookeeper-spring-boot-starter</artifactId>
    <version>3.3.0</version>
</dependency>
<!-- Use this dependency only when Zookeeper Server version is 3.5.x and above
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-zookeeper-curator5-spring-boot-starter</artifactId>
    <version>3.3.0</version>
</dependency>
-->
```

Here, dubbo-zookeeper-spring-boot-starter or `dubbo-zookeeper-curator5-spring-boot-starter` manages the zookeeper-related dependencies.


{{% alert title="Note" color="info" %}}
If you do not use Spring Boot, you can manage dependencies as follows

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>3.3.0</version>
    </dependency>
    <!-- This dependency helps to introduce Curator and Zookeeper dependencies that are necessary for Dubbo to work with zookeeper as transitive dependencies. -->
    <!-- Use this dependency only when Zookeeper Server version is 3.4.x and below -->
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-dependencies-zookeeper</artifactId>
        <version>3.3.0</version>
        <type>pom</type>
    </dependency>
    <!-- Use this dependency only when Zookeeper Server version is 3.5.x and above
	<dependency>
		<groupId>org.apache.dubbo</groupId>
		<artifactId>dubbo-dependencies-zookeeper-curator5</artifactId>
		<version>3.3.0</version>
		<type>pom</type>
	</dependency>
	-->
</dependencies>
```
{{% /alert %}}

### 1.2 Choosing Zookeeper Version

Since Dubbo uses Curator as the programming client to interact with Zookeeper Server, special attention should be paid to the compatibility between Zookeeper Server and Dubbo version dependencies.

Dubbo provides an auxiliary management component for Zookeeper dependencies. Developers can choose the dependency version based on the current version of the Zookeeper Server:

**1. If you are a Dubbo 3.3 or higher user, please select components based on the following table:**

| **Zookeeper Server Version** | **Dubbo Dependency** | **Dubbo Starter Dependency (Spring Boot User)** |
| --- | --- | --- |
| 3.4.x and below | dubbo-dependencies-zookeeper | dubbo-zookeeper-spring-boot-starter |
| 3.5.x and above | dubbo-dependencies-zookeeper-curator5 | dubbo-zookeeper-curator5-spring-boot-starter |

**2. If you are using Dubbo 3.2 or below, or Dubbo 2.7.x:**

| **Zookeeper Server Version** | **Dubbo Dependency** | **Dubbo Starter Dependency (Spring Boot User)** |
| --- | --- | --- |
| 3.4.x and below | dubbo-dependencies-zookeeper | Not supported (manage manually) |
| 3.5.x and above | Not supported (manage manually) | Not supported (manage manually) |

{{% alert title="Note" color="info" %}}
* Starting with Dubbo 3.3.0, JDK 17 is officially supported. If you use JDK 17, you must choose dubbo-dependencies-zookeeper-curator5 or dubbo-zookeeper-curator5-spring-boot-starter, and the recommended Zookeeper Server is version 3.8.0 or above.
{{% /alert %}}


### 1.3 Configuring and Enabling Zookeeper
```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   register-mode: instance # New users please set this value to enable application-level service discovery, optional values are interface, instance, all; default value is all, future versions will switch the default value to instance
```
or
```properties
# dubbo.properties
dubbo.registry.address=zookeeper://localhost:2181
# New users please set this value to enable application-level service discovery, optional values are interface, instance, all; default value is all, future versions will switch the default value to instance
dubbo.registry.register-mode=instance
```
or
```xml
<dubbo:registry address="zookeeper://localhost:2181" register-mode="instance" />
```

`address` is the only required property to enable the Zookeeper registry center, while in a production environment, `address` is often specified as a cluster address, such as

`address=zookeeper://10.20.153.10:2181?backup=10.20.153.11:2181,10.20.153.12:2181`

The protocol and address can also be configured separately, such as

`<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181,10.20.153.11:2181,10.20.153.12:2181" />`

## 2 Advanced Configuration
### 2.1 Authentication and Authorization

If Zookeeper authentication is enabled, Dubbo supports passing the identity via username and password.

```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   register-mode: instance # New users please set this value to enable application-level service discovery, optional values are interface, instance, all
   username: hello
   password: 1234
```

You can also directly expand the parameters on the address `address=zookeeper://hello:1234@localhost:2181`

### 2.2 Group Isolation
By specifying the `group` property, logical isolation of microservice addresses can be achieved within the same Zookeeper cluster.

```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   register-mode: instance # New users please set this value to enable application-level service discovery, optional values are interface, instance, all
   group: daily1
```

### 2.3 Other Extended Configurations
Configure connection and session expiration times
```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   register-mode: instance # New users please set this value to enable application-level service discovery, optional values are interface, instance, all
   timeout: 30 * 1000 * # Connection timeout, default 30s
   session: 60 * 1000 * # Session timeout, default 60s
```

The Zookeeper registry center also supports other control parameters, see the [Registry Configuration Handbook](../../config/properties#registry)

## 3 Working Principle
In the previous section, we explained the difference between application-level service discovery and interface-level service discovery. In the Zookeeper implementation, their storage structures also differ significantly. Overall, the Zookeeper registry center implementation supports the following high availability capabilities:

* When the provider experiences an unexpected shutdown, the registry center automatically deletes the provider's information.
* When the registry center restarts, it can automatically recover the registration data and subscription requests.
* When the session expires, it can automatically recover the registration data and subscription requests.
* When `registry.check=false` is set, failed registration and subscription requests are recorded, and the backend retries periodically.

### 3.1 Interface Level Node Structure

![/user-guide/images/zookeeper.jpg](/imgs/user/zookeeper.jpg)

Process:
* When the service provider starts: It writes its URL to the `/dubbo/com.foo.BarService/providers` directory.
* When the service consumer starts: It subscribes to the provider's URL in the `/dubbo/com.foo.BarService/providers` directory and writes its own URL to the `/dubbo/com.foo.BarService/consumers` directory.
* When the monitoring center starts: It subscribes to all provider and consumer URLs under the `/dubbo/com.foo.BarService` directory.

You can set the Zookeeper root node through `registry.group`; if not configured, the default root node is `/dubbo`.

### 3.2 Application Level Node Structure

#### 3.2.1 Address List
<img style="max-width:500px;height:auto;" src="/imgs/v3/tasks/registry/zookeeper-hierarchy.png"/>

The address structure of application-level service discovery is more concise than that of interface-level, distributing the address list by application name. When the service provider starts, it writes its URL to the `/services/app` directory. The application-level URL is simpler, containing only some instance-level parameters, such as `tri://ip:port?region=hangzhou`.

You can set the Zookeeper root node through `registry.group`, for example, after setting `registry.group=dubbo`, the address root node becomes `/dubbo`. If not configured, the default root node is `/services`. In cases where it shares with Spring Cloud Gateway, using the `/services` root node may cause the dubbo address to be consumed by the gateway, in which case you may consider setting an independent group.

{{% alert title="Note" color="info" %}}
In the application-level service discovery model, the configuration information at the interface level is negotiated and synchronized between consumers and providers, and is no longer synchronized by the registry center, significantly reducing the address synchronization pressure on the registry center.
{{% /alert %}}

#### 3.2.2 Interface Application Mapping
In application-level service discovery, the Zookeeper registry center also stores additional metadata to resolve the mapping relationship between `interface names and application names`, with the storage structure as follows:

<img style="max-width:400px;height:auto;" src="/imgs/v3/tasks/registry/zookeeper-mapping.png"/>

The value of the service1 node is the application list, which can be viewed using `get /dubbo/mapping/service1`: app1, app2

#### 3.2.3 Metadata
If you are using the centralized metadata mode of application-level service discovery (the default is point-to-point metadata mode, which can be enabled by `dubbo.registry.metadata-type=remote`). After enabling the centralized metadata mode, you will also find the following node contents in Zookeeper:

<img style="max-width:400px;height:auto;" src="/imgs/v3/tasks/registry/zookeeper-metadata.png"/>

Each revision contains deployment metadata information for the application, including a complete list of interface services and their configuration details.

