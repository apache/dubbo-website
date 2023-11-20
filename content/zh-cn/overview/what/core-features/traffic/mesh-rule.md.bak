---
type: docs
title: "Mesh 路由规则"
linkTitle: "Mesh 路由"
weight: 50
description: ""
---

Dubbo Mesh 路由规则是基于 Istio 的 VirtualService、DestinationRule 改造而来，总体思路和格式可以参考 Istio 流量管控规则参考手册：[Istio VirtualService](https://istio.io/latest/docs/reference/config/networking/virtual-service/) 和 [Istio DestinationRule](https://istio.io/latest/docs/reference/config/networking/destination-rule/)

本文描述了 Dubbo Mesh 路由规则的设计原理，和 Istio 规则的差异等。

### 基本思想
基于路由链，采用Pipeline的处理方式，如下图所示：

![route-rule1.png](/imgs/user/route-rule1.png)


可以把路由链的逻辑简单的理解为 target = rn(...r3(r2(r1(src))))。对于每一个 router 内部的逻辑，可以抽象为输入地址 addrs-in 与 router 中按全量地址 addrs-all 实现切分好的 n 个互不相交的地址池 addrs-pool-1 ... addrs-pool-n 按实现定义好的规则取交集作为输出 addrs-out。以此类推，完成整个路由链的计算。

![route-rule2.png](/imgs/user/route-rule2.png)

另外一方面，如果 router(n) 需要执行 fallback 逻辑的时候，那么需要经过 router(n) 就应该决定好 fallback 逻辑


### fallback 处理原则

由于多个 router 之间多个条件组件之后，很容易出现地址被筛选为空的情况，那么我们需要针对这情况进行 fallback 处理，保证业务在正确性的前提下，能够顺利找到有效地址。

首先我们看一下以下规则

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo-route
spec:
  hosts:
  - demo  // 统一定义为应用名
  dubbo:
  - service:
    - exact: com.taobao.hsf.demoService:1.0.0
    - exact: com.taobao.hsf.demoService:2.0.0
    routedetail:
    - name: sayHello-String-method-route
      match:
      - method:
          name_match:
            exact: "sayHello"
            .....
          argp:
          - string
      route:
      - destination:
          host: demo
          subset: v1
        fallback:
          destination:
            host: demo
            subset: v2
          fallback:
            destination:
              host: demo
              subset: v3

      - name: sayHello-method-route
        match:
        - method:
            name_match:
              exact: "s-method"
        route:
        - destination:
            host: demo
            subset: v2
          fallback:
            destination:
              host: demo
              subset: v3

      - name: interface-route
        route:
        - destination:
          host: demo
          subset: v3

  - service:

      ....
---
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo-route
spec:
  host: demo
  subsets:
  - name: v1
    labels:
      sigma.ali/mg: v1-host

  - name: v2
    labels:
      sigma.ali/mg: v2-host

  - name: v3
    labels:
      sigma.ali/mg: v3-host

```

我们以脚本路由为例，这个脚本路由的匹配条件是遵循一个原则的，就是匹配的范围是从精确到广泛的一个过程，在这个示例来说，就是 sayHello(string)参数 -> sayHello 方法 -> 接口级路由 的一个匹配查找过程。

那么如果我们已经满足某个条件，但是选到的 subset 地址为空，我们将如何进行 fallback 处理呢？

以匹配 sayHello(string)参数 条件为例，我们选择到的是 v1 subset,如果是空，我们可以向上一级是寻找地址，也就是方法级去寻找地址，具体的配置为下

```yaml
       - name: sayHello-String-method-route
         match:
          - method:
             name_match:
               exact: "sayHello"
               .....
             argp:
              - string
         route:
          - destination:
              host: demo
              subset: v1
            fallback:
              destination:
                host: demo
                subset: v2
              fallback:
                destination:
                  host: demo
                  subset: v3
```

此时我们选到的地址是 v2 方法级地址，如果 v2 还是没有地址，根据规则的定义，我们是可以 fallback 到 v3 接口级。

假设我们有一个方法匹配时，如果没有地址，需要不进行 fallback，直接报错，我们可以这样配置


```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo-route
spec:
  hosts:
  - demo  // 统一定义为应用名
  dubbo:
  - service:
    - exact: com.taobao.hsf.demoService:1.0.0
    - exact: com.taobao.hsf.demoService:2.0.0
    routedetail:
      - name: sayHello-String-method-route
        match:
        - method:
            name_match:
              exact: "sayHello"
              .....
            argp:
            - string
        route:
        - destination:
            host: demo
            subset: v1
          fallback:
            destination:
              host: demo
              subset: v2
            fallback:
              destination:
                host: demo
                subset: v3

      - name: sayHello-method-route
        match:
        - method:
            name_match:
              exact: "s-method"
        route:
        - destination:
            host: demo
            subset: v2
          fallback:
            destination:
              host: demo
              subset: v3
      - name: some-method-route
        match:
        - method:
            name_match:
              exact: "some-method"
        route:
        - destination:
            host: demo
            subset: v4

      - name: interface-route
        route:
        - destination:
          host: demo
          subset: v3

  - service:

      ....
---
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo-route
spec:
  host: demo
  subsets:
  - name: v1
    labels:
      sigma.ali/mg: v1-host

  - name: v2
    labels:
      sigma.ali/mg: v2-host

  - name: v3
    labels:
      sigma.ali/mg: v3-host
```

从这个规则我们看出来匹配到 some-method  条件时对应的是 v4 subset，那么 v4 为空时，因为没有配置 fallback ，此时会直接报错

#### fallback 处理原则总结

- 我们应该在 VirtualService route 中配置好 Destination 的 fallback 处理逻辑
- 在 fallback subset 时，如果对应的 subset 也配置有 fallback subset 时，也应递归处理；fallback subset 之间的关系也应该是从具体到广泛
- 我们在编写匹配条件时，应该遵循从 具体条件到广泛条件 的原则

### RouteChain 的组装模式 (目前未实现)

![route-rule3.png](/imgs/user/route-rule3.png)


我们看到上面的图，在路由的过程当中，我们是 Pipeline 的处理方式，Pipeline 的 Router 节点存在顺序，并且每个 Router 都有一个唯一对应的 VirtualService 和 **多个** 相应的 DestinationRule 进行描述。

以 Nacos 上存着的路由规则配置为例，配置的格式如下：

```yaml
DataId: Demo.rule.yaml
GROUP: HSF

content:

VirtualService A
---
DestinationRule A1
---
DestinationRule A2
---
VirtualService B
---
DestinationRule B
---
VirtualService C
---
DestinationRule C
---
...
```

`VirtualService A` 与 `DestinationRule A1` 、`DestinationRule A2` 组成一个 Router A，`VirtualService B` 与 `DestinationRule B` 组成 Router B,以此类推，完成整个 router 链的组装。

### 示例：按比例流量路由规则

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


