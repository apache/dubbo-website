---
aliases:
    - /en/overview/core-features/security/
    - /en/overview/core-features/security/
description: Authentication and Authorization
feature:
    description: |
        Supports TLS-based transport link authentication and encrypted communication, as well as request identity-based permission verification, helping to build a zero-trust distributed microservice system.
    title: Authentication and Authorization
linkTitle: Authentication and Authorization
title: Authentication and Authorization
type: docs
weight: 8
---

Dubbo provides a comprehensive mechanism for building a secure microservice communication system (zero-trust system), which includes:
* Avoiding man-in-the-middle attacks during communication, Dubbo provides identity authentication and TLS-based communication link encryption capabilities.
* Controlling inter-service access authorization, Dubbo provides mTLS and permission check mechanisms.

Through this document, you will learn how to use Dubbo's security mechanisms to build a zero-trust microservice system, achieving identity authentication, transparent link encryption, authorization, auditing, and other capabilities. Since building zero trust is a systematic task and Dubbo is only a part of the data communication layer, you may need a series of infrastructure support, including certificate generation, distribution, and security policy management.

> **Certificate generation and distribution are not within the scope of this document. We assume you already have a complete infrastructure to solve the certificate management problem. Therefore, we will focus more on explaining Dubbo's authentication and authorization mechanisms and processes.** If you do not have these certificate management facilities, we recommend using a service mesh architecture (see [Dubbo Mesh Service Mesh](../service-mesh/) documentation for details). With the certificate management mechanism and security policies of the service mesh control plane like [Istio](https://istio.io/latest/docs/concepts/security/), you can easily implement the authentication and authorization capabilities of the Dubbo cluster.

> Additionally, the following defaults to the behavior of Dubbo data plane in Dubbo Proxyless Mesh mode. For scenarios deploying Envoy, since Dubbo is only used as a communication and programming SDK, please refer to the standard Istio documentation for authentication and authorization capabilities in Envoy scenarios.

## Architecture

A complete zero-trust system consists of multiple components:

* A root certificate authority (CA) responsible for managing keys and certificates.
* A security policy management and distribution center responsible for distributing security policies to data plane components in real-time:
    * Authentication policies
    * Authorization policies
    * Secure Naming Information
* Data plane components (Dubbo) responsible for identifying and executing identity authentication, encryption, policy parsing, and other actions.
* A series of tools and ecosystems to assist in security auditing, data link monitoring, and other tasks.

In the service mesh (Istio) deployment mode, the control plane usually manages security policies, certificates, etc. The control plane interacts with infrastructure such as the Kubernetes API Server and distributes configuration data to data plane components like Dubbo or Envoy. However, as mentioned earlier, we assume the control plane product is ready, so we will not discuss how the control plane issues certificates or defines authentication and authorization policies. We will focus on Dubbo's responsibilities as the data plane and its interaction process with the control plane.

Below is a complete Dubbo zero-trust architecture diagram:

![Authentication](/imgs/v3/feature/security/arch.png)

## Authentication

Dubbo provides two authentication modes:

* **Channel Authentication**: Dubbo supports TLS-based HTTP/2 and TCP communication. By enabling TLS through the Channel Authentication API or control plane authentication policies, server identity authentication and data link encryption can be achieved. Additionally, mTLS can be enabled for mutual authentication between client and server. Channel Authentication is service-to-service authentication, representing the identity authentication of services or instances.
* **Request Authentication**: Dubbo provides an API to place credentials representing user identity (such as JSON Web Token) in the user request context. The Dubbo framework will automatically recognize the identity information in the request and perform permission verification. Additionally, you can customize the identity in the request context, such as placing OAuth2 tokens like Access Tokens. Request Authentication is end-user authentication, representing the identity authentication of users logged into the system.

### Architecture Diagram

You can use the Istio control plane to manage certificates, authentication policies, etc. Different authentication policies will affect the authentication behavior of the Dubbo data plane, such as whether to enable mTLS, whether to allow plaintext requests during the migration phase, etc.

In Istio mode, Dubbo's authentication mechanism achieves automatic integration with the Istio control plane through xDS. The certificates and authentication policy configurations generated by the Istio control plane are automatically delivered to the Dubbo data plane. The Dubbo data plane receives these configurations via the Authentication API and applies them to all subsequent data communication processes, such as enabling new certificates and executing new authentication policies.

If the authentication policy enables Request Authentication, the Dubbo data plane is responsible for reading and filling the JWT token, meaning the token must be attached to the request context before the request is initiated. The prerequisite for using Request Authentication is that Channel Authentication must be enabled; otherwise, Request Authentication will not take effect.

![Authentication](/imgs/v3/feature/security/auth-1.png)

#### Dubbo mTLS Process

In the Istio deployment architecture, the control plane authentication policy can enable or disable the bidirectional authentication of Channel Authentication. The workflow for bidirectional authentication is as follows:

1. The Istio control plane delivers the authentication policy to enable bidirectional authentication.
2. The Dubbo client and server initiate a bidirectional TLS handshake. During this period, the Dubbo client performs a secure naming check to verify the server's identity (it is confirmed to be the legitimate entity running the service).
3. A bidirectional mTLS link is established between the client and server, followed by normal encrypted communication.
4. Upon receiving a request, the Dubbo server identifies the client's identity and checks whether it has permission to access the corresponding resource.

### Authentication Policies
For details, please refer to the authentication rules supported by Istio. Dubbo fully supports the authentication policies defined by Istio.

https://istio.io/latest/docs/concepts/security/#authentication-policies

## Authorization

Dubbo abstracts an extension mechanism for authorization, but currently, it only supports the Istio system in specific implementations. Therefore, its authorization capabilities are equivalent to those described by Istio. For more details, refer to the
[Istio Authorization Documentation](https://istio.io/latest/docs/concepts/security/#authorization)

### Architecture Diagram

Dubbo receives user-configured authorization policies through the xDS data channel with the Istio control plane. When a request reaches a Dubbo instance, the Dubbo SDK uses the built-in authorization policy engine to match the request parameters and user identity with the authorization policies. If the match is successful, access is granted; otherwise, access is denied.

![Authorization](/imgs/v3/feature/security/authz-1.png)

The complete authorization workflow in Dubbo is as follows:

![Authorization](/imgs/v3/feature/security/authz-2.png)

### Authorization Policies
For details, please refer to the authorization rules supported by Istio. Dubbo fully supports the authorization policies defined by Istio.

https://istio.io/latest/docs/concepts/security/#authorization-policies

## Dubbo Authentication API
Dubbo defines a set of authentication APIs. For regular usage scenarios, developers can enable TLS/mTLS communication through these APIs. However, for scenarios where the Istio control plane is deployed, Dubbo will automatically recognize the certificates and authentication policies delivered by the Istio control plane. Therefore, only interaction with the Istio control plane is required, and no special configuration is needed on the Dubbo side.

Regardless of whether the Istio control plane is used, the JWT token for Request Authentication still needs to be programmatically specified on the Dubbo side.

The definition of the authentication API varies slightly for each language implementation. For specific definitions, please refer to the respective SDK documentation:
* [Java](/)
* [Go](/)
* [Rust](/)
* [Node.js](/)

## Example Tasks

Visit the following [Dubbo Task Examples](/) for hands-on practice with security policies.
