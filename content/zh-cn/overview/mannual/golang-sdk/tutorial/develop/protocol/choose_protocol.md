---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/protocol/choose_protocol/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/protocol/choose_protocol/
description: 选择使用的网络协议
keywords: 选择使用的网络协议
title: 选择使用的网络协议
type: docs
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