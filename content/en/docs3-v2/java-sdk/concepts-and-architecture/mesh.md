---
type: docs
title: "Dubbo Mesh"
linkTitle: "Dubbo Mesh"
weight: 5
---

From the design concept, Dubbo Mesh emphasizes the unified control, standardization and governance capabilities of the control plane, while giving more choices on the data plane, including deployment modes such as Sidecar Mesh and Proxyless Mesh. Multiple deployment models provide enterprises with more choices. Through the hybrid deployment model, while realizing the sharing of the service governance control plane, it can better respond to the deployment requirements of different scenarios (performance, deployment complexity, etc.), and adapt to complex infrastructure environment and improve the availability of the architecture as a whole.

## background
In the context of cloud native, if we understand Service Mesh as the underlying infrastructure, in the Mesh architecture, some of the capabilities of microservice governance that were previously coupled in the business process are being taken over by Mesh. The traditional microservice framework pays more attention to RPC protocols and programming. Model. The following is an architecture diagram of the popular Mesh product Istio:

![istio](/imgs/v3/mesh/istio.jpg)

Under the Mesh architecture
* The unified control plane provides certificate management, observability, traffic governance and other capabilities
* Sidecar makes the SDK lighter and less intrusive, better implementing transparent upgrades, traffic interception, etc.

## Dubbo Mesh Overall Architecture

![istio](/imgs/v3/mesh/dubbo-mesh-arc.png)

* The data plane performs RPC communication based on the Triple protocol;
* The address discovery model adopts application-level service discovery to support ultra-large-scale instance clusters while providing richer service governance capabilities;
* The Dubbo Mesh control plane is based on the industry's mainstream Istio extension, supports Dubbo service discovery customization solutions, and provides richer traffic control capabilities;
* The data plane supports two modes: ThinSDK + Sidecar (such as Envoy) and Proxyless;


> For old Dubbo2 users or users who have upgraded Dubbo3 but have not yet migrated new features, you can consider referring to Dubbo solutions provided by other Mesh open source communities (such as Aeraki).
> However, some functions may be limited, and there will be certain performance and capacity bottlenecks.

### Dubbo Sidecar Mesh
Dubbo provides a ThinSDK deployment mode. In this mode, Dubbo ThinSDK will only provide business application-oriented programming APIs and RPC transmission and communication capabilities, and the rest of the service management
Including address discovery, load balancing, routing addressing, etc., all sink to Sidecar, and Sidecar is responsible for direct communication with the control plane and receiving various traffic control rules. The following is a basic deployment architecture diagram. Dubbo ThinSDK and Sidecar are deployed in the same pod or container. By deploying an independent control plane on the periphery, unified control of traffic and governance is achieved. The control plane and Sicecar are configured and distributed through the xDS protocol shown in the dotted line in the figure, and the communication between Dubbo processes is no longer a direct connection mode, but instead passes through the Sidecar proxy, which intercepts all incoming and outgoing traffic and completes routing and addressing, etc. Service governance tasks.

![dubbo-sidecar](/imgs/v3/mesh/dubbo-sidecar.png)

The community recommends Envoy as a sidecar, and the communication protocol uses Triple for better gateway penetration and performance experience. For users who are still using the Dubbo2 protocol who cannot upgrade Triple temporarily, they can refer to the Dubbo2 protocol support solutions provided by Envoy and Aeraki Mesh.

The Mesh architecture of the ThinSDK + Sidecar mode has many advantages, such as smooth upgrade, multi-language, and small business intrusion, but it also brings some additional problems, such as:
* Sidecar communication brings additional performance loss, which will become especially obvious in network calls with complex topologies.
* The existence of Sidecar makes the life cycle management of the application more complicated.
* The deployment environment is limited, not all environments can meet the requirements of Sidecar deployment and request interception.

For detailed scheme design and examples, please refer to
* [Dubbo ThinSDK Proposal](/zh-cn/overview/tasks/mesh)
* [Example of use](/zh-cn/overview/tasks/mesh)

### Dubbo Proxyless Mesh
As a supplement to the ThinSDK + Sidecar model, the Dubbo community has conceived and thought about the direct connection of Dubbo to the control plane since a long time ago, which is currently called the Proxyless Mesh model. The Proxyless mode brings microservices back to the deployment architecture of the 2.x era. As shown in the figure below, it is very similar to the Dubbo classic service governance model we saw above, so this model is not new. Dubbo has been such a design model from the very beginning. However, compared with the Mesh architecture, Dubbo2 does not emphasize the unified management and control of the control plane, which is exactly what Service Mesh emphasizes. It emphasizes the standardized management, control and governance of traffic, observability, certificates, etc., which is also an advanced part of the Mesh concept. .

![dubbo-proxyless](/imgs/v3/mesh/dubbo-proxyless.png)

Through the Dubbo3 SDK of different language versions, the xDS protocol analysis can be directly realized, and the Dubbo process can directly communicate with the control plane (Control Plane), so as to realize the unified control of traffic control, service governance, observability, security, etc. of the control plane, avoiding the Sidecar mode The resulting performance loss and complexity of the deployment architecture.

> Proxyless mode supports both Dubbo2 and Triple protocols, but only supports the address model of application-level service discovery.

In the Dubbo3 Proxyless architecture mode, the Dubbo process will directly communicate with the control plane, and the Dubbo process will continue to maintain a direct communication mode. We can see the advantages of the Proxyless architecture:
* There is no additional proxy loss, so it is more suitable for performance-sensitive applications
* More conducive to smooth migration of legacy systems
* Simple architecture, easy operation and maintenance deployment
* Suitable for almost all deployment environments

For detailed scheme design and examples, please refer to
* [Dubbo Proxyless Mesh](/zh-cn/overview/tasks/mesh)
* [Example of use](/zh-cn/overview/tasks/mesh)

### Dubbo Control Plane Governance Rules
TBD

Dubbo SDK provides very flexible configurations to control service governance behaviors, such as interface granular service address discovery capabilities, interface granular configuration synchronization, etc. These capabilities make application development and deployment more flexible. However, some advanced functions may be limited under the general Mesh deployment scheme or product, which generally affects the ease of use and flexibility. To this end, Dubbo plans to provide self-developed control surface products to maximize the capabilities of Dubbo3 in the Mesh system.
