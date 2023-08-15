---
description: "Triple 协议规范"
linkTitle: Triple 协议规范
title: Triple 协议设计理念与规范
type: docs
weight: 1
working_in_progress: true
---

## 1 协议设计理念
Triple 协议的设计参考了 gRPC、gRPC-Web、通用 HTTP 等多种协议模式，吸取每个协议各自的特性和优点，最终设计成为一个易于浏览器访问、完全兼容 gRPC 且支持 Streaming 通信的协议，Triple 支持同时运行在 HTTP/1、HTTP/2 协议之上。

Triple 协议的设计目标如下：
* Triple 设计为对人类、开发调试友好的一款基于 HTTP 的协议，尤其是对 unary 类型的 RPC 请求。
* 完全兼容基于 HTTP/2 的 gRPC 协议，因此 Dubbo Triple 协议实现可以 100% 与 gRPC 体系互调互通。
* 仅依赖标准的、被广泛使用的 HTTP 特性，以便在实现层面可以直接依赖官方的标准 HTTP 网络库。

当与 Protocol Buffers 一起使用时（即使用 IDL 定义服务），Triple 协议可支持 unary、client-streaming、server-streaming 和 bi-streaming RPC 通信模式，支持二进制 Protobuf、JSON 两种数据格式 payload。 Triple 实现并不绑定 Protocol Buffers，比如你可以使用 Java 接口定义服务，Triple 协议有对这种模式的扩展 Content-type 支持。

## 2 示例
### 2.1 Unary 请求

以 HTTP/1 请求为例，目前 HTTP/1 协议仅支持 Unary RPC，支持使用 application/proto 和 application/json 编码类型，使用方式与 REST 风格请求保持一致，同时响应也包含常规的 HTTP 响应编码（如 200 OK）。

```text
> POST /org.apache.dubbo.demo.GreetService/Greet HTTP/1.1
> Host: 127.0.0.1:30551
> Content-Type: application/json
>
> ["Dubbo"]

< HTTP/1.1 200 OK
< Content-Type: application/json
<
< {"greeting": "Hello, Dubbo!"}
```

一个包含指定超时时间的调用请求。

```text
> POST /org.apache.dubbo.demo.GreetService/Greet HTTP/1.1
> Host: 127.0.0.1:30551
> Content-Type: application/json
> Rest-service-timeout: 5000
>
> ["Dubbo"]

< HTTP/1.1 200 OK
< Content-Type: application/json
<
< {"greeting": "Hello, Buf!"}
```

> 目前仅支持 POST 请求类型，我们将考虑在未来支持 GET 请求类型，GET 请求可能适用于具有幂等属性的一些服务调用。

### 2.2 Streaming 调用请求

Triple 仅支持在 HTTP/2 上支持 Streaming RPC。并且为了与 gRPC 协议保持兼容，Triple 在 HTTP/2 协议实现上（包含 Streaming RPC）保持与标准 gRPC 协议完全一致。

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

## 3 规范详情

Triple 协议支持同时运行在 HTTP/1 和 HTTP/2 协议之上，其包含以下两部分内容：
1. 一套自定义的精简 HTTP RPC 子协议，支持 HTTP/1 和 HTTP/2 作为传输层实现，仅支持 Request-Response 类型的 Unary RPC。
2. 一套基于 gRPC 协议的扩展子协议（仍保持和 gRPC 的 100% 兼容），仅支持 HTTP/2 实现，支持 Unary RPC 和 Streaming RPC。

### 3.1 Triple 之 HTTP RPC 协议

大部分的 RPC 调用都是 unary (request-response) 模式的，Triple HTTP RPC 协议 unary 模式能很好的满足后端服务间的数据传输需求。同时解决了gRPC协议的痛点，让浏览器、cURL 以及其他一些 HTTP 工具更容易的访问后端服务，即不需要借助代理和gRPC-web，使用标准的 HTTP 协议直接发起调用。

Triple HTTP RPC 同时支持 HTTP/1、HTTP/2 作为底层传输层协议，在实现上对应支持的 content-type 类型为 application/json、application/proto

#### 3.1.1 请求 Request

