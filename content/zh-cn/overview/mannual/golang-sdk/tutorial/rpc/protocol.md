---
description: 多协议支持
title: 多协议支持
type: docs
weight: 5
---

# 修改使用的协议

## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装
- 创建一个新的 demo 应用

## 2. 如何配置网络协议

在快速开始章节可以看到，生成的Demo 将 Protocol 设置为 tri，表明使用 Triple 协议进行服务暴露和服务调用。快速开始章节使用的配置 API 进行配置的写入，这样的好处是无需使用配置文件。我们摘取出和网络协议相关的内容进行说明。

### 使用配置文件

参考 samples/helloworld

- 客户端使用配置文件设置网络协议

```yaml
dubbo:
  consumer:
    references:
      GreeterClientImpl:
        protocol: tri # set protcol to tri
        interface: com.apache.dubbo.sample.basic.IGreeter
```

- 服务端使用配置文件设置网络协议

```yaml
dubbo:
  protocols:
    triple: # define protcol-id 'triple'
      name: tri # set protcol to tri
      port: 20000 # set port to be listened
  provider:
    services:
      GreeterProvider:
        protocol-ids: triple # use protocol-ids named 'triple'
        interface: com.apache.dubbo.sample.basic.IGreeter
```



## 3. 编写 Dubbo 协议的接口和实现

### 3.1 定义接口和传输结构，位于api/api.go

```go
package api

import (
	"context"
	"dubbo.apache.org/dubbo-go/v3/config"
	hessian "github.com/apache/dubbo-go-hessian2"
	"time"
)

//1. 定义传输结构， 如需 Java 互通，字段需要与 Java 侧对应，首字母大写
type User struct {
	ID   string
	Name string
	Age  int32
	Time time.Time
}

func (u *User) JavaClassName() string {
	return "org.apache.dubbo.User" // 如果与 Java 互通，需要与 Java 侧 User class全名对应,
}


var (
	UserProviderClient = &UserProvider{} // 客户端指针
)

// 2。 定义客户端存根类：UserProvider
type UserProvider struct {
	// dubbo标签，用于适配go侧客户端大写方法名 -> java侧小写方法名，只有 dubbo 协议客户端才需要使用
	GetUser  func(ctx context.Context, req int32) (*User, error) //`dubbo:"getUser"`
}

func init(){
	hessian.RegisterPOJO(&User{}) // 注册传输结构到 hessian 库
	// 注册客户端存根类到框架，实例化客户端接口指针 userProvider
	config.SetConsumerService(UserProviderClient)
}
```

### 2.2 编写 Go-Server 配置和代码

server/dubbogo.yaml

```yaml
dubbo:
  registries:
    demoZK: # 定义服务注册发现中心
      protocol: zookeeper
      address: 127.0.0.1:2181
  protocols:
    dubbo:
      name: dubbo # 协议名 dubbo
      port: 20000 # 监听端口
  provider:
    services:
      UserProvider: # 服务提供结构类名
        interface: org.apache.dubbo.UserProvider  # 接口需要与 go/java 客户端对应
```

server/server.go

```go
package main

import (
	"context"
	"dubbo.apache.org/dubbo-go/v3/common/logger" // dubbogo 框架日志
	"dubbo.apache.org/dubbo-go/v3/config"
	_ "dubbo.apache.org/dubbo-go/v3/imports" // dubbogo 框架依赖，所有dubbogo进程都需要隐式引入一次
	"dubbo3-demo/api"
	"strconv"
	"time"
)

type UserProvider struct {
}

// 实现接口方法
func (u *UserProvider) GetUser(ctx context.Context, req int32) (*api.User, error) {
	var err error
	logger.Infof("req:%#v", req)
	user := &api.User{}
	user.ID = strconv.Itoa(int(req))
	user.Name = "laurence"
	user.Age = 22
	user.Time = time.Now()
	return user, err
}

//// MethodMapper 定义方法名映射，从 Go 的方法名映射到 Java 小写方法名，只有 dubbo 协议服务接口才需要使用
//// go -> go 互通无需使用
//func (s *UserProvider) MethodMapper() map[string]string {
//	return map[string]string{
//		"GetUser": "getUser",
//	}
//}

func init(){
	config.SetProviderService(&UserProvider{}) // 注册服务提供者类，类名与配置文件中的 service 对应
}

// export DUBBO_GO_CONFIG_PATH=dubbogo.yml 运行前需要设置环境变量，指定配置文件位置
func main() {
	if err := config.Load(); err != nil {
		panic(err)
	}
	select {}
}

```



### 2.3 编写 Go-Client 配置和代码

client/dubbogo.yaml

```yaml
dubbo:
  registries:
    demoZK: # 定义服务注册发现中心
      protocol: zookeeper
      address: 127.0.0.1:2181
  consumer:
    references:
      UserProvider: # 存根类名
        protocol: dubbo # dubbo 协议，默认 hessian2 序列化方式
        interface: org.apache.dubbo.UserProvider # 接口需要与 go/java 客户端对应
```

client/client.go

```go
package main

import (
	"context"
	"dubbo.apache.org/dubbo-go/v3/common/logger"
	"dubbo.apache.org/dubbo-go/v3/config"
	_ "dubbo.apache.org/dubbo-go/v3/imports"
	"dubbo3-demo/api"
)

func main(){
  // 启动框架
	if err := config.Load(); err != nil{
		panic(err)
	}
	var i int32 = 1
  // 发起调用
	user, err := api.UserProviderClient.GetUser(context.TODO(), i)
	if err != nil {
		panic(err)
	}
	logger.Infof("response result: %+v", user)
}
```

## 4. 启动服务

开启两个终端，分别进入server client 目录

分别执行；

```shell
export DUBBO_GO_CONFIG_PATH=dubbogo.yml
go run .
```

先后启动服务端和客户端, 可在客户端看到输出：

```shell
response result: &{ID:1 Name:laurence Age:22 Time:2021-11-12 17:59:39.185 +0800 CST}
```

调用成功


## 1. 准备工作

- dubbo-go cli 工具和依赖工具已安装
- 创建一个新的 demo 应用

## 2. 传递异常信息

参考samples [dubbo-go-samples/error](https://github.com/apache/dubbo-go-samples/tree/master/error)

### 用户异常回传介绍

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

  // 使用可以记录堆栈的异常库，此处以 "github.com/pkg/errors" 为例
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
