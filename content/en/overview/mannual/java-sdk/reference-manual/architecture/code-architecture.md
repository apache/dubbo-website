---
aliases:
    - /en/docs3-v2/java-sdk/concepts-and-architecture/code-architecture/
    - /en/docs3-v2/java-sdk/concepts-and-architecture/code-architecture/
    - /en/overview/mannual/java-sdk/concepts-and-architecture/code-architecture/
description: This article will introduce the code architecture of Dubbo.
linkTitle: Code Architecture
title: Code Architecture
type: docs
weight: 2
---







## Overall Design

![/dev-guide/images/dubbo-framework.jpg](/imgs/dev/dubbo-framework.jpg)

Legend explanation:

* The light blue background on the left side of the diagram represents the interfaces used by service consumers, the light green background on the right side represents the interfaces used by service providers, and the interfaces on the central axis are used by both parties.
* The diagram is divided into ten layers from bottom to top, with each layer being a one-way dependency. The black arrows on the right represent the dependency relationships between layers. Each layer can detach from the upper layer for reuse, where the Service and Config layers are APIs and the others are SPIs.
* The green small blocks represent extension interfaces, and the blue small blocks represent implementation classes. Only the implementation classes related to the inter-layer connections are shown in the diagram.
* The blue dashed lines represent the initialization process, i.e., the assembly chain during startup, the red solid lines represent the method invocation process, i.e., the runtime invocation chain, and the purple triangular arrows represent inheritance, where subclasses can be seen as the same node as their parent class. The text on the lines indicates the invoked methods.

## Layer Descriptions

* **Config Layer**: External configuration interface centered around `ServiceConfig` and `ReferenceConfig`, allowing direct initialization of configuration classes or generating configuration classes through Spring.
* **Proxy Layer**: Transparent proxy for service interfaces, generating client Stubs and server Skeletons centered around `ServiceProxy`, with the extension interface being `ProxyFactory`.
* **Registry Layer**: Encapsulates the registration and discovery of service addresses, centered around service URLs, with extension interfaces `RegistryFactory`, `Registry`, `RegistryService`.
* **Cluster Layer**: Encapsulates routing and load balancing for multiple providers and bridges to the registry, centered around `Invoker`, with extension interfaces `Cluster`, `Directory`, `Router`, `LoadBalance`.
* **Monitor Layer**: Monitors RPC call counts and call durations, centered around `Statistics`, with extension interfaces `MonitorFactory`, `Monitor`, `MonitorService`.
* **Protocol Layer**: Encapsulates RPC calls, centered around `Invocation` and `Result`, with extension interfaces `Protocol`, `Invoker`, `Exporter`.
* **Exchange Layer**: Encapsulates request-response patterns, synchronizing to asynchronous, centered around `Request` and `Response`, with extension interfaces `Exchanger`, `ExchangeChannel`, `ExchangeClient`, `ExchangeServer`.
* **Transport Layer**: Abstracts Mina and Netty into a unified interface, centered around `Message`, with extension interfaces `Channel`, `Transporter`, `Client`, `Server`, `Codec`.
* **Serialize Layer**: Reusable tools, with extension interfaces `Serialization`, `ObjectInput`, `ObjectOutput`, `ThreadPool`.

## Relationship Explanation

* In RPC, the Protocol is the core layer, meaning that as long as there is Protocol + Invoker + Exporter, non-transparent RPC calls can be completed, then applying Filters on the Invoker's main process.
* The Consumer and Provider in the diagram are abstract concepts meant to help viewers understand which classes belong to the client and server side. The reason for not using Client and Server is that Dubbo employs Provider, Consumer, Registry, and Monitor to define logical topological nodes in many scenarios, maintaining a unified concept.
* Cluster is an external concept, meaning its purpose is to disguise multiple Invokers as a single Invoker, allowing others to focus only on the Protocol layer Invoker. Adding or removing Cluster will not affect other layers, as there is no need for Cluster with only one provider.
* The Proxy Layer encapsulates transparent proxying for all interfaces, and in other layers, it revolves around the Invoker. Only at the point of exposing for user use is Proxy used to convert Invoker into an interface or convert interface implementations into Invoker. This means removing the Proxy layer allows RPC to run, though it won't be as transparent or seem as local as remote service calls.
* The Remoting implementation is the Dubbo protocol implementation. If you choose the RMI protocol, the entire Remoting will not be used. Remoting is internally divided into the Transport layer and the Exchange layer, where the Transport layer is responsible for one-way message transmission, abstracting Mina, Netty, and Grizzly, and it can also extend UDP transmission. The Exchange layer encapsulates Request-Response semantics on top of the Transport layer.
* The Registry and Monitor should not be counted as a layer but rather as independent nodes, drawn together for a global view in a layered manner.

