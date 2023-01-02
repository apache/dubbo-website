---
type: docs
title: "Code Architecture"
linkTitle: "Code Architecture"
weight: 2
---


## overall design

![/dev-guide/images/dubbo-framework.jpg](/imgs/dev/dubbo-framework.jpg)

illustration:

* The light blue background on the left in the figure is the interface used by the service consumer, the light green background on the right is the interface used by the service provider, and the interface on the central axis is the interface used by both parties.
* The figure is divided into ten layers from bottom to top. Each layer is one-way dependent. The black arrow on the right represents the dependency relationship between layers. Each layer can be reused by stripping the upper layer. Among them, the Service and Config layers are API , the other layers are SPI.
* The small green block in the figure is the extension interface, and the small blue block is the implementation class. Only the implementation class used to associate each layer is shown in the figure.
* The blue dotted line in the figure is the initialization process, that is, the assembly chain at startup, the red solid line is the method call process, that is, the runtime call chain, and the purple triangle arrow is inheritance. You can regard the subclass as the same node of the parent class, and the line The text above is the method to call.

## Description of each layer

* **Config configuration layer**: external configuration interface, centered on `ServiceConfig`, `ReferenceConfig`, can directly initialize configuration classes, or generate configuration classes through spring parsing configuration
* **Proxy service proxy layer**: service interface transparent proxy, generating service client Stub and server Skeleton, with `ServiceProxy` as the center, the extended interface is `ProxyFactory`
* **Registry registration center layer**: Encapsulates the registration and discovery of service addresses, centered on service URLs, and the extended interfaces are `RegistryFactory`, `Registry`, `RegistryService`
* **Cluster routing layer**: Encapsulate the routing and load balancing of multiple providers, and bridge the registration center, with `Invoker` as the center, and the extended interfaces are `Cluster`, `Directory`, `Router`, `LoadBalance`
* **Monitor monitoring layer**: RPC call times and call time monitoring, centered on `Statistics`, extended interfaces are `MonitorFactory`, `Monitor`, `MonitorService`
* **Protocol remote call layer**: Encapsulates RPC calls, centered on `Invocation`, `Result`, extended interfaces are `Protocol`, `Invoker`, `Exporter`
* **Exchange information exchange layer**: encapsulation request response mode, synchronous to asynchronous, centered on `Request`, `Response`, extended interfaces are `Exchanger`, `ExchangeChannel`, `ExchangeClient`, `ExchangeServer`
* **Transport network transport layer**: Abstract mina and netty as a unified interface, with `Message` as the center, and extended interfaces as `Channel`, `Transporter`, `Client`, `Server`, `Codec`
* **Serialize data serialization layer**: some reusable tools, the extended interfaces are `Serialization`, `ObjectInput`, `ObjectOutput`, `ThreadPool`

## Relationship description

* In RPC, Protocol is the core layer, that is, as long as there is Protocol + Invoker + Exporter, non-transparent RPC calls can be completed, and then Filter interception points on the main process of Invoker.
* The Consumer and Provider in the picture are abstract concepts, just to let the viewer understand more intuitively which classes belong to the client and server. The reason for not using Client and Server is that Dubbo uses Provider, Consumer, Registry in many scenarios , Monitor divides logical topology nodes and maintains a unified concept.
* Cluster is a peripheral concept, so the purpose of Cluster is to disguise multiple Invokers as one Invoker, so that other people only need to pay attention to the Protocol layer Invoker. Adding Cluster or removing Cluster will not affect other layers, because there is only one Provider, Cluster is not required.
* The Proxy layer encapsulates the transparent proxy of all interfaces, and the Invoker is the center in other layers. Only when it is exposed to the user, the Proxy is used to convert the Invoker into an interface, or convert the interface implementation into an Invoker, that is, remove Proxy layer RPC can be run, but it is not so transparent, and it does not look like calling remote services like calling local services.
* The Remoting implementation is the implementation of the Dubbo protocol. If you choose the RMI protocol, the entire Remoting will not be used. The Remoting is divided into the Transport transport layer and the Exchange information exchange layer. The Transport layer is only responsible for one-way message transmission. , Netty, Grizzly's abstraction, it can also extend UDP transmission, and the Exchange layer encapsulates the Request-Response semantics above the transport layer.
* Registry and Monitor are actually not considered a layer, but an independent node, just for a global overview, drawn together in layers.

