# Instance for Dubbo Extension Mechanism

## 1. Extension Mechanism of Dubbo

Dubbo is claimed as a high-performance RPC framework on its official website. Today, I want to talk about another great specialty of Dubbo --- its scalability.  As quote: Rome wasn’t built in a day. Any successful system always starts as a prototype. It is impossible to design a perfect system at the beginning. Instead, we should focus on true demand and keep improving the system. On the coding side, it requires us to pay attention on abstraction layers and high-level isolation. In that case, the system could keep a healthy structure and easy to maintain while new features or third-party extensions are added. Under some circumstances, a designer should pursue more of scalability than the system’s current performance. 
When talking about software design, people always mention scalability. A framework with good scalability requires the following:
1.The framework should follow opening/closed principle: software entities should be open for extension, but closed for modification; This means a framework should allow the maintainer to add new functions with as few modifications as possible. 
2.The framework should allow the user to add new functions by adding code on his project without modifying the framework's original source code base. 
With microkernel architecture and extension mechanism, Dubbo satisfies such requirements and achieves good scalability. In the following chapters, we will discuss Dubbo's extension mechanism in detail. 

## 2.Extension Solutions

Creating Extensible applications usually considers:
* Factory method pattern
* IoC container
* OSGi (Open Services Gateway initiative)

As a framework, Dubbo does not wish to rely on other IoC containers such as Spring, Guice. OSGi is too complicated to fit Dubbo. In the end, Dubbo SPI is inherited from standard JDK SPI and makes it more powerful.

## 3.Java SPI Mechanism

We will first discuss Java SPI mechanism, which is a basis for understanding Dubbo’s extension mechanism. If you are familiar with Java SPI, you can skip this part.

Java SPI (Service Provider Interface) is a feature for discovering and loading implementations matching a given interface provided in JDK. We can create a text file with the same name as the interface under resource directory `META-INF/services`. The content of the file is the fully qualified class name of the SPI implementation, in which each component is separated by a line breaker. JDK uses `java.util.ServiceLoader` to load implementations of a service. Let us use a simple example to show how Java SPI works. 

1. Define an interface IRepository to store data.

```java
public interface IRepository {
    void save(String data);
}
```

2. Create 2 implementations for IRepository: MysqlRepository and MongoRepository

```java
public class MysqlRepository implements IRepository {
    public void save(String data) {
        System.out.println("Save " + data + " to Mysql");
    }
}
```

```java
public class MongoRepository implements IRepository {
    public void save(String data) {
        System.out.println("Save " + data + " to Mongo");
    }
}
```

3. Create a configuration file under `META-INF/services`. 

The file name is `META-INF/services/com.demo.IRepository`, the content of file is:

```text
com.demo.MongoRepository
com.demo.MysqlRepository
```

4.  Load IRepository using ServiceLoader

```java
ServiceLoader<IRepository> serviceLoader = ServiceLoader.load(IRepository.class);
Iterator<IRepository> it = serviceLoader.iterator();
while (it != null && it.hasNext()){
    IRepository demoService = it.next();
    System.out.println("class:" + demoService.getClass().getName());
    demoService.save("tom");
}
```
In the above example, we created an extension and two of its applications. We created the configuration file in ClassPath and loaded the extensions using ServiceLoader. The final output is: 
class:testDubbo.MongoRepository
Save tom to Mongo
class:testDubbo.MysqlRepository
Save tom to Mysql

## 4. Dubbo SPI Mechanism

Java SPI is simple to use. It also supports basic extension point functions, however, it has some disadvantages:
* It will load and instantiate all implementations at once to find the requested implementation.
* The configuration file only includes the extension implementation but does not name them, which makes it hard to reference them in applications.
* If extensions depend on other extensions, Java SPI cannot automatically load the dependency SPI.
* It does not provide functions such as IOC or AOP in Spring.
* It is hard to assemble extensions with other frameworks. For example, if the extension depends on Spring bean, the original Java SPI will not support it.

Therefore, Java SPI is good for some simple scenarios, but does not fit for Dubbo. Dubbo makes some extensions on the original SPI mechanism. We will discuss more about the Dubbo SPI mechanism in the following sections.

## 5. Basic Concepts for Dubbo Extension Point Mechanism

Before diving into Dubbo's extension mechanism，Let us first declare some basic concepts in Dubbo SPI. Those terms will appear multiple times in the following section.

### 5.1 Extension Point

an interface of java.

### 5.2 Extension

an implementation class of the Extension Point

### 5.3 Extension Instance

instance of an extension point implementation class

### 5.4 Extension Adaptive Instance

