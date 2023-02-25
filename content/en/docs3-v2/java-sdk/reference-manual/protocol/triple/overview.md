---
type: docs
title: "Protocol Overview"
linkTitle: "Protocol Overview"
weight: 1
---

## Triple overview

For the format and principle of the `Triple` protocol, please refer to [RPC Communication Protocol](/zh-cn/docs/concepts/rpc-protocol/)

According to the goal of Triple design, the `Triple` protocol has the following advantages

- Capable of cross-language interaction. Both the traditional multi-language and multi-SDK mode and the Mesh cross-language mode require a more general and scalable data transmission protocol.
- Provide a more complete request model. In addition to supporting the traditional Request/Response model (Unary one-way communication), it also supports Stream (streaming communication) and Bidirectional (two-way communication).
- Easy to expand, high penetration, including but not limited to Tracing / Monitoring and other support, should also be recognized by devices at all levels, gateway facilities, etc. can identify data packets, friendly to Service Mesh deployment, and reduce the difficulty of understanding for users.
- Fully compatible with grpc, the client/server can communicate with the native grpc client.
- Components in the existing grpc ecosystem can be reused to meet cross-language, cross-environment, and cross-platform intercommunication requirements in cloud-native scenarios.

For Dubbo users currently using other protocols, the framework provides migration capabilities compatible with existing serialization methods. Without affecting existing online businesses, the cost of migrating protocols is almost zero.
### grpc docking
Dubbo users who need to add grpc services can directly use the Triple protocol to get through, without the need to introduce grpc client separately to complete, not only can retain the existing ease of use of Dubbo, but also reduce the complexity of the program and development and maintenance Cost, it can be connected to the existing ecology without additional adaptation and development.
### Gateway Access
For Dubbo users who need gateway access, the Triple protocol provides a more native way to make gateway development or use open source grpc gateway components easier. The gateway can choose not to parse the payload, which greatly improves the performance. When using the Dubbo protocol, the language-related serialization method is a big pain point for the gateway, and the traditional HTTP-to-Dubbo method is almost powerless for cross-language serialization. At the same time, since Triple's protocol metadata is stored in the request header, the gateway can easily implement customized requirements, such as routing and current limiting.


## common problem

### protobuf class not found

Since the bottom layer of the Triple protocol needs to rely on the protobuf protocol for transmission, even if the defined service interface does not use protobuf, it is necessary to introduce protobuf dependencies into the environment.

```xml
        <dependency>
            <groupId>com.google.protobuf</groupId>
            <artifactId>protobuf-java</artifactId>
            <version>3.19.4</version>
        </dependency>
```