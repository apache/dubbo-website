---
type: docs
title: "Protocol Overview"
linkTitle: "Protocol Overview"
weight: 1
---

Dubbo3 provides Triple (Dubbo3) and Dubbo2 protocols, which are native protocols of the Dubbo framework. In addition, Dubbo3 also integrates many third-party protocols and incorporates them into Dubbo's programming and service governance system.
Including gRPC, Thrift, JsonRPC, Hessian2, REST, etc. The following focuses on the Triple and Dubbo2 protocols.

## protocol description

The Triple protocol is the main protocol launched by Dubbo3. Triple means the third generation. Through the evolution of the Dubbo1.0/Dubbo2.0 two-generation protocol and the wave of technology standardization brought by cloud native, the new Dubbo3 protocol Triple came into being.

### Select the RPC protocol

The protocol is the core of RPC, which regulates the content and format of data transmission in the network. In addition to the necessary request and response data, it usually contains additional control data, such as the serialization method of a single request, timeout period, compression method, and authentication information.

The content of the agreement consists of three parts
- Data exchange format: Define the byte stream content of RPC request and response objects in network transmission, also known as serialization mode
- Protocol structure: defines the list of fields, the semantics of each field, and the arrangement of different fields
- Protocols define how data is transmitted across networks by defining rules, formats, and semantics. A successful RPC requires both ends of the communication to be able to read and write network byte streams and convert objects according to the protocol. If the two ends cannot reach an agreement on the protocol used, there will be chickens talking with ducks, which cannot meet the needs of long-distance communication.

![Protocol Selection](/imgs/v3/concepts/triple-protocol.png)

The design of the RPC protocol needs to consider the following:
- Versatility: Unified binary format, cross-language, cross-platform, multi-transport layer protocol support
- Extensibility: protocol adds fields, upgrades, supports user extensions and additional business metadata
- Performance: As fast as it can be
- Penetration: can be identified and forwarded by various terminal devices: gateways, proxy servers, etc.
  Generally, versatility and high performance cannot be achieved at the same time, and protocol designers need to make certain trade-offs.

### HTTP/1.1 protocol

Compared with the private RPC protocol directly built on the TCP transport layer, the remote call solution built on HTTP will have better versatility, such as WebServices or REST architecture, using HTTP + JSON can be said to be a de facto standard solution .

Choosing to build on top of HTTP has two biggest advantages:

- The semantics and scalability of HTTP well meet the requirements of RPC calls.
- Versatility, the HTTP protocol is supported by almost all devices on the network, and has good protocol penetration.

But there are also obvious problems:

- In a typical Request-Response model, there can only be one waiting Request request on a link at a time. HOL will be generated.
- Human Readable Headers, using a more general, human-readable header transfer format, but with considerably poorer performance
- No direct Server Push support, need to use workarounds such as Polling Long-Polling

### gRPC protocol
The above mentioned the advantages and disadvantages of building the RPC protocol on top of the HTTP and TCP protocols. Compared with Dubbo built on the TCP transport layer, Google chose to define gRPC directly on top of the HTTP/2 protocol.
The advantages of gRPC are inherited from HTTP2 and Protobuf.

- The HTTP2-based protocol is simple enough, with low learning costs for users, and naturally has server push/multiplexing/flow control capabilities
- Protobuf-based multi-language cross-platform binary compatibility, providing powerful unified cross-language capabilities
- The ecology based on the protocol itself is relatively rich, the natural support protocol of components such as k8s/etcd, and the de facto protocol standard of cloud native

But there are also some problems

- The support for service governance is relatively basic, and it is more inclined to the basic RPC function. The protocol layer lacks the necessary unified definition, and it is not easy for users to use it directly.
- The serialization method of strong binding protobuf requires high learning cost and transformation cost. For the existing monolingual users, the migration cost cannot be ignored

### Finally choose the Triple protocol
In the end, we chose to be compatible with gRPC and use HTTP2 as the transport layer to build a new protocol, which is Triple.