Maybe it is a little difficult to understand this concept when hearing about it the first time. It may help you understand it better by calling it an extension proxy class. The extension adaptive instance is actually an extension proxy, which implements the method of extension point interface. When calling the interface method of the extension point, it will decide which extension to use according to the actual parameters. For example, the extension point of an IRepository has one save method, and two implementations MysqlRepository and MongoRepository. When calling the method of the interface, the adaptive instance of IRepository will determine which IRepository implementation to call according to the parameters in the save method. If the parameter repository=mysql in the method, then we can call the save method of MysqlRepository. If repository=mongo, then we can call the save method of MongoRepository, which is similar to late binding in Object-oriented languages. However, why does Dubbo introduce the concept of extended adaptive instances?
* There are two configurations in Dubbo, one is a fixed system-level configuration and it will not be changed after Dubbo launches. Another is the run-time configuration that may be different for each RPC. For instance, the timeout is configured as 10 seconds in the xml file, which will not change after Dubbo launches. However, for a certain PRC call, we can set its timeout to 30 seconds so as to override the system-level configuration. For Dubbo, the parameters called in each RPC is unknown and only at run-time can you make the right decision according to revealed parameters.
* Our class is usually singleton-scaled, such as beans of Spring IoC Container. When instantiating beans, if it depends on some specific extension point, it will know which extension to use, otherwise, the bean will not know how to choose extensions. At this time, a proxy mode is needed, which implements the interface  of an extension point. The method can dynamically select the appropriate extension according to the run-time parameters, and this proxy is an adaptive instance. Adaptive extension instance is widely used in Dubbo, in Dubbo, each extension will have an adaptive class, and if we do not provide it, Dubbo will automatically generate one for us by using the bytecode encoder. Therefore, we basically don't recognize the existence of adaptive classes. We will explain how the adaptive class works in later chapters.

### 5.5 @SPI

@SPI annotation works on the interface of the extension point, which indicates that the interface is an extension point, and can be loaded by Dubbo ExtentionLoader. If there is no such ExtentionLoader, the call will throw an exception.

### 5.6 @Adaptive

@Adaptive annotation is used on the method that extends the interface, which indicates an adaptive method. When Dubbo generates an adaptive instance for an extension point, if the function has @Adaptive annotation, then Dubbo will generate the corresponding code for the method. The method determines which extension to use according to the parameters. When @Adaptive annotation is used on the class to implement a Decorator class, it is similar to the Decorator pattern, whose major function is to return a specified class. Currently in Dubbo, both AdaptiveCompiler and AdaptiveExtensionFactory have @Adaptive annotation. 

### 5.7 ExtentionLoader

Similar to the Java SPI ServiceLoader, it is responsible for loading extensions and life-cycle maintenance.

### 5.8 Extension Alias

Different from Java, each extension in Dubbo has an alias, which is used to reference them in the application, such as 

```bash
random=com.alibaba.dubbo.rpc.cluster.loadbalance.RandomLoadBalance
roundrobin=com.alibaba.dubbo.rpc.cluster.loadbalance.RoundRobinLoadBalance
```
where random, roundrobin are alias of the corresponding extensions, and we can directly use them in the configuration file. 

### 5.9 Paths

Similar to the way Java SPI loading the extension configuration from the `META-INF/services` directory, Dubbo will also load the extension configuration file from the following path:
* `META-INF/dubbo/internal`
* `META-INF/dubbo`
* `META-INF/services`

## 6. Interpretation for Dubbo's LoadBalance Extension Point

Now that we know some basic idea about Dubbo, let us check a practical extension point in Dubbo to get some intuition.
 
We take the Dubbo’s LoadBalance extension point as an example. A service in Dubbo usually has multiple providers. When a consumer calls the service, he needs to choose one of the providers. This is an example of LoadBalance. Now, let us figure out how LoadBalance becomes an extension point in Dubbo.


### 6.1 LoadBalance Interfance

