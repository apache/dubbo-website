---
title: "02-启动服务前服务配置ServiceConfig类型是如何初始化的?"
linkTitle: "2-ServiceConfig类型是如何初始化的?"
date: 2022-08-02
author: 宋小生
tags: ["源码解析", "Java"]
description: Dubbo 源码解析之 ServiceConfig 类型是如何初始化的?
---


# 2-启动服务前服务配置ServiceConfig类型是如何初始化的?
## 2.1 示例源码回顾:
为了方便我们理解记忆,这里先来回顾下上一章我们说的示例代码,如下所示:
```java
public class Application {
    public static void main(String[] args) throws Exception {
            startWithBootstrap();
    }
    private static void startWithBootstrap() {
        ServiceConfig<DemoServiceImpl> service = new ServiceConfig<>();
        service.setInterface(DemoService.class);
        service.setRef(new DemoServiceImpl());
        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        bootstrap.application(new ApplicationConfig("dubbo-demo-api-provider"))
            .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
            .protocol(new ProtocolConfig(CommonConstants.DUBBO, -1))
            .service(service)
            .start()
            .await();
    }
}

```
上面这几行代码虽然看似简单,仅仅几行的启动,但是完全掌握也得下一翻大功夫,接下来我们重点看启动代码中的第一行,创建一个服务配置对象:

```java
ServiceConfig<DemoServiceImpl> service = new ServiceConfig<>();
```

## 2.2 了解一下服务配置的建模
下面是一个简单的UML继承关系图,当然这个图很是简单的,这里仅仅列出了当前服务提供者的相关服务配置继承关系, 服务提供者独有的配置标注颜色为蓝色,一些可能与服务引用配置所共有的父类型我们用红色背景,当然这里为了简便起见不会提起服务引用相关的配置类型,这里列举了如下服务提供者类型,他们各司其职:
 ![在这里插入图片描述](/imgs/blog/source-blog/2-ServiceConfig.png)
<center>图2.1 服务引用类继承关系UML</center>

 - AbstractConfig
   - **抽象的配置类型**,也是最顶层的服务配置类型,封装着解析配置的实用方法和公共方法,比如服务id的设置,服务标签名字的处理,服务参数的添加,属性的提取等等
 - AbstractMethodConfig
    - 	**抽象的方法配置**,同样这个类型也是见名知意,服务方法的相关配置处理,这个类型主要用于对服务方法的一些配置信息建模比如服务方法的调用超时时间,重试次数,最大并发调用数,负载均衡策略,是否异步调用,是否确认异步发送等等配置信息.
  -  AbstractInterfaceConfig
     - **抽象的接口配置**,与前面介绍的方法配置类似,这个类型是对服务接口的建模,主要的配置信息有暴漏服务的接口名字,服务接口的版本号,客户/提供方将引用的远程服务分组,**服务元数据**,服务接口的本地impl类名,服务监控配置,对于生成动态代理的策略，可以选择两种策略：jdk和javassist,容错类型等等配置
 - AbstractServiceConfig
    	- **抽象的服务配置**,这个就与我们的服务提供者有了具体的关系了,主要记录了一些服务提供者的公共配置,如服务版本,服务分组,服务延迟注册毫秒数,是否暴漏服务,服务权重,是否为动态服务,服务协议类型,是否注册等等.
- ServiceConfigBase
    	- 	**服务的基础配置类**,这个类型仍旧是个抽象的类型提取了一些基础的配置:导出服务的接口类,服务名称,接口实现的引用类型,提供者配置,是否是通用服务GenericService
- ServiceConfig
    	- 	**服务配置实现类**, 上面的类型都是抽象类型不能做为具体存在的事物,这个类型是我们出现的第一个服务配置实现类型,服务配置实现类已经从父类型中继承了这么多的属性,这里主要为实现服务提供了一些配置如服务的协议配置,服务的代理工厂JavassistProxyFactory是将生成导出服务代理的ProxyFactory实现，是其默认实现,服务提供者模型,是否导出服务,导出的服务列表,服务监听器等等.
