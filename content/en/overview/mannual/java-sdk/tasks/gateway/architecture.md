---
description: |
    This article discusses the basic architecture of front-end HTTP traffic access to back-end Dubbo microservices, including mobile devices, browsers, desktop applications, and heterogeneous microservice systems.
linkTitle: Basic Architecture
title: The Infrastructure of Front-end HTTP Traffic Access to Dubbo Back-end Microservice System
type: docs
weight: 1
---

Regardless of the type of product you are developing (e-commerce, management systems, mobile apps, etc.), the vast majority of traffic entry points will be HTTP, as users may access the product through browsers, mobile devices, or desktop software. In this case, connecting the Dubbo microservice cluster developed by the back-end to the front-end access devices becomes a problem to solve, which is essentially the problem of conversion and connection between HTTP and RPC.

In general, there are two architectural patterns: centralized and decentralized. The centralized access mode is more universal and does not place many special demands on the back-end RPC protocol and the front-end gateway, but ensuring the performance and stability of the centralized application is a significant challenge. The decentralized mode does not require maintaining an entry application, thus it can accommodate larger traffic and larger-scale clusters.

## Centralized Access Mode
The architecture diagram for centralized access mode is as follows:
* There is a layer of gateway between the back-end services and front-end devices, responsible for traffic filtering, routing, rate limiting, and other traffic management tasks.
* In the back-end cluster, there is a "unified microservice entry application" that connects HTTP and Dubbo services (commonly known as BFF, or Backend for Frontend).

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/arch-centralized-bff.png"/>

BFF applications can typically be developed using common frameworks such as Spring Web, which publish a series of HTTP services to receive traffic from the gateway or front-end devices and are responsible for initiating Dubbo calls as needed.

{{% alert title="Note" color="info" %}}
Both `dubbo` and `triple` protocols support this access architecture. Additionally, when configuring BFF applications to call Dubbo services, you can use the regular Dubbo configuration method or use generalized calls:
* The advantage of using [generalized calls]() for accessing Dubbo protocol is that it avoids dependency on the service binary package and achieves dynamic configuration effects.
* When configuring access to the triple protocol, you can use HTTP calling methods to similarly avoid dependency on the service binary package for dynamic configuration effects.
{{% /alert %}}

## Decentralized Access Mode
Compared to centralized architecture, this approach does not differ much, the only difference is that there is no need for an additional BFF application; we can call the back-end Dubbo services directly through the gateway.

However, this method places special demands on the gateway. If the back-end uses the Dubbo protocol, the gateway must have the capability to convert `http -> dubbo` protocol, but as you will discover in the upcoming documents, we can bypass protocol conversion by publishing multiple protocols, allowing the gateway to access back-end services directly through HTTP. If the back-end uses the triple protocol, it becomes simpler because the triple protocol supports HTTP requests in application/json format.

<img style="max-width:800px;height:auto;" src="/imgs/v3/tasks/gateway/arch-decentralized-dubbo.png"/>

## Summary
Using different protocols will also affect architecture choices; the triple protocol, due to its native support for HTTP access, can support both architectural modes without difference, and the access principle is simpler and more direct. However, the Dubbo protocol, as the main protocol promoted during the Dubbo2 era, is a binary protocol based on TCP, which results in some differences in access methods.

In the upcoming two documents, we will introduce the specific front-end traffic access methods for the Dubbo and triple protocols; the documents are also applicable to both centralized and decentralized architectures.

