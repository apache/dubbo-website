---
date: 2023-01-15
title: "小米与 Dubbo 社区的合作"
linkTitle: "小米"
tags: ["用户案例"]
weight: 4
---

Xiaomi is devoted to making continuous contribution to the open source community. Since the introduction of Dubbo3,  internal projects are rapidly upgrading to the latest version of Dubbo. Currently, At present the numbers of instances has been upgrade to a certain proportion. Not only performance improvements have been seen, but services are also running smoothly with improvements in availability. Statistics provide proof that Dubbo’s switch from api-level discovery to application-level discovery has improved the availability and reliability of service discovery, which leads to lower operations cost. In addition, using ProtoBuf for serialization and deserialization has reduced data exchange size. Lastly, full compatibility with grpc provides convenience to Xiaomi’s multi-language development environment.

Having evolved from Dubbo2, Dubbo3 is a major upgrade in several areas including, Cloud Native adaptation, service discovery, communication protocols. Furthermore, upgrading to version 3.0 requires no changes in application code. The following is a detailed introduction to Dubbo3’s features.

### 云原生适配  Cloud Native Adaptation

To be future proof, the design and development of Dubbo3 has fully adapted Cloud Native. To meet this goal, Dubbo has made some trade-offs.Several core components of Dubbo3 support Kubernetes. In particular, Dubbo3 implements Kubernetes service and container life-cycle. Serverless and native image support will be release in the future.

To support Kubernetes, Dubbo3 places service registration and discovery down to the Kubernetes Service layer, thus reestablishing the boundary between Dubbo and Kubernetes. However, this requires deprecating Dubbo’s own service discovery events.

### 全新服务发现模型  New Service Discovery Model

Previous versions of Dubbo differs from other mainstream service discovery middle-ware such as Spring Cloud and gRPC in its service discovery granularity. In the past Dubbo discovers services at the API level. Dubbo3, however, utilizes application level service discovery. This provides the following benefits.

1. Eliminates incompatibility issues with other service discovery platforms, which is crucial since Xiaomi has diverse languages and development frameworks.
2. The new service discovery model improves resource utilization, lowers Dubbo address’s single machine memory usage, lowers service discover cluster’s load.

### 全新RPC 通信协议  New RPC Communication Protocal

Introduction of a new RPC communication protocol based on HTTP/2 called Triple. Using Triple has the following benefits.

1. Complete compatibility with gRPC.
2. Protobuf support for serialization and deserialization.

### 升级与兼容性  Upgrade and Backwards Compatibility

For production systems, upgrading a dependency while maintaining backward compatibility is challenging. Supporting users of older versions of Dubbo (2.5, 2.6, 2,7) is a goal of Dubbo3’s design and development. Thus, upgrading to Dubbo3 is painless. No changes are required to be made to existing production systems. However to use Dubbo3’s new features, additional changes are needed to existing code. Thus, there are two suggested upgrade paths.

1. Upgrade to Dubbo3 but do not use Dubbo3’s new features. This path requires no code changes.
2. Upgrade to Dubbo3 while making additional changes to support the new features.

### Suggestions
1. Since Dubbo3 is closely compatible with Cloud Native, further work can be done to enhance Dubbo’s support of istio and other service mesh frameworks to speed up Dubbo users’ adaption of service mesh.
2. Add more performance metrics to monitor Dubbo consumers and providers.

### 作者
* 张志勇
* 张平
* 许铮

