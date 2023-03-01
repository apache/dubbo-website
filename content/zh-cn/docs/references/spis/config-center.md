---
aliases:
    - /zh/docs/references/spis/config-center/
description: 配置中心扩展
linkTitle: 配置中心扩展
title: 配置中心扩展
type: docs
weight: 13
---



{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn/overview/mannual/java-sdk/reference-manual/spi/description/config-center/)。
{{% /pageinfo %}}

## 设计目的

配置中心的核心功能是作为 Key-Value 存储，Dubbo 框架告知配置中心其关心的 key，配置中心返回该key对应的 value 值。

按照应用场景划分，配置中心在 Dubbo 框架中主要承担以下职责：

- 作为外部化配置中心，即存储 dubbo.properties 配置文件，此时，key 值通常为文件名如 dubbo.properties，value 则为配置文件内容。
- 存储单个配置项，如各种开关项、常量值等。
- 存储服务治理规则，此时key通常按照 "服务名+规则类型" 的格式来组织，而 value 则为具体的治理规则。

为了进一步实现对 key-value 的分组管理，Dubbo 的配置中心还加入了 namespace、group 的概念，这些概念在很多专业的第三方配置中心中都有体现，通常情况下，namespace 用来隔离不同的租户，group 用来对同一租户的key集合做分组。

当前，Dubbo 配置中心实现了对 Zookeeper、Nacos、Etcd、Consul、Apollo 的对接，接下来我们具体看一下 Dubbo 抽象的配置中心是怎么映射到具体的第三方实现中的。

## 扩展接口

* `org.apache.dubbo.configcenter.DynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.DynamicConfiguration`

## 已知扩展

* `org.apache.dubbo.configcenter.support.zookeeper.ZookeeperDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.support.nacos.NacosDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.support.etcd.EtcdDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.consul.ConsulDynamicConfigurationFactory`
* `org.apache.dubbo.configcenter.support.apollo.ApolloDynamicConfigurationFactory`
* `org.apache.dubbo.common.config.configcenter.file.FileSystemDynamicConfigurationFactory`

## 实现原理

### Zookeeper

zookeeper提供了一个树状的存储模型，其实现原理如下：

![image-20190127225608553](/imgs/dev/configcenter_zk_model.jpg)

namespace, group, key 等分别对应不同层级的 ZNode 节点，而 value 则作为根 ZNode 节点的值存储。

1. 外部化配置中心 dubbo.properties

   ![image-20190127225608553](/imgs/dev/configcenter_zk_properties.jpg)
   
   上图展示了两个不同作用域的 dubbo.properties 文件在 zookeeper 中的存储结构：
   - 命名空间namespace都为：dubbo
   - 分组 group：全局级别为 dubbo，所有应用共享；应用级别为应用名 demo-provider，只对该应用生效
   - key：dubbo.properties
   
2. 单个配置项

   ![image-20190127225608553](/imgs/dev/configcenter_zk_singleitem.jpg)
   
   设置优雅停机事件为15000：
   - 命名空间 namespace：dubbo
   - 分组 group：dubbo
   - key：dubbo.service.shutdown.wait
   - value：15000
     
3. 服务治理规则

    ![image-20190127225608553](/imgs/dev/configcenter_zk_rule.jpg)
    
    上图展示了一条应用级别的条件路由规则：
    
    - 命名空间 namespace：dubbo
    - 分组 group：dubbo
    - key：governance-conditionrouter-consumer.condition-router，其中 governance-conditionrouter-consumer 为应用名，condition-router 代表条件路由
    
    
    > 注意:
    >
    > Dubbo同时支持应用、服务两种粒度的服务治理规则，对于这两种粒度，其key取值规则如下：
    > * 应用粒度 {应用名 + 规则后缀}。如: `demo-application.configurators`、`demo-application.tag-router`等
    > * 服务粒度 {服务接口名:[服务版本]:[服务分组] + 规则后缀}，其中服务版本、服务分组是可选的，如果它们有配置则在key中体现，没被配置则用":"占位。如
    > `org.apache.dubbo.demo.DemoService::.configurators`、`org.apache.dubbo.demo.DemoService:1.0.0:group1.configurators`

### Etcd & Consul

Etcd 和 Consul 本质上也是一种类似 zookeeper 的树状存储结构，实现请参考 zookeeper。

### Nacos

[Nacos](https://nacos.io/) 作为一个专业的第三方配置中心，拥有专门为配置中心设计的存储结构，包括内置的 namespace、group、dataid 等概念。并且这几个概念基本上与 Dubbo 框架抽象的配置中心是一一对应的。

与 Zookeeper 实现的对应关系如下：

![image-20190127225608553](/imgs/dev/configcenter_nacos_model.jpg)

参考上文关于 zookeeper 实现中描述的示例，这里的 dataid 可能为：
* 外部化配置中心：dubbo.properties
* 单个配置项：dubbo.service.shutdown.wait
* 服务治理规则：org.apache.dubbo.demo.DemoService:1.0.0:group1.configurators

### Apollo

Apollo 与 Nacos 类似，请参考动态配置中心使用文档中关于 Apollo 部分的描述。
