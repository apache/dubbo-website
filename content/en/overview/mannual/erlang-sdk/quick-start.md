---
aliases:
    - /en/docs3-v2/erlang-sdk/quick-start/
    - /en/overview/manual/erlang-sdk/quick-start/
description: Erlang Quick Start
linkTitle: Quick Start
title: Quick Start
type: docs
weight: 1
---

It is recommended to first define the interface jar using Java, and use the [erlanalysis](https://github.com/apache/dubbo-erlang/tree/master/tools/erlanalysis) tool to parse Java interfaces into Erlang lib.

## Import Dependency Libraries

### Using the Rebar Build Tool.
Add dubblerl to your project's `rebar.config`
```erlang
{deps, [
    {dubboerl, {git, "https://github.com/apache/dubbo-erlang.git", {branch, "master"}}}
]}.
```

### Using the `erlang.mk` Build Tool
`To be added`

## Import Interface Libraries
Suppose the interface lib you exported is called `dubbo_service`.  
* If you didn't upload your lib to your git repository, it is recommended that you copy the `dubbo_service` lib 
into the project's `apps` directory.  
* If it is uploaded to your git repository, you can import it like this:
```erlang
{deps, [
    {dubboerl, {git, "https://github.com/apache/dubbo-erlang.git", {branch, "master"}}},
    {dubbo_service,{git,"${INTERFACE_LIB_URL}",{branch,"master"}}} %% replace ${INTERFACE_LIB_URL} with your lib git repo URL
]}.
```

## Consumer Configuration
Please reference [Reference Config](../reference/)

## Init `dubbolib` in Your Project
It is need you to 
```erlang
dubboerl:init().
```

## How to Call?

### Synchronous Call
```erlang
Request = #userInfoRequest{requestId = 123, username = "testname"},
{ok,RequestRef,Response,RpcContent} = userOperator:queryUserInfo(Request,#{sync => true}).
```
If an error occurs, the response is `{error,Reason}`.

### Asynchronous Call

Default is Async call.
```erlang
Request = #userInfoRequest{requestId = 123, username = "testname"},
{ok,RequestRef} = userOperator:queryUserInfo(Request).

%% you can receive the message after.
handle_cast({msg_back,RequestRef,Response,RpcContent}, State).
```

## Example
Refer to the project [dubboerl_demo](https://github.com/apache/dubbo-erlang/tree/master/samples)

