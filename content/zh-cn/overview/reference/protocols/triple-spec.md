---
description: "Triple 协议规范"
linkTitle: Triple 协议规范
title: Triple 协议设计理念与规范
type: docs
weight: 1
working_in_progress: true
---

## 协议设计理念
Triple 协议是参考 gRPC 与 gRPC-Web 两个协议设计而来，它吸取了两个协议各自的特性和优点，将它们整合在一起，成为一个完全兼容 gRPC 且支持 Streaming 通信的协议，Triple 支持同时运行在 HTTP/1、HTTP/2 协议之上。

Triple 协议的设计目标如下：
* Triple 设计为对人类友好、开发调试友好的一款基于 HTTP 的协议，尤其是对 unary 类型的 RPC 请求。
* 完全兼容基于 HTTP/2 的 gRPC 协议，因此 Dubbo Triple 协议实现可以 100% 与 gRPC 体系互调互通。
* 仅依赖标准的、被广泛使用的 HTTP 特性，以便在实现层面可以直接依赖官方的标准 HTTP 网络库。

当与 Protocol Buffers 一起使用时，Dubbo Triple 协议实现支持 unary、client-streaming、server-streaming 和 bi-streaming RPC，可以支持二进制 Protobuf、JSON 两种数据格式 payload。

## 示例
### 基于 HTTP/1 的协议请求

目前 HTTP/1 协议仅支持 Unary RPC，支持使用 application/proto 和 application/json 内容类型，使用方式与 REST 风格请求保持一致，同时相应也包含常规的 HTTP 相应编码。

```text
> POST /buf.greet.v1.GreetService/Greet HTTP/1.1
> Host: demo.connect.build
> Content-Type: application/json
>
> {"name": "Buf"}

< HTTP/1.1 200 OK
< Content-Type: application/json
<
< {"greeting": "Hello, Buf!"}
```

一个包含指定超时时间的调用请求。

```text
> POST /buf.greet.v1.GreetService/Greet HTTP/1.1
> Host: demo.connect.build
> Content-Type: application/json
> Rest-service-timeout: 5000
>
> {"name": "Buf"}

< HTTP/1.1 200 OK
< Content-Type: application/json
<
< {"greeting": "Hello, Buf!"}

> 目前仅支持 POST 请求类型，我们将考虑在未来支持 GET 请求类型，GET 请求可能适用于具有幂等属性的一些服务调用。

### 基于 HTTP/2 的协议请求

为了与 gRPC 协议保持兼容，Triple 在 HTTP/2 协议实现上保持与标准 gRPC 协议完全一致。

Request

```text
HEADERS (flags = END_HEADERS)
:method = POST
:scheme = http
:path = /google.pubsub.v2.PublisherService/CreateTopic
:authority = pubsub.googleapis.com
grpc-timeout = 1S
content-type = application/grpc+proto
grpc-encoding = gzip
authorization = Bearer y235.wef315yfh138vh31hv93hv8h3v

DATA (flags = END_STREAM)
<Length-Prefixed Message>
```

Response

```text
HEADERS (flags = END_HEADERS)
:status = 200
grpc-encoding = gzip
content-type = application/grpc+proto

DATA
<Length-Prefixed Message>

