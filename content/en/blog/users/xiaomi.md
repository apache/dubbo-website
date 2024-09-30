---
date: 2023-01-15
title: "Xiaomi's Collaboration with the Dubbo Community"
linkTitle: "Xiaomi"
tags: ["User Case"]
weight: 4
---

Xiaomi is devoted to making continuous contributions to the open-source community. Since the introduction of Dubbo3, internal projects are rapidly upgrading to the latest version of Dubbo. Currently, the number of instances has been upgraded to a certain proportion. Not only have performance improvements been seen, but services are also running smoothly with improvements in availability. Statistics provide proof that Dubbo’s switch from API-level discovery to application-level discovery has improved the availability and reliability of service discovery, leading to lower operation costs. In addition, using ProtoBuf for serialization and deserialization has reduced the data exchange size. Lastly, full compatibility with gRPC provides convenience to Xiaomi’s multi-language development environment.

Having evolved from Dubbo2, Dubbo3 is a major upgrade in several areas including Cloud Native adaptation, service discovery, and communication protocols. Furthermore, upgrading to version 3.0 requires no changes in application code. The following is a detailed introduction to Dubbo3’s features.

### Cloud Native Adaptation

To be future-proof, the design and development of Dubbo3 has fully adapted to Cloud Native. To meet this goal, Dubbo has made some trade-offs. Several core components of Dubbo3 support Kubernetes. In particular, Dubbo3 implements Kubernetes service and container lifecycle. Serverless and native image support will be released in the future.

To support Kubernetes, Dubbo3 places service registration and discovery down to the Kubernetes Service layer, thus reestablishing the boundary between Dubbo and Kubernetes. However, this requires deprecating Dubbo’s own service discovery events.

### New Service Discovery Model

Previous versions of Dubbo differed from other mainstream service discovery middleware such as Spring Cloud and gRPC in its service discovery granularity. In the past, Dubbo discovered services at the API level. Dubbo3, however, utilizes application-level service discovery. This provides the following benefits.

1. Eliminates incompatibility issues with other service discovery platforms, which is crucial since Xiaomi has diverse languages and development frameworks.
2. The new service discovery model improves resource utilization, lowers Dubbo address’s single machine memory usage, and lowers service discovery cluster’s load.

### New RPC Communication Protocol

Introduction of a new RPC communication protocol based on HTTP/2 called Triple. Using Triple has the following benefits.

1. Complete compatibility with gRPC.
2. Protobuf support for serialization and deserialization.

### Upgrade and Backwards Compatibility

For production systems, upgrading a dependency while maintaining backward compatibility is challenging. Supporting users of older versions of Dubbo (2.5, 2.6, 2.7) is a goal of Dubbo3’s design and development. Thus, upgrading to Dubbo3 is painless. No changes are required to be made to existing production systems. However, to use Dubbo3’s new features, additional changes are needed to existing code. Thus, there are two suggested upgrade paths.

1. Upgrade to Dubbo3 but do not use Dubbo3’s new features. This path requires no code changes.
2. Upgrade to Dubbo3 while making additional changes to support the new features.

### Suggestions
1. Since Dubbo3 is closely compatible with Cloud Native, further work can be done to enhance Dubbo’s support of Istio and other service mesh frameworks to speed up Dubbo users’ adaptation of service mesh.
2. Add more performance metrics to monitor Dubbo consumers and providers.

### Author
* Zhang Zhiyong
* Zhang Ping
* Xu Zheng

