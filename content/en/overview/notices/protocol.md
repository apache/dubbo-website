---
title: "RPC Protocol Security"
linkTitle: "RPC protocol security"
weight: 2
description: "Use RPC protocol more securely in Dubbo"
type: docs
---

Dubbo supports the extension of the RPC protocol. In theory, users can enable any RPC protocol based on this extension mechanism. This brings great flexibility, but at the same time, users must be aware of the hidden security risks.

The serialization protocols provided by the official version of Dubbo 2.7 are as follows:
* Dubbo
* RMI
* Hessian
* Http/Rest
* Webservice
* Thrift
* gRPC
* …

Starting from Dubbo 3.0, only the following serialization protocol support is provided by default:
* Dubbo
* Triple/gRPC
* Http/Rest

The Triple, gRPC, Http, and Rest protocols are all built based on the HTTP protocol. The format of the request can be strictly distinguished. For example, the header is plain text to avoid risks such as RCE when reading the Token.
For the Dubbo protocol, since it is designed based on TCP binary directly, except for a few specific fields, it is written using the serialization protocol. Therefore, if a risky serialization protocol is turned on, there will still be risks such as RCE.
For the RMI protocol, since it is based on the Java serialization mechanism, there are risks such as RCE.
For the Hessian protocol, because it is based on the Hessian serialization mechanism, and the default Hessian protocol (non-Dubbo Shade's Hessian-Lite protocol) cannot configure a black and white list and has no default black list, there are risks such as RCE.

1. If the user wants to use the Token authentication mechanism to prevent unauthenticated and untrusted request sources from threatening the security of the Provider, they should use protocols based on HTTP standard extensions such as Triple to avoid security risks when reading token parameters.

2. In particular, the Dubbo community **strongly does not recommend** exposing the Dubbo protocol, RMI protocol, Hessian protocol and other protocols that are not based on HTTP standard extensions to the public network environment, because the original intention of the Dubbo protocol is to be used on the intranet Provide high-performance RPC services in the environment, rather than in the public network environment.

3. If your application needs to expose public network access, the Dubbo community recommends that you use the Triple protocol and avoid using non-Protobuf mode or services based on Dubbo 3.3 and above that only expose standard application/json format services.

4. Please be advised that all networked servers are susceptible to Denial of Service (DoS) attacks. We are unable to provide **magic** solutions for common issues, such as clients transmitting large amounts of data to your server or repeatedly requesting the same URL. Generally, Apache Dubbo aims to defend against attacks that could cause server resource consumption to become disproportionate to the size or structure of the input data. Therefore, to safeguard your server, ensure you have a Web Application Firewall (WAF) or other security devices in place before exposing your Dubbo services to the public internet, in order to prevent such attacks.


