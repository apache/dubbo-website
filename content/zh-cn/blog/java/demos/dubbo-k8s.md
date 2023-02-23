---
title: "Dubbo与Kubernetes集成"
linkTitle: "Dubbo与Kubernetes集成"
tags: ["Java"]
date: 2018-09-30
description: >
    本文主要尝试将Dubbo服务注册到Kubernetes，同时无缝融入Kubernetes的多租户安全体系。
---

## 大体目标

Dubbo的provider不再关心服务注册的事宜，只需要把其Dubbo服务端口打开，由Kubernetes来进行服务的声明和发布；Dubbo的consumer在服务发现时直接发现kubernetes的对应服务endpoints，从而复用Dubbo已有的微服务通道能力。好处是无需依赖三方的软负载注册中心；同时无缝融入Kubernetes的多租户安全体系。Demo的代码参照： https://github.com/dubbo/dubbo-kubernetes

## 闲谈

Kubernates是建立在扩展性的具备二次开发的功能层次丰富的体系化系统

- 首先其最核心的功能是管理容器集群，能管理容器化的集群（包括存储，计算），当然这个是建立在对容器运行时(CRI)，网络接口(CNI),存储服务接口（CSI/FV）的基础上；
- 其次是面向应用(包括无状态/有状态,批处理/服务型应用)的部署和路由能力，特别是基于微服务架构的应用管理，具备了其服务定义和服务发现，以及基于configmap的统一配置能力；
- 在基础资源（主要是抽象底层IaaS的资源）和应用层的抽象模型之上是治理层，包含弹性扩容，命名空间/租户，等。当然，基于其原子内核的基础能力，在Kubernetes的核心之上搭建统一的日志中心和全方位监控等服务是水到渠成的，CNCF更是有其认定推荐。

来张Kubernetes Architecture的一张图解释下上述描述。在2018年Kubernetes往事实的paas底座的标配迈出质的一步，有人说原因在于基于扩展的二次开发能力，有人说在于其声明式编程和背靠Google和Redhat的强大社区运作，我觉得回归本质是在于下图中的**Layered架构和其问题域的领域建模抽象**。

![img](/imgs/blog/k8s/1.png)

以微服务架构视角，Kubernetes在一定意义上是微服务框架（这时较叫微服务平台或toolkit集更合适），支持微服务的服务发现/注册的基本能力。借用如下图做一个简单描述。

![img](/imgs/blog/k8s/2.jpeg)

话题再展开一下，微服务领域涉及众多问题，大概可以用下图说明。

![img](/imgs/blog/k8s/3.jpeg)

Kubernetes解决得只是少部分，而像动态路由，稳定性控制（断路器，隔水舱等），分布式服务追踪等是个空白，这也就是servicemesh要解决的，是在CNCF的Trail Map占有重要一席；当然Dubbo是基本具备完备的微服务，也就是使得其集成到k8s体系下具有相当的意义。Dubbo在serviemesh中基于sidecar的方案是解决跨语言诉求的通用servicemesh方案，需要新开一个话题来展开说；而引用serviemsh的原始定义：

> A service mesh is a dedicated infrastructure layer for handling service-to-service communication. It’s responsible for the reliable delivery of requests through the complex topology of services that comprise a modern, cloud native application. 

> 首先服务网格是一个云原生环境下基础设施层，功能在于处理服务间通信，职责是负责实现请求的可靠传递，被使得被监控跟踪，被治理，最终使得微服务架构被赋予高可控的稳定性和快速的问题定位排查能力。

可以得出现有Dubbo集成云原生基础设施Kubernetes的基础能力而并解决微服务相关核心问题也算是一种狭义上的servicemesh方案，只是是Java领域的罢了；当玩笑理解也行，哈哈。

## 思路/方案

Kubernetes是天然可作为微服务的地址注册中心，类似于Zookeeper， 阿里巴巴内部用到的VIPserver，Configserver。 具体来说，Kubernetes中的Pod是对于应用的运行实例，Pod的被调度部署/启停都会调用API-Server的服务来保持其状态到ETCD；Kubernetes中的service是对应微服务的概念，定义如下

> A Kubernetes Service is an abstraction layer which defines a logical set of Pods and enables external traffic exposure, load balancing and service discovery for those Pods.

概括来说Kubernetes service具有如下特点

- 每个Service都有一个唯一的名字，及对应IP。IP是kubernetes自动分配的，名字是开发者自己定义的。
- Service的IP有几种表现形式，分别是ClusterIP，NodePort,LoadBalance,Ingress。 ClusterIP主要用于集群内通信；NodePort，Ingress，LoadBalance用于暴露服务给集群外的访问入口。

