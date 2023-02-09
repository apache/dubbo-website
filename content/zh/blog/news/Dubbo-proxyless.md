---
title: "Dubbo 在 Proxyless Mesh 模式下的探索与改进"
linkTitle: "Dubbo 在 Proxyless Mesh 模式下的探索与改进"
date: 2023-02-02
---

## 一、背景 
随着 Docker 和 Kubernetes 的出现，一个庞大的单体应用可以被拆分成多个独立部署的微服务，并被打包运行于对应的容器中。不同应用之间相互通信，以共同完成某一功能模块。微服务架构与容器化部署带来的好处是显而易见的，它降低了服务间的耦合性，利于开发和维护，能更有效地利用计算资源。当然，微服务架构也存在相应的缺点：

- 强依赖于 SDK，业务模块与治理模块耦合较为严重。 除了相关依赖，往往还需要在业务代码中嵌入SDK代码或配置。
- 统一治理难。每次框架升级都需要修改 SDK 版本，并重新进行回归测试，确认功能正常后再对每一台机器重新部署上线。不同服务引用的 SDK 版本不统一、能力参差不齐，增大了统一治理的难度。
- 缺少一套统一解决方案。目前市场不存在一整套功能完善、无死角的微服务治理与解决方案。在实际生产环境往往还需要引入多个治理组件来完成像灰度发布、故障注入等功能。

为解决这些痛点，Service Mesh诞生了。以经典的 Sidecar 模式为例，它通过在业务 Pod 中注入 Sidecar 容器，对代理流量实施治理和管控，将框架的治理能力下层到 Sidecar 容器中，与业务系统解耦，从而轻松实现多语言、多协议的统一流量管控、监控等需求。通过剥离SDK能力并拆解为独立进程，从而解决了强依赖于SDK的问题，从而使开发人员可以更加专注于业务本身，实现了基础框架能力的下沉，如下图所示（源自dubbo官网）：
![image.png](/imgs/blog/2023/2/2/1.png)

经典的 Sidecar Mesh 部署架构有很多优势，如减少SDK耦合、业务侵入小等，但增加了一层代理，也带来了一些额外的问题，比如:

- Sidecar 代理会损耗一部分性能，当网络结构层级比较复杂时尤其明显，对性能要求很高的业务造成了一定的困扰。
- 架构更加复杂，对运维人员要求高。
- 对部署环境有一定的要求，需要其能支持 Sidecar 代理的运行。

为解决这些痛点，Proxyless Service Mesh 模式诞生了。传统服务网格通过代理的方式拦截所有的业务网络流量，代理需要感知到控制平面下发的配置资源，从而按照要求控制网络流量的走向。以istio为例，Proxyless 模式是指应用直接与负责控制平面的 istiod 进程通信，istiod 进程通过监听并获取 Kubernetes 的资源，例如 Service、Endpoint 等，并将这些资源统一通过 xDS 协议下发到不同的 RPC 框架，由 RPC 框架进行请求转发，从而实现服务发现和服务治理等能力。
Dubbo 社区是国内最早开始对 Proxyless Service Mesh 模式进行探索的社区，这是由于相比于 Service Mesh，Proxyless 模式落地成本较低，对于中小企业来说是一个较好的选择。Dubbo 在 3.1 版本中通过对 xDS 协议进行解析，新增了对 Proxyless 的支持。xDS 是一类发现服务的总称，应用通过 xDS API 可以动态获取 Listener(监听器)、Route(路由)、Cluster(集群)、Endpoint(集群成员) 以及 Secret(证书)配置。

![image.png](/imgs/blog/2023/2/2/2.jpeg)

通过 Proxyless 模式，Dubbo 与 Control Plane 直接建立通信，进而实现控制面对流量管控、服务治理、可观测性、安全等的统一管控，从而规避 Sidecar 模式带来的性能损耗与部署架构复杂性。

## 二、Dubbo xDS 推送机制详解

从整体上看，istio control plane 和 dubbo 的交互时序图如上。Dubbo 里 xDS 处理的主要逻辑在 PilotExchanger 和各个 DS (LDS、RDS、CDS、EDS) 的对应协议的具体实现里。PilotExchanger 统一负责串联逻辑，主要有三大逻辑：

- 获取授信证书。
- 调用不同 protocol 的 getResource 获取资源。
- 调用不同 protocol 得 observeResource 方法监听资源变更。

例如对于 lds 和 rds，PilotExchanger 会调用 lds 的 getResource 方法与 istio 建立通信连接，发送数据并解析来自 istio 的响应，解析完成后的 resource 资源会作 为rds 调用 getResource 方法的入参，并由 rds 发送数据给 istio。当 lds 发生变更时，则由 lds 的 observeResource 方法去触发自身与 rds 的变更。上述关系对于 rds 和 eds 同样如此。现有交互如下，上述过程对应图里红线的流程：

![image.png](/imgs/blog/2023/2/2/3.jpeg)

在第一次成功获取资源之后，各个DS会通过定时任务去不断发送请求给 istio，并解析响应结果和保持与 istio 之间的交互，进而实现控制面对流量管控、服务治理、可观测性方面的管控，其流程对应上图蓝线部分。

