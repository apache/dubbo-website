---
type: docs
title: "路由规则"
linkTitle: "路由规则"
weight: 12
description: "使用路由规则管控服务流量。"
---

### 基本思想：基于路由链，采用 Pipeline 的处理方式

![route-rule1.png](/imgs/user/route-rule1.png)


可以把路由链的逻辑简单的理解为 target = rn(...r3(r2(r1(src))))。对于每一个 router 内部的逻辑，可以抽象为输入地址 addrs-in 与 router 中按全量地址 addrs-all 实现切分好的 n 个互不相交的地址池 addrs-pool-1 ... addrs-pool-n 按实现定义好的规则取交集作为输出 addrs-out。以此类推，完成整个路由链的计算。

![route-rule2.png](/imgs/user/route-rule2.png)

另外一方面，如果 router(n) 需要执行 fallback 逻辑的时候，那么需要经过 router(n) 就应该决定好 fallback 逻辑


### fallback 处理原则

由于多个 router 之间多个条件组件之后，很容易出现地址被筛选为空的情况，那么我们需要针对这情况进行 fallback 处理，保证业务在正确性的前提下，能够顺利找到有效地址。

首先我们看一下以下规则

```
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

```
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


```
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

```
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


### 规则规范

#### VirtualService  name 规范，决定 Router 类型

```
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/ScriptRouter
```

VirtualService 中的 name 属性，应以 `应用名/Router类型定义`

Router类型有以下列表：

| name|  Description |
| --- | --- |
| StandardRouter | 完全使用标准 VirtualService 描述的 Router |
| 待补充 | 待补充 |



#### VirtualService

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| hosts | string[] |  一般指应用名 | NO  |
| dubbo | DubboRoute[] | dubbo 路由规则，顺序执行，符合条件立即返回 | NO |


#### DubboRoute

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string | 规则的名字，方便识别规则用意 | NO |
| services | StringMatch[] | 规则生效的服务名列表，可使用具体的服务名，也可以使用正则 * 的方式进行匹配；默认不配置，则代表所有的服务都生效 | |
| fault | dubboFaultInject[] | 故障注入 |  |
| mirror | Destination | 镜像流量 |  |
| retries | DubboRetry[]  | 重试相关 |  |
| timeout | DubboTimeout[] | 超时相关 |  |
| routedetail | DubboRouteDetail[] | 具体的流量规则，顺序执行，符合条件立即返回 | YES |


#### DubboRouteDetail

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string |  | NO |
| match | DubboMatchRequest[] |  |  |
| route | DubboRouteDestination[] | | |
| mirror | Destination |  |  |
| retries | DubboRetry[]  |  |  |
| timeout | DubboTimeout[] |  |  | 


#### DubboMatchRequest

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string |  | NO |
| method | DubboMethodMatch | 方法相关的匹配 |  |
| sourceLabels | map\<string, string\> | 调用端打的相关 lables, 包含应用名、机器分组、机器环境变量信息等; 对于 HSF-JAVA 来说，可以从上报的 URL 拿到对应的 key/value |  |
| attachments | DubboAttachmentMatch | 请求附带的其他信息，比如 HSF 请求上下文、Eagleeye 上下文等 |  |
| headers | map\<string, StringMatch\> | 通用的请求协议字段等，如接口名、方法名、超时等 |  |
| threshold | DoubleMatch | 调用的 subset 列表的机器，占整个 host 的阀值 | |

由于 headers 、attachemes 、method 之间可能存在字段一样重复的情况，TODO 进一步细化

#### DubboMethodMatch

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name_match | StringMatch | 匹配请求中的调用方法名 | NO |
| argc | int | 匹配请求的参数个数 |  |
| args | DubboMethodArg[]| 为 DubboMethodArg 类型的数组，表示每个参数值需要满足的条件 |  |
| argp | StringMatch[] | 匹配请求的参数类型 |  |
| headers | map\<string, StringMatch\> | 预留 |  |

