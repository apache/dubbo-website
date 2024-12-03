---
aliases:
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/security/tls/
    - /en/docs3-v2/java-sdk/advanced-features-and-usage/security/tls/
    - /en/overview/mannual/java-sdk/advanced-features-and-usage/security/tls/
    - /en/overview/mannual/java-sdk/reference-manual/protocol/tls/
description: 'Understand how TLS ensures transmission security in Dubbo'
linkTitle: TLS Support
title: TLS Support
type: docs
weight: 10
---





## Feature Description

The built-in Dubbo Netty Server and the newly introduced gRPC protocol provide TLS-based secure link transmission mechanisms.

TLS configuration has a unified entry point.

## Use Cases

Users with encryption requirements for end-to-end links can use TLS.

> Reference Use Case
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-ssl](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-ssl)

## Usage

### Provider Side
```java
SslConfig sslConfig = new SslConfig();
sslConfig.setServerKeyCertChainPath("path to cert");
sslConfig.setServerPrivateKeyPath(args[1]);
// If mutual cert authentication is enabled
if (mutualTls) {
  sslConfig.setServerTrustCertCollectionPath(args[2]);
}

ProtocolConfig protocolConfig = new ProtocolConfig("dubbo/grpc");
protocolConfig.setSslEnabled(true);
```
If using the gRPC protocol, protocol negotiation will be used when enabling TLS, so a Provider supporting the ALPN mechanism must be used, with netty-tcnative recommended. See the gRPC Java community's [summary]( https://github.com/grpc/grpc-java/blob/master/SECURITY.md).

### Consumer Side

```java
if (!mutualTls) {}
    sslConfig.setClientTrustCertCollectionPath(args[0]);
} else {
    sslConfig.setClientTrustCertCollectionPath(args[0]);
    sslConfig.setClientKeyCertChainPath(args[1]);
    sslConfig.setClientPrivateKeyPath(args[2]);
}
```

To ensure flexibility in application startup, the TLS Cert specification can also be dynamically set during startup based on the deployment environment using -D parameters or environment variables. Refer to Dubbo's [configuration reading rules](/en/docs/advanced/config-rule).

> Regarding the security of service calls, Dubbo will continue to invest in this area in future versions, with authentication mechanisms for service discovery/calls expected to be available in upcoming releases.