The rise of containerized applications and microservices has led to the development of techniques optimized for workload content. The traditional communication protocols (RESTFUL or other HTTP-based custom protocols) used in the client are difficult to meet the convenience requirements of the application in terms of performance, maintainability, scalability, and security. A cross-language, modular protocol will gradually become a new application development protocol standard. Since the gRPC protocol became a CNCF project in 2017, more and more infrastructure and businesses including k8s and etcd have begun to use the gRPC ecosystem. As a cloud-native microservice framework, Dubbo's new protocol is also perfectly compatible with gRPC . Moreover, Triple will also enhance and supplement some imperfect parts of the gRPC protocol.

So, does the Triple protocol solve the series of problems we mentioned above?

- In terms of performance: The Triple protocol adopts the strategy of separating metadata and payload, so that intermediate devices, such as gateways, can be avoided to parse and deserialize payload, thereby reducing response time.
- In terms of routing support, since metadata supports users to add custom headers, users can more conveniently divide clusters or perform routing according to headers, so that when publishing, there is more flexibility in switching grayscale or disaster recovery.
- In terms of security, it supports encrypted transmission capabilities such as two-way TLS authentication (mTLS).
- In terms of ease of use, in addition to supporting Protobuf serialization recommended by native gRPC, Triple supports other serializations such as Hessian/JSON in a general way, allowing users to upgrade to the Triple protocol more conveniently. For the original Dubbo service, modifying or adding the Triple protocol only needs to add a line of protocol configuration in the code block declaring the service, and the transformation cost is almost zero.

## Triple protocol

![Triple protocol communication method](/imgs/v3/concepts/triple.png)

status quo

- 1. Fully compatible with grpc, client/server can connect with native grpc client

- 2. At present, it has been verified by large-scale production practice and has reached the production level

Features and advantages

- 1. Capable of cross-language intercommunication. Both the traditional multi-language multi-SDK mode and the Mesh cross-language mode require a more general and scalable data transmission format.

- 2. Provide a more complete request model. In addition to the Request/Response model, it should also support Streaming and Bidirectional.

- 3. Easy to expand, high penetration, including but not limited to Tracing / Monitoring and other support, should also be recognized by devices at all levels, gateway facilities, etc. can identify data packets, friendly to Service Mesh deployment, and reduce the difficulty of understanding for users.

- 4. Multiple serialization methods support and smooth upgrade

- 5. Support Java users to upgrade without awareness, no need to define cumbersome IDL files, and only need to simply modify the protocol name to easily upgrade to the Triple protocol

### Triple protocol content introduction

Further extension based on the grpc protocol

- Service-Version → "tri-service-version" {Dubbo service version}
- Service-Group → "tri-service-group" {Dubbo service group}
- Tracing-ID → "tri-trace-traceid" {tracing id}
- Tracing-RPC-ID → "tri-trace-rpcid" {_span id _}
- Cluster-Info → "tri-unit-info" {cluster infomation}

Among them, Service-Version and Service-Group respectively identify the version and group information of the Dubbo service, because the path of grpc declares the service name and method name, compared with the Dubbo protocol, it lacks version and group information; Tracing-ID, Tracing- RPC-ID is used for full-link tracking capabilities, which respectively represent tracing id and span id information; Cluster-Info represents cluster information, which can be used to build some flexible service management capabilities related to routing such as cluster division.

### Triple Streaming

Compared with the traditional unary method, the Triple protocol has more streaming RPC capabilities currently provided

- What scenario is Streaming used for?

In some application scenarios such as large file transmission and live broadcast, the consumer or provider needs to transmit a large amount of data with the peer. Since the amount of data in these cases is very large, there is no way to transmit it in one RPC packet. Transmission, so for these data packets, we need to fragment the data packets and transmit them through multiple RPC calls. If we transmit these split RPC data packets in parallel, then the relevant data packets after reaching the peer end It is unordered, and the received data needs to be sorted and spliced, and the related logic will be very complicated. But if we serially transmit the split RPC packets, the corresponding network transmission RTT and data processing delay will be very large.