- ServiceBean
    	- 	**服务工厂Bean**	,这个主要是Spring模块来简化配置的一个服务工厂Bean这里就先不详细介绍Spring相关的配置.     - 



## 2.3 ServiceConfig构造器的初始化调用链 
有了上面的类型继承关系我们就比较好分析了,接下来我们开始创建服务配置对象如下代码所示:
```java
ServiceConfig<DemoServiceImpl> service = new ServiceConfig<>();
```
根据Java基础的构造器知识,在每个构造器的第一行都会有个super方法来调用父类的构造器,当前这个super方法我们可以不写但是Java编译器底层还是会为我们默认加上这么一行super()代码来调用父类构造器的.


对于上面我提到的这几个构造器**根据代码被调用的先后顺序**,这里重点说几个重要的,这里我仍旧按代码执行的先后顺序来说:

### 2.3.1 父类型AbstractMethodConfig构造器的初始化
根据super调用链这里先来看AbstractMethodConfig抽象方法配置
```java
   public AbstractMethodConfig() {
        super(ApplicationModel.defaultModel().getDefaultModule());
    }
```
在这个构造器中只有个super方法用来调用父类型的构造器,但是在调用之前会先使用代码 **ApplicationModel.defaultModel().getDefaultModule()** 创建一个模块模型对象**ModuleModel** 
关于模型对象的细节我们会在下个章节来说,这里我们继续来看调用链

### 2.3.2 最顶层类型AbstractConfig构造器的初始化
**AbstractConfig**的构造器初始化一共有两个,第一个步骤就是创建一个应用程序模型对象**ApplicationModel**,刚刚我们在**AbstractMethodConfig**的构造器中了解到使用这个代码**ApplicationModel.defaultModel().getDefaultModule()**创建了个模块模型对象**ModuleModel**,具体他们细节我们下一章细说,了解了子类型**AbstractMethodConfig**的构造器是带参数的那我们就直接看第二个构造器
```java
public AbstractConfig() {
        this(ApplicationModel.defaultModel());
    }
```
将会调用第二个构造器初始化域模型
```java
 public AbstractConfig(ScopeModel scopeModel) {
        this.setScopeModel(scopeModel);
    }
```

当前类型设置ScopeModel类型对象
```java
   public final void setScopeModel(ScopeModel scopeModel) {
   		//第一次初始化的当前成员变量是空的可以设置变量
        if (this.scopeModel != scopeModel) {
        	//检查参数是否合法
            checkScopeModel(scopeModel);
            //初始化对象
            ScopeModel oldScopeModel = this.scopeModel;
            this.scopeModel = scopeModel;
            // reinitialize spi extension and change referenced config's scope model	
            //被子类重写的方法,根据多态会调用具体子类型的这个方法我们下面来看
            //子类应该重写此方法以初始化其SPI扩展并更改引用的配置的范围模型。
            this.postProcessAfterScopeModelChanged(oldScopeModel, this.scopeModel);
        }
    }
```
检查ScopeModel参数是否合法,合法的参数是不能为空并且必须是ApplicationModel类型或者子类型
```java
   protected void checkScopeModel(ScopeModel scopeModel) {
        if (scopeModel == null) {
            throw new IllegalArgumentException("scopeModel cannot be null");
        }
        if (!(scopeModel instanceof ApplicationModel)) {
            throw new IllegalArgumentException("Invalid scope model, expect to be a ApplicationModel but got: " + scopeModel);
        }
    }
```

#### 2.3.2.1 重写的postProcessAfterScopeModelChanged调用逻辑
当ScopeModel模型对象发生了改变,上面调用了postProcessAfterScopeModelChanged方法来通知模型对象改变的时候要执行的操作,根据多态重写的逻辑我们从实现类的postProcessAfterScopeModelChanged来看,在下面的调用链路中部分父类型并未实现postProcessAfterScopeModelChanged方法我们就直接忽略了

