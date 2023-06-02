---
description: "HTTP/2 (Triple) 协议规范"
linkTitle: Triple 协议规范
title: Triple 协议设计理念与规范
type: docs
weight: 1
---

## 简介
Triple 协议是 Dubbo3 设计的基于 HTTP 的 RPC 通信协议规范，它基于 gRPC 设计而来因此可以完全兼容 gRPC 协议，可同时运行在 HTTP/1 和 HTTP/2 之上。

Dubbo 框架提供了 Triple 协议的多种语言实现，它们可以帮助你构建浏览器、gRPC 兼容的 HTTP API 接口：你只需要定义一个标准的 Protocol Buffer 格式的服务并实现业务逻辑，Dubbo 负责帮助生成语言相关的 Server Stub、Client Stub，并将整个调用流程无缝接入如路由、服务发现等 Dubbo 体系。Go、Java 等语言的 Triple 协议实现原生支持 HTTP/1 传输层通信，相比于 gRPC 官方实现，Dubbo 框架提供的协议实现更简单、更稳定，帮助你更容易的开发和治理微服务应用。

针对某些语言版本，Dubbo 框架还提供了更贴合语言特性的编程模式，即不绑定 IDL 的服务定义与开发模式，比如在 Dubbo Java 中，你可以选择使用 Java Interface 和 Pojo 类定义 Dubbo 服务，并将其发布为基于 Triple 协议通信的微服务。

## 协议规范(Specification)
Triple 协议是参考 gRPC 与 gRPC-Web 两个协议设计而来，它吸取了两个协议各自的特性和优点，将它们整合在一起，成为一个完全兼容 gRPC 且支持 Streaming 通信的协议，同时 Triple 还支持 HTTP/1、HTTP/2。

Triple 协议的设计目标如下：
* Triple 设计为对人类友好、开发调试友好的一款基于 HTTP 的协议，尤其是对 unary 类型的 RPC 请求。
* 完全兼容基于 HTTP/2 的 gRPC 协议，因此 Dubbo Triple 协议实现可以 100% 与 gRPC 体系互调互通。
* 仅依赖标准的、被广泛使用的 HTTP 特性，以便在实现层面可以直接依赖官方的标准 HTTP 网络库。

当与 Protocol Buffers 一起使用时，Dubbo Triple 协议实现支持 unary、client-streaming、server-streaming 和 bi-streaming RPC，可以支持二进制 Protobuf、JSON 两种数据 payload。Triple 协议不使用 HTTP trailers，因此可以与任何网络基础设施配合使用。

Unary RPC使用 application/grpc+proto 和 application/json 内容类型，看起来类似于精简的 REST 方言。大多数请求都是 POST，路径是从 Protobuf 模式派生的，请求和响应主体是有效的 Protobuf 或 JSON（没有 gRPC 风格的二进制框架），响应具有有意义的 HTTP 状态代码。

