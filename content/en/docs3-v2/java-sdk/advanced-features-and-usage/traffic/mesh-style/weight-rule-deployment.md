---
type: docs
title: "Weight Routing"
linkTitle: "Weight Routing"
weight: 16
description: "Realize routing function based on user-defined weight."
---

```yaml
apiVersion: service.dubbo.apache.org/v1alpha1
kind: VirtualService
metadata:
  name: reviews-route
spec:
  hosts:
    - reviews.prod.svc.cluster.local
  dubbo:
    - name: weightRoute
      route details:
        - name: weight
          route:
            -destination:
              host: reviews.prod.svc.cluster.local
              subset: v1
              weight: 60

            -destination:
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