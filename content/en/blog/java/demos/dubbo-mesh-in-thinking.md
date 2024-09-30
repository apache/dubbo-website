---
title: "Thoughts and Solutions of Dubbo under Service Mesh"
linkTitle: "Thoughts and Solutions of Dubbo under Service Mesh"
tags: ["Java"]
date: 2019-11-30
description: Dubbo is an implementation framework, and integrating the service mesh concept is what we share today.
---

## Introduction
The term Service Mesh was coined in September 2016, and 2018 is recognized as a crucial year for service mesh, with major companies aiming to lead in this trend. Today, I will share Alibaba's middleware perspectives, thoughts, and practices in this regard. For those unfamiliar with Dubbo (primarily HSF in the group) and service mesh, let’s briefly introduce these terms. Dubbo is arguably the most popular remote service framework in China, with over 20,000 stars on GitHub, and is core to Alibaba's distributed architecture. Similar to Dubbo, service mesh addresses the issue of service interconnectivity and is among the core technologies in the cloud-native stack; it can be understood as the microservice architecture solution defined by cloud-native organizations. Dubbo is an implementation framework, and integrating the service mesh concept is what we share today.

## Current Situation and Challenges


![1.png | center | 826x206](/imgs/blog/dubbomesh/1.png)

Currently, Dubbo supports over ten thousand applications within Alibaba's distributed environment, running on more than 200,000 server instances, with daily invocation volumes reaching trillions. This is likely the largest distributed application cluster in China.

Challenges mainly come from three aspects

* First, tens of thousands of applications mean there's a level of services in the hundreds of thousands, organizing the intricate service topology and even diagnosing any abnormal call chain in real-time requires considering massive data retrieval and analysis, which is highly challenging. Alibaba addresses this through the EagleEye system, providing observability and governance capabilities;
* The second challenge is disaster recovery at the data center level. Alibaba's data centers are spread across vast distances, and one can imagine how network latency across thousands of kilometers significantly impacts service interconnectivity, so ensuring certain recovery times and data fault tolerance while implementing multi-active deployments across different places is a huge challenge. Alibaba resolves this through a unit-based architecture that supports multi-active deployments.
* The third challenge is that Alibaba has many businesses, particularly those in the Alibaba ecosystem like Gaode, UC, Youku, etc., which use programming languages different from 淘系 Java, such as PHP, C, Node.js, Dart, etc. Maintaining multiple versions while ensuring consistent functionality across them is cost-prohibitive; this challenge is exacerbated under new cloud-native principles. Today’s topic is closely related to this third challenge, which can resolve certain issues.

To illustrate cloud-native, let’s tell a story of big fish eating small fish: software will dominate the world, as informatization is inevitable, and open source will dominate software, ultimately cloud-native will dominate open source. This represents the disruptive nature of cloud-native concepts, moving from commercial software to open source to cloud-native, promoting various open-source solutions and standards in a systematic and hierarchical manner, significantly lowering the technical threshold of enterprise architecture services and being a boon for enterprise informatization, also an evolutionary direction. This story closely aligns with today’s theme—the future of software defined by developers, indicating that this trend is certainly taking place in the enterprise software service sector. Cloud Native is Patterns with A complete and trusted toolkit for modern architectures.

<span data-type="color" style="color:white">Typical Solutions for Service Mesh</span>
## Typical Solutions for Service Mesh


![2.png | center | 826x206](/imgs/blog/dubbomesh/2.png "")

Having told the story, let's return to service mesh.

In traditional forms, SDK represents a library in a specific language, coexisting within the same process as applications and microservice frameworks, sharing lifecycle during releases and upgrades. Notable examples include Twitter's Finagle, Google's Stubby/gRPC, and Alibaba's HSF/Dubbo.

Under service mesh, the recommended approach is the Sidecar model on the right, which does not introduce new functionality but merely changes the location of existing functions, existing as independent applications. One can momentarily understand its network proxy capabilities through Nginx.

In this illustration, I hope everyone pays attention to two pieces of information: 1) All sidecars form a logical network known as the data plane, which is a strongly dependent node in the business services’ link, carrying the foundation of cross-business data interconnection; traditional ops control services are known as the control plane, which aligns closely with traditional approaches. 2) In the sidecar configuration, the network incurs two additional hops, i.e., between the application and the sidecar, and the data intercommunication between them is also based on protocol specifications. Further details will follow.

