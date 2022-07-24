---
type: docs
title: Dubbo-go 协议快速开始
keywords: 快速开始,helloworld,
linkTitle: "Dubbo-go 协议快速开始"
description: 快速上手dubbo-go3.0，编写一个简单的helloworld应用
---

{{% pageinfo %}} 此文档已经不再维护。您当前查看的是快照版本。如果想要查看最新版本的文档，请参阅[最新版本](/zh/docs3-v2/golang-sdk/quickstart/quickstart_triple/)。
{{% /pageinfo %}}

# Dubbo-go 协议快速开始

## 1. 环境安装

### 1.1 安装 Go 语言环境

建议使用最新版 go 1.17

go version >= go 1.15

[【Go 语言官网下载地址】](https://golang.google.cn/)

构建如下文件目录，使用命令 `go mod init dubbo3-demo ` 初始化 go module。

```
quickstart
├── api
│   └── api.go
├── client
│   ├── client.go
│   └── dubbogo.yml
├── go.mod
└── server
    ├── dubbogo.yml
    └── server.go
```

### 1.2 启动zookeeper

选择您喜欢的方式启动zk，如您安装docker-compose可直接从文件启动: 

zookeeper.yml:

```yaml
version: '3'
services:
  zookeeper:
    image: zookeeper
    ports:
      - 2181:2181
    restart: on-failure
```

```shell
docker-compose -f ./zookeeper.yml up -d
```

## 2. 编写客户端服务端的接口和实现

### 2.1 定义接口和传输结构，位于api/api.go

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

server/dubbogo.yml

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

client/dubbogo.yml

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
	"dubbo.apache.org/dubbo-go/v3/common/logger" // dubbogo 框架日志
	"dubbo.apache.org/dubbo-go/v3/config"
	_ "dubbo.apache.org/dubbo-go/v3/imports" // dubbogo 框架依赖，所有dubbogo进程都需要隐式引入一次
	"dubbo3-demo/api"
)

// export DUBBO_GO_CONFIG_PATH=dubbogo.yml 运行前需要设置环境变量，指定配置文件位置
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

## 3. 启动服务

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

获得调用结果成功

更多samples可以参阅 [【dubbo-go-samples】](../../samples/samples_repo.html)

下一章：[【Dubbogo 基本概念】](../../concept/app_and_interface.html)
