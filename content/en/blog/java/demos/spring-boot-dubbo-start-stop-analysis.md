---
title: "Source Code Analysis of Starting and Stopping Spring Boot Dubbo Applications"
linkTitle: "Source Code Analysis of Starting and Stopping Spring Boot Dubbo Applications"
tags: ["Java"]
date: 2018-08-14
description: >
    This article analyzes the implementation principles of Dubbo starting and stopping source code in the `dubbo-spring-boot-project`.
---

## Background Introduction

The [Dubbo Spring Boot](https://github.com/apache/dubbo-spring-boot-project) project aims to simplify the development of the Dubbo RPC framework in Spring Boot application scenarios. It also integrates Spring Boot features:

- [Auto-configuration](https://github.com/apache/dubbo-spring-boot-project/blob/master/dubbo-spring-boot-autoconfigure) (e.g., annotation-driven, auto-configuration, etc.).
- [Production-Ready](https://github.com/apache/dubbo-spring-boot-project/blob/master/dubbo-spring-boot-actuator) (e.g., security, health checks, externalized configuration, etc.).

## DubboConsumer Startup Analysis

Have you ever wondered about a question? In the `dubbo-spring-boot-project`, the `DubboConsumerDemo` application has just one line of code, why does it not exit immediately after executing the `main` method?

```java
@SpringBootApplication(scanBasePackages = "com.alibaba.boot.dubbo.demo.consumer.controller")
public class DubboConsumerDemo {

    public static void main(String[] args) {
        SpringApplication.run(DubboConsumerDemo.class,args);
    }

}
```

To answer this question, we first need to abstract it: under what conditions does a JVM process exit?

Taking Java 8 as an example, a clear description can be found in section 12.8 of the JVM language specification [1]:

A program terminates all its activity and *exits* when one of two things happens:

- All the threads that are not daemon threads terminate.
- Some thread invokes the `exit` method of class `Runtime` or class `System`, and the `exit` operation is not forbidden by the security manager.

This means that there are only two situations that cause the JVM to exit:

1. All non-daemon processes are completely terminated.
2. Some thread calls `System.exit()` or `Runtime.exit()`. 

Thus, we judge that there is definitely a non-daemon thread that has not exited. We can see all thread information, including whether they are daemon threads, using jstack.

```sh
➜  jstack 57785 | grep tid | grep -v "daemon"
"container-0" #37 prio=5 os_prio=31 tid=0x00007fbe312f5800 nid=0x7103 waiting on condition  [0x0000700010144000]
"container-1" #49 prio=5 os_prio=31 tid=0x00007fbe3117f800 nid=0x7b03 waiting on condition  [0x0000700010859000]
...
```

> Here, we found all thread summaries by grepping tid and excluded daemon threads using grep -v.

From the above results, we discovered some information:

* Two threads, `container-0` and `container-1`, are non-daemon threads and are in a wait state.
* There are some GC-related threads and VM threads, but they are likely JVM internal threads and can be ignored for now.

Therefore, we can infer that it is most likely due to `container-0` and `container-1` that the JVM does not exit. 

Now, let's use the source code to search for who created these two threads.

By analyzing the `spring-boot` source code, we found the following code in `org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainer`'s `startDaemonAwaitThread`:

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

In this method, we can see that during the startup of the Spring Boot application, Tomcat is started by default to expose the HTTP service, therefore executing this method. All threads started by Tomcat are daemons by default. Hence, a separate non-daemon thread is explicitly started to continually wait under certain conditions, preventing exit.

Next, let's delve into how this behavior of ‘not exiting’ is implemented in the method `this.tomcat.getServer().await()`. 

```java
public void await() {
    	// ...
        if(port==-1) {
            try {
                awaitThread = Thread.currentThread();
                while(!stopAwait) {
                    try {
                        Thread.sleep(10000);
                    } catch(InterruptedException ex) {
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

In the `await` method, the current thread enters a while loop that checks the `stopAwait` variable every 10 seconds. This is a `volatile` variable, ensuring that if another thread modifies it, the current thread can immediately see the change. If there’s no change, it will remain in the loop, which explains why the thread does not exit and, consequently, why the entire Spring Boot application does not exit.

Since the Spring Boot application starts both port 8080 and port 8081 (management port), it actually starts two Tomcats, hence the two threads `container-0` and `container-1`.

Now, let’s see how this Spring Boot application exits.

## DubboConsumer Exit Analysis

In previous sections, it was mentioned that a thread continuously checks the `stopAwait` variable. Naturally, we think that during stop, a thread should modify `stopAwait`, breaking this while loop. So who modifies this variable?

Through source code analysis, we find that only one method modifies `stopAwait`, which is `org.apache.catalina.core.StandardServer#stopAwait`. Let's set a breakpoint there and see who calls it.

> Note: When we set a breakpoint in Intellij IDEA in debug mode, we need to use `kill -s INT $PID` or `kill -s TERM $PID` in the command line to trigger the breakpoint. Clicking the Stop button on the IDE will not trigger the breakpoint; this is a bug with IDEA.

It turns out that a thread named `Thread-3` calls this method:

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

Through the source code analysis, it turns out that this is executed via a `ShutdownHook` registered by Spring:

```java
	@Override
	public void registerShutdownHook() {
		if (this.shutdownHook == null) {
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

From Java's API documentation [2], we know that the ShutdownHook will be executed in the following two scenarios:

> The Java virtual machine *shuts down* in response to two kinds of events:
>
> - The program *exits* normally, when the last non-daemon thread exits or when the `exit` (equivalently, [`System.exit`](https://docs.oracle.com/javase/8/docs/api/java/lang/System.html#exit-int-)) method is invoked, or
> - The virtual machine is *terminated* in response to a user interrupt, such as typing `^C`, or a system-wide event, such as user logoff or system shutdown.

1. When the `System.exit()` method is invoked.
2. In response to external signals, such as Ctrl+C (which sends the SIGINT signal) or the SIGTERM signal (the default `kill $PID` sends the SIGTERM signal).

Therefore, during the normal shutdown process (excluding `kill -9 $PID`), the aforementioned ShutdownHook executes, performing not only the shutdown of Tomcat but also other cleanup tasks that will not be elaborated on here.

## Summary

1. During the startup of `DubboConsumer`, a separate non-daemon thread is started to continuously check the state of a variable, ensuring the process does not exit.
2. During the shutdown of `DubboConsumer`, the Spring container’s shutdown hook modifies the state of the variable, allowing the program to exit normally.

## Questions

In the example of DubboProvider, we see that the Provider does not start Tomcat to provide HTTP services. So how does it implement not exiting? We will answer this question in the next article.

### Easter Egg

In `Intellij IDEA`, by running the following unit test, creating a thread that sleeps for 1000 seconds, we were surprised to find that the code does not exit even after the thread completes, why is that? (The created thread is a non-daemon thread)

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

