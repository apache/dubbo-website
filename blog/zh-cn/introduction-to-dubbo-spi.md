Dubbo可扩展机制实战
---

# 1. Dubbo的扩展机制
在Dubbo的官网上，Dubbo描述自己是一个高性能的RPC框架。今天我想聊聊Dubbo的另一个很棒的特性, 就是它的可扩展性。
如同罗马不是一天建成的，任何系统都一定是从小系统不断发展成为大系统的，想要从一开始就把系统设计的足够完善是不可能的，相反的，我们应该关注当下的需求，然后再不断地对系统进行迭代。在代码层面，要求我们适当的对关注点进行抽象和隔离，在软件不断添加功能和特性时，依然能保持良好的结构和可维护性，同时允许第三方开发者对其功能进行扩展。在某些时候，软件设计者对扩展性的追求甚至超过了性能。

在谈到软件设计时，可扩展性一直被谈起，那到底什么才是可扩展性，什么样的框架才算有良好的可扩展性呢？它必须要做到以下两点:
1. 作为框架的维护者，在添加一个新功能时，只需要添加一些新代码，而不用大量的修改现有的代码，即符合开闭原则。
2. 作为框架的使用者，在添加一个新功能时，不需要去修改框架的源码，在自己的工程中添加代码即可。

Dubbo很好的做到了上面两点。这要得益于Dubbo的微内核+插件的机制。接下来的章节中我们会慢慢揭开Dubbo扩展机制的神秘面纱。

# 2. 可扩展的几种解决方案
通常可扩展的实现有下面几种:
* Factory模式
* IoC容器
* OSGI容器

Dubbo作为一个框架，不希望强依赖其他的IoC容器，比如Spring，Guice。OSGI也是一个很重的实现，不适合Dubbo。最终Dubbo的实现参考了Java原生的SPI机制，但对其进行了一些扩展，以满足Dubbo的需求。

# 3. Java SPI机制
既然Dubbo的扩展机制是基于Java原生的SPI机制，那么我们就先来了解下Java SPI吧。了解了Java的SPI，也就是对Dubbo的扩展机制有一个基本的了解。如果对Java SPI比较了解的同学，可以跳过。

Java SPI(Service Provider Interface)是JDK内置的一种动态加载扩展点的实现。在ClassPath的`META-INF/services`目录下放置一个与接口同名的文本文件，文件的内容为接口的实现类，多个实现类用换行符分隔。JDK中使用`java.util.ServiceLoader`来加载具体的实现。
让我们通过一个简单的例子，来看看Java SPI是如何工作的。

1. 定义一个接口IRepository用于实现数据储存
```java
public interface IRepository {
    void save(String data);
}
```

2. 提供IRepository的实现
    IRepository有两个实现。MysqlRepository和MongoRepository。

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

3. 添加配置文件
    在`META-INF/services`目录添加一个文件，文件名和接口全名称相同，所以文件是`META-INF/services/com.demo.IRepository`。文件内容为:

```text
com.demo.MongoRepository
com.demo.MysqlRepository
```

4. 通过ServiceLoader加载IRepository实现

```java
ServiceLoader<IRepository> serviceLoader = ServiceLoader.load(IRepository.class);
Iterator<IRepository> it = serviceLoader.iterator();
while (it != null && it.hasNext()){
    IRepository demoService = it.next();
    System.out.println("class:" + demoService.getClass().getName());
    demoService.save("tom");
}
```
在上面的例子中，我们定义了一个扩展点和它的两个实现。在ClassPath中添加了扩展的配置文件，最后使用ServiceLoader来加载所有的扩展点。
最终的输出结果为：
class:testDubbo.MongoRepository
Save tom to Mongo
class:testDubbo.MysqlRepository
Save tom to Mysql

# 4. Dubbo的SPI机制

Java SPI的使用很简单。也做到了基本的加载扩展点的功能。但Java SPI有以下的不足:
* 需要遍历所有的实现，并实例化，然后我们在循环中才能找到我们需要的实现。
* 配置文件中只是简单的列出了所有的扩展实现，而没有给他们命名。导致在程序中很难去准确的引用它们。
* 扩展如果依赖其他的扩展，做不到自动注入和装配
* 不提供类似于Spring的IOC和AOP功能
* 扩展很难和其他的框架集成，比如扩展里面依赖了一个Spring bean，原生的Java SPI不支持

所以Java SPI应付一些简单的场景是可以的，但对于Dubbo，它的功能还是比较弱的。Dubbo对原生SPI机制进行了一些扩展。接下来，我们就更深入地了解下Dubbo的SPI机制。

# 5. Dubbo扩展点机制基本概念
在深入学习Dubbo的扩展机制之前，我们先明确Dubbo SPI中的一些基本概念。在接下来的内容中，我们会多次用到这些术语。

### 5.1 扩展点(Extension Point)
是一个Java的接口。

### 5.2 扩展(Extension)
扩展点的实现类。

### 5.3 扩展实例(Extension Instance)
扩展点实现类的实例。

