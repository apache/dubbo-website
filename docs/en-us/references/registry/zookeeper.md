# Zookeeper Registry Server

[Zookeeper](http://zookeeper.apache.org) is the child project of apache hadoop. Since it offers tree-like directory service and supports change notification, it's suitable to use it as dubbo's registry server. It's a field-proven product, therefore it's recommended to use it in the production environment. [^1]

![/user-guide/images/zookeeper.jpg](../../sources/images/zookeeper.jpg)

Description on registration procedure:

* When service provider boots up: write service URL address under directory `/dubbo/com.foo.BarService/providers`
* When service consumer boots up: subscribe to `/dubbo/com.foo.BarService/providers` for provider's URL addresses. At the same time, write consumer's URL address under `/dubbo/com.foo.BarService/providers`.
* When monitor center boots up: subscribe to `/dubbo/com.foo.BarService` for the URL addresses from all providers and consumers.

The following abilities are supported:
* When provider stops by accident, registry server can remove its info automatically.
* When registry server reboots, all registration data and subscription requests can be recovered automatically.
* When session is expired, all registration data and subscription requests can be recovered automatically.
* When `<dubbo:registry check="false" />` is configured, failed requests for subscription and registration will be recorded and kept retrying in the background.
* Configure `<dubbo:registry username="admin" password="1234" />` for zookeeper login.
* Configure `<dubbo:registry group="dubbo" />` for dubbo's root node on zookeeper. Default root node will be used if it's not specified.
* Support to use wildcard `*` in `<dubbo:reference group="*" version="*" />` in order to subscribe all groups and all versions for the services to be referenced.

## How to Use

Add zookeeper client dependency in both provider and consumer:

```xml
<dependency>
    <groupId>org.apache.zookeeper</groupId>
    <artifactId>zookeeper</artifactId>
    <version>3.3.3</version>
</dependency>
```

Or [download](http://repo1.maven.org/maven2/org/apache/zookeeper/zookeeper) directly from apache.

Dubbo supports two zookeeper clients: zkclient and curator:

### Use zkclient

Since `2.2.0` dubbo uses zkclient by default, in order to improve the robustness. [zkclient](https://github.com/sgroschupf/zkclient) is a zookeeper client implementation open-sourced by Datameer.

Default configuration:

```xml
<dubbo:registry ... client="zkclient" />
```

Or:

```sh
dubbo.registry.client=zkclient
```

Or:

```sh
zookeeper://10.20.153.10:2181?client=zkclient
```

In order to use it, need to explicitly declare the following maven dependency or [download its client](http://repo1.maven.org/maven2/com/github/sgroschupf/zkclient).

```xml
<dependency>
    <groupId>com.github.sgroschupf</groupId>
    <artifactId>zkclient</artifactId>
    <version>0.1</version>
</dependency>
```

### Use curator

Since `2.3.0` dubbo also supports curator but explicit configuration is required. [Curator](https://github.com/Netflix/curator) is the zookeeper client open-sourced by Netflix.

In order to switch to curator, use the configuration below:

```xml
<dubbo:registry ... client="curator" />
```

Or:

```sh
dubbo.registry.client=curator
```

Or:

```sh
zookeeper://10.20.153.10:2181?client=curator
```

Also need to explicitly add maven dependency or directly [download](http://repo1.maven.org/maven2/com/netflix/curator/curator-framework) the jar:

```xml
<dependency>
    <groupId>com.netflix.curator</groupId>
    <artifactId>curator-framework</artifactId>
    <version>1.1.10</version>
</dependency>
```

Zookeeper single node configuration:

```xml
<dubbo:registry address="zookeeper://10.20.153.10:2181" />
```

Or:

```xml
<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181" />
```

Zookeeper cluster configuration：

```xml

<dubbo:registry address="zookeeper://10.20.153.10:2181?backup=10.20.153.11:2181,10.20.153.12:2181" />
```

Or:

```xml
<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181,10.20.153.11:2181,10.20.153.12:2181" />
```

Configure single zookeeper to serve as multiple registry servers:

```xml
<dubbo:registry id="chinaRegistry" protocol="zookeeper" address="10.20.153.10:2181" group="china" />
<dubbo:registry id="intlRegistry" protocol="zookeeper" address="10.20.153.10:2181" group="intl" />
```

## Zookeeper Installation

Pls. refer to [zookeeper install manual](http://dubbo.apache.org/books/dubbo-admin-book/install/zookeeper.html) for how to install zookeeper based registry server. To set it up, specify `dubbo.registry.address` to `zookeeper://127.0.0.1:2181` in `conf/dubbo.properties` for both provider and consumer (you can refer to [quick start](../../preface/usage.md)) after install a zookeeper server.

## Declaration of Reliability

A home-brewed service registry server is used in Alibaba instead of zookeeper server. Zookeeper based registry center does not have long-run practice within Alibaba, therefore we cannot guarantee its reliability. Zookeeper registry server is provided for dubbo community, and its reliability relies on zookeeper itself largely.

## Declaration of Compatibility

The original designed data structure for zookeeper in `2.0.8` has the limitation that data type cannot extended, it's redesigned in `2.0.9`. But at the same time incompatibility is introduced, thereby `2.0.9` is required for all service providers and service consumers. 

Since `2.2.0` zkclient is used by default, therefore its dependency is needed.

Since `2.3.0` curator is supported as alternative option.

[^1]: Suggest to use `2.3.3` or above for zookeeper registry client
