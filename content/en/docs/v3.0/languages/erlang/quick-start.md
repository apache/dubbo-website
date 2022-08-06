---
type: docs
title: "Quick start "
linkTitle: "Quick start"
weight: 1
description: "Erlang Quick start"
---

It is recommended to use java to define the interface jar first, and use the [erlanalysis](https://github.com/apache/dubbo-erlang/tree/master/tools/erlanalysis) tool to parse the java interface to Erlang lib


## Import dependent libraries

### Use the Rebar compilation tool.

Add dubblerl to rebar.config to your project

```erlang
{deps, [
    {dubboerl, {git, "https://github.com/apache/dubbo-erlang.git", {branch, "master"}}}
]}.
```

### Use erlang.mk compilation tool

`in progress...`

## Import interface library
Suppose the interface lib you exported is called dubbo_service.   
* If you didn't upload your lib to your git repository, It is recommended that you copy the `dubbo_service` lib 
into the project's `apps` directory.  
* If it is uploaded to your git repository, you can import like this:
```erlang
{deps, [
    {dubboerl, {git, "https://github.com/apache/dubbo-erlang.git", {branch, "master"}}},
    {dubbo_service,{git,"${INTERFACE_LIB_URL}",{branch,"master"}}} %% replace ${INTERFACE_LIB_URL} with your lib git repos url
]}.
```

## Consumer configuration
Please reference [Reference Config](../reference/)

## Init dubbolib in your project
It is need you 
```erlang
dubboerl:init().
```

## How to call？

### Synchronous call

```erlang
Request = #userInfoRequest{requestId = 123, username = "testname"},
{ok,RequestRef,Response,RpcContent}  = userOperator:queryUserInfo(Request,#{sync=> true}).
```
If it occur error, is reponse `{error,Reason}`. 

### Asynchronous call

Default is Async call.
```erlang
Request = #userInfoRequest{requestId = 123, username = "testname"},
{ok,RequestRef} = userOperator:queryUserInfo(Request).

%% you can receive the message after.
handle_cast({msg_back,RequestRef,Response,RpcContent},State).
```

## Example
Refer to [dubboerl_demo](https://github.com/apache/dubbo-erlang/tree/master/samples)
