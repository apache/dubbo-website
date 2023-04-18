---
aliases:
    - /zh/overview/tasks/protocols/multi-protocols/
description: ""
linkTitle: 单端口多协议
title: 发布使用不同协议的多个服务，通过单端口监听
type: docs
weight: 4
---



## 特性说明
通过对protocol进行配置，dubbo3可以支持端口的协议复用。
比如使用Triple协议启动端口复用后，可以在相同的端口上为服务增加
Dubbo协议支持，以及Qos协议支持。这些协议的识别都是由一个统一的端口复用
服务器进行处理的，可以用于服务的协议迁移，并且可以节约端口以及相关的资源，减少运维的复杂性。

![pu-server-image1](/imgs/blog/pu-server/pu-server-flow.png)

- 在服务的创建阶段，通过从Config层获取到服务导出的协议配置从而创建不同的Protocol对象进行导出。在导出的过程
中，如果不是第一次创建端口复用的Server，那么Exchanger会将Protcol层传递的数据保存到Server，用于后续处理该协议类型的消息。

- 当客户端的消息传递过来后，首先会通过Server传递给ProtocolDetector，如果完成了识别，那么就会标记该客户端为对应的协议。并通过WireProtocol配置对应的处理逻辑，最后交给ChannelOperator完成底层的IO框架和对应的Dubbo框架的处理逻辑的绑定。

- 以上的协议识别完成之后，Channel已经确定了如何处理远程的客户端消息，通过对应的ServerPipeline进行处理即可（在处理的过程中也会根据配置信息决定消息的处理线程）。

## 使用方式
在同一主机上部署多个服务或需要通过负载均衡器访问多个服务。

## 参考用例
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-port-unification](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-port-unification)


## 配置方式

关于Dubbo支持的配置方式，可以参考[配置说明](/zh-cn/overview/mannual/java-sdk/reference-manual/config/)

### 服务多协议导出

ext-protocol参数支持配置多个不同的协议，协议之间通过","进行分隔。

#### xml 配置

```xml
<dubbo:protocol name="dubbo" port="-1" ext-protocol="tri,"/>

<bean id="greetingService" class="org.apache.dubbo.demo.provider.GreetingServiceImpl"/>

<dubbo:service delay="5000" version="1.0.0" group="greeting" timeout="5000" interface="org.apache.dubbo.demo.GreetingService" ref="greetingService" protocol="dubbo"/>

```

#### API 配置

```java
ProtocolConfig config = new ProtocolConfig(CommonConstants.TRIPLE, -1);

config.setExtProtocol(CommonConstants.DUBBO+",");
```

#### yaml 配置

``` yaml
dubbo:
  application:
    name: dubbo-springboot-demo-provider
  protocol:
    name: tri
    port: -1
    ext-protocol: dubbo,
```

#### properties 配置
```properties
dubbo.protocol.name=tri
dubbo.protocol.ext-protocol=dubbo,
dubbo.protocol.port=20880
```

### Qos接入

#### Qos模块导入

```xml
<dependency>
    <groupId>org.apache.dubbo</groupId>
    <artifactId>dubbo-qos</artifactId>
</dependency>
```

完成Qos模块的导入之后，相关的配置项可参考[Qos操作手册](/zh-cn/overview/mannual/java-sdk/reference-manual/qos/overview/)进行配置。

默认情况下，基于端口复用的Qos服务在模块导入后是启动的。

## 使用方式

### Qos使用

将Qos协议接入到端口复用的场景下，需要在建立连接之后，客户端先向服务端发送消息，对比将Qos协议通过单个端口提供服务，端口复用版的Qos协议在处理telnet连接的情况下需要用户执行一些操作，完成协议识别（二选一）。

1. 直接调用命令

    直接调用telnet支持的命令也可以完成识别，在用户不熟悉的情况下可以调用help指令完成识别

    ![pu-server-image2](/imgs/blog/pu-server/qos-telnet-directcall.png)

2. 发送telnet命令识别

   通过telnet命令建立连接之后，执行以下几个步骤：

   1. 使用 crtl + "]" 进入到telnet交互界面(telnet默认的escape character)
   2. 调用 "send ayt" 向服务端发送特殊识别字段(为telnet协议的一个特殊字段)
   3. 回车完成消息发送并进入到dubbo的交互界面

   ![pu-server-imgs3](/imgs/blog/pu-server/qos-telnet-sendayt.png)


### 服务引用

以[dubbo-samples-port-unification](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-port-unification)中的例子作为基础, 引用不同协议的服务和非端口复用情况下的配置是一致的，下面通过Consumer端的InvokerListener输出调用过程中的URL信息。

```java
ReferenceConfig<GreetingService> reference = new ReferenceConfig<>();
reference.setInterface(GreetingService.class);
reference.setListener("consumer");
reference.setProtocol(this.protocol);
// reference.setProtocol(CommonConstants.DUBBO);
// reference.setProtocol(CommonConstants.TRIPLE);
```

![pu-server-imgs4](/imgs/blog/pu-server/reference-service.png)
