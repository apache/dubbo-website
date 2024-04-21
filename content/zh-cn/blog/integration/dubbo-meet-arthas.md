---
title: "当Dubbo遇上Arthas：排查问题的实践"
linkTitle: "当Dubbo遇上Arthas：排查问题的实践"
date: 2019-02-02
tags: ["生态", "Java"]
description: >
    使用Alibaba开源的应用诊断利器Arthas来排查Dubbo应用的问题。
---



Apache Dubbo是Alibaba开源的高性能RPC框架，在国内有非常多的用户。

* Github: https://github.com/apache/dubbo
* 文档：http://dubbo.apache.org/zh-cn/

Arthas是Alibaba开源的应用诊断利器，9月份开源以来，Github Star数三个月超过6000。

* Github: https://github.com/alibaba/arthas
* 文档：https://arthas.aliyun.com/doc/
* Arthas开源交流QQ群: 916328269
* Arthas开源交流钉钉群: 21965291

当Dubbo遇上Arthas，会碰撞出什么样的火花呢？下面来分享Arthas排查Dubbo问题的一些经验。

### dubbo-arthas-demo

下面的排查分享基于这个`dubbo-arthas-demo`，非常简单的一个应用，浏览器请求从Spring MVC到Dubbo Client，再发送到Dubbo Server。

Demo里有两个spring boot应用，可以先启动`server-demo`，再启动`client-demo`。

* https://github.com/hengyunabc/dubbo-arthas-demo

```
  /user/{id}    ->   UserService    ->   UserServiceImpl 
   Browser           Dubbo Client          Dubbo Server
```

Client端：

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

Server端：

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

### Arthas快速开始

* https://arthas.aliyun.com/doc/install-detail.html

```bash
$ wget https://arthas.aliyun.com/arthas-boot.jar
$ java -jar arthas-boot.jar
```

启动后，会列出所有的java进程，选择1，然后回车，就会连接上`ServerDemoApplication`

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


### Dubbo线上服务抛出异常，怎么获取调用参数？

* https://arthas.aliyun.com/doc/watch.html

当线上服务抛出异常时，最着急的是什么参数导致了抛异常？

在demo里，访问 http://localhost:8080/user/0 ，`UserServiceImpl`就会抛出一个异常，因为user id不合法。

在Arthas里执行 `watch com.example.UserService * -e -x 2 '{params,throwExp}'` ，然后再次访问，就可以看到watch命令把参数和异常都打印出来了。

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

### 怎样线上调试Dubbo服务代码?

* https://arthas.aliyun.com/doc/redefine.html

在本地开发时，可能会用到热部署工具，直接改代码，不需要重启应用。但是在线上环境，有没有办法直接动态调试代码？比如增加日志。

在Arthas里，可以通过`redefine`命令来达到线上不重启，动态更新代码的效果。

比如我们修改下`UserServiceImpl`，用`System.out`打印出具体的`User`对象来：

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

本地编绎后，把`server-demo/target/classes/com/example/UserServiceImpl.class`传到线上服务器，然后用`redefine`命令来更新代码：

```
$ redefine -p /tmp/UserServiceImpl.class
redefine success, size: 1
```

这样子更新成功之后，访问 http://localhost:8080/user/1 ，在`ServerDemoApplication`的控制台里就可以看到打印出了user信息。

### 怎样动态修改Dubbo的logger级别?

* https://arthas.aliyun.com/doc/ognl.html
* https://arthas.aliyun.com/doc/sc.html
* https://commons.apache.org/dormant/commons-ognl/language-guide.html

在排查问题时，需要查看到更多的信息，如果可以把logger级别修改为`DEBUG`，就非常有帮助。

`ognl`是apache开源的一个轻量级表达式引擎。下面通过Arthas里的`ognl`命令来动态修改logger级别。

首先获取Dubbo里`TraceFilter`的一个logger对象，看下它的实现类，可以发现是log4j。

```bash
$ ognl '@com.alibaba.dubbo.rpc.protocol.dubbo.filter.TraceFilter@logger.logger'
@Log4jLogger[
    FQCN=@String[com.alibaba.dubbo.common.logger.support.FailsafeLogger],
    logger=@Logger[org.apache.log4j.Logger@2f19bdcf],
]
```

再用`sc`命令来查看具体从哪个jar包里加载的：

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

**可以看到log4j是通过slf4j代理的。**

那么通过`org.slf4j.LoggerFactory`获取`root` logger，再修改它的level：

```
$ ognl '@org.slf4j.LoggerFactory@getLogger("root").setLevel(@ch.qos.logback.classic.Level@DEBUG)'
null
$ ognl '@org.slf4j.LoggerFactory@getLogger("root").getLevel().toString()'
@String[DEBUG]
```
可以看到修改之后，`root` logger的level变为`DEBUG`。

### 怎样减少测试小姐姐重复发请求的麻烦?

* https://arthas.aliyun.com/doc/tt.html

在平时开发时，可能需要测试小姐姐发请求过来联调，但是我们在debug时，可能不小心直接跳过去了。这样子就尴尬了，需要测试小姐姐再发请求过来。

Arthas里提供了`tt`命令，可以减少这种麻烦，可以直接重放请求。

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

上面的`tt -t`命令捕获到了3个请求。然后通过`tt --play`可以重放请求：

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

### Dubbo运行时有哪些Filter? 耗时是多少?

* https://arthas.aliyun.com/doc/trace.html

Dubbo运行时会加载很多的Filter，那么一个请求会经过哪些Filter处理，Filter里的耗时又是多少呢？

通过Arthas的`trace`命令，可以很方便地知道Filter的信息，可以看到详细的调用栈和耗时。

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

### Dubbo动态代理是怎样实现的?

* https://arthas.aliyun.com/doc/jad.html
* com.alibaba.dubbo.common.bytecode.Wrapper

通过Arthas的`jad`命令，可以看到Dubbo通过javaassist动态生成的Wrappr类的代码：

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

### 获取Spring context

除了上面介绍的一些排查技巧，下面分享一个获取Spring Context，然后“为所欲为”的例子。

在Dubbo里有一个扩展`com.alibaba.dubbo.config.spring.extension.SpringExtensionFactory`，把Spring Context保存到了里面。
因此，我们可以通过`ognl`命令获取到。

```bash
$ ognl '#context=@com.alibaba.dubbo.config.spring.extension.SpringExtensionFactory@contexts.iterator.next, #context.getBean("userServiceImpl").findUser(1)'
@User[
    id=@Integer[1],
    name=@String[Deanna Borer],
]
```

* `SpringExtensionFactory@contexts.iterator.next` 获取到`SpringExtensionFactory`里保存的spring context对象
* `#context.getBean("userServiceImpl").findUser(1)` 获取到`userServiceImpl`再执行一次调用

只要充分发挥想像力，组合Arthas里的各种命令，可以发挥出神奇的效果。

## 总结

本篇文章来自杭州Dubbo Meetup的分享《当DUBBO遇上Arthas - 排查问题的实践》，希望对大家线上排查Dubbo问题有帮助。

分享的PDF可以在 https://github.com/alibaba/arthas/issues/327 里下载。