In order to solve the above problems, and to transmit a large amount of data between the consumer and the provider in a pipelined manner, the Streaming RPC model came into being.

Through the Streaming RPC method of the Triple protocol, multiple user-mode long connections, Stream, will be established between the consumer and the provider. Multiple Streams can exist on the same TCP connection at the same time, and each Stream is identified by a StreamId, and the data packets on a Stream will be read and written sequentially.

### Summarize

In the world of APIs, the most important trend is the rise of standardized technologies. The Triple protocol is the main protocol launched by Dubbo3. It adopts a layered design, and its data exchange format is developed based on the Protobuf (Protocol Buffers) protocol, which has excellent serialization/deserialization efficiency. Of course, it also supports multiple serialization methods and many development languages. In the transport layer protocol, Triple chose HTTP/2, which has greatly improved its transmission efficiency compared with HTTP/1.1. In addition, as a mature open standard, HTTP/2 has rich security and flow control capabilities, and has good interoperability. Triple can not only be used for server-side service calls, but also support the interaction between browsers, mobile apps, and IoT devices and back-end services. At the same time, the Triple protocol seamlessly supports all service management capabilities of Dubbo3.

Under the trend of Cloud Native, the interoperability requirements between cross-platform, cross-vendor, and cross-environment systems will inevitably give rise to RPC technology based on open standards, and gRPC conforms to the historical trend and has been more and more widely used. In the field of microservices, the proposal and implementation of the Triple protocol is a big step for Dubbo3 to move towards cloud-native microservices.

##Dubbo2

### Protocol SPEC

![/dev-guide/images/dubbo_protocol_header.jpg](/imgs/dev/dubbo_protocol_header.png)


- Magic - Magic High & Magic Low (16 bits)

  Identifies dubbo protocol with value: 0xdabb

- Req/Res (1 bit)

  Identifies this is a request or response. Request - 1; Response - 0.

- 2 Way (1 bit)

  Only useful when Req/Res is 1 (Request), expect for a return value from server or not. Set to 1 if need a return value from server.

-Event (1 bit)

Identifies an event message or not, for example, heartbeat event. Set to 1 if this is an event.

-Serialization ID (5 bits)

Identifies serialization type: the value for fastjson is 6.

- Status (8 bits)

  Only useful when Req/Res is 0 (Response), identifies the status of response

    - 20 - OK
    - 30 - CLIENT_TIMEOUT
    - 31 - SERVER_TIMEOUT
    - 40 - BAD_REQUEST
    - 50 - BAD_RESPONSE
    - 60 - SERVICE_NOT_FOUND
    - 70 - SERVICE_ERROR
    - 80 - SERVER_ERROR
    - 90 - CLIENT_ERROR
    - 100 - SERVER_THREADPOOL_EXHAUSTED_ERROR

- Request ID (64 bits)

  Identifies an unique request. Numeric (long).

- Data Length (32)

  Length of the content (the variable part) after serialization, counted by bytes. Numeric (integer).

-Variable Part

Each part is a byte[] after serialization with specific serialization type, identifies by Serialization ID.

Every part is a byte[] after serialization with specific serialization type, identifies by Serialization ID

1. If the content is a Request (Req/Res = 1), each part consists of the content, in turn is:
    - Dubbo version
    - Service name
    - Service version
      -Method name
      -Method parameter types
      -Method arguments
      -Attachments

1. If the content is a Response (Req/Res = 0), each part consists of the content, in turn is:
    - Return value type, identifies what kind of value returns from server side: RESPONSE_NULL_VALUE - 2, RESPONSE_VALUE - 1, RESPONSE_WITH_EXCEPTION - 0.
    - Return value, the real value returns from server.


> For the (Variable Part) variable length part, when the current version of the dubbo framework uses json serialization, an extra line break is added between each part of the content as a separator. Please add an extra line break after each part of the Variable Part, such as :

```
Dubbo version bytes (line break)
Service name bytes (newline)
```