---
type: docs
title: "Dynamic Routing"
linkTitle: "Dynamic Routing"
weight: 15
description: "Dynamic routing for groovy scripts."
---

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
      route details:
        - name: sayHello-route
          match:
            -method:
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
              - sourceables:
                  sigma.ali/appName: "ump2"
          route:
            -destination:
              host: demo
              subset: v1
              fallback:
                host: demo
                subset: v2

        - name: default-route
          route:
            -destination:
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