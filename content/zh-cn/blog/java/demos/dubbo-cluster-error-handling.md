---
title: "Dubbo 集群容错"
linkTitle: "Dubbo 集群容错"
tags: ["Java"]
date: 2018-08-22
description: >
    在分布式系统中，集群某个某些节点出现问题是大概率事件，因此在设计分布式RPC框架的过程中，必须要把失败作为设计的一等公民来对待。一次调用失败之后，应该如何选择对失败的选择策略，这是一个见仁见智的问题，每种策略可能都有自己独特的应用场景。因此，作为框架来说，应当针对不同场景提供多种策略，供用户进行选择。本文介绍了Dubbo框架提供的多种错误处理策略，并通过实例说明如何进行配置。
---


### Design For failure

在分布式系统中，集群某个某些节点出现问题是大概率事件，因此在设计分布式RPC框架的过程中，必须要把失败作为设计的一等公民来对待。一次调用失败之后，应该如何选择对失败的选择策略，这是一个见仁见智的问题，每种策略可能都有自己独特的应用场景。因此，作为框架来说，应当针对不同场景提供多种策略，供用户进行选择。

在Dubbo设计中，通过Cluster这个接口的抽象，把一组可供调用的Provider信息组合成为一个统一的`Invoker`供调用方进行调用。经过路由规则过滤，负载均衡选址后，选中一个具体地址进行调用，如果调用失败，则会按照集群配置的容错策略进行容错处理。

Dubbo默认内置了若干容错策略，如果不能满足用户需求，则可以通过自定义容错策略进行配置。

### 内置容错策略

Dubbo主要内置了如下几种策略：

* Failover(失败自动切换)
* Failsafe(失败安全)
* Failfast(快速失败)
* Failback(失败自动恢复)
* Forking(并行调用)
* Broadcast(广播调用)

这些名称比较相似，概念也比较容易混淆，下面逐一进行解释。

#### Failover(失败自动切换)

`Failover`是高可用系统中的一个常用概念，服务器通常拥有主备两套机器配置，如果主服务器出现故障，则自动切换到备服务器中，从而保证了整体的高可用性。

Dubbo也借鉴了这个思想，并且把它作为Dubbo`默认的容错策略`。当调用出现失败的时候，根据配置的重试次数，会自动从其他可用地址中重新选择一个可用的地址进行调用，直到调用成功，或者是达到重试的上限位置。

Dubbo里默认配置的重试次数是2，也就是说，算上第一次调用，最多会调用3次。



其配置方法，容错策略既可以在服务提供方配置，也可以服务调用方进行配置。而重试次数的配置则更为灵活，既可以在服务级别进行配置，也可以在方法级别进行配置。具体优先顺序为：

```
服务调用方方法级配置 > 服务调用方服务级配置 > 服务提供方方法级配置 > 服务提供方服务级配置
```

以XML方式为例，具体配置方法如下：

服务提供方，服务级配置

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="failover" retries="2" />
```

服务提供方，方法级配置

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService"cluster="failover">
     <dubbo:method name="sayHello" retries="2" />
 </dubbo:reference>
```

服务调用方，服务级配置

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="failover" retries="1"/>
```

服务调用方，方法级配置：

```xml
 <dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="failover">
     <dubbo:method name="sayHello" retries="3" />
 </dubbo:reference>
```

Failover可以自动对失败进行重试，对调用者屏蔽了失败的细节，但是Failover策略也会带来一些副作用：

* 重试会额外增加一下开销，例如增加资源的使用，在高负载系统下，额外的重试可能让系统雪上加霜。
* 重试会增加调用的响应时间。
* 某些情况下，重试甚至会造成资源的浪费。考虑一个调用场景，A->B->C，如果A处设置了超时100ms，再B->C的第一次调用完成时已经超过了100ms，但很不幸B->C失败，这时候会进行重试，但其实这时候重试已经没有意义，因此在A看来这次调用已经超时，A可能已经开始执行其他逻辑。

#### Failsafe(失败安全)

失败安全策略的核心是即使失败了也不会影响整个调用流程。通常情况下用于旁路系统或流程中，它的失败不影响核心业务的正确性。在实现上，当出现调用失败时，会忽略此错误，并记录一条日志，同时返回一个空结果，在上游看来调用是成功的。

应用场景，可以用于写入审计日志等操作。

具体配置方法：

服务提供方，服务级配置

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="failsafe" />
```

服务调用方，服务级配置

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="failsafe"/>
```

其中服务调用方配置优先于服务提供方配置。

#### Failfast(快速失败)

某些业务场景中，某些操作可能是非幂等的，如果重复发起调用，可能会导致出现脏数据等。例如调用某个服务，其中包含一个数据库的写操作，如果写操作完成，但是在发送结果给调用方的过程中出错了，那么在调用发看来这次调用失败了，但其实数据写入已经完成。这种情况下，重试可能并不是一个好策略，这时候就需要使用到`Failfast`策略，调用失败立即报错。让调用方来决定下一步的操作并保证业务的幂等性。

具体配置方法：

服务提供方，服务级配置

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="failfast" />
```