### 5.4 扩展自适应实例(Extension Adaptive Instance)
第一次接触这个概念时，可能不太好理解(我第一次也是这样的...)。如果称它为扩展代理类，可能更好理解些。扩展的自适应实例其实就是一个Extension的代理，它实现了扩展点接口。在调用扩展点的接口方法时，会根据实际的参数来决定要使用哪个扩展。比如一个IRepository的扩展点，有一个save方法。有两个实现MysqlRepository和MongoRepository。IRepository的自适应实例在调用接口方法的时候，会根据save方法中的参数，来决定要调用哪个IRepository的实现。如果方法参数中有repository=mysql，那么就调用MysqlRepository的save方法。如果repository=mongo，就调用MongoRepository的save方法。和面向对象的延迟绑定很类似。为什么Dubbo会引入扩展自适应实例的概念呢？
* Dubbo中的配置有两种，一种是固定的系统级别的配置，在Dubbo启动之后就不会再改了。还有一种是运行时的配置，可能对于每一次的RPC，这些配置都不同。比如在xml文件中配置了超时时间是10秒钟，这个配置在Dubbo启动之后，就不会改变了。但针对某一次的RPC调用，可以设置它的超时时间是30秒钟，以覆盖系统级别的配置。对于Dubbo而言，每一次的RPC调用的参数都是未知的。只有在运行时，根据这些参数才能做出正确的决定。
* 很多时候，我们的类都是一个单例的，比如Spring的bean，在Spring bean都实例化时，如果它依赖某个扩展点，但是在bean实例化时，是不知道究竟该使用哪个具体的扩展实现的。这时候就需要一个代理模式了，它实现了扩展点接口，方法内部可以根据运行时参数，动态的选择合适的扩展实现。而这个代理就是自适应实例。
    自适应扩展实例在Dubbo中的使用非常广泛，Dubbo中，每一个扩展都会有一个自适应类，如果我们没有提供，Dubbo会使用字节码工具为我们自动生成一个。所以我们基本感觉不到自适应类的存在。后面会有例子说明自适应类是怎么工作的。

### 5.5 @SPI
@SPI注解作用于扩展点的接口上，表明该接口是一个扩展点。可以被Dubbo的ExtentionLoader加载。如果没有此ExtensionLoader调用会异常。

### 5.6 @Adaptive
@Adaptive注解用在扩展接口的方法上。表示该方法是一个自适应方法。Dubbo在为扩展点生成自适应实例时，如果方法有@Adaptive注解，会为该方法生成对应的代码。方法内部会根据方法的参数，来决定使用哪个扩展。
@Adaptive注解用在类上代表实现一个装饰类，类似于设计模式中的装饰模式，它主要作用是返回指定类，目前在整个系统中AdaptiveCompiler、AdaptiveExtensionFactory这两个类拥有该注解。


### 5.7 ExtentionLoader
类似于Java SPI的ServiceLoader，负责扩展的加载和生命周期维护。

### 5.8 扩展别名
和Java SPI不同，Dubbo中的扩展都有一个别名，用于在应用中引用它们。比如

```bash
random=com.alibaba.dubbo.rpc.cluster.loadbalance.RandomLoadBalance
roundrobin=com.alibaba.dubbo.rpc.cluster.loadbalance.RoundRobinLoadBalance
```
其中的random，roundrobin就是对应扩展的别名。这样我们在配置文件中使用random或roundrobin就可以了。

### 5.9 一些路径
和Java SPI从`/META-INF/services`目录加载扩展配置类似，Dubbo也会从以下路径去加载扩展配置文件:
* `META-INF/dubbo/internal`
* `META-INF/dubbo`
* `META-INF/services`

# 6. Dubbo的LoadBalance扩展点解读
在了解了Dubbo的一些基本概念后，让我们一起来看一个Dubbo中实际的扩展点，对这些概念有一个更直观的认识。

我们选择的是Dubbo中的LoadBalance扩展点。Dubbo中的一个服务，通常有多个Provider，consumer调用服务时，需要在多个Provider中选择一个。这就是一个LoadBalance。我们一起来看看在Dubbo中，LoadBalance是如何成为一个扩展点的。

### 6.1 LoadBalance接口