第一个被调用到的是**ServiceConfig**类型的postProcessAfterScopeModelChanged方法
```java
  @Override
    protected void postProcessAfterScopeModelChanged(ScopeModel oldScopeModel, ScopeModel newScopeModel) {
        super.postProcessAfterScopeModelChanged(oldScopeModel, newScopeModel);
        //初始化当前协议对象,通过扩展机制获取协议Protocol类型的对象
        protocolSPI = this.getExtensionLoader(Protocol.class).getAdaptiveExtension();
        //初始化当前代理工厂对象,通过扩展机制获取ProxyFactory类型的对象
        proxyFactory = this.getExtensionLoader(ProxyFactory.class).getAdaptiveExtension();
    }
```

第二个被调用到的方法为**ServiceConfigBase**的postProcessAfterScopeModelChanged方法
 
```java
@Override
    protected void postProcessAfterScopeModelChanged(ScopeModel oldScopeModel, ScopeModel newScopeModel) {
        super.postProcessAfterScopeModelChanged(oldScopeModel, newScopeModel);
        //当服务提供者配置对象不为空时候为服务提供者对象设置域模型,这里服务提供者对象仍旧为空,这个一般用在兼容Dubbo低版本
        if (this.provider != null && this.provider.getScopeModel() != scopeModel) {
            this.provider.setScopeModel(scopeModel);
        }
    }
```

第三个被调用到的是**AbstractInterfaceConfig**类型的postProcessAfterScopeModelChanged方法

```java
@Override
    protected void postProcessAfterScopeModelChanged(ScopeModel oldScopeModel, ScopeModel newScopeModel) {
        super.postProcessAfterScopeModelChanged(oldScopeModel, newScopeModel);
        // remove this config from old ConfigManager
//        if (oldScopeModel != null && oldScopeModel instanceof ModuleModel) {
//            ((ModuleModel)oldScopeModel).getConfigManager().removeConfig(this);
//        }

        // change referenced config's scope model
        //获取应用程序模型对象
        ApplicationModel applicationModel = ScopeModelUtil.getApplicationModel(scopeModel);
        //为配置中心对象设置ApplicationModel类型对象(当前阶段配置中心配置对象为空)
        if (this.configCenter != null && this.configCenter.getScopeModel() != applicationModel) {
            this.configCenter.setScopeModel(applicationModel);
        }
       //为元数据配置对象设置ApplicationModel类型对象(当前阶段数据配置配置对象为空)
        if (this.metadataReportConfig != null && this.metadataReportConfig.getScopeModel() != applicationModel) {
            this.metadataReportConfig.setScopeModel(applicationModel);
        }
        //为MonitorConfig服务监控配置对象设置ApplicationModel类型对象(当前阶段数据配置配置对象为空)
        if (this.monitor != null && this.monitor.getScopeModel() != applicationModel) {
            this.monitor.setScopeModel(applicationModel);
        }
        //这个if判断和上面的上面是重复的估计是写代码人加班加的太久了,没注意看
        if (this.metadataReportConfig != null && this.metadataReportConfig.getScopeModel() != applicationModel) {
            this.metadataReportConfig.setScopeModel(applicationModel);
        }
        //如果注册中心配置列表不为空则为每个注册中心配置设置一个ApplicationModel类型对象(当前注册中心对象都为空)
        if (CollectionUtils.isNotEmpty(this.registries)) {
            this.registries.forEach(registryConfig -> {
                if (registryConfig.getScopeModel() != applicationModel) {
                    registryConfig.setScopeModel(applicationModel);
                }
            });
        }
    }
```


最后被调用到的是最顶层父类型**AbstractConfig**的postProcessAfterScopeModelChanged方法
这个方法什么也没干只是在父类型创建的模版方法让子类型来重写用的
```java
protected void postProcessAfterScopeModelChanged(ScopeModel oldScopeModel, ScopeModel newScopeModel) {
        // remove this config from old ConfigManager
//        if (oldScopeModel != null && oldScopeModel instanceof ApplicationModel) {
//           ((ApplicationModel)oldScopeModel).getApplicationConfigManager().removeConfig(this);
//        }
    }
```