HEADERS (flags = END_STREAM, END_HEADERS)
grpc-status = 0 # OK
trace-proto-bin = jher831yy13JHy3hc
```

## 规范详情

Triple 协议支持同时运行在 HTTP/1 和 HTTP/2 协议之上，其中，Unary RPC 同时支持 HTTP/1 和 HTTP/2，而 Streaming RPC 请求仅支持 HTTP/2 且协议规范完全遵循 gRPC 协议。

### Unary (Request-Response) RPCs

大部分的 RPCs 调用都是 unary (request-response) 模式的。Triple 协议 unary 模式能很好的满足后端服务间的数据传输需求，同时可以让浏览器、cURL 以及其他一些 HTTP 工具更容易的访问后端服务，即使用标准的 HTTP 协议即可。

Triple unary RPC 同时支持 HTTP/1、HTTP/2，对应支持的 content-type 类型为 application/json、application/proto

#### Unary 请求
* Unary-Request → Unary-Request-Headers Bare-Message
* Unary-Request-Headers → Unary-Call-Specification *Leading-Metadata
* Unary-Call-Specification → Method-Post Path Unary-Content-Type [Connect-Protocol-Version] [Timeout] [Content-Encoding] [Accept-Encoding]
* Method-Post → ":method POST"
* Path → ":path" "/" [Routing-Prefix "/"] Procedure-Name ; case-sensitive
* Routing-Prefix → {arbitrary prefix}
* Procedure-Name → {IDL-specific service & method name} ; see Protocol Buffers
* Message-Codec → ("proto" / "json" / {custom})
* Unary-Content-Type → "content-type" "application/" Message-Codec
* Connect-Protocol-Version → "connect-protocol-version" "1"
* Timeout → "connect-timeout-ms" Timeout-Milliseconds
* Timeout-Milliseconds → {positive integer as ASCII string of at most 10 digits}
* Content-Encoding → "content-encoding" Content-Coding
* Content-Coding → "identity" / "gzip" / "br" / "zstd" / {custom}
* Accept-Encoding → "accept-encoding" Content-Coding *("," [" "] Content-Coding) ; subset of HTTP quality value syntax
* Leading-Metadata → Custom-Metadata
* Custom-Metadata → ASCII-Metadata / Binary-Metadata
* ASCII-Metadata → Header-Name ASCII-Value
* Binary-Metadata → {Header-Name "-bin"} {base64-encoded value}
* Header-Name → 1*( %x30-39 / %x61-7A / "_" / "-" / ".") ; 0-9 a-z _ - .
* ASCII-Value → 1*( %x20-%x7E ) ; space & printable ASCII
* Bare-Message → *{binary octet}
* Unary-Request-Headers are sent as — and have the same semantics as — HTTP headers. Servers may respond with an error if the client sends too many headers.

If the server doesn't support the specified Message-Codec, it must respond with an HTTP status code of 415 Unsupported Media Type.

The Connect-Protocol-Version header distinguishes unary Connect RPC traffic from other requests that may use the same Content-Type. (In the future, it may also be used to support revisions to this protocol.) Clients, especially generated clients, should send this header. Servers and proxies may reject traffic without this header with an HTTP status code of 400.

Following standard HTTP semantics, servers must assume "identity" if the client omits Content-Encoding. If the client omits Accept-Encoding, servers must assume that the client accepts the Content-Encoding used for the request. Servers must assume that all clients accept "identity" as their least preferred encoding. Server implementations may choose to accept the full HTTP quality value syntax for Accept-Encoding, but client implementations must restrict themselves to sending the easy-to-parse subset outlined here. Servers should treat Accept-Encoding as an ordered list, with the client's most preferred encoding first and least preferred encoding last. If the client uses an unsupported Content-Encoding, servers should return an error with code "unimplemented" and a message listing the supported encodings.

If Timeout is omitted, the server should assume an infinite timeout. The protocol accommodates timeouts of more than 100 days. Client implementations may set a default timeout for all RPCs, and server implementations may clamp timeouts to an appropriate maximum.

HTTP doesn't allow header values to be arbitrary binary blobs, so Connect differentiates between ASCII-Metadata and Binary-Metadata. Binary headers must use keys ending in "-bin", and implementations should emit unpadded base64-encoded values. Implementations must accept both padded and unpadded values. Because binary and non-ASCII headers are relatively uncommon, implementations may represent HTTP headers using an off-the-shelf type rather than reifying these rules in a custom type. Implementations using an off-the-shelf type should prominently document these rules. For both ASCII and binary metadata, keys beginning with "connect-" are reserved for use by the Connect protocol.

Bare-Message is the RPC request payload, serialized using the codec indicated by Unary-Content-Type and possibly compressed using Content-Encoding. It's sent on the wire as the HTTP request content (often called the body).


#### Unary 响应
* Unary-Response → Unary-Response-Headers Bare-Message
* Unary-Response-Headers → HTTP-Status Unary-Content-Type [Content-Encoding] [Accept-Encoding] *Leading-Metadata *Prefixed-Trailing-Metadata
* HTTP-Status → ":status" ("200" / {error code translated to HTTP})
* Prefixed-Trailing-Metadata → Prefixed-ASCII-Metadata / Prefixed-Binary-Metadata
* Prefixed-ASCII-Metadata → Prefixed-Header-Name ASCII-Value
* Prefixed-Binary-Metadata → {Prefixed-Header-Name "-bin"} {base64-encoded value}
* Prefixed-Header-Name → "trailer-" Header-Name

Unary-Response-Headers are sent as — and have the same semantics as — HTTP headers. This includes Prefixed-Trailing-Metadata: though it's sent on the wire alongside Leading-Metadata, support for trailing metadata lets Connect implementations use common interfaces for streaming and unary RPC. Implementations must transparently prefix trailing metadata keys with "trailer-" when writing data to the wire and strip the prefix when reading data from the wire. As noted above, Leading-Metadata keys beginning with "connect-" and Prefixed-Trailing-Metadata keys beginning with "trailer-connect-" are reserved for use by the Connect protocol.

If Content-Encoding is omitted, clients must assume "identity". Servers must either respond with an error or use a Content-Encoding supported by the client.

Successful responses have an HTTP-Status of 200. In those cases, Unary-Content-Type is the same as the request's Unary-Content-Type. Bare-Message is the RPC response payload, serialized using the codec indicated by Unary-Content-Type and possibly compressed using Content-Encoding. It's sent on the wire as the HTTP response content (often called the body).

Errors are sent with a non-200 HTTP-Status. In those cases, Unary-Content-Type must be "application/json". Bare-Message is either omitted or a JSON-serialized Error, possibly compressed using Content-Encoding and sent on the wire as the HTTP response content. If Bare-Message is an Error, HTTP-Status must match Error.code as specified in the table below. When reading data from the wire, client implementations must use the HTTP-to-Connect mapping to infer a Connect error code if Bare-Message is missing or malformed.

### gRPC (HTTP/2)

Triple 协议在 HTTP/2 请完全参照 <a href="https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md" target="_blank">gRPC 协议规范</a>。

支持的 content-type 类型为标准的 gRPC 类型，包括 application/grpc、application/grpc+proto、application/grpc+json。




