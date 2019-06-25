# Dubbo配置中心

## 设计目的
配置中心的核心功能是作为Key-Value存储，Dubbo框架告知配置中心其关心的key，配置中心返回该key对应的value值。

按照应用场景划分，配置中心在Dubbo框架中主要承担以下职责：

- 作为外部化配置中心，即存储dubbo.properties配置文件，此时，key值通常为文件名如dubbo.properties，value则为配置文件内容。
- 存储单个配置项，如各种开关项、常量值等。
- 存储服务治理规则，此时key通常按照"服务名+规则类型"的格式来组织，而value则为具体的治理规则。

为了进一步实现对key-value的分组管理，Dubbo的配置中心还加入了namespace、group的概念，这些概念在很多专业的第三方配置中心中都有体现，通常情况下，namespace用来隔离不同的租户，group用来对统一租户的key集合做分组。

当前，Dubbo配置中心实现了对Zookeeper、Nacos、Etcd、Consul、Apollo的对接，接下来我们具体看一下Dubbo抽象的配置中心是怎么映射到具体的第三方实现中的。

## 实现原理

### Zookeeper

zookeeper提供了一个树状的存储模型，其实现原理如下：
![image-20190127225608553](/img/configcenter_zk_model.jpg)

1. 外部化配置中心 dubbo.properties
   ![image-20190127225608553](/img/configcenter_zk_properties.jpg)
   
   上图展示了两个不同作用域的dubbo.properties文件在zookeeper中的存储结构：
   - 命名空间namespace都为：dubbo
   - 分组group：全局级别为dubbo，所有应用共享；应用级别为应用名demo-provider，只对改应用生效
   - key：dubbo.properties
   
2. 单个配置项
   ![image-20190127225608553](/img/configcenter_zk_singleitem.jpg)
   
   设置优雅停机事件为15000：
   - 命名空间namespace：dubbo
   - 分组group：dubbo
   - key：dubbo.service.shutdown.wait=15000
     
3. 服务治理规则
    ![image-20190127225608553](/img/configcenter_zk_rule.jpg)
    
    上图展示了一条应用级别的条件路由规则：
    
    - 命名空间namespace：dubbo
    - 分组group：dubbo
    - key：governance-conditionrouter-consumer.condition-router，其中governance-conditionrouter-consumer为应用名，condition-router代表条件路由
    
    > 注意:
    >
    > Dubbo同时支持应用、服务两种粒度的服务治理规则，对于这两种粒度，其key值规则如下：
    > * 应用粒度 {应用名 + 规则后缀}。如: `demo-application.configurators`、`demo-application.tag-router`等
    > * 服务粒度 {服务接口名:[服务版本]:[服务分组] + 规则后缀}，其中服务版本、服务分组是可选的，如果它们有配置则在key中体现，没被配置则用":"占位。如
    > `org.apache.dubbo.demo.DemoService::.configurators`、`org.apache.dubbo.demo.DemoService:1.0.0:group1.configurators`

### Etcd & Consul

Etcd和Consul本质上也是一个类似zookeeper的树状存储结构，实现请参考zookeeper。

### Nacos

Nacos作为一个专业的第三方配置中心，拥有专门为配置中心设计的存储结构，包括内置的namespace、group、dataid等概念。并且这几个概念基本上与Dubbo框架抽象的配置中心是一一对应的。

与Zookeeper对比起来如下：
![image-20190127225608553](/img/configcenter_nacos_model.jpg)

### Apollo

Apollo与Nacos类似，请参考动态配置中心使用文档中关于Apollo部分的描述。

