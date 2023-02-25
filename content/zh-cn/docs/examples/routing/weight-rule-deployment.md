
---
type: docs
title: "权重路由"
linkTitle: "权重路由"
weight: 16
description: "基于用户自定权重实现路由功能。"
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh-cn//docs3-v2/java-sdk/advanced-features-and-usage/traffic/mesh-style/weight-rule-deployment/)。
{{% /pageinfo %}}

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