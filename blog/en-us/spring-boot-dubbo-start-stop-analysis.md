# Source code analysis of spring-boot+Dubbo App start and stop

### Introduction

[Dubbo Spring Boot](https://github.com/apache/incubator-dubbo-spring-boot-project) project is dedicated to simplifying the development of the Dubbo RPC framework in the Spring Boot application. It also integrates the feature of Spring Boot:

- [Autoconfigure](https://github.com/apache/incubator-dubbo-spring-boot-project/blob/master/dubbo-spring-boot-autoconfigure) (ex: Annotation driver, Autoconfigure, etc.)
- [Production-Ready](https://github.com/apache/incubator-dubbo-spring-boot-project/blob/master/dubbo-spring-boot-actuator) (ex: Security, Healthy check, Externalize configuration, etc.)

### The analysis of DubboConsumer startup

Have you ever thought about a problem? `DubboConsumerDemo` application in `incubator-dubbo-spring-boot-project` just have one line of code, why not exit directly when the `main` method is executed?

```java
@SpringBootApplication(scanBasePackages = "com.alibaba.boot.dubbo.demo.consumer.controller")
public class DubboConsumerDemo {

    public static void main(String[] args) {
        SpringApplication.run(DubboConsumerDemo.class,args);
    }

}
```

In fact, if you want to answer such a question. We need to abstract this problem firstly, that is, a JVM process, under what circumstances will it exit?

Take Java 8 as an example. By referring to the JVM language specification[1], there is a clear description in Section 12.8:

A program terminates all its activity and *exits* when one of two things happens:

- All the threads that are not daemon threads terminate.
- Some thread invokes the `exit` method of class `Runtime` or class `System`, and the `exit` operation is not forbidden by the security manager.

Therefore, in view of the above situation, we judge that there must be some non-daemon thread not exiting. All thread information can be seen by `jstack`, including whether they are daemon threads, and `jstack` can be used to find out which threads are non-deamon.

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

> We can find all the thread digests by `grep tid` here, and find the line that doesn't contain the daemon keyword by `grep -v` command.

We can get some information by the above results:

- There are two threads `container-0`, `container-1` is very suspicious, Ther are non-daemon threads in wait state.
- There are alse some threads about GC, and threads that start with `VM`, They are also non-daemon threads, but they are most likely the JVM's own threads, which are ignored here.

In summary, we can infer that it is likely that the `container-0` and `container-1` cause the JVM to not exit. Now let's search through the source code to find out who created the two threads.

By the source code analysis of Spring-boot, we can find these code on `org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainer`'s `startDaemonAwaitThread`.

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

Let's add a breakpoint in this method, and focus on the call stack:

```plain
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

It can be seen that during the startup process of the Spring-boot application, the above method is executed since the Tomcat exposes the HTTP service by default, and all threads started by Tomcat are daemon threads by default, such as the Acceptor of the listening request, working thread pool etc.The JVM will also exit after the startup is completed if there is no control here. Therefore, it is necessary to explicitly start a thread and continue to wait under certain conditions. We can avoid thread exit by this way.

Let's dig deeper. In Tomcat's `this.tomcat.getServer().await()` method, how the thread doesn‘t exit. The irrelevant code is removed here for the convenience of reading.

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

In the await method, the current thread checks the variable `stopAwait` every 10 seconds in a while loop. It is a `volatile` variable that is used to ensure that the current thread can see the change immediately after being modified by another thread. If there is no change, it will always be in the while loop. This is why the thread does not exit, which is why the entire Spring-boot application doesn't exit.

Because Spring-boot application enable 2 port that 8080 and 8081(management port) at the same time. Two Tomcat are startup actually, so there are two threads that `container-0` and `container-1`.

Then, let's see how this Spring-boot application exits.

### The analysis of DubboConsumer exit

As mentioned in the previous description, there is a thread that checks the variable `stopAwait` continuously. Then we can think that should be a thread to modify `stopAwait` at Stop, it can break the while loop. So, who is modifying this variable?

By analyzing the source code, you can see that there is only one way to modify `stopAwait`, in `org.apache.catalina.core.StandardServer#stopAwait`, we add a breakpoint here to see who is calling.

> Note that when we add a breakpoint in Intellij IDEA's Debug mode, we need to use `kill -s INT $PID` or `kill -s TERM $PID` on command line to trigger the breakpoint. The breakpoint will not be trigger if you just click the stop button on the IDE.

You can see the method is called by a thread called `Thread-3`:

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

Through source code analysis, it was executed by Spring's registered `ShutdownHook`.

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

We found that ShutdownHook will execute in the following two cases by referring the Java API documentation[2].

> The Java virtual machine *shuts down* in response to two kinds of events:
>
> - The program *exits* normally, when the last non-daemon thread exits or when the `exit` (equivalently, [`System.exit`](https://docs.oracle.com/javase/8/docs/api/java/lang/System.html#exit-int-)) method is invoked, or
> - The virtual machine is *terminated* in response to a user interrupt, such as typing `^C`, or a system-wide event, such as user logoff or system shutdown.

1. call System.exit()
2. Respond to external signals, such as Ctrl+C(actually sent as SIGINT signal), or `SIGTERM` signal (`kill $PID` will send `SIGTERM` signal by default)

Therefore, the normal application will execute the above ShutdownHook during the stop process (except `kill -9 $PID`). Its function is not only to close the Tomcat, but also to perform other cleanup work, it is unnecessary to go into details.

### Summary

1. Make sure the process can't be exited by start a independency non-daemon thread loop to check the status of variable while `DubboConsumer`startup.
2. Change the status of variable to make program exit normaly by execute ShutdownHook while `DubboConsumer` exit.

### Problems

In the example of DubboProvider, we see that Provider doesn't start Tomcat to provide HTTP service, then how to achieve it without exiting? We will answer this question in the next article.

#### Easter Eggs/Extra/Bonus/Surprise(?)

Run the following unit test in `Intellij IDEA`, create a thread to perform sleep 1000 seconds of operation, we are surprised to find that the code does not exit after the thread is executed, why is this? (The thread being created is a non-daemon thread)

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
