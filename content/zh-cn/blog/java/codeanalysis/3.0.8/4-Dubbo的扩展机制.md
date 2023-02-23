---
title: "04-Dubbo的扩展机制"
linkTitle: "4-Dubbo的扩展机制"
date: 2022-08-04
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] Dubbo是一个微内核框架，所有的实现都是通过扩展机制来实现的，了解扩展加载机制可以有效的逻辑代码的抽象与具体逻辑
---


# 4-Dubbo的扩展机制
## 4.1 回顾我们前面使用到扩展场景
在上一章中我们初始化应用模型对象的时候,了解到有几个地方用到了扩展机制来创建对象,这一章我们会详细来讲一下这个扩展对象的加载过程,这里我们先来回顾下哪些地方用到了扩展机制:


```java
// 使用扩展机制获取TypeBuilder
Set<TypeBuilder> tbs = model.getExtensionLoader(TypeBuilder.class).getSupportedExtensionInstances();
      
//获取域模型初始化器ScopeModelInitializer扩展对象,执行初始化方法
ExtensionLoader<ScopeModelInitializer> initializerExtensionLoader = this.getExtensionLoader(ScopeModelInitializer.class);
 Set<ScopeModelInitializer> initializers = initializerExtensionLoader.getSupportedExtensionInstances();
 
// OrderedPropertiesConfiguration 中获取有序配置提供器对象
ExtensionLoader<OrderedPropertiesProvider> propertiesProviderExtensionLoader = moduleModel.getExtensionLoader(OrderedPropertiesProvider.class);
 
// ApplicationModel中获取配置管理器对象
 configManager = (ConfigManager) this.getExtensionLoader(ApplicationExt.class)
                .getExtension(ConfigManager.NAME);
       
//ModuleModel中获取模块扩展对象
Set<ModuleExt> exts = this.getExtensionLoader(ModuleExt.class).getSupportedExtensionInstances();

// ApplicationModel中获Environment对象
environment = (Environment) this.getExtensionLoader(ApplicationExt.class)
                .getExtension(Environment.NAME);
 
// ApplicationModel中获取应用初始化监听器ApplicationInitListener扩展对象
ExtensionLoader<ApplicationInitListener> extensionLoader = this.getExtensionLoader(ApplicationInitListener.class);
Set<String> listenerNames = extensionLoader.getSupportedExtensions();
      
//ScopeModel中创建扩展访问器:
this.extensionDirector = new ExtensionDirector(parent != null ? parent.getExtensionDirector() : null, scope, this);
        
```

有了以上的应用场景我们可以来看下扩展机制了

##  4.2 为什么要用到扩展机制?
为什么要用到扩展这个想必每个编程人员都比较了解,一个好的程序是要遵循一定的设计规范比如设计模式中的**开闭原则** 英文全称是 Open Closed Principle，简写为 OCP,对扩展开放、对修改关闭:

**对扩展开放：** 指的是我们系统中的模块、类、方法对它们的提供者（开发者）应该是开放的，提供者可以对系统进行扩展（新增）新的功能。

**对修改关闭：** 指的是系统中的模块、类、方法对它们的使用者（调用者）应该是关闭的。使用者使用这些功能时，不会因为提供方新增了功能而导致使用者也进行相应修改。

我们再来了解下Dubbo的一些基本特性:
下面这句话是我摘自官网的:
*Apache Dubbo 是一款微服务开发框架，它提供了 **RPC通信** 与 **微服务治理** 两大关键能力。这意味着，使用 Dubbo 开发的微服务，将具备相互之间的远程发现与通信能力， 同时利用 Dubbo 提供的丰富服务治理能力，可以实现诸如服务发现、负载均衡、流量调度等服务治理诉求。同时 Dubbo 是高度可扩展的，用户几乎可以在**任意功能点去定制自己的实现**，以改变框架的默认行为来满足自己的业务需求。
Dubbo3 基于 Dubbo2 演进而来，在保持原有核心功能特性的同时， Dubbo3 在易用性、超大规模微服务实践、云原生基础设施适配、安全设计等几大方向上进行了全面升级。 以下文档都将基于 Dubbo3 展开。*

**对修改关闭的地方:** 对于Apache Dubbo来说 不变的是RPC调用流程,微服务治理这些抽象的概念,我们可以用摘自官网的下面几个图表示:
![在这里插入图片描述](/imgs/blog/source-blog/4-dubbo-arch.png)
<center>图4.1 Dubbo架构图</center>

