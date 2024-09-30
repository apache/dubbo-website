---
title: "How to Implement Fully Asynchronous Call Chains Based on Dubbo"
linkTitle: "How to Implement Fully Asynchronous Call Chains Based on Dubbo"
tags: ["Java"]
date: 2018-09-02
description: >
    This article reviews the asynchronous implementation in version 2.6.x, and introduces the improvements made in version 2.7.0 based on CompletableFuture.
---

Implementing fully asynchronous programming based on Dubbo is a new feature introduced in version 2.7.0 after enhancing the existing asynchronous methods. This article first reviews the asynchronous support and issues in versions 2.6.x and earlier, then highlights the targeted enhancements made in version 2.7.0 based on CompletableFuture. It elaborates on the usage of the enhanced asynchronous programming through several examples, and finally summarizes the new problems introduced by adopting the asynchronous model and Dubbo's solutions to them. By reading this article, you can easily implement a fully asynchronous remote service call chain using Dubbo 2.7.0+.

Starting from version 3.0.0, the Dubbo framework provides support for the Reactive programming paradigm. Besides programming interfaces, Reactive semantics have been introduced in inter-process RPC communication. If your environment requires the Reactive programming paradigm or your RPC calls need to support streaming, Reactive should help you. For more information, please refer to the articles on Reactive programming support published on Alibaba Middleware's official account. 
> Note: You may not always need Reactive semantics, especially in RPC scenarios. CompletableFuture itself can also provide a Reactive-style programming model. Before choosing Reactive (such as RxJava or Reactor) over the more easily understood and utilized CompletableFuture, please consider the following questions:
> 1. Are your request/response transmissions one-off or streaming? A clear indicator is whether your defined data type is `List<String>` or `Stream<String>`.
> 2. Is your RPC request required to be Cold, i.e., triggered after subscription, since CompletableFuture is always hot?
> 3. Are Reactive programming interfaces already widely used in your programming context?
> 4. Do you need the richer operators provided by the Rx framework, which closely relates to point 1 above? 
                                                                                                                        


## Asynchronous Methods Before Version 2.6.x

In versions 2.6.x and earlier, certain asynchronous programming capabilities were provided, including Consumer-side [asynchronous calls](/en/docsv2.7/user/examples/async-call/), [parameter callbacks](/en/docsv2.7/user/examples/callback-parameter/), [event notifications](/en/docsv2.7/user/examples/events-notify/), etc. The above documentation links provide a brief introduction and demo on usage.

Regarding parameter callbacks, it essentially serves as a data-pushing capability from the server-side, a common requirement for terminal applications. The restructuring plan for this part is beyond the scope of this article.

However, the current asynchronous methods present the following issues:

- The way to obtain Future is not straightforward.
- The Future interface cannot achieve automatic callbacks, while custom ResponseFuture supports callbacks but only for limited asynchronous scenarios, such as not supporting interactions or combinations between Futures, etc.
- Does not support asynchronous operations on the Provider side.

Taking the Consumer's asynchronous usage as an example:

1. Define a normal synchronous interface and declare support for asynchronous calls

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

2. Obtain Future via RpcContext

```java
// This call will immediately return null
fooService.findFoo(fooId);
// Obtain the Future reference; when the result returns, it will be notified and set to this Future
Future<Foo> fooFuture = RpcContext.getContext().getFuture();
fooFuture.get();
```

or