- Request → Request-Headers Bare-Message
- Request-Headers → Call-Specification *Leading-Metadata
- Call-Specification →
Schema Http-Method Path Http-Host Content-Type TRI-Protocol-Version TRI-Service-Timeout TRI-Service-Version TRI-Service-Group
Content-Encoding Accept-Encoding Accept Content-Length
- Scheme → "http" / "https"
- Http-Method → POST
- Path → /Service-Name/Method-Name; case-sensitive
- Service-Name → service interface full classname
- Method-Name → service interface declared method`s name
- Http-Host → Target-IP:Target-Port
- Target-IP → target server ip or domain
- Target-Port → target server process port
- Content-Type → “Content-Type: ” “application/” Message-Codec
- Message-Codec → (“json” / {custom})
- TRI-Protocol-Version → "tri-protocol-version" "1"
- TRI-Service-Timeout → “tri-service-timeout: ” Timeout-Milliseconds
- Timeout-Milliseconds → positive integer
- TRI-Service-Version → “tri-service-version: ” Version
- Version → dubbo service version
- TRI-Service-Group → "tri-service-group: " Group
- Group → dubbo service group
- Content-Encoding → “content-encoding” Content-Coding
- Content-Coding → “identity” / “gzip” / “br” / “zstd” / {custom}
- Accept-Encoding → “accept-encoding” Content-Coding *("," [" “] Content-Coding) ; subset of HTTP quality value syntax
- Content-Length → length of the encoded payload
- Leading-Metadata → Custom-Metadata
- Custom-Metadata → ASCII-Metadata / Binary-Metadata
- ASCII-Metadata → Header-Name ASCII-Value
- Binary-Metadata → {Header-Name "-bin"} {base64-encoded value}
- Header-Name → 1*( %x30-39 / %x61-7A / "_" / "-" / ".") ; 0-9 a-z _ - .
- ASCII-Value → 1*( %x20-%x7E ) ; space & printable ASCII
- Bare-Message → data that encoded by json or custom and Content-Encoding

Triple 协议请求的仅支持 POST 请求，请求 path 为 interfaceName/methodName，为了实现调用超时机制，需要添加 tri-service-timeout (单位 ms)，

Dubbo 框架支持基于 **分组（group）** 和 **版本（version）** 的服务隔离机制，因此 Triple 协议中引入了 tri-service-group、tri-service-version 支持。

**Request-Headers** 以标准的 HTTP header 的形式发送，如果收到的 headers 数量过多，server 可返回相应错误信息。

**TRI-Protocol-Version** 头用来区分具有相同 Content-Type 的 triple 协议请求和其他协议请求，因为 application/json 格式的 Content-Type 非常普遍。所有的 Dubbo 原生客户端实现都应该在请求中携带 TRI-Protocol-Version，Dubbo 服务端或代理可以选择拒绝没有 TRI-Protocol-Version 的请求并返回 Http-Status 400 错误。

如果 Server 不支持 **Message-Codec** 指定的编码格式，则必须返回标准 HTTP 415 编码表明 Unsupported Media Type 异常。

**Bare-Message** 即请求 payload 的编码格式取决于 Message-Codec 设置：
* Message-Codec: json 的场景下，payload 采用有序的数组编码形式，即将 rpc 方法的参数按顺序组装进 Array 后进行 json 序列化，方法参数的位置与数组下标保持一致，当 Triple server 接收到请求体时，根据每个参数的类型进行反序列化成对应的参数数组。对于使用 Protocol Buffer 的情形，payload 则是只有一个 json 对象的数组。
* Message-Codec: proto 的场景下，Protobuf 生成的 Request 类包含了编码格式，因此将直接使用 Request 对象中的内置编码方式。
* Message-Codec 支持更多自定义扩展值，请确保框架实现遵循相应的编码与解码约定。

如果 Content-Encoding 指定了相应值，则 payload 是被压缩过的，应该首先进行解压缩后再解析编码数据，Bare-Message 将作为 HTTP Body 在链路上传输。

##### Request 报文示例

- 请求行
   - POST /org.apache.dubbo.demo.GreetService/greeting HTTP/1.1
- 请求头
   - Host: 127.0.0.1:30551
   - Content-Type: application/json
   - Accept: application/json
   - Content-Length: 11
   - Accept-Encoding: compress, gzip
   - tri-protocol-version: 1.0.0
   - tri-service-version: 1.0.0
   - tri-service-group: dubbo
   - tri-service-timeout: 3000
- 请求体
   - [{"world"}]

```latex
POST /org.apache.dubbo.demo.GreetService/Greet HTTP/1.1
Host: 127.0.0.1:30551
Content-Type: application/json
Accept: application/json
Content-Length: 11
Accept-Encoding: compress, gzip
tri-protocol-version: 1.0.0
tri-service-version: 1.0.0
tri-service-group: dubbo
tri-service-timeout: 3000

