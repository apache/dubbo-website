---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/registry/multiple-registry/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/registry/multiple-registry/
description: 本文介绍了 Dubbo 的多注册中心支持及使用场景，如何通过多注册/多订阅实现跨区域服务部署、服务迁移等，也描述了同机房有限等跨机房流量调度的实现方式。
linkTitle: 多注册中心
title: 多注册中心
type: docs
weight: 6
---






## 1 关联服务与多注册中心

### 1.1 全局默认注册中心

Dubbo 注册中心和服务是独立配置的，通常开发者不用设置服务和注册中心组件之间的关联关系，Dubbo 框架会将自动执行以下动作：
* 对于所有的 Service 服务，向所有全局默认注册中心注册服务地址。
* 对于所有的 Reference 服务，从所有全局默认注册中心订阅服务地址。

```yml
# application.yml (Spring Boot)
dubbo
 registries
  beijingRegistry
   address: zookeeper://localhost:2181
  shanghaiRegistry
   address: zookeeper://localhost:2182
```

```java
@DubboService
public class DemoServiceImpl implements DemoService {}

@DubboService
public class HelloServiceImpl implements HelloService {}
```

以上以 Spring Boot 开发为例（XML、API 方式类似）配置了两个全局默认注册中心 beijingRegistry 和 shanghaiRegistry，服务 DemoService 与 HelloService 会分别注册到两个默认注册中心。

除了上面讲到的框架自动为服务设置全局注册中心之外，有两种方式可以灵活调整服务与多注册中心间的关联。

### 1.2 设置全局默认注册中心
```yml
# application.yml (Spring Boot)
dubbo
 registries
  beijingRegistry
   address: zookeeper://localhost:2181
   default: true
  shanghaiRegistry
   address: zookeeper://localhost:2182
   default: false
```

`default` 用来设置全局默认注册中心，默认值为 `true` 即被视作全局注册中心。未指定注册中心 id 的服务将自动注册或订阅全局默认注册中心。

### 1.3 显示关联服务与注册中心

通过在 Dubbo 服务定义组件上增加 registry 配置，将服务与注册中心关联起来。

```java
@DubboServiceregistry = {"beijingRegistry"}
public class DemoServiceImpl implements DemoService {}

@DubboServiceregistry = {"shanghaiRegistry"}
public class HelloServiceImpl implements HelloService {}
```

增加以上配置后，DemoService 将只注册到 beijingRegistry，而 HelloService 将注册到 shanghaiRegistry。

## 2 多注册中心订阅

服务订阅由于涉及到地址聚合和路由选址，因此逻辑会更加复杂一些。从单个服务订阅的视角，如果存在多注册中心订阅的情况，则可以根据注册中心间的地址是否聚合分为两种场景。

### 2.1 多注册中心地址不聚合

```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" />
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" />
```

如以上所示独立配置的注册中心组件，地址列表在消费端默认是完全隔离的，负载均衡选址要经过两步：
1. 注册中心集群间选址，选定一个集群
2. 注册中心集群内选址，在集群内进行地址筛选

![multi-registris-no-aggregation](/imgs/v3/registry/no-aggregation.png)

下面我们着重分析下如何控制 **注册中心集群间选址**，可选的策略有如下几种
**随机**
每次请求都随机的分配到一个注册中心集群

> 随机的过程中会有可用性检查，即每个集群要确保至少有一个地址可用才有可能被选到。

**preferred 优先**
```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" preferred="true"/>
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" />
```
如果有注册中心集群配置了 `preferred="true"`，则所有流量都会被路由到这个集群。

**weighted**
```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" weight="100"/>
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" weight="10" />
```

基于权重的随机负载均衡，以上集群间会有大概 10:1 的流量分布。

**同 zone 优先**
```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" zone="hangzhou" />
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" zone="qingdao" />
```

```java
RpcContext.getContext().setAttachment("registry_zone", "qingdao");
```

根据 Invocation 中带的流量参数或者在当前节点通过 context 上下文设置的参数，流量会被精确的引导到对应的集群。

