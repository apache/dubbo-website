---
type: docs
title: "gRPC Protocol"
linkTitle: "gRPC Protocol"
weight: 5
---


## Feature description
Dubbo has supported the gRPC protocol since version 2.7.5. For developers who plan to use HTTP/2 communication, or want to take advantage of the capabilities of Stream, backpressure, and Reactive programming brought by gRPC,
You can consider enabling the gRPC protocol.

#### Benefits of supporting gRPC
* Bring service governance capabilities to users who expect to use the gRPC protocol, and facilitate access to the Dubbo system
* Users can use Dubbo-style, interface-based programming style to define and use remote services

## scenes to be used

- Synchronous backend microservice-to-microservice communication that requires an immediate response to continue processing.
- Requires a Polyglot environment that supports mixed programming platforms.
- Low latency and high throughput communications where performance is critical.
- Peer-to-peer real-time communication - gRPC pushes messages in real time without polling and has excellent support for bidirectional streaming.
- Network Constrained Environments - Binary gRPC messages are always smaller than equivalent text-based JSON messages.

## How to use
### Using gRPC in Dubbo
[Example](https://github.com/apache/dubbo-samples/tree/master/99-integration/dubbo-samples-grpc)

### steps
1. Define a service using IDL
2. Configure the compiler plug-in, precompile locally
3. Configure to expose/reference Dubbo service

> In addition to the native StreamObserver interface type, Dubbo also supports [RxJava](https://github.com/apache/dubbo-samples/tree/master/99-integration/dubbo-samples-grpc/dubbo-samples-rxjava), [Reactor](https://github.com/apache/dubbo-samples/tree/master/99-integration/dubbo-samples-grpc/dubbo-samples-reactor) programming style API.
