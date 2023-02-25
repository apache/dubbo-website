---
type: docs
title: Proxyless Service Mesh
keywords: proxyless service mesh
---

## 1. What is Proxyless Service-Mesh (No Proxy Service Mesh) ?

### 1.1 Brief Analysis of Service Mesh

Istio is the most popular open source service mesh today. It consists of a control plane and a data plane. Its architecture is as follows. The picture is taken from [istio official website](https://istio.io/)

![After using Istio](/imgs/docs3-v2/golang-sdk/concept/mesh/proxyless_service_mesh/service-mesh.svg)

The control plane located in the lower half of the figure is responsible for the delivery of resources such as configuration, service information, and certificates. The data plane located in the upper part pays attention to the communication traffic between services; the traditional service grid intercepts all business network traffic through proxy, and the proxy needs to perceive the configuration resources issued by the control plane, so as to control the direction of network traffic as required .

In the Istiod environment, its control plane is a process called istiod and the network proxy is envoy. istiod obtains service information by monitoring K8S resources such as Service and Endpoint, and sends these resources to the network agent on the data plane through the XDS protocol. Envoy is an independent process that runs with the business application Pod in the form of a sidecar (sidecar). It shares the same host network with the application process and hijacks the network traffic of the business application by modifying the routing table.

Service Mesh can solve many problems in microservice scenarios. With the expansion of cluster size and the growth of business complexity, container orchestration solutions based on native k8s will be difficult to cope with, and developers have to face huge service governance challenges. Service Mesh solves this problem very well. It encapsulates service governance requirements in the control plane and proxy, and business developers only need to focus on business logic. After the application is deployed, the operation and maintenance personnel only need to modify the configuration to implement functions such as fault recovery, load balancing, and gray release, which greatly improves the efficiency of R&D and iteration.

Istio's sidecar accompanies the entire life cycle of the business application process through container injection, and is non-invasive to the business application, which solves the problems of business application migration, multi-language, and infrastructure coupling. But this also brings problems of high resource consumption and increased request delay.

Service provides a good idea for service governance, decoupling infrastructure from business logic, so that application developers only need to focus on business. On the other hand, due to the disadvantages of sidecar, we can consider using sdk instead of sidecar to support the data plane.

### 1.2 Proxyless Service-Mesh

Agentless service grid is a new concept proposed in recent years. Open source communities such as isito, gRPC, and brpc have all explored and practiced in this direction. The agentless service grid framework is introduced by business applications in the form of SDK, and is responsible for communication and governance between services. The configuration from the control plane is directly sent to the service framework, and the service framework replaces the functions of the above sidecar.

![img](/imgs/docs3-v2/golang-sdk/concept/mesh/proxyless_service_mesh/894c0e52-9d34-4490-b49b-24973ef4aabc.png)

The main capabilities of the service framework (SDK) can be summarized as the following three points:

1. Connect to the control plane and monitor configuration resources.
2. Docking applications, providing developers with a convenient interface.
3. Connect to the network and respond to traffic rules according to resource changes.

### 1.3 Advantages and disadvantages of Proxyless

advantage:

- Performance: The network call in the agentless mode is a point-to-point direct communication, and the network delay will be much smaller than that in the agent mode.
- Stability: The proxyless mode is a single process, with a simple topology, easy debugging, and high stability.
- Framework integration: There are already many sdk-mode service frameworks on the market, and after switching to mesh, they have the ability to reuse frameworks
- Resource consumption: no sidecar, low resource consumption

shortcoming:

- Language binding: need to develop sdk in multiple languages
- Low portability: It is impossible to upgrade the infrastructure non-intrusively by switching the form of sidecar.

Generally speaking, the Proxyless architecture is more suitable for use in production environments due to its high performance and high stability.

## 2. Dubbo-go and Proxyless Service-Mesh

### 2.1 Design of Dubbo-go in Proxyless Service-Mesh scene

#### Service Registration Discovery

Dubbo-go itself has scalable service registration and discovery capabilities, and we have adapted the implementation of the registration center for the service mesh scenario. Developers can register dubbo-go application information on the istiod control plane. The client application can query the registered interface data to complete the service discovery process.

![img](/imgs/docs3-v2/golang-sdk/concept/mesh/proxyless_service_mesh/454d1e31-0be3-41fe-97ec-f52673ebf74f.png)

1. Developers use the dubbogo-cli tool to create application templates and publish Deployment / Service to the cluster.
2. The server pulls the full amount of CDS and EDS, compares the local IP, and gets the host name of the current application. And register all the mappings from interface names to host names of this application on Istiod.
3. The client pulls the mapping from the full interface name to the host name from istiod and caches it locally. When a call needs to be made, the local cache is queried, the interface name is converted to a host name, and then pulled to the full endpoint corresponding to the current cluster through CDS and EDS.
4. All endpoints pass through Dubbo-go's built-in Mesh Router to filter out the final subset of endpoints and make requests according to the configured load balancing strategy.

Developers only need to pay attention to the interface throughout the process, and do not need to care about the host name and port information at all. That is, the server developer only needs to implement the pb interface and expose it using the framework; the client developer only needs to introduce the pb interface and initiate a call directly.

#### Traffic management

Dubbo-go has routing capabilities, subscribes to routing configuration from istiod through the xds protocol client, and updates to local routing rules in real time, so as to realize service management. Dubbo-go is compatible with the traffic governance rules of the istio ecology. By configuring Virtual Service and Destination Rule, the marked traffic can be routed to a specified subset, and it can also be used more deeply in scenarios such as grayscale release and flow switching.

#### Cloud Native Scaffolding

dubbogo-cli is a sub-project of the Apache/dubbo-go ecosystem, which provides developers with convenient functions such as application template creation, tool installation, and interface debugging to improve user R&D efficiency.

For details, please refer to [[dubbogo-cli tool]](/en/docs3-v2/golang-sdk/refer/use_dubbogo_cli/)

## 3. Advantages of Dubbo-go-Mesh

### 3.1 Interface-level service discovery

The previous article introduced the advantages of discovery through interface-level service registration, that is, developers do not need to care about downstream host names and port numbers, but only need to introduce interface stubs, or implement interfaces, and start them through the framework.

### 3.2 High Performance

We deployed the istio environment in the k8s cluster, and tested the gRPC service call in sidecar mode and the dubbo-go application service call in Proxyless mode. It is found that proxyless is an order of magnitude less than sidecar mode in terms of request time consumption, that is, the performance is improved by about ten times.

### 3.3 Cross-ecology

Dubbo-go is a service framework that spans multiple ecosystems.

- mesh ecology

  Developers can use Dubbo-go for application development while using the powerful capabilities provided by the istio ecosystem.

- gRPC ecology

  - Dubbo-go supports interoperability with gRPC services, HTTP2 protocol stack.
  - Dubbo-go uses pb serialization by default, high performance.

- Dubbo Ecology

  - Multilingual advantage, can realize go-java application intercommunication.
  - Compatible with pixiu gateway, convenient for service exposure and protocol conversion.
  - Use Dubbo-go ecological components.