## Module Subpackage

![/dev-guide/images/dubbo-modules.jpg](/imgs/dev/dubbo-modules.jpg)

Module description:

* **dubbo-common public logic module**: including Util class and common model.
* **dubbo-remoting remote communication module**: equivalent to the implementation of the Dubbo protocol, if the RPC uses the RMI protocol, this package does not need to be used.
* **dubbo-rpc remote call module**: abstracts various protocols and dynamic proxy, only includes one-to-one calls, and does not care about cluster management.
* **dubbo-cluster cluster module**: Disguise multiple service providers as one provider, including: load balancing, fault tolerance, routing, etc. The address list of the cluster can be statically configured, or it can be configured by the registration center send.
* **dubbo-registry registration center module**: based on the clustering method issued by the registration center, and the abstraction of various registration centers.
* **dubbo-monitor monitoring module**: Statistics of service call times, call time, and call chain tracking services.
* **dubbo-config configuration module**: Dubbo’s external API, users use Dubbo through Config, hiding all details of Dubbo.
* **dubbo-container container module**: It is a Standlone container, loaded with a simple Main to start Spring, because services usually do not require the features of web containers such as Tomcat/JBoss, there is no need to use web containers to load services.

On the whole, subcontracting is carried out according to the hierarchical structure. The difference from the layering is:

* Container is a service container, which is used to deploy and run services, and is not drawn in the layer.
* Both the Protocol layer and the Proxy layer are placed in the rpc module. These two layers are the core of rpc. When there is no need for a cluster, that is, there is only one provider, you can use only these two layers to complete the rpc call.
* Both the Transport layer and the Exchange layer are placed in the remoting module, which is the communication basis for rpc calls.
* The Serialize layer is placed in the common module for greater reuse.

## Dependencies

![/dev-guide/images/dubbo-relation.jpg](/imgs/dev/dubbo-relation.jpg)

illustration:

* The small squares in the figure Protocol, Cluster, Proxy, Service, Container, Registry, Monitor represent layers or modules, the blue ones indicate that they interact with the business, and the green ones only interact with Dubbo internally.
* The background squares Consumer, Provider, Registry, Monitor in the figure represent the deployment logic topology nodes.
* The blue dotted line in the figure is the call at initialization, the red dotted line is the asynchronous call at runtime, and the red solid line is the synchronous call at runtime.
* Only the RPC layer is included in the figure, and the Remoting layer is not included. Remoting is implicitly included in the Protocol as a whole.

## call chain

Expand the red call chain of the general design diagram, as follows:

![/dev-guide/images/dubbo-extension.jpg](/imgs/dev/dubbo-extension.jpg)

## Expose service timing

Expand the blue initialization chain of the exposed service of the service provider on the right side of the general design diagram, and the sequence diagram is as follows:

![/dev-guide/images/dubbo-export.jpg](/imgs/dev/dubbo-export.jpg)

## Reference service timing

Expand the green initialization chain of the service consumer reference service on the left side of the general design diagram, and the sequence diagram is as follows:

![/dev-guide/images/dubbo-refer.jpg](/imgs/dev/dubbo-refer.jpg)

## Domain Model

In Dubbo's core domain model:

* Protocol is the service domain, which is the main function entry exposed and referenced by Invoker, and it is responsible for the life cycle management of Invoker.
* Invoker is an entity domain, it is the core model of Dubbo, other models are close to it, or converted to it, it represents an executable body, can initiate an invoke call to it, it may be a local implementation, or it may be Is a remote implementation, and possibly a cluster implementation.
* Invocation is a session domain, which holds variables in the calling process, such as method names, parameters, etc.

## Basic Design Principles

* Adopt Microkernel + Plugin mode, Microkernel is only responsible for assembling Plugin, and Dubbo's own functions are also realized through extension points, that is, all function points of Dubbo can be replaced by user-defined extensions.
* URL is used as the unified format of configuration information, and all extension points carry configuration information by passing URL.