请参考以下文档编写详细的 Triple Specification。
* [参考文档1](https://connect.build/docs/protocol/)
* [参考文档2](https://github.com/grpc/grpc/edit/master/doc/PROTOCOL-HTTP2.md)

## 为什么要再实现一遍 gRPC 协议
既然 gRPC 官方已经提供了多语言的框架实现，为什么 Dubbo 还要重新实现一遍那？核心目标主要有以下两点：

* 首先，在协议设计上，Dubbo 参考 gRPC 与 gRPC-Web 两个协议设计了自定义的 Triple 协议：Triple 是一个基于 HTTP 传输层协议的 RPC 协议，它完全兼容 gRPC，可以同时运行在 HTTP/1、HTTP/2 之上。
* 其次，Dubbo 框架在每个语言的实现过程中遵循了符合框架自身定位的设计理念，相比于 grpc-java、grpc-go 等框架库，Dubbo 协议实现更简单、更纯粹，尝试在实现上规避 gRPC 官方库中存在的一系列问题。

gRPC 本身作为 RPC 协议规范非常优秀，但我们发现原生的 gRPC 库实现在实际使用存在一系列问题，包括实现复杂、绑定 IDL、难以调试等，Dubbo 在协议设计与实现上从实践出发，很好的规避了这些问题：

* 原生的 gRPC 实现受限于 HTTP/2 交互规范，无法为浏览器、HTTP API 提供交互方式，你需要额外的代理组件如 grpc-web、grpc-gateway 等才能实现。在 Dubbo 中，你可以直接用 curl、浏览器访问 Dubbo HTTP/2 服务.
* gRPC 官方库强制绑定 Proto Buffer，唯一的开发选择就是使用 IDL 定义和管理服务，这对于一些多语言诉求不强的用户是一个非常大的使用负担。Dubbo 则在支持 IDL 的同时，为 Java、Go 等提供了语言特有的服务定义与开发方式。
* 在开发阶段，以 gRPC 协议发布的服务非常难以调试，你只能使用 gRPC 特定的工具来进行，很多工具都比较简陋 & 不成熟。而从 Dubbo3 开始，你可以直接使用 curl | jq 或者 Chrome 开发者工具来调试你的服务，直接传入 JSON 结构体就能调用服务。
* 首先，gRPC 协议库有超过 10 万行代码的规模，但 Dubbo (Go、Java、Rust、Node.js 等) 关于协议实现部分仅有几千行代码，这让代码维护和问题排查变得更简单。
* 谷歌提供的 gRPC 实现库没有使用主流的第三方或语言官方协议库，而是选择自己维护了一套实现，让整个维护与生态扩展变得更加复杂。比如 grpc-go 自己维护了一套 HTTP/2 库而不是使用的 go 官方库。Dubbo 使用了官方库的同时，相比 gRPC 自行维护的 http 协议库维持了同一性能水准。
* gRPC 库仅仅提供了 RPC 协议实现，需要你做很多额外工作为其引入服务治理能力。而 Dubbo 本身是不绑定协议的微服务开发框架，内置 HTTP/2 协议实现可以与 Dubbo 服务治理能力更好的衔接在一起。

### 实现简单
Dubbo 框架实现专注在 Triple 协议自身，而对于底层的网络通信、HTTP/2 协议解析等选择依赖那些经过长期检验的网络库。比如 Dubbo Java 基于 Netty 构建，而 Dubbo Go 则是直接使用的 Go 官方 HTTP 库。

Dubbo 提供的 Triple 协议实现非常简单，对应 Dubbo 中的 Protocol 组件实现，你可以仅仅花一下午时间就搞清楚 Dubbo 协议的代码实现。

### 大规模生产环境检验
自 Dubbo3 发布以来，Triple 协议已被广泛应用于阿里巴巴以及众多社区标杆企业，尤其是一些代理、网关互通场景。一方面 Triple 通过大规模生产实践被证实可靠稳定，另一方面 Triple 的简单、易于调试、不绑定 IDL 的设计也是其得到广泛应用的重要因素。

### 原生多协议支持
当以 Dubbo 框架为服务端对外发布服务时，可以做到在同一端口原生支持 Triple、gRPC 和 HTTP/1 协议，这意味着你可以用多种形式访问 Dubbo 服务端发布的服务，所有请求形式最终都会被转发到相同的业务逻辑实现，这给你提供了更大的灵活性。

Dubbo 完全兼容 gRPC 协议及相关特性包括 streaming、trailers、error details 等，你选择直接在 Dubbo 框架中使用 Triple 协议（另外，你也可以选择使用原生的 gRPC 协议），然后你就可以直接使用 Dubbo 客户端、curl、浏览器等访问你发布的服务。在与 gRPC 生态互操作性方面，任何标准的 gRPC 客户端，都可以正常访问 Dubbo 服务；Dubbo 客户端也可以调用任何标准的 gRPC 服务，这里有提供的 [互操作性示例](https://github.com/apache/dubbo-samples/tree/master/3-extensions/protocol/dubbo-samples-triple/src/main/java/org/apache/dubbo/sample/tri/interop)

以下是使用 curl 客户端访问 Dubbo 服务端一个 Triple 协议服务的示例：

```sh
curl \
    --header "Content-Type: application/json" \
    --data '{"sentence": "Hello Dubbo."}' \
    https://host:port/org.apache.dubbo.sample.GreetService/sayHello
```

### 一站式服务治理接入
我们都知道 Dubbo 有丰富的微服务治理能力，比如服务发现、负载均衡、流量管控等，这也是我们使用 Dubbo 框架开发应用的优势所在。要想在 Dubbo 体系下使用 gRPC 协议通信，有两种方式可以实现，一种是直接在 Dubbo 框架中引入 gRPC 官方发布的二进制包，另一种是在 Dubbo 内原生提供 gRPC 协议兼容的源码实现。

相比于第一种引入二进制依赖的方式，Dubbo 框架通过内置 Triple 协议实现的方式，原生支持了 gRPC 协议，这种方式的优势在于源码完全由自己掌控，因此协议的实现与 Dubbo 框架结合更为紧密，能够更灵活的接入 Dubbo 的服务治理体系。

### Java 语言
在 Dubbo Java 库实现中，除了 IDL 方式外，你可以使用 Java Interface 方式定义服务，这对于众多熟悉 Dubbo 体系的 Java 用户来说，可以大大降低使用 gRPC 协议的成本。

另外，Java 版本的协议实现在性能上与 grpc-java 库基本持平，甚至某些场景下比 grpc-java 性能表现还要出色。而这一切还是建立在 Dubbo 版本协议的实现复杂度远小于 gRPC 版本的情况下，因为 grpc-java 维护了一套定制版本的 netty 协议实现。

### Go 语言实现
Dubbo Go 推荐 IDL 开发模式，通过 Dubbo 配套的 protoc 插件生成 stub 代码，你只需要提供对应的业务逻辑实现即可，你可以通过 curl、浏览器访问 Dubbo Go 发布的 gRPC 服务。

## 后续规划
当前我们已经提供了 Triple 协议的 Java、Go 语言版本，接下来我们计划陆续提供 Rust、Python、Node.js 等语言的对应实现。