[{"world"}]
```


#### 3.1.2 响应 Response

- Response → Response-Headers *Bare-Message
- Response-Headers → HTTP-Status Content-Type [Content-Encoding] [Accept-Encoding] *Leading-Metadata *Prefixed-Trailing-Metadata
- HTTP-Status → 200 /{error code translated to HTTP}
- Bare-Message → data that encoded by Content-Type and Content-Encoding

对于成功 Response 响应 **HTTP-Status** 是 200，在这种场景下，响应体的 Content-Type 将保持和请求体的 Content-Type 保持一致。**Bare-Message** 就是 RPC 响应的 Payload，以 Content-Type 指定的方式进行编码并且以 Content-Encoding 来压缩（如果指定了 Content-Encoding 的话）。Bare-Message 作为 HTTP response body 发送。

异常 Response 响应的 HTTP-Status 是 non-200，并且都是标准的 HTTP status code，在这个场景下，**Content-Type** 必须是 "application/json"。**Bare-Message** 可以是空的，如果 Bare-Message 有值的话则是一个标准 JSON 格式数据，如果 **Content-Encoding** 有指定的话则是一个压缩过的数据，Bare-Message 作为标准的 HTTP response body 发送回调用方。客户端可以根据以下表格，查询 HTTP-Status 与 RPC status 之间的映射关系，以了解具体的 RPC 错误情况。

##### Response 报文格式
** 成功响应 **

```latex
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 11

hello world
```

** 失败响应 **

```latex
HTTP/1.1 400 Bad Request
Content-Type: application/json
Content-Length: 46
{"status":20,"message":"request format error"}
```

#### 3.1.3 Error Codes

Dubbo 的错误码参考

```
 status http-status  	  message
 20     200             ok
 25     400 						serialization error
 30     408 						client side timeout
 31     408 						server side timeout
 35     500 						channel inactive, directly return the unfinished requests
 40     400 						request format error
 50     500 						response format error
 60     404 						service not found.
 70     500 						service error
 80     500 						internal server error
 90     500 						internal client error
