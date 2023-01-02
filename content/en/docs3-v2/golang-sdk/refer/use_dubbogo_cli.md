---
title: Use dubbogo-cli tool
type: docs
weight: 2
---

## 1. Installation

dubbogo-cli is a sub-project of the Apache/dubbo-go ecosystem, which provides developers with convenient functions such as application template creation, tool installation, and interface debugging to improve user R&D efficiency.

Execute the following command to install dubbogo-cli to $GOPATH/bin

```
go install github.com/dubbogo/dubbogo-cli@latest
```

## 2. Function overview

dubbogo-cli supports the following capabilities

- Application template creation

  ```
  dubbogo-cli newApp.
  ```

  Create an application template in the current directory

- Demo creation

  ```
  dubbogo-cli newDemo.
  ```

  Create an RPC example in the current directory, including a client and a server

- Compile and debug tool installation

  ```
  dubbogo-cli install all
  ```

  One-click installation of the following tools to $GOPATH/bin

  -protoc-gen-go-triple

      Compilation for triple protocol interface

    - imports-formatter

      Used to tidy up code import blocks.

      [import-formatte README](https://github.com/dubbogo/tools#imports-formatter)



- View dubbo-go application registration information

    - View the registration information on Zookeeper to get a list of interfaces and methods

      ```bash
      $ dubbogo-cli show --r zookeeper --h 127.0.0.1:2181
      interface: com.dubbogo.pixiu.UserService
      methods: [CreateUser, GetUserByCode, GetUserByName, GetUserByNameAndAge, GetUserTimeout, UpdateUser, UpdateUserByName]
      ```

    - View the registration information on Nacos [function under development]

    - View the registration information of Istio [function under development]

- Debug Dubbo protocol interface

- Debug Triple protocol interface

## 3. Function details

### 3.1 Demo application introduction

#### 3.1.1 Demo Creation

```
dubbogo-cli newDemo.
```

Create a demo in the current directory, including the client and server. The demo shows the completion of an RPC call based on a set of interfaces.

The Demo uses the direct connection mode without relying on the registration center. The server side exposes the service to the local port 20000, and the client initiates the call.

```shell
.
├── api
│ ├── samples_api.pb.go
│ ├── samples_api.proto
│ └── samples_api_triple.pb.go
├── go-client
│ ├── cmd
│ │ └── client.go
│ └── conf
│ └── dubbogo.yaml
├── go-server
│ ├── cmd
│ │ └── server.go
│ └── conf
│ └── dubbogo.yaml
└── go.mod
```

#### 3.1.2 Running Demo

Start the server

```
$ cd go-server/cmd
$ go run .
```

Another terminal opens the client

```
$ go mod tidy
$ cd go-client/cmd
$ go run .

```

You can see the print log

```
INFO cmd/client.go:49 client response result: name:"Hello laurence" id:"12345" age:21
```

### 3.2 Application template introduction

#### 3.2.1 Application template creation

```
dubbogo-cli newApp.
```

Create an application template in the current directory:

```
.
├── Makefile
├── api
│ ├── api.pb.go
│ ├── api.proto
│ └── api_triple.pb.go
├──build
│ └── Dockerfile
├── chart
│ ├── app
│ │ ├── Chart.yaml
│ │ ├── templates
│ │ │ ├── _helpers.tpl
│ │ │ ├── deployment.yaml
│ │ │ ├── service.yaml
│ │ │ └── serviceaccount.yaml
│ │ └── values.yaml
│ └── nacos_env
│ ├── Chart.yaml
│ ├── templates
│ │ ├── _helpers.tpl
│ │ ├── deployment.yaml
│ │ └── service.yaml
│ └── values.yaml
├── cmd
│ └── app.go
├── conf
│ └── dubbogo.yaml
├── go.mod
├── go.sum
└── pkg
    └── service
        └── service.go

```

#### 3.2.2 Application template introduction

The generated project includes several directories:

- api: place interface files: proto file and generated .pb.go file
- build: place mirror build related files
- Chart: place the chart warehouse for publishing, the basic environment chart warehouse: nacos, mesh (under development)
- cmd: program entry
- conf: framework configuration
- pkg/service: RPC service implementation
- Makefile:

- - Image, helm deployment name:

- - - IMAGE = $(your_repo)/$(namespace)/$(image_name)
      TAG = 1.0.0
- HELM_INSTALL_NAME = dubbo-go-app, helm installation name, used for helm install/uninstall command.

- - Provide scripts such as:

- - - make build # Package the image and push it
- make buildx-publish # The arm architecture locally packs the amd64 image and pushes it, relying on docker buildx
- make deploy # Publish the application through helm
- make remove # Delete the published helm application
- make proto-gen # generate pb.go file under api

-

Development process using application templates

> Dependent environment: make, go, helm, kubectl, docker

1. Generate a template through dubbogo-cli
2. Modify api/api.proto
3. make proto-gen
4. Development interface
5. Modify the image name of IMAGE and release name of HELM_INSTALL_NAME in the makefile
6. Make a mirror image and push
7. Modify the value configuration related to deployment in chart/app/values, focusing on the image part.

```
image:
  repository: $(your_repo)/$(namespace)/$(image_name)
  pullPolicy: Always
  tag: "1.0.0"
```

8. make deploy, use helm to publish the application.

### 3.3 Debug dubbo-go application with gRPC protocol

#### 3.3.1 Introduction

The grpc_cli tool is a tool used by the gRPC ecosystem to debug services. It can be obtained under the premise that [reflection service] (https://github.com/grpc/grpc/blob/master/doc/server-reflection.md) is enabled on the server Go to the service's proto file, service name, method name, parameter list, and initiate a gRPC call.

The Triple protocol is compatible with the gRPC ecosystem, and the gRPC reflection service is enabled by default, so you can directly use grpc_cli to debug the triple service.

#### 3.3.2 Install grpc_cli

> Subsequent installation will be done by dubbogo-cli, currently users need to install manually

Refer to [grpc_cli documentation](https://github.com/grpc/grpc/blob/master/doc/command_line_tool.md)

#### 3.3.3 Use grpc_cli to debug Triple service

1. View the interface definition of the triple service

```shell
$ grpc_cli ls localhost:20001 -l
filename: helloworld.proto
package: org.apache.dubbo.quickstart.samples;
service UserProvider {
  rpc SayHello(org.apache.dubbo.quickstart.samples.HelloRequest) returns (org.apache.dubbo.quickstart.samples.User) {}
  rpc SayHelloStream(stream org.apache.dubbo.quickstart.samples.HelloRequest) returns (stream org.apache.dubbo.quickstart.samples.User) {}
}
```

2. Check the request parameter type

For example, if a developer wants to test the SayHello method of the above port, and tries to obtain the specific definition of HelloRequest, he needs to execute the following command to view the definition of the corresponding parameters.

```shell
$ grpc_cli type localhost:20001 org.apache.dubbo.quickstart.samples.HelloRequest
message HelloRequest {
  string name = 1 [json_name = "name"];
}
```

3. Request interface

Knowing the specific type of the request parameter, you can initiate a call to test the corresponding service. Check to see if the return value is as expected.

```shell
$ grpc_cli call localhost:20001 SayHello "name: 'laurence'"
connecting to localhost:20001
name: "Hello Laurence"
id: "12345"
age: 21
Received trailing metadata from server:
accept-encoding: identity, gzip
adaptive-service.inflight : 0
adaptive-service. remaining : 50
grpc-accept-encoding : identity,deflate,gzip
Rpc succeeded with OK status
```

### 3.4 Debug dubbo-go application with Dubbo protocol

#### 3.4.1 Open Dubbo server

Example: user.go:

```
func (u *UserProvider) GetUser(ctx context.Context, userStruct *CallUserStruct) (*User, error) {
fmt.Printf("=========================\nreq:%#v\n", userStruct)
rsp := User{"A002", "Alex Stocks", 18, userStruct.SubInfo}
fmt.Printf("========================\nrsp:%#v\n", rsp)
return &rsp, nil
}
```

The server opens a service named GetUser, passes in a CallUserStruct parameter, and returns a User parameter
CallUserStruct parameter definition:

```
type CallUserStruct struct {
ID string
Male bool
SubInfo SubInfo // nested substructure
}
func (cs CallUserStruct) JavaClassName() string {
return "com.ikurento.user.CallUserStruct"
}

type SubInfo struct {
SubID string
SubMale bool
SubAge int
}

func (s SubInfo) JavaClassName() string {
return "com.ikurento.user.SubInfo"
}
```

User structure definition:

```
type User struct {
Id string
name string
Age int32
SubInfo SubInfo // Nest the above substructure SubInfo
}

func (u *User) JavaClassName() string {
return "com.ikurento.user.User"
}
```

Start the service:

```
cd server`
`source builddev.sh`
`go run.
```

#### 3.4.2 Define request body (adapted to serialization protocol)

The request body is defined as a json file, and the agreed key value is string
The key corresponds to the field name of the Go language struct, such as "ID" and "Name", and the value corresponds to "type@val"
Among them, type supports string int bool time, and val is initialized with string. If only type is filled in, it will be initialized to a zero value. It is agreed that each struct must have a JavaClassName field, which must strictly correspond to the server side

See userCall.json:

```
{
  "ID": "string@A000",
  "Male": "bool@true",
  "SubInfo": {
    "SubID": "string@A001",
    "SubMale": "bool@false",
    "SubAge": "int@18",
    "JavaClassName": "string@com.ikurento.user.SubInfo"
  },
  "JavaClassName": "string@com.ikurento.user.CallUserStruct"
}
```

userCall.json defines the structure of the parameter CallUserStruct and the substructure SubInfo, and assigns values to the request parameters.

Similarly, user.json does not need to assign an initial value as the return value, but the JavaClassName field must strictly correspond to the server side

```
{
  "ID": "string",
  "Name": "string",
  "Age": "int",
  "JavaClassName": "string@com.ikurento.user.User",
  "SubInfo": {
    "SubID": "string",
    "SubMale": "bool",
    "SubAge": "int",
    "JavaClassName": "string@com.ikurento.user.SubInfo"
  }
}
```

#### 3.4.3 Debug port

```
./dubbo-go-cli -h=localhost -p=20001 -proto=dubbo -i=com.ikurento.user.UserProvider -method=GetUser -sendObj="./userCall.json" -recvObj="./user .json"
```

Print result:

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
2020/10/26 20:47:45 try calling interface: com.ikurento.user.UserProvider.GetUser
2020/10/26 20:47:45 with protocol: dubbo

2020/10/26 20:47:45 After 3ms , Got Rsp:
2020/10/26 20:47:45 &{ID:A002 Name:Alex Stocks Age:18 JavaClassName: SubInfo:0xc0001241b0}
2020/10/26 20:47:45 SubInfo:
2020/10/26 20:47:45 &{SubID:A001 SubMale:false SubAge:18 JavaClassName:}```
```

You can see the detailed request body assignment, as well as the returned result and time-consuming. Supports nested structures

Print the result on the server side

```
=========================
req:&main.CallUserStruct{ID:"A000", Male:true, SubInfo:main.SubInfo{SubID:"A001", SubMale:false, SubAge:18}}
=========================
```

It can be seen that the data from the cli has been received