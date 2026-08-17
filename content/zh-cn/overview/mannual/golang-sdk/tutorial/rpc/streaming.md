---
description: 流式通信 streaming
title: 流式通信
type: docs
weight: 1
---

示例源码：<a href="https://github.com/apache/dubbo-go-samples/tree/main/streaming" target="_blank">dubbo-go-samples/streaming</a>。

普通 RPC 只有一个请求和一个响应。Triple 流式调用允许在一次 RPC 中连续收发多条消息，适合文件分片、消息推送和实时交互等场景。

## 流式调用的类型

在 `.proto` 中，`stream` 写在哪一侧，就表示哪一侧可以发送多条消息：

| 类型 | 请求数 | 响应数 | 定义形式 |
| --- | ---: | ---: | --- |
| 服务端流（server streaming） | 1 | N | `rpc Method(Request) returns (stream Response)` |
| 客户端流（client streaming） | N | 1 | `rpc Method(stream Request) returns (Response)` |
| 双向流（bidirectional streaming） | N | N | `rpc Method(stream Request) returns (stream Response)` |

服务端流常用于消息推送和大文件下载；客户端流适合分片上传或批量汇总；双向流的发送和接收彼此独立，适合聊天、实时控制等长连接场景。示例中的双向流采用 echo 方式逐条返回消息，这只是业务实现，并不是协议限制。

## 定义接口