#### DubboMethodArg

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| index | uint32 | 匹配参数的位置，index字段从1开始（即第$index个参数） | YES |
| type | string | 匹配参数的类型，以java的 string 类型为例，该字段取值 java.lang.String，该字段默认为 java.lang.String | |
| str_value | ListStringMatch | 匹配参数的值，根据$type进行解析 ListStringMatcher：匹配 java.lang.String） | NO |
| num_value | ListDoubleMatch | 数值类型匹配 | NO |
| bool_value | BoolMatch | bool 值类型匹配| NO |
| reserve | reserve  | 复杂类型的匹配，暂时不定义| NO |



```
ListOfDubboMethodArgSamples:
- index: 1
  str_value:
      oneof:
      - regex: "*abc*"
      - exact: parameter-1
- index: 2
  type: java.lang.Double
  num_value:
      oneof:
      - range:
          start: 100.1
- index: 3
  type: java.lang.Boolean
- index: 4 
  type: java.lang.Integer
  num_value:
      oneof:
      - range:
          start: 1
          end: 100
```

#### ListStringMatch

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| oneof | StringMatch[] | 任何一个 StringMatch 匹配则匹配 | |

#### StringMatch
| Field | Type | Description | Required |
| --- | --- | --- | --- |
| exact | string (oneof)  | exact string match | |
| prefix | string (oneof)  | prefix-based match | |
| regex | string (oneof)  |RE2 style regex-based match (https://github.com/google/re2/wiki/Syntax)  | |
| noempty | string (oneof)  | no empty string | |
| empty | string (oneof)  | empty string | |


#### ListDoubleMatch
ListDoubleMatch 用于匹配 int/long/double 类型的数值参数

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| oneof | DoubleMatch[] | 任何一个 DoubleMatch 匹配则匹配 | |

#### DoubleMatch

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| exact | double(oneof)  | 数值完全匹配| |
| range | DoubleRangeMatch(oneof)  | 数值范围匹配 | |
| mode | double | 取模操作，需要与上面两个语义一起配置使用 | |

#### DoubleRangeMatch

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| start | double | 数值大于或等于 | |
| end | double  | 数值小于 | |


#### BoolMatch
| Field | Type | Description | Required |
| --- | --- | --- | --- |
| exact | bool(oneof) | true/false ,完全匹配 | |

#### ObjectMatch

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| type | string | 匹配参数的类型，以java的 string 类型为例，该字段取值 java.lang.String，该字段默认为 java.lang.String | |
| str_value | ListStringMatch | 匹配参数的值，根据$type进行解析 ListStringMatcher：匹配 java.lang.String） | NO |
| num_value | ListDoubleMatch | | NO |
| bool_value | BoolMatch | | NO |



#### DubboAttachmentMatch

| Field | Type | Description | Required |
| --- | --- | --- | --- |
| eagleeyecontext| map\<string, StringMatch\> | 鹰眼上下文 | NO |
| dubbocontext| map\<string, StringMatch\> | Dubbo 请求上下文 | NO |
| reserve | reserve | reserve | reserve | 

#### DubboRouteDestination
| Field | Type | Description | Required |
| --- | --- | --- | --- |
| destination | DubboDestination | 路由目标 Destination  | YES |
| weight | int  | 路由权重  | NO  |

#### DubboDestination
| Field | Type | Description | Required |
| --- | --- | --- | --- |
| host | string | 注册中心里面对应的 key 值，现在是接口名 |YES|
| subset | string | | |
| port | PortSelector| | |
| fallback | DubboDestination | fallback 到的另外一个地址列表 | |


#### DestinationRule

与 DestinationRule 相关的 ServiceEntry/WorkloadEntry 等定义与开源保持一致


| Field | Type | Description | Required |
| --- | --- | --- | --- |
| host | string |  |  |
| trafficPolicy | TrafficPolicy | | |
| subsets | Subset[] | One or more named sets that represent individual versions of a service. Traffic policies can be overridden at subset level. |  |

#### Subset
| Field | Type | Description | Required |
| --- | --- | --- | --- |
| name | string |  |  |
| labels | map<string, string> | | |
| trafficPolicy | trafficPolicy | | |


### 规则示例

#### 类 groovy 脚本动态路由

```
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/StandardRouter
spec:
  hosts:
  - demo
  dubbo:
    - services:
      - exact: com.taobao.hsf.demoservice:1.0.0
      routedetail:
       - name: sayHello-route
         match: 
          - method:
             name_match: 
               exact: "s-method"
             argc: 5
             args:
               - index: 2
                 type: double
                 num_value:
                   oneof:
                   - range:
                       start: 100.1
               - index: 1
                 type: string 
                 str_value:
                   oneof:
                   - regex: "*abc*"
                   - exact: parameter-1
               - index: 3
                 type: bool
               - index: 4 
                 type: int
                 num_value:
                   oneof:
                   - range:
                       start: 1
                       end: 100
          - sourcelables:
             sigma.ali/appName: "ump2"
         route:
          - destination:
             host: demo
             subset: v1
             fallback:
               host:demo 
               subset: v2

       - name: default-route
         route:
          - destination: 
            host: demo 
            subset: v2
---
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: reviews-route
spec:
  host: demo
  subsets:
    - name: v1
      labels:
        sigma.ali/mg: v1-host
    - name: v2
      labels:
        sigma.ali/mg: v2-host
```

#### 权重路由

```
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: reviews-route
spec:
  hosts:
  - reviews.prod.svc.cluster.local
  dubbo:
    - name: weightRoute
      routedetail:
       - name: weght
         route:
          - destination:
             host: reviews.prod.svc.cluster.local
             subset: v1
             weight: 60

          - destination:
             host: reviews.prod.svc.cluster.local
             subset: v2
             weight: 40


---
apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: reviews-route
spec:
  host: reviews.prod.svc.cluster.local
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
```


### 具体示例

现有名为 Demo 的应用，
提供的服务有:

```
com.taobao.hsf.DemoService:1.0.0

```

服务提供者 IP 列表及 URL 如下

```
10.0.0.1:12200?_p=hessian2&APP=demo&st=na61&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.3:12200?_p=hessian2&APP=demo&st=na610&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.4:12200?_p=hessian2&APP=demo&st=na620&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER


10.0.0.4:12200?_p=hessian2&APP=demo&st=et12&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSH
10.0.0.5:12200?_p=hessian2&APP=demo&st=et12&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSH

10.0.0.6:12200?_p=hessian2&APP=demo&st=SA128&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSZ
10.0.0.7:12200?_p=hessian2&APP=demo&st=SA128&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSZ

10.0.0.8:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.9:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.10:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX

```

```
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/UnitRouter
spec:
  hosts:
  - demo
  dubbo:
    - name: UnitServiceRoute
      services:
        - exact: com.taobao.hsf.DemoService:1.0.0
      routedetail:
       - name: center-env
         match:
          - context:
              hsfcontext:
                user_unit: 
                  exact: CENTER
         route:
          - destination:
              host: demo
              subset: CENTER
              fallback: // 单元化没有 fallback,直接报错
       - name: unsh-env
         match:
          - context:
              hsfcontext:
                user_unit: 
                  exact: UNSH
            route:
             - destination:
                 host: demo
                 subset: UNSH
       - name: unsz-env
         match:
          - context:
              hsfcontext:
                user_unit: 
                  exact: UNSZ
            route:
             - destination:
                 host: demo
                 subset: UNSZ
       - name: zbmix-env
         match:
          - context:
              hsfcontext:
                user_unit: 
                  exact: ZBMIX
            route:
             - destination:
                 host: demo
                 subset: ZBMIX

---- 


apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo/UnitRouter
spec:
  host: demo // 这个和上面的保持一致
  subsets:
    - name: CENTER
      labels:
        sigma.ali/unit: CENTER
    - name: UNSH
      labels:
        sigma.ali/unit: UNSH
    - name: UNSZ
      labels:
        sigma.ali/unit: UNSZ
    - name: ZBMIX
      labels:
        sigma.ali/unit: ZBMIX


----

apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: demo/MachineRouter
spec:
  hosts:
  - demo
  dubbo:
    - name: MachineRoomRouteDefault // 同机房
      services:
        - regex: *
      routedetail:
       - name: na61-samesite-route  // 把 na61 机房的流量打到 na61、na610 机房
         match:
          - sourcelables:
              sigma.ali/site: na61
         route:              
           - destination:
              host: demo
              subset: na61
           - destination:
              host: demo
              subset: na610
              weight: 40
       - name: na62-samesite-route  // 把 na62 机房的流量打到 na62 机房
         match:
          - sourcelables:
             sigma.ali/site: na62
         route:              
          - destination:
             host: demo
             subset: na62
       - name: default // 兜底路由,其他机房的流量随意打
         route:
          - destination:
             host: demo
    .....

--------

apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo/MachineRouter
spec:
  host: demo// 这个和上面的保持一致
  subsets:
    - name: na61
      labels:
        sigma.ali/site: na61
    - name: na610
      labels:
        sigma.ali/site: na610
    - name: na62
      labels:
        sigma.ali/site: na62
    - name: na620
      labels:
        sigma.ali/site: na620
    .....

```



以上面的配置为例，假设消费者在 CENTER 标的 na62 机房，请求上下文中的 user_unit 属于 CENTER

那么我们有以下路由流程：

我们经过 UnitRouter 时，地址被划分为四个部份

CENTER：

```
10.0.0.1:12200?_p=hessian2&APP=demo&st=na61&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.3:12200?_p=hessian2&APP=demo&st=na610&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.4:12200?_p=hessian2&APP=demo&st=na620&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```


UNSH

```
10.0.0.4:12200?_p=hessian2&APP=demo&st=et12&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSH
10.0.0.5:12200?_p=hessian2&APP=demo&st=et12&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSH

```



UNSZ

```
10.0.0.6:12200?_p=hessian2&APP=demo&st=SA128&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSZ
10.0.0.7:12200?_p=hessian2&APP=demo&st=SA128&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSZ

```

UNZBMIX

```
10.0.0.8:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.9:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.10:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX

```

因为 user_unit 属于 CENTER ，所以我们选择 CENTER 的部分，作为 MachineRoomRouter 的地址输入，即为

CENTER

```
10.0.0.1:12200?_p=hessian2&APP=demo&st=na61&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.3:12200?_p=hessian2&APP=demo&st=na610&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.4:12200?_p=hessian2&APP=demo&st=na620&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```

在第二步中，MachineRoomRoute 可以被划分为五个部份


na61

```
10.0.0.1:12200?_p=hessian2&APP=demo&st=na61&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```


na610

```
10.0.0.3:12200?_p=hessian2&APP=demo&st=na610&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```

na62

```
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.8:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.9:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.10:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX

```

na620

```
10.0.0.4:12200?_p=hessian2&APP=demo&st=na620&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```

fallback

```
10.0.0.1:12200?_p=hessian2&APP=demo&st=na61&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.3:12200?_p=hessian2&APP=demo&st=na610&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.4:12200?_p=hessian2&APP=demo&st=na620&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER


10.0.0.4:12200?_p=hessian2&APP=demo&st=et12&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSH
10.0.0.5:12200?_p=hessian2&APP=demo&st=et12&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSH

10.0.0.6:12200?_p=hessian2&APP=demo&st=SA128&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSZ
10.0.0.7:12200?_p=hessian2&APP=demo&st=SA128&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSZ

10.0.0.8:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.9:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.10:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX

```

由于消费者在 na62 机房发起调用，匹配了

```
       - name: na62-samesite-route  // 把 na62 机房的流量打到 na62 机房
         match:
          - sourcelables:
             sigma.ali/site: na62
         route:              
          - destination:
             host: demo
             subset: na62

```


这个规则，那么就是选取

na62

```
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.8:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.9:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.10:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX

```

而 UnitRouter 给 MachineRoomRouter 的输入为

CENTER

```
10.0.0.1:12200?_p=hessian2&APP=demo&st=na61&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.3:12200?_p=hessian2&APP=demo&st=na610&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.4:12200?_p=hessian2&APP=demo&st=na620&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```


两个取交集的结果为

```
 10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```

这个结果将做为一下路由的输出,重复前面的动作；

如果这个路由规则已经结束，那么调用的地址将为

```
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```

