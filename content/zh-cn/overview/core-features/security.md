---
aliases:
    - /zh/overview/core-features/security/
description: 认证鉴权
feature:
    description: |
        支持基于 TLS 的传输链路认证与加密通信以及基于请求身份的权限校验，帮助构建零信任分布式微服务体系。
    title: 认证鉴权
linkTitle: 认证鉴权
title: 认证鉴权
type: docs
weight: 8
---

Dubbo 提供了构建安全微服务通信体系 (零信任体系) 的完善机制，这包括：
* 避免通信过程中的中间人攻击，Dubbo 提供了身份认证 (Authentication) 和基于 TLS 的通信链路加密能力
* 控制服务间的访问鉴权 (Authorization)，Dubbo 提供了 mTLS 和权限检查机制

通过这篇文档，你将了解如果使用 Dubbo 的安全机制构建微服务零信任体系，实现身份认证、透明链路加密、鉴权、审计等能力。由于构建零信任是一套系统的工作，而 Dubbo 只是其中数据通信层的一环，因此你可能需要一系列基础设施的配合，包括证书生成、分发、安全策略管控等。

> **证书的生成和分发不在本文讨论范围，我们假设您已经有完善的基础设施解决了证书管理问题，因此，我们将更专注在讲解 Dubbo 体系的认证和鉴权机制与流程。** 如果您并没有这些证书管理设施，我们推荐您使用服务网格架构 (具体请参见 [Dubbo Mesh 服务网格](../service-mesh/) 文档说明)，借助 [Istio](https://istio.io/latest/docs/concepts/security/) 等服务网格控制面的证书管理机制和安全策略，您可以很容易将 Dubbo 集群的认证和鉴权能力实施起来。

> 另外，以下默认讲的都是 Dubbo Proxyless Mesh 模式下的 Dubbo 数据面行为，对于部署 Envoy 的场景，由于 Dubbo 只是作为通信和编程 sdk，因此 Envoy 场景下认证鉴权能力请完全参考标准 Istio 文档即可。

## 架构

一套完整的零信任体系包含多个组成部分：

* 一个根证书机构 (CA) 来负责管理 key 和 certificate
* 一个安全策略的管理和分发中心，来负责将安全策略实时下发给数据面组件：
    * 认证策略
    * 鉴权策略
    * 安全命名信息 (Secure Naming Information)
* 数据面组件 (Dubbo) 负责识别和执行身份认证、加密、策略解析等动作
* 一系列的工具和生态，配合完成安全审计、数据链路监控等工作

在服务网格 (Istio) 部署模式下，控制面通常负责安全策略、证书等的管理，控制面负责与基础设施如 Kubernetes API Server 等交互，将配置数据下发给 Dubbo 或者 Envoy 等数据面组件。但如我们前面提到的，我们假设控制面产品已经就绪，因此不会涉及控制面如何签发证书、定义认证鉴权策略的讨论，我们将专注在 Dubbo 作为数据面的职责及与控制面的交互流程上。

以下是完整的 Dubbo 零信任架构图

![Authentication](/imgs/v3/feature/security/arch.png)

## Authentication 认证

Dubbo 提供了两种认证模式：

* **传输通道认证 (Channel Authentication)**：Dubbo 支持基于 TLS 的 HTTP/2 和 TCP 通信，通过 Channel Authentication API 或者控制面认证策略可以开启 TLS，实现 Server 身份端认证以及数据链路加密。另外，还可以开启 mTLS 实现 Client、Server 双向认证。Channel Authentication 是 service-to-service 模式的认证，代表的是服务或实例的身份认证。
* **请求认证 (Request Authentication)**：Dubbo 提供了 API 用来在用户请求上下文中放入代表用户身份的 credential (如 JSON Web Token)，Dubbo 框架将自动识别请求中的身份信息并进行权限校验。另外，你也可以定制请求上下文中的身份，如放入 Access Token 的如 OAuth2 tokens。Request Authentication 是 end-user 模式的认证，代表登录系统的用户身份的认证。

### 架构图

你可以使用 Istio 控制面管理证书、认证策略等，不同的认证策略会影响 Dubbo 数据面的认证行为，如是否开启 mTLS、是否允许迁移阶段的 Plaintext 请求等。

在 Istio 模式下，Dubbo 认证机制通过 xDS 实现了和 Istio 控制面的自动对接，即 Istio 控制面生成的证书、认证策略配置会自动的下发到 Dubbo 数据面，Dubbo 数据面通过 Authentication API 接收配置并将它们应用到后续的所有数据通信环节，如启用新的证书、执行新的认证策略等。

如果认证策略开启了 Request Authentication，则 Dubbo 数据面要负责 JWT token 的读取与填充，即 token 要在请求发起前附加到请求上下文中。Request Authentication 使用的前提一定是开启了 Channel Authentication，否则 Request Authentication 无法生效。

![Authentication](/imgs/v3/feature/security/auth-1.png)

#### Dubbo mTLS 流程

在 Istio 部署架构下，可以通过控制面认证策略开启或关闭 Channel Authentication 的双向认证，双向认证的工作流程如下：

1. 通过 Istio 下发认证策略，开启双向认证
2. Dubbo 客户端同服务端开启双向 TLS 握手，在此期间，Dubbo 客户端会做 secure naming check 以检查服务端的身份（它被证实是有运行这个服务的合法身份）。
3. 客户端和服务端之间建立一条双向的 mTLS 链接，随后发起正常的加密通信。
4. Dubbo 服务端收到请求后，识别客户端身份并检查其是否有权限访问响应的资源。

### 认证策略
具体请查看 Istio 官方支持的认证规则，Dubbo 完全支持 Istio 定义的认证策略。

https://istio.io/latest/docs/concepts/security/#authentication-policies

## Authorization 鉴权

Dubbo 抽象了一套鉴权的扩展机制，但当前在具体实现上只支持 Istio 体系，因此其鉴权能力与 Istio 官方描述对等。具体可参见
[Istio 鉴权文档](https://istio.io/latest/docs/concepts/security/#authorization)

### 架构图

Dubbo 通过 xDS 与 Istio 控制面的数据通道，接收用户配置的鉴权策略，当一个请求到达 Dubbo 实例时，Dubbo SDK 使用内置的鉴权策略引擎将请求参数和用户身份与鉴权策略进行匹配，如果匹配成功则允许访问，否则拒绝访问。

![Authorization](/imgs/v3/feature/security/authz-1.png)

Dubbo 完整的鉴权工作流程如下：

![Authorization](/imgs/v3/feature/security/authz-2.png)

### 鉴权策略
具体请查看 Istio 官方支持的鉴权规则，Dubbo 完全支持 Istio 定义的鉴权策略。

https://istio.io/latest/docs/concepts/security/#authorization-policies


## Dubbo 认证 API
Dubbo 定义了一套认证 API，对于常规使用的场景，开发者可以通过这套 API 启用 TLS/mTLS 通信；但对于 Istio 控制面部署的场景，Dubbo 会自动识别 Istio 控制面下发的证书和认证策略，因此只需要与 Istio 控制面交互即可，不需要 Dubbo 侧的特别配置。

不论是否使用 Istio 控制面，对于 Request Authentication，JWT token 仍需要在 Dubbo 侧编程指定。

每种语言实现的认证 API 定义略有差异，具体定义请参考各 SDK 文档：
* [Java](/)
* [Go](/)
* [Rust](/)
* [Node.js](/)

## 示例任务

访问如下 [Dubbo 任务示例](/) 进行安全策略动手实践。
