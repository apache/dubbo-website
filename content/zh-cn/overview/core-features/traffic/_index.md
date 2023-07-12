---
aliases:
    - /zh/overview/core-features/traffic/
description: 流量管控
feature:
    description: |
        Dubbo 提供的基于路由规则的流量管控策略，可以帮助实现全链路灰度、金丝雀发布、按比例流量转发、动态调整调试时间、设置重试次数等服务治理能力。
    title: 流量管控
linkTitle: 流量管控
no_list: true
title: 流量管控
type: docs
weight: 4
---



Dubbo 提供了丰富的流量管控策略
* **地址发现与负载均衡**，地址发现支持服务实例动态上下线，负载均衡确保流量均匀的分布到每个实例上。
* **基于路由规则的流量管控**，路由规则对每次请求进行条件匹配，并将符合条件的请求路由到特定的地址子集。

服务发现保证调用方看到最新的提供方实例地址，服务发现机制依赖注册中心 (Zookeeper、Nacos、Istio 等) 实现。在消费端，Dubbo 提供了多种负载均衡策略，如随机负载均衡策略、一致性哈希负载、基于权重的轮询、最小活跃度优先、P2C 等。

Dubbo 的流量管控规则可以基于应用、服务、方法、参数等粒度精准的控制流量走向，根据请求的目标服务、方法以及请求体中的其他附加参数进行匹配，符合匹配条件的流量会进一步的按照特定规则转发到一个地址子集。流量管控规则有以下几种：
* 条件路由规则
* 标签路由规则
* 脚本路由规则
* 动态配置规则

如果底层用的是基于 HTTP 的 RPC 协议 (如 REST、gRPC、Triple 等)，则服务和方法等就统一映射为 HTTP 路径 (path)，此时 Dubbo 路由规则相当于是基于 HTTP path 和 headers 的流量分发机制。

> Dubbo 中有应用、服务和方法的概念，一个应用可以发布多个服务，一个服务包含多个可被调用的方法，从抽象的视角来看，一次 Dubbo 调用就是某个消费方应用发起了对某个提供方应用内的某个服务特定方法的调用，Dubbo 的流量管控规则可以基于应用、服务、方法、参数等粒度精准的控制流量走向。

## 工作原理

以下是 Dubbo 单个路由器的工作过程，路由器接收一个服务的实例地址集合作为输入，基于请求上下文 (Request Context) 和 (Router Rule) 实际的路由规则定义对输入地址进行匹配，所有匹配成功的实例组成一个地址子集，最终地址子集作为输出结果继续交给下一个路由器或者负载均衡组件处理。

![Router](/imgs/v3/feature/traffic/router1.png)

通常，在 Dubbo 中，多个路由器组成一条路由链共同协作，前一个路由器的输出作为另一个路由器的输入，经过层层路由规则筛选后，最终生成有效的地址集合。
* Dubbo 中的每个服务都有一条完全独立的路由链，每个服务的路由链组成可能不通，处理的规则各异，各个服务间互不影响。
* 对单条路由链而言，即使每次输入的地址集合相同，根据每次请求上下文的不同，生成的地址子集结果也可能不同。

![Router](/imgs/v3/feature/traffic/router2.png)

## 路由规则分类
### 标签路由规则

标签路由通过将某一个服务的实例划分到不同的分组，约束具有特定标签的流量只能在指定分组中流转，不同分组为不同的流量场景服务，从而实现流量隔离的目的。标签路由可以作为蓝绿发布、灰度发布等场景能力的基础。

标签路由规则是一个非此即彼的流量隔离方案，也就是匹配`标签`的请求会 100% 转发到有相同`标签`的实例，没有匹配`标签`的请求会 100% 转发到其余未匹配的实例。如果您需要按比例的流量调度方案，请参考示例 [基于权重的按比例流量路由](../../tasks/traffic-management/weight/)。

`标签`主要是指对 Provider 端应用实例的分组，目前有两种方式可以完成实例分组，分别是`动态规则打标`和`静态规则打标`。`动态规则打标` 可以在运行时动态的圈住一组机器实例，而 `静态规则打标` 则需要实例重启后才能生效，其中，动态规则相较于静态规则优先级更高，而当两种规则同时存在且出现冲突时，将以动态规则为准。

#### 标签规则示例 - 静态打标

静态打标需要在服务提供者实例启动前确定，并且必须通过特定的参数 `tag` 指定。

##### Provider

在 Dubbo 实例启动前，指定当前实例的标签，如部署在杭州区域的实例，指定 `tag=gray`。

```xml
<dubbo:provider tag="gray"/>
```

or

```xml
<dubbo:service tag="gray"/>
```

or

```properties
java -jar xxx-provider.jar -Ddubbo.provider.tag=gray
```

##### Consumer

发起调用的一方，在每次请求前通过 `tag` 设置流量标签，确保流量被调度到带有同样标签的服务提供方。

```java
RpcContext.getContext().setAttachment(Constants.TAG_KEY, "gray");
```

