---
title: "Dubbo Go 1.4.0"
linkTitle: "dubbo-go 1.4.0"
date: 2021-01-12
tags: ["Release Notes"]
description: >
    The dubbo-go 1.4.0 version has been released, supporting K8s registration center and REST protocol.
---

Thanks to the active support of the community, we released an exciting version on March 25, 2020—dubbo-go v1.4.0. In addition to continuing to support some existing Dubbo features, dubbo-go has begun some of its own innovative attempts.

The most significant aspect of this version is the groundwork laid for cloud-native support. For instance, after long discussions within the community, we finally introduced a solution that uses K8s as the registration center.

Another substantial improvement is that we have made significant strides in observability. Previously, dubbo-go only offered logging as the sole method, making internal information quite opaque, but this version will bring major improvements.

Finally, a thrilling enhancement is our support for the REST protocol.

## 1. K8s Registration Center

The registration center of dubbo-go is essentially a K/V type data storage. The current version implements service registration and discovery in k8s API Server based on Endpoint, as shown in the architecture diagram below.

![img](/imgs/blog/dubbo-go/1.4/k8s.png)

The Endpoint approach first serializes the service information of each dubbo-go process and writes it into the Annotation of its Pod object via the Patch interface provided by Kubernetes. It then uses Kubernetes' Watch interface to monitor updates to the Annotation information of Pods with specific labels in the current Namespace, handling service health checks, service online/offline situations, and updating the local cache in real-time. The entire process completes the functionality of using Kubernetes as a registration center solely using the native Kubernetes API.

This approach is very simple, requiring no additional third-party modules or modifications to Dubbo business logic, merely treating k8s as a deployment platform while relying on its container management capabilities, without utilizing its label selector and service governance features. From the perspective of a k8s Operator, the advantage of the Operator scheme is the downside of the Endpoint scheme; the Endpoint scheme cannot utilize k8s's health check capabilities and lacks event listening for k8s services, resulting in each consumer redundantly listening to unnecessary events, potentially increasing the network load on the API Server as the number of Endpoints grows.

Currently, the dubbo-go community already has a technical solution for an operator version registration center, and future versions (with planned release v1.6) of dubbo-go will provide its implementation. Compared to the current implementation, the operator scheme incurs significantly higher development and online maintenance costs. The two are like two sides of a coin, and the community will facilitate the coexistence of both methods to meet the needs of different levels of users.

Note: Due to Pod scheduling, changes in IP cannot be dynamically updated in the current version's configuration and router config modules. This is something we need to address further.

Reference example[^1].

## 2. Tracing and Metric

Observability is an essential component of microservices, and it is a focus of the 1.4 version. In version 1.4, we mainly provided support in tracing and metric directions.

To support tracing and metrics, a key point is supporting context passing throughout the entire call process. We addressed the issue of context passing across endpoints. Users can now declare context in the interface and set values, with dubbo-go completing the task of transmitting context from the client to the server.

![img](/imgs/blog/dubbo-go/1.4/context.png)

In terms of metrics, dubbo-go has begun supporting Prometheus data collection. Currently, it supports Histogram and Summary in Prometheus. Users can also extend the Reporter interface to customize data collection.

In terms of tracing, dubbo-go's design uses OpenTracing as a unified API, linking the entire chain by passing context between the client and server. Users can use any monitoring framework that supports the OpenTracing API, such as Zipkin, Jaeger, etc.

## 3. REST Protocol Support

Interoperability between Dubbo ecosystem applications and applications from other ecosystems has always been a goal of the dubbo-go community. The dubbo-go v1.3 version has already achieved interoperability between dubbo-go and grpc ecosystem applications. If you want to connect to other ecosystems like Spring, using the REST protocol is undoubtedly a great technical means.

The REST protocol is a powerful feature that has received high community demand, effectively addressing problems like open APIs, front-end communication, and communication between heterogeneous systems. For example, if your company has some legacy code providing services via HTTP interfaces, using our REST protocol can seamlessly integrate it.

By publishing RESTful interfaces in dubbo-go, applications can call any RESTful interface and be called by any client in HTTP format, as shown in the framework diagram below:

![img](/imgs/blog/dubbo-go/1.4/rest.png)

During the design process, considering that different companies use different web frameworks, we allow users to extend their implementation of the REST server (the web framework encapsulation in dubbo-go). Naturally, anything associated with the REST server, such as filters, can be extended within the user's REST server implementation.

## 4. Enhanced Routing Functionality

Routing rules serve to filter target server addresses before initiating an RPC call, with the filtered address list used as candidate addresses for the consumer to finally initiate the RPC call. The v1.4 version of dubbo-go implements Condition Router and Health Instance First Router, which will gradually be followed by the implementation of remaining routers like Tag Router in forthcoming versions.

### 4.1 Conditional Routing

Conditional routing is the first routing rule supported in dubbo-go, allowing users to manage routing rules through configuration files and remote configuration centers.

A similar concept is the group concept in dubbo-go, but conditional routing provides a more granular control mechanism and richer expression semantics. Typical use cases include black and white listing, gray releases, and testing, etc.

Reference example[^2].

### 4.2 Health Instance First Routing

In RPC calls, we hope to direct requests to instances that are fast in handling and in a healthy state. This routing feature determines whether an instance is healthy based on some strategy, excluding unhealthy candidates from the list and prioritizing healthy instances. Here, "healthy" can be a state we define; the default implementation considers an instance unhealthy when the error ratio reaches a certain threshold or when the request activity exceeds a limit, allowing users to extend health detection strategies.

