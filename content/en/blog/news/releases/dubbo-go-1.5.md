---
title: "Dubbo Go 1.5.0"
linkTitle: "dubbo-go 1.5.0"
date: 2021-01-14
description: >
    Dubbo-go releases version 1.5, taking a significant step toward cloud-native.
---

## Quote

The wave of computer technology brings disruptive changes every decade, and related knowledge systems innovate at least every five years, approximately halving in value every two years. This also applies to the field of application service communication frameworks. For any communication framework with long-term viability, there is usually a five-year growth phase and a five-year stable maturity phase. Each era has its matching application communication framework; for example, in the 2G era twenty years ago, the cross-language and cross-platform gRPC, while strong, would not have been adopted due to its weak performance.

Different people see different conclusions from each communication framework: beginners value ease of use, performance evaluators focus on performance, application architects consider maintenance costs, and owners look at overall costs. While the performance of an application communication framework is important, its stability and evolution capability are more critical, as a well-maintained framework can reduce comprehensive costs over long periods: learning costs, maintenance costs, upgrade costs, and replacement costs.

What is Dubbo-go? First, it is the Go language version of Dubbo, fully compatible with Dubbo as its primary goal. Second, it is an application communication framework in Go that will fully utilize the advantages of Go as the first language of the cloud-native era, expanding Dubbo's capabilities.

Dubbo, born in 2008, has more than a decade of history, continually renewed with the support of Alibaba and its community. Dubbo-go, released in 2016, is now in its fifth year, and the fully compatible Dubbo-go v1.5 with Dubbo v2.7.x has finally been released.

Looking back, Dubbo-go has developed the following capabilities:

- Interconnectivity: Bridging gRPC and Spring Cloud ecosystems;
- Observability: Based on OpenTracing and Prometheus, making significant progress in Logging, Tracing, and Metrics;
- Cloud-native: Dubbo-go has implemented communication capabilities based on Kubernetes API Server as a registry, minimizing upgrade costs.

It goes without saying that compared to current achievements, the developing Dubbo-go has more expectations for the future:

- Usability: The entry cost for Dubbo-go is high, which keeps many interested parties out. However, the good news is that as Dubbo-go is gradually implemented within Alibaba, the Alibaba middleware team is further encapsulating it, and it will be opened to the community after verification in production environments.
- Cloud-native: The current Kubernetes-based solution of Dubbo-go, from a technical layering perspective, sees the Kubernetes API Server as a maintenance component of the system that should not be exposed to the application layer. Otherwise, it might lead to excessive communication pressure on the APIServer, putting the overall system at high risk: improper use at the application layer or bugs in the framework's traffic handling could cripple the APIServer, risking paralysis of overall backend service capabilities! Therefore, the application layer needs to perceive the Operators that Kubernetes provides. The evolving Dubbo-go plans to release the Dubbo-go Operator in version v1.6.

Without a doubt, Dubbo-go community [DingTalk group 23331795] stands with Dubbo-go.

## Application Dimension Registration Model

After a period of effort, we have finally completed application-level service registration and discovery. Compared with the existing interface-level registration model, the new registration model has two prominent features:

1. Consistency with mainstream registration models. The current mainstream approach registers based on applications, like Spring Cloud. Supporting application-level registration lays the foundation for subsequent cloud-native support;
2. Significantly reduces pressure on the registry. Under this model, from the perspective of the registry, the cluster size is only proportional to the number of instances, rather than the existing proportionality to the number of services.

Of course, we considered users' migration costs during the design phase. To migrate to the new registration model, simply replace the currently used registry with the new `ServiceDiscoveryRegistry`.

`ServiceDiscoveryRegistry` supports multiple implementations. Currently, we support:

1. nacos;
2. etcd;
3. zookeeper;

We encourage new business launches to use more reliable and stable registries like nacos and etcd.

## Metadata Report Center

In version v1.5, while supporting the application-level registration model, an important issue arises concerning the storage of metadata at the interface level. The essential difference between the service-level registration model and the application-level registration model is the inconsistency in the data dimensions registered with the registry. Although we have removed interface-level data from the registry in the application-level registration model, a consumer must obtain service information opened by the provider side to truly find the service address to call. In version v1.5, we stored this data in the metadata center.

