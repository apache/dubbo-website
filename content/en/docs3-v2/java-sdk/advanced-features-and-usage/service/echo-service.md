---
type: docs
title: "Echo Test"
linkTitle: "Echo Test"
weight: 12
description: "Check whether Dubbo service is available by echo test"
---

## Feature description
The echo test is used to detect whether the service is available. The echo test is performed according to the normal request process. It can test whether the entire call is smooth and can be used for monitoring.

## Reference use case
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-echo](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-echo)

## scenes to be used

## How to use
All services automatically implement the `EchoService` interface, just cast any service reference to `EchoService` to use it.

### Spring configuration
```xml
<dubbo:reference id="memberService" interface="com.xxx.MemberService" />
```

### code
```java
// remote service reference
MemberService memberService = ctx. getBean("memberService");
 
EchoService echoService = (EchoService) memberService; // Mandatory transformation to EchoService

// echo test availability
String status = echoService. $echo("OK");
 
assert(status. equals("OK"));
```