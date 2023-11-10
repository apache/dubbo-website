---
description: Service Mesh
feature:
    description: |
      Flexible data plane (Proxy & Proxyless) deployment options, seamlessly integrating with the Istio control plane governance ecosystem.
    title: Service Mesh
linkTitle: Service Mesh
title: Service Mesh
type: docs
weight: 9
working-in-progress: true
---

Dubbo Mesh is Dubbo's comprehensive microservices solution in a cloud-native context. It helps developers integrate Dubbo services with standard Kubernetes Native Service systems, enabling seamless connectivity with leading service mesh products like Istio.

Below is the deployment architecture diagram for Dubbo Mesh.

![Dubbo-Mesh](/imgs/v3/mesh/mix-mesh.png)

* Control Plane: Istio serves as the unified control plane, providing cluster-wide capabilities like Kubernetes adaptation, service discovery, certificate management, observability, and traffic management.
* Data Plane: Dubbo application instances act as data plane components and support two deployment modes:
    * Proxy Mode: Dubbo and Envoy are deployed in the same pod, and all traffic to and from Dubbo is intercepted and managed by Envoy.
    * Proxyless Mode: Dubbo instances are deployed independently, communicating directly with each other and interacting directly with the control plane via the xDS protocol.

For general content on service mesh architecture and why you might want to integrate with the Istio control plane, please refer to the [Istio official website](https://istio.io/). This document will focus on the Dubbo Mesh solution itself.

## Dubbo Mesh

### Proxy Mesh
In Proxy mode, Dubbo is deployed alongside a sidecar like Envoy.

![dubbo-sidecar](/imgs/v3/mesh/dubbo-proxy.png)

The architecture diagram above depicts Dubbo Proxy Mesh deployment:
* Dubbo and Envoy are deployed in the same pod, with Istio managing traffic and governance.
* Dubbo provides programming APIs and RPC communication capabilities for business applications, while other capabilities like address discovery, load balancing, and routing are delegated to Envoy, which intercepts all incoming and outgoing traffic.
* The control plane distributes configurations to Envoy via the xDS protocol, as indicated by the dashed lines in the diagram.

In Proxy mode, using Dubbo3 communication layers like Triple, gRPC, and REST that are based on HTTP can result in better gateway penetration and performance.

### Proxyless Mesh
In Proxyless mode, there are no proxy components like Envoy. Dubbo's processes are deployed independently and communicate directly. Istio's control plane interacts with Dubbo processes for governance via the xDS protocol.

![dubbo-proxyless](/imgs/v3/mesh/dubbo-proxyless.png)

In Proxyless mode, Dubbo deployment is basically the same as before, but the Dubbo3 SDKs directly implement xDS protocol parsing.

#### Why Proxyless Mesh?

While Proxy mode offers many advantages, such as smooth upgrades, multi-language support, and minimal business intrusion, it also introduces some challenges:
* Sidecar communication adds extra performance overhead, especially noticeable in complex network topologies.
* The presence of a sidecar complicates application lifecycle management.
* Not all environments can accommodate Sidecar deployment and request interception.

In Proxyless mode, Dubbo processes continue to communicate directly:
* There is no additional Proxy-related overhead, making it more suitable for performance-sensitive applications.
* It simplifies legacy system migration.
* The architecture is simple and easy to manage.
* It is suitable for almost all deployment environments.

## Sample Tasks
After acquiring sufficient theoretical knowledge, we recommend that you visit the following [examples](/en/overview/tasks/mesh) for hands-on practice.

## Visualization
We recommend using [Dubbo Admin](/zh-cn/overview/tasks/deploy) as the visualization console for your Dubbo cluster. It is compatible with all Kubernetes, Mesh, and non-Mesh architecture deployments.

Additionally, you can use [Istio's official recommended visualization tools](https://istio.io/latest/docs/tasks/observability/kiali/) to manage your Dubbo Mesh cluster.

## Integration with Non-Istio Control Planes
Dubbo Mesh itself is not tied to any control plane product implementation. You can use Istio, Linkerd, Kuma, or any control plane product that supports the xDS protocol. The same applies to Sidecars.

If you have already experienced the [Dubbo Mesh based on Istio](/) sample tasks and find that Istio meets your governance needs for Dubbo Mesh, then adopting Istio as your control plane is the preferred solution.

If you find that Dubbo's capabilities are limited in Istio mode and need those capabilities, you may consider integrating Dubbo's control plane to replace Istio for better native Dubbo support and performance. For details, please refer to [Dubbo Mesh Sample Tasks based on Custom Dubbo Control Plane](/).

> In short, this is a customized version of the control plane released by the Dubbo community based on Istio. For installation and capability differences of Dubbo's control plane, please refer to the sample task link above.