```

> Connect 的 HTTP to Error Code 参考
>
> | HTTP Status | Inferred Code |
> | --- | --- |
> | 400 Bad Request | invalid_argument |
> | 401 Unauthorized | unauthenticated |
> | 403 Forbidden | permission_denied |
> | 404 Not Found | unimplemented |
> | 408 Request Timeout | deadline_exceeded |
> | 409 Conflict | aborted |
> | 412 Precondition Failed | failed_precondition |
> | 413 Payload Too Large | resource_exhausted |
> | 415 Unsupported Media Type | internal |
> | 429 Too Many Requests | unavailable |
> | 431 Request Header Fields Too Large | resource_exhausted |
> | 502 Bad Gateway | unavailable |
> | 503 Service Unavailable | unavailable |
> | 504 Gateway Timeout | unavailable |
> | _all others_ | unknown |


### 3.2 Triple 之扩展版 gRPC 协议

Triple 协议的 Streaming 请求处理完全遵循 gRPC 协议规范，且仅支持 HTTP/2 作为传输层协议。并且后端服务间的 Unary 请求默认采用扩展版 gPRC 协议。

Triple 支持的 content-type 类型为标准的 gRPC 类型，包括 application/grpc、application/grpc+proto、application/grpc+json，除此之外，Triple 在实现上还扩展了 application/triple+wrapper 编码格式。

#### 3.2.1 Outline

The following is the general sequence of message atoms in a GRPC request & response message stream

* Request → Request-Headers \*Length-Prefixed-Message EOS
* Response → (Response-Headers \*Length-Prefixed-Message Trailers) / Trailers-Only


#### 3.2.2 Requests

* Request → Request-Headers \*Length-Prefixed-Message EOS

Request-Headers are delivered as HTTP2 headers in HEADERS + CONTINUATION frames.

* **Request-Headers** → Call-Definition \*Custom-Metadata
* **Call-Definition** → Method Scheme Path TE [Authority] [Timeout] Content-Type [Message-Type] [Message-Encoding] [Message-Accept-Encoding] [User-Agent] Service-Version Service-Group Tracing-ID Tracing-Span-ID Cluster-Info
* **Method** →  ":method POST"
* **Scheme** → ":scheme "  ("http" / "https")
* **Path** → ":path" "/" Service-Name "/" {_method name_}  # But see note below.
* **Service-Name** → {_IDL-specific service name_}
* **Authority** → ":authority" {_virtual host name of authority_}
* **TE** → "te" "trailers"  # Used to detect incompatible proxies
* **Timeout** → "grpc-timeout" TimeoutValue TimeoutUnit
* **TimeoutValue** → {_positive integer as ASCII string of at most 8 digits_}
* **TimeoutUnit** → Hour / Minute / Second / Millisecond / Microsecond / Nanosecond
  * **Hour** → "H"
  * **Minute** → "M"
  * **Second** → "S"
  * **Millisecond** → "m"
  * **Microsecond** → "u"
  * **Nanosecond** → "n"
* **Content-Type** → "content-type" "application/grpc" [("+proto" / "+json" / {_custom_})]
* **Content-Coding** → "identity" / "gzip" / "deflate" / "snappy" / {_custom_}
* <a name="message-encoding"></a>**Message-Encoding** → "grpc-encoding" Content-Coding
* **Message-Accept-Encoding** → "grpc-accept-encoding" Content-Coding \*("," Content-Coding)
* **User-Agent** → "user-agent" {_structured user-agent string_}
* **Message-Type** → "grpc-message-type" {_type name for message schema_}
* **Custom-Metadata** → Binary-Header / ASCII-Header
* **Binary-Header** → {Header-Name "-bin" } {_base64 encoded value_}
* **ASCII-Header** → Header-Name ASCII-Value
* **Header-Name** → 1\*( %x30-39 / %x61-7A / "\_" / "-" / ".") ; 0-9 a-z \_ - .
* **ASCII-Value** → 1\*( %x20-%x7E ) ; space and printable ASCII
* Service-Version → "tri-service-version" {Dubbo service version}
* Service-Group → "tri-service-group" {Dubbo service group}
* Tracing-ID → "tri-trace-traceid" {tracing id}
* Tracing-RPC-ID → "tri-trace-rpcid" {_span id _}
* Cluster-Info → "tri-unit-info" {cluster infomation}

#### 3.2.3 Responses

* **Response** → (Response-Headers \*Length-Prefixed-Message Trailers) / Trailers-Only
* **Response-Headers** → HTTP-Status [Message-Encoding] [Message-Accept-Encoding] Content-Type \*Custom-Metadata
* **Trailers-Only** → HTTP-Status Content-Type Trailers
* **Trailers** → Status [Status-Message] \*Custom-Metadata
* **HTTP-Status** → ":status 200"
* **Status** → "grpc-status" 1\*DIGIT ; 0-9
* **Status-Message** → "grpc-message" Percent-Encoded
* **Percent-Encoded** → 1\*(Percent-Byte-Unencoded / Percent-Byte-Encoded)
* **Percent-Byte-Unencoded** → 1\*( %x20-%x24 / %x26-%x7E ) ; space and VCHAR, except %
* **Percent-Byte-Encoded** → "%" 2HEXDIGIT ; 0-9 A-F

以上即为 Triple 扩展版本的 gRPC 协议，更多详细规范说明请参照 <a href="https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md" target="_blank">gRPC 协议规范</a>。
