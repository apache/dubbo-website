---
aliases:
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/nacos/
    - /en/docs3-v2/golang-sdk/tutorial/develop/registry/nacos/
description: Using Nacos as a Registry
title: Using Nacos as a Registry
type: docs
weight: 10
---



## 1. Preparation

- The dubbo-go CLI tool and dependencies are installed
- Create a new demo application

## 2. Using grpc_cli Tool for Dubbo Service Debugging

### 2.1 Start the Server
Example: user.go:
```go
func (u *UserProvider) GetUser(ctx context.Context, userStruct *CallUserStruct) (*User, error) {
	fmt.Printf("=======================\nreq:%#v\n", userStruct)
	rsp := User{"A002", "Alex Stocks", 18, userStruct.SubInfo}
	fmt.Printf("=======================\nrsp:%#v\n", rsp)
	return &rsp, nil
}

```
The server exposes a service named GetUser, taking a CallUserStruct parameter and returning a User parameter.\
Definition of CallUserStruct parameter:
```go
type CallUserStruct struct {
	ID      string
	Male    bool
	SubInfo SubInfo // Nested substructure
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
```go
type User struct {
	Id      string
	Name    string
	Age     int32
	SubInfo SubInfo // Nesting the above substructure SubInfo
}

func (u *User) JavaClassName() string {
	return "com.ikurento.user.User"
}
```

Start the service:

`cd server `\
`source builddev.sh`\
`go run .`

### 2.2 Define the Request Body (Packing/Unpacking Protocol)

The request body is defined as a JSON file, with the convention that all keys are strings.\
Keys correspond to Go struct field names such as "ID", "Name", and values correspond to "type@val".\
The types supported are string, int, bool, time, with val initialized as a string. If only the type is provided, it is initialized to zero value.\
It is required for each struct to have a JavaClassName field, which must strictly correspond with the server side.

See userCall.json:
```json
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
userCall.json defines the structure of CallUserStruct and its substructure SubInfo, and assigns values to the request parameters.

Similarly for user.json, no initial values are needed for return values, but the JavaClassName field must strictly correspond to the server side.
```go
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

### 2.3 Execute Request
`dubbogo-cli call --h=localhost --p 20001 --proto=dubbo --i=com.ikurento.user.UserProvider --method=GetUser --sendObj="./userCall.json" --recvObj="./user.json"`

CLI prints the result:
```log
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
2020/10/26 20:47:45 &{SubID:A001 SubMale:false SubAge:18 JavaClassName:}```
```
You can see detailed request body assignment, return results, and elapsed time. Nested structures are supported.

Server logs:
```
=======================
req:&main.CallUserStruct{ID:"A000", Male:true, SubInfo:main.SubInfo{SubID:"A001", SubMale:false, SubAge:18}}
=======================
```
It shows that data from CLI has been received.