### 2.2 多注册中心地址聚合
```xml
<dubbo:registry address="multiple://127.0.0.1:2181?separator=;&reference-registry=zookeeper://address11?backup=address12,address13;zookeeper://address21?backup=address22,address23" />
```

这里增加了一个特殊的 multiple 协议开头的注册中心，其中：
* `multiple://127.0.0.1:2181` 并没有什么具体含义，只是一个特定格式的占位符，地址可以随意指定
* `reference-registry` 指定了要聚合的注册中心集群的列表，示例中有两个集群，分别是 `zookeeper://address11?backup=address12,address13` 和 `zookeeper://address21?backup=address22,address23`，其中还特别指定了集群分隔符 `separator=";"`

如下图所示，不同注册中心集群的地址会被聚合到一个地址池后在消费端做负载均衡或路由选址。

![multi-registris-aggregation](/imgs/v3/registry/aggregation.png)

在 3.1.0 版本及之后，还支持每个注册中心集群上设置特定的 attachments 属性，以实现对该注册中心集群下的地址做特定标记，后续配合 Router 组件扩展如 TagRouter 等就可以实现跨机房间的流量治理能力。

```xml
<dubbo:registry address="multiple://127.0.0.1:2181?separator=;&reference-registry=zookeeper://address11?attachments=zone=hangzhou,tag=middleware;zookeeper://address21" />
```

增加 `attachments=zone=hangzhou,tag=middleware` 后，所有来自该注册中心的 URL 地址将自动携带 `zone` 和 `tag` 两个标识，方便消费端更灵活的做流量治理。

## 3 场景示例

### 3.1 场景一：跨区域注册服务

比如：中文站有些服务来不及在青岛部署，只在杭州部署，而青岛的其它应用需要引用此服务，就可以将服务同时注册到两个注册中心。

```xml
<dubbo:registry id="hangzhouRegistry" address="10.20.141.150:9090" />
<dubbo:registry id="qingdaoRegistry" address="10.20.141.151:9010" default="false" />
<!-- 向多个注册中心注册 -->
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" registry="hangzhouRegistry,qingdaoRegistry" />
```

### 3.2 场景二：根据业务实现隔离

CRM 有些服务是专门为国际站设计的，有些服务是专门为中文站设计的。

```xml
<!-- 多注册中心配置 -->
<dubbo:registry id="chinaRegistry" address="10.20.141.150:9090" />
<dubbo:registry id="intlRegistry" address="10.20.154.177:9010" default="false" />
<!-- 向中文站注册中心注册 -->
<dubbo:service interface="com.alibaba.hello.api.HelloService" version="1.0.0" ref="helloService" registry="chinaRegistry" />
<!-- 向国际站注册中心注册 -->
<dubbo:service interface="com.alibaba.hello.api.DemoService" version="1.0.0" ref="demoService" registry="intlRegistry" />
```

### 3.3 场景三：根据业务调用服务

CRM 需同时调用中文站和国际站的 PC2 服务，PC2 在中文站和国际站均有部署，接口及版本号都一样，但连的数据库不一样。

```xml
<!-- 多注册中心配置 -->
<dubbo:registry id="chinaRegistry" address="10.20.141.150:9090" />
<dubbo:registry id="intlRegistry" address="10.20.154.177:9010" default="false" />
<!-- 引用中文站服务 -->
<dubbo:reference id="chinaHelloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" registry="chinaRegistry" />
<!-- 引用国际站站服务 -->
<dubbo:reference id="intlHelloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" registry="intlRegistry" />
```

如果只是测试环境临时需要连接两个不同注册中心，使用竖号分隔多个不同注册中心地址：

```xml
<!-- 多注册中心配置，竖号分隔表示同时连接多个不同注册中心，同一注册中心的多个集群地址用逗号分隔 -->
<dubbo:registry address="10.20.141.150:9090|10.20.154.177:9010" />
<!-- 引用服务 -->
<dubbo:reference id="helloService" interface="com.alibaba.hello.api.HelloService" version="1.0.0" />
```