## Module Packaging

![/dev-guide/images/dubbo-modules.jpg](/imgs/dev/dubbo-modules.jpg)

Module explanations:

* **dubbo-common Common Logic Module**: Includes utility classes and common models.
* **dubbo-remoting Remote Communication Module**: Equivalent to the implementation of the Dubbo protocol. If RPC uses the RMI protocol, this package is not needed.
* **dubbo-rpc Remote Invocation Module**: Abstracts various protocols and dynamic proxies, only containing one-to-one invocation without concerning cluster management.
* **dubbo-cluster Cluster Module**: Disguises multiple service providers as a single provider, including load balancing, fault tolerance, routing, etc. The cluster address list can be statically configured or issued by the registry.
* **dubbo-registry Registry Module**: Based on the cluster method of issuing addresses from the registry, and the abstraction of various registries.
* **dubbo-monitor Monitoring Module**: A service for tracking service call counts, call times, and call chains.
* **dubbo-config Configuration Module**: The API exposed to users by Dubbo, allowing users to use Dubbo through Config while hiding all details of Dubbo.
* **dubbo-container Container Module**: A standalone container using a simple Main to load Spring startup, as services typically do not require features of Web containers like Tomcat/JBoss, making it unnecessary to use a Web container to load services.

Overall, packaging is done according to a layered structure, with the distinction being:

* The Container is a service container used for deploying and running services, not drawn in the layers.
* Both the Protocol layer and Proxy layer are included in the rpc module; these two layers are the core of rpc, and when a cluster is not needed, meaning there is only one provider, these two layers alone can complete rpc calls.
* Both the Transport layer and Exchange layer are included in the remoting module, serving as the communication basis for rpc calls.
* The Serialize layer is placed in the common module for greater reusability.

## Dependency Relationships

![/dev-guide/images/dubbo-relation.jpg](/imgs/dev/dubbo-relation.jpg)

Legend explanation:

* The small squares in the diagram representing Protocol, Cluster, Proxy, Service, Container, Registry, and Monitor indicate layers or modules, with blue denoting business interactions and green denoting interactions purely within Dubbo.
* The background squares representing Consumer, Provider, Registry, and Monitor denote deployment logical topological nodes.
* The blue dashed lines represent initialization calls, the red dashed lines denote asynchronous calls during runtime, and the red solid lines signify synchronous calls during runtime.
* The diagram includes only the layers of RPC and does not encompass the layers of Remoting, which is implicitly contained within Protocol.

## Invocation Chain

Expanding the red invocation chain from the overall design diagram:

![/dev-guide/images/dubbo-extension.jpg](/imgs/dev/dubbo-extension.jpg)

## Service Exposure Sequence

Expanding the blue initialization chain of service exposure for the service provider on the right side of the total design diagram, the sequence diagram is as follows:

![/dev-guide/images/dubbo-export.jpg](/imgs/dev/dubbo-export.jpg)

## Service Referencing Sequence

Expanding the green initialization chain when the service consumer references services on the left side of the total design diagram, the sequence diagram is as follows:

![/dev-guide/images/dubbo-refer.jpg](/imgs/dev/dubbo-refer.jpg)

## Domain Model

In the core domain model of Dubbo:

* Protocol is the service domain, which is the main functional entry for Invoker exposure and referencing, responsible for managing the lifecycle of the Invoker.
* Invoker is the entity domain, which is the core model of Dubbo, with other models converging towards or converting into it. It represents an executable body that can initiate invoke calls; it could be a local implementation, a remote implementation, or a cluster implementation.
* Invocation is the session domain, holding variables during the calling process, such as method names and parameters.

## Basic Design Principles

* Adopts the Microkernel + Plugin model; the Microkernel is only responsible for assembling Plugins. Dubbo’s functionality itself is also realized through extension points, meaning all functional points of Dubbo can be user-defined and replaced.
* Uses URL as a unified format for configuration information, where all extension points pass configuration information through the URL.

