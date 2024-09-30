---
title: "RPC Protocol Security"
linkTitle: "RPC Protocol Security"
weight: 2
type: docs
description: "Using RPC protocols securely in Dubbo"
---

Dubbo supports the extension of RPC protocols, allowing users to enable any RPC protocol based on this extension mechanism in theory. This provides great flexibility but also comes with potential security risks.

The following serialization protocols are provided in the official version of Dubbo 2.7:
* Dubbo
* RMI
* Hessian
* Http / Rest
* Webservice
* Thrift
* gRPC
* ……

Starting from Dubbo 3.0, only the following serialization protocols are supported by default:
* Dubbo
* Triple / gRPC
* Http / Rest

Triple, gRPC, Http, and Rest protocols are all built on the HTTP protocol, which can strictly distinguish the format of requests, such as headers being plain text, avoiding risks like RCE when reading tokens.
The Dubbo protocol, due to its direct TCP binary design, uses serialization protocols for most fields except specific ones, so enabling risky serialization protocols can still pose RCE risks.
The RMI protocol, based on Java serialization, poses RCE risks.
The Hessian protocol, based on Hessian serialization, poses RCE risks especially since the default Hessian protocol (not the Dubbo-shaded Hessian-Lite) cannot configure blacklists and whitelists and has no default blacklist.

(1) If users wish to use a token authentication mechanism to prevent unauthenticated requests from threatening the security of the Provider, they should use protocols like Triple based on HTTP standards to avoid security risks during token parameter reading.

(2) Specifically, the Dubbo community **highly discourages** exposing Dubbo, RMI, Hessian protocols, and other non-HTTP-standard extended protocols to the public internet, as the Dubbo protocol was initially designed to provide high-performance RPC services within an intranet environment, not in a public internet environment.

(3) If your application needs public internet exposure, the Dubbo community recommends using the Triple protocol and avoiding the non-Protobuf mode or exposing services only in the standard application/json format based on Dubbo 3.3 and above.

(4) Note that all networked servers are susceptible to denial-of-service (DoS) attacks. We cannot provide **specific** solutions for general issues (e.g., clients sending large amounts of data to your server or repeatedly requesting the same URL). Apache Dubbo aims to prevent any attacks that could cause server resource consumption disproportionate to the size or structure of input data. Therefore, to protect your server, ensure you have a Web Application Firewall (WAF) or other security devices in place before exposing Dubbo services to the public internet to prevent these attacks.

