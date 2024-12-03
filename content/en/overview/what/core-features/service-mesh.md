---
aliases:
    - /en/overview/core-features/service-mesh/
    - /en/overview/mannual/java-sdk/concepts-and-architecture/mesh/
    - /en/overview/core-features/service-mesh/
description: Service Mesh
feature:
    description: |
        Flexible data plane (Proxy & Proxyless) deployment forms support, seamlessly integrating with the Istio control plane governance system.
    title: Service Mesh
linkTitle: Service Mesh
title: Service Mesh
type: docs
weight: 9
working-in-progress: true
---



Dubbo Mesh is Dubbo's comprehensive microservice solution in the context of cloud-native, helping developers integrate Dubbo services with the standard Kubernetes Native Service system, allowing Dubbo applications to seamlessly integrate with mainstream service mesh products like Istio.

Below is the deployment architecture diagram of Dubbo Mesh

![Dubbo-Mesh](/imgs/v3/mesh/mix-mesh.png)

* Control Plane. Istio serves as the unified control plane, providing capabilities such as Kubernetes adaptation, service discovery, certificate management, observability, and traffic governance for the cluster.
* Data Plane. Dubbo application instances act as data plane components, supporting two deployment modes:
    * Proxy Mode. The Dubbo process and Envoy are deployed in the same pod, with all traffic to and from Dubbo intercepted by the Envoy proxy, which performs traffic control.
    * Proxyless Mode. The Dubbo process is deployed independently, with direct communication between processes, interacting directly with the control plane via the xDS protocol.

For more information on service mesh architecture and why to integrate with the Istio control plane, please refer to the [Istio official website](https://istio.io/). This document does not cover these general topics but focuses on the Dubbo Mesh solution itself.

## Dubbo Mesh

### Proxy Mesh
In proxy mode, Dubbo is deployed together with Envoy and other sidecars (Proxy or Sidecar).

![dubbo-sidecar](/imgs/v3/mesh/dubbo-proxy.png)

Above is the deployment architecture diagram of Dubbo Proxy Mesh
* Dubbo and Envoy are deployed in the same Pod, with Istio achieving unified traffic and governance control.
* Dubbo only provides business application programming APIs and RPC communication capabilities, while other traffic control capabilities such as address discovery, load balancing, and routing are offloaded to Envoy. Envoy intercepts all incoming and outgoing traffic and performs routing and other service governance tasks.
* Configuration distribution between the control plane and Envoy is done via the xDS protocol, as shown by the dashed lines in the diagram.

In Proxy mode, using HTTP-based communication protocols like Triple, gRPC, and REST in Dubbo3 can achieve better gateway penetration and performance experience.

### Proxyless Mesh
In Proxyless mode, there are no proxy components like Envoy. The Dubbo process remains independently deployed and communicates directly, with the Istio control plane interacting with the Dubbo process for governance capabilities via the xDS protocol.

![dubbo-proxyless](/imgs/v3/mesh/dubbo-proxyless.png)

In Proxyless mode, Dubbo deployment remains largely consistent with the previous service mesh, directly implementing xDS protocol parsing through different language versions of the Dubbo3 SDK.

#### Why Proxyless Mesh is Needed

Proxy mode effectively achieves governance capabilities and has many advantages, such as smooth upgrades, multi-language support, and minimal business intrusion. However, it also brings some additional issues, such as:
* Sidecar communication introduces additional performance overhead, which becomes particularly evident in complex network call topologies.
* The presence of sidecars complicates the lifecycle management of applications.
* Deployment environments are limited, and not all environments can meet the requirements for sidecar deployment and request interception.

In Proxyless mode, Dubbo processes continue to maintain direct communication:
* No additional proxy relay overhead, making it more suitable for performance-sensitive applications.
* More conducive to smooth migration of legacy systems.
* Simple architecture, easy to operate and deploy.
* Suitable for almost all deployment environments.

## Example Tasks
Having understood enough theoretical knowledge, we recommend you visit the following [examples](../../tasks/mesh) for hands-on practice.

## Visualization
We recommend using [Dubbo Admin](../../tasks/deploy) as the visual control console for your Dubbo cluster. It is compatible with all Kubernetes, Mesh, and non-Mesh architecture deployments.


In addition, you can use the [officially recommended visualization tool by Istio](https://istio.io/latest/docs/tasks/observability/kiali/) to manage your Dubbo Mesh cluster.

## Integrating with Non-Istio Control Planes
Dubbo Mesh itself does not bind to any specific control plane product implementation. You can use Istio, Linkerd, Kuma, or any control plane product that supports the xDS protocol, and the same applies to Sidecar.

If you have fully experienced the [Dubbo Mesh based on Istio](/) example task and found that Istio meets your Dubbo Mesh governance needs well, then adopting Istio as your control plane is the preferred solution.

If you find that some Dubbo capabilities are limited under the Istio mode, and these capabilities are exactly what you need, then you need to consider integrating the Dubbo control plane. Use the Dubbo control plane to replace Istio to gain more native Dubbo system capabilities and better performance experience. For details, please refer to the [Dubbo Mesh example task based on the Dubbo custom control plane](/).

> In short, this is a custom version control plane based on Istio released by the Dubbo community. For differences in Dubbo control plane installation and capabilities, please refer to the example task link above.

## Migration Plan for Legacy Systems
### How to solve the problem of registry data synchronization?
Address Synchronization

### How to solve the problem of Dubbo2 protocol communication?

Aeraki Mesh
