---
type: docs
title: "Use Case"
linkTitle: "Use Case"
weight: 18
description: "Make routing rules based on the actual situation."
---

### Application Services

```yaml
com.taobao.hsf.DemoService:1.0.0
```

### service address

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
### Routing rules

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
      route details:
       - name: center-env
         match:
          - context:
              hsfcontext:
                user_unit:
                  exact: CENTER
         route:
          -destination:
              host: demo
              subset: CENTER
              fallback: // There is no fallback in unitization, and an error is reported directly
       - name: unsh-env
         match:
          - context:
              hsfcontext:
                user_unit:
                  exact: UNSH
            route:
             -destination:
                 host: demo
                 subset: UNSH
       - name: unsz-env
         match:
          - context:
              hsfcontext:
                user_unit:
                  exact: UNSZ
            route:
             -destination:
                 host: demo
                 subset: UNSZ
       - name: zbmix-env
         match:
          - context:
              hsfcontext:
                user_unit:
                  exact: ZBMIX
            route:
             -destination:
                 host: demo
                 subset: ZBMIX

----


apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo/UnitRouter
spec:
  host: demo // This is consistent with the above
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
    - name: MachineRoomRouteDefault // same machine room
      services:
        - regex: *
      route details:
       - name: na61-samesite-route // Send traffic from na61 computer room to na61, na610 computer room
         match:
          - sourceables:
              sigma.ali/site:na61
         route:
           -destination:
              host: demo
              subset: na61
           -destination:
              host: demo
              subset: na610
              weight: 40
       - name: na62-samesite-route // Send traffic from na62 computer room to na62 computer room
         match:
          - sourceables:
             sigma.ali/site: na62
         route:
          -destination:
             host: demo
             subset: na62
       - name: default // Bottom line routing, traffic from other computer rooms can be sent at will
         route:
          -destination:
             host: demo
    .....

----

----

apiVersion: service.dubbo.apache.org/v1alpha1
kind: DestinationRule
metadata:
  name: demo/MachineRouter
spec:
  host: demo// This is consistent with the above
  subsets:
    - name: na61
      labels:
        sigma.ali/site:na61
    - name: na610
      labels:
        sigma.ali/site:na610
    - name: na62
      labels:
        sigma.ali/site:na62
    - name: na620
      labels:
        sigma.ali/site: na620
    .....

```

### Case Description

Taking the above configuration as an example, assuming that the consumer is in the na62 computer room marked by CENTER, the user_unit in the request context belongs to CENTER

Then we have the following routing flow:

As we pass through the UnitRouter, the address is divided into four parts

+CENTER:

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

Because user_unit belongs to CENTER, we choose the part of CENTER as the address input of MachineRoomRouter, which is

CENTER

```yaml
10.0.0.1:12200?_p=hessian2&APP=demo&st=na61&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.3:12200?_p=hessian2&APP=demo&st=na610&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.4:12200?_p=hessian2&APP=demo&st=na620&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```

In the second step, MachineRoomRoute can be divided into five parts


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

Since the consumer initiates the call in the na62 computer room, it matches

```yaml
       - name: na62-samesite-route // Send traffic from na62 computer room to na62 computer room
         match:
          - sourceables:
             sigma.ali/site: na62
         route:
          -destination:
             host: demo
             subset: na62

```


This rule, then, is to choose

na62

```yaml
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.8:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.9:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX
10.0.0.10:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=UNZBMIX

```

The input of UnitRouter to MachineRoomRouter is

CENTER

```yaml
10.0.0.1:12200?_p=hessian2&APP=demo&st=na61&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.3:12200?_p=hessian2&APP=demo&st=na610&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER
10.0.0.4:12200?_p=hessian2&APP=demo&st=na620&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```


The result of the intersection of the two is

```yaml
 10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```

This result will be used as the output of the next route, repeating the previous actions;

If this routing rule has ended, the address of the call will be

```yaml
10.0.0.2:12200?_p=hessian2&APP=demo&st=na62&v=2.0&_TIMEOUT=3000&_ih2=y&mg=demohost&_CONNECTTIMEOUT=1000&_SERIALIZETYPE=hessian&ut=CENTER

```