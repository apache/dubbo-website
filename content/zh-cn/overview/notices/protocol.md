---
title: "RPC 协议安全"
linkTitle: "RPC 协议安全"
weight: 2
type: docs
description: "在 Dubbo 中更安全的使用 RPC 协议"
---

Dubbo 支持 RPC 协议的扩展，理论上用户可以基于该扩展机制启用任意的 RPC 协议，这带来了极大的灵活的，但同时也要意识到其中潜藏的安全性风险。

Dubbo 2.7 官方版本提供的序列化协议有如下几种：
* Dubbo
* RMI
* Hessian
* Http / Rest
* Webservice
* Thrift
* gRPC
* ……

从 Dubbo 3.0 开始默认仅提供以下序列化协议支持：
* Dubbo
* Triple / gRPC
* Http / Rest

对于 Triple、gRPC、Http、Rest 协议都是基于 HTTP 协议构建的，可以严格区分请求的格式，如 Header 为纯文本，避免在读取 Token 时带来的 RCE 等风险。
对于 Dubbo 协议，由于其基于 TCP 二进制直接设计，除了特定几个字段外均使用序列化协议写入，因此如果开启了有风险的序列化协议，仍然会存在 RCE 等风险。
对于 RMI 协议，由于其基于 Java 序列化机制，存在 RCE 等风险。
对于 Hessian 协议，由于其基于 Hessian 序列化机制，且默认 Hessian 协议（非 Dubbo Shade 的 Hessian-Lite 协议）无法配置黑白名单且无默认黑名单，存在 RCE 等风险。

（1）如果用户希望使用 Token 鉴权机制，防止未鉴权的不可信请求来源威胁 Provider 的安全性，应使用 Triple 等基于 Http 标准扩展的协议，避免 token 参数读取时的安全风险。

（2）特别的，Dubbo 社区**非常不推荐**将 Dubbo 协议、RMI 协议、Hessian 协议等非基于 Http 标准扩展的协议暴露在公网环境下，因为 Dubbo 协议的设计初衷是为了在内网环境下提供高性能的 RPC 服务，而非公网环境下的服务。

（3）如果您的应用有暴露公网访问的需求，Dubbo 社区建议您使用 Triple 协议，并且避免使用非 Protobuf 模式或者是基于 Dubbo 3.3 及以上的版本仅暴露标准 application/json 格式的服务。

（4）请注意，所有联网服务器都可能遭受拒绝服务（DoS）攻击，我们无法对通用问题（例如客户端向您的服务器传输大量数据或重复请求相同的URL）提供**特殊**的解决方法。Apache Dubbo 的目标是避免任何会导致服务器资源消耗与输入数据大小或结构不成线性关系的攻击。因此，为了保护您的服务器，在您将 Dubbo 服务暴露到公网之前，请确保您的服务前置有网页应用程序防火墙（WAF）或其他安全设备，以防止这些攻击。