## 三、当前Dubbo Proxyless实现存在的不足

Dubbo Proxyless 模式经过验证之后，已经证明了其可靠性。现有 Dubbo proxyless 的实现方案存在以下问题：

- 目前与 istio 交互的逻辑是推送模式。getResource 和 observeResource 是两条不同的 stream 流，每次发送新请求都需要重新建立连接。但我们建立的 stream 流是双向流动的，istio 在监听到资源变化后由主动推送即可，LDS、RDS、EDS 分别只需要维护一条 stream 流。
- Stream 流模式改为建立持久化连接之后，需要设计一个本地的缓存池，去存储已经存在的资源。当 istio 主动推送更新后，需要去刷新缓存池的数据。
- 现有observeResource 逻辑是通过定时任务去轮询istio。现在  observeResource 不再需要定时去轮询，只需要将需要监听的资源加入到缓存池，等 istio 自动推送即可，且 istio 推送回来的数据需要按照 app 切分好，实现多点监听，后续 dubbo 支持其他 DS 模式，也可复用相应的逻辑。
- 目前由 istio 托管的 dubbo 应用在 istio 掉线后会抛出异常，断线后无法重新连接，只能重新部署应用，增加了运维和管理的复杂度。我们需增加断线重连的功能，等 istio 恢复正常后无需重新部署即可重连。

改造完成后的交互逻辑：

![image.png](/imgs/blog/2023/2/2/4.jpeg)

## 四、Xds 监听模式实现方案

### 4.1 资源缓存池

目前 Dubbo 的资源类型有LDS，RDS，EDS。对于同一个进程，三种资源监听的所有资源都与 istio 对该进程所缓存的资源监听列表一一对应。因此针对这三种资源，我们应该设计分别对应的本地的资源缓存池，dubbo 尝试资源的时候先去缓存池查询，若有结果则直接返回；否则将本地缓存池的资源列表与想要发送的资源聚合后，发送给 istio 让其更新自身的监听列表。缓存池如下，其中 key 代表单个资源，T 为不同 DS 的返回结果：

```java
    protected Map<String, T> resourcesMap = new ConcurrentHashMap<>();
```

有了缓存池我们必须有一个监听缓存池的结构或者容器，在这里我们设计为 Map 的形式，如下：

```java
protected Map<Set<String>, List<Consumer<Map<String, T>>>> consumerObserveMap = new ConcurrentHashMap<>();
```

其中key为想要监听的资源，value 为一个 List, 之所以设计为 List 是为了可以支持重复订阅。 List 存储的 item 为 jdk8 中的 Consumer 类型，它可以用于传递一个函数或者行为，其入参为 Map<String, T>，其 key 对应所要监听的单个资源，便于从缓存池中获取。如上文所述，PilotExchanger 负责串联整个流程，不同 DS 之间的更新关系可以用 Consumer 进行传递。以监听 LDS observeResource 为例,  大致代码如下：

```java
// 监听
void observeResource(Set<String> resourceNames, Consumer<Map<String, T>> consumer, boolean isReConnect);

// Observe LDS updated
ldsProtocol.observeResource(ldsResourcesName, (newListener) -> {
    // LDS数据不一致
    if (!newListener.equals(listenerResult)) {
        //更新LDS数据
        this.listenerResult = newListener;
        // 触发RDS监听
        if (isRdsObserve.get()) {
            createRouteObserve();
        }
    }
}, false);
```

Stream流模式改为建立持久化连接之后，我们也需要把这个 Consumer 的行为存储在本地的缓存池中。Istio 收到来自 dubbo 的推送请求后，刷新自身缓存的资源列表并返回响应。此时 istio 返回的响应内容是聚合后的结果，Dubbo 收到响应后，将响应资源拆分为更小的资源粒度，再推送给对应的 Dubbo应用通知其进行变更。

踩坑点：

- istio推送的数据可能为空字符串，此时缓存池子无需存储，直接跳过即可。否则dubbo会绕过缓冲池，不断向istio发送请求。
- 考虑以下场景，dubbo应用同时订阅了两个接口，分别由app1和app2提供。为避免监听之间的相互覆盖，因此向istio发送数据时，需要聚合所有监听的资源名一次性发起。

### 4.2 多点独立监听

在第一次向istio发送请求时会调用getResource方法先去cache查询，缺失了再聚合数据去istio请求数据，istio再返回相应的结果给dubbo。我们处理istio的响应有两种实现方案： 
1. 由用户在getResource方案中new 一个completeFuture，由cache分析是否是需要的数据，若确认是新数据则由该future回调传递结果。
2. getResource建立资源的监听器consumerObserveMap，定义一个consumer并把取到的数据同步到原来的线程，cache 收到来自istio的推送后会做两件事：将数据推送所有监听器和将数据发送给该资源的监听器。
以上两种方案都能实现，但最大的区别就是用户调用onNext发送数据给istio的时候需不需要感知getResource 的存在。综上，最终选择方案2进行实现。具体实现逻辑是让dubbo与istio建立连接后，istio会推送自身监听到资源列表给dubbo，dubbo解析响应，并根据监听的不同app切分数据，并刷新本地缓存池的数据，并发送ACK响应给istio，大致流程如下：