```java
// This call will immediately return null
fooService.findFoo(fooId);
// Obtain the built-in ResponseFuture from Dubbo and set a callback
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

From this simple example, we can observe some inconveniences in usage:

1. The synchronous interface findFoo cannot directly return the Future representing the asynchronous result but needs further retrieval through RpcContext.
2. Future only supports blocking get() for retrieving results.
3. By obtaining the built-in ResponseFuture interface, a callback can be set. However, the API for obtaining ResponseFuture is inconvenient, and it only supports setting callbacks while other asynchronous scenarios, such as multiple Futures collaborating, are unsupported.

## Enhancements Based on CompletableFuture in Version 2.7.0

For those familiar with the evolution history of Future in Java, it should be noted that, the Future used in versions 2.6.x and earlier was introduced in Java 5, which led to the above design issues. In contrast, the CompletableFuture introduced in Java 8 significantly enriches the Future interface and addresses these problems effectively.

Dubbo has upgraded its support for Java 8 in version 2.7.0 while enhancing the current asynchronous functionality based on CompletableFuture.

1. Support for defining service interfaces that directly return CompletableFuture. Through this type of interface, we can more naturally implement asynchronous programming on the Consumer and Provider sides.

```java
public interface AsyncService {
    CompletableFuture<String> sayHello(String name);
}
```

2. If you do not want to define the return value of your interface as a Future type, or if you have an already defined synchronous type interface, you can choose to overload the original method and define the return value as CompletableFuture for the new method.

```java
public interface GreetingsService {
    String sayHi(String name);
}
```

```java
public interface GreetingsService {
    String sayHi(String name);
    // To ensure the service governance rules at the method level remain valid, it is recommended to keep the method name unchanged: sayHi
    // Use default implementation to avoid additional implementation cost for service providers
    // boolean placeHolder is added only for overload; you may use any method overloading technique as long as Java syntax permits
    default CompletableFuture<String> sayHi(String name, boolean placeHolder) {
        return CompletableFuture.completedFuture(sayHello(name));
    }
}
```

In this way, the Provider can still only implement the sayHi method, while the Consumer can obtain a Future instance by directly calling the newly added overloaded sayHi method.

3. If your original interface definition is synchronous, and you want to implement asynchronous functionality on the Provider side, you can use AsyncContext (a programming interface similar to AsyncContext in Servlet 3.0).

> Note: For interfaces already with CompletableFuture return types, it is not advised to use AsyncContext. Please directly leverage the asynchronous capabilities provided by CompletableFuture.

```
public interface AsyncService {
    String sayHello(String name);
}
```

```
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

At the beginning of the method body, `RpcContext.startAsync()` starts the asynchronous process and executes the business logic in a new thread. After the time-consuming operation is completed, the result is written back using `asyncContext.write`.

4. RpcContext directly returns CompletableFuture

```
CompletableFuture<String> f = RpcContext.getContext().getCompletableFuture();
```

All of the above enhancements are made on the basis of maintaining compatibility with existing asynchronous programming, so asynchronous programs written based on version 2.6.x can compile successfully without any modifications.

Next, let's see through several examples how to achieve a fully asynchronous Dubbo service call chain.

## Example 1: CompletableFuture Type Interface

A CompletableFuture type interface can be used for both synchronous calls and asynchronous calls from Consumer or Provider. This example implements asynchronous calls on both the Consumer and Provider sides; see the code at [dubbo-samples-async-original-future](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-original-future).

1. Define the interface

```java
public interface AsyncService {
    CompletableFuture<String> sayHello(String name);
}
```

Note that the return type of the interface is `CompletableFuture<String>`.

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

     Here, it is evident that by using supplyAsync, the business code is switched to execute in a new thread, thus achieving asynchronous functionality on the Provider side.

   - Configuration

     ```xml
     <bean id="asyncService" class="com.alibaba.dubbo.samples.async.impl.AsyncServiceImpl"/>
     <dubbo:service interface="com.alibaba.dubbo.samples.async.api.AsyncService" ref="asyncService"/>
     ```

     The configuration method is the same as for a normal interface.

3. Consumer Side

   - Configuration

   ```xml
   <dubbo:reference id="asyncService" timeout="10000" interface="com.alibaba.dubbo.samples.async.api.AsyncService"/>
   ```
   The configuration method is the same as for a normal interface.

   - Call the remote service

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

   `CompletableFuture<String> future = asyncService.sayHello("async call request");` naturally returns a Future instance, thus achieving asynchronous service calls on the Consumer side.

## Example 2: Overloading Synchronous Interface

This example demonstrates how to implement asynchronous calls on the consumer side through adding overload methods based on synchronous interfaces; see the code at [dubbo-samples-async-generated-future](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-generated-future).