再来看一个调用链路的架构图

![在这里插入图片描述](/imgs/blog/source-blog/4-dubbo-arch2.png)
<center>图4.2 Dubbo RPC调用链路</center>

<br/>
上面两个图整体来看都是Dubbo不变的地方涉及到服务的RPC调用和服务治理的一些概念与流程,但是对于每个环节又可以使用各种方式实现,比如序列化机制可以是Json,Java序列化,Hession2或者Protobuf等等,网络传输层可以是netty实现的tcp通信,也可以使用http协议,那Dubbo又是如何封装不变部分扩展这种可变部分呢?,那就是接下来要说的**微内核机制**,这个我们待会说

**对扩展开放：**  : 对于Apache Dubbo来说 变化的是RPC调用流程和微服务治理这些抽象的概念的具体实现,每个点应该用什么技术实现,又是用什么场景,这个可以用如下图来表示下:
![在这里插入图片描述](/imgs/blog/source-blog/4-dubbo-arch3.png)
<center>图4.3 Dubbo的扩展生态</center>

</br>

看到这里 应该各位就明白了,我们写程序是为了业务,而针对不同的业务需求很多场景下我们是需要使用不同的实现来满足的,Dubbo使用微内核的架构,将具体的实现开放出来,让使用者可以根据自己的需求来选择,定制. Dubbo开放了很多的扩展点供大家扩展,可想而知使用Dubbo的灵活性是非常高的。

**微内核架构:**
微内核架构由两大架构模块组成：**核心系统**与**插件模块**,设计一个微内核体系关键工作全部集中于核心系统怎么构建。
**核心系统** : 负责和具体业务功能无关的通用功能，例如模块加载、模块间通信等,这个其实对应着Dubbo的SPI机制。
**插件模块** : 负责实现具体的业务逻辑，Dubbo,SPI接口与实现。



##  4.3 Dubbo的扩展机制包含了哪些重要的组成部分?
前面我们说了为什么要使用扩展机制,这里我们来看下具体实现

先将扩展包里面的代码截个图认识认识各类型的单词
![在这里插入图片描述](/imgs/blog/source-blog/4-dubbo-extension.png)

顺便我们先简单看下类结构图,后续再详细看每个类型的解释:
![在这里插入图片描述](/imgs/blog/source-blog/4-dubbo-extension2.png)

为了后续看具体的扩展加载流程我们先看下以上类型的解释说明:

 -  **ExtensionAccessor**
 	- 	扩展的统一访问器
 - **ExtensionDirector**
	 - ExtensionDirector是一个作用域扩展加载程序管理器。
	 - ExtensionDirector支持多个级别，子级可以继承父级的扩展实例。
查找和创建扩展实例的方法类似于Java classloader。
- **ExtensionScope**
	- 扩展SPI域,目前有FRAMEWORK,APPLICATION,MODULE,SELF
	- **FRAMEWORK** : 扩展实例在框架内使用，与所有应用程序和模块共享。
框架范围SPI扩展只能获取FrameworkModel，无法获取ApplicationModel和ModuleModel。
考虑：
一些SPI需要在框架内的应用程序之间共享数据
无状态SPI在框架内是安全共享的
 	- **APPLICATION** 扩展实例在一个应用程序中使用，与应用程序的所有模块共享，不同的应用程序创建不同的扩展实例。
应用范围SPI扩展可以获取FrameworkModel和ApplicationModel，无法获取ModuleModel。
考虑：
在框架内隔离不同应用程序中的扩展数据
在应用程序内部的所有模块之间共享扩展数据
	 - **MODULE** 扩展实例在一个模块中使用，不同的模块创建不同的扩展实例。
模块范围SPI扩展可以获得FrameworkModel、ApplicationModel和ModuleModel。
考虑：
隔离应用程序内部不同模块中的扩展数据
	-  **SELF** 自给自足，为每个作用域创建一个实例，用于特殊的SPI扩展，如ExtensionInjector

