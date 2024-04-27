---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/interflow/call_java/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/interflow/call_java/
description: "如果您是 dubbo java 的老用户，可能您的 dubbo java 应用并没有使用 protobuf（直接使用 java interface 定义服务），这个时候您需要使用以下方式开发 dubbo go-client，来调用老版本的 dubbo 服务。"
title: 非protoubf模式协议互通（适用于老版本 dubbo java 应用）
linkTitle: 非protoubf模式协议互通
type: docs
weight: 4
---

{{% alert title="注意" color="warning" %}}
在阅读本文档之前，请记住我们推荐使用 protobuf+triple 的模式编写 java 和 go 语言互通的服务。本文仅当您已经有老版本 dubbo java 应用的情况下适用，否则的话请参考上一篇文档，使用 protobuf+triple 开发服务。
{{% /alert %}}


可在此查看本文档 [完整示例源码](https://github.com/apache/dubbo-go-samples/tree/main/java_interop/non-protobuf-dubbo)。


## go-client 调用 java-server
但如果您是 dubbo java 的老用户，可能您的 dubbo java 应用并没有使用 protobuf（直接使用 java interface 定义服务），这个时候您需要使用以下方式开发 dubbo go-client，来调用老版本的 dubbo 服务。

> 以下方案同时支持 triple(non-protobuf) 和 dubbo 协议，你只需要调整协议配置 `client.WithClientProtocolTriple()` 即可。

假设我们当前的 java 服务定义如下：

```java
package org.apache.dubbo.samples.api;

public interface GreetingsService {
    String sayHi(String name);
}
```

我们需要这么编写 go-client，以实现服务调用：

```go
// 生成共享 client，指定
cliDubbo, _ := client.NewClient(
	client.WithClientProtocolDubbo(),
	client.WithClientSerialization(constant.Hessian2Serialization),
)

// 生成服务代理，这里指定 java 服务全路径名
connDubbo, _ := cliDubbo.Dial("org.apache.dubbo.samples.api.GreetingsService", client.WithURL("tri://localhost:50052"))

var respDubbo string
// 发起调用，参数以数组形式指定（标准 json 格式，可参考 java 泛化调用）
connDubbo.CallUnary(context.Background(), []interface{}{"hello"}, &respDubbo, "SayHello")
```

接下来我们尝试运行示例：

1. 运行 java server

```java
./java/java-server/run.sh
```

检查服务运行正常：

```shell
curl \
    --header "Content-Type: application/json" \
    --data '{"name": "Dubbo"}' \
    http://localhost:50052/org.apache.dubbo.sample.Greeter/sayHello
```

2. 运行 go client

```go
go run go/go-server/cmd/client.go
```

## java-client 调用 go-server

这种场景，意味着您要完全从头开发 go server 服务，这时我们建议是直接使用 protbuf 来开发 go server 服务，java client 侧也使用 protobuf 对新增服务发起调用。具体使用示例请参考上一篇文档。
