---
title: "Web Mobile Backend Integration Based on Triple"
linkTitle: "Web Mobile Backend Integration Based on Triple"
tags: ["apachecon2023", "triple", "protocol"]
date: 2023-10-07
authors: ["Chen Youwei"]
description: Web Mobile Backend Integration Based on Triple
---

Abstract: This article is compiled from a presentation by Momo R&D engineer and Apache Dubbo PMC Chen Youwei at the Community Over Code 2023 conference. The content is mainly divided into four parts:

- 1. Developing Microservices with RPC Protocols
- 2. The Newly Upgraded Triple Protocol
- 3. Developing Microservices with Triple Protocol
- 4. Governance Capability of Dubbo for Triple Protocol

## 1. Developing Microservices with RPC Protocols

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img.png)

When we normally develop microservices, traditional RPC services may be at the bottom layer. The upper layers may include browsers, mobile devices, external servers, internal testing, curl, etc. We might use an external server like Tomcat to assemble our RPC layer, which is also known as BFF. Alternatively, if we don't have a BFF, our RPC directly provides services. However, since browsers need to access it, we require a gateway, such as Apisix or ShenYu HTTP gateway.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_1.png)

The above figure shows our process, but there are some issues.

If our service is lightweight, needing only a forwarding layer can be troublesome. Whether it's setting up a gateway or starting a web server for forwarding, it can be quite complicated.

Additionally, most RPC services are binary-based, which cannot be tested locally. Hence, our company might develop some background or intermediary processes to facilitate our testing. However, this requires deployment to a testing environment, thus still not allowing for local testing.

Overall, these two issues make ease of use quite low and development costs relatively high due to repetitive tasks.

## 2. The Newly Upgraded Triple Protocol

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_2.png)

Addressing the above two problems, let's introduce the Triple protocol.

First, let’s mention why the previous generation protocol was developed. We all know Dubbo originally used the Dubbo protocol, which is TCP-based and has a specific package design. This design limits the gateway's ability to perform special rule judgments and filtering operations. While it is possible to sacrifice performance to fully unpack the package, reassemble it, and then transparently pass it through, most people are not willing to compromise on performance.

So we wondered if we could separate the original data from the actual package. We now have an existing HTTP and a mainstream gRPC, so our goal is to be compatible with gRPC. gRPC currently uses IDL, which poses problems, especially on the Java side. The complexity arises from writing interfaces and defining packages, making it cumbersome. The Go side is more manageable as developers are accustomed to this development model.

Thus, we developed the Triple protocol, which is fully compatible with gRPC, allowing complete interoperability with gRPC. Additionally, we’ve introduced self-defined interface methods, sacrificing some performance for increased ease of use, as RPC is generally not the bottleneck for business; most bottlenecks are still found in the database.

However, there's one more issue: although we support gRPC, it is based on TPC, so if the front-end or other third-party systems only use HTTP, they still cannot accept our system.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_3.png)

To address all of the above issues, we aim to launch a brand new Triple protocol. We reference various protocols such as gRPC, gRPC Web, and general HTTP to facilitate browser access, support Streaming, and run simultaneously on HTTP/1 and HTTP/2 protocols. Currently, HTTP/3 has not been widely adopted, but we will support HTTP/3 in the future.

The final design is entirely based on HTTP, making it friendly for both human users and developers. We can access it through simple browser requests or curl, especially for unary RPC. Furthermore, we have complete interoperability with gRPC, meaning HTTP traffic does not have to worry about compatibility issues or protocol signing issues. For stability, we only use popular industry networking libraries like Java's Netty or Go's basic net package.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_4.png)

Although both the Triple and gRPC protocols are based on HTTP, gRPC operates on HTTP/2, while Triple works on both HTTP/1 and HTTP/2.

