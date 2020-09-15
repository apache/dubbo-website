# Echo Testing

Echo testing is used for check the service is available,Echo testing is performed according to the normal request flow and is able to test whether the entire call is unobstructed and can be used for monitoring.

All the services will be automatically implemented `EchoService` interface,just cast any service reference to `EchoService` to use it.

Spring configuration:

```xml
<dubbo:reference id="memberService" interface="com.xxx.MemberService" />
```

The java code：

```java
// reference the remote service
MemberService memberService = ctx.getBean("memberService");
// case the service reference to EchoService
EchoService echoService = (EchoService) memberService;

// Echo test usability
String status = echoService.$echo("OK");

assert(status.equals("OK"));
```
