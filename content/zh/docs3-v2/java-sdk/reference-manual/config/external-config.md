---
type: docs
title: "外部化配置"
linkTitle: "外部化配置"
weight: 60
description: "将Dubbo应用的配置放到外部集中管理"
---

### 外部化配置

外部化配置目的之一是实现配置的集中式管理，这部分业界已经有很多成熟的专业配置系统如 Apollo, Nacos 等，Dubbo 所做的主要是保证能配合这些系统正常工作。

外部化配置和其他本地配置在内容和格式上并无区别，可以简单理解为 `dubbo.properties` 的外部化存储，配置中心更适合将一些公共配置如注册中心、元数据中心配置等抽取以便做集中管理。

```properties
# 将注册中心地址、元数据中心地址等配置集中管理，可以做到统一环境、减少开发侧感知。
dubbo.registry.address=zookeeper://127.0.0.1:2181
dubbo.registry.simplified=true

dubbo.metadata-report.address=zookeeper://127.0.0.1:2181

dubbo.protocol.name=dubbo
dubbo.protocol.port=20880

dubbo.application.qos.port=33333
```

- 优先级

  外部化配置默认较本地配置有更高的优先级，因此这里配置的内容会覆盖本地配置值，关于 各配置形式间的[覆盖关系](../overview#覆盖关系) 有单独一章说明。

- 作用域

  外部化配置有全局和应用两个级别，全局配置是所有应用共享的，应用级配置是由每个应用自己维护且只对自身可见的。当前已支持的扩展实现有Zookeeper、Apollo、Nacos。

### 配置中心

从配置中心读取外部化配置，可以按照下面的方法指定配置中心：

```xml
<dubbo:config-center address="zookeeper://127.0.0.1:2181"/>
```

或者

```properties
dubbo.config-center.address=zookeeper://127.0.0.1:2181
```

或者

```java
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setAddress("zookeeper://127.0.0.1:2181");
```

#### Zookeeper

```xml
<dubbo:config-center address="zookeeper://127.0.0.1:2181"/>
```

默认所有的配置都存储在 `/dubbo/config` 节点，具体节点结构图如下：

![zk-configcenter.jpg](/imgs/user/zk-configcenter.jpg)

- namespace，用于不同配置的环境隔离。
- config，Dubbo约定的固定节点，不可更改，所有配置和服务治理规则都存储在此节点下。
- dubbo/application，分别用来隔离全局配置、应用级别配置：dubbo是默认group值，application对应应用名
- dubbo.properties，此节点的node value存储具体配置内容



#### Apollo

```xml
<dubbo:config-center protocol="apollo" address="127.0.0.1:2181"/>
```

Apollo中的一个核心概念是命名空间 - namespace（和上面zookeeper的namespace概念不同），在这里全局和应用级别配置就是通过命名空间来区分的。

默认情况下，Dubbo会从名叫`dubbo`（由于 Apollo 不支持特殊后缀 `.properties` ）的命名空间中读取全局配置（`<dubbo:config-center namespace="your namespace">`）

![apollo-configcenter-dubbo.png](/imgs/user/apollo-configcenter-dubbo.png)

由于 Apollo 也默认将会在 `dubbo` namespace 中存储服务治理规则（如路由规则），建议通过单独配置 `group` 将服务治理和配置文件托管分离开，以 XML 配置方式为例：
```xml
<dubbo namespace="governance" group ="dubbo"/>
```
这里，服务治理规则将存储在 governance namespace，而配置文件将存储在 dubbo namespace，如下图所示：
![apollo-configcenter-governance-dubbo.png](/imgs/user/apollo-configcenter-governance-dubbo.png)

> 关于文件配置托管，相当于是把 `dubbo.properties` 配置文件的内容存储在了 Apollo 中，应用通过关联共享的 `dubbo` namespace 继承公共配置,
>  应用也可以按照 Apollo 的做法来覆盖个别配置项。

#### Nacos
```xml
<dubbo:config-center address="nacos://127.0.0.1:8848?username=nacos&password=nacos">
</dubbo:config-center>
```

Nacos虽然也存在命名空间 - namespace 的概念，但在 namespace 之下，还存在 group 概念。即通过 namespace 和 group 以及 dataId 去定位一个配置项，在不指定 namespace 的情况下，默认使用 `public` 作为默认的命名空间。

在默认情况下，全局配置会读取 namespace : `public`，dataId: `dubbo.properties`，group: `dubbo` 配置项中的内容作为全局配置。应用级别的 group 和全局级别的 group 存在一点差异， 应用级别会读取 namespace: `public`，dataId: `dubbo.properties`，group: `your application name` 作为应用级别的配置。

全局：
![nacos-configcenter-global-properties.png](/imgs/user/nacos-configcenter-global-properties.png)

应用级别：
![nacos-configcenter-application-properties.png](/imgs/user/nacos-configcenter-application-properties.png)


### 自己加载外部化配置

所谓 Dubbo 对配置中心的支持，本质上就是把 `.properties` 从远程拉取到本地，然后和本地的配置做一次融合。理论上只要 Dubbo 框架能拿到需要的配置就可以正常的启动，它并不关心这些配置是自己加载到的还是应用直接塞给它的，所以Dubbo还提供了以下API，让用户将自己组织好的配置塞给 Dubbo 框架（配置加载的过程是用户要完成的），这样 Dubbo 框架就不再直接和 Apollo 或 Zookeeper 做读取配置交互。

```java
// 应用自行加载配置
Map<String, String> dubboConfigurations = new HashMap<>();
dubboConfigurations.put("dubbo.registry.address", "zookeeper://127.0.0.1:2181");
dubboConfigurations.put("dubbo.registry.simplified", "true");

//将组织好的配置塞给Dubbo框架
ConfigCenterConfig configCenter = new ConfigCenterConfig();
configCenter.setExternalConfig(dubboConfigurations);
```
