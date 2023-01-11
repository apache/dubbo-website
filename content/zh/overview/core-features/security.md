---
type: docs
title: "认证鉴权"
linkTitle: "认证鉴权"
weight: 70
description: ""
feature:
  title: 认证鉴权
  description: >
    支持基于 TLS 的传输链路认证与加密通信、基于 token 的请求级别认证，支持基于服务来源和目的地的鉴权检查，可结合证书分发等分布式组件构建零信任分布式体系。
---

Breaking down a monolithic application into atomic services offers various benefits, including better agility, better scalability and better ability to reuse services. However, microservices also have particular security needs:

* To defend against man-in-the-middle attacks, they need traffic encryption.
* To provide flexible service access control, they need mutual TLS and fine-grained access policies.
* To determine who did what at what time, they need auditing tools.

Istio Security provides a comprehensive security solution to solve these issues. This page gives an overview on how you can use Istio security features to secure your services, wherever you run them. In particular, Istio security mitigates both insider and external threats against your data, endpoints, communication, and platform.

The Istio security features provide strong identity, powerful policy, transparent TLS encryption, and authentication, authorization and audit (AAA) tools to protect your services and data.

## 架构

Security in Istio involves multiple components:

* A Certificate Authority (CA) for key and certificate management
* The configuration API server distributes to the proxies:
    * authentication policies
    * authorization policies
    * secure naming information
* Sidecar and perimeter proxies work as Policy Enforcement Points (PEPs) to secure communication between clients and servers.
* A set of Envoy proxy extensions to manage telemetry and auditing

The control plane handles configuration from the API server and configures the PEPs in the data plane. The PEPs are implemented using Envoy. The following diagram shows the architecture.

![Authentication](/imgs/v3/feature/security/arch.png)

> **证书的生成和分发不在本文讨论范围，我们假设您已经有完善的基础设施解决了证书管理问题，因此，我们将更专注在讲解 Dubbo 体系的认证和鉴权机制与流程。** 如果您并没有这些证书管理设施，我们推荐您使用服务网格架构 (具体请参见 [Dubbo Mesh 服务网格]() 文档说明)，借助 [Istio](https://istio.io/latest/docs/concepts/security/) 等服务网格控制面的证书管理机制和安全策略，您可以很容易将 Dubbo 集群的认证和鉴权能力实施起来。

## Authentication 认证

Istio provides two types of authentication:

* Peer authentication: used for service-to-service authentication to verify the client making the connection. Istio offers mutual TLS as a full stack solution for transport authentication, which can be enabled without requiring service code changes. This solution:
    * Provides each service with a strong identity representing its role to enable interoperability across clusters and clouds.
    * Secures service-to-service communication.
    * Provides a key management system to automate key and certificate generation, distribution, and rotation.
* Request authentication: Used for end-user authentication to verify the credential attached to the request. Istio enables request-level authentication with JSON Web Token (JWT) validation and a streamlined developer experience using a custom authentication provider or any OpenID Connect providers, for example:
    * ORY Hydra
    * Keycloak
    * Auth0
    * Firebase Auth
    * Google Auth

In all cases, Istio stores the authentication policies in the Istio config store via a custom Kubernetes API. Istiod keeps them up-to-date for each proxy, along with the keys where appropriate. Additionally, Istio supports authentication in permissive mode to help you understand how a policy change can affect your security posture before it is enforced.

### 架构图
You can specify authentication requirements for workloads receiving requests in an Istio mesh using peer and request authentication policies. The mesh operator uses .yaml files to specify the policies. The policies are saved in the Istio configuration storage once deployed. The Istio controller watches the configuration storage.

Upon any policy changes, the new policy is translated to the appropriate configuration telling the PEP how to perform the required authentication mechanisms. The control plane may fetch the public key and attach it to the configuration for JWT validation. Alternatively, Istiod provides the path to the keys and certificates the Istio system manages and installs them to the application pod for mutual TLS. You can find more info in the Identity and certificate management section.

Istio sends configurations to the targeted endpoints asynchronously. Once the proxy receives the configuration, the new authentication requirement takes effect immediately on that pod.

Client services, those that send requests, are responsible for following the necessary authentication mechanism. For request authentication, the application is responsible for acquiring and attaching the JWT credential to the request. For peer authentication, Istio automatically upgrades all traffic between two PEPs to mutual TLS. If authentication policies disable mutual TLS mode, Istio continues to use plain text between PEPs. To override this behavior explicitly disable mutual TLS mode with destination rules. You can find out more about how mutual TLS works in the Mutual TLS authentication section.

![Authentication](/imgs/v3/feature/security/auth-1.png)

#### TLS

#### mutual TLS
Istio tunnels service-to-service communication through the client- and server-side PEPs, which are implemented as Envoy proxies. When a workload sends a request to another workload using mutual TLS authentication, the request is handled as follows:

1. Istio re-routes the outbound traffic from a client to the client’s local sidecar Envoy.
2. The client side Envoy starts a mutual TLS handshake with the server side Envoy. During the handshake, the client side Envoy also does a secure naming check to verify that the service account presented in the server certificate is authorized to run the target service.
3. The client side Envoy and the server side Envoy establish a mutual TLS connection, and Istio forwards the traffic from the client side Envoy to the server side Envoy.
4. The server side Envoy authorizes the request. If authorized, it forwards the traffic to the backend service through local TCP connections.

### 认证策略

https://istio.io/latest/docs/concepts/security/#authentication-policies

## Authorization 鉴权

Istio’s authorization features provide mesh-, namespace-, and workload-wide access control for your workloads in the mesh. This level of control provides the following benefits:

* Workload-to-workload and end-user-to-workload authorization.
* A simple API: it includes a single AuthorizationPolicy CRD, which is easy to use and maintain.
* Flexible semantics: operators can define custom conditions on Istio attributes, and use CUSTOM, DENY and ALLOW actions.
* High performance: Istio authorization (ALLOW and DENY) is enforced natively on Envoy.
* High compatibility: supports gRPC, HTTP, HTTPS and HTTP/2 natively, as well as any plain TCP protocols.

### 架构图

The authorization policy enforces access control to the inbound traffic in the server side Envoy proxy. Each Envoy proxy runs an authorization engine that authorizes requests at runtime. When a request comes to the proxy, the authorization engine evaluates the request context against the current authorization policies, and returns the authorization result, either ALLOW or DENY. Operators specify Istio authorization policies using .yaml files.

![Authorization](/imgs/v3/feature/security/authz-1.png)

Dubbo 完整的鉴权工作流程如下：

![Authorization](/imgs/v3/feature/security/authz-2.png)

### 鉴权策略
鉴权策略

https://istio.io/latest/docs/concepts/security/#authorization-policies

## 示例任务

访问如下 [示例]() 进行安全策略动手实践。
