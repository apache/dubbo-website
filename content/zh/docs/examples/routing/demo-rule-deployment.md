---
type: docs
title: "使用案例"
linkTitle: "使用案例"
weight: 18
description: "基于实际情况来制定路由规则。"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh//docs3-v2/java-sdk/advanced-features-and-usage/service/routing/mesh-style/demo-rule-deployment/)。
{{% /pageinfo %}}

#### 应用服务

```yaml
com.taobao.hsf.DemoService:1.0.0
```

#### 服务地址

```yaml
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
#### 路由规则

```yaml
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

----

----

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

#### 案例说明

以上面的配置为例，假设消费者在CENTER标的na62机房，请求上下文中的user_unit属于CENTER

那么我们有以下路由流程：

我们经过 UnitRouter 时，地址被划分为四个部份

+ CENTER：

```yaml
10.0.0.1:12200?_p=hessian2&APP=demo&st=na61&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.3:12200?_p=hessian2&APP=demo&st=na610&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.4:12200?_p=hessian2&APP=demo&st=na620&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```


+ UNSH

```yaml
10.0.0.4:12200?_p=hessian2&APP=demo&st=et12&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSH
10.0.0.5:12200?_p=hessian2&APP=demo&st=et12&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSH

```

+ UNSZ

```yaml
10.0.0.6:12200?_p=hessian2&APP=demo&st=SA128&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSZ
10.0.0.7:12200?_p=hessian2&APP=demo&st=SA128&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNSZ

```

+ UNZBMIX

```yaml
10.0.0.8:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.9:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.10:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX

```

因为 user_unit属于CENTER，所以我们选择CENTER的部分，作为MachineRoomRouter的地址输入，即为

CENTER

```yaml
10.0.0.1:12200?_p=hessian2&APP=demo&st=na61&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.3:12200?_p=hessian2&APP=demo&st=na610&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.4:12200?_p=hessian2&APP=demo&st=na620&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```

在第二步中，MachineRoomRoute 可以被划分为五个部份


na61

```yaml
10.0.0.1:12200?_p=hessian2&APP=demo&st=na61&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```


na610

```yaml
10.0.0.3:12200?_p=hessian2&APP=demo&st=na610&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```

na62

```yaml
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.8:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.9:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.10:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX

```

na620

```yaml
10.0.0.4:12200?_p=hessian2&APP=demo&st=na620&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```

##### fallback

```yaml
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

```yaml
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

```yaml
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.8:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.9:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.10:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX

```

而UnitRouter给MachineRoomRouter的输入为

CENTER

```yaml
10.0.0.1:12200?_p=hessian2&APP=demo&st=na61&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.3:12200?_p=hessian2&APP=demo&st=na610&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.4:12200?_p=hessian2&APP=demo&st=na620&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```


两个取交集的结果为

```yaml
 10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```

这个结果将做为一下路由的输出,重复前面的动作；

如果这个路由规则已经结束，那么调用的地址将为

```yaml
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```