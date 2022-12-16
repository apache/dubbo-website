---
title: "How to implement a fully asynchronous calls chain based on Dubbo"
linkTitle: "New Async Call"
date: 2018-09-02
description: >
    This article recalls how asynchronous call is implemented in Dubbo 2.6.x, and introduces the new way based on CompletableFuture in 2.7.0.
---


Implementing the full asynchronous programming based on Dubbo, which is a new feature introduced in version 2.7.0 after the enhancement of the existing asynchronous mode.This article first reviews the supported functions and existing problems of asynchronization in 2.6.x and earlier versions, and introduces the targeted enhancements based on CompletableFuture in version 2.7.0. Then, the use of enhanced asynchronous programming is elaborated through several examples. Finally, it summarizes the new problems brought by the introduction of asynchronous mode and corresponding solutions from Dubbo. By reading this article, it is easy to implement a fully asynchronous remote service call chain based on Dubbo 2.7.0+.

## Asynchronous mode before version 2.6.x

Dubbo Provides some asynchronous programming capabilities in 2.6.x and earlier versions, including [Asynchronous Call](/en/docs/v2.7/user/examples/async-call/), [Parameter Callback](/en/docs/v2.7/user/examples/callback-parameter/) and [Event Notification](/en/docs/v2.7/user/examples/events-notify/) on Consumer side. There are some brief introductions to the usage and Demo in the above document links.

But the current asynchronous method has the following problems:

- Methods to access Future object are not direct enough.
- Future interface cannot implement automatic callback. Customized ResponseFuture class could implement callback, however it only supports limited asynchronous scenes. For example, it does not support mutual coordination or combination between Future objects.
- Asynchronization on Provider side is not supported.

Take the asynchronous method of Consumer side as an example:

1. Define a original synchronous interface and add the declaration to support asynchronous calls.

```java
public interface FooService {
    String findFoo(String name);
}
```

```xml
<dubbo:reference id="fooService" interface="com.alibaba.foo.FooService">
      <dubbo:method name="findFoo" async="true" />
</dubbo:reference>
```

2. Obtain Future object through RpcContext.

```java
// this call will return null immediately
fooService.findFoo(fooId);
// Obtain the Future instance. When the result is returned, Future instance will be notified and the result will be set to Future instance.
Future<Foo> fooFuture = RpcContext.getContext().getFuture();
fooFuture.get();
```

or 

```java
// this call will return null immediately
fooService.findFoo(fooId);
// get Dubbo's built-in ResponseFuture, and set the callback
ResponseFuture future = ((FutureAdapter)RpcContext.getContext().getFuture()).getFuture();
future.setCallback(new ResponseCallback() {
    @Override
    public void done(Object response) {
        System.out.print(response);
    }

    @Override
    public void caught(Throwable exception) {
        exception.printStackTrace();
    }
});
```

From this simple example, we can see there are some inconveniences in use:

1. The synchronization interface of findFoo cannot directly return a Future object representing the asynchronous result, which is further obtained through RpcContext.
2. Future object can only be obtained from get method that will block until getting the result.
3. Callback can be set by getting the built-in ResponseFuture interface. However, the API to obtain ResponseFuture is not convenient enough to support other asynchronous scenes except callback. For example, it does not support the scene where multiple Future objects work together.

## Enhancement based on CompletableFuture in version 2.7.0

People who understand the evolution history of Future in Java should know that the Future used in Dubbo 2.6.x and earlier versions is introduced in Java 5, so there are some problems in function design.The CompletableFuture introduced in Java 8 further enriches the Future interface and solves these problems well.

Support for Java 8 has been upgraded in Dubbo 2.7.0, and Dubbo has enhanced the current asynchronous functionality based on CompletableFuture.

1. Now it supports direct definition of service interfaces that return CompletableFuture. Through these interfaces, we can implement asynchronous programming on both Consumer side and Provider side more naturally.

   ```java
   public interface AsyncService {
       CompletableFuture<String> sayHello(String name);
   }
   ```

