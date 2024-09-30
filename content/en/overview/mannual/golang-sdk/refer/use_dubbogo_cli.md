---
aliases:
    - /en/docs3-v2/golang-sdk/refer/use_dubbogo_cli/
    - /en/docs3-v2/golang-sdk/refer/use_dubbogo_cli/
description: Using the dubbogo-cli Tool
title: Using the dubbogo-cli Tool
type: docs
weight: 3
---
{{% alert title="Deprecation Warning" color="warning" %}}
Starting from version 3.1.0 of dubbo-go, this tool is no longer applicable. This tool has been discontinued and will be replaced by dubboctl in the future. Please stay updated with community news to learn about the latest developments of dubboctl.
{{% /alert %}}

## 1. Installation

dubbogo-cli is a subproject of the Apache/dubbo-go ecosystem, providing convenient application template creation, tool installation, interface debugging, and other functions to improve developer efficiency.

To install dubbogo-cli to $GOPATH/bin, run the following command:

```
go install github.com/dubbogo/dubbogo-cli@latest
```

## 2. Feature Overview

dubbogo-cli supports the following capabilities:

- Application Template Creation

  ```
  dubbogo-cli newApp .
  ```

  Creates an application template in the current directory.

- Demo Creation

  ```
  dubbogo-cli newDemo .
  ```

  Creates an RPC example in the current directory, including a client and a server.

