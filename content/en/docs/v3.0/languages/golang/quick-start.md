---
type: docs
title: "Go quick start"
linkTitle: "Go quick start"
weight: 10
description: ""
---

It is recommended to use IDL to define cross-language services and coding formats.

The following shows the service definition and development methods of the Golang language version. If you have a legacy system or do not have multi-language development requirements, you can refer to the following usage methods.

# Quick start
use `hello world` example to show how to start with the Dubbo-go framework.

Protocol: Dubbo

Coding: Hessian2

Registration Center: Zookeeper

## environment

* Go programming environment
* Zookeeper service, you can also use a remote instance


## Server

### The first step: writing `Provider` structure and method for providing services

> <https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-server/app/user.go>


1. Write structure which needs to be transferred, since we are using `Hessian2`, so the `User` class needs to implement the `JavaClassName` method. It will include class names.

```go
type User struct {
         Id      string
         Name string
         Age     int32
         Time time.Time
}

func (u User) JavaClassName() string {
         return "com.ikurento.user.User"
}
```

2.Writing business logic in `UserProvider` which is the same as what we do in dubbo java.
Need to implement the `Reference` method, the return value is uniquely identified in the service, corresponding to the dubbo `beans` and `path` fields.

```go
type UserProvider struct {
}

func (u *UserProvider) GetUser(ctx context.Context, req []interface{}) (*User, error) {
         println("req:%#v", req)
         rsp := User{"A001", "hellowworld", 18, time.Now()}
         println("rsp:%#v", rsp)
         return &rsp, nil
}

func (u *UserProvider) Reference() string {
         return "UserProvider"
}
```

3. Register services and objects

```go
func init() {
         config.SetProviderService(new(UserProvider))
         // ------for hessian2------
         hessian.RegisterPOJO(&User{})
}
```

### Step 2: Write the main program

> <https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-server/app/server.go>

1. Introduce the necessary dubbo-go package

```go
import (
         hessian "github.com/apache/dubbo-go-hessian2"
         "github.com/apache/dubbo-go/config"
         _ "github.com/apache/dubbo-go/registry/protocol"
         _ "github.com/apache/dubbo-go/common/proxy/proxy_factory"
         _ "github.com/apache/dubbo-go/filter/impl"
         _ "github.com/apache/dubbo-go/cluster/cluster_impl"
         _ "github.com/apache/dubbo-go/cluster/loadbalance"
         _ "github.com/apache/dubbo-go/registry/zookeeper"

         _ "github.com/apache/dubbo-go/protocol/dubbo"
)

```

2. main function

```go
func main() {
         config.Load()
}
```

### Step 3: Write a configuration file and configure environment variables

1. Reference to [log](https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-server/profiles/release/log.yml) and [server](https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-server/profiles/release/server.yml) to edit configuration file。

Mainly edit the following parts:

* `registries`: The number and address of zk server

* `services`: Service specific information in the configuration node, modify `interfacec` to the interface to the corresponding service name, modify `key` to the value which is the same as the first step `Referenc` return value.

2. Configure the above two configuration files as environment variables

```shell
export CONF_PROVIDER_FILE_PATH="xxx"
export APP_LOG_CONF_FILE="xxx"
```

## Client

### The first step: writing the client `Provider`

> <https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-client/app/user.go>

1. Refer to the first point of the first step on the server side.

2. Different from the server side, the method of providing the service is used as the parameter of the structure, and there is no need to write specific business logic. In addition, `Provider` does not correspond to the interface in dubbo, but corresponds to an implementation.

```go
type UserProvider struct {
         GetUser func(ctx context.Context, req []interface{}, rsp *User) error
}

func (u *UserProvider) Reference() string {
         return "UserProvider"
}
```

3. Register services and objects

```go
func init() {
         config.SetConsumerService(userProvider)
         hessian.RegisterPOJO(&User{})
}
```

### Step 2: Write the client main program

> <https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-client/app/client.go>

1. Introduce the necessary dubbo-go package

```go
import (
         hessian "github.com/apache/dubbo-go-hessian2"
         "github.com/apache/dubbo-go/config"
         _ "github.com/apache/dubbo-go/registry/protocol"
         _ "github.com/apache/dubbo-go/common/proxy/proxy_factory"
         _ "github.com/apache/dubbo-go/filter/impl"
         _ "github.com/apache/dubbo-go/cluster/cluster_impl"
         _ "github.com/apache/dubbo-go/cluster/loadbalance"
         _ "github.com/apache/dubbo-go/registry/zookeeper"

         _ "github.com/apache/dubbo-go/protocol/dubbo"
)
```

2. main function

```go
func main() {
         config.Load()
         time.Sleep(3e9)

         println("\n\n\nstart to test dubbo")
         user := &User{}
         err := userProvider.GetUser(context.TODO(), []interface{}{"A001"}, user)
         if err != nil {
               panic(err)
         }
         println("response result: %v\n", user)
}
func println(format string, args ...interface{}) {
         fmt.Printf("\033[32;40m"+format+"\033[0m\n", args...)
}
```

### Step 3: Write a configuration file and configure environment variables


1. Refer to [log](https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-client/profiles/release/log.yml) and [client](https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-client/profiles/release/client.yml) to modify configuration file。

Mainly edit the following parts:

* `registries`: The number and address of zk server

* `services`: Service specific information in the configuration node, modify `interfacec` to the interface to the corresponding service name, modify `key` to the value which is the same as the first step `Reference` return value.

2. Configure the above two configuration files as environment variables. In order to prevent the log environment variables from conflicting with the server-side log environment variables, it is recommended that all environment variables should not be configured globally, and they can take effect at present.

```shell
export CONF_CONSUMER_FILE_PATH="xxx"
export APP_LOG_CONF_FILE="xxx"
```
