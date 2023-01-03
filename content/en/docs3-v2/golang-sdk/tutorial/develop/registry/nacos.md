---
title: Use Nacos as a registry
type: docs
weight: 10
---

## 1. Preparations

- dubbo-go cli tools and dependent tools have been installed
- Create a new demo application

## 2. Use grpc_cli tool to debug Dubbo service

### 2.1 Start the server
Example: user.go:
```go
func (u *UserProvider) GetUser(ctx context.Context, userStruct *CallUserStruct) (*User, error) {
fmt.Printf("=========================\nreq:%#v\n", userStruct)
rsp := User{"A002", "Alex Stocks", 18, userStruct.SubInfo}
fmt.Printf("========================\nrsp:%#v\n", rsp)
return &rsp, nil
}

```
The server opens a service named GetUser, passes in a CallUserStruct parameter, and returns a User parameter\
CallUserStruct parameter definition:
```go
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
```go
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

`cd server`\
`source builddev.sh`\
`go run.`

### 2.2 Define the request body (unpacking protocol)

The request body is defined as a json file, and the agreed key value is string\
The key corresponds to the field name of the go language struct, such as "ID" and "Name", and the value corresponds to "type@val"\
Among them, type supports string int bool time, and val is initialized with string. If only type is filled in, it will be initialized to a zero value.
It is agreed that each struct must have a JavaClassName field, which must strictly correspond to the server side

See userCall.json:
```json
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
```go
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

### 2.3 Executing the request
`dubbogo-cli call --h=localhost --p 20001 --proto=dubbo --i=com.ikurento.user.UserProvider --method=GetUser --sendObj="./userCall.json" --recvObj= "./user.json"`

The client prints the result:
``` log
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