---
type: docs
title: Dubbo-go 3.0 异常回传
keywords: dubbogo 3.0 异常回传
description: dubbogo 3.0 异常回传
linkTitle: Triple 异常回传
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/golang-sdk/samples/exception_response/)。
{{% /pageinfo %}}

# Triple 协议异常回传

参考samples [dubbo-go-samples/error](https://github.com/apache/dubbo-go-samples/tree/master/error)

## 用户异常回传介绍

用户可以在 provider 端生成用户定义的异常信息，可以记录异常产生堆栈，triple 协议可保证将用户在客户端获取到异常 message ，并可以查看报错堆栈，便于定位问题。

注意返回 error 非 nil 时，框架不负责其他返回值的传递。

- 在Triple provider 端返回异常，以 pb 序列化为例：

```go
package main

import (
	"context"
)

import (
	"dubbo.apache.org/dubbo-go/v3/common/logger"

  // 使用可以记录对战信息的异常库，此处以 "github.com/pkg/errors" 为例
	"github.com/pkg/errors"
)

import (
	triplepb "github.com/apache/dubbo-go-samples/api"
)


// 一个实现了 pb 接口的服务提供结构
type ErrorResponseProvider struct {
	triplepb.UnimplementedGreeterServer
}

// 回传错误的接口
func (s *ErrorResponseProvider) SayHello(ctx context.Context, in *triplepb.HelloRequest) (*triplepb.User, error) {
	logger.Infof("Dubbo3 GreeterProvider get user name = %s\n" + in.Name)
  // 返回用户自定义异常
	return &triplepb.User{Name: "Hello " + in.Name, Id: "12345", Age: 21}, errors.New("user defined error")
}

```



- 客户端打印异常和堆栈

```go
package main

import (
	"context"
)

import (
	"dubbo.apache.org/dubbo-go/v3/common/logger"
	"dubbo.apache.org/dubbo-go/v3/config"
	_ "dubbo.apache.org/dubbo-go/v3/imports"

	tripleCommon "github.com/dubbogo/triple/pkg/common"
)

import (
	triplepb "github.com/apache/dubbo-go-samples/api"
)

var greeterProvider = new(triplepb.GreeterClientImpl)

func init() {
	config.SetConsumerService(greeterProvider)
}

func main() {
	if err := config.Load(); err != nil {
		panic(err)
	}

	req := triplepb.HelloRequest{
		Name: "laurence",
	}

  // 发起调用
	if user, err := greeterProvider.SayHello(context.TODO(), &req); err != nil {
    // 打印异常信息，err.Error() 将返回用户定义的 message，即 user defined error
		logger.Infof("response result: %v, error = %s", user, err)
    
    // 打印异常堆栈，需断言为 tripleCommon.TripleError
		logger.Infof("error details = %+v", err.(tripleCommon.TripleError).Stacks())
	}
}

```

```text
2021-11-12T18:36:33.730+0800    INFO    cmd/client.go:53        response result: , error = user defined error
2021-11-12T18:36:33.730+0800    INFO    cmd/client.go:54        error details = [type.googleapis.com/google.rpc.DebugInfo]:{stack_entries:"user defined error
main.(*ErrorResponseProvider).SayHello
       /dubbo-go-samples/error/triple/pb/go-server/cmd/error_reponse.go:40
reflect.Value.call
       /usr/local/go/src/reflect/value.go:543
reflect.Value.Call
       /usr/local/go/src/reflect/value.go:339
dubbo.apache.org/dubbo-go/v3/common/proxy/proxy_factory.(*ProxyInvoker).Invoke
       /Users/laurence/go/pkg/mod/dubbo.apache.org/dubbo-go/v3@v3.0.0-rc4-1/common/proxy/proxy_factory/default.go:145
       ... 

```

可看到报错信息和堆栈

下一章: [【日志】](./custom-logger.html)