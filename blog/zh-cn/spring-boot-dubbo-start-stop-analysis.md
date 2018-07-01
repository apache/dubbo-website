# Spring-boot+Dubbo应用启停源码分析

### 背景介绍

[Dubbo Spring Boot](https://github.com/apache/incubator-dubbo-spring-boot-project) 工程致力于简化 Dubbo RPC 框架在Spring Boot应用场景的开发。同时也整合了 Spring Boot 特性：

- [自动装配](https://github.com/apache/incubator-dubbo-spring-boot-project/blob/master/dubbo-spring-boot-autoconfigure) (比如： 注解驱动, 自动装配等).
- [Production-Ready](https://github.com/apache/incubator-dubbo-spring-boot-project/blob/master/dubbo-spring-boot-actuator) (比如： 安全, 健康检查, 外部化配置等).

### DubboConsumer启动分析

你有没有想过一个问题？`incubator-dubbo-spring-boot-project`中的`DubboConsumerDemo`应用就一行代码，`main`方法执行完之后，为什么不会直接退出呢？

```java
@SpringBootApplication(scanBasePackages = "com.alibaba.boot.dubbo.demo.consumer.controller")
public class DubboConsumerDemo {

    public static void main(String[] args) {
        SpringApplication.run(DubboConsumerDemo.class,args);
    }

}
```

其实要回答这样一个问题，我们首先需要把这个问题进行一个抽象，即一个JVM进程，在什么情况下会退出？

以Java 8为例，通过查阅JVM语言规范[1]，在12.8章节中有清晰的描述：

A program terminates all its activity and *exits* when one of two things happens:

- All the threads that are not daemon threads terminate.
- Some thread invokes the `exit` method of class `Runtime` or class `System`, and the `exit` operation is not forbidden by the security manager.

也就是说，导致JVM的退出只有2种情况：

1. 所有的非daemon进程完全终止
2. 某个线程调用了`System.exit()`或`Runtime.exit()`

因此针对上面的情况，我们判断，一定是有某个非daemon线程没有退出导致。我们知道，通过jstack可以看到所有的线程信息，包括他们是否是daemon线程，可以通过jstack找出那些是非deamon的线程。

```sh
➜  jstack 57785 | grep tid | grep -v "daemon"
"container-0" #37 prio=5 os_prio=31 tid=0x00007fbe312f5800 nid=0x7103 waiting on condition  [0x0000700010144000]
"container-1" #49 prio=5 os_prio=31 tid=0x00007fbe3117f800 nid=0x7b03 waiting on condition  [0x0000700010859000]
"DestroyJavaVM" #83 prio=5 os_prio=31 tid=0x00007fbe30011000 nid=0x2703 waiting on condition  [0x0000000000000000]
"VM Thread" os_prio=31 tid=0x00007fbe3005e800 nid=0x3703 runnable
"GC Thread#0" os_prio=31 tid=0x00007fbe30013800 nid=0x5403 runnable
"GC Thread#1" os_prio=31 tid=0x00007fbe30021000 nid=0x5303 runnable
"GC Thread#2" os_prio=31 tid=0x00007fbe30021800 nid=0x2d03 runnable
"GC Thread#3" os_prio=31 tid=0x00007fbe30022000 nid=0x2f03 runnable
"G1 Main Marker" os_prio=31 tid=0x00007fbe30040800 nid=0x5203 runnable
"G1 Conc#0" os_prio=31 tid=0x00007fbe30041000 nid=0x4f03 runnable
"G1 Refine#0" os_prio=31 tid=0x00007fbe31044800 nid=0x4e03 runnable
"G1 Refine#1" os_prio=31 tid=0x00007fbe31045800 nid=0x4d03 runnable
"G1 Refine#2" os_prio=31 tid=0x00007fbe31046000 nid=0x4c03 runnable
"G1 Refine#3" os_prio=31 tid=0x00007fbe31047000 nid=0x4b03 runnable
"G1 Young RemSet Sampling" os_prio=31 tid=0x00007fbe31047800 nid=0x3603 runnable
"VM Periodic Task Thread" os_prio=31 tid=0x00007fbe31129000 nid=0x6703 waiting on condition

```

> 此处通过grep tid 找出所有的线程摘要，通过grep -v找出不包含daemon关键字的行

通过上面的结果，我们发现了一些信息：

* 有两个线程`container-0`, `container-1`非常可疑，他们是非daemon线程，处于wait状态
* 有一些GC相关的线程，和VM打头的线程，也是非daemon线程，但他们很有可能是JVM自己的线程，在此暂时忽略。

综上，我们可以推断，很可能是因为`container-0`和`container-1`导致JVM没有退出。现在我们通过源码，搜索一下到底是谁创建的这两个线程。

通过对spring-boot的源码分析，我们在`org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainer`的`startDaemonAwaitThread`找到了如下代码

```java
	private void startDaemonAwaitThread() {
		Thread awaitThread = new Thread("container-" + (containerCounter.get())) {

			@Override
			public void run() {
				TomcatEmbeddedServletContainer.this.tomcat.getServer().await();
			}

		};
		awaitThread.setContextClassLoader(getClass().getClassLoader());
		awaitThread.setDaemon(false);
		awaitThread.start();
	}
```

在这个方法加个断点，看下调用堆栈：

```
initialize:115, TomcatEmbeddedServletContainer (org.springframework.boot.context.embedded.tomcat)
<init>:84, TomcatEmbeddedServletContainer (org.springframework.boot.context.embedded.tomcat)
getTomcatEmbeddedServletContainer:554, TomcatEmbeddedServletContainerFactory (org.springframework.boot.context.embedded.tomcat)
getEmbeddedServletContainer:179, TomcatEmbeddedServletContainerFactory (org.springframework.boot.context.embedded.tomcat)
createEmbeddedServletContainer:164, EmbeddedWebApplicationContext (org.springframework.boot.context.embedded)
onRefresh:134, EmbeddedWebApplicationContext (org.springframework.boot.context.embedded)
refresh:537, AbstractApplicationContext (org.springframework.context.support)
refresh:122, EmbeddedWebApplicationContext (org.springframework.boot.context.embedded)
refresh:693, SpringApplication (org.springframework.boot)
refreshContext:360, SpringApplication (org.springframework.boot)
run:303, SpringApplication (org.springframework.boot)
run:1118, SpringApplication (org.springframework.boot)
run:1107, SpringApplication (org.springframework.boot)
main:35, DubboConsumerDemo (com.alibaba.boot.dubbo.demo.consumer.bootstrap)
```

可以看到，spring-boot应用在启动的过程中，由于默认启动了Tomcat暴露HTTP服务，所以执行到了上述方法，而Tomcat启动的所有的线程，默认都是daemon线程，例如监听请求的Acceptor，工作线程池等等，如果这里不加控制的话，启动完成之后JVM也会退出。因此需要显示的启动一个线程，在某个条件下进行持续等待，从而避免线程退出。

下面我们在深挖一下，在Tomcat的`this.tomcat.getServer().await()`这个方法中，线程是如何实现不退出的。这里为了阅读方便，去掉了不相关的代码。

```java
public void await() {
    	// ...
        if( port==-1 ) {
            try {
                awaitThread = Thread.currentThread();
                while(!stopAwait) {
                    try {
                        Thread.sleep( 10000 );
                    } catch( InterruptedException ex ) {
                        // continue and check the flag
                    }
                }
            } finally {
                awaitThread = null;
            }
            return;
        }
		// ...
    }
```

在await方法中，实际上当前线程在一个while循环中每10秒检查一次 `stopAwait`这个变量，它是一个`volatile`类型变量，用于确保被另一个线程修改后，当前线程能够立即看到这个变化。如果没有变化，就会一直处于while循环中。这就是该线程不退出的原因，也就是整个spring-boot应用不退出的原因。

因为Springboot应用同时启动了8080和8081(management port)两个端口，实际是启动了两个Tomcat，因此会有两个线程`container-0`和`container-1`。

接下来，我们再看看，这个Spring-boot应用又是如何退出的呢？

### DubboConsumer退出分析

在前面的描述中提到，有一个线程持续的在检查`stopAwait`这个变量，那么我们自然想到，在Stop的时候，应该会有一个线程去修改`stopAwait`，打破这个while循环，那又是谁在修改这个变量呢？

通过对源码分析，可以看到只有一个方法修改了`stopAwait`,即`org.apache.catalina.core.StandardServer#stopAwait`，我们在此处加个断点，看看是谁在调用。

> 注意，当我们在Intellij IDEA的Debug模式，加上一个断点后，需要在命令行下使用`kill -s INT $PID`或者`kill -s TERM $PID`才能触发断点，点击IDE上的Stop按钮，不会触发断点。这是IDEA的bug

可以看到有一个名为`Thread-3`的线程调用了该方法：

```java
stopAwait:390, StandardServer (org.apache.catalina.core)
stopInternal:819, StandardServer (org.apache.catalina.core)
stop:226, LifecycleBase (org.apache.catalina.util)
stop:377, Tomcat (org.apache.catalina.startup)
stopTomcat:241, TomcatEmbeddedServletContainer (org.springframework.boot.context.embedded.tomcat)
stop:295, TomcatEmbeddedServletContainer (org.springframework.boot.context.embedded.tomcat)
stopAndReleaseEmbeddedServletContainer:306, EmbeddedWebApplicationContext (org.springframework.boot.context.embedded)
onClose:155, EmbeddedWebApplicationContext (org.springframework.boot.context.embedded)
doClose:1014, AbstractApplicationContext (org.springframework.context.support)
run:929, AbstractApplicationContext$2 (org.springframework.context.support)
```

通过源码分析，原来是通过Spring注册的`ShutdownHook`来执行的

```java
	@Override
	public void registerShutdownHook() {
		if (this.shutdownHook == null) {
			// No shutdown hook registered yet.
			this.shutdownHook = new Thread() {
				@Override
				public void run() {
					synchronized (startupShutdownMonitor) {
						doClose();
					}
				}
			};
			Runtime.getRuntime().addShutdownHook(this.shutdownHook);
		}
	}
```

通过查阅Java的API文档[2], 我们可以知道ShutdownHook将在下面两种情况下执行

> The Java virtual machine *shuts down* in response to two kinds of events:
>
> - The program *exits* normally, when the last non-daemon thread exits or when the `exit` (equivalently, [`System.exit`](https://docs.oracle.com/javase/8/docs/api/java/lang/System.html#exit-int-)) method is invoked, or
> - The virtual machine is *terminated* in response to a user interrupt, such as typing `^C`, or a system-wide event, such as user logoff or system shutdown.

1. 调用了System.exit()方法
2. 响应外部的信号，例如Ctrl+C（其实发送的是SIGINT信号），或者是`SIGTERM`信号（默认`kill $PID`发送的是`SIGTERM`信号）

因此，正常的应用在停止过程中(`kill -9 $PID`除外)，都会执行上述ShutdownHook，它的作用不仅仅是关闭tomcat，还有进行其他的清理工作，在此不再赘述。

### 总结

1. 在`DubboConsumer`启动的过程中，通过启动一个独立的非daemon线程循环检查变量的状态，确保进程不退出
2. 在`DubboConsumer`停止的过程中，通过执行spring容器的shutdownhook，修改了变量的状态，使得程序正常退出

### 问题

在DubboProvider的例子中，我们看到Provider并没有启动Tomcat提供HTTP服务，那又是如何实现不退出的呢？我们将在下一篇文章中回答这个问题。

#### 彩蛋

在` Intellij IDEA`中运行了如下的单元测试，创建一个线程执行睡眠1000秒的操作，我们惊奇的发现，代码并没有线程执行完就退出了，这又是为什么呢？（被创建的线程是非daemon线程）

```java
    @Test
    public void test() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(1000000);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }
```



[1] https://docs.oracle.com/javase/specs/jls/se8/html/jls-12.html#jls-12.8

[2] https://docs.oracle.com/javase/8/docs/api/java/lang/Runtime.html#addShutdownHook