- **ExtensionLoader**
	- ApplicationModel、DubboBootstrap和这个类目前被设计为单例或静态（本身完全静态或使用一些静态字段）。因此，从它们返回的实例属于process或classloader范围。如果想在一个进程中支持多个dubbo服务器，可能需要重构这三个类。
	- 加载dubbo扩展
	- 自动注入依赖项扩展
	- 包装器中的自动包装扩展
	- 默认扩展是一个自适应实例 
	- JDK自带SPI参考地址 [点击查看](https://docs.oracle.com/javase/1.5.0/docs/guide/jar/jar.html#Service%20Provider)
	- @SPI 服务扩展接口 详细内容看后面
	- @Adaptive自适应扩展点注解  详细内容看后面
	- @Activate自动激活扩展点注解  详细内容看后面

- **ExtensionPostProcessor**
	-	 在扩展初始化之前或之后调用的后处理器。
- **LoadingStrategy**
	- 扩展加载策略,目前有3个扩展加载策略分别从不同文件目录加载扩展
- **DubboInternalLoadingStrategy**
	- Dubbo内置的扩展加载策略,将加载文件目录为META-INF/dubbo/internal/的扩展
- 	**DubboLoadingStrategy**
	- Dubbo普通的扩展加载策略,将加载目录为META-INF/dubbo/的扩展
-   **ServicesLoadingStrategy**
	- JAVA SPI加载策略 ,将加载目录为META-INF/services/的扩展
- **Wrapper**注解
- SPI注解
- **ExtensionInjector**接口 
	- 为SPI扩展提供资源的注入器。 
- **ExtensionAccessorAware**
	- SPI扩展可以实现这个感知接口，以获得适当的xtensionAccessor实例。 
- DisableInject注解
- **AdaptiveClassCodeGenerator**
	- 自适应类的代码生成器 
- **Adaptive**注解
 - 为ExtensionLoader注入依赖扩展实例提供有用信息。  	 
 - **Activate**注解
 	- Activate。此注解对于使用给定条件自动激活某些扩展非常有用，例如：@Activate可用于在有多个实现时加载某些筛选器扩展。
**group()**指定组条件。框架SPI定义了有效的组值。
**value()**指定URL条件中的参数键。
SPI提供程序可以调用ExtensionLoader。getActivateExtension(URL、String、String)方法以查找具有给定条件的所有已激活扩展。 
- **ActivateComparator**
	-  Activate扩展的排序器
- **MultiInstanceActivateComparator**
-  **WrapperComparator** 
- **AdaptiveExtensionInjector**
- **SpiExtensionInjector**



## 4.4 扩展加载创建之前的调用过程
### 4.4.1 扩展的调用代码示例
了解了这么多与扩展相关的概念,接下来我们就来从前面的代码调用中找几个例子来看下扩展的调用过程:

代码来源于FrameworkModel对象的初始化initialize()中的如下代码调用:

```java
 TypeDefinitionBuilder.initBuilders(this);
```


TypeDefinitionBuilder中初始化类型构建器代码如下:
```java
  public static void initBuilders(FrameworkModel model) {
        Set<TypeBuilder> tbs = model.getExtensionLoader(TypeBuilder.class).getSupportedExtensionInstances();
        BUILDERS = new ArrayList<>(tbs);
    }
```
### 4.4.2 Dubbo的分层模型获取扩展加载器对象
以上扩展调用的时候对于扩展加载器对象的获取代码如下所示,我们来看下它的调用链路
```java
model.getExtensionLoader(TypeBuilder.class)
```

getExtensionLoader方法来源于FrameworkModel类型的父类型ScopeModel的实现的接口ExtensionAccessor中的默认方法(JDK8 默认方法)

ExtensionAccessor接口中的getExtensionLoader方法如下代码:

```java
default <T> ExtensionLoader<T> getExtensionLoader(Class<T> type) {
        return this.getExtensionDirector().getExtensionLoader(type);
    }
```

获取扩展加载器之前需要先获取扩展访问器:
这里的链路先梳理下: 

**模型对象(FrameworkModel)-**--> **扩展访问器(ExtensionAccessor)** ---> **作用域扩展加载程序管理器(ExtensionDirector)** ---> 

这个getExtensionDirector()方法来源于FrameworkModel的抽象父类型ScopeModel中的getExtensionDirector()如下代码:
 
```java
@Override
    public ExtensionDirector getExtensionDirector() {
        return extensionDirector;
    }
```

这里直接返回了extensionDirector,,不知道介绍到这里记得这个扩展加载程序管理器extensionDirector对象的由来不, 在上个章节[《3-框架,应用程序,模块领域模型Model对象的初始化》](https://blog.elastic.link/2022/07/10/dubbo/3-kuang-jia-ying-yong-cheng-xu-mo-kuai-ling-yu-mo-xing-model-dui-xiang-de-chu-shi-hua/)中3.2.2 初始化ScopeModel的章节中的ScopeModel类型的初始化方法initialize()方法中我们提到过这个对象的创建,具体代码如下所示(这个代码比较简单):
```java
this.extensionDirector = new ExtensionDirector(parent != null ? parent.getExtensionDirector() : null, scope, this);
       
```

我们继续前面getExtensionLoader(type)方法调用逻辑,前面我们知道了这个扩展访问器的对象是ExtensionDirector,接下来我们看下ExtensionDirector中获取扩展加载器的代码(如下所示):
在详细介绍扩展加载器对象获取之前我们先来看下当前我们要加载的扩展类型的源码,后续会用到:
我们要加载的扩展类型TypeBuilder接口
```java
@SPI(scope = ExtensionScope.FRAMEWORK)
public interface TypeBuilder extends Prioritized {

    /**
     * Whether the build accept the class passed in.
     */
    boolean accept(Class<?> clazz);

    /**
     * Build type definition with the type or class.
     */
    TypeDefinition build(Type type, Class<?> clazz, Map<String, TypeDefinition> typeCache);

}
```


ExtensionDirector类型中获取扩展加载器的代码
这个代码非常有意思 **其实就是前面说到的域模型架构的数据访问架构**类似于JVM类加载器访问加载类的情况,但是这个顺序可能有所不同,Dubbo的扩展加载器是如何访问的呢? 遵循以下顺序:
- 先从**缓存中**查询扩展加载器
-  如果前面没找到则查询扩展类型的scope所属域,如果是**当前域扩展**则从直接创建扩展加载器
- 如果前面没找到就从**父扩展访问器**中查询,查询这个扩展是否数据父扩展域
- 前面都没找到就尝试创建

```java
@Override
    public <T> ExtensionLoader<T> getExtensionLoader(Class<T> type) {
    	//如果扩展加载器已经被销毁则抛出异常
        checkDestroyed();
        //这里参数类型传的是TypeBuilder.class不为空
        if (type == null) {
            throw new IllegalArgumentException("Extension type == null");
        }
        //扩展类型不为接口也要抛出异常,这个TypeBuilder.class具体类型代码往上看,这个类型是一个接口
        if (!type.isInterface()) {
            throw new IllegalArgumentException("Extension type (" + type + ") is not an interface!");
        }
        //这个判断逻辑是判断这个扩展接口是有有@SPI注解,TypeBuilder是有的
        if (!withExtensionAnnotation(type)) {
            throw new IllegalArgumentException("Extension type (" + type +
                ") is not an extension, because it is NOT annotated with @" + SPI.class.getSimpleName() + "!");
        }

        // 1. find in local cache
        //被加载的扩展类型对应的扩展加载器会放到extensionLoadersMap这个ConcurrentHashMap类型的集合中方便缓存
        ExtensionLoader<T> loader = (ExtensionLoader<T>) extensionLoadersMap.get(type);
		//查询扩展所属域,这个类型的扩展域是框架级别的ExtensionScope.FRAMEWORK
       //extensionScopeMap为ConcurrentHashMap类型的扩展域缓存集合
        ExtensionScope scope = extensionScopeMap.get(type);
        if (scope == null) {
            SPI annotation = type.getAnnotation(SPI.class);
            scope = annotation.scope();
            extensionScopeMap.put(type, scope);
        }
		//首次访问的时候当前类型的扩展加载器类型肯定是空的,会走如下两个逻辑中的其中一个进行创建扩展加载器
		//1)如果 扩展域为SELF 自给自足，为每个作用域创建一个实例，用于特殊的SPI扩展，如{@link ExtensionInjector}
        if (loader == null && scope == ExtensionScope.SELF) {
            // create an instance in self scope
            loader = createExtensionLoader0(type);
        }

        // 2. find in parent
        //3) 从父扩展加载器中查询当前扩展加载器是否存在,这里parent是空的先不考虑
        if (loader == null) {
            if (this.parent != null) {
                loader = this.parent.getExtensionLoader(type);
            }
        }

        // 3. create it
        //4) 这个是我们本次会走的逻辑,大部分是会走这个逻辑来创建扩展加载器对象的
        if (loader == null) {
            loader = createExtensionLoader(type);
        }

        return loader;
    }
```



前面提到的withExtensionAnnotation判断代码如下:
```java
private static boolean withExtensionAnnotation(Class<?> type) {
        return type.isAnnotationPresent(SPI.class);
    }
```


ExtensionDirector类型的createExtensionLoader方法

```java
private <T> ExtensionLoader<T> createExtensionLoader(Class<T> type) {
        ExtensionLoader<T> loader = null;
        //当前类型注解的scope与当前扩展访问器ExtensionDirector的scope是否一致,不一致则抛出异常
        //当前类型ExtensionDirector的scope是在构造器中传递的,在Model对象初始化的时候创建的本类型
        if (isScopeMatched(type)) {
            // if scope is matched, just create it
            loader = createExtensionLoader0(type);
        } else {
            // if scope is not matched, ignore it
        }
        return loader;
    }
```

ExtensionDirector类型的createExtensionLoader0方法
```java
 private <T> ExtensionLoader<T> createExtensionLoader0(Class<T> type) {
 		//检查当前扩展访问器是否被销毁掉了
        checkDestroyed();
        ExtensionLoader<T> loader;
        //为当前扩展类型创建一个扩展访问器并缓存到,当前成员变量extensionLoadersMap中
        extensionLoadersMap.putIfAbsent(type, new ExtensionLoader<T>(type, this, scopeModel));
        loader = (ExtensionLoader<T>) extensionLoadersMap.get(type);
        return loader;
    }
```
### 4.4.3 扩展加载器对象ExtensionLoader的构造器
扩展加载器相对来说是比较复杂的实现内容比较多,用到哪里我们说下哪里,这里先来看ExtensionLoader的构造器代码如下所示:

```java
 ExtensionLoader(Class<?> type, ExtensionDirector extensionDirector, ScopeModel scopeModel) {
 		//当前扩展加载器,需要加载的扩展的类型
        this.type = type;
        //创建扩展加载器的扩展访问器对象
        this.extensionDirector = extensionDirector;
        //从扩展访问器中获取扩展执行前后的回调器
        this.extensionPostProcessors = extensionDirector.getExtensionPostProcessors();
        //创建实例化对象的策略对象
        initInstantiationStrategy();
        //如果当前扩展类型为扩展注入器类型则设置当前注入器变量为空,否则的话获取一个扩展注入器扩展对象
        this.injector = (type == ExtensionInjector.class ? null : extensionDirector.getExtensionLoader(ExtensionInjector.class)
            .getAdaptiveExtension());
         //创建Activate注解的排序器   
        this.activateComparator = new ActivateComparator(extensionDirector);
        //为扩展加载器下的域模型对象赋值
        this.scopeModel = scopeModel;
    }
```


先来看 创建实例化对象的策略对象代码 initInstantiationStrategy();

```java
private void initInstantiationStrategy() {
        for (ExtensionPostProcessor extensionPostProcessor : extensionPostProcessors) {
              //ScopeModelAwareExtensionProcessor在域模型对象时候为扩展访问器添加了这个域模型扩展处理器对象ScopeModelAwareExtensionProcessor,这个类型实现了ScopeModelAccessor域模型访问器可以用来获取域模型对象
            if (extensionPostProcessor instanceof ScopeModelAccessor) {
          
                instantiationStrategy = new InstantiationStrategy((ScopeModelAccessor) extensionPostProcessor);
                break;
            }
        }
        if (instantiationStrategy == null) {
            instantiationStrategy = new InstantiationStrategy();
        }
    }
```

再来看ExtensionInjector扩展对象的获取

```java
//1)这里有个type为空的判断,普通的扩展类型肯定不是ExtensionInjector类型 这里必定会为每个非扩展注入ExtensionInjector类型创建一个ExtensionInjector类型的扩展对象,
//2) 这里代码会走extensionDirector.getExtensionLoader(ExtensionInjector.class)这一步进去之后的代码刚刚看过就不再看了,这个代码会创建一个为ExtensionInjector扩展对象的加载器对象ExtensionLoader
//3) getAdaptiveExtension() 这个方法就是通过扩展加载器获取具体的扩展对象的方法我们会详细说
 this.injector = (type == ExtensionInjector.class ? null : extensionDirector.getExtensionLoader(ExtensionInjector.class)
            .getAdaptiveExtension());
```


 
原文： [<<Dubbo的扩展机制>>](https://blog.elastic.link/2022/07/10/dubbo/4-dubbo-de-spi-kuo-zhan-ji-zhi-yu-extensionloader-dui-xiang-de-chuang-jian-yuan-ma-jie-xi/ )
