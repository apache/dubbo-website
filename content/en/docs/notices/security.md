
---
type: docs
title: "vulnerability"
linkTitle: "vulnerability"
description: "Deserialization Vulnerability"
weight: 90
---


## Deserialization Vulnerabilities
Dubbo supports the extension of serialization protocol. Theoretically, users can enable serialization protocol with arbitrary order based on the extension mechanism, which brings great flexibility, but at the same time, they should be aware of the potential security risks.
Data deserialization is one of the most vulnerable links to be exploited by attackers. Attackers use it to steal or destroy server-side data, such as rce attack. 
Before switching the serialization protocol or implementation, the user should fully investigate the security guarantee of target serialization protocol and its framework implementation, and set corresponding security measures in advance (such as setting Black / white list). The Dubbo framework itself cannot guarantee the security of the target serialization mechanism.

Dubbo 2.7 The official version provides the following serialization protocols:
* Hessian2
* Fastjson
* Kryo
* FST
* JDK
* Protostuff/Protobuf
* Avro
* Gson

For the above serialization extension, after finding or receiving the relevant vulnerability report, Dubbo will follow up and upgrade to the latest security version, but the final vulnerability repair scheme depends on the serialization framework implementation.
> For users using [dubbo hessian2](https://github.com/apache/dubbo-hessian-lite/releases), Dubbo will guarantee the security of Hessian 2 serialization mechanism and repair the reported security vulnerabilities as much as possible   

If you have any questions or security issues, please send mail to here security@dubbo.apache.org