The metadata center is an interface definition. It generally refers to a storage area where interface-level metadata can be stored and read, with the provider side calling for storage and the consumer side reading it. Data in the metadata center must maintain accuracy and real-time consistency.

Currently, the metadata center has two parent classes (there is no inheritance in Go; here, the parent-child class refers purely to the combination of subclasses and parents). One is the local implementation, and the other is the remote implementation. The local implementation uses the provider's memory as a virtual metadata center, while the remote implementation relies on registries like ZooKeeper, etcd, nacos, etc., as the metadata center. Currently, remote implementations include subclasses for zookeeper, nacos, etcd, and consul. Thus, users can store and distribute metadata information through the aforementioned third-party registries.

## Invocation Interface Support for Attribute Properties

The invocation structure has a new attribute property for internal attribute storage. Unlike attachments, attributes do not get passed from the consumer to the provider.

## K8s Registry

Before version v1.5, the implementation of the k8s registry directly used the List&&Watch interfaces of the Pod object from [k8s client](https://github.com/kubernetes/client-go). This iteration introduces k8s informers. The reasons for this change are twofold: first, to a certain extent, the dubbo-go k8s registry is also a k8s controller, and using the informer mode is more k8s native. More importantly, the community plans to evolve towards a CRD+Operator model, and the informer mode is an exploratory step for this evolution. Apart from this groundwork, this iteration also supports service discovery across namespaces. Additionally, to reduce pressure on the kube-apiserver List&&Watch, we have distinguished the behavior of providers and consumers, with providers no longer watching and only performing write operations on the kube-apiserver.

# Optimize Routing Model

Before version v1.5, the Router model included properties: priority and routing properties. The Router Chain only contained routing properties. It can be inferred that the Router Chain is also a special type of Router. After version v1.5, Routers became more abstract, separating out the priority property and introducing Priority Routers. The Chain inherits from Router, making it a special type of Router to enhance clarity in relationships. As shown in the diagram:

![img](/imgs/blog/dubbo-go/1.5/router.png)

# Review and Outlook

Dubbo-go is in a relatively stable and mature state. The current new version is an attempt toward cloud-native direction, with application service dimension registration being the first introduced feature—a completely different new registration model. This version is a key step toward our progress in cloud-native. Additionally, this version includes some previously mentioned optimizations.

The next version, v1.5.1, still primarily focuses on compatibility with Dubbo 2.7.x, but enhancing distributed capabilities is also a focal point.

In terms of **distributed transactions**, there is an important extension implementation based on Seata. By adding filters, xid can be received on the server, combined with seata-golang[^2] to support distributed transactions. This allows Dubbo-go to offer users more choices in distributed scenarios, adapting to a wider range of personalized scenarios.

Simultaneously, regarding **transport link security**, TLS secure transport links are one of the important features of this version. By providing a unified entry point, it can introduce more functionalities related to transport link security in the future, accommodating different user scenarios.

On the **registry model**, it supports load balancing across multiple registry clusters. Assuming business deployment involves dual registries (Figure 1), the optimization adds a layer of load balancing across registry clusters when selecting from all Providers in the original dual registry.

![img](/imgs/blog/dubbo-go/1.5/multi-registry.png)


(Figure 1)

![img](/imgs/blog/dubbo-go/1.5/loadbalance.png)

(Figure 2)

Previously, the dubbo-go RPC layer reused the RPC layer of the getty framework[[^3](https://github.com/AlexStocks/getty/tree/feature/rpc)], failing to achieve isolation between protocols and application communication addresses. The Alibaba Middleware Exhibition team restructured the dubbo-go RPC layer to achieve connection reuse: enabling multi-protocol communication over the same TCP connection for both consumer and provider ends. The related PR has been merged and will be released in dubbo-go v1.5.1.

Currently, the next version is under intense development, and the specific plans and task lists[^1] are already reflected on GitHub.

[^1]: https://github.com/apache/dubbo-go/projects/8
[^2]: https://github.com/seata-golang/seata-golang
[^3]: https://github.com/AlexStocks/getty/tree/feature/rpc

