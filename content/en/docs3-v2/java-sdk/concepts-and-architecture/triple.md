---
type: docs
title: "Triple Protocol"
linkTitle: "Triple Protocol"
weight: 6
---
### Protocol Description
Triple is an HTTP2-based open protocol proposed by Dubbo3, which aims to solve the interoperability problems brought about by Dubbo2's private protocol. Compared with the original Dubbo2 protocol, Triple has the following advantages:

1. Interoperability between native and gRPC protocols. Open up the gRPC ecology and reduce the migration cost from gRPC to Dubbo.
2. Enhance multilingual ecology. Avoid the problem of difficulty in business selection and adaptation due to insufficient capabilities of Dubbo SDK in CPP/C#/RUST and other languages.
3. Gateway friendly. The gateway does not need to participate in serialization, which is convenient for users to upgrade from the traditional HTTP to generalized Dubbo call gateway to the open source or cloud vendor's Ingress solution.
4. Perfect asynchronous and streaming support. It brings performance improvement from the underlying protocol to the upper-layer business, and it is easy to build a full-link asynchronous streaming service that strictly guarantees the order of messages.

**Currently, the Dubbo SDK for Java and Go fully supports the Triple protocol. ** In Alibaba, the Triple protocol is widely used for cross-environment, cross-language, and cross-ecology interoperability, and hundreds of thousands of containers have been used in production.

### Support methods
Java SDK supports [IDL Generate Stub](/en/docs3-v2/java-sdk/quick-start/idl)
and [Java Interface](/en/docs3-v2/java-sdk/quick-start/idl), the IDL method is recommended for multi-language, ecological interoperability, and streaming requirements, and the smooth upgrade of existing services is recommended
Interface method.

- How old Dubbo2 users can upgrade from existing protocol to Triple(TBD)
- New user or business reference [Dubbo3 Triple Quick Start](/en/docs3-v2/java-sdk/quick-start/idl/)
- In-depth understanding of the Triple protocol: [Dubbo3 Triple Protocol Design and Principles](https://github.com/apache/dubbo-awesome/blob/master/proposals/D0-triple.md)