服务调用方，服务级配置

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="failfast"/>
```

其中服务调用方配置优先于服务提供方配置。

#### Failback(失败自动恢复)

`Failback`通常和`Failover`两个概念联系在一起。在高可用系统中，当主机发生故障，通过`Failover`进行主备切换后，待故障恢复后，系统应该具备自动恢复原始配置的能力。

Dubbo中的`Failback`策略中，如果调用失败，则此次失败相当于`Failsafe`，将返回一个空结果。而与`Failsafe`不同的是，Failback策略会将这次调用加入内存中的失败列表中，对于这个列表中的失败调用，会在另一个线程中进行异步重试，重试如果再发生失败，则会忽略，即使重试调用成功，原来的调用方也感知不到了。因此它通常适合于，对于实时性要求不高，且不需要返回值的一些异步操作。

具体配置方法：

服务提供方，服务级配置

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="failsafe" />
```

服务调用方，服务级配置

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="failsafe"/>
```

其中服务调用方配置优先于服务提供方配置。

按照目前的实现，Failback策略还有一些局限，例如内存中的失败调用列表没有上限，可能导致堆积，异步重试的执行间隔无法调整，默认是5秒。

#### Forking(并行调用)

上述几种策略中，主要都是针对调用失败发生后如何进行弥补的角度去考虑的，而`Forking`策略则跟上述几种策略不同，是一种典型的用成本换时间的思路。即第一次调用的时候就同时发起多个调用，只要其中一个调用成功，就认为成功。在资源充足，且对于失败的容忍度较低的场景下，可以采用此策略。

具体配置方法：

服务提供方，服务级配置

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="forking" />
```

服务调用方，服务级配置

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="forking"/>
```

其中服务调用方配置优先于服务提供方配置。

#### Broadcast(广播调用)

在某些场景下，可能需要对服务的所有提供者进行操作，此时可以使用广播调用策略。此策略会逐个调用所有提供者，只要任意有一个提供者出错，则认为此次调用出错。通常用于通知所有提供者更新缓存或日志等本地资源信息。

具体配置方法：

服务提供方，服务级配置

```xml
<dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService" cluster="broadcast" />
```

服务调用方，服务级配置

```xml
<dubbo:reference id="demoService" interface="org.apache.dubbo.demo.DemoService" cluster="broadcast"/>
```

其中服务调用方配置优先于服务提供方配置。

#### 各种策略对比

下表对各种策略做一个简单对比，

| 策略名称  | 优点                             | 缺点                                   | 主要应用场景                                         |
| --------- | -------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| Failover  | 对调用者屏蔽调用失败的信息       | 增加RT，额外资源开销，资源浪费         | 对调用rt不敏感的场景                                 |
| Failfast  | 业务快速感知失败状态进行自主决策 | 产生较多报错的信息                     | 非幂等性操作，需要快速感知失败的场景                 |
| Failsafe  | 即使失败了也不会影响核心流程     | 对于失败的信息不敏感，需要额外的监控   | 旁路系统，失败不影响核心流程正确性的场景             |
| Failback  | 失败自动异步重试                 | 重试任务可能堆积                       | 对于实时性要求不高，且不需要返回值的一些异步操作     |
| Forking   | 并行发起多个调用，降低失败概率   | 消耗额外的机器资源，需要确保操作幂等性 | 资源充足，且对于失败的容忍度较低，实时性要求高的场景 |
| Broadcast | 支持对所有的服务提供者进行操作   | 资源消耗很大                           | 通知所有提供者更新缓存或日志等本地资源信息           |

### 自定义容错策略

如果上述内置的容错策略无法满足你的需求，还可以通过扩展的方式来实现自定义容错策略。

#### 扩展接口

`com.alibaba.dubbo.rpc.cluster.Cluster`

#### 扩展配置

```xml
<dubbo:service cluster="xxx" />
```

#### 扩展示例

下面通过一个例子来展示如何使用自定义的容错策略。
Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxCluster.java (实现Cluster接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.cluster.Cluster (纯文本文件，内容为：xxx=com.xxx.XxxCluster)
```

XxxCluster.java：

```java
package com.xxx;
 
import org.apache.dubbo.rpc.cluster.Cluster;
import org.apache.dubbo.rpc.cluster.support.AbstractClusterInvoker;
import org.apache.dubbo.rpc.cluster.Directory;
import org.apache.dubbo.rpc.cluster.LoadBalance;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Result;
import org.apache.dubbo.rpc.RpcException;

import java.util.List;

public class XxxCluster implements Cluster {

    @Override
    public <T> Invoker<T> join(Directory<T> directory) throws RpcException {
        return new AbstractClusterInvoker<T>() {
            @Override
            protected Result doInvoke(Invocation invocation, List<Invoker<T>> invokers, LoadBalance loadbalance) throws RpcException {
                // your custimzed fault tolarence strategy goes here
            }
        };
    }

}
```

`META-INF/dubbo/com.alibaba.dubbo.rpc.cluster.Cluster`文件的内容为

```
xxx=com.xxx.XxxCluster
```



