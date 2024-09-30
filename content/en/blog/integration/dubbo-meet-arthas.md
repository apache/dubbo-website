---
title: "When Dubbo Meets Arthas: Problem Diagnosis in Practice"
linkTitle: "When Dubbo Meets Arthas: Problem Diagnosis in Practice"
date: 2019-02-02
tags: ["Ecosystem", "Java"]
description: >
    Using Alibaba's open-source application diagnosis tool Arthas to diagnose issues in Dubbo applications.
---



Apache Dubbo is Alibaba's open-source high-performance RPC framework with a large user base in China.

* Github: https://github.com/apache/dubbo
* Documentation: http://dubbo.apache.org/en-us/

Arthas is Alibaba's open-source application diagnosis tool, which has gained over 6000 stars on Github within three months of its release in September.

* Github: https://github.com/alibaba/arthas
* Documentation: https://arthas.aliyun.com/doc/
* Arthas open-source exchange QQ Group: 916328269
* Arthas open-source exchange DingTalk Group: 21965291

What sparks will fly when Dubbo meets Arthas? Here are some experiences in diagnosing Dubbo issues using Arthas.

### dubbo-arthas-demo

The following diagnostic sharing is based on the `dubbo-arthas-demo`, a very simple application where browser requests go from Spring MVC to Dubbo Client and then to Dubbo Server.

The demo includes two Spring Boot applications; start `server-demo` first, then `client-demo`.

* https://github.com/hengyunabc/dubbo-arthas-demo

```
  /user/{id}    ->   UserService    ->   UserServiceImpl 
   Browser           Dubbo Client          Dubbo Server
```

Client side:

```java
@RestController
public class UserController {

	@Reference(version = "1.0.0")
	private UserService userService;

	@GetMapping("/user/{id}")
	public User findUserById(@PathVariable Integer id) {
		return userService.findUser(id);
	}
```

Server side:

```java
@Service(version = "1.0.0")
public class UserServiceImpl implements UserService {
	@Override
	public User findUser(int id) {
		if (id < 1) {
			throw new IllegalArgumentException("user id < 1, id: " + id);
		}
		for (User user : users) {
			if (user.getId() == id) {
				return user;
			}
		}
		throw new RuntimeException("Can not find user, id: " + id);
	}
```

### Arthas Quick Start

* https://arthas.aliyun.com/doc/install-detail.html

```bash
$ wget https://arthas.aliyun.com/arthas-boot.jar
$ java -jar arthas-boot.jar
```

After starting, it will list all Java processes; select 1 and press enter to connect to `ServerDemoApplication`.

```bash
$ java -jar arthas-boot.jar
* [1]: 43523 ServerDemoApplication
  [2]: 22342
  [3]: 44108 ClientDemoApplication
1
[INFO] arthas home: /Users/hengyunabc/.arthas/lib/3.0.5/arthas
[INFO] Try to attach process 43523
[INFO] Attach process 43523 success.
[INFO] arthas-client connect 127.0.0.1 3658
  ,---.  ,------. ,--------.,--.  ,--.  ,---.   ,---.
 /  O  \ |  .--. ''--.  .--'|  '--'  | /  O  \ '   .-'
|  .-.  ||  '--'.'   |  |   |  .--.  ||  .-.  |`.  `-.
|  | |  ||  |\  \    |  |   |  |  |  ||  | |  |.-'    |
`--' `--'`--' '--'   `--'   `--'  `--'`--' `--'`-----'

wiki: https://arthas.aliyun.com/doc
version: 3.0.5
pid: 43523
time: 2018-12-05 16:23:52

$
```

### How to Get Call Parameters When Dubbo Online Service Throws Exceptions?

* https://arthas.aliyun.com/doc/watch.html

When an online service throws an exception, the most urgent question is what parameters caused the exception.

In the demo, access http://localhost:8080/user/0, and `UserServiceImpl` will throw an exception because the user id is illegal.

In Arthas, execute `watch com.example.UserService * -e -x 2 '{params,throwExp}'`, then access again to see the parameters and exceptions printed out by the watch command.

```
$ watch com.example.UserService * -e -x 2 '{params,throwExp}'
Press Ctrl+C to abort.
Affect(class-cnt:1 , method-cnt:4) cost in 230 ms.
ts=2018-12-05 16:26:44; [cost=3.905523ms] result=@ArrayList[
    @Object[][
        @Integer[0],
    ],
    java.lang.IllegalArgumentException: user id < 1, id: 0
	at com.example.UserServiceImpl.findUser(UserServiceImpl.java:24)
	at com.alibaba.dubbo.common.bytecode.Wrapper1.invokeMethod(Wrapper1.java)
	at com.alibaba.dubbo.rpc.proxy.javassist.JavassistProxyFactory$1.doInvoke(JavassistProxyFactory.java:45)
	at com.alibaba.dubbo.rpc.proxy.AbstractProxyInvoker.invoke(AbstractProxyInvoker.java:71)
	at com.alibaba.dubbo.config.invoker.DelegateProviderMetaDataInvoker.invoke(DelegateProviderMetaDataInvoker.java:48)
	at com.alibaba.dubbo.rpc.protocol.InvokerWrapper.invoke(InvokerWrapper.java:52)
	at com.alibaba.dubbo.rpc.filter.ExceptionFilter.invoke(ExceptionFilter.java:61)
```

