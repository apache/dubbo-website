---
description: "Triple Protocol Specification"
linkTitle: Triple Protocol Specification
title: Triple Protocol Design Philosophy and Specification
type: docs
weight: 1
working_in_progress: true
---

## 1 Protocol Design Philosophy
The design of the Triple protocol references various protocol patterns such as gRPC, gRPC-Web, and general HTTP, absorbing the characteristics and advantages of each, ultimately designing a protocol that is easy to access via browsers, fully compatible with gRPC, and supports Streaming communication. Triple can run simultaneously over HTTP/1 and HTTP/2 protocols.

The design goals of the Triple protocol are as follows:
* Triple is designed to be a human and development-friendly HTTP-based protocol, especially for unary RPC requests.
* Fully compatible with HTTP/2-based gRPC protocol, so the Dubbo Triple protocol implementation can 100% interact with the gRPC ecosystem.
* Only relies on standard, widely used HTTP features, enabling direct reliance on official standard HTTP network libraries in the implementation layer.

When used with Protocol Buffers (i.e., using IDL to define services), the Triple protocol supports unary, client-streaming, server-streaming, and bi-streaming RPC communication modes, supporting both binary Protobuf and JSON data format payloads. The Triple implementation does not bind to Protocol Buffers; for instance, you can use Java interface to define services, and the Triple protocol has extended Content-Type support for this model.

## 2 Examples
### 2.1 Unary Request

Taking HTTP/1 request as an example, the current HTTP/1 protocol only supports Unary RPC, supporting application/proto and application/json encoding types, maintaining a usage style consistent with REST-style requests, while the response also includes standard HTTP response encoding (such as 200 OK).

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

A call request with a specified timeout.

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

> Currently only POST request type is supported; we will consider supporting GET request types in the future, which may apply to certain service calls with idempotent properties.

### 2.2 Streaming Call Request

Triple only supports Streaming RPC on HTTP/2. To maintain compatibility with gRPC, the Triple implementation on HTTP/2 (including Streaming RPC) is entirely consistent with the standard gRPC protocol.

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

## 3 Specification Details

The Triple protocol supports running simultaneously over both HTTP/1 and HTTP/2, comprising the following two parts:
1. A custom, streamlined HTTP RPC sub-protocol that supports HTTP/1 and HTTP/2 as transport layers and supports only Request-Response type Unary RPC.
2. An extended sub-protocol based on the gRPC protocol (still 100% compatible with gRPC), supporting only HTTP/2 implementation, and supports Unary RPC and Streaming RPC.

### 3.1 HTTP RPC Protocol of Triple

Most RPC calls are unary (request-response), and the Triple HTTP RPC protocol's unary mode meets the data transmission needs among backend services well. It also addresses the pain points of the gRPC protocol, making it easier for browsers, cURL, and other HTTP tools to access backend services without relying on proxies and gRPC-web, using standard HTTP protocol to initiate calls directly.

Triple HTTP RPC supports both HTTP/1 and HTTP/2 as underlying transport layer protocols, corresponding to supported content-type types as application/json, application/proto.

#### 3.1.1 Request

- Request → Request-Headers Bare-Message
- Request-Headers → Call-Specification *Leading-Metadata
- Call-Specification →
Schema Http-Method Path Http-Host Content-Type TRI-Protocol-Version TRI-Service-Timeout TRI-Service-Version TRI-Service-Group
Content-Encoding Accept-Encoding Accept Content-Length
- Scheme → "http" / "https"
- Http-Method → POST
- Path → /Service-Name/Method-Name; case-sensitive
- Service-Name → service interface full classname
- Method-Name → service interface declared method's name
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

The Triple protocol request only supports POST requests, with the request path being interfaceName/methodName. To implement a call timeout mechanism, tri-service-timeout (in ms) needs to be added,

The Dubbo framework supports service isolation mechanisms based on **group** and **version**, thus the Triple protocol introduces tri-service-group and tri-service-version support.

**Request-Headers** are sent in the form of standard HTTP headers. If too many headers are received, the server can return the corresponding error message.

**TRI-Protocol-Version** header is used to distinguish between Triple protocol requests with the same Content-Type and other protocol requests because the application/json format Content-Type is very common. All Dubbo native client implementations should carry TRI-Protocol-Version in the request, and the Dubbo server or proxy can choose to reject requests without TRI-Protocol-Version and return Http-Status 400 error.

If the Server does not support the specified encoding format of **Message-Codec**, it must return standard HTTP 415 encoding to indicate Unsupported Media Type exception.

**Bare-Message** is the encoding format of the request payload that depends on the Message-Codec setting:
* When Message-Codec: json, the payload adopts an ordered array encoding format, i.e., the rpc method parameters are assembled into an Array in order for json serialization; the position of method parameters corresponds to the array index. When the Triple server receives the request body, it deserializes according to the type of each parameter into the corresponding parameter array. For situations using Protocol Buffer, the payload is an array of a single json object.
* When Message-Codec: proto, the Protobuf generated Request class contains the encoding format, so it directly uses the built-in encoding method in the Request object.
* Message-Codec supports more customized extension values; ensure the framework implementation follows the corresponding encoding and decoding conventions.