## Advantages and Disadvantages of Sidecar Model


![3.png | center | 826x206](/imgs/blog/dubbomesh/3.png "")

Now let’s separately compare the development and operations phases.

* Regarding multi-language support, as the sidecar is an independent application, it can be developed in the most suitable language, thus avoiding the need for different version developments across various languages. Currently, Alibaba has chosen to base its secondary development on C language Envoy to pursue the smallest footprint and performance; however, it has encountered setbacks, such as when a sidecar was developed in Java but ultimately proved unfeasible due to the large size of the JRE and GC-induced fluctuations. It is essential to emphasize that the sidecar's current development avoids the multi-language, multi-version issues, but to genuinely support any service freely adopting any language is necessary to consider data interactions throughout the entire link from business to data to business.
* In terms of performance, the sidecar case incurs two additional hops, namely the calls between the business application and the two processes of the sidecar, which are local but still incur overhead for process switching and data conversion. Our optimization tests show that under normal business access, compared to SDK form, the maximum increase is 1 millisecond, which is generally imperceptible and has no impact in most business scenarios.
* Looking at the comparison during the operations phase, generally, SDK-based service frameworks only care about development needs and do not concern themselves with operational management. However, during the software lifecycle, operations represent the longest phase, making it significant to resolve more operational issues from a middleware perspective. Alibaba's middleware often requires upgrades, and upgrading as a library necessitates the business applications to be repackaged, which tends to be a passive way to drive changes from the business side, and the cycle can be long.
* When deploying and releasing using images as the basic atomic unit, Alibaba’s middleware SDK weighs around 200MB, needing to be packaged with business; thereby, during business application upgrades, the distributed packages seem cumbersome, and the timeliness is not as good as that of sidecar approaches.

To briefly summarize, the sidecar offers two clear advantages: one is lower multi-language development and maintenance costs, and the other is independent upgrades, though at the cost of slightly increased network latency. So does everyone think the sidecar is nearly perfect? Hold on; you need to consider one more question: In the SDK model, middleware components are released with applications and share the same lifecycle; however, in the sidecar model, how to manage the lifecycle of sidecars? A good analogy might be wireless headphones; they are independent but require independent power sources to function, thus necessitating charging. Yes, this point adds substantial complexity in large-scale clusters.

## Key Points


![4.png | center | 826x206](/imgs/blog/dubbomesh/4.png "")

Next, we will share our understanding of three key technical points of service mesh. They are sidecar operations, data plane and control plane integration, and protocols.

* First, the sidecar's operations is a challenge, and it explains why the sidecar solution wasn't widely adopted earlier. As previously noted, the sidecar and applications are now two distinct processes, raising multiple concerns: one must consider how to deploy the sidecar alongside the application, and two, when either the business process or sidecar process needs an upgrade or restart, collaboration is required to ensure normal request handling or forwarding, i.e., the issue of graceful shutdowns and startups. Once these concerns are understood and resolved, the foundation for establishing service mesh is set. Of course, Kubernetes addresses these matters by providing a plugin-like mechanism similar to the initiator to inject the sidecar into atomic pods and ensure process cooperation through health checks. To simplify, one can also understand this as: establishing Kubernetes Container Scheduling Platform implementation is a prerequisite for service mesh.
* The service governance capabilities of sidecars in the data plane are its core competitiveness, including load balancing strategies, routing, security, weights, etc., which are issued as rules from the control plane to the data plane. In traditional microservice frameworks, data plane and control plane integration is tightly coupled; that is, the data plane and control plane are one unit. For example, with the Dubbo framework, only Dubbo-Ops can be selected. Envoy, as a leader in the service mesh movement, has put forward a comprehensive set of API specifications, and Istio can implement its xDS interfaces, while Alibaba can design and implement a similar service platform based on its architecture.
* Protocol, protocol, protocol—important matters are worth mentioning three times… The sidecar and Dubbo's core is the network protocol handler, and the sidecar is aimed at multi-language scenarios; hence, the ability to handle protocols is emphasized. Let’s discuss the challenges facing Alibaba’s Dubbo as it develops in the Mesh direction. First, our service interfaces are described via Java interfaces; second, the involved transport models DTO are also defined as Java POJO; finally, the protocol is proprietary. This creates difficulties for cross-language implementations, whereas the sidecar model requires multi-language support, making these issues challenging. Considering this delves into a more detailed aspect, I hope everyone reflects on the following questions: What should be considered for data exchange between business applications and sidecars? What must the sidecar consider when processing network byte streams? Yes, ideally, business applications should not depend on specific protocol libraries or interface definition libraries; when the sidecar processes data, it closely resembles Nginx, but it should ideally have the capability for protocol conversion and adaptation, for instance, converting HTTP-based requests to Dubbo requests, thereby easily integrating Dubbo legacy systems.