![image.png](/imgs/blog/2023/2/2/5.svg)

```java
public class ResponseObserver implements XXX {
        ...
        public void onNext(DiscoveryResponse value) {
            //接受来自istio的数据并切分
            Map<String, T> newResult = decodeDiscoveryResponse(value);
            //本地缓存池数据
            Map<String, T> oldResource = resourcesMap;
            //刷新缓存池数据
            discoveryResponseListener(oldResource, newResult);
            resourcesMap = newResult;
            // for ACK
            requestObserver.onNext(buildDiscoveryRequest(Collections.emptySet(), value));
        }
        ...
        public void discoveryResponseListener(Map<String, T> oldResult, 
                                              Map<String, T> newResult) {
            ....
        }	
}
//具体实现交由LDS、RDS、EDS自身
protected abstract Map<String, T> decodeDiscoveryResponse(DiscoveryResponse response){
	//比对新数据和缓存池的资源，并将不同时存在于两种池子的资源取出
    ...
    for (Map.Entry<Set<String>, List<Consumer<Map<String, T>>>> entry : consumerObserveMap.entrySet()) {
    // 本地缓存池不存在则跳过
    ...
	//聚合资源
    Map<String, T> dsResultMap = entry.getKey()
        .stream()
        .collect(Collectors.toMap(k -> k, v -> newResult.get(v)));
    //刷新缓存池数据
    entry.getValue().forEach(o -> o.accept(dsResultMap));
    }
}    

```
踩坑点：

- 原本多个stream流的情况下，会用递增的requestId来复用stream流，改成持久化连接之后，一种resource会有多个requestid，可能会相互覆盖，因此必须去掉这个机制。
- 初始实现方案并没有对资源进行切分，而是一把梭，考虑到后续对其他DS的支持，对istio返回的数据进行切分，也导致consumerObserveMap有点奇形怪状。
- 三种DS在发送数据时可以共享同一channel，但监听所用到的必须是同一channel，否则数据变更时istio不会进行推送。
- 建立双向stream流之后，初始方案future为全局共享。但可能有这样的场景：相同的ds两次相邻时间的onNext事件，记为A事件和B事件，可能是A事件先发送，B随后；但可能是B事件的结果先返回，不确定istio推送的时间，因此future必须是局部变量而不是全局共享。

### 4.3 采用读写锁避免并发冲突

监听器consumerObserveMap和缓存池resourcesMap均可能产生并发冲突。对于resourcemap，由于put操作都集中在getResource方法，因此可以采用悲观锁就能锁住相应的资源，避免资源的并发监听。对于consumerObserveMap，同时存在put、remove和遍历操作，从时序上，采用读写锁可规避冲突，对于遍历操作加读锁，对于put和remove操作加写锁，即可避免并发冲突。综上，resourcesMap加悲观锁即可，consumerObserveMap涉及的操作场景如下：

- 远程请求istio时候会往consumerObserveMap 新增数据，加写锁。
- CompleteFuture跨线程返回数据后，去掉监听future，加写锁。
- 监听缓存池时会往consumerObserveMap新增监听，加写锁。
- 断线重连时会往consumerObserveMap新增监听，加写锁。
- 解析istio返回的数据，遍历缓存池并刷新数据，加读锁。

踩坑点：

- 由于dubbo和istio建立的是是双向stream流，相同的ds两次相邻时间的onNext事件，记为A事件和B事件，可能是A事件先发送，B随后；但可能是B事件的结果先返回，不确定istio推送的时间。因此需要加锁。

### 4.4 断线重连

断线重连只需要用定时任务去定时与istio交互，尝试获取授信证书，证书获取成功即可视为istio成功重新上线，dubbo会聚合本地的资源去istio请求数据，并解析响应和刷新本地缓存池数据，最后再关闭定时任务。
踩坑点：

- 采用全局共享的定时任务池，不能进行关闭，否则会影响其他业务。
- 
## 五、感想与总结
在这次功能的改造中，笔者着实掉了一波头发，怎么找bug也找不到的情形不在少数。除了上述提到的坑点之外，其他的坑点包括但不局限于：

- dubbo在某一次迭代里更改了获取k8s证书的方式，授权失败。
- 原本的功能没问题，merge了下master代码，grpc版本与envoy版本不兼容，各种报错，最后靠降低版本成功解决。
- 原本的功能没问题，merge了下master代码，最新分支代码里metadataservice发成了triple，然而在Proxyless模式下只支持dubbo协议，debug了三四天，最后发现需要增加配置。

   ......
但不得不承认，Proxyless Service Mesh确实有它自身的优势和广阔的市场前景。自dubbo3.1.0 release版本之后，dubbo已经实现了Proxyless Service Mesh能力，未来dubbo社区将深度联动业务，解决更多实际生产环境中的痛点，更好地完善service mesh能力。




