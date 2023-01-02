---
type: docs
title: "Zookeeper"
linkTitle: "Zookeeper"
weight: 2
description: "The basic usage and working principle of the Zookeeper registry."
---

## 1 precondition
* Understand [Dubbo basic development steps](../../../quick-start/spring-boot/)
* Install and start [Zookeeper](https://zookeeper.apache.org/)

## 2 Instructions for use
Check out [full sample code](https://github.com/apache/dubbo-samples/tree/master/3-extensions/registry/dubbo-samples-zookeeper) here

### 2.1 Add Maven dependency
```xml
<properties>
    <dubbo.version>3.0.8</dubbo.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo</artifactId>
        <version>${dubbo.version}</version>
    </dependency>
    <!-- This dependency helps to introduce Curator and Zookeeper dependencies that are necessary for Dubbo to work with zookeeper as transitive dependencies -->
    <dependency>
        <groupId>org.apache.dubbo</groupId>
        <artifactId>dubbo-dependencies-zookeeper</artifactId>
        <version>${dubbo.version}</version>
        <type>pom</type>
    </dependency>
</dependencies>
```

`dubbo-dependencies-zookeeper` will automatically add Zookeeper-related client dependencies to the application, reducing the cost of using Zookeeper for users. If there is a version compatibility problem during use, users can also add it by themselves instead of using `dubbo-dependencies-zookeeper` Curator, Zookeeper Client and other dependencies.

Since Dubbo uses Curator as a programming client interacting with Zookeeper Server, special attention should be paid to the compatibility between Zookeeper Server and Dubbo version dependencies

|Zookeeper Server Version|Dubbo Version|Dubbo Zookeeper Dependency Package|Description|
|-----|-----|-----|-----|
|3.4.x and below|3.0.x and above|dubbo-dependencies-zookeeper|transitive dependencies Curator 4.x, Zookeeper 3.4.x|
|3.5.x and above|3.0.x and above|dubbo-dependencies-zookeeper-curator5|transitive dependencies Curator 5.x, Zookeeper 3.7.x|
|3.4.x and above|2.7.x and below|dubbo-dependencies-zookeeper|transitive dependencies Curator 4.x, Zookeeper 3.4.x|
|3.5.x and above|2.7.x and below|None|Need to add Curator, Zookeeper and other related client dependencies|

### 2.2 Configure and enable Zookeeper
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

`address` is the only attribute that must be specified to enable the zookeeper registration center, and in a production environment, `address` is usually specified as the cluster address, such as

`address=zookeeper://10.20.153.10:2181?backup=10.20.153.11:2181,10.20.153.12:2181`

It is also possible to configure protocol and address separately, such as

`<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181,10.20.153.11:2181,10.20.153.12:2181" />`

## 3 Advanced configuration
### 3.1 Authentication and Authorization

If Zookeeper enables authentication, Dubbo supports passing in the identity by specifying username and password.

```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   username: hello
   password: 1234
```

You can also directly expand the parameters on the address `address=zookeeper://hello:1234@localhost:2181`

### 3.2 Group isolation
By specifying the `group` attribute, the logical isolation of microservice addresses can be achieved within the same Zookeeper cluster. For example, multiple sets of development environments can be isolated in one cluster, and isolation can be achieved at the address discovery level.

```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   group: daily1
```
### 3.3 Other extended configurations
Configure connection and session expiration time
```yaml
# application.yml
dubbo
 registry
   address: zookeeper://localhost:2181
   timeout: 30 * 1000* # Connection timeout, default 30s
   session: 60 * 1000* # Session timeout, default 60s
```

The Zookeeper registry also supports some other control parameters, for details, see [Registry configuration item manual](../../config/properties#registry)

## 4 How it works
### 4.1 Dubbo2 node structure

![/user-guide/images/zookeeper.jpg](/imgs/user/zookeeper.jpg)

process:
* When the service provider starts: write its own URL address to the `/dubbo/com.foo.BarService/providers` directory.
* When the service consumer starts: subscribe to the provider URL address under the `/dubbo/com.foo.BarService/providers` directory. And write your own URL address to `/dubbo/com.foo.BarService/consumers` directory
* When monitoring center starts: subscribe to all provider and consumer URL addresses under `/dubbo/com.foo.BarService` directory.

The following functions are supported:

* When the provider has abnormal downtime such as power failure, the registration center can automatically delete the provider information
* When the registration center restarts, the registration data and subscription requests can be automatically restored
* When the session expires, the registration data and subscription request can be automatically restored
* When `<dubbo:registry check="false" />` is set, the failed registration and subscription requests will be recorded, and the background will retry periodically
* You can set zookeeper login information through `<dubbo:registry username="admin" password="1234" />`
* The root node of zookeeper can be set through `<dubbo:registry group="dubbo" />`, if not configured, the default root node will be used.
* Support `*` wildcard `<dubbo:reference group="*" version="*" />`, you can subscribe to all groups of services and providers of all versions

### 4.2 Dubbo3 node structure