示例在 [`streaming/proto/greet.proto`](https://github.com/apache/dubbo-go-samples/blob/main/streaming/proto/greet.proto) 中同时定义了三种流式方法：

```protobuf
syntax = "proto3";

package greet;

option go_package = "github.com/apache/dubbo-go-samples/streaming/proto;greet";

service GreetService {
  rpc Greet(GreetRequest) returns (GreetResponse) {}
  rpc GreetStream(stream GreetStreamRequest) returns (stream GreetStreamResponse) {}
  rpc GreetClientStream(stream GreetClientStreamRequest) returns (GreetClientStreamResponse) {}
  rpc GreetServerStream(GreetServerStreamRequest) returns (stream GreetServerStreamResponse) {}
}
```

消息类型的写法与普通 RPC 相同，流式语义由方法签名中的 `stream` 决定。安装 `protoc-gen-go` 和 `protoc-gen-go-triple` 后，可以在 `streaming` 目录生成 Go 代码：

```bash
protoc \
  --go_out=. \
  --go_opt=paths=source_relative \
  --go-triple_out=. \
  --go-triple_opt=paths=source_relative \
  ./proto/greet.proto
```

生成的 `greet.pb.go` 包含消息类型，`greet.triple.go` 包含客户端、服务端接口和注册函数。

## 服务端

完整代码见 [`streaming/go-server/cmd/server.go`](https://github.com/apache/dubbo-go-samples/blob/main/streaming/go-server/cmd/server.go)。服务端监听 `20000` 端口，并注册生成的 `GreetService` 处理函数：

```go
srv, err := server.NewServer(
	server.WithServerProtocol(protocol.WithPort(20000)),
)
if err != nil {
	panic(err)
}
if err := greet.RegisterGreetServiceHandler(srv, &GreetTripleServer{}); err != nil {
	panic(err)
}
if err := srv.Serve(); err != nil {
	logger.Error(err)
}
```

### 双向流

`Recv()` 接收一条请求，`Send()` 返回一条响应。客户端关闭请求侧后，`Recv()` 会返回流结束错误；这里用 `triple.IsEnded` 将正常结束与传输错误区分开。

```go
func (srv *GreetTripleServer) GreetStream(
	ctx context.Context,
	stream greet.GreetService_GreetStreamServer,
) error {
	for {
		req, err := stream.Recv()
		if err != nil {
			if triple.IsEnded(err) {
				return nil
			}
			return fmt.Errorf("triple BidiStream recv error: %s", err)
		}
		if err := stream.Send(&greet.GreetStreamResponse{Greeting: req.Name}); err != nil {
			return fmt.Errorf("triple BidiStream send error: %s", err)
		}
	}
}
```

### 客户端流

服务端读完所有请求后，将名字拼接成一个响应。使用迭代式 `Recv()` 时，应在循环结束后检查 `Err()`。

```go
func (srv *GreetTripleServer) GreetClientStream(
	ctx context.Context,
	stream greet.GreetService_GreetClientStreamServer,
) (*greet.GreetClientStreamResponse, error) {
	var names []string
	for stream.Recv() {
		names = append(names, stream.Msg().Name)
	}
	if stream.Err() != nil && !triple.IsEnded(stream.Err()) {
		return nil, fmt.Errorf("triple ClientStream recv error: %s", stream.Err())
	}
	return &greet.GreetClientStreamResponse{
		Greeting: strings.Join(names, ","),
	}, nil
}
```

### 服务端流

服务端流只接收一个请求，但可以多次调用 `Send()`。处理函数返回后，响应流随之结束。

```go
func (srv *GreetTripleServer) GreetServerStream(
	ctx context.Context,
	req *greet.GreetServerStreamRequest,
	stream greet.GreetService_GreetServerStreamServer,
) error {
	for i := 0; i < 10; i++ {
		if err := stream.Send(&greet.GreetServerStreamResponse{Greeting: req.Name}); err != nil {
			return fmt.Errorf("triple ServerStream send error: %s", err)
		}
	}
	return nil
}
```

## 客户端

完整代码见 [`streaming/go-client/cmd/client.go`](https://github.com/apache/dubbo-go-samples/blob/main/streaming/go-client/cmd/client.go)。连接服务端并创建代理后，就可以调用生成的流式方法：

```go
cli, err := client.NewClient(client.WithClientURL("tri://127.0.0.1:20000"))
if err != nil {
	panic(err)
}
svc, err := greet.NewGreetService(cli)
if err != nil {
	panic(err)
}
```

双向流可以交替调用 `Send()` 和 `Recv()`，也可以在不同 goroutine 中并发收发：

```go
stream, err := svc.GreetStream(context.Background())
if err != nil {
	return err
}
for _, name := range []string{"triple-1", "triple-2", "triple-3"} {
	if err := stream.Send(&greet.GreetStreamRequest{Name: name}); err != nil {
		return err
	}
	resp, err := stream.Recv()
	if err != nil {
		return err
	}
	logger.Infof("TRIPLE bidi stream resp: %s", resp.Greeting)
}
if err := stream.CloseRequest(); err != nil {
	return err
}
if err := stream.CloseResponse(); err != nil {
	return err
}
```

客户端流发送完所有请求后，通过 `CloseAndRecv()` 结束发送并等待唯一的响应：

```go
stream, err := svc.GreetClientStream(context.Background())
if err != nil {
	return err
}
for i := 0; i < 5; i++ {
	if err := stream.Send(&greet.GreetClientStreamRequest{Name: "triple"}); err != nil {
		return err
	}
}
resp, err := stream.CloseAndRecv()
if err != nil {
	return err
}
logger.Infof("TRIPLE client stream resp: %s", resp.Greeting)
```

服务端流在创建时发送请求，之后持续读取响应：

```go
stream, err := svc.GreetServerStream(
	context.Background(),
	&greet.GreetServerStreamRequest{Name: "triple"},
)
if err != nil {
	return err
}
for stream.Recv() {
	logger.Infof("TRIPLE server stream resp: %s", stream.Msg().Greeting)
}
if err := stream.Err(); err != nil {
	return err
}
if err := stream.Close(); err != nil {
	return err
}
```

## 关闭流

双向流的请求和响应可以分别关闭：

| API | 使用场景 |
| --- | --- |
| `CloseRequest()` | 客户端发送完毕后关闭请求侧。调用后仍可继续接收响应。 |
| `CloseResponse()` | 客户端读取完响应，或确定不再需要后续响应时，关闭响应侧并释放资源。 |
| `CloseAndRecv()` | 用于客户端流：关闭请求侧，并等待服务端返回唯一响应。 |

如果服务端在读完请求后还会继续发送数据，双向流客户端应先调用 `CloseRequest()`，继续 `Recv()` 直到响应结束，再调用 `CloseResponse()`。

## Metadata、header 和 trailer

流上的 metadata 使用 `http.Header` 表示。请求信息写入 request header；服务端可在 response header 中返回调用开始阶段的信息，在 trailer 中返回最终状态。

完整的 header 和 trailer 使用示例请参考 [`triple_header_trailer`](https://github.com/apache/dubbo-go-samples/tree/main/triple_header_trailer)。

下面在双向流处理函数中加入一个简单示例，只展示与 metadata 有关的代码：

```go
requestID := stream.RequestHeader().Get("x-request-id")
stream.ResponseHeader().Set("x-stream-status", "ready")
stream.ResponseTrailer().Set("x-stream-result", "completed")

logger.Infof("request id: %s", requestID)
```

客户端必须在第一次 `Send()` 前设置 request header。Response header 在收到首条响应后即可读取；trailer 要等响应流结束后再读。

```go
stream, err := svc.GreetStream(context.Background())
if err != nil {
	return err
}
stream.RequestHeader().Set("x-request-id", "stream-demo-001")

if err := stream.Send(&greet.GreetStreamRequest{Name: "triple"}); err != nil {
	return err
}
resp, err := stream.Recv()
if err != nil {
	return err
}
logger.Infof("response: %s", resp.Greeting)
logger.Infof("header: %s", stream.ResponseHeader().Get("x-stream-status"))

if err := stream.CloseRequest(); err != nil {
	return err
}
if _, err := stream.Recv(); err != nil && !triple.IsEnded(err) {
	return err
}
logger.Infof("trailer: %s", stream.ResponseTrailer().Get("x-stream-result"))
if err := stream.CloseResponse(); err != nil {
	return err
}
```

`Triple-` 和 `Grpc-` 开头的 metadata 名称由协议保留，应用不应自行写入。

## 运行示例

在已经下载的 `dubbo-go-samples` 仓库中，进入 `streaming` 目录并启动服务端：

```bash
cd dubbo-go-samples/streaming
go run ./go-server/cmd/server.go
```

打开另一个终端，重新进入 `streaming` 目录并启动客户端：

```bash
cd dubbo-go-samples/streaming
go run ./go-client/cmd/client.go
```

客户端会依次执行普通调用、双向流、客户端流和服务端流。忽略日志前缀后，关键输出如下：

```text
start to test TRIPLE unary call
TRIPLE unary call resp: triple
start to test TRIPLE bidi stream
TRIPLE bidi stream resp: triple-1
TRIPLE bidi stream resp: triple-2
TRIPLE bidi stream resp: triple-3
start to test TRIPLE client stream
TRIPLE client stream resp: triple,triple,triple,triple,triple
start to test TRIPLE server stream
TRIPLE server stream resp #1: triple
TRIPLE server stream resp #2: triple
...
TRIPLE server stream resp #10: triple
```
