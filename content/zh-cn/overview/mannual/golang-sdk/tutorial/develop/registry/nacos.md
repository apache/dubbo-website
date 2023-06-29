---
aliases:
    - /zh/docs3-v2/golang-sdk/tutorial/develop/registry/nacos/
    - /zh-cn/docs3-v2/golang-sdk/tutorial/develop/registry/nacos/
description: 使用 Nacos 作为注册中心
title: 使用 Nacos 作为注册中心
type: docs
weight: 10
---

1. `dubbogo-cli` 工具和依赖工具已安装
2. 创建一个新的 `demo` 应用

## grpc_cli 工具进行服务调试

### 开启服务端

`user.go` 示例
```go
func (u *UserProvider) GetUser(ctx context.Context, userStruct *CallUserStruct) (*User, error) {
	fmt.Printf("=======================\nreq:%#v\n", userStruct)
	rsp := User{"A002", "Alex Stocks", 18, userStruct.SubInfo}
	fmt.Printf("=======================\nrsp:%#v\n", rsp)
	return &rsp, nil
}

```

服务端开启一个服务，名为 `GetUser`，传入一个 `CallUserStruct` 的参数，返回一个 `User` 参数\

`CallUserStruct` 参数定义：
```go
type CallUserStruct struct {
	ID      string
	Male    bool
	SubInfo SubInfo // 嵌套子结构
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

User 结构定义：
```go
type User struct {
	Id      string
	Name    string
	Age     int32
	SubInfo SubInfo // 嵌套上述子结构SubInfo
}

func (u *User) JavaClassName() string {
	return "com.ikurento.user.User"
}
```

开启服务：

`cd server `\
`source builddev.sh`\
`go run .`

### 定义请求体(打解包协议)

请求体定义为 `json` 文件，约定键值均为 `string\` 
键对应go语言 `struct` 字段名例如 `"ID"`、`"Name"` ，值对应 `"type@val"\`
其中 `type` 支持` string int bool time`，`val` 使用` string` 来初始化，如果只填写 `type` 则初始化为零值。
约定每个 `struct` 必须有 `JavaClassName` 字段，务必与 `server` 端严格对应见 `userCall.json`:
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
`userCall.json` 将参数 `CallUserStruct` 的结构及子结构 `SubInfo` 都定义了出来，并且给请求参数赋值。

`user.json` 同理，作为返回值不需要赋初始值，但`JavaClassName` 字段一定与 `server` 端严格对应
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

### 执行请求
`dubbogo-cli call --h=localhost --p 20001 --proto=dubbo --i=com.ikurento.user.UserProvider --method=GetUser --sendObj="./userCall.json" --recvObj="./user.json"`

cli 端打印结果：
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
可看到详细的请求体赋值情况，以及返回结果和耗时。支持嵌套结构

server 端打印结果
```
=======================
req:&main.CallUserStruct{ID:"A000", Male:true, SubInfo:main.SubInfo{SubID:"A001", SubMale:false, SubAge:18}}
=======================
```
可见接收到了来自 cli 的数据
