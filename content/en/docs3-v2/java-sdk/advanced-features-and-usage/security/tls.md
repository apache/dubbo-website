---
type: docs
title: "TLS Support"
linkTitle: "TLS support"
weight: 1
description: "Learn about TLS in dubbo3 for secure transport"
---
## Feature description

Both the built-in Dubbo Netty Server and the newly introduced gRPC protocol provide a TLS-based secure link transmission mechanism.

There is a unified entry for TLS configuration.

## scenes to be used

Users who require encryption for the entire link can use TLS.

## Reference use case

[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-ssl](https://github.com/apache/dubbo-samples/tree/master/4-governance/dubbo-samples-ssl)

## How to use

### Provider side
```java
SslConfig sslConfig = new SslConfig();
sslConfig.setServerKeyCertChainPath("path to cert");
sslConfig.setServerPrivateKeyPath(args[1]);
// If two-way cert authentication is enabled
if (mutualTls) {
  sslConfig.setServerTrustCertCollectionPath(args[2]);
}

ProtocolConfig protocolConfig = new ProtocolConfig("dubbo/grpc");
protocolConfig.setSslEnabled(true);
```
If you want to use the gRPC protocol, the protocol negotiation mechanism will be used when TLS is turned on, so you must use a Provider that supports the ALPN mechanism. The recommended one is netty-tcnative. For details, please refer to [Summary](https:/ /github.com/grpc/grpc-java/blob/master/SECURITY.md)


### Consumer side

```java
if (!mutualTls) {}
    sslConfig.setClientTrustCertCollectionPath(args[0]);
} else {
    sslConfig.setClientTrustCertCollectionPath(args[0]);
    sslConfig.setClientKeyCertChainPath(args[1]);
    sslConfig.setClientPrivateKeyPath(args[2]);
}
```

In order to ensure the flexibility of application startup as much as possible, the specification of TLS Cert can also be dynamically specified during the startup phase according to the deployment environment through -D parameters or environment variables. Refer to Dubbo [Configuration Read Rules](/zh-cn/docs/advanced /config-rule)


> On the security of service calls, Dubbo will continue to invest in subsequent versions, and the authentication mechanism for service discovery/calling is expected to meet you in the next version.