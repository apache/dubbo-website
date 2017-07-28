> ![warning](../sources/images/check.gif)回声测试用于检测服务是否可用，回声测试按照正常请求流程执行，能够测试整个调用是否通畅，可用于监控。

> ![warning](../sources/images/check.gif)所有服务自动实现EchoService接口，只需将任意服务引用强制转型为EchoService，即可使用。

```xml
<dubbo:reference id="memberService" interface="com.xxx.MemberService" />
```

```java
MemberService memberService = ctx.getBean("memberService"); // 远程服务引用
 
EchoService echoService = (EchoService) memberService; // 强制转型为EchoService
 
String status = echoService.$echo("OK"); // 回声测试可用性
 
assert(status.equals("OK"));
```
