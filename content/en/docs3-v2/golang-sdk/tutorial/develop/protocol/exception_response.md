---
title: Triple exception return
weight: 5
type: docs
---

Refer to samples [dubbo-go-samples/error](https://github.com/apache/dubbo-go-samples/tree/master/error)

## User exception return introduction

The user can generate user-defined exception information on the provider side, and can record the exception generation stack. The triple protocol can ensure that the user can get the exception message on the client side, and can view the error stack, which is convenient for locating the problem.

Note that when returning an error other than nil, the framework is not responsible for the delivery of other return values.

- An exception is returned on the Triple provider side, taking pb serialization as an example:

```go
package main

import (
"context"
)

import (
"dubbo.apache.org/dubbo-go/v3/common/logger"

  // Use an exception library that can record battle information, here we take "github.com/pkg/errors" as an example
"github.com/pkg/errors"
)

import (
triplepb "github.com/apache/dubbo-go-samples/api"
)


// A service provider structure that implements the pb interface
type ErrorResponseProvider struct {
triplepb. UnimplementedGreeterServer
}

// return error interface
func (s *ErrorResponseProvider) SayHello(ctx context.Context, in *triplepb.HelloRequest) (*triplepb.User, error) {
logger.Infof("Dubbo3 GreeterProvider get user name = %s\n" + in.Name)
  // return user-defined exception
return &triplepb.User{Name: "Hello " + in.Name, Id: "12345", Age: 21}, errors.New("user defined error")
}

```



- Client print exception and stack

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

var greeterProvider = new(triplepb. GreeterClientImpl)

func init() {
config. SetConsumerService(greeterProvider)
}

func main() {
if err := config.Load(); err != nil {
panic(err)
}

req := triplepb.HelloRequest{
Name: "Laurence",
}

  // initiate the call
if user, err := greeterProvider. SayHello(context. TODO(), &req); err != nil {
    // Print the exception information, err.Error() will return a user-defined message, namely user defined error
logger.Infof("response result: %v, error = %s", user, err)
    
    // Print the exception stack, it needs to be asserted as tripleCommon.TripleError
logger.Infof("error details = %+v", err.(tripleCommon.TripleError).Stacks())
}
}

```

```text
2021-11-12T18:36:33.730+0800 INFO cmd/client.go:53 response result: , error = user defined error
2021-11-12T18:36:33.730+0800 INFO cmd/client.go:54 error details = [type.googleapis.com/google.rpc.DebugInfo]:{stack_entries:"user defined error
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

You can see the error message and stack
