---
type: docs
title: "流量治理"
linkTitle: "流量治理"
weight: 40
---

Dubbo 丰富的流量管控规则可以控制服务间的流量走向和 API 调用，基于这些规则可以实现在运行态动态的调整服务行为如超时时间、重试次数、限流参数等，通过控制流量分布可以实现 A/B 测试、金丝雀发布、多版本按比例流量分配、条件匹配路由、黑白名单等，提高系统稳定性。

## Dubbo 的流量管控体系

Dubbo 提供了多种策略和实现，可以很好的管控流入、流出 Dubbo 集群的流量。从 Server 视角来看，部署 Dubbo 应用的实例是时刻在动态变化的，因此消费方 (Dubbo Consumer) 要能随时感知节点变化并将流量均匀的分布到每个实例上，Dubbo 的服务发现与负载均衡机制可以很好的解决这个问题；Dubbo 中有应用、服务和方法的概念，一个应用可以发布多个服务，一个服务包含多个可被调用的方法，从抽象的视角来看，一次 Dubbo 调用就是某个消费方应用发起了对某个提供方 (Dubbo Provider) 应用内的某个服务特定方法的调用，Dubbo 的流量管控规则可以基于应用、服务、方法、参数等粒度精准的控制流量走向。

Dubbo 服务发现保证调用方随时看到最新的提供方实例地址，服务发现机制依赖注册中心的协调，注册中心可以是 Zookeeper、Nacos 等独立集群，也可以是 Istio 等控制面组件。在消费端，Dubbo 提供了多种负载均衡策略，比如通过随机负载均衡策略能最大限度的做到流量在后端实例上的均匀分布，而一致性哈希负载均衡、基于权重的负载均衡等策略则能满足一些特定场景的流量调度需求。

从流量管控的视角，一次请求的目标是服务和方法，Dubbo 的流量管控就是根据请求的目标服务、方法以及请求体中的其他附加参数进行匹配的，符合匹配太条件的流量会被按照特定规则转发到一个地址子集。匹配条件最细支持到方法粒度，同时还能根据参数值进行流量转发。如果是基于 http 的 rpc 协议 (如 REST、gRPC、Triple 等)，则服务和方法的就统一转换为 http 的路径 (path)，此时 Dubbo 的流量规则就是基于 http path 和 headers 的流量分发。

### 标签路由规则

标签路由通过将某一个服务的实例划分到不同的分组，约束具有特定标签的流量只能在指定分组中流转，不同分组为不同的流量场景服务，从而达到实现流量隔离的目的，可以作为蓝绿发布、灰度发布等场景能力的基础。

