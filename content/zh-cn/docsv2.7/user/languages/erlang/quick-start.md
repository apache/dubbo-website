---
aliases:
    - /zh/docsv2.7/user/languages/erlang/quick-start/
description: Erlang 快速开始
linkTitle: 快速开始
title: 快速开始
type: docs
weight: 1
---



建议先使用 java 定义接口 jar，并使用 [erlanalysis](https://github.com/apache/dubbo-erlang/tree/master/tools/erlanalysis) 工具解析java接口至Erlang lib

## 导入依赖库

### 使用 Rebar 编译工具。
Add dubblerl to rebar.config with your project
```erlang
{deps, [
    {dubboerl, {git, "https://github.com/apache/dubbo-erlang.git", {branch, "master"}}}
]}.
```

### 使用 erlang.mk 编译工具
`待补充`

## 导入接口库
Suppose the interface lib you exported is called dubbo_service.   
* If you didn't upload your lib to your git repository, It is recommended that you copy the `dubbo_service` lib 
into the project's `apps` directory.  
* If it is upload to your git repository, you can import like this:
```erlang
{deps, [
    {dubboerl, {git, "https://github.com/apache/dubbo-erlang.git", {branch, "master"}}},
    {dubbo_service,{git,"${INTERFACE_LIB_URL}",{branch,"master"}}} %% replace ${INTERFACE_LIB_URL} with your lib git repos url
]}.
```

## 消费者配置
Please reference [Reference Config](../reference/)

## Init dubbolib in your project
It is need you 
```erlang
dubboerl:init().
```

## 如何调用？

### 同步调用
```erlang
Request = #userInfoRequest{requestId = 123, username = "testname"},
{ok,RequestRef,Response,RpcContent}  = userOperator:queryUserInfo(Request,#{sync=> true}).
```
If it occur error, is reponse `{error,Reason}`. 

### 异步调用

Default is Async call.
```erlang
Request = #userInfoRequest{requestId = 123, username = "testname"},
{ok,RequestRef} = userOperator:queryUserInfo(Request).

%% you can receive the message after.
handle_cast({msg_back,RequestRef,Response,RpcContent},State).
```

## 示例
参考项目 [dubboerl_demo](https://github.com/apache/dubbo-erlang/tree/master/samples)