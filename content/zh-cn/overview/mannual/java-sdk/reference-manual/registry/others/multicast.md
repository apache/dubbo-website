---
aliases:
    - /zh/docs3-v2/java-sdk/reference-manual/registry/multicast/
    - /zh-cn/docs3-v2/java-sdk/reference-manual/registry/multicast/
    - /zh-cn/overview/mannual/java-sdk/reference-manual/registry/multicast/
description: Multicast 广播注册中心（限开发阶段使用）。
linkTitle: Multicast
title: Multicast
type: docs
weight: 4
---






Multicast 注册中心不需要启动任何中心节点，只要广播地址一样，就可以互相发现。

![/user-guide/images/multicast.jpg](/imgs/user/multicast.jpg)

## 1 使用说明

```xml
<dubbo:registry address="multicast://224.5.6.7:1234" />
```

或

```xml
<dubbo:registry protocol="multicast" address="224.5.6.7:1234" />
```
#### 注意:
为了减少广播量，Dubbo 缺省使用单播发送提供者地址信息给消费者。
如果一个机器上同时启了多个消费者进程，消费者需声明 `unicast=false`，否则只会有一个消费者能收到消息; 当服务者和消费者运行在同一台机器上，消费者同样需要声明`unicast=false`，否则消费者无法收到消息，导致No provider available for the service异常：

```xml
<dubbo:application name="demo-consumer">
    <dubbo:parameter key="unicast" value="false" />
</dubbo:application>
```

或

```xml
<dubbo:consumer>
    <dubbo:parameter key="unicast" value="false" />
</dubbo:consumer>
```


## 2 工作原理

### 2.1 基本流程
0.  提供方启动时广播自己的地址
1.  消费方启动时广播订阅请求
2.  提供方收到订阅请求时，单播自己的地址给订阅者，如果设置了  `unicast=false`，则广播给订阅者
3.  消费方收到提供方地址时，连接该地址进行 RPC 调用。

### 2.2 使用限制
组播受网络结构限制，只适合小规模应用或开发阶段使用。组播地址段: 224.0.0.0 - 239.255.255.255