标签路由规则是一个非此即彼的流量隔离方案，也就是匹配`标签`的请求会 100% 转发到有相同`标签`的实例，没有匹配`标签`的请求会 100% 转发到其余未匹配的实例。如果您需要按比例的流量调度方案，请参考下文 [按比例流量路由规则](#按比例流量路由规则)。

`标签`主要是指对 Provider 端应用实例的分组，目前有两种方式可以完成实例分组，分别是`动态规则打标`和`静态规则打标`。`动态规则打标` 可以在运行时动态的圈住一组机器实例，而 `静态规则打标` 则需要实例重启后才能生效，其中，动态规则相较于静态规则优先级更高，而当两种规则同时存在且出现冲突时，将以动态规则为准。

#### 标签规则示例 - 静态打标

静态打标需要在服务提供者实例启动前确定，并且必须通过特定的参数 `tag` 指定。

##### Provider

在 Dubbo 实例启动前，指定当前实例的标签，如部署在杭州区域的实例，指定 `tag=Hangzhou`。

```xml
<dubbo:provider tag="Hangzhou"/>
```

or

```xml
<dubbo:service tag="Hangzhou"/>
```

or

```properties
java -jar xxx-provider.jar -Ddubbo.provider.tag=Hangzhou
```

##### Consumer

发起调用的一方，在每次请求前通过 `tag` 设置流量标签，确保流量被调度到带有同样标签的服务提供方。

```java
RpcContext.getContext().setAttachment(Constants.TAG_KEY, "Hangzhou");
```

请求标签的作用域仅为一次点对点的 RPC 请求。比如，在一个 A -> B -> C 调用链路上，如果 A -> B 调用通过 `setAttachment` 设置了 `tag` 参数，则该参数不会在 B -> C 的调用中生效，同样的，在完成了 A -> B -> C 的整个调用同时 A 收到调用结果后，如果想要相同的 `tag` 参数，则在发起其他调用前仍需要单独设置 `setAttachment`。

#### 标签规则示例 - 动态打标

相比于静态打标只能通过 `tag` 属性设置，且在启动阶段就已经固定下来，动态标签可以匹配任意多个属性，根据指定的匹配条件将 Provider 实例动态的划分到不同的流量分组中。

##### Provider

以下规则对 `details` 应用进行了动态归组，匹配 `region: Hangzhou` 的实例被划分到 `hangzhou-region`，匹配 `region: Beijing` 的划分到 `beijing-region`。

```yaml
configVersion: v3.0
force: false
runtime: true
enabled: true
key: details
tags:
- name: hangzhou-region
   match:
   - key: region
      value:
        exact: Hangzhou
- name: beijing-region
   match:
   - key: region
      value:
        exact: Beijing
```

> 这里牵涉到如何给您的实例打各种原始 label 的问题，即上面示例中的 `region`，一种方式是直接写在配置文件中，如上面静态规则实例 provider 部分的配置所示，另一种方式是通过预设环境变量指定，关于这点请参考下文的[如何给实例打标](#如何给实例打标)一节。

##### Consumer

服务发起方的设置方式和之前静态打标规则保持一致，只需要在每次请求前通过 `tag` 设置流量标签，确保流量被调度到带有同样标签的服务提供方。

```java
RpcContext.getContext().setAttachment(Constants.TAG_KEY, "Hangzhou");
```

设置了以上标签的流量，将全部导流到 `hangzhou-region` 划分的实例上。

### 条件路由规则

条件路由与标签路由的工作模式非常相似，也是首先对发起流量的请求参数进行匹配，符合匹配条件的请求将被转发到包含特定实例地址列表的子集。相比于标签路由，条件路由的可以支持的匹配条件更灵活，可以实现更灵活的流量引导效果。

条件路由规则的主体 `conditions` 主要包含两部分内容：

* => 之前的为请求参数匹配条件，指定的 `匹配条件指定的参数` 将与 `消费者的请求上下文 (URL)、甚至方法参数` 进行对比，当消费者满足匹配条件时，对该消费者执行后面的地址子集过滤规则。
* => 之后的为地址子集过滤条件，指定的 `过滤条件指定的参数` 将与 `提供者实例地址 (URL)` 进行对比，消费者最终只能拿到符合过滤条件的实例列表，从而确保流量只会发送到符合条件的地址子集。
    * 如果匹配条件为空，表示对所有请求生效，如：`=> status != staging`
    * 如果过滤条件为空，表示禁止来自相应请求的访问，如：`application = product =>`


#### 条件路由规则示例

基于以下示例规则，所有 `org.apache.dubbo.demo.CommentService` 服务 `getCommentsFromHangzhou` 方法的调用都将被转发到有 `region=Hangzhou` 标记的地址子集。

  ```yaml
  scope: service
  force: true
  runtime: true
  enabled: true
  key: org.apache.dubbo.demo.CommentService
  conditions:
    - method=getCommentsFromHangzhou => region=Hangzhou
  ```

> 针对条件路由，我们通常推荐配置 `scope: service` 的规则，因为它可以跨消费端应用对所有消费特定服务 (service) 的应用生效。关于 Dubbo 规则中的 `scope` 以及 `service`、`application` 的说明请阅读 [流量管控规则参考手册]()。

除此之外，通过设置一些具体机器的地址如 ip 或 port，使用条件路由可以处理一些开发或线上机器的临时状况，实现**黑名单、白名单、实例临时摘除**等运维效果，如以下规则可以将机器 `172.22.3.91` 从服务的可用列表中排除。

```yaml
=> host != 172.22.3.91
```


条件路由还支持基于请求参数的匹配，示例如下：

```yaml
conditions:
  - method=getDetail&arguments[0]=dubbo => port=20880
```

### 按比例流量路由规则

> 注意，虽然接下来的规则和 Istio 的 VirtualService、DestinationRule 很像，但工作过程和具体规则和 Istio 还是有一些差异，Dubbo 只是参考了 Istio 的设计。如果您想接入原生的 Istio 服务网格治理体系，请参考下文 [接入服务网格流量治理](#接入服务网格流量治理)。

在一些场景下，我们需要将相同属性的流量按比例的分发到不同的实例分组。一个典型的示例场景是 A/B 测试，比如我们需要将 20% 流量转发到服务新版本 v2 的实例，以验证新版本的稳定性，或者是将公司内部的一部分用户导流到新版本 v2 的实例进行测试验证。另一个应用场景是实现服务的金丝雀发布，通过逐步调整流量分配比例值，使得新版本的流量逐步提升并最终将全部流量完全迁移到新版本之上。

#### 按比例流量规则示例

以下示例会将访问服务 `org.apache.dubbo.demo.DetailService` 特定方法 `getDetail` 的所有请求按比例进行转发。

```yaml
...
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: details
spec:
  dubbo:
   - name: detail-service-traffic-split
     match:
      - name:
        services:
         - exact: "org.apache.dubbo.demo.DetailService"
        method:
         name_match:
          exact: "getDetail"
     route:
      - destination:
         subset: details-v1
        weight: 60
      - destination:
         subset: details-v2
        weight: 40
---
...
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: reviews-route
spec:
  subsets:
    - name: details-v1
      labels:
        detail_version: v1 # 'version' is a reserved key in Dubbo, so must not be used.
    - name: details-v2
      labels:
        detail_version: v2 # 'version' is a reserved key in Dubbo, so must not be used.
---
```

##### Dubbo VirtualService

> 此部分完全可参考 Istio VirtualService 语义，两者几乎完全相同，Dubbo 增加了 `dubbo` 协议标签（对应 http 协议位置）并对 `match` 条件进行了丰富。

`match` 条件设置了流量规则只对访问服务 "org.apache.dubbo.demo.DetailService" 的 `getDetail` 方法的请求有效。

```yaml
match:
  - name:
    services:
     - exact: "org.apache.dubbo.demo.DetailService"
    method:
     name_match:
      exact: "getDetail"
```

以下 `route` 指定匹配后流量的目标实例子集，实例子集 `details-v1` `details-v2` 是通过下面的 DestinationRule 定义的。对于没有匹配的流量，则默认可以访问任何实例，不会做任何过滤。

```yaml
route:
  - destination:
     subset: details-v1
    weight: 60
  - destination:
     subset: details-v2
    weight: 40
```

##### Dubbo DestinationRule

> 此部分完全可参考 Istio DestinationRule 语义，两者完全相同。

以下规则通过匹配 `detail_version` 值将应用 details 划分为两个部署版本 `v1` 和 `v2`，分别命名为 `deatils-v1` 和 `details-v2`，同时 `deatils-v1` 和 `details-v2` 将成为 Dubbo VirtualService 的流量转发目标对象。

```yaml
subsets:
 - name: details-v1
   labels:
     detail_version: v1 # 'version' is a reserved key in Dubbo, so must not be used.
 - name: details-v2
   labels:
     detail_version: v2 # 'version' is a reserved key in Dubbo, so must not be used.
```

> 和标签路由类似，这里牵涉到如何给您的实例打标（这里是 `detail_version`）的问题，请参考下文的 [如何给实例打标](#如何给实例打标) 一节。

除了以上介绍的与 Istio 流量规则很相似的功能之外，Dubbo 的 VirtualService、DestinationRule 还可以实现方法参数路由等 Istio 规则不能做到的事情，具体查看 [参考手册]()。


### 动态配置规则
通过 Dubbo 提供的动态配置规则，您可以动态的修改 Dubbo 服务进程的运行时行为，整个过程不需要重启，配置参数实时生效。基于这个强大的功能，基本上所有运行期参数都可以动态调整，比如超时时间、临时开启 Access Log、修改 Tracing 采样率、调整限流降级参数、负载均衡、线程池配置、日志等级、给机器实例动态打标签等。与上文讲到的流量管控规则类似，动态配置规则支持应用、服务两个粒度，也就是说您一次可以选择只调整应用中的某一个或几个服务的参数配置。

当然，出于系统稳定性、安全性的考量，有些特定的参数是不允许动态修改的，但除此之外，基本上所有参数都允许动态修改，很多强大的运行态能力都可以通过这个规则实现，您可以找个示例应用去尝试一下。关于这部分，我们在每个语言实现的参考手册里也记录了一些更详细的说明。

#### 动态配置规则示例 - 修改超时时间

以下示例将应用 `details` 中 `org.apache.dubbo.demo.details.DetailService` 服务的超时参数调整为 5000ms，并且这个配置只对包含标签 `region: Hangzhou` 的实例生效，也就是说只有部署在 `Hangzhou` 区域的 `details` 应用实例才需要修改超时时间。

```yaml
configVersion: v3.0
scope: application
key: details
enabled: true
configs:
- match:
   service:
     oneof:
      - exact: "org.apache.dubbo.demo.details.DetailService"
   param:
    - key: region
      value:
       exact: Hangzhou
  parameters:
    timeout: 5000
```

以下部分指定这个配置是应用粒度的且要控制的应用名为 `details`。`scope` 支持 `service`、`application` 两个可选值，如果 `scope: service`，则 `key` 应该配置为 `version/service:group` 格式。

```yaml
scope: application
key: details
```

> 关于 Dubbo 规则中的 `scope` 以及 `service`、`application` 的说明请参考[流量管控规则参考手册]()。

`match` 指定了服务、实例的匹配条件，只有匹配了 `match` 条件的特定实例上特定服务的配置才会被修改。`details` 应用包含多个 Dubbo 服务，这里要修改的具体服务是 `org.apache.dubbo.demo.details.DetailService`，要修改的实例需要包含 `region: Hangzhou` 标记。

```yaml
- match:
   service:
     oneof:
      - exact: "org.apache.dubbo.demo.details.DetailService"
   param:
    - key: region
      value:
       exact: Hangzhou
```

以下 `parameters` 参数指定了新的修改值，这里将通过 `timeout: 5000` 将超时时间设置为 5000ms。

```yaml
parameters:
 timeout: 5000
```

### 脚本路由规则

TBD

## Dubbo 流量管控能解决哪些问题

以上介绍了几种 Dubbo 中支持的流量管控规则，我们可以依赖它们中的一种或多种，通过改变规则中的匹配条件，实现微服务场景中的多种服务治理能力，常见的包括以下一些：

* 灰度流量隔离
* 金丝雀发布
* A/B 测试
* 黑白名单
* 服务降级
* 修改服务行为，如重试、打开访问日志、限流参数等
* 超时时间调整
* 实例临时拉黑

可以在 [流量管理任务]() 中了解更多这部分的细节。

## 如何给实例打标

当前，有两种方式可以给 Dubbo 实例指定标签，一种是，另外，您还可以扩展 [InfraAdapter 扩展点]()，来自定义自己的标签加载方式。

在 Kubernetes 部署场景下，

```yaml
spec:
  containers:
  - name: detail
    image: apache/demo-detail:latest
    env:
    - name: DUBBO_LABELS
      value: "region=Hangzhou; biz=international"
```

```yaml
spec:
  containers:
  - name: detail
    image: apache/demo-detail:latest
    env:
    - name: DUBBO_ENV_KEYS
      value: "REGION, BIZ"
    - name: REGION
      value: "Hangzhou"
    - name: BIZ
      value: "international"
```

## 如何配置流量管控规则
Dubbo 提供了控制台 Dubbo Admin，帮助您可视化的下发流量管控规则，并实时监控规则生效情况。

![Admin 规则管控截图]()

Dubbo 还提供了 `dubboctl` 命令行工具，前提也是需要有 Dubbo Admin 提前部署就绪，因为 dubboctl 是通过与 Admin 进行 http 通信完成规则下发的。

如果您使用的是如 Istio 的服务网格架构，还可以使用 Istioctl、kubectl 等下发 Istio 标准规则。

## 接入服务网格流量治理

以上介绍的都是 Dubbo 体系内的流量治理规则，如果您对服务网格架构感兴趣，则可以将 Dubbo 服务接入服务网格体系，这样，您就可以使用服务网格提供的流量治理能力，如 Istio 体系的 VirtualService 等。

具体请参见 [Dubbo 服务网格解决方案]()。