### How to Dynamically Debug Dubbo Service Code Online?

* https://arthas.aliyun.com/doc/redefine.html

During local development, hot deployment tools may be used to modify code without restarting the application. However, is there a way to debug code dynamically in a live environment, such as adding logs?

In Arthas, you can use the `redefine` command to update the code dynamically without restarting the application.

For example, modify `UserServiceImpl` to print the specific `User` object using `System.out`:

```java
	public User findUser(int id) {
		if (id < 1) {
			throw new IllegalArgumentException("user id < 1, id: " + id);
		}
		for (User user : users) {
			if (user.getId() == id) {
				System.out.println(user);
				return user;
			}
		}
		throw new RuntimeException("Can not find user, id: " + id);
	}
```

After local compilation, upload `server-demo/target/classes/com/example/UserServiceImpl.class` to the online server, and use the `redefine` command to update the code:

```
$ redefine -p /tmp/UserServiceImpl.class
redefine success, size: 1
```

After the update is successful, accessing http://localhost:8080/user/1 will print the user information in the `ServerDemoApplication` console.

### How to Dynamically Change the Logger Level of Dubbo?

* https://arthas.aliyun.com/doc/ognl.html
* https://arthas.aliyun.com/doc/sc.html
* https://commons.apache.org/dormant/commons-ognl/language-guide.html

When troubleshooting issues, the ability to see more information is very helpful; it's beneficial to change the logger level to `DEBUG`.

`ognl` is a lightweight expression engine open-sourced by Apache. The following example uses the `ognl` command in Arthas to dynamically change the logger level.

First, obtain a logger object for `TraceFilter` in Dubbo and see its implementation class, which is log4j.

```bash
$ ognl '@com.alibaba.dubbo.rpc.protocol.dubbo.filter.TraceFilter@logger.logger'
@Log4jLogger[
    FQCN=@String[com.alibaba.dubbo.common.logger.support.FailsafeLogger],
    logger=@Logger[org.apache.log4j.Logger@2f19bdcf],
]
```

Then use the `sc` command to see which jar is loaded:

```bash
$ sc -d org.apache.log4j.Logger
 class-info        org.apache.log4j.Logger
 code-source       /Users/hengyunabc/.m2/repository/org/slf4j/log4j-over-slf4j/1.7.25/log4j-over-slf4j-1.7.25.jar
 name              org.apache.log4j.Logger
 isInterface       false
 isAnnotation      false
 isEnum            false
 isAnonymousClass  false
 isArray           false
 isLocalClass      false
 isMemberClass     false
 isPrimitive       false
 isSynthetic       false
 simple-name       Logger
 modifier          public
 annotation
 interfaces
 super-class       +-org.apache.log4j.Category
                     +-java.lang.Object
 class-loader      +-sun.misc.Launcher$AppClassLoader@5c647e05
                     +-sun.misc.Launcher$ExtClassLoader@59878d35
 classLoaderHash   5c647e05

Affect(row-cnt:1) cost in 126 ms.
```

**It can be seen that log4j is proxied through slf4j.**

Then, get the `root` logger using `org.slf4j.LoggerFactory` and change its level:

```
$ ognl '@org.slf4j.LoggerFactory@getLogger("root").setLevel(@ch.qos.logback.classic.Level@DEBUG)'
null
$ ognl '@org.slf4j.LoggerFactory@getLogger("root").getLevel().toString()'
@String[DEBUG]
```
It can be seen that after modification, the `root` logger level changed to `DEBUG`.

### How to Reduce the Trouble of Repeatedly Sending Requests from Testers?

* https://arthas.aliyun.com/doc/tt.html

During development, testers may need to send requests for joint debugging. However, while debugging, if we accidentally skip this, it can be awkward and require the testers to send requests again.

Arthas provides the `tt` command to reduce this hassle, allowing direct replay of requests.

```bash
$ tt -t com.example.UserServiceImpl findUser
Press Ctrl+C to abort.
Affect(class-cnt:1 , method-cnt:1) cost in 145 ms.
 INDEX      TIMESTAMP              COST(ms)      IS-RET     IS-EXP    OBJECT       CLASS              METHOD
----------------------------------------------------------------------------------------------------------------
 1000       2018-12-05 17:47:52    1.56523       true       false     0x3233483    UserServiceImpl    findUser
 1001       2018-12-05 17:48:03    0.286176      false      true      0x3233483    UserServiceImpl    findUser
 1002       2018-12-05 17:48:11    90.324335     true       false     0x3233483    UserServiceImpl    findUser
```

The above `tt -t` command captured 3 requests. Then, you can replay the request with `tt --play`:

