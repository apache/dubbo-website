---
aliases:
    - /en/docs3-v2/java-sdk/upgrades-and-compatibility/serialization-upgrade/
    - /en/docs3-v2/java-sdk/upgrades-and-compatibility/serialization-upgrade/
    - /en/overview/mannual/java-sdk/upgrades-and-compatibility/serialization-upgrade/
description: Lossless upgrade serialization protocol guide
linkTitle: Serialization Protocol Upgrade
title: Serialization Protocol Upgrade
type: docs
weight: 5
---


In version `3.1.0`, Dubbo adds support for Fastjson2 in its default serialization protocols. Some users may consider upgrading the serialization protocol in existing systems, but differences in server and client versions may result in the client not supporting the server's serialization protocol.

In version `3.2.0`, Dubbo's server introduces a new configuration `prefer-serialization`, which can perfectly address the risks that may arise during the server serialization upgrade process.

### Best Practices

Upgrading the serialization protocol requires two steps:

* **Firstly, promote the server's serialization protocol upgrade while adding the `prefer-serialization` configuration in the server's export configuration.**
> For example: if the serialization protocol before the upgrade is hessian2, and the serialization protocol after the upgrade is Fastjson2, then the server's export configuration should include the following configuration.

```yaml
dubbo.provider.prefer-serialization=fastjson2,hessian2
dubbo.provider.serialization=hessian2
```
* **Secondly, the client needs to be upgraded to the same version as the server.**

### Implementation Principle

The Dubbo client serialization protocol is selected based on the server's registration configuration (i.e., the server's `serialization` configuration). During the request phase, Dubbo will assemble the client's serialization protocol into the request header, and the server will determine the deserialization protocol based on the request header. Therefore, if the server and client versions are inconsistent, the client may fail to serialize.

To resolve this situation, in `3.2.0`, when the client serializes, it will prioritize the protocol from the `prefer-serialization` configuration; if the protocol related to `prefer-serialization` is not supported, it will use the protocol from the `serialization` configuration. (You can think of `serialization` as a fallback configuration.)