## Reviewing Protocols


![5.png | center | 826x206](/imgs/blog/dubbomesh/5.png "")

Given the importance of protocols in cross-language scenarios, it's worthwhile to reflect on the historical trajectory of protocols. Reviewing history is usually an enjoyable and easy process, providing clarity and preventing confusion.

We start from 2008, just ten years ago, the year when Alibaba's service framework was born. While many companies were still discussing SOA concepts at that time, Alibaba embraced SOA architecture based on its own business requirements without fully understanding SOA concepts. The Alibaba service framework has consistently been defined across three levels: first, RPC communication; second, providing rich and potent governance capabilities; and third, operational capabilities based on container isolation for independent middleware upgrades. This concept remains very advanced and commendable today. As mentioned earlier, Dubbo primarily serves as a microservice architecture solution for the Java domain and is the absolute first choice under Java-led technical architecture, but its proprietary protocol design presents challenges to become a standard across languages.

In fact, many general cross-language service integration specifications have emerged previously. The earliest was CORBA in 1991, a protocol for accessing distributed objects, followed by SOAP in 2000, developed under the web service concept. Both CORBA and SOAP provided a set of specifications supporting all platforms and languages, yet were often criticized for being complex and heavy, in addition to performance issues.

REST is an architectural style that, compared to SOAP’s design, offers superior concepts and best practice guidance, with the World Wide Web being the largest and most successful distributed application, serving as the best proof of REST. But like SOAP, running on REST has performance bottlenecks, which could explain why Alibaba did not choose the REST specification for its service framework at the time. It is worth mentioning that although the REST concept has existed for a long time, the REST specification in the Java domain, JAX-RS API, only stabilized in its 2.2 version within the last two years, increasingly aligning with microservice frameworks.

In 1996, the initial version had no support for multiplexing, thus failing to leverage TCP/UDP network capabilities; by 2015, HTTP/2 resolved these issues, maximizing the use of TCP layer bandwidth while supporting streaming, push, and other interaction modes. This aligns with many private or proprietary application protocols, but it standardizes what everyone can easily accept. Notably, HTTP/2 was accompanied by gRPC; Google had initially released Protocol Buffers but had not open-sourced its stubby system; I speculate the key reason was to avoid having gRPC operate on a private protocol and wait for HTTP/2.

In conclusion, protocol technology has consistently evolved toward lightweight and standardized approaches. Heavyweight, non-cross-platform protocols such as SOAP and CORBA will inevitably disappear, while private or proprietary protocols will converge towards standardized protocols. In cross-language scenarios, two types of protocol specifications are highly likely to succeed, namely REST and gRPC, both utilizing HTTP as the communication channel.

## Three Levels for Multi-Language Protocols


![6.png | center | 826x206](/imgs/blog/dubbomesh/6.png "")

Expanding on this, three levels must be considered in the context of multi-language protocols.