```java
@SPI(RandomLoadBalance.NAME)
public interface LoadBalance {

    @Adaptive("loadbalance")
    <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException;
}
```
LoadBalance接口只有一个select方法。select方法从多个invoker中选择其中一个。上面代码中和Dubbo SPI相关的元素有:
* @SPI([RandomLoadBalance.NAME](http://RandomLoadBalance.NAME))
    @SPI作用于LoadBalance接口，表示接口LoadBalance是一个扩展点。如果没有@SPI注解，试图去加载扩展时，会抛出异常。@SPI注解有一个参数，该参数表示该扩展点的默认实现的别名。如果没有显示的指定扩展，就使用默认实现。`RandomLoadBalance.NAME`是一个常量，值是"random"，是一个随机负载均衡的实现。
    random的定义在配置文件`META-INF/dubbo/internal/com.alibaba.dubbo.rpc.cluster.LoadBalance`中:

```bash
random=com.alibaba.dubbo.rpc.cluster.loadbalance.RandomLoadBalance
roundrobin=com.alibaba.dubbo.rpc.cluster.loadbalance.RoundRobinLoadBalance
leastactive=com.alibaba.dubbo.rpc.cluster.loadbalance.LeastActiveLoadBalance
consistenthash=com.alibaba.dubbo.rpc.cluster.loadbalance.ConsistentHashLoadBalance
```
可以看到文件中定义了4个LoadBalance的扩展实现。由于负载均衡的实现不是本次的内容，这里就不过多说明。只用知道Dubbo提供了4种负载均衡的实现，我们可以通过xml文件，properties文件，JVM参数显式的指定一个实现。如果没有，默认使用随机。


![dubbo-loadbalance | left](https://raw.githubusercontent.com/vangoleo/wiki/master/dubbo/dubbo_loadbalance.png "")

* @Adaptive("loadbalance")
    @Adaptive注解修饰select方法，表明方法select方法是一个可自适应的方法。Dubbo会自动生成该方法对应的代码。当调用select方法时，会根据具体的方法参数来决定调用哪个扩展实现的select方法。@Adaptive注解的参数`loadbalance`表示方法参数中的loadbalance的值作为实际要调用的扩展实例。
    但奇怪的是，我们发现select的方法中并没有loadbalance参数，那怎么获取loadbalance的值呢？select方法中还有一个URL类型的参数，Dubbo就是从URL中获取loadbalance的值的。这里涉及到Dubbo的URL总线模式，简单说，URL中包含了RPC调用中的所有参数。URL类中有一个`Map<String, String> parameters`字段，parameters中就包含了loadbalance。

### 6.2 获取LoadBalance扩展
Dubbo中获取LoadBalance的代码如下:

```java
LoadBalance lb = ExtensionLoader.getExtensionLoader(LoadBalance.class).getExtension(loadbalanceName);
```
使用ExtensionLoader.getExtensionLoader(LoadBalance.class)方法获取一个ExtensionLoader的实例，然后调用getExtension，传入一个扩展的别名来获取对应的扩展实例。

# 7. 自定义一个LoadBalance扩展
本节中，我们通过一个简单的例子，来自己实现一个LoadBalance，并把它集成到Dubbo中。我会列出一些关键的步骤和代码，也可以从这个地址([https://github.com/vangoleo/dubbo-spi-demo](https://github.com/vangoleo/dubbo-spi-demo))下载完整的demo。

### 7.1 实现LoadBalance接口
首先，编写一个自己实现的LoadBalance，因为是为了演示Dubbo的扩展机制，而不是LoadBalance的实现，所以这里LoadBalance的实现非常简单，选择第一个invoker，并在控制台输出一条日志。

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

### 7.2 添加扩展配置文件
添加文件:`META-INF/dubbo/com.alibaba.dubbo.rpc.cluster.LoadBalance`。文件内容如下:

```bash
demo=com.dubbo.spi.demo.consumer.DemoLoadBalance
```

### 7.3 配置使用自定义LoadBalance
通过上面的两步，已经添加了一个名字为demo的LoadBalance实现，并在配置文件中进行了相应的配置。接下来，需要显式的告诉Dubbo使用demo的负载均衡实现。如果是通过spring的方式使用Dubbo，可以在xml文件中进行设置。

```xml
<dubbo:reference id="helloService" interface="com.dubbo.spi.demo.api.IHelloService" loadbalance="demo" />
```
在consumer端的[dubbo:reference](dubbo:reference)中配置<loadbalance="demo">

### 7.4 启动Dubbo
启动Dubbo，调用一次IHelloService，可以看到控制台会输出一条`DemoLoadBalance: Select the first invoker...`日志。说明Dubbo的确是使用了我们自定义的LoadBalance。


# 总结 
到此，我们从Java SPI开始，了解了Dubbo SPI 的基本概念，并结合了Dubbo中的LoadBalance加深了理解。最后，我们还实践了一下，创建了一个自定义LoadBalance，并集成到Dubbo中。相信通过这里理论和实践的结合，大家对Dubbo的可扩展有更深入的理解。
总结一下，Dubbo SPI有以下的特点:
* 对Dubbo进行扩展，不需要改动Dubbo的源码
* 自定义的Dubbo的扩展点实现，是一个普通的Java类，Dubbo没有引入任何Dubbo特有的元素，对代码侵入性几乎为零。
* 将扩展注册到Dubbo中，只需要在ClassPath中添加配置文件。使用简单。而且不会对现有代码造成影响。符合开闭原则。
* dubbo的扩展机制设计默认值：@SPI("dubbo") 代表默认的spi对象
* Dubbo的扩展机制支持IoC,AoP等高级功能
* Dubbo的扩展机制能很好的支持第三方IoC容器，默认支持Spring Bean，可自己扩展来支持其他容器，比如Google的Guice。
* 切换扩展点的实现，只需要在配置文件中修改具体的实现，不需要改代码。使用方便。


下一篇，我们将会一起深入Dubbo的源码，更深入的了解Dubbo的可扩展机制。