乍一看，Kubernetes的service都是唯一的IP，在原有的Dubbo/HSF固定思维下：Dubbo/HSF的service是由整个服务集群的IP聚合而成，貌似是有本质区别的，细想下来差别不大，因为Kubernetes下的唯一IP只是一个VIP，背后挂在了多个endpoint，那才是事实上的处理节点。此处只讨论集群内的Dubbo服务在同一个kubernetes集群内访问；至于kubernetes外的consumer访问kubernetes内的provider，涉及到网络地址空间的问题，一般需要GateWay/loadbalance来做映射转换，不展开讨论。针对Kubernetes内有两种方案可选： ：

1. DNS： 默认Kubernetes的service是靠DNS插件(最新版推荐是coreDNS)， Dubbo上有个proposal是关于这个的。我的理解是static resolution的机制是最简单最需要支持的一种service discovery机制，具体也可以参考Envoy在此的观点，由于HSF/Dubbo一直突出其软负载的地址发现能力，反而忽略Static的策略。同时蚂蚁的SOFA一直是支持此种策略，那一个SOFA工程的工程片段做一个解释。这样做有两个好处，1）当软负载中心crash不可用造成无法获取地址列表时，有一定的机制Failover到此策略来处理一定的请求。 2）在LDC/单元化下，蚂蚁的负载中心集群是机房/区域内收敛部署的，首先保证软负载中心的LDC化了进而稳定可控，当单元需要请求中心时，此VIP的地址发现就排上用场了。

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB1Kj1ktpkoBKNjSZFEXXbrEVXa-985-213.png)

2. API：DNS是依靠DNS插件进行的，相当于额外的运维开销，所以考虑直接通过kubernetes的client来获取endpoint。事实上，通过访问Kubernetes的API server接口是可以直接获取某个servie背后的endpoint列表，同时可以监听其地址列表的变化。从而实现Dubbo/HSF所推荐的软负载发现策略。具体可以参考代码：

以上两种思路都需要考虑以下两点:

1. Kubernetes和Dubbo对于service的名字是映射一致的。Dubbo的服务是由serviename，group，version三个来确定其唯一性，而且servicename一般其服务接口的包名称，比较长。需要映射Kubernetes的servie名与dubbo的服务名。要么是像SOFA那样增加一个属性来进行定义，这是个大的改动，但最合理；要么是通过固定规则来引用部署的环境变量，可用于快速验证。
2. 端口问题：默认Pod与Pod的网络互通算是解决了，需要验证。

## Demo验证

下面通过阿里云的容器镜像服务和EDAS中的Kubernetes服务来做一次Demo部署。访问阿里云 -> 容器镜像服务。

1. 创建镜像仓库并绑定github代码库。如下图

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB1m.tEtrorBKNjSZFjXXc_SpXa-1892-870.png)

2. 点击管理 **进行创建好的仓库**，通过镜像服务下的构建功能，把demo构建成image，并发布到指定仓库。如下图。

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB1oYqvtcIrBKNjSZK9XXagoVXa-1872-888.png)

3. 切换到企业级分布式应用服务（EDAS）产品，在资源管理 -> 集群 下创建Kubernetes集群并绑定ECS，如下图.

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB1b1p2trZnBKNjSZFKXXcGOVXa-1858-833.png)

4. 应用管理 -》创建应用，**类型为kubernetes应用** 并且指定在容器镜像服务中的镜像。如下图。

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB1b1p2trZnBKNjSZFKXXcGOVXa-1858-833.png)

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB18uzTtdcnBKNjSZR0XXcFqFXa-1820-861.png)

5. 创建完成后，进行应用部署。如下图

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB1fEpEtrorBKNjSZFjXXc_SpXa-1846-783.png)

- 补充应用名不能有大写字母，全部小写，否则有部署失败的问题。

- 在创建应用时，选中镜像后，下一步的按钮无法点击，需要点击选择来继续。

- EDAS有两套独立的Kubernetes服务，一套是基于阿里云的容器服务，一套是Lark自己搞的。本人体验的是后者。

- Docker与IDE集成的开发联调，需要考虑集成IDEA的相关插件。

- 部署时总是出错，感觉Kubernetes服务上哪里有问题。需要进一步排查。

```json
{
  "kind": "Pod",
  "namespace": "lzumwsrddf831iwarhehd14zh2-default",
  "name": "dubbo-k8s-demo-610694273-jq238",
  "uid": "12892e67-8bc8-11e8-b96a-00163e02c37b",
  "apiVersion": "v1",
  "resourceVersion": "850282769"
}, "reason": "FailedSync", "message": "Error syncing pod", "
```