#### 标签规则示例 - 动态打标

相比于静态打标只能通过 `tag` 属性设置，且在启动阶段就已经固定下来，动态标签可以匹配任意多个属性，根据指定的匹配条件将 Provider 实例动态的划分到不同的流量分组中。

##### Provider

以下规则对 `shop-detail` 应用进行了动态归组，匹配 `env: gray` 的实例被划分到 `gray` 分组，其余不匹配 `env: gray` 继续留在默认分组 (无 tag)。

```yaml
configVersion: v3.0
force: true
enabled: true
key: shop-detail
tags:
  - name: gray
    match:
      - key: env
        value:
          exact: gray
```

> 这里牵涉到如何给您的实例打各种原始 label 的问题，即上面示例中的 `env`，一种方式是直接写在配置文件中，如上面静态规则实例 provider 部分的配置所示，另一种方式是通过预设环境变量指定，关于这点请参考下文的 [如何给实例打标](#如何给实例打标) 一节。

##### Consumer

服务发起方的设置方式和之前静态打标规则保持一致，只需要在每次请求前通过 `tag` 设置流量标签，确保流量被调度到带有同样标签的服务提供方。

```java
RpcContext.getContext().setAttachment(Constants.TAG_KEY, "Hangzhou");
```

设置了以上标签的流量，将全部导流到 `hangzhou-region` 划分的实例上。

> 请求标签的作用域仅为一次点对点的 RPC 请求。比如，在一个 A -> B -> C 调用链路上，如果 A -> B 调用通过 `setAttachment` 设置了 `tag` 参数，则该参数不会在 B -> C 的调用中生效，同样的，在完成了 A -> B -> C 的整个调用同时 A 收到调用结果后，如果想要相同的 `tag` 参数，则在发起其他调用前仍需要单独设置 `setAttachment`。可以参考 [示例任务 - 环境隔离](../../tasks/traffic-management/isolation/) 了解更多 `tag` 全链路传递解决方案。

### 条件路由规则

条件路由与标签路由的工作模式非常相似，也是首先对请求中的参数进行匹配，符合匹配条件的请求将被转发到包含特定实例地址列表的子集。相比于标签路由，条件路由的匹配方式更灵活：

* 在标签路由中，一旦给某一台或几台机器实例打了标签，则这部分实例就会被立马从通用流量集合中移除，不同标签之间不会再有交集。有点类似下图，地址集合在输入阶段就已经划分明确。

![tag-condition-compare](/imgs/v3/feature/traffic/tag-condition-compare1.png)

* 而从条件路由的视角，所有的实例都是一致的，路由过程中不存在分组隔离的问题，每次路由过滤都是基于全量地址中执行

![tag-condition-compare](/imgs/v3/feature/traffic/tag-condition-compare2.png)

条件路由规则的主体 `conditions` 主要包含两部分内容：

* => 之前的为请求参数匹配条件，指定的 `匹配条件指定的参数` 将与 `消费者的请求上下文 (URL)、甚至方法参数` 进行对比，当消费者满足匹配条件时，对该消费者执行后面的地址子集过滤规则。
* => 之后的为地址子集过滤条件，指定的 `过滤条件指定的参数` 将与 `提供者实例地址 (URL)` 进行对比，消费者最终只能拿到符合过滤条件的实例列表，从而确保流量只会发送到符合条件的地址子集。
    * 如果匹配条件为空，表示对所有请求生效，如：`=> status != staging`
    * 如果过滤条件为空，表示禁止来自相应请求的访问，如：`application = product =>`


#### 条件路由规则示例

基于以下示例规则，所有 `org.apache.dubbo.demo.CommentService` 服务调用都将被转发到与当前消费端机器具有相同 `region` 标记的地址子集。`$region` 是特殊引用符号，执行过程中将读取消费端机器的实际的 `region` 值替代。

```yaml
configVersion: v3.0
enabled: true
force: false
key: org.apache.dubbo.samples.CommentService
conditions:
  - '=> region = $region'
```

> 针对条件路由，我们通常推荐配置 `scope: service` 的规则，因为它可以跨消费端应用对所有消费特定服务 (service) 的应用生效。关于 Dubbo 规则中的 `scope` 以及 `service`、`application` 的说明请阅读 [条件路由规则手册](./condition-rule)。

条件路由规则还支持设置具体的机器地址如 ip 或 port，这种情况下使用条件路由可以处理一些开发或线上机器的临时状况，实现**黑名单、白名单、实例临时摘除**等运维效果，如以下规则可以将机器 `172.22.3.91` 从服务的可用列表中排除。

```yaml
=> host != 172.22.3.91
```

条件路由还支持基于请求参数的匹配，示例如下：

```yaml
conditions:
  - method=getDetail&arguments[0]=dubbo => port=20880
```

### 动态配置规则
通过 Dubbo 提供的动态配置规则，您可以动态的修改 Dubbo 服务进程的运行时行为，整个过程不需要重启，配置参数实时生效。基于这个强大的功能，基本上所有运行期参数都可以动态调整，比如超时时间、临时开启 Access Log、修改 Tracing 采样率、调整限流降级参数、负载均衡、线程池配置、日志等级、给机器实例动态打标签等。与上文讲到的流量管控规则类似，动态配置规则支持应用、服务两个粒度，也就是说您一次可以选择只调整应用中的某一个或几个服务的参数配置。

当然，出于系统稳定性、安全性的考量，有些特定的参数是不允许动态修改的，但除此之外，基本上所有参数都允许动态修改，很多强大的运行态能力都可以通过这个规则实现，您可以找个示例应用去尝试一下。通常 URL 地址中的参数均可以修改，这在每个语言实现的参考手册里也记录了一些更详细的说明。

#### 动态配置规则示例 - 修改超时时间

以下示例将 `org.apache.dubbo.samples.UserService` 服务的超时参数调整为 2000ms

```yaml
configVersion: v3.0
scope: service
key: org.apache.dubbo.samples.UserService
enabled: true
configs:
  - side: provider
    parameters:
      timeout: 2000
```

以下部分指定这个配置是服务粒度，具体变更的服务名为 `org.apache.dubbo.samples.UserService`。`scope` 支持 `service`、`application` 两个可选值，如果 `scope: service`，则 `key` 应该配置为 `version/service:group` 格式。

```yaml
scope: service
key: org.apache.dubbo.samples.UserService
```

> 关于 Dubbo 规则中的 `scope` 以及 `service`、`application` 的说明请参考 [动态配置参考手册](./configuration-rule/) 或 [动态配置示例](../../tasks/traffic-management/timeout/)。

`parameters` 参数指定了新的修改值，这里将通过 `timeout: 2000` 将超时时间设置为 2000ms。

```yaml
parameters:
 timeout: 2000
```

### 脚本路由规则
脚本路由是最直观的路由方式，同时它也是当前最灵活的路由规则，因为你可以在脚本中定义任意的地址筛选规则。如果我们为某个服务定义一条脚本规则，则后续所有请求都会先执行一遍这个脚本，脚本过滤出来的地址即为请求允许发送到的、有效的地址集合。

```yaml
configVersion: v3.0
key: demo-provider
type: javascript
enabled: true
script: |
  (function route(invokers,invocation,context) {
      var result = new java.util.ArrayList(invokers.size());
      for (i = 0; i < invokers.size(); i ++) {
          if ("10.20.3.3".equals(invokers.get(i).getUrl().getHost())) {
              result.add(invokers.get(i));
          }
      }
      return result;
  } (invokers, invocation, context)); // 表示立即执行方法
```

## 如何给实例打标

当前，有两种方式可以在启动阶段为 Dubbo 实例指定标签，一种是之前提到的应用内配置的方式，如在 xml 文件中设置 `<dubbo:provider tag="gray"/>`，应用打包部署后即自动被打标。

还有一种更灵活的方式，那就是通过读取所部署机器上的环境信息给应用打标，这样应用的标签就可以跟随实例动态的自动填充，避免每次更换部署环境就重新打包应用镜像的问题。当前 Dubbo 能自动读取以下环境变量配置：

```yaml
spec:
  containers:
  - name: detail
    image: apache/demo-detail:latest
    env:
    - name: DUBBO_LABELS
      value: "region=hangzhou; env=gray"
```

```yaml
spec:
  containers:
  - name: detail
    image: apache/demo-detail:latest
    env:
    - name: DUBBO_ENV_KEYS
      value: "REGION, ENV"
    - name: REGION
      value: "hangzhou"
    - name: ENV
      value: "gray"
```

如果您有不同的实例环境保存机制，可以通过扩展 `InfraAdapter 扩展点` 来自定义自己的标签加载方式。如果您的应用是部署在 Kubernetes 环境下，并且已经接入了服务网格体系，则也可以使用标准 deployment 标签的方式打标，具体请跟随 [服务网格任务示例](../../tasks/mesh/) 学习。

## 如何配置流量规则
Dubbo 提供了控制台 Dubbo Admin，帮助您可视化的下发流量管控规则，并实时监控规则生效情况。

![Admin](/imgs/v3/what/admin.png)

Dubbo 还提供了 `dubboctl` 命令行工具，需要有 Dubbo Admin 提前部署就绪，因为 dubboctl 是通过与 Admin 进行 http 通信完成规则下发的。

如果您使用的是如 Istio 的服务网格架构，还可以使用 Istioctl、kubectl 等下发 Istio 标准规则。

## 接入服务网格

以上介绍的都是 Dubbo 体系内的流量治理规则，如果您对服务网格架构感兴趣，则可以将 Dubbo 服务接入服务网格体系，这样，您就可以使用服务网格提供的流量治理能力，如 Istio 体系的 VirtualService 等。

具体请参见 [Dubbo 中的服务网格架构](../service-mesh)。

## 跟随示例学习
我们搭建了一个 [线上商城系统](../../tasks/traffic-management/) 供您学习流量规则的具体使用。