As we entered the gRPC space, we extended some functionalities for ease of use. For instance, we support application JSON, curl access, and in the previous protocol, we supported a secondary serialization process for traditional interface definitions. Here, we aim to use a special tag to define the structure of our body, resolving the secondary serialization issue. Moreover, this feature is extensible, so theoretically, any future HTTP functionalities can be implemented within the Triple protocol.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_5.png)

With the introduction of the Triple protocol, our development process has also transformed. If you don’t require assembly or there’s no external proxy, your access process may go directly from external requests (browser, other servers, curl, internal testing) straight to the server.

Communication with other gRPC services poses no problem, and the process effectively eliminates a layer. For most users who don’t need this scenario, it brings substantial advantages.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_6.png)

The Triple protocol, at its inception, was compatible with gRPC, which was based on HTTP/2 and had Streaming capabilities, thus it inherently supports Streaming. Specially, our new protocol also allows Stream under HTTP/1, but it only supports Server Stream, meaning the client sends one request, and the server sends several responses back—this implements HTTP/1 Server Push.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_7.png)

Client Stream and Bi Stream are straightforward. However, notably, there is no Bi Stream on the Java side; it’s not present in the encoding yet is implemented.

## 3. Developing Microservices with Triple Protocol

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_8.png)

Currently, the Triple protocol flexibly supports two definition methods: IDL definition and direct definition. Direct definitions can be synchronous, asynchronous, or handwritten. Moreover, in a more extreme case, while defining an interface, one can utilize IDL to generate protobuf classes; not defining its service and only using its interface is also feasible—it will automatically recognize whether the interface uses protobuf or not.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_9.png)

The server only needs to implement its service. The figure above provides an example; I employed the API assembly method directly— in true business settings, it could be achieved via annotations or XML.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_10.png)

By supporting the standard HTTP protocol, our testing theoretically simplifies significantly.

Since we support gRPC, we can invoke our service using gRPC curl. However, there are prerequisites: you must have a reflective service and then manually enable it, as it is not enabled by default. It can retrieve interface source data via reflection and convert it to pb format in JSON. Alternatively, we can directly call it using Application JSON. Notably, under HTTP/1, we can also use Stream.

Additionally, as we support HTTP, theoretically, any third-party HTTP client can call our service. Furthermore, our admin can conduct tests, but it must be registered first.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_11.png)

For the calling client, whether using POJO or IDL, there is essentially no difference.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_12.png)

Now that we have the Triple protocol, it’s not operational without a host for the protocol. Therefore, we still need a framework with some service governance for our microservices. Service governance is also an indispensable part of microservices.

## 4. Governance Capability of Dubbo for Triple Protocol

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_13.png)

The positioning of Triple is just one of the protocols in Dubbo. Of course, for compatibility, you may continue to use the original Dubbo protocol or other protocols. Moreover, we support multiple protocols on the same port, enabling users to choose as needed.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_14.png)

At the same time, Dubbo offers a multi-language implementation for Triple. Currently, the official implementations will be available in Rust, Go, Java, JS, Node, and Python. This means users do not need to implement it based on the experimental protocol specifications. If you have some customization needs, such as internal frameworks, you can implement it based on the specifications as well.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_15.png)

Dubbo integrates well with service frameworks. Theoretically, during the development process, especially on the Java side, service definitions, governance, and service registration/discovery do not require concern from clients; it's ready to use out of the box.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_16.png)

Dubbo provides a rich ecosystem, including third-party ecosystems like Nacos and Zookeeper; we don’t need to innovate but directly introduce the necessary packages.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_17.png)

This shows an example of service registration using the Triple protocol. You can select Nacos, Zookeeper, or K8s above, with a Client and a Server on the left, making the call.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_18.png)

Let’s take a look at the implementation on the admin side. It’s worth mentioning that our admin has also been restructured in the new version, implemented using Go, so stay tuned.

![dubbo-triple-protocol](/imgs/blog/2023/8/apachecon-scripts/triple/img_19.png)

We often encounter needs for gray release or traffic shaping. We can send a tag from the admin, label some instances, and the traffic will sequentially flow from the entrance. 