1. Define the interface

   ```java
   @DubboAsync
   public interface GreetingsService {
       String sayHi(String name);
   }
   ```

   Modify the interface by adding an overload method

    ```java
    public interface GreetingsService {
        String sayHi(String name);
      
        default CompletableFuture<String> sayHi(String name, boolean isAsync) {
          return CompletableFuture.completedFuture(sayHello(name));
        }
    }
    ```

2. Provider Side

   - Configuration

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

3. Consumer Side

   - Configuration

   ```xml
    <dubbo:reference id="greetingsService" interface="com.alibaba.dubbo.samples.api.GreetingsService"/>
   ```

   - Call the service

   ```java
    public static void main(String[] args) throws Exception {
           ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"META-INF/spring/async-consumer.xml"});
           context.start();
   
           GreetingsService greetingsService = (GreetingsService) context.getBean("greetingsService");
           CompletableFuture<String> future = greetingsService.sayHi("async call reqeust", true);
           System.out.println("async call ret :" + future.get());
        
           System.in.read();
       }
   ```

   Thus, we can directly use `CompletableFuture<String> future = greetingsService.sayHi("async call reqeust", true);`, returning CompletableFuture directly.

## Example 3: Using AsyncContext

This example demonstrates how to achieve asynchronous execution on the Provider side through AsyncContext based on synchronous interfaces. See the example code at [dubbo-samples-async-provider](https://github.com/apache/dubbo-samples/tree/master/2-advanced/dubbo-samples-async/dubbo-samples-async-provider).

> As mentioned earlier, for interfaces that already have CompletableFuture signatures, there is no need to use AsyncContext to implement asynchronous functionality on the Provider side.

1. Define the interface

   ```java
   public interface AsyncService {
       String sayHello(String name);
   }
   ```

2. Provider Side, configuration is completely consistent with ordinary provider

   - Configuration

   ```xml
   <bean id="asyncService" class="com.alibaba.dubbo.samples.async.impl.AsyncServiceImpl"/>
   <dubbo:service async="true" interface="com.alibaba.dubbo.samples.async.api.AsyncService" ref="asyncService"/>
   ```

   - Asynchronous implementation
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

3. Consumer Side

   - Configuration

   ```xml
   <dubbo:reference id="asyncService" interface="com.alibaba.dubbo.samples.async.api.AsyncService"/>
   ```

   - Service Call

   ```java
    public static void main(String[] args) throws Exception {
           ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"META-INF/spring/async-consumer.xml"});
           context.start();
   
           AsyncService asyncService = (AsyncService) context.getBean("asyncService");
           System.out.println(asyncService.sayHello("async call request"));
        
           System.in.read();
       }
   ```

## New Issues Introduced by Asynchronous

### Filter Chain

The following is a complete Filter chain for a regular Dubbo call (Filter chain diagram pending supplementary).

With asynchronous calls, the asynchronous result executes separately in the asynchronous thread, so the Result flowing through the latter half of the Filter chain is empty, and when the actual result returns, it can no longer be processed by the Filter chain.

To address this issue, version 2.7.0 adds a callback interface onResponse to filters.

Below is an example of an extended Filter that supports asynchronous Filter chains.

```java
@Activate(group = {Constants.PROVIDER, Constants.CONSUMER})
public class AsyncPostprocessFilter implements Filter {

    @Override
    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        return invoker.invoke(invoker, invocation);
    }

    @Override
    public Result onResponse(Result result, Invoker<?> invoker, Invocation invocation) {
        System.out.println("Filter get the return value: " + result.getValue());
        return result;
    }
}
```

### Context Passing

The context issue here mainly refers to the scenario of providing asynchronous operations.

Currently, the context we consider mainly points to data stored in RpcContext. Most scenarios require users to manually complete the context passing before switching business threads.

```java
public class AsyncServiceImpl implements AsyncService {
    // Save the context of the current thread
    RpcContext context = RpcContext.getContext();
    public CompletableFuture<String> sayHello(String name) {
        return CompletableFuture.supplyAsync(() -> {
            // Set into the new thread
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

However, AsyncContext also provides the signalContextSwitch() method for easy context switching.

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
