---
aliases:
    - /zh/docs3-v2/java-sdk/advanced-features-and-usage/service/echo-service/
    - /zh-cn/docs3-v2/java-sdk/advanced-features-and-usage/service/echo-service/
description: 通过回声测试检测 Dubbo 服务是否可用
linkTitle: 回声测试
title: 回声测试
type: docs
weight: 12
---






## 特性说明
回声测试用于检测服务是否可用，回声测试按照正常请求流程执行，能够测试整个调用是否通畅，可用于监控。执行回声测试，客户端发送一个包含特定值（如字符串）的请求。服务器应使用相同的值进行响应，从而验证请求是否已成功接收和处理。如果响应与请求不匹配，则表示服务运行不正常，应进一步调查。要求 Dubbo 服务器正在运行，并且服务器和客户端之间具有网络连接。在客户端，必须配置 Dubbo 客户端以连接到服务器，客户端将向服务器发送请求，然后服务器应返回与请求相同的响应。


## 使用场景
测试验证是否可以调用服务以及响应是否正确，对于在尝试在生产环境中使用服务之前验证服务特别有用。
echo 测试是验证 Dubbo 服务基本功能的一种简单有效的方法，在将服务部署到生产环境之前执行此测试非常重要，以确保服务按预期工作。

> 参考用例
[https://github.com/apache/dubbo-samples/tree/master/dubbo-samples-echo](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-echo)

## 使用方式
所有服务自动实现 `EchoService` 接口，只需将任意服务引用强制转型为 `EchoService`，即可使用。

### Spring 配置
```xml
<dubbo:reference id="memberService" interface="com.xxx.MemberService" />
```

### 代码示例
```java
// 远程服务引用
MemberService memberService = ctx.getBean("memberService"); 
 
EchoService echoService = (EchoService) memberService; // 强制转型为EchoService

// 回声测试可用性
String status = echoService.$echo("OK"); 
 
assert(status.equals("OK"));
```