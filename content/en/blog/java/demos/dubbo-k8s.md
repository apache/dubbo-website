---
title: "Integration of Dubbo with Kubernetes"
linkTitle: "Integration of Dubbo with Kubernetes"
tags: ["Java"]
date: 2018-09-30
description: >
    This article mainly attempts to register Dubbo services into Kubernetes while seamlessly integrating with Kubernetes' multi-tenant security system.
---

## Overall Goal

Dubbo providers no longer need to worry about service registration; they just need to open the Dubbo service port, with Kubernetes handling the declaration and publishing of services. Dubbo consumers directly discover the corresponding service endpoints in Kubernetes during service discovery, thus reusing the existing microservice channel capabilities of Dubbo. The benefit is that there is no need to rely on third-party soft load registration centers, while seamlessly integrating into Kubernetes' multi-tenant security system. Code for the demo reference: https://github.com/dubbo/dubbo-kubernetes

## Chatting

Kubernetes is built on a scalable, extensible, and richly functional systematic system.

- Its core function is to manage container clusters, capable of managing containerized clusters (including storage and computation), based on container runtime (CRI), network interface (CNI), and storage service interface (CSI/FV);
- It offers deployment and routing capabilities for applications (including stateless/stateful, batch/service applications), especially for microservice architecture application management, providing service definition, service discovery, and unified configuration based on configmap;
- Above the basic resource (mainly abstracting underlying IaaS resources) and application layer abstract model is the governance layer, which includes elastic scaling, namespaces/tenants, etc. Building a unified logging center and comprehensive monitoring services on top of Kubernetes' core capabilities is a natural progression, and the CNCF recognizes and recommends this.

Here’s a diagram of Kubernetes Architecture to explain the above description. In 2018, Kubernetes made a qualitative leap towards being a standard PaaS base, with reasons attributed to its extensible development capabilities, its declarative programming approach, and robust community support from Google and Redhat. However, I believe the essence lies in the **Layered architecture and domain modeling abstraction** shown in the diagram below.

![img](/imgs/blog/k8s/1.png)

From a microservices architecture perspective, Kubernetes is, in a sense, a microservices framework (it's more appropriate to call it a microservices platform or toolkit), supporting the basic capabilities of service discovery/registration for microservices. A simple description is given in the diagram below.

![img](/imgs/blog/k8s/2.jpeg)

Expanding the topic, the microservices domain involves numerous issues, as illustrated in the diagram below.

![img](/imgs/blog/k8s/3.jpeg)

Kubernetes only addresses a small part of these issues, while dynamic routing, stability control (circuit breakers, water-tight compartments, etc.), distributed service tracking remain gaps that the service mesh aims to fill, holding a significant place in the CNCF Trail Map. Certainly, Dubbo is basically equipped with comprehensive microservice capabilities, making its integration into the Kubernetes system quite meaningful. The sidecar-based solution of Dubbo in the service mesh is a general service mesh solution addressing cross-language demands, which requires a new topic for discussion; referencing the original definition of a service mesh:

> A service mesh is a dedicated infrastructure layer for handling service-to-service communication. It’s responsible for the reliable delivery of requests through the complex topology of services that comprise a modern, cloud-native application. 

The existing Dubbo integration with cloud-native infrastructure Kubernetes and its ability to address core microservice-related issues can be regarded as a narrow service mesh solution, albeit limited to the Java domain; humorously understood as such, haha.

## Approach/Solution

Kubernetes can naturally serve as an address registration center for microservices, similar to Zookeeper, Alibaba's internal VIPserver, and Configserver. Specifically, in Kubernetes, a Pod represents a running instance of an application, with scheduling and deployment/stop controlling through API-Server services to maintain its status in ETCD; the service in Kubernetes corresponds to the concept of microservices and is defined as follows:

> A Kubernetes Service is an abstraction layer that defines a logical set of Pods and enables external traffic exposure, load balancing, and service discovery for those Pods.

In summary, Kubernetes services have the following characteristics:

- Each Service has a unique name and corresponding IP. The IP is automatically assigned by Kubernetes, while the name is defined by the developer.
- Service IPs have several representations: ClusterIP, NodePort, LoadBalance, and Ingress. ClusterIP is mainly used for intra-cluster communication; NodePort, Ingress, and LoadBalance are used for exposing services to external access.

At first glance, Kubernetes services all have unique IPs. Under the conventional thinking of Dubbo/HSF, it's apparent that Dubbo/HSF services are formed by aggregating the IPs of the whole service cluster, implying a fundamental difference. However, upon further reflection, the distinction is not significant, as the unique IP in Kubernetes is simply a VIP that mounts multiple endpoints behind it, which are the actual processing nodes. This discussion only addresses the access of Dubbo services within the same Kubernetes cluster; the external consumer accessing the provider within Kubernetes involves network address space issues, usually requiring Gateway/Loadbalance for mapping and conversion, which is not elaborated here. There are two options for Kubernetes:

1. **DNS**: By default, Kubernetes services rely on the DNS plugin (the latest recommendation is coreDNS), and there is a proposal in Dubbo regarding this. My understanding is that static resolution is the simplest and most necessary service discovery mechanism that needs support; Envoy’s perspective on this can be referenced. Dubbo's continuous emphasis on its softload address discovery capability often overlooks the Static strategy. Meanwhile, Ant Financial's SOFA has long supported this strategy; an engineering fragment of a SOFA project serves as an explanation here. This approach has two advantages: 1) When a soft load center crashes and cannot provide an address list, there is a fallback mechanism to handle certain requests. 2) Under LDC/unitization, Ant's load center cluster is convergently deployed within a datacenter/region, ensuring that the soft load center is LDC-compliant and stability-controlled. When a unit requires a request center, the VIP address discovery comes into play.

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB1Kj1ktpkoBKNjSZFEXXbrEVXa-985-213.png)

