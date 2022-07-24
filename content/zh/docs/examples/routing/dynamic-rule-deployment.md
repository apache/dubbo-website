---
type: docs
title: "动态路由"
linkTitle: "动态路由"
weight: 15
description: "类groovy脚本动态路由。"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh//docs3-v2/java-sdk/advanced-features-and-usage/service/routing/mesh-style/dynamic-rule-deployment/)。
{{% /pageinfo %}}

```yaml
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