---
aliases:
    - /zh/docsv2.7/user/references/registry/zookeeper/
description: Zookeeper 注册中心参考手册
linkTitle: Zookeeper
title: Zookeeper 注册中心
type: docs
weight: 1
---



[Zookeeper](http://zookeeper.apache.org) 是 Apache Hadoop 的子项目，是一个树型的目录服务，支持变更推送，适合作为 Dubbo 服务的注册中心，工业强度较高，可用于生产环境，并推荐使用 [^1]。

![/user-guide/images/zookeeper.jpg](/imgs/user/zookeeper.jpg)

流程说明：

* 服务提供者启动时: 向 `/dubbo/com.foo.BarService/providers` 目录下写入自己的 URL 地址
* 服务消费者启动时: 订阅 `/dubbo/com.foo.BarService/providers` 目录下的提供者 URL 地址。并向 `/dubbo/com.foo.BarService/consumers` 目录下写入自己的 URL 地址
* 监控中心启动时: 订阅 `/dubbo/com.foo.BarService` 目录下的所有提供者和消费者 URL 地址。

支持以下功能：

* 当提供者出现断电等异常停机时，注册中心能自动删除提供者信息
* 当注册中心重启时，能自动恢复注册数据，以及订阅请求
* 当会话过期时，能自动恢复注册数据，以及订阅请求
* 当设置 `<dubbo:registry check="false" />` 时，记录失败注册和订阅请求，后台定时重试
* 可通过 `<dubbo:registry username="admin" password="1234" />` 设置 zookeeper 登录信息
* 可通过 `<dubbo:registry group="dubbo" />` 设置 zookeeper 的根节点，不配置将使用默认的根节点。
* 支持 `*` 号通配符 `<dubbo:reference group="*" version="*" />`，可订阅服务的所有分组和所有版本的提供者

## 使用

在 provider 和 consumer 中增加 zookeeper 客户端 jar 包依赖：

```xml
<dependency>
    <groupId>org.apache.zookeeper</groupId>
    <artifactId>zookeeper</artifactId>
    <version>3.8.0</version>
</dependency>
```

或直接[下载](https://repo1.maven.org/maven2/org/apache/zookeeper/zookeeper)。

Dubbo 支持 zkclient 和 curator 两种 Zookeeper 客户端实现：

**注意:在2.7.x的版本中已经移除了zkclient的实现,如果要使用zkclient客户端,需要自行拓展**

### 使用 zkclient 客户端

从 `2.2.0` 版本开始缺省为 zkclient 实现，以提升 zookeeper 客户端的健壮性。[zkclient](https://github.com/sgroschupf/zkclient) 是 Datameer 开源的一个 Zookeeper 客户端实现。

缺省配置：

```xml
<dubbo:registry ... client="zkclient" />
```

或：

```sh
dubbo.registry.client=zkclient
```

或：

```sh
zookeeper://10.20.153.10:2181?client=zkclient
```

需依赖或直接[下载](https://repo1.maven.org/maven2/com/github/sgroschupf/zkclient)：

```xml
<dependency>
    <groupId>com.github.sgroschupf</groupId>
    <artifactId>zkclient</artifactId>
    <version>0.11</version>
</dependency>
```


### 使用 curator 客户端

从 `2.3.0` 版本开始支持可选 curator 实现。[Curator](https://github.com/apache/curator) 是 Netflix 开源的一个 Zookeeper 客户端实现。

如果需要改为 curator 实现，请配置：

```xml
<dubbo:registry ... client="curator" />
```

或：

```sh
dubbo.registry.client=curator
```

或：

```sh
zookeeper://10.20.153.10:2181?client=curator
```

需依赖或直接下载[curator-framework](https://repo1.maven.org/maven2/org/apache/curator/curator-framework/), [curator-recipes](https://repo1.maven.org/maven2/org/apache/curator/curator-recipes/)：

```xml
<properties>
    <curator.version>5.2.1</curator.version>
</properties>

<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-framework</artifactId>
    <version>${curator.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-recipes</artifactId>
    <version>${curator.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.curator</groupId>
    <artifactId>curator-x-discovery</artifactId>
    <version>${curator.version}</version>
</dependency>
```

Zookeeper 单机配置:

```xml
<dubbo:registry address="zookeeper://10.20.153.10:2181" />
```

或：

```xml
<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181" />
```

Zookeeper 集群配置：

```xml

<dubbo:registry address="zookeeper://10.20.153.10:2181?backup=10.20.153.11:2181,10.20.153.12:2181" />
```

或：

```xml
<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181,10.20.153.11:2181,10.20.153.12:2181" />
```

同一 Zookeeper，分成多组注册中心:

```xml
<dubbo:registry id="chinaRegistry" protocol="zookeeper" address="10.20.153.10:2181" group="china" />
<dubbo:registry id="intlRegistry" protocol="zookeeper" address="10.20.153.10:2181" group="intl" />
```

## zookeeper 安装

安装方式参见: [Zookeeper安装手册](../../../../admin/install/zookeeper)，只需搭一个原生的 Zookeeper 服务器，并将 [Quick Start](../../../quick-start) 中 Provider 和 Consumer 里的 `conf/dubbo.properties` 中的 `dubbo.registry.address` 的值改为 `zookeeper://127.0.0.1:2181` 即可使用。


## 可靠性声明

阿里内部并没有采用 Zookeeper 做为注册中心，而是使用自己实现的基于数据库的注册中心，即：Zookeeper 注册中心并没有在阿里内部长时间运行的可靠性保障，此 Zookeeper 桥接实现只为开源版本提供，其可靠性依赖于 Zookeeper 本身的可靠性。

## 兼容性声明

因 `2.0.8` 最初设计的 zookeeper 存储结构不能扩充不同类型的数据，`2.0.9` 版本做了调整，所以不兼容，需全部改用 `2.0.9` 版本才行，以后的版本会保持兼容 `2.0.9`。`2.2.0` 版本改为基于 zkclient 实现，需增加 zkclient 的依赖包，`2.3.0` 版本增加了基于 curator 的实现，作为可选实现策略。

[^1]: 建议使用 `2.3.3` 以上版本的 zookeeper 注册中心客户端