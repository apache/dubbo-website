---
title: Select the network protocol to use
keywords: select the network protocol to use
description: Select the network protocol to use

---

# Modify the protocol used

## 1. Preparations

- dubbo-go cli tools and dependent tools have been installed
- Create a new demo application

## 2. How to configure the network protocol

As you can see in the Quick Start section, the generated Demo sets the Protocol to tri, indicating that the Triple protocol is used for service exposure and service invocation. The configuration API used in the quick start chapter writes the configuration, which has the advantage of not needing to use configuration files. We extract and explain the content related to the network protocol.

### Using configuration files

See samples/helloworld

- The client uses a configuration file to set the network protocol

```yaml
dubbo:
  consumer:
    references:
      GreeterClientImpl:
        protocol: tri # set protocol to tri
        interface: com.apache.dubbo.sample.basic.IGreeter
```

- The server uses the configuration file to set the network protocol

```yaml
dubbo:
  protocols:
    triple: # define protocol-id 'triple'
      name: tri # set protocol to tri
      port: 20000 # set port to be listened
  provider:
    services:
      GreeterProvider:
        protocol-ids: triple # use protocol-ids named 'triple'
        interface: com.apache.dubbo.sample.basic.IGreeter
```



## 3. Write the interface and implementation of Dubbo protocol

### 3.1 Define the interface and transmission structure, located in api/api.go

```go
package api

import (
"context"
"dubbo.apache.org/dubbo-go/v3/config"
hessian "github.com/apache/dubbo-go-hessian2"
"time"
)

//1. Define the transmission structure. If Java intercommunication is required, the field needs to correspond to the Java side, and the first letter is capitalized
type User struct {
ID string
name string
Age int32
Time time. Time
}

func (u *User) JavaClassName() string {
return "org.apache.dubbo.User" // If it communicates with Java, it needs to correspond to the full name of the User class on the Java side,
}


var (
UserProviderClient = &UserProvider{} // client pointer
)

// 2. Define the client stub class: UserProvider
type UserProvider struct {
// The dubbo label is used to adapt the uppercase method name of the go side client -> the lowercase method name of the java side, only the dubbo protocol client needs to use it
GetUser func(ctx context.Context, req int32) (*User, error) //`dubbo:"getUser"`
}

func init(){
hessian.RegisterPOJO(&User{}) // register transfer structure to hessian library
// Register the client stub class to the framework, and instantiate the client interface pointer userProvider
config. SetConsumerService(UserProviderClient)
}
```

### 2.2 Write Go-Server configuration and code

server/dubbogo.yaml

```yaml
dubbo:
  registries:
    demoZK: # Define the service registration discovery center
      protocol: zookeeper
      address: 127.0.0.1:2181
  protocols:
    dubbo:
      name: dubbo # protocol name dubbo
      port: 20000 # Listening port
  provider:
    services:
      UserProvider: # service provider structure class name
        interface: org.apache.dubbo.UserProvider # The interface needs to correspond to the go/java client
```

server/server.go

```go
package main

import (
"context"
"dubbo.apache.org/dubbo-go/v3/common/logger" // dubbogo framework log
"dubbo.apache.org/dubbo-go/v3/config"
_ "dubbo.apache.org/dubbo-go/v3/imports" // dubbogo framework dependency, all dubbogo processes need to import once implicitly
"dubbo3-demo/api"
"strconv"
"time"
)

type UserProvider struct {
}

// implement the interface method
func (u *UserProvider) GetUser(ctx context.Context, req int32) (*api.User, error) {
var err error
logger.Infof("req:%#v", req)
user := &api. User{}
user.ID = strconv.Itoa(int(req))
user.Name = "Laurence"
user.Age = 22
user.Time = time.Now()
return user, err
}

//// MethodMapper defines method name mapping, from Go method name to Java lowercase method name, only dubbo protocol service interface needs to use
//// go -> go interoperability does not need to be used
//func (s *UserProvider) MethodMapper() map[string]string {
// return map[string]string{
// "GetUser": "getUser",
// }
//}

func init(){
config.SetProviderService(&UserProvider{}) // Register the service provider class, the class name corresponds to the service in the configuration file
}

// export DUBBO_GO_CONFIG_PATH=dubbogo.yml needs to set environment variables before running, and specify the location of the configuration file
func main() {
if err := config.Load(); err != nil {
panic(err)
}
select {}
}

```



### 2.3 Write Go-Client configuration and code

client/dubbogo.yaml

```yaml
dubbo:
  registries:
    demoZK: # Define the service registration discovery center
      protocol: zookeeper
      address: 127.0.0.1:2181
  consumer:
    references:
      UserProvider: # stub class name
        protocol: dubbo # dubbo protocol, default hessian2 serialization method
        interface: org.apache.dubbo.UserProvider # The interface needs to correspond to the go/java client
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
  // start frame
if err := config.Load(); err != nil{
panic(err)
}
var i int32 = 1
  // initiate the call
user, err := api.UserProviderClient.GetUser(context.TODO(), i)
if err != nil {
panic(err)
}
logger.Infof("response result: %+v", user)
}
```

## 4. Start the service

Open two terminals and enter the server client directory respectively

execute separately;

```shell
export DUBBO_GO_CONFIG_PATH=dubbogo.yml
go run .
```

Start the server and the client successively, and you can see the output on the client:

```shell
response result: &{ID:1 Name:laurence Age:22 Time:2021-11-12 17:59:39.185 +0800 CST}
```

successful call
