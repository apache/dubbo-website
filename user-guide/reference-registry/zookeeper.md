> ![warning](../sources/images/check.gif)建议使用dubbo-2.3.3以上版本的zookeeper注册中心客户端。

> ![warning](../sources/images/check.gif)**Zookeeper说明**  
[Zookeeper](http://zookeeper.apache.org) 是Apacahe Hadoop的子项目，是一个树型的目录服务，支持变更推送，适合作为Dubbo服务的注册中心，工业强度较高，可用于生产环境，并推荐使用。

> ![warning](../sources/images/check.gif)**Zookeeper安装**  
安装方式参见: [Zookeeper安装手册](admin-guide-install-manual#zookeeper注册中心安装)，只需搭一个原生的Zookeeper 服务器，并将 [Quick Start](user-guide-quick-start#快速启动) 中Provider和Consumer里的conf/dubbo.properties中的dubbo.registry.addrss的值改为zookeeper://127.0.0.1:2181即可使用。

> ![warning](../sources/images/warning-3.gif)**可靠性声明**  
> 阿里内部并没有采用Zookeeper做为注册中心，而是使用自己实现的基于数据库的注册中心，即：Zookeeper注册中心并没有在阿里内部长时间运行的可靠性保障，此Zookeeper桥接实现只为开源版本提供，其可靠性依赖于Zookeeper本身的可靠性。

> ![warning](../sources/images/warning-3.gif)**兼容性声明**  
> 因2.0.8最初设计的zookeeper存储结构不能扩充不同类型的数据，2.0.9版本做了调整，所以不兼容，需全部改用2.0.9版本才行，以后的版本会保持兼容2.0.9。2.2.0版本改为基于zkclient实现，需增加zkclient的依赖包，2.3.0版本增加了基于curator的实现，作为可选实现策略。

![/user-guide/images/zookeeper.jpg](../sources/images/zookeeper.jpg)

##### 流程说明：

* 服务提供者启动时: 向/dubbo/com.foo.BarService/providers目录下写入自己的URL地址。
* 服务消费者启动时: 订阅/dubbo/com.foo.BarService/providers目录下的提供者URL地址。并向/dubbo/com.foo.BarService/consumers目录下写入自己的URL地址。
* 监控中心启动时: 订阅/dubbo/com.foo.BarService目录下的所有提供者和消费者URL地址。

##### 支持以下功能：

* 当提供者出现断电等异常停机时，注册中心能自动删除提供者信息。
* 当注册中心重启时，能自动恢复注册数据，以及订阅请求。
* 当会话过期时，能自动恢复注册数据，以及订阅请求。
* 当设置 `<dubbo:registry check="false" />` 时，记录失败注册和订阅请求，后台定时重试。
* 可通过 `<dubbo:registry username="admin" password="1234" />` 设置zookeeper登录信息。
* 可通过 `<dubbo:registry group="dubbo" />` 设置zookeeper的根节点，不设置将使用无根树。
* 支持 `*` 号通配符 `<dubbo:reference group="*" version="*" />`，可订阅服务的所有分组和所有版本的提供者。

在provider和consumer中增加zookeeper客户端jar包依赖：

```xml
<dependency>
    <groupId>org.apache.zookeeper</groupId>
    <artifactId>zookeeper</artifactId>
    <version>3.3.3</version>
</dependency>
```

或直接下载：http://repo1.maven.org/maven2/org/apache/zookeeper/zookeeper

支持zkclient和curator两种Zookeeper客户端实现：

##### ZKClient Zookeeper Registry

从2.2.0版本开始缺省为zkclient实现，以提升zookeeper客户端的健状性。ZKClient是Datameer开源的一个Zookeeper客户端实现，开源比较早，参见：https://github.com/sgroschupf/zkclient

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

需依赖：

```xml
<dependency>
    <groupId>com.github.sgroschupf</groupId>
    <artifactId>zkclient</artifactId>
    <version>0.1</version>
</dependency>
```

或直接下载：http://repo1.maven.org/maven2/com/github/sgroschupf/zkclient

##### Curator Zookeeper Registry

从2.3.0版本开始支持可选curator实现。[Curator](https://github.com/Netflix/curator) 是Netflix开源的一个Zookeeper客户端实现，比较活跃。

如果需要改为curator实现，请配置：

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

需依赖：

```xml
<dependency>
    <groupId>com.netflix.curator</groupId>
    <artifactId>curator-framework</artifactId>
    <version>1.1.10</version>
</dependency>
```

或直接下载：http://repo1.maven.org/maven2/com/netflix/curator/curator-framework

Zookeeper单机配置:

```xml
<dubbo:registry address="zookeeper://10.20.153.10:2181" />
```

或：

```xml
<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181" />
```

Zookeeper集群配置：

```xml

<dubbo:registry address="zookeeper://10.20.153.10:2181?backup=10.20.153.11:2181,10.20.153.12:2181" />
```

或：

```xml
<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181,10.20.153.11:2181,10.20.153.12:2181" />
```

同一Zookeeper，分成多组注册中心:

```xml
<dubbo:registry id="chinaRegistry" protocol="zookeeper" address="10.20.153.10:2181" group="china" />
<dubbo:registry id="intlRegistry" protocol="zookeeper" address="10.20.153.10:2181" group="intl" />
```