* Starting from the far-right session layer, its role is to create interaction modes based on TCP byte streams, such as one-to-one standard request-response modes and one-to-many streaming modes. Dubbo currently has extensibility at this layer, as it supports custom Dubbo-Remoting alongside HTTP channel capabilities, forecasting that the future trend is HTTP/2, which is a focal area for support. Here’s a thought: HTTP is not RPC. HTTP translates to Hypertext Transfer Protocol, but it is not a transport layer protocol. Also, this layer is applicable to MQ, Streaming Compute, Cache, etc.
* Moving onto the presentation layer, this is concerned with how business objects are formatted during actual service calls; for instance, the content-type in HTTP headers describes this presentation protocol, commonly using JSON, TXT, XML, etc. For the sidecar, transparent processing can be performed, meaning it only needs to extract header information, provided business applications pass needed governance fields as strings in their headers. Currently, Dubbo defaults to Hession, which is weaker in cross-language capabilities; hence, looking to the future, JSON is our first option.
* Finally, fundamental service metadata needs to be uniformly described, including what a service does, its name, methods, parameters, etc. Even REST, based on URI, requires a protocol for definition. Dubbo previously defined itself via Java interfaces; now, in multi-language mesh environments, we consider approaching OpenAPI Specifications to support Swagger.
    We believe that within these levels, especially the session and application layers, standardization will definitely emerge within a few years, particularly under the cloud-native trend.

### Kubernetes Integration Plan<span data-type="color" style="color:white">Du</span>


![7.png | center | 826x206](/imgs/blog/dubbomesh/7.png "")
<span data-type="color" style="color:white">Kubernetes Integration Under the Dubbo Mesh Scheme</span>
Actually, the primary reason for the recent popularity of service mesh over the past two years lies in the growing acceptance of cloud-native concepts. Broadly speaking, any microservice framework that integrates into cloud-native can be deemed a service mesh. When discussing cloud-native, Kubernetes cannot be overlooked; thus, our first sharing of the Dubbo Mesh scheme is its integration under Kubernetes, aiming to reuse Kubernetes’ foundational services, enabling Dubbo to resolve microservice integration issues in Kubernetes environments, while maximizing the utilization of existing Dubbo functionalities. The core thoughts are twofold,

* Dubbo applications automatically generate their deployment and service declaration files during the build phase. This mainly resolves the service mapping issue between Dubbo and Kubernetes.
* The address registration for Dubbo is implemented as an extension targeting Kubernetes, utilizing Kubernetes' APIServer to pull and listen for a specific service's pod IP. Therefore, within the Kubernetes cluster, Dubbo services can achieve service discovery within their pod ID’s virtual network.
    
## Cross-Language Protocol Support Plan


![8.png | center | 826x206](/imgs/blog/dubbomesh/8.png "")

Having discussed numerous aspects regarding protocols, we lay the groundwork for our second point in the Dubbo Mesh scheme, which focuses on multi-language support for the Dubbo protocol. The core thought is:
* Actively ensuring compatibility with the open-source community Envoy, enabling Envoy to support Dubbo’s private protocol seamlessly.
* Dubbo supports HTTP/2 as a transport channel, aiming to move the Dubbo protocol capabilities toward a more open and standardized direction.

## Cloud Native Guidance for Service Mesh


![9.png | center | 826x206](/imgs/blog/dubbomesh/9.png "")

Viewing service mesh in isolation from traditional service frameworks doesn't represent significant value and may even incur higher costs. However, when we set service mesh within the context of cloud-native, it reveals a distinct significance.

Service mesh serves as the fifth step in the roadmap for cloud-native concepts; without the preceding four steps of containerization, CI/CD, and so on, truly embracing service mesh would merely be castles in the air. Alibaba's practical experience suggests that implementing service mesh requires integrating with the entire lifecycle of software development, from local development and testing to automated builds via CI services, then distributing as images to repositories while relying on scheduling cloud platforms for continual deployment, culminating in ongoing monitoring.

Dubbo, having been open-sourced for many years, aligns well with cloud-native principles, striving towards the direction of service mesh and contributing to enterprise informatization efforts.

## Summary


In summary, Dubbo Mesh represents an evolution of Dubbo under cloud-native, exploring pathways toward being more open and aligned with standardized protocol specifications. Through this share, I hope everyone takes away three key considerations.

1. The multi-language solution for service mesh essentially follows the pathway of standardized protocol practices to meet multi-language demands.
2. It is advisable to carefully weigh the operational complexities and return on investment in sidecar models based on actual business scenarios.
3. Setting service mesh within the context of cloud-native is essential—disregarding Kubernetes discussions about service mesh practices would be a leap forward one should avoid.
    Finally, I hope everyone can collaboratively build and share the Dubbo open-source community. Thank you.