2. If you don't want to define the return value of the interface as a Future object, or if there is a defined synchronization interface, you can additionally define an asynchronous interface and provide a method to return a Future object.

   ```java
   public interface AsyncService {
       CompletableFuture<String> sayHello(String name);
   }
   ```

   ```java
   @AsyncFor(AsyncService.class)
   public interface GrettingServiceAsync extends GreetingsService {
       CompletableFuture<String> sayHiAsync(String name);
   }
   ```

   In this way, Provider can only implement the sayHi method. The Consumer can get a Future instance by directly calling sayHiAsync, and Dubbo framework will convert it to a call to the sayHi method on the Provider side automatically.
   
   Providing an asynchronous method definition for each synchronization method can be inconvenient. Further, using [Annotation Processor implementation](https://github.com/dubbo/dubbo-async-processor) in the Dubbo ecosystem can automatically generate asynchronous method definitions for us.

3. Similarly, if your original interface definition doesn't return a Future object, the Provider side also provides a programming interface similar to the Async Servlet in Servlet 3.0 to support asynchronization : `RpcContext.startAsync()`.

   ```java
   public interface AsyncService {
       String sayHello(String name);
   }
   ```

   ```java
   public class AsyncServiceImpl implements AsyncService {
       public String sayHello(String name) {
           final AsyncContext asyncContext = RpcContext.startAsync();
           new Thread(() -> {
               asyncContext.write("Hello " + name + ", response from provider.");
           }).start();
           return null;
       }
   }
   ```
   
      
   At the beginning of the method body, it starts asynchronization by running `RpcContext.startAsync()` , and it starts a new thread to execute the business logic asynchronously. After the time-consuming operation is completed, the result is written back by `asyncContext.write`.

4. RpcContext returns CompletableFuture directly.

   ```java
   CompletableFuture<String> f = RpcContext.getContext().getCompletableFuture();
   ```

All of the above enhancements are based on the compatibility with existing asynchronous programming, so asynchronous programs written based on 2.6.x versions can be successfully compiled without any modification.

Next, let's illustrate how to implement a fully asynchronous Dubbo service call chain through a few examples.


## example 1：CompletableFuture interface

CompletableFuture interface can be used both for a synchronous call and for an asynchronous call on Consumer or Provider side. This example implements asynchronous calls between Consumer and Provider sides. Code link [dubbo-samples-async-original-future](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-original-future
).

1. Interface definition

   ```java
   public interface AsyncService {
       CompletableFuture<String> sayHello(String name);
   }
   ```

   

   Note that the return type of this interface is `CompletableFuture<String>`.
   

2. Provider Side

   - Implementation
   
     ```java
     public class AsyncServiceImpl implements AsyncService {
         public CompletableFuture<String> sayHello(String name) {
             return CompletableFuture.supplyAsync(() -> {
                 try {
                     Thread.sleep(5000);
                 } catch (InterruptedException e) {
                     e.printStackTrace();
                 }
                 return "async response from provider.";
             });
         }
     }
     ```

     
     We can see that the business code is switched to be executed in the new thread by supplyAsync, so the Provider side is asynchronous.

   - Config

     

     ```xml
     <bean id="asyncService" class="com.alibaba.dubbo.samples.async.impl.AsyncServiceImpl"/>
     <dubbo:service interface="com.alibaba.dubbo.samples.async.api.AsyncService" ref="asyncService"/>
     ```

     The Config is the same as the original interface.

3. Consumer Side

   

   - Config

   

   ```xml
   <dubbo:reference id="asyncService" timeout="10000" interface="com.alibaba.dubbo.samples.async.api.AsyncService"/>
   ```

   The Config is the same as the original interface.

   - Call remote service

   ```java
   public static void main(String[] args) throws Exception {
           ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"META-INF/spring/async-consumer.xml"});
           context.start();
           final AsyncService asyncService = (AsyncService) context.getBean("asyncService");
       
           CompletableFuture<String> future = asyncService.sayHello("async call request");
           future.whenComplete((v, t) -> {
               if (t != null) {
                   t.printStackTrace();
               } else {
                   System.out.println("Response: " + v);
               }
           });
           System.out.println("Executed before response return.");
           System.in.read();
       }
   ```

   `CompletableFuture<String> future = asyncService.sayHello("async call request");`It is convenient to return the Future instance, which implements the asynchronous service call on the Consumer side.
   
## Example 2：Synchronous interface uses Annotation Processor

This example demonstrates how to implement the Consumer-side asynchronous service call using the Annotation Processor based on the original synchronous interface. Code link [dubbo-samples-async-generated-future](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-generated-future).

1. Interface definition

   ```java
   @DubboAsync
   public interface GreetingsService {
       String sayHi(String name);
   }
   ```

   This is a generic definition of the Dubbo service interface. Note that add the @DubboAsync annotation when using Annotation Processor.
   

   ```xml
   <dependency>
       <groupId>com.alibaba</groupId>
       <artifactId>dubbo-async-processer</artifactId>
       <version>1.0.0-SNAPSHOT</version>
   </dependency>
   <plugin>
       <groupId>org.apache.maven.plugins</groupId>
       <artifactId>maven-compiler-plugin</artifactId>
       <version>3.7.0</version>
       <configuration>
           <source>1.8</source>
           <target>1.8</target>
           <annotationProcessorPaths>
               <path>
                   <groupId>com.alibaba</groupId>
                   <artifactId>dubbo-async-processer</artifactId>
                   <version>1.0.0-SNAPSHOT</version>
               </path>
           </annotationProcessorPaths>
       </configuration>
   </plugin>
   ```

   

   The above config is the Maven dependency that imports dubbo-async-processer processor. Developers who define interfaces (providing APIs) usually add the above dependencies to the project, so that when doing API packaging, the following interface definitions will be automatically generated in APIs:
   

   ```java
   /**
   * Generated by dubbo-async-processer
   */
   package com.alibaba.dubbo.samples.api;
   import java.util.concurrent.CompletableFuture;
   @javax.annotation.Generated("com.alibaba.dubbo.async.processor.AsyncAnnotationProcessor")
   @org.apache.dubbo.common.config.AsyncFor(com.alibaba.dubbo.samples.api.GreetingsService.class)
   public interface GreetingsServiceAsync extends GreetingsService {
   CompletableFuture<java.lang.String> sayHiAsync(java.lang.String name);
   }
   ```

   

   

2. Provider side

   

   - Config

   

   ```xml
   <bean id="greetingsService" class="com.alibaba.dubbo.samples.async.impl.GreetingsServiceImpl"/>
   <dubbo:service interface="com.alibaba.dubbo.samples.api.GreetingsService" ref="greetingsService"/>
   ```

   

   - Service implementation

   

   ```java
   public class GreetingsServiceImpl implements GreetingsService {
       @Override
       public String sayHi(String name) {
           return "hi, " + name;
       }
   }
   ```
   
3. Consumer side

   

   - Config

   

   ```xml
    <dubbo:reference id="greetingsService" interface="com.alibaba.dubbo.samples.api.GreetingsServiceAsync"/>
   ```

   

   Note that the service interface uses **GreetingsServiceAsync**

   

   - Service call

   

   ```java
    public static void main(String[] args) throws Exception {
           ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"META-INF/spring/async-consumer.xml"});
           context.start();
   
           GreetingsServiceAsync greetingsService = (GreetingsServiceAsync) context.getBean("greetingsService");
           CompletableFuture<String> future = greetingsService.sayHiAsync("async call reqeust");
           System.out.println("async call ret :" + future.get());
        
           System.in.read();
       }
   ```

   

   In this way, we can use `CompletableFuture<String> future = greetingsService.sayHiAsync("async call reqeust");` directly，and return CompletableFuture.

## Example 3：Use AsyncContext

This example demonstrates how to implement the Provider-side asynchronous execution through AsyncContext based on the original synchronous interface. Code link [dubbo-samples-async-provider](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-provider).

1. Interface definition

   

   ```java
   public interface AsyncService {
       String sayHello(String name);
   }
   ```

   

   

2. Provider side

   

   - Config

   

   ```xml
   <bean id="asyncService" class="com.alibaba.dubbo.samples.async.impl.AsyncServiceImpl"/>
   <dubbo:service async="true" interface="com.alibaba.dubbo.samples.async.api.AsyncService" ref="asyncService"/>
   ```

   

   Note that adding `async="true"` indicates that this is a service that starts the Provider-side execution asynchronously.

   

   - Asynchronous execution implementation

   

   ```java
   public class AsyncServiceImpl implements AsyncService {
       public String sayHello(String name) {
           final AsyncContext asyncContext = RpcContext.startAsync();
           new Thread(() -> {
               asyncContext.signalContextSwitch();
               try {
                   Thread.sleep(500);
               } catch (InterruptedException e) {
                   e.printStackTrace();
               }
               asyncContext.write("Hello " + name + ", response from provider.");
           }).start();
           return null;
       }
   }
   ```

3. Consumer side

   

   - Config

   

   ```xml
   <dubbo:reference id="asyncService" interface="com.alibaba.dubbo.samples.async.api.AsyncService"/>
   ```

   

   - Service call

   

   ```java
    public static void main(String[] args) throws Exception {
           ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"META-INF/spring/async-consumer.xml"});
           context.start();
   
           AsyncService asyncService = (AsyncService) context.getBean("asyncService");
           System.out.println(asyncService.sayHello("async call request"));
        
           System.in.read();
       }
   ```

## New problems resulted from asynchronization

### Filter Chain

The following is a complete Filter chain for a normal Dubbo call.

After using the asynchronous call, since the asynchronous result is executed separately in the asynchronous thread, the Result passed through the second half of the Filter chain is null, and the real result cannot be processed by the Filter chain when it is returned.

In order to solve this problem, PostProcessFilter and AbstractPostProcessFilter were introduced in Dubbo 2.7.0. The PostProcessFilter interface extends from the Filter interface, and AbstractPostProcessFilter is an abstract implementation of PostProcessFilter.

The following is an example of extending the Filter and supporting the asynchronous Filter chain.

```java
@Activate(group = {Constants.PROVIDER, Constants.CONSUMER})
public class AsyncPostprocessFilter extends AbstractPostProcessFilter {

    @Override
    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        return postProcessResult(invoker.invoke(invocation), invoker, invocation);
    }

    @Override
    protected Result doPostProcess(Result result, Invoker<?> invoker, Invocation invocation) {
        System.out.println("Filter get the return value: " + result.getValue());
        return result;
    }
}
```
   
   
### Context passing

Currently, the context we are considering mainly refers to the data stored in the RpcContext. In most scenarios, the user needs to complete the passing of the Context before switching the service thread.

```java
public class AsyncServiceImpl implements AsyncService {
    // Save the context of the current thread
    RpcContext context = RpcContext.getContext();
    public CompletableFuture<String> sayHello(String name) {
        return CompletableFuture.supplyAsync(() -> {
            // Set context into new thread
            RpcContext.setContext(context);
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "async response from provider.";
        });
    }
}
```

However, AsyncContext also provides the signalContextSwitch() method for a convenient Context switch.

```java
public class AsyncServiceImpl implements AsyncService {
    public String sayHello(String name) {
        final AsyncContext asyncContext = RpcContext.startAsync();
        new Thread(() -> {
            asyncContext.signalContextSwitch();
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            asyncContext.write("Hello " + name + ", response from provider.");
        }).start();
        return null;
    }
}
```

   





   

   




   



   



 
 

