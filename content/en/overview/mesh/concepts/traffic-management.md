---
description: Describes Dubbo traffic routing and control capabilities.
linkTitle: Traffic Management
title: Traffic Management
type: docs
weight: 1
---
> The service mesh is currently in an early experimental stage. Resource naming may change.

## Introduction

The traffic management model of Dubbo Service Mesh is aligned with Istio, but optimized for the Dubbo protocol and sidecarless architecture. The core components are:

- **ServiceRoute**: defines routing rules and controls how requests are routed to service instances.
- **SubsetRule**: defines service subsets and traffic policies, such as load balancing, connection pools, TLS settings, etc.

By configuring these resources, you can achieve traffic routing, load balancing, and resilience without modifying application code.

## ServiceRoute

ServiceRoute is the core resource used to define routing rules in Dubbo Service Mesh, corresponding to Istio's VirtualService. It allows you to configure how requests are routed to different versions or instances of a service.

ServiceRoute enables you to:
- Route traffic to different versions of a service (for example, v1 and v2).
- Route based on request attributes such as headers and paths.
- Configure weighted routing for canary and gradual rollouts.
- Configure timeouts and retries for resilience.

### ServiceRoute example

The following example shows how to configure a ServiceRoute to split traffic:

```yaml
apiVersion: networking.dubbo.apache.org/v1
kind: ServiceRoute
metadata:
  name: provider-weights
  namespace: grpc-app
spec:
  hosts:
  - provider.grpc-app.svc.cluster.local
  http:
  - route:
    - destination:
        host: provider.grpc-app.svc.cluster.local
        subset: v1
      weight: 10
    - destination:
        host: provider.grpc-app.svc.cluster.local
        subset: v2
      weight: 90
```

#### hosts field

The `hosts` field specifies the services that the ServiceRoute applies to. You can use either fully qualified domain names (FQDN) or short names. The control plane automatically resolves short names to FQDNs.

#### Routing rules

Routing rules define how requests are routed to target services. Each rule can contain:

- **Match conditions**: based on request attributes such as path or headers.
- **Destination**: target service host, subset, and port.
- **Weight**: the proportion of traffic sent to each destination.

#### Routing rule priority

When multiple ServiceRoutes match the same service, the control plane applies them in creation-time order. More specific match conditions take precedence over generic ones.

### More about routing rules

ServiceRoute supports more complex routing scenarios, including:

- **Path-based routing**: route traffic to different service versions based on URL path.
- **Header-based routing**: make routing decisions based on HTTP headers.
- **Delegated routing**: compose and reuse routing rules via the `delegate` field.

## SubsetRule

SubsetRule is the resource used to define service subsets and traffic policies in Dubbo Service Mesh, corresponding to Istio's DestinationRule. It allows you to organize service instances into logical subsets and configure traffic policies for each subset.

### Load balancing options

SubsetRule supports multiple load balancing strategies, configured via `LocalityLbSetting` in MeshConfig:

- **Locality-based load balancing**: prefer instances in the same region or zone.
- **ROUND_ROBIN**: distribute requests sequentially across instances.
- **LEAST_CONN**: route requests to instances with the fewest active connections.

### SubsetRule example

The following example shows how to create subsets and configure traffic policies:

```yaml
apiVersion: networking.dubbo.apache.org/v1
kind: SubsetRule
metadata:
  name: provider-versions
  namespace: grpc-app
spec:
  host: provider.grpc-app.svc.cluster.local
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
    tls:
      mode: ISTIO_MUTUAL
```

Subsets are selected based on Pod labels. In the example above, Pods with label `version: v1` are placed into subset `v1`, and Pods with `version: v2` into subset `v2`.

## Gateway

Gateways provide unified control over ingress and egress traffic in the mesh, allowing you to specify which traffic is allowed to enter or leave the mesh.

Dubbo mesh gateway is implemented based on Kubernetes Gateway API, using Pixiu Gateway as the data plane proxy.

### Gateway example

```yaml
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: gateway
  namespace: dubbo-ingress
spec:
  gatewayClassName: dubbo
  listeners:
  - name: default
    hostname: "*.example.com"
    port: 80
    protocol: HTTP
    allowedRoutes:
      namespaces:
        from: All
```

## Related content

- [Quickstart](/en/overview/mesh/getting-started/)
- [Security concepts](/en/overview/mesh/concepts/security/)
- [Observability](/en/overview/mesh/concepts/observability/)

