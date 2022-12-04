---
type: docs
title: "回声测试"
linkTitle: "回声测试"
weight: 12
description: "通过回声测试检测 Dubbo 服务是否可用"
---

## 特性说明
回声测试用于检测服务是否可用，回声测试按照正常请求流程执行，能够测试整个调用是否通畅，可用于监控。

## 参考用例
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-echo](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-echo)

## 使用场景

## 使用方式
所有服务自动实现 `EchoService` 接口，只需将任意服务引用强制转型为 `EchoService`，即可使用。

### Spring 配置
```xml
<dubbo:reference id="memberService" interface="com.xxx.MemberService" />
```

### 代码
```java
// 远程服务引用
MemberService memberService = ctx.getBean("memberService"); 
 
EchoService echoService = (EchoService) memberService; // 强制转型为EchoService

// 回声测试可用性
String status = echoService.$echo("OK"); 
 
assert(status.equals("OK"));
```