- Compilation and Debug Tool Installation

  ```
  dubbogo-cli install all
  ```

  Installs the following tools to $GOPATH/bin with one click:

    - protoc-gen-go-triple

      For compiling triple protocol interfaces.

    - imports-formatter

      For organizing code import blocks.

      [import-formatter README](https://github.com/dubbogo/tools#imports-formatter)

- View dubbo-go application registration information

    - View registration information on Zookeeper to get the list of interfaces and methods.

      ```bash
      $ dubbogo-cli show --r zookeeper --h 127.0.0.1:2181
      interface: com.dubbogo.pixiu.UserService
      methods: [CreateUser,GetUserByCode,GetUserByName,GetUserByNameAndAge,GetUserTimeout,UpdateUser,UpdateUserByName]
      ```

    - View registration information on Nacos 【Feature in development】

    - View registration information on Istio【Feature in development】

- Debug Dubbo protocol interfaces

- Debug Triple protocol interfaces

## 3. Feature Details

### 3.1 Demo Application Introduction

#### 3.1.1 Demo Creation

```
dubbogo-cli newDemo .
```

Creates a Demo in the current directory, which includes a client and a server, demonstrating an RPC call based on a set of interfaces.

This Demo uses a direct connection mode and does not require a dependency on a registration center. The server exposes the service on the local port 20000, and the client initiates the call.

```shell
.
├── api
│   ├── samples_api.pb.go
│   ├── samples_api.proto
│   └── samples_api_triple.pb.go
├── go-client
│   ├── cmd
│   │   └── client.go
│   └── conf
│       └── dubbogo.yaml
├── go-server
│   ├── cmd
│   │   └── server.go
│   └── conf
│       └── dubbogo.yaml
└── go.mod
```

#### 3.1.2 Running the Demo

Start the server:

```
$ cd go-server/cmd
$ go run .
```

In another terminal, start the client:

```
$ go mod tidy
$ cd go-client/cmd
$ go run .
```

You should see the following log output:

```
INFO    cmd/client.go:49        client response result: name:"Hello laurence" id:"12345" age:21
```

### 3.2 Application Template Introduction

#### 3.2.1 Creating an Application Template

```
dubbogo-cli newApp .
```

Creates an application template in the current directory:

```
.
├── Makefile
├── api
│   ├── api.pb.go
│   ├── api.proto
│   └── api_triple.pb.go
├── build
│   └── Dockerfile
├── chart
│   ├── app
│   │   ├── Chart.yaml
│   │   ├── templates
│   │   │   ├── _helpers.tpl
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── serviceaccount.yaml
│   │   └── values.yaml
│   └── nacos_env
│       ├── Chart.yaml
│       ├── templates
│       │   ├── _helpers.tpl
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       └── values.yaml
├── cmd
│   └── app.go
├── conf
│   └── dubbogo.yaml
├── go.mod
├── go.sum
└── pkg
    └── service
        └── service.go

```

#### 3.2.2 Application Template Explanation

The generated project includes several directories:

- api: Contains interface files, proto files, and the generated .pb.go files.
- build: Contains files related to image building.
- chart: Contains release chart repositories and basic environment chart repositories (nacos, mesh in development).
- cmd: Program entry point.
- conf: Framework configuration.
- pkg/service: RPC service implementation.
- Makefile:

- - Image and Helm deployment names:

- - - IMAGE = $(your_repo)/$(namespace)/$(image_name)
      TAG = 1.0.0
- HELM_INSTALL_NAME = dubbo-go-app, the Helm installation name, used for Helm install/uninstall commands.

- - Provides scripts, for example:

- - - make build # Package the image and push it
- make buildx-publish # Local packaging of amd64 images for arm architecture and push, depends on docker buildx
- make deploy  # Release the application using Helm
- make remove  # Remove already released Helm applications
- make proto-gen # Generate pb.go files under api

-

Development process using application templates

> Required environment: make, go, helm, kubectl, docker

1. Generate the template using dubbogo-cli.
2. Modify api/api.proto.
3. make proto-gen.
4. Develop the interface.
5. Modify IMAGE name and HELM_INSTALL_NAME in the Makefile.
6. Build the image and push.
7. Modify deployment-related value configurations in chart/app/values, with a focus on the image part.

```
image:
  repository: $(your_repo)/$(namespace)/$(image_name)
  pullPolicy: Always
  tag: "1.0.0"
```

8. make deploy to release the application using Helm.

### 3.3 Debugging dubbo-go Applications with gRPC Protocol

#### 3.3.1 Introduction

The grpc_cli tool is used in the gRPC ecosystem for debugging services. When the server enables [reflection service](https://github.com/grpc/grpc/blob/master/doc/server-reflection.md), you can obtain the service's proto file, service name, method name, parameter list, and initiate gRPC calls.

The Triple protocol is compatible with the gRPC ecosystem, and gRPC reflection service is enabled by default, so you can directly use grpc_cli to debug triple services.

#### 3.3.2 Installing grpc_cli

> It will be installed by dubbogo-cli in the future, but currently, users need to install it manually.

Refer to the [grpc_cli documentation](https://github.com/grpc/grpc/blob/master/doc/command_line_tool.md).

#### 3.3.3 Using grpc_cli to Debug Triple Services

1. View the interface definitions of the triple service.

```shell
$ grpc_cli ls localhost:20001 -l
filename: helloworld.proto
package: org.apache.dubbo.quickstart.samples;
service UserProvider {
  rpc SayHello(org.apache.dubbo.quickstart.samples.HelloRequest) returns (org.apache.dubbo.quickstart.samples.User) {}
  rpc SayHelloStream(stream org.apache.dubbo.quickstart.samples.HelloRequest) returns (stream org.apache.dubbo.quickstart.samples.User) {}
}
```

2. Check the request parameter types.

For example, if the developer wants to test the SayHello method on the above port, they can try to obtain the specific definition of HelloRequest with the following command:

```shell
$ grpc_cli type localhost:20001 org.apache.dubbo.quickstart.samples.HelloRequest
message HelloRequest {
  string name = 1 [json_name = "name"];
}
```

3. Request the interface.

Having known the specific types of request parameters, you can initiate a call to test the corresponding service and check if the return value meets expectations.

```shell
$ grpc_cli call localhost:20001 SayHello "name: 'laurence'"
connecting to localhost:20001
name: "Hello laurence"
id: "12345"
age: 21
Received trailing metadata from server:
accept-encoding : identity,gzip
adaptive-service.inflight : 0
adaptive-service.remaining : 50
grpc-accept-encoding : identity,deflate,gzip
Rpc succeeded with OK status
```

### 3.4 Debugging dubbo-go Applications with Dubbo Protocol

#### 3.4.1 Starting the Dubbo Server

Example: user.go:

```
func (u *UserProvider) GetUser(ctx context.Context, userStruct *CallUserStruct) (*User, error) {
	fmt.Printf("=======================\nreq:%#v\n", userStruct)
	rsp := User{"A002", "Alex Stocks", 18, userStruct.SubInfo}
	fmt.Printf("=======================\nrsp:%#v\n", rsp)
	return &rsp, nil
}
```

The server starts a service named GetUser, passing in a parameter of type CallUserStruct, and returns a parameter of type User.
Definition of CallUserStruct parameter:

```
type CallUserStruct struct {
	ID      string
	Male    bool
	SubInfo SubInfo // Nested structure
}
func (cs CallUserStruct) JavaClassName() string {
	return "com.ikurento.user.CallUserStruct"
}

type SubInfo struct {
	SubID   string
	SubMale bool
	SubAge  int
}

func (s SubInfo) JavaClassName() string {
	return "com.ikurento.user.SubInfo"
}
```

Definition of User structure:

```
type User struct {
	Id      string
	Name    string
	Age     int32
	SubInfo SubInfo // Nested substructure
}

func (u *User) JavaClassName() string {
	return "com.ikurento.user.User"
}
```

Start the service:

```
cd server
source builddev.sh
go run .
```

#### 3.4.2 Defining Request Body (for Serialization Protocol)

The request body is defined as a JSON file, with key-value pairs all in string format. The keys correspond to Go struct field names such as "ID" and "Name", while values correspond to "type@val". The type can be string, int, bool, or time, and val is a string used for initialization; if only type is provided, it initializes to the zero value. Every struct must have a JavaClassName field that must correspond strictly to the server side.

See userCall.json:

```
{
  "ID": "string@A000",
  "Male": "bool@true",
  "SubInfo": {
    "SubID": "string@A001",
    "SubMale": "bool@false",
    "SubAge": "int@18",
    "JavaClassName":"string@com.ikurento.user.SubInfo"
  },
  "JavaClassName": "string@com.ikurento.user.CallUserStruct"
}
```

userCall.json defines the structure of the parameter CallUserStruct and its nested structure SubInfo, and assigns values to the request parameters.

user.json, similarly, is used as the return value and does not need initial values, but the JavaClassName field must correspond strictly to the server side.

```
{
  "ID": "string",
  "Name": "string",
  "Age": "int",
  "JavaClassName":  "string@com.ikurento.user.User",
  "SubInfo": {
    "SubID": "string",
    "SubMale": "bool",
    "SubAge": "int",
    "JavaClassName":"string@com.ikurento.user.SubInfo"
  }
}
```

#### 3.4.3 Debugging Port

```
./dubbo-go-cli -h=localhost -p=20001 -proto=dubbo -i=com.ikurento.user.UserProvider -method=GetUser -sendObj="./userCall.json" -recvObj="./user.json"
```

Printed results:

```
2020/10/26 20:47:45 Created pkg:
2020/10/26 20:47:45 &{ID:A000 Male:true SubInfo:0xc00006ea20 JavaClassName:com.ikurento.user.CallUserStruct}
2020/10/26 20:47:45 SubInfo:
2020/10/26 20:47:45 &{SubID:A001 SubMale:false SubAge:18 JavaClassName:com.ikurento.user.SubInfo}


2020/10/26 20:47:45 Created pkg:
2020/10/26 20:47:45 &{ID: Name: Age:0 JavaClassName:com.ikurento.user.User SubInfo:0xc00006ec90}
2020/10/26 20:47:45 SubInfo:
2020/10/26 20:47:45 &{SubID: SubMale:false SubAge:0 JavaClassName:com.ikurento.user.SubInfo}


2020/10/26 20:47:45 connected to localhost:20001!
2020/10/26 20:47:45 try calling interface:com.ikurento.user.UserProvider.GetUser
2020/10/26 20:47:45 with protocol:dubbo

2020/10/26 20:47:45 After 3ms , Got Rsp:
2020/10/26 20:47:45 &{ID:A002 Name:Alex Stocks Age:18 JavaClassName: SubInfo:0xc0001241b0}
2020/10/26 20:47:45 SubInfo:
2020/10/26 20:47:45 &{SubID:A001 SubMale:false SubAge:18 JavaClassName:}
```

You can see detailed assignment of the request body, as well as the return result and time taken. It supports nested structures.

Server-side print output:

```
=======================
req:&main.CallUserStruct{ID:"A000", Male:true, SubInfo:main.SubInfo{SubID:"A001", SubMale:false, SubAge:18}}
=======================
```

You can see that the CLI data was received.