```java
@SPI(RandomLoadBalance.NAME)
public interface LoadBalance {

    @Adaptive("loadbalance")
    <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException;
}
```
LoadBalance interface has only one select method. Select method chose one invoker among multiple invokers. In the code above, the elements related to Dubbo SPI are:
* @SPI([RandomLoadBalance.NAME](http://RandomLoadBalance.NAME)) @SPI is used for LoadBalance interface, which indicates that the LoadBalance interface is an extension point. Without the @SPI annotation, if we try to load the extension, it will throw an exception. @SPI annotation has one parameter, and this parameter represents the Alias of the default implementation of the extension point. If there has no explicitly specified extension, the default implementation will be used.
`RandomLoadBalance.NAME` is a constant with value “random” and is a random load balancing implementation. The definition of random is in the configuration file `META-INF/dubbo/internal/com.alibaba.dubbo.rpc.cluster.LoadBalance`:

```bash
random=com.alibaba.dubbo.rpc.cluster.loadbalance.RandomLoadBalance
roundrobin=com.alibaba.dubbo.rpc.cluster.loadbalance.RoundRobinLoadBalance
leastactive=com.alibaba.dubbo.rpc.cluster.loadbalance.LeastActiveLoadBalance
consistenthash=com.alibaba.dubbo.rpc.cluster.loadbalance.ConsistentHashLoadBalance
```
There are four extension implementations of LoadBalance defined in the configuration file. The implementation of load balancing will not be covered in this article. The only thing we need to know is that Dubbo provides four kinds of load balancing implementations. We can explicitly specify an implementation by using xml file, properties file or JVM parameter. If there has no explicitly specified implementation, Dubbo will use random as default.


![dubbo-loadbalance | left](https://raw.githubusercontent.com/vangoleo/wiki/master/dubbo/dubbo_loadbalance.png "")

* @Adaptive("loadbalance")  Applying @Adaptive annotation on select method indicates that select method is an adaptive method. Dubbo will automatically generate the corresponding code for the method. When select method is called, it will decide which extension to apply based on the method parameters. @Adaptive parameter `loadbalance` indicates that the value of loadbalance in method is the extension implementation that will be actually called. However, we cannot find loadbalance parameter in select method, then how can we obtain the value of loadbalance? There is another URL-type parameter in select method, and Dubbo obtains the value of loadbalance from that URL. Here we need to use Dubbo’s URL bus pattern, in one word, URL contains all the parameters in RPC. There is a member variable `Map<String, String>parameters` in the URL class, which contains loadbalance as a parameter

### 6.2 Obtain LoadBalance extension

The code of LoadBalance in Dubbo is as follows:

```java
LoadBalance lb = ExtensionLoader.getExtensionLoader(LoadBalance.class).getExtension(loadbalanceName);
```
Using ExtensionLoader.getExtensionLoader(LoadBalance.class) method to obtain an implementation of ExtensionLoader, then we call getExtension and pass an extension alias to obtain the corresponding extension implementation.

## 7. Customize a LoadBalance Extension

In this session, we will use a simple example to implement a LoadBalance and integrate it into Dubbo. I will show some important steps and codes, and the complete demo can be downloaded from the following address([https://github.com/vangoleo/dubbo-spi-demo](https://github.com/vangoleo/dubbo-spi-demo)).

### 7.1 implement LoadBalance Interface

First, we build a LoadBalance instance. Since we just need the instance to demonstrate Dubbo extension mechanism, it will be very simple. We choose the first invoker and print a log sentence in the console. 

```java
package com.dubbo.spi.demo.consumer;
public class DemoLoadBalance implements LoadBalance {
    @Override
    public <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException {
        System.out.println("DemoLoadBalance: Select the first invoker...");
        return invokers.get(0);
    }
}
```

### 7.2 Add extension configuration file

Add file:`META-INF/dubbo/com.alibaba.dubbo.rpc.cluster.LoadBalance`. The content of file is:

```bash
demo=com.dubbo.spi.demo.consumer.DemoLoadBalance
```

### 7.3 Configure customized LoadBalance

Through the above 2 steps, we have already added a LoadBalance implementation named demo, and set up the configuration file. In the next step, we need to explicitly tell Dubbo to implement the demo while doing load balancing. If we use Dubbo through spring, we could set it up in the xml file. 

```xml
<dubbo:reference id="helloService" interface="com.dubbo.spi.demo.api.IHelloService" loadbalance="demo" />
```
Configure <loadbalance="demo"> in [dubbo:reference](dubbo:reference) at consumer part.

### 7.4 launch Dubbo

Launch Dubbo and call IHelloService, the console will output log: `DemoLoadBalance: Select the first invoker...`, which means Dubbo does use our customized LoadBalance.


## Summary 

So far, we learnt the basic concepts of Dubbo SPI beginning with Java SPI, and we used LoadBalance in Dubbo as an example to help us understand better. Finally, we practiced and created a customized LoadBalance and integrated it to Dubbo. We believe that combining concepts and practice, everyone can get a better idea of Dubbo’s scalability. To summarize, Dubbo SPI has the following features:
* Build extensions on Dubbo does not require modifications on the original source code base.
* The customized Dubbo extension point implementation is a normal Java class. Dubbo does not introduce any specialized elements, and have almost zero code intrusion.
*Extension registration on Dubbo requires only configuration file under the ClassPath directory. It is simple to use and has no effect on the existing code. This meets opening/closed principle.
* Dubbo's extension mechanism default: @SPI("dubbo") represents the default SPI object.
* Dubbo's extension mechanism supports the advanced features such as IoC and AoP, etc.
* Dubbo's extension mechanism supports third-party IoC containers. It supports Spring beans by default and can be extended to other containers, such as Google/Guice.
* It is easy to switch the implementation of the extension point because it requires only modifications on the specific implementation in the configuration file without changing the code.


In the next article, we will go deep and check Dubbo's source code to learn more about Dubbo's extensibility mechanism.