2. **API**: DNS relies on a DNS plugin, which incurs additional operational overhead, thus considering direct access to Kubernetes' client to obtain endpoints. In fact, by accessing Kubernetes' API server interface, one can directly retrieve the list of endpoints behind a service while listening for changes in its address list. This achieves the soft load discovery strategy recommended by Dubbo/HSF. Referencing specific code:

Both approaches need to consider the following points:

1. **Service name mapping**: The names of services in Kubernetes and Dubbo must match. Dubbo services are uniquely determined by service name, group, and version, with the service name generally being the package name of the service interface, which tends to be lengthy. This requires mapping Kubernetes service names to Dubbo service names. One option could be to add a property as in SOFA, which is a significant change but most reasonable; alternatively, use fixed rules to reference deployed environment variables for quick validation.
2. **Port issue**: By default, the network communication between Pods is seen as resolved; verification is needed.

## Demo Verification

Below, we will make a demo deployment using Alibaba Cloud's container image service and Kubernetes services in EDAS. Access Alibaba Cloud -> Container Image Service.

1. Create an image repository and bind it to the GitHub code repository, as shown below.

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB1m.tEtrorBKNjSZFjXXc_SpXa-1892-870.png)

2. Click on management **to create the repository**, use the building function under the image service to build the demo into an image and publish it to the specified repository, as shown below.

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB1oYqvtcIrBKNjSZK9XXagoVXa-1872-888.png)

3. Switch to the Enterprise Distributed Application Service (EDAS) product, and create a Kubernetes cluster under Resource Management -> Cluster, binding it with ECS, as shown below.

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB1b1p2trZnBKNjSZFKXXcGOVXa-1858-833.png)

4. Application Management -> Create Application, **with type as Kubernetes application** and specify the image from the container image service. As shown below.

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB1b1p2trZnBKNjSZFKXXcGOVXa-1858-833.png)

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB18uzTtdcnBKNjSZR0XXcFqFXa-1820-861.png)

5. Once created, proceed to deploy the application. As shown below.

![img](/imgs/blog/2018/09/30/integrate-dubbo-with-kubernetes/TB1fEpEtrorBKNjSZFjXXc_SpXa-1846-783.png)

- Note that the application name cannot contain uppercase letters; it must be all lowercase, or deployment may fail.

- When creating the application, if the image is selected, the next step button may be unclickable, requiring a re-selection to proceed.

- EDAS has two independent sets of Kubernetes services; one is based on Alibaba Cloud's container service, while the other is managed by Lark. I have experienced the latter.

- Development integration with Docker and IDE needs to consider relevant plugins for integration with IDEA.

- Deployment is frequently failing, suggesting issues with the Kubernetes service, requiring further investigation.

```json
{
  "kind": "Pod",
  "namespace": "lzumwsrddf831iwarhehd14zh2-default",
  "name": "dubbo-k8s-demo-610694273-jq238",
  "uid": "12892e67-8bc8-11e8-b96a-00163e02c37b",
  "apiVersion": "v1",
  "resourceVersion": "850282769"
}, "reason": "FailedSync", "message": "Error syncing pod", "
```

