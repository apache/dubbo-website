---
description: 描述 Dubbo 的认证功能。
linkTitle: 安全
title: 安全
type: docs
weight: 2
---

Dubbo 服务网格的安全功能提供了强大的身份、强大的策略、透明的 TLS 加密以及认证工具，以保护您的服务和数据。Dubbo 的安全功能使用与 Istio 相同的安全模型，但针对 Dubbo 协议和无 Sidecar 架构进行了优化。

## 高层架构

Dubbo 服务网格的安全架构包括两个核心组件：

- **身份**：每个工作负载都有一个身份，用于标识其来源
- **认证**：认证策略定义了服务之间如何相互认证

这些组件协同工作，为您的服务网格提供安全防护。

## Dubbo 身份

在 Dubbo 服务网格中，每个工作负载都有一个身份，用于标识其来源。身份基于 SPIFFE 标准，使用 SPIFFE URI 格式：`spiffe://<trust-domain>/ns/<namespace>/sa/<service-account>`。

### 身份格式

Dubbo 身份由以下部分组成：

- **信任域（Trust Domain）**：标识网格或组织边界，默认值为 `cluster.local`
- **命名空间（Namespace）**：Kubernetes 命名空间
- **服务账户（Service Account）**：Kubernetes ServiceAccount

例如，在 `default` 命名空间中运行的服务账户 `bookinfo-productpage` 的身份为：
`spiffe://cluster.local/ns/default/sa/bookinfo-productpage`

### 信任域别名

Dubbo 服务网格支持信任域别名（Trust Domain Aliases），允许一个网格信任来自多个信任域的工作负载。这在跨集群或多租户场景中非常有用。通过 MeshConfig 中的 `TrustDomainAliases` 配置，可以为给定身份自动补全多信任域变体。

## 身份和证书管理

Dubbo 服务网格使用 SPIFFE 标准来管理工作负载身份和证书。每个工作负载都会自动获得一个 SPIFFE 身份，并可以获取相应的 X.509 证书用于双向 TLS 认证。

### 证书颁发

Dubbo 控制平面包含一个证书颁发机构（CA），用于为工作负载颁发证书。工作负载通过 Dubbo Agent 与控制平面通信，请求证书并定期轮转。

### 证书存储

工作负载证书存储在以下位置：

- 证书链：`./etc/certs/cert-chain.pem` 或 `./var/run/secrets/workload-spiffe-uds/credentials/cert-chain.pem`
- 私钥：`./etc/certs/key.pem` 或 `./var/run/secrets/workload-spiffe-uds/credentials/key.pem`
- 根证书：`./etc/certs/root-cert.pem` 或 `./var/run/secrets/workload-spiffe-uds/credentials/root-cert.pem`

证书可以通过 SDS（Secret Discovery Service）或文件挂载方式下发到工作负载。

## 认证

Dubbo 服务网格支持对等认证（Peer Authentication），用于服务到服务的认证。

### 双向 TLS 认证

双向 TLS 是 Dubbo 服务网格中服务到服务通信的主要认证机制。它提供了：

- **强大的服务到服务认证**：内置身份和凭证管理
- **默认安全**：工作负载之间的通信默认加密
- **自动密钥管理**：自动密钥和证书轮转
- **服务到服务通信加密**：无需更改应用程序代码

#### 宽容模式

在宽容模式（PERMISSIVE）下，服务可以同时接受明文和 mTLS 流量。这对于逐步迁移到 mTLS 非常有用，允许服务在迁移过程中同时支持两种类型的流量。

#### 安全命名

安全命名确保只有具有适当服务账户的工作负载才能访问服务。Dubbo 使用 SPIFFE 身份来验证服务身份，确保只有授权的服务可以相互通信。

### 认证架构

Dubbo 服务网格的认证架构包括：

- **控制平面**：`dubbod` 负责管理认证策略和证书
- **数据平面**：Dubbo Agent 负责执行认证策略和 TLS 握手
- **策略存储**：认证策略存储在 Kubernetes API 服务器中

### 认证策略

认证策略用于指定网格、命名空间或工作负载级别的认证要求。Dubbo 支持 PeerAuthentication 策略，用于定义服务到服务的认证要求。

#### 策略存储

认证策略作为 Kubernetes CRD 存储在 Kubernetes API 服务器中。Dubbo 控制平面监听这些资源的变化，并将策略下发给数据平面。

#### Selector 字段

PeerAuthentication 策略可以使用 `selector` 字段来指定策略应用的工作负载。如果没有指定 selector，策略将应用于命名空间或网格级别的所有工作负载。

#### 对等认证

PeerAuthentication 策略用于配置服务到服务的认证。它支持以下 mTLS 模式：

- **STRICT**：只接受 mTLS 流量
- **PERMISSIVE**：接受明文和 mTLS 流量
- **DISABLE**：禁用 mTLS

以下示例配置了一个 PeerAuthentication 策略，要求 `default` 命名空间中的所有服务使用 STRICT mTLS：

```yaml
apiVersion: security.dubbo.apache.org/v1
kind: PeerAuthentication
metadata:
  name: default
  namespace: default
spec:
  mtls:
    mode: STRICT
```

### 更新认证策略

当您更新认证策略时，Dubbo 控制平面会自动将新策略下发给数据平面。策略更改会立即生效，无需重启工作负载。

## 学习更多

在学习了上述基本概念之后，您还可以温习下述资料：

* 按照认证任务尝试使用安全策略。
* 了解一些可用于提高网格安全性的安全策略示例。
* 阅读常见问题，以便在出现问题时更好地解决安全策略问题。

## 相关内容

- [流量管理](/zh-cn/overview/mesh/concepts/traffic-management/)
- [可观测性](/zh-cn/overview/mesh/concepts/observability/)
