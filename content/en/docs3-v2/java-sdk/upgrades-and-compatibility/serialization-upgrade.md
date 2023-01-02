---
type: docs
title: "Serialization Protocol Upgrade Guide"
linkTitle: "Serialization Protocol Upgrade Guide"
weight: 6
description: "Best practice for lossless upgrade serialization protocols"
---
In version 3.1.0, the serialization protocol supported by Dubbo by default adds support for Fastjson2. Some users may consider upgrading the serialization protocol in the existing system, but the difference between the server and client versions may cause the client to not support the serialization protocol of the server. In version 3.2.0, Dubbo's server introduces a new configuration `prefer-serialization`, which can perfectly solve the possible risks in the server-side serialization upgrade process.


### Best Practices

Serialization protocol upgrade needs to be done in two steps:

* **First, it is necessary to promote the serialization protocol upgrade of the server, and at the same time, the `prefer-serialization` configuration needs to be added to the exposed configuration of the server. For example: the serialization protocol before the upgrade is hessian2, and the serialization protocol after the upgrade is Fastjson2, then the configuration shown below should be added to the exposed configuration of the server **

```yaml
dubbo.provider.prefer-serialization=fastjson2,hessian2
dubbo.provider.serialization=hessian2
```
* **Secondly, the client needs to be upgraded to the same version as the server**

### Implementation principle

The dubbo client serialization protocol is selected according to the registration configuration of the server (that is, the `serialization` configuration of the server). In the request phase, dubbo will assemble the serialization protocol of the client into the request header, and the server will determine the deserialization protocol according to the request header when performing deserialization.
- **So, if the versions of the server and the client are inconsistent, the client may not be able to serialize. ** In order to solve this situation, 3.2.0 will use the protocol configured by `prefer-serialization` first when serializing the client. If the protocol related to `prefer-serialization` is not supported, the protocol configured by `serialization` will be used . (You can think of `serialization` as a bottom-up configuration)