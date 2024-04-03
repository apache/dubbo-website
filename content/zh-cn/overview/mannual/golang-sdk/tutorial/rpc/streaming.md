---
description: 流式通信 streaming
title: 流式通信
type: docs
weight: 1
---
Streaming 流式通信是 Dubbo3 新提供的一种 RPC 数据传输模式，适用于以下场景:

- 接口需要发送大量数据，这些数据无法被放在一个 RPC 的请求或响应中，需要分批发送，但应用层如果按照传统的多次 RPC 方式无法解决顺序和性能的问题，如果需要保证有序，则只能串行发送
- 流式场景，数据需要按照发送顺序处理, 数据本身是没有确定边界的
- 推送类场景，多个消息在同一个调用的上下文中被发送和处理

Streaming 流式通信类型分为以下三种:
- SERVER_STREAM(服务端流)
- CLIENT_STREAM(客户端流)
- BIDIRECTIONAL_STREAM(双向流)

## 1.介绍

本文档演示如何在 Dubbo-go 中使用流式通信，可在此查看 <a href="https://github.com/apache/dubbo-go-samples/tree/main/streaming" target="_blank">完整示例源码地址</a>。

## 2.如何使用Dubbo-go流式通信

在proto文件中需要流式通信的方法的参数前面添加stream，使用proto-gen-triple生成相应文件

```protobuf
service GreetService {
  rpc Greet(GreetRequest) returns (GreetResponse) {}
  rpc GreetStream(stream GreetStreamRequest) returns (stream GreetStreamResponse) {}
  rpc GreetClientStream(stream GreetClientStreamRequest) returns (GreetClientStreamResponse) {}
  rpc GreetServerStream(GreetServerStreamRequest) returns (stream GreetServerStreamResponse) {}
}
```

编写服务端handler文件

源文件路径: dubbo-go-sample/streaming/go-server/cmd/server.go

```go
type GreetTripleServer struct {
}

func (srv *GreetTripleServer) Greet(ctx context.Context, req *greet.GreetRequest) (*greet.GreetResponse, error) {
	resp := &greet.GreetResponse{Greeting: req.Name}
	return resp, nil
}

func (srv *GreetTripleServer) GreetStream(ctx context.Context, stream greet.GreetService_GreetStreamServer) error {
	for {
		req, err := stream.Recv()
		if err != nil {
			if triple.IsEnded(err) {
				break
			}
			return fmt.Errorf("triple BidiStream recv error: %s", err)
		}
		if err := stream.Send(&greet.GreetStreamResponse{Greeting: req.Name}); err != nil {
			return fmt.Errorf("triple BidiStream send error: %s", err)
		}
	}
	return nil
}

func (srv *GreetTripleServer) GreetClientStream(ctx context.Context, stream greet.GreetService_GreetClientStreamServer) (*greet.GreetClientStreamResponse, error) {
	var reqs []string
	for stream.Recv() {
		reqs = append(reqs, stream.Msg().Name)
	}
	if stream.Err() != nil && !triple.IsEnded(stream.Err()) {
		return nil, fmt.Errorf("triple ClientStream recv err: %s", stream.Err())
	}
	resp := &greet.GreetClientStreamResponse{
		Greeting: strings.Join(reqs, ","),
	}

	return resp, nil
}

func (srv *GreetTripleServer) GreetServerStream(ctx context.Context, req *greet.GreetServerStreamRequest, stream greet.GreetService_GreetServerStreamServer) error {
	for i := 0; i < 5; i++ {
		if err := stream.Send(&greet.GreetServerStreamResponse{Greeting: req.Name}); err != nil {
			return fmt.Errorf("triple ServerStream send err: %s", err)
		}
	}
	return nil
}
```

编写客户端client文件

源文件路径: dubbo-go-sample/streaming/go-client/cmd/client.go

```go
func main() {
	cli, err := client.NewClient(
		client.WithClientURL("tri://127.0.0.1:20000"),
	)
	if err != nil {
		panic(err)
	}

	svc, err := greet.NewGreetService(cli)
	if err != nil {
		panic(err)
	}
	TestClient(svc)
}

func TestClient(cli greet.GreetService) {
	if err := testUnary(cli); err != nil {
		logger.Error(err)
	}

	if err := testBidiStream(cli); err != nil {
		logger.Error(err)
	}

	if err := testClientStream(cli); err != nil {
		logger.Error(err)
	}

	if err := testServerStream(cli); err != nil {
		logger.Error(err)
	}
}

func testUnary(cli greet.GreetService) error {
	logger.Info("start to test TRIPLE unary call")
	resp, err := cli.Greet(context.Background(), &greet.GreetRequest{Name: "triple"})
	if err != nil {
		return err
	}
	logger.Infof("TRIPLE unary call resp: %s", resp.Greeting)
	return nil
}

func testBidiStream(cli greet.GreetService) error {
	logger.Info("start to test TRIPLE bidi stream")
	stream, err := cli.GreetStream(context.Background())
	if err != nil {
		return err
	}
	if sendErr := stream.Send(&greet.GreetStreamRequest{Name: "triple"}); sendErr != nil {
		return err
	}
	resp, err := stream.Recv()
	if err != nil {
		return err
	}
	logger.Infof("TRIPLE bidi stream resp: %s", resp.Greeting)
	if err := stream.CloseRequest(); err != nil {
		return err
	}
	if err := stream.CloseResponse(); err != nil {
		return err
	}
	return nil
}

func testClientStream(cli greet.GreetService) error {
	logger.Info("start to test TRIPLE client stream")
	stream, err := cli.GreetClientStream(context.Background())
	if err != nil {
		return err
	}
	for i := 0; i < 5; i++ {
		if sendErr := stream.Send(&greet.GreetClientStreamRequest{Name: "triple"}); sendErr != nil {
			return err
		}
	}
	resp, err := stream.CloseAndRecv()
	if err != nil {
		return err
	}
	logger.Infof("TRIPLE client stream resp: %s", resp.Greeting)
	return nil
}

func testServerStream(cli greet.GreetService) error {
	logger.Info("start to test TRIPLE server stream")
	stream, err := cli.GreetServerStream(context.Background(), &greet.GreetServerStreamRequest{Name: "triple"})
	if err != nil {
		return err
	}
	for stream.Recv() {
		logger.Infof("TRIPLE server stream resp: %s", stream.Msg().Greeting)
	}
	if stream.Err() != nil {
		return err
	}
	if err := stream.Close(); err != nil {
		return err
	}
	return nil
}
```

## 3.运行效果

运行服务端和客户端，可以看到请求正常返回

```
[start to test TRIPLE unary call]
TRIPLE unary call resp: [triple]
[start to test TRIPLE bidi stream]
TRIPLE bidi stream resp: [triple]
[start to test TRIPLE client stream]
TRIPLE client stream resp: [triple,triple,triple,triple,triple]
[start to test TRIPLE server stream]
TRIPLE server stream resp: [triple]
TRIPLE server stream resp: [triple]
TRIPLE server stream resp: [triple]
TRIPLE server stream resp: [triple]
TRIPLE server stream resp: [triple]
```

