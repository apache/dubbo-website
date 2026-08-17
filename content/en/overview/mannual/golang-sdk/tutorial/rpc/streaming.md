---
description: Streaming Communication
title: Streaming Communication
type: docs
weight: 1
---

Sample source: <a href="https://github.com/apache/dubbo-go-samples/tree/main/streaming" target="_blank">dubbo-go-samples/streaming</a>.

A unary RPC has one request and one response. Triple streaming allows a single RPC to carry a sequence of messages, which is useful for chunked data, server push, and real-time communication.

## Streaming types

In a `.proto` method, the side marked with `stream` can send more than one message:

| Type | Requests | Responses | Definition |
| --- | ---: | ---: | --- |
| Server streaming | 1 | N | `rpc Method(Request) returns (stream Response)` |
| Client streaming | N | 1 | `rpc Method(stream Request) returns (Response)` |
| Bidirectional streaming | N | N | `rpc Method(stream Request) returns (stream Response)` |

Server streaming works well for event push and large downloads. Client streaming is commonly used for chunked uploads or server-side aggregation. In a bidirectional stream, sending and receiving are independent, making it suitable for chat and real-time control. The sample echoes each request immediately, but that is an application choice rather than a protocol requirement.

## Define the service

The sample defines all three streaming methods in [`streaming/proto/greet.proto`](https://github.com/apache/dubbo-go-samples/blob/main/streaming/proto/greet.proto):

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

Messages are defined in the same way as for unary RPCs; `stream` on the method signature provides the streaming semantics. After installing `protoc-gen-go` and `protoc-gen-go-triple`, generate the Go code from the `streaming` directory:

```bash
protoc \
  --go_out=. \
  --go_opt=paths=source_relative \
  --go-triple_out=. \
  --go-triple_opt=paths=source_relative \
  ./proto/greet.proto
```

This creates `greet.pb.go` for the messages and `greet.triple.go` for the client, server, and registration APIs.

## Server

The complete server is in [`streaming/go-server/cmd/server.go`](https://github.com/apache/dubbo-go-samples/blob/main/streaming/go-server/cmd/server.go). It listens on port `20000` and registers the generated `GreetService` handler:

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

### Bidirectional streaming

`Recv()` reads a request and `Send()` writes a response. Once the client closes its request side, `Recv()` reports the end of the stream. `triple.IsEnded` distinguishes that normal condition from a transport error.

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

### Client streaming

The server reads all requests, joins their names, and returns one response. When using the iterator-style `Recv()`, check `Err()` after the loop.

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

### Server streaming

A server-streaming handler receives one request but may call `Send()` more than once. Returning from the handler ends the response stream.

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

## Client

The complete client is in [`streaming/go-client/cmd/client.go`](https://github.com/apache/dubbo-go-samples/blob/main/streaming/go-client/cmd/client.go). Connect to the server and create the generated proxy before opening a stream:

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

For a bidirectional stream, the client can alternate between `Send()` and `Recv()`, as below, or run them concurrently in separate goroutines:

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

For client streaming, `CloseAndRecv()` finishes sending and waits for the single response:

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

A server-streaming request is sent when the stream is opened. The client then reads responses until the stream ends:

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

## Closing a stream

The request and response sides of a bidirectional stream can be closed separately:

| API | When to use it |
| --- | --- |
| `CloseRequest()` | The client has finished sending. It may continue to receive responses afterward. |
| `CloseResponse()` | The client has read all responses, or no longer needs the remaining responses, and wants to release the stream resources. |
| `CloseAndRecv()` | Client streaming only: close the request side and wait for the server's single response. |

If the server sends more data after reading the final request, call `CloseRequest()`, keep calling `Recv()` until the response ends, and then call `CloseResponse()`.

## Metadata, headers, and trailers

Stream metadata is represented by `http.Header`. Request metadata is written to the request header. A server can use the response header for information available near the start of a call and the trailer for its final status.

For a complete header and trailer example, see [`triple_header_trailer`](https://github.com/apache/dubbo-go-samples/tree/main/triple_header_trailer).

For example, the following excerpt adds metadata to the bidirectional handler and shows only the metadata-related code:

```go
requestID := stream.RequestHeader().Get("x-request-id")
stream.ResponseHeader().Set("x-stream-status", "ready")
stream.ResponseTrailer().Set("x-stream-result", "completed")

logger.Infof("request id: %s", requestID)
```

Set request headers before the first `Send()`. Read response headers after the first response arrives, and read trailers after the response stream ends.

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

Metadata names beginning with `Triple-` or `Grpc-` are reserved by the protocol and should not be written by applications.

## Run the sample

In an existing `dubbo-go-samples` checkout, enter the `streaming` directory and start the server:

```bash
cd dubbo-go-samples/streaming
go run ./go-server/cmd/server.go
```

Open another terminal, re-enter the `streaming` directory, and start the client:

```bash
cd dubbo-go-samples/streaming
go run ./go-client/cmd/client.go
```

The client runs the unary, bidirectional, client-streaming, and server-streaming calls in order. Ignoring log prefixes, the relevant output is:

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