### 2.3.3 ServiceConfigBase构造器的初始化

```java
public ServiceConfigBase() {
		//服务元数据对象创建
        serviceMetadata = new ServiceMetadata();
        //为服务元数据对象
        serviceMetadata.addAttribute("ORIGIN_CONFIG", this);
    }
```
**注意，** **ServiceMetadata**这个类目前在Dubbo中没有用法。与服务级别相关的数据，例如名称、版本、业务服务的类加载器、安全信息等，还带有用于扩展的AttributeMap。

**服务配置对象的创建过程就这样结束了**,当然有一些细节会**放到后面来写**
上面主要顺序是按照代码执行的顺序来写的部分地方可能稍微做了调整,如果有条件的同学一定要**自己进行DEBUG**了解下细节.


关于服务配置官网提供了xml的配置信息这里我拷贝过来,可以做为参考:
当然这个配置不是最新的比如服务配置的**标签配置tag**,
**warmup 预热时间**单位毫秒,暂时还没有说明


| 属性 | 对应URL参数 |类型	 | 是否必填| 缺省值| 作用| 描述	|兼容性|
|--|--|--|--|--|--|--|--|
|interface	|	|class	|必填	|	|	服务发现|	服务接口名	|1.0.0以上版本|
|ref	|	|object|	必填		|	|服务发现	|服务对象实现引用|	1.0.0以上版本|
|version	|version|	string	|可选	|0.0.0	|服务发现|		服务版本，建议使用两位数字版本，如：1.0，通常在接口不兼容时版本号才需要升级	|1.0.0以上版本|
|group	|group	|string	|可选	|	|	服务发现	|	服务分组，当一个接口有多个实现，可以用分组区分	|1.0.7以上版本|
|path	|  `<path>`	|string	|可选	|缺省为接口名	|服务发现	|	服务路径 (注意：1.0不支持自定义路径，总是使用接口名，如果有1.0调2.0，配置服务路径可能不兼容)	|1.0.12以上版本|
|delay	|delay	|int	|可选	|0	|性能调优	|	延迟注册服务时间(毫秒) ，设为-1时，表示延迟到Spring容器初始化完成时暴露服务	|1.0.14以上版本|
|timeout	|timeout	|int	|可选	|1000	|性能调优	|远程服务调用超时时间(毫秒)	|2.0.0以上版本|
|retries	|retries|	int	|可选|	2	|性能调优|		远程服务调用重试次数，不包括第一次调用，不需要重试请设为0	|2.0.0以上版本|
|connections	|connections|	int	|可选	|100	|性能调优	|	对每个提供者的最大连接数，rmi、http、hessian等短连接协议表示限制连接数，dubbo等长连接协表示建立的长连接个数	|2.0.0以上版本|
|loadbalance|	loadbalance	|string	|可选|	random	|性能调优	|	负载均衡策略，可选值：random,roundrobin,leastactive，分别表示：随机，轮询，最少活跃调用	|2.0.0以上版本|
|async|	async	|boolean|	可选|		false|		性能调优|	是否缺省异步执行，不可靠异步，只是忽略返回值，不阻塞执行线程	|2.0.0以上版本|
|local	|local	|class/boolean	|可选|	false	|服务治理	|	设为true，表示使用缺省代理类名，即：接口名 + Local后缀，已废弃，请使用stub|	2.0.0以上版本|
|stub|	stub	|class/boolean|	可选|	false|	服务治理|		设为true，表示使用缺省代理类名，即：接口名 + Stub后缀，服务接口客户端本地代理类名，用于在客户端执行本地逻辑，如本地缓存等，该本地代理类的构造函数必须允许传入远程代理对象，构造函数如：public XxxServiceStub(XxxService xxxService)	|2.0.0以上版本|
|mock	|mock|	class/boolean	|可选	|false	|服务治理|		设为true，表示使用缺省Mock类名，即：接口名 + Mock后缀，服务接口调用失败Mock实现类，该Mock类必须有一个无参构造函数，与Local的区别在于，Local总是被执行，而Mock只在出现非业务异常(比如超时，网络异常等)时执行，Local在远程调用之前执行，Mock在远程调用后执行。	|2.0.0以上版本|
|token	|token|	string/boolean|	可选	|false	|服务治理|		令牌验证，为空表示不开启，如果为true，表示随机生成动态令牌，否则使用静态令牌，令牌的作用是防止消费者绕过注册中心直接访问，保证注册中心的授权功能有效，如果使用点对点调用，需关闭令牌功能	|2.0.0以上版本|
|registry	|	|	string|	可选	|缺省向所有registry注册|	配置关联|		向指定注册中心注册，在多个注册中心时使用，值为<dubbo:registry>的id属性，多个注册中心ID用逗号分隔，如果不想将该服务注册到任何registry，可将值设为N/A|	2.0.0以上版本|
|provider	|		|string	|可选|	缺省使用第一个provider配置|	配置关联	|	指定provider，值为<dubbo:provider>的id属性	|2.0.0以上版本|
|deprecated	|deprecated	|boolean	|可选	|false	|服务治理|		服务是否过时，如果设为true，消费方引用时将打印服务过时警告error日志	|2.0.5以上版本
|dynamic	|dynamic	|boolean	|可选	|true	|服务治理	|	服务是否动态注册，如果设为false，注册后将显示后disable状态，需人工启用，并且服务提供者停止时，也不会自动取消册，需人工禁用。	2.0.5以上版本|
|accesslog|	accesslog|	string/boolean	|可选	|false	|服务治理|		设为true，将向logger中输出访问日志，也可填写访问日志文件路径，直接把访问日志输出到指定文件	|2.0.5以上版本|
|owner	|owner	|string	|可选	||		服务治理	|	服务负责人，用于服务治理，请填写负责人公司邮箱前缀	|2.0.5以上版本
|document	|document	|string	|可选	|	|	服务治理	|	服务文档URL|	2.0.5以上版本
|weight	|weight	|int	|可选	|	|	性能调优	|	服务权重|		2.0.5以上版本|
|executes	|executes	|int	|可选|		0	|	性能调优|		服务提供者每服务每方法最大可并行执行请求数|	2.0.5以上版本|
|proxy|	proxy|	string	|可选	|	javassist	|	性能调优|		生成动态代理方式，可选：jdk/javassist|	2.0.5以上版本|
|cluster|	cluster|	string|	可选|		failover	|性能调优|		集群方式，可选：failover/failfast/failsafe/failback/forking	|2.0.5以上版本
|filter	|service.filter	|string	|可选	|	default	|	性能调优|		服务提供方远程调用过程拦截器名称，多个名称用逗号分隔	|2.0.5以上版本|	
|listener	|exporter.listener	|string	|可选|		default	|	性能调优|		服务提供方导出服务监听器名称，多个名称用逗号分隔	|
|protocol	|	|	string	|可选|		|	配置关联|		使用指定的协议暴露服务，在多协议时使用，值为<dubbo:protocol>的id属性，多个协议ID用逗号分隔|	2.0.5以上版本|
|layer|	layer|	string	|可选|		服务治理	|	服务提供者所在的分层。如：biz、dao、intl:web、china:acton。	|2.0.7以上版本|
|register	|register|	boolean	|可选	|true|	服务治理|该协议的服务是否注册到注册中心	|2.0.8以上版本|



 
原文： [<<ServiceConfig对象的建模>>](https://blog.elastic.link/2022/07/10/dubbo/2-qi-dong-fu-wu-qian-fu-wu-pei-zhi-serviceconfig-lei-xing-shi-ru-he-chu-shi-hua-de/ )