```bash
$ tt --play -i 1000
 RE-INDEX       1000
 GMT-REPLAY     2018-12-05 17:55:50
 OBJECT         0x3233483
 CLASS          com.example.UserServiceImpl
 METHOD         findUser
 PARAMETERS[0]  @Integer[1]
 IS-RETURN      true
 IS-EXCEPTION   false
 RETURN-OBJ     @User[
                    id=@Integer[1],
                    name=@String[Deanna Borer],
                ]
Time fragment[1000] successfully replayed.
Affect(row-cnt:1) cost in 4 ms.
```

### What Filters Are There in Dubbo Runtime? How Much Time Do They Take?

* https://arthas.aliyun.com/doc/trace.html

Dubbo loads many filters at runtime, so which filters will a request go through, and what is the time taken by each filter?

Using Arthas's `trace` command, you can easily obtain filter information and see detailed call stacks and timings.

```bash
$ trace com.alibaba.dubbo.rpc.Filter *
Press Ctrl+C to abort.
Affect(class-cnt:19 , method-cnt:59) cost in 1441 ms.
`---ts=2018-12-05 19:07:26;thread_name=DubboServerHandler-30.5.125.152:20880-thread-10;id=3e;is_daemon=true;priority=5;TCCL=sun.misc.Launcher$AppClassLoader@5c647e05
    `---[8.435844ms] com.alibaba.dubbo.rpc.filter.EchoFilter:invoke()
        +---[0.124572ms] com.alibaba.dubbo.rpc.Invocation:getMethodName()
        +---[0.065123ms] java.lang.String:equals()
        `---[7.762928ms] com.alibaba.dubbo.rpc.Invoker:invoke()
            `---[7.494124ms] com.alibaba.dubbo.rpc.filter.ClassLoaderFilter:invoke()
                +---[min=0.00355ms,max=0.049922ms,total=0.057637ms,count=3] java.lang.Thread:currentThread()
                +---[0.0126ms] java.lang.Thread:getContextClassLoader()
                +---[0.02188ms] com.alibaba.dubbo.rpc.Invoker:getInterface()
                +---[0.004115ms] java.lang.Class:getClassLoader()
                +---[min=0.003906ms,max=0.014058ms,total=0.017964ms,count=2] java.lang.Thread:setContextClassLoader()
                `---[7.033486ms] com.alibaba.dubbo.rpc.Invoker:invoke()
                    `---[6.869488ms] com.alibaba.dubbo.rpc.filter.GenericFilter:invoke()
                        +---[0.01481ms] com.alibaba.dubbo.rpc.Invocation:getMethodName()
```

### How Does Dubbo Dynamic Proxy Work?

* https://arthas.aliyun.com/doc/jad.html
* com.alibaba.dubbo.common.bytecode.Wrapper

Using Arthas's `jad` command, you can see the code for the Wrapper class dynamically generated by Dubbo through javaassist:

```java
$ jad com.alibaba.dubbo.common.bytecode.Wrapper1

ClassLoader:
+-sun.misc.Launcher$AppClassLoader@5c647e05
  +-sun.misc.Launcher$ExtClassLoader@59878d35

Location:
/Users/hengyunabc/.m2/repository/com/alibaba/dubbo/2.5.10/dubbo-2.5.10.jar

package com.alibaba.dubbo.common.bytecode;

public class Wrapper1
extends Wrapper
implements ClassGenerator.DC {

    public Object invokeMethod(Object object, String string, Class[] arrclass, Object[] arrobject) throws InvocationTargetException {
        UserServiceImpl userServiceImpl;
        try {
            userServiceImpl = (UserServiceImpl)object;
        }
        catch (Throwable throwable) {
            throw new IllegalArgumentException(throwable);
        }
        try {
            if ("findUser".equals(string) && arrclass.length == 1) {
                return userServiceImpl.findUser(((Number)arrobject[0]).intValue());
            }
            if ("listUsers".equals(string) && arrclass.length == 0) {
                return userServiceImpl.listUsers();
            }
            if ("findUserByName".equals(string) && arrclass.length == 1) {
                return userServiceImpl.findUserByName((String)arrobject[0]);
            }
        }
```

### Accessing Spring Context

In addition to the diagnostic techniques introduced above, here's an example of accessing the Spring Context and "doing whatever you want."

In Dubbo, there is an extension `com.alibaba.dubbo.config.spring.extension.SpringExtensionFactory` that saves the Spring Context. Therefore, we can obtain it through the `ognl` command.

```bash
$ ognl '#context=@com.alibaba.dubbo.config.spring.extension.SpringExtensionFactory@contexts.iterator.next, #context.getBean("userServiceImpl").findUser(1)'
@User[
    id=@Integer[1],
    name=@String[Deanna Borer],
]
```

* `SpringExtensionFactory@contexts.iterator.next` gets the spring context object saved in `SpringExtensionFactory`
* `#context.getBean("userServiceImpl").findUser(1)` gets `userServiceImpl` and executes a call

By fully utilizing imagination and combining various commands in Arthas, you can achieve magical effects.

## Summary

This article is derived from a sharing session at the Hangzhou Dubbo Meetup titled "When DUBBO Meets Arthas - Problem Diagnosis in Practice," hoping to assist everyone in diagnosing Dubbo issues online.

The shared PDF can be downloaded from https://github.com/alibaba/arthas/issues/327.

