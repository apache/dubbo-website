# General goal

Dubbo's provider don't care about service registration.Open its Dubbo service port,the declaration and publishment of the service will be executed by kubernetes.
Dubbo's consumer directly discovers the corresponding service endpoints of kubernetes during service discovery procedure, thereby reusing Dubbo's existing microservice channel capabilities.The benefit is that there is no need to rely on any third-party soft-loaded registry and it can be seamlessly integrated into the multi-tenant security system of kubernetes. Reference demo : [https://github.com/dubbo/dubbo-kubernetes](https://github.com/dubbo/dubbo-kubernetes)

# Introduction

Kubernates is a hierarchical system with rich secondary development function based on the expansibility.

* First of all, Kubernates's core function is to manage the container cluster. Kubernates manages the  storage and calculation of containerized cluster, based on the container runtime (CRI), network interface (CNI) and storage service interface (CSI/FV).
* Secondly，Kubernates has application-oriented deployment and routing capabilities，including statefulness/statelessness，batch processing and service-oriented applications，especially the application management based on microservices architecture which includes service discovery，service definition and unified configuration on the basis of configmap.
* Finally, on top of the abstract model of the basic resource (mainly the resources of abstract infrastructure, IaaS) and the application layer is the governance layer, which includes elastic expansion, namespaces/tenants and so on. Naturally, it is a matter of course to set up service about unified log center and omnidirectional monitoring on the Kubernetes based upon the foundational capabilities of atomic inner core.

We will explain the above description with a diagram of Kubernetes Architecture. In 2018, Kubernetes took a qualitative step toward the standard PaaS basement.Someone hold opinions that the reason is the ability for secondary development on the basis of the expansion and someone think the key is declarative programming and strong community operations relying on Google and Redhat. However,I think the essential reason is Layered architecture and the abstract domain modeling in the problem domain as the figure below.



![img](../../img/blog/k8s/1.png)


From a micro-service architecture perspective, Kubernetes is a micro-service framework (more appropriate than a micro-service platform or toolkit set at this time) in a sense, supporting the basic capabilities of microservices for service discovery/registration. Use the following table to make a brief description.

| The design of microservice | The function of Kubernetes |
| :--- | :--- |
| Point 1：API gateway  | Ingress |
| Point 2：Statelessness, distinguish between stateful and stateless applications  | Stateless corresponds to Deployment，and stateful corresponds to StatefulSet |
| Point 3：Horizontal expansion of the database  | Headless service points to PaaS service or StatefulSet deployment |
| Point 4：Cache   | Headless service points to PaaS service or StatefulSet deployment |
| Point 5：Service splitting and service discovery  | Service |
| Point 6：Service orchestration and flexibility  | Replicas of deployment |
| Point 7：Unified configuration center  | ConfigMap |
| Point 8：Unified log center  | DaemonSet deploys log agent |
| Point 9：Circut break, current limiting and downgrade  | Service Mesh |
| Point 10：Comprehensive monitoring   | Cadsivor, DaemonSet deploys and monitors Agent |

By the way, the microservices field involves many issues, which can be explained as follows. When building microservices, we will delve into Distributed System, a discipline has a 40-year research background and is rooted in the adaptive system theory. It's a bit complicated, but the concepts it covers are more or less heard for us, and it solves problems that we're familiar with:

* Deployment
* Delivery
* APIs
* Versioning
* Contracts
* Scaling / Autoscaling
* Service Discovery
* Load Balancing
* Routing / Adaptive Routing
* Health Checking
* Configuration
* Circuit Breaking
* Bulk-heads
* TTL / Deadlining
* Latency Tracing
* Service Causal Tracing
* Distributed logging
* Metrics Exposure, Collection

For Kubernetes, only a few of problems are solved. Problems such as Dynamic Routing, Stability Control (Circuit Breaking, Bulk-heads, etc.) , Distributed Service Tracking, etc. are all the blank. These problems are exactly what Service Mesh needs to solve, and these also plays an important role in CNCF's Tail Map. Of course, as Dubbo is a basically complete microservices infrastructure (Dubbo is based on the Sidecar which is a common solution for solving cross-language claims in Service Mesh, and the details of Dubbo are so complicated that they need to be explained in the new topic ) , that is to say, it is very meaningful to integrate Dubbo into the k8s system. The original definition of Service Mesh is cited below:

> <span data-type="color" style="color:rgb(119, 119, 119)"><span data-type="background" style="background-color:rgb(255, 255, 255)">A service mesh is a dedicated infrastructure layer for handling service-to-service communication. It&#x27;s responsible for the reliable delivery of requests through the complex topology of services that comprise a modern, cloud native application.</span></span>

We will know the existing solution, Dubbo integrates the Clould Native Equipment - Kubernetes's basic abilities to solve the microservices's core problems, can be regarded as a Service Mesh solution in a narrow sense, but it can only be used in the Java field. You can understand the above words as a joke, haha.

# T<span data-type="color" style="color:rgb(51, 51, 51)"><span data-type="background" style="background-color:rgb(255, 255, 255)">hought</span></span>/Plan

Kubernetes is a natural address registration center for microservices, similar to zookeeper, VIPserver and Configserver used internally by Alibaba. Specifically, the Pod in kubernetes is a running instance of the application. The scheduled deployment/start/stop of the Pod will call the API-Server service to maintain its state to ETCD. The service in kubernetes is coresponded to the concept of the microservices defined as follows.

> A Kubernetes Service is an abstraction layer which defines a logical set of Pods and enables external traffic exposure, load balancing and service discovery for those Pods.

In conclusion, the kubernetes service has the following characteristics:

* Each Service has a unique name and corresponding IP. IP is automatically assigned by kubernetes and the name is defined by the developer.
* Service IP has several manifestations: ClusterIP, NodePort, LoadBalance and Ingress. ClusterIP is mainly used for intra-cluster communication; NodePort, Ingress and LoadBalance, which are used to expose services to access portals outside the cluster.


Part 2
