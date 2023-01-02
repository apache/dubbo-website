---
type: docs
linkTitle: "Triple Protocol"
title: "Guide to Migrating Dubbo Protocol to Triple Protocol"
weight: 2
description: "Triple Protocol Migration Guide"
---

## Triple Introduction

For the format and principle of the `Triple` protocol, please refer to [RPC Communication Protocol](/en/docs3-v2/java-sdk/reference-manual/protocol/triple/overview/)

According to the goals of Triple design, the `Triple` protocol has the following advantages:

- Capable of cross-language interaction. Both the traditional multi-language and multi-SDK mode and the Mesh cross-language mode require a more general and scalable data transmission protocol.
- Provide a more complete request model. In addition to supporting the traditional Request/Response model (Unary one-way communication), it also supports Stream (streaming communication) and Bidirectional (two-way communication).
- Easy to expand, high penetration, including but not limited to Tracing / Monitoring and other support, should also be recognized by devices at all levels, gateway facilities, etc. can identify data packets, friendly to Service Mesh deployment, and reduce the difficulty of understanding for users.
- Fully compatible with grpc, the client/server can communicate with the native grpc client.
- Components in the existing grpc ecosystem can be reused to meet cross-language, cross-environment, and cross-platform intercommunication requirements in cloud-native scenarios.

For Dubbo users currently using other protocols, the framework provides migration capabilities compatible with existing serialization methods. Without affecting existing online businesses, the cost of migrating protocols is almost zero.

Dubbo users who need to add new connection to Grpc service can directly use the Triple protocol to achieve the connection, and do not need to introduce the grpc client separately to complete it. Not only can the existing Dubbo ease of use be retained, but also the complexity of the program and the development and maintenance can be reduced. Cost, it can be connected to the existing ecology without additional adaptation and development.

For Dubbo users who need gateway access, the Triple protocol provides a more native way to make gateway development or use open source grpc gateway components easier. The gateway can choose not to parse the payload, which greatly improves the performance. When using the Dubbo protocol, the language-related serialization method is a big pain point for the gateway, and the traditional HTTP-to-Dubbo method is almost powerless for cross-language serialization. At the same time, since Triple's protocol metadata is stored in the request header, the gateway can easily implement customized requirements, such as routing and current limiting.


## Dubbo2 protocol migration process

Dubbo2 users use dubbo protocol + custom serialization, such as hessian2 to complete remote calls.

By default, Grpc only supports Protobuf serialization, and it cannot support multi-parameter and method overloading in the Java language.

At the beginning of Dubbo3, one goal was to be perfectly compatible with Dubbo2. Therefore, in order to ensure the smooth upgrade of Dubbo2, the Dubbo framework has done a lot of work to ensure that the upgrade is seamless. Currently, the default serialization is consistent with Dubbo2 as `hessian2`.

**So, if you decide to upgrade to Dubbo3's `Triple` protocol, you only need to modify the protocol name in the configuration to `tri` (note: not triple). **

For more instructions on using the `Triple` protocol, please refer to [Triple Protocol Migration Guide](/en/docs3-v2/java-sdk/upgrades-and-compatibility/migration-triple/).