The core issue in our service governance actually lies in how to determine whether an instance is available. Whether it’s load balancing, circuit breaking, or rate limiting, they all answer this question. Therefore, this feature is an excellent attempt since the features we plan to provide next, like rule-based rate limiting and dynamic rate limiting, all aim to address the question of "how to determine the availability of an instance."

So, we welcome everyone to use this feature and provide feedback on the health metrics they set. This will greatly assist our upcoming work.

## 5. Hessian Protocol Enhancements

Compared to Dubbo's Java implementation and other multi-language versions, one of the proud aspects of the dubbo-go community is that both the underlying network engine and the native Hessian2 protocol, as well as the entire service governance framework, have been developed and maintained from scratch by the dubbo-go community. The v1.4 version of dubbo-go brings many new features to the Hessian2 protocol.

### 5.1 Support for Dubbo Protocol Attachments

In dubbo-go, the attachments mechanism is used to pass additional information outside of the business parameters, serving as an important way to transmit non-business parameter information between the client and server.

The hessian encoding protocol transmits this by encoding it at the end of the body content. Previously, dubbo-go-hessian2 did not support reading/writing attachments. At the request of multiple users (such as Ant Financial), dubbo-go-hessian2 now supports reading/writing attachments based on compatibility with the existing use.

The struct for Request and Response defines a map for attachments. When attachments are needed, the user must construct these two types of parameters or return objects. Otherwise, it will not be possible to retrieve and write attachments in the hessian transmission stream.

Additionally, by leveraging the context transmission function in the dubbo-go call chain, users can now add attachments via context in service methods.

### 5.2 Support for Ignoring Non-Registered POJO Resolution

Due to the high coupling of the hessian encoding protocol with Java types, implementing this in Go can be relatively troublesome since specific types need to be indicated. The dubbo-go-hessian2 implementation defines a POJO interface, requiring an implementation of the JavaClassName method for the program to obtain the corresponding class name in Java. This meant that requests containing unregistered classes would result in parsing errors, a problem that was previously unsolvable.

However, certain use cases like gateways or service mesh sidecars require simply reading additional information from the Dubbo requests as one would read HTTP header information, without caring about the specific definitions of Java classes. This feature allows gateways/sidecars to bypass reading unparseable specific types while directly reading the content of attachments when parsing request data flows.

This implementation is achieved by adding a skip field in the Decoder, applying special handling to each object.

### 5.3 Support for java.math.BigInteger and java.math.BigDecimal

In Java services, java.math.BigInteger and java.math.BigDecimal are frequently used numerical types, which the Hessian library maps to the corresponding types under github.com/dubbogo/gost/math/big.

### 5.4 Support for 'Inheritance' and Ignoring Redundant Fields

Since Go does not have the concept of inheritance, earlier versions did not support fields from Java parent classes in dubbo-go-hessian2. In the new version, dubbo-go-hessian2 corresponds to fields from Java's parent class using anonymous structs, such as:

```go
type Dog struct {
    Animal
    Gender  string
    DogName string `hessian:"-"`
}
```

Furthermore, just as the `immediately` directive can be used in JSON encoding to skip serialization of a field, users can use `hessian:"-"` to exclude redundant fields from Hessian serialization.

Currently, the above four features have been integrated into a commercial version of a certain Go version's sidecar for commercial services.

## 6. Nacos Configuration Center

The configuration center is a core component in modern microservice architecture, and now dubbo-go provides support for configuration centers.

![img](/imgs/blog/dubbo-go/1.4/config-center.png)

Nacos, as a platform for dynamic service discovery, configuration management, and service management that is easy to build for cloud-native applications, finally received support as a configuration center in this version.

Reference example[^3].

## 7. Interface-Level Signature Authentication

Dubbo authentication is an additional safeguard provided at the SDK level to prevent sensitive interfaces from being invoked by anonymous users. Users can define whether anonymous calls are allowed at the interface level and perform signature verification on the caller, prohibiting consumption from those who fail the signature verification.

![img](/imgs/blog/dubbo-go/1.4/acl.png)

As illustrated above, the overall implementation is based on the AK/SK mechanism. Applications communicate via HTTPS and pull data from the authentication service at startup, with periodic updates. It also allows users to customize the source of obtaining AK/SK, ensuring security at the RPC layer.

## 8. Review and Outlook

Currently, dubbo-go has reached a relatively stable and mature state. In upcoming versions, we will focus on cloud-native features. The next version will first implement service registration at the application dimension, which will be a completely new registration model distinct from existing ones. This will be a key version in our efforts toward cloud-native architecture.

In terms of observability, we plan to introduce more logging points across the dubbo-go framework, collecting more internal states. This requires feedback from users in actual production environments on how to log and what kind of data to collect.

Regarding rate limiting and circuit breaking, further extensions can be made. The current rate limiting algorithm is static—it does not deduce whether to rate limit based on the current state of the server; it may just be user experience values. Its drawback is that users struggle to determine how to configure it, such as what the TPS should actually be set to. Therefore, we plan to introduce rule-based rate limiting and circuit breaking, which will enable users to set certain system states, like CPU utilization, disk IO, and network IO, etc. When the system state meets the user's rules, circuit breaking will be triggered.

Currently, these planned tasks[^4] have been placed in the dubbo-go project's issues, and interested friends are welcome to participate in development. The dubbo-go community welcomes your joining in the **DingTalk group 23331795**.

[^1]: https://github.com/apache/dubbo-go-samples/tree/1.5/registry/kubernetes
[^2]: https://github.com/dubbogo/dubbo-samples/tree/master/golang/router/condition
[^3]: https://github.com/dubbogo/dubbo-samples/tree/master/golang/configcenter/nacos
[^4]: https://github.com/apache/dubbo-go/milestone/1

