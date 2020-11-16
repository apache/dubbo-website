---
type: docs
title: "Quick Start"
linkTitle: "Quick Start"
weight: 1
description: "Erlang quick start"
---

We recommend using java to define the Dubbo interface. And use [erlanalysis](https://github.com/apache/dubbo-erlang/tree/master/tools/erlanalysis) 
tool parse java interface transfer to erlang lib.

## Import Dependency Lib


### Using Rebar Build Tool
Add dubblerl to rebar.config with your project
```erlang
{deps, [
    {dubboerl, {git, "https://github.com/apache/dubbo-erlang.git", {branch, "master"}}}
]}.
```

### User erlang.mk Build Tool
`Waiting for improvement`

## Import interface lib
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

## Consumer Configuration
Please reference [Reference Config](../reference)

## Init dubbolib in your project
It is need you 
```erlang
dubboerl:init().
```

## How to invoke?

### Sync Call
```erlang
Request = #userInfoRequest{requestId = 123, username = "testname"},
{ok,RequestRef,Response,RpcContent}  = userOperator:queryUserInfo(Request,#{sync=> true}).
```
If it occur error, is reponse `{error,Reason}`. 

### Async Call

Default is Async call.
```erlang
Request = #userInfoRequest{requestId = 123, username = "testname"},
{ok,RequestRef} = userOperator:queryUserInfo(Request).

%% you can receive the message after.
{msg_back,RequestRef,Response,RpcContent}.
```

## Sample
Reference the demo project [dubboerl_demo](https://github.com/apache/dubbo-erlang/tree/master/samples)