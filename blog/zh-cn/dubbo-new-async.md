# 如何基于Dubbo实现全异步调用链

基于Dubbo实现全异步编程，是在2.7.0版本中对现有异步方式增强后新引入的功能。本文先是回顾2.6.x及之前版本对异步的支持情况及存在的问题，引出了2.7.0版本基于CompletableFuture做了哪些针对性的增强，通过几个示例详细阐述了增强后的异步编程的使用方式，最后总结了引入异步模式带来的新问题及Dubbo的解决方法。通过阅读这篇文章，可以很容易的基于Dubbo2.7.0+版本实现一个全异步的远程服务调用链路。

## 2.6.x版本之前的异步方式

在2.6.x及之前的版本提供了一定的异步编程能力，包括Consumer端[异步调用](http://dubbo.apache.org/books/dubbo-user-book/demos/async-call.html)、[参数回调](http://dubbo.apache.org/books/dubbo-user-book/demos/callback-parameter.html)、[事件通知](http://dubbo.apache.org/books/dubbo-user-book/demos/events-notify.html)等，在上面的文档链接中有关于使用方式的简单介绍和Demo。

但当前的异步方式存在以下问题：

- Future获取方式不够直接
- Future接口无法实现自动回调，而自定义ResponseFuture虽支持回调但支持的异步场景有限，如不支持Future间的相互协调或组合等
- 不支持Provider端异步

以Consumer端异步使用方式为例：

1. 定义一个普通的同步接口并声明支持异步调用

```
public interface FooService {
    String findFoo(String name);
}
```

```
<dubbo:reference id="fooService" interface="com.alibaba.foo.FooService">
      <dubbo:method name="findFoo" async="true" />
</dubbo:reference>
```

1. 通过RpcContext获取Future

```
// 此调用会立即返回null
fooService.findFoo(fooId);
// 拿到调用的Future引用，当结果返回后，会被通知和设置到此Future
Future<Foo> fooFuture = RpcContext.getContext().getFuture();
fooFuture.get();
```

或

```
// 此调用会立即返回null
fooService.findFoo(fooId);
// 拿到Dubbo内置的ResponseFuture并设置回调
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

从这个简单的示例我们可以体会到一些使用中的不便之处：

1. findFoo的同步接口，不能直接返回代表异步结果的Future，通过RpcContext进一步获取。
2. Future只支持阻塞式的get()接口获取结果。
3. 通过获取内置的ResponseFuture接口，可以设置回调。但获取ResponseFuture的API使用不便，且仅支持设置回调其他异步场景均不支持，如多个Future协同工作的场景等。

## 2.7.0基于CompletableFuture的增强

了解Java中Future演进历史的同学应该知道，Dubbo 2.6.x及之前版本中使用的Future是在java 5中引入的，所以存在以上一些功能设计上的问题，而在java 8中引入的CompletableFuture进一步丰富了Future接口，很好的解决了这些问题。

Dubbo在2.7.0版本已经升级了对Java 8的支持，同时基于CompletableFuture对当前的异步功能进行了增强。

1. 支持直接定义返回CompletableFuture的服务接口。通过这种类型的接口，我们可以更自然的实现Consumer、Provider端的异步编程。

   

   ```
   public interface AsyncService {
       CompletableFuture<String> sayHello(String name);
   }
   ```

   

   

2. 如果你不想将接口的返回值定义为Future类型，或者存在定义好的同步类型接口，则可以额外定义一个异步接口并提供Future类型的方法。

   

   ```
   public interface GreetingsService {
       String sayHi(String name);
   }
   ```

   

   ```
   @AsyncFor(AsyncService.class)
   public interface GrettingServiceAsync extends GreetingsService {
       CompletableFuture<String> sayHiAsync(String name);
   }
   ```

   

   这样，Provider可以只实现sayHi方法；而Consumer通过直接调用sayHiAsync可以拿到一个Future实例，Dubbo框架在Provider端会自动转换为对sayHi方法的调用。

   

   为每个同步方法提供一个异步方法定义会比较麻烦，更进一步的，利用Dubbo生态中的[Annotation Processor实现](https://github.com/dubbo/dubbo-async-processor)，可以自动帮我们自动生成异步方法定义。

3. 同样的，如果你的原始接口定义不是Future类型的返回值，Provider端异步也提供了类似Servlet3.0里的Async Servlet的编程接口: `RpcContext.startAsync()`。

   

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

   

   在方法体的开始`RpcContext.startAsync()`启动异步，并开启新线程异步的执行业务逻辑，在耗时操作完成后通过`asyncContext.write`将结果写回。

4. RpcContext直接返回CompletableFuture

   

   ```
   CompletableFuture<String> f = RpcContext.getContext().getCompletableFuture();
   ```

以上所有的增强，是在兼容已有异步编程的基础上进行的，因此基于2.6.x版本编写的异步程序不用做任何改造即可顺利编译通过。

接下来，我们通过几个示例看一下如何实现一个全异步的Dubbo服务调用链。

## 示例1：CompletableFuture类型接口

CompletableFuture类型的接口既可以用作同步调用，也可以实现Consumer或Provider的异步调用。本示例实现了Consumer和Provider端异步调用，代码参见[dubbo-samples-async-original-future](https://github.com/dubbo/dubbo-samples/tree/samples-for-2.7.0-SNAPSHOT/dubbo-samples-async-original-future)。

1. 定义接口

   

   ```
   public interface AsyncService {
       CompletableFuture<String> sayHello(String name);
   }
   ```

   

   注意接口的返回类型是`CompletableFuture<String>`。

2. Provider端

   

   - 实现

     

     ```
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

     

     可以看到这里通过supplyAsync将业务代码切换到了新的线程执行，因此实现了Provider端异步。

   - 配置

     

     ```
     <bean id="asyncService" class="com.alibaba.dubbo.samples.async.impl.AsyncServiceImpl"/>
     <dubbo:service interface="com.alibaba.dubbo.samples.async.api.AsyncService" ref="asyncService"/>
     ```

     

     配置方式和普通接口是一样。

3. Consumer端

   

   - 配置

   

   ```
   <dubbo:reference id="asyncService" timeout="10000" interface="com.alibaba.dubbo.samples.async.api.AsyncService"/>
   ```

   

   ​	配置方式和普通接口是一样。

   

   - 调用远程服务

   

   ```
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

   

   `CompletableFuture<String> future = asyncService.sayHello("async call request");`很自然的返回了Future示例，这样就实现了Consumer端的异步服务调用。

## 示例2：同步接口使用Annotation Processor

这个示例演示了如何在只定义同步接口的基础上，使用Annotation Processor实现Consumer端异步方服务调用，具体代码参见地址[dubbo-samples-async-generated-future](https://github.com/dubbo/dubbo-samples/tree/samples-for-2.7.0-SNAPSHOT/dubbo-samples-async-generated-future)

1. 定义接口

   

   ```
   @DubboAsync
   public interface GreetingsService {
       String sayHi(String name);
   }
   ```

   

   这是一个普通的Dubbo服务接口定义。注意，使用Annotation Processor要加上@DubboAsync注解。

   

   ```
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

   

   以上是引入dubbo-async-processer处理器的Maven依赖，通常定义接口（提供API）的开发者将以上依赖加到工程中，这样在做API打包的时候，API中会自动生成以下接口定义：

   

   ```
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

   

   

2. Provider端

   

   - 配置

   

   ```
   <bean id="greetingsService" class="com.alibaba.dubbo.samples.async.impl.GreetingsServiceImpl"/>
   <dubbo:service interface="com.alibaba.dubbo.samples.api.GreetingsService" ref="greetingsService"/>
   ```

   

   - 服务实现

   

   ```
   public class GreetingsServiceImpl implements GreetingsService {
       @Override
       public String sayHi(String name) {
           return "hi, " + name;
       }
   }
   ```

3. Consumer端

   

   - 配置

   

   ```
    <dubbo:reference id="greetingsService" interface="com.alibaba.dubbo.samples.api.GreetingsServiceAsync"/>
   ```

   

   注意，服务接口用的是**GreetingsServiceAsync**

   

   - 调用服务

   

   ```
    public static void main(String[] args) throws Exception {
           ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"META-INF/spring/async-consumer.xml"});
           context.start();
   
           GreetingsServiceAsync greetingsService = (GreetingsServiceAsync) context.getBean("greetingsService");
           CompletableFuture<String> future = greetingsService.sayHiAsync("async call reqeust");
           System.out.println("async call ret :" + future.get());
        
           System.in.read();
       }
   ```

   

   这样，我们就可以直接使用`CompletableFuture<String> future = greetingsService.sayHiAsync("async call reqeust");`，直接返回CompletableFuture。

## 示例3：使用AsyncContext

本示例演示了如何在同步接口的基础上，通过AsyncContext实现Provider端异步执行，示例代码参见[dubbo-samples-async-provider](https://github.com/dubbo/dubbo-samples/tree/samples-for-2.7.0-SNAPSHOT/dubbo-samples-async-provider)。

1. 定义接口

   

   ```
   public interface AsyncService {
       String sayHello(String name);
   }
   ```

   

   

2. Provider端

   

   - 配置

   

   ```
   <bean id="asyncService" class="com.alibaba.dubbo.samples.async.impl.AsyncServiceImpl"/>
   <dubbo:service async="true" interface="com.alibaba.dubbo.samples.async.api.AsyncService" ref="asyncService"/>
   ```

   

   注意，要加上`async="true"`表明这是一个开启Provider端异步执行的服务。

   

   - 异步执行实现

   

   ```
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

3. Consumer端

   

   - 配置

   

   ```
   <dubbo:reference id="asyncService" interface="com.alibaba.dubbo.samples.async.api.AsyncService"/>
   ```

   

   - 服务调用

   

   ```
    public static void main(String[] args) throws Exception {
           ClassPathXmlApplicationContext context = new ClassPathXmlApplicationContext(new String[]{"META-INF/spring/async-consumer.xml"});
           context.start();
   
           AsyncService asyncService = (AsyncService) context.getBean("asyncService");
           System.out.println(asyncService.sayHello("async call request"));
        
           System.in.read();
       }
   ```

   

   

## 异步引入的新问题

### Filter链

以下是一次普通Dubbo调用的完整Filter链

而采用异步调用后，由于异步结果在异步线程中单独执行，所以流经后半段Filter链的Result是空值，当真正的结果返回时已无法被Filter链处理。

为了解决这个问题，2.7.0中引入了PostProcessFilter和AbstractPostProcessFilter，其中，PostProcessFilter接口继承自Filter接口，AbstractPostProcessFilter是PostProcessFilter的抽象实现。

以下是一个扩展Filter并支持异步Filter链的例子

```
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

### 上下文传递

当前我们考虑的上下文主要是指保存在RpcContext中的数据，大多数场景是需要用户在切换业务线程前自己完成Context的传递。

```
public class AsyncServiceImpl implements AsyncService {
    // 保存当前线程的上下文
    RpcContext context = RpcContext.getContext();
    public CompletableFuture<String> sayHello(String name) {
        return CompletableFuture.supplyAsync(() -> {
            // 设置到新线程中
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

不过AsyncContext也提供了signalContextSwitch()的方法来实现方便的Context切换。

```
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

