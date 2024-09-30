---
title: "Dubbo Go Quick Start"
linkTitle: "Dubbo Go Quick Start"
tags: ["Go"]
date: 2021-01-11
description: This article introduces how to quickly get started with the Dubbo Go framework through a `helloworld` example.
---

## Environment

- Go programming environment
- Start the zookeeper service, or you can use a remote instance.

## Start from the Server Side

### Step 1: Write the `Provider` struct and the method to provide the service

> https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-server/app/user.go

1. Write the struct that needs to be encoded. Since `Hessian2` is used as the encoding protocol, `User` needs to implement the `JavaClassName` method, and its return value corresponds to the class name of User in dubbo.

```go
type User struct {
	Id   string
	Name string
	Age  int32
	Time time.Time
}

func (u User) JavaClassName() string {
	return "com.ikurento.user.User"
}
```

1. Write the business logic. `UserProvider` acts as a service implementation in dubbo. The `Reference` method must be implemented, and the return value is the unique identifier for this service, corresponding to the `beans` and `path` fields in dubbo.

```go
type UserProvider struct {
}

func (u *UserProvider) GetUser(ctx context.Context, req []interface{}) (*User, error) {
	println("req:%#v", req)
	rsp := User{"A001", "helloworld", 18, time.Now()}
	println("rsp:%#v", rsp)
	return &rsp, nil
}

func (u *UserProvider) Reference() string {
	return "UserProvider"
}
```

1. Register the service and object

```go
func init() {
	config.SetProviderService(new(UserProvider))
	// ------for hessian2------
	hessian.RegisterPOJO(&User{})
}
```

### Step 2: Write the main program

> https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-server/app/server.go

1. Import the necessary dubbo-go packages

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

1. The main function

```go
func main() {
	config.Load()
}
```

### Step 3: Write the configuration file and configure environment variables

1. Edit the configuration files by referring to [log](https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-server/profiles/release/log.yml) and [server](https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-server/profiles/release/server.yml).

Mainly edit the following sections:

- Configure the number and address of zookeeper under the `registries` node
- Configure the specific information of the service under the `services` node, modify the `interface` configuration to correspond to the service's interface name, and the service key corresponds to the `Reference` return value of `Provider` from Step 1.

1. Set the two above configuration files as environment variables

```shell
export CONF_PROVIDER_FILE_PATH="xxx"
export APP_LOG_CONF_FILE="xxx"
```

## Next is the Client

### Step 1: Write the client `Provider`

> https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-client/app/user.go

1. Refer to the first point in Step 1 of the server.
2. Unlike the server, the method providing the service is a parameter of the struct, and specific business logic does not need to be written. Also, the `Provider` does not correspond to an interface in dubbo, but corresponds to an implementation.

```go
type UserProvider struct {
	GetUser func(ctx context.Context, req []interface{}, rsp *User) error
}

func (u *UserProvider) Reference() string {
	return "UserProvider"
}
```

1. Register the service and object

```go
func init() {
	config.SetConsumerService(userProvider)
	hessian.RegisterPOJO(&User{})
}
```

### Step 2: Write the client main program

> https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-client/app/client.go

1. Import the necessary dubbo-go packages

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

1. The main function

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

### Step 3: Write the configuration file and configure environment variables

1. Edit the configuration files by referring to [log](https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-client/profiles/release/log.yml) and [client](https://github.com/dubbogo/dubbo-samples/blob/master/golang/helloworld/dubbo/go-client/profiles/release/client.yml).

Mainly edit the following sections:

- Configure the number and address of zookeeper under the `registries` node
- Configure the specific information of the service under the `references` node, modify the `interface` configuration to correspond to the service's interface name, and the service key corresponds to the `Reference` return value of `Provider` from Step 1.

1. Set the two above configuration files as environment variables. To prevent conflicts between the log environment variables and the server's log environment variables, it is recommended that all environment variables not be globally configured, and only take effect in the current context.

```shell
export CONF_CONSUMER_FILE_PATH="xxx"
export APP_LOG_CONF_FILE="xxx"
```