If Content-Encoding specifies the corresponding value, the payload is compressed and should be decompressed before parsing the encoded data. Bare-Message will be transmitted as the HTTP Body in the link.

##### Request Message Example

- Request line
   - POST /org.apache.dubbo.demo.GreetService/greeting HTTP/1.1
- Request headers
   - Host: 127.0.0.1:30551
   - Content-Type: application/json
   - Accept: application/json
   - Content-Length: 11
   - Accept-Encoding: compress, gzip
   - tri-protocol-version: 1.0.0
   - tri-service-version: 1.0.0
   - tri-service-group: dubbo
   - tri-service-timeout: 3000
- Request body
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


#### 3.1.2 Response

- Response → Response-Headers *Bare-Message
- Response-Headers → HTTP-Status Content-Type [Content-Encoding] [Accept-Encoding] *Leading-Metadata *Prefixed-Trailing-Metadata
- HTTP-Status → 200 /{error code translated to HTTP}
- Bare-Message → data that encoded by Content-Type and Content-Encoding

For a successful Response, the **HTTP-Status** is 200. In this case, the Content-Type of the response body will match the Content-Type of the request body. **Bare-Message** is the Payload of the RPC response encoded by the method specified by Content-Type and compressed by Content-Encoding (if specified). Bare-Message is sent as the HTTP response body.

For an exception Response, the HTTP-Status is non-200, and they are all standard HTTP status codes. In this case, **Content-Type** must be "application/json". **Bare-Message** can be empty, and if Bare-Message has a value, it must be in standard JSON format data, and if **Content-Encoding** is specified, it is compressed data, sent back to the caller as the standard HTTP response body. The client can refer to the following table to query the mapping relationship between HTTP-Status and RPC status to understand the specific RPC error situation.

##### Response Message Format
** Successful Response **

```latex
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 11

hello world
```

** Failed Response **

```latex
HTTP/1.1 400 Bad Request
Content-Type: application/json
Content-Length: 46
{"status":20,"message":"request format error"}
```

#### 3.1.3 Error Codes

Dubbo Error Codes Reference

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

> Connect's HTTP to Error Code Reference
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


### 3.2 Extended gRPC Protocol of Triple

The Streaming request processing of the Triple protocol fully follows the gRPC protocol specification and only supports HTTP/2 as the transport protocol. Additionally, Unary requests between backend services default to use the extended gRPC protocol.

The content-type types supported by Triple are standard gRPC types, including application/grpc, application/grpc+proto, application/grpc+json. Furthermore, the implementation of Triple has also extended the application/triple+wrapper encoding format.

#### 3.2.1 Outline

The following is the general sequence of message atoms in a gRPC request & response message stream

* Request → Request-Headers *Length-Prefixed-Message EOS
* Response → (Response-Headers *Length-Prefixed-Message Trailers) / Trailers-Only


#### 3.2.2 Requests

* Request → Request-Headers *Length-Prefixed-Message EOS

Request-Headers are delivered as HTTP2 headers in HEADERS + CONTINUATION frames.

* **Request-Headers** → Call-Definition *Custom-Metadata
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
* **Message-Accept-Encoding** → "grpc-accept-encoding" Content-Coding *("," Content-Coding)
* **User-Agent** → "user-agent" {_structured user-agent string_}
* **Message-Type** → "grpc-message-type" {_type name for message schema_}
* **Custom-Metadata** → Binary-Header / ASCII-Header
* **Binary-Header** → {Header-Name "-bin" } {_base64 encoded value_}
* **ASCII-Header** → Header-Name ASCII-Value
* **Header-Name** → 1*( %x30-39 / %x61-7A / "\_" / "-" / ".") ; 0-9 a-z \_ - .
* **ASCII-Value** → 1*( %x20-%x7E ) ; space and printable ASCII
* Service-Version → "tri-service-version" {Dubbo service version}
* Service-Group → "tri-service-group" {Dubbo service group}
* Tracing-ID → "tri-trace-traceid" {tracing id}
* Tracing-RPC-ID → "tri-trace-rpcid" {_span id _}
* Cluster-Info → "tri-unit-info" {cluster information}

#### 3.2.3 Responses

* **Response** → (Response-Headers *Length-Prefixed-Message Trailers) / Trailers-Only
* **Response-Headers** → HTTP-Status [Message-Encoding] [Message-Accept-Encoding] Content-Type *Custom-Metadata
* **Trailers-Only** → HTTP-Status Content-Type Trailers
* **Trailers** → Status [Status-Message] *Custom-Metadata
* **HTTP-Status** → ":status 200"
* **Status** → "grpc-status" 1*DIGIT ; 0-9
* **Status-Message** → "grpc-message" Percent-Encoded
* **Percent-Encoded** → 1*(Percent-Byte-Unencoded / Percent-Byte-Encoded)
* **Percent-Byte-Unencoded** → 1*( %x20-%x24 / %x26-%x7E ) ; space and VCHAR, except %
* **Percent-Byte-Encoded** → "%" 2HEXDIGIT ; 0-9 A-F

This is the extended version of the gRPC protocol for Triple. For more detailed specifications, please refer to <a href="https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md" target="_blank">gRPC Protocol Specification</a>.
