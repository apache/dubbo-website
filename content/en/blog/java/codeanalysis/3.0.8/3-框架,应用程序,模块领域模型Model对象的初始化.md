---
title: "03-框架,应用程序,模块领域模型Model对象的初始化"
linkTitle: "3-框架,应用程序,模块领域模型Model对象的初始化"
date: 2022-08-03
author: 宋小生
tags: ["源码解析", "Java"]
description: Dubbo 源码解析之框架,应用程序,模块领域模型 Model 对象的初始化
---

# 3-框架,应用程序,模块领域模型Model对象的初始化
在上一章中我们详细看了服务配置ServiceConfig类型的初始化，不过我们跳过了AbstractMethodConfig的构造器中创建模块模型对象的过程，那这一章我们就来看下模块模型对象的初始化过程:

```java
public AbstractMethodConfig() {
        super(ApplicationModel.defaultModel().getDefaultModule());
    }
```
**那为什么会在Dubbo3的新版本中加入这个域模型呢**，主要有如下原因
之前dubbo都是只有一个作用域的，通过静态类 属性共享
增加域模型是为了:
1. 让Dubbo支持多应用的部署，这块一些大企业有诉求
2. 从架构设计上，解决静态属性资源共享、清理的问题
3. 分层模型将应用的管理和服务的管理分开

可能比较抽象，可以具体点来看。Dubbo3中在启动时候需要启动配置中心、元数据中心，这个配置中心和元数据中心可以归应用模型来管理。Dubbo作为RPC框架又需要启动服务和引用服务，服务级别的管理就交给了这个模块模型来管理。分层次的管理方便我们理解和处理逻辑，父子级别的模型又方便了数据传递。

了解过JVM类加载机制的同学应该就比较清楚JVM类加载过程中的数据访问模型。子类加载器先交给父类加载器查找，找不到再从子类加载器中查找。Dubbo的分层模型类似这样一种机制，这一章先来简单了解下，后面用到时候具体细说。

## 	3.1 模型对象的关系
为了不增加复杂性，我们这里仅仅列出模型对象类型类型之间的继承关系如下所示:
![在这里插入图片描述](/imgs/blog/source-blog/3-model.png)
<center>图3.1 模型对象的继承关系</center>

模型对象一共有4个，公共的属性和操作放在了域模型类型中，下面我们来详细说下这几个模型类型:

 - **ExtensionAccessor** 扩展的统一访问器
 	- 用于获取扩展加载管理器ExtensionDirector对象
 	- **获取扩展对象ExtensionLoader**
 	- 根据扩展名字**获取具体扩展对象**
 	- 获取自适应扩展对象
 	- 获取默认扩展对象
 - **ScopeModel** 模型对象的公共抽象父类型
 	- 	内部id用于表示模型树的层次结构
 	-  公共模型名称，可以被用户设置
 	-  描述信息
 	- 类加载器管理
 	- 父模型管理parent
 	- 当前模型的所属域ExtensionScope有:**FRAMEWORK(框架)**，**APPLICATION(应用)**，**MODULE(模块)**，**SELF(自给自足**，为每个作用域创建一个实例，用于特殊的SPI扩展，如ExtensionInjector)
 	- 具体的扩展加载程序管理器对象的管理:**ExtensionDirector**
 	- 域Bean工厂管理，一个内部共享的Bean工厂**ScopeBeanFactory**
 	- 等等

 - **FrameworkModel** dubbo框架模型，可与多个应用程序共享
 	- FrameworkModel实例对象集合，allInstances
 	- 所有ApplicationModel实例对象集合，applicationModels
 	- 发布的ApplicationModel实例对象集合pubApplicationModels
 	- 框架的服务存储库**FrameworkServiceRepository**类型对象(数据存储在内存中)
 	- 内部的应用程序模型对象internalApplicationModel
 - **ApplicationModel**  表示正在使用Dubbo的应用程序，并存储基本**元数据信息**，以便在RPC调用过程中使用。
ApplicationModel包括许多关于**发布服务**的ProviderModel和许多关于订阅服务的Consumer Model。
	- ExtensionLoader、DubboBootstrap和这个类目前被设计为单例或静态（本身完全静态或使用一些静态字段）。因此，从它们返回的实例属于流程范围。如果想在一个进程中支持多个dubbo服务器，可能需要重构这三个类。
	- **所有ModuleModel实例**对象集合moduleModels
	- **发布的ModuleModel实例**对象集合pubModuleModels
	- **环境信息Environment实例**对象environment
	- **配置管理ConfigManager实例**对象configManager
	- **服务存储库ServiceRepository实例**对象serviceRepository
	- **应用程序部署器ApplicationDeployer实例**对象deployer
	- **所属框架FrameworkModel实例**对象frameworkModel
	- **内部的模块模型ModuleModel实例**对象internalModule
	- **默认的模块模型ModuleModel实例**对象defaultModule
- **ModuleModel** 服务模块的模型
  - **所属应用程序模型ApplicationModel实例**对象applicationModel
  - **模块环境信息ModuleEnvironment实例**对象moduleEnvironment
   - **模块服务存储库ModuleServiceRepository实例**对象serviceRepository
  - **模块的服务配置管理ModuleConfigManager实例**对象moduleConfigManager
  - **模块部署器ModuleDeployer实例**对象deployer用于导出和引用服务


了解了这几个模型对象的关系我们可以了解到这几个模型对象的管理层级从框架到应用程序，然后到模块的管理(FrameworkModel->ApplicationModel->ModuleModel)，他们主要用来针对框架，应用程序，模块的**存储**，**发布管理，**，**配置管理**

看来Dubbo3 针对应用服务治理与运维这一块也是在努力尝试.


### 3.1.1 AbstractMethodConfig 配置对象中获取模型对象的调用

模块模型(ModuleModel)参数对象的创建
这个AbstractMethodConfig构造器在初始化的时候调调用了这么一行代码做为参数向父类型传递对象.

```java
ApplicationModel.defaultModel().getDefaultModule()
```
默认情况下使用ApplicationModel的静态方法获取默认的模型对象和默认的模块对象

**ApplicationModel**(应用程序领域模型)类型中获取默认模型对象的方法:

```java
 public static ApplicationModel defaultModel() {
        // should get from default FrameworkModel, avoid out of sync
        return FrameworkModel.defaultModel().defaultApplication();
    }
```
这里可以看到要想获取应用程序模型必须先通过框架领域模型来获取层级也是框架领域模型到应用程序领域模型

### 3.1.2 使用双重校验锁获取框架模型对象
FrameworkModel(框架模型)的默认模型获取工厂方法defaultModel()
```java
	/**
	* 在源码的注释上有这么一句话:在销毁默认的 FrameworkModel 时， FrameworkModel.defaultModel() 
	*或ApplicationModel.defaultModel() 将返回一个损坏的模型
	*可能会导致不可预知的问题。建议：尽量避免使用默认模型。
	*/
   public static FrameworkModel defaultModel() {
       //双重校验锁的形式创建单例对象
        FrameworkModel instance = defaultInstance;
        if (instance == null) {
            synchronized (globalLock) {
            	//重置默认框架模型
                resetDefaultFrameworkModel();
                if (defaultInstance == null) {
                    defaultInstance = new FrameworkModel();
                }
                instance = defaultInstance;
            }
        }
        Assert.notNull(instance, "Default FrameworkModel is null");
        return instance;
    }
```

### 3.1.3 刷新重置默认框架模型对象
FrameworkModel中的重置默认框架模型resetDefaultFrameworkModel
```java
  private static void resetDefaultFrameworkModel() {
  		//全局悲观锁，同一个时刻只能有一个线程执行重置操作
        synchronized (globalLock) {
        	//defaultInstance为当前成员变量FrameworkModel类型代表当前默认的FrameworkModel类型的实例对象
            if (defaultInstance != null && !defaultInstance.isDestroyed()) {
                return;
            }
            FrameworkModel oldDefaultFrameworkModel = defaultInstance;
            //存在实例模型列表则直接从内存缓存中查后续不需要创建了
            if (allInstances.size() > 0) {
            	//当前存在的有FrameworkModel框架实例多个列表则取第一个为默认的
                defaultInstance = allInstances.get(0);
            } else {
                defaultInstance = null;
            }
            if (oldDefaultFrameworkModel != defaultInstance) {
                if (LOGGER.isInfoEnabled()) {
                    LOGGER.info("Reset global default framework from " + safeGetModelDesc(oldDefaultFrameworkModel) + " to " + safeGetModelDesc(defaultInstance));
                }
            }
        }
    }
```


上面单例做了很多的初始化操作，这里开始调用构造器来创建框架模型对象，如下代码:
## 3.2  创建FrameworkModel对象
 FrameworkModel()构造器
```java
public FrameworkModel() {
		//调用父类型ScopeModel传递参数，这个构造器的第一个参数为空代表这是一个顶层的域模型，第二个代表了这个是框架FRAMEWORK域，第三个false不是内部域
        super(null, ExtensionScope.FRAMEWORK, false);
        //内部id用于表示模型树的层次结构，如层次结构:
        //FrameworkModel（索引=1）->ApplicationModel（索引=2）->ModuleModel（索引=1，第一个用户模块）
        //这个index变量是static类型的为静态全局变量默认值从1开始，如果有多个框架模型对象则internalId编号从1开始依次递增
        this.setInternalId(String.valueOf(index.getAndIncrement()));
        // register FrameworkModel instance early
        //将当前新创建的框架实例对象添加到容器中
        synchronized (globalLock) {
        	//将当前框架模型实例添加到所有框架模型缓存对象中
            allInstances.add(this);
            //如上面代码所示重置默认的框架模型对象，这里将会是缓存实例列表的第一个，新增了一个刷新默认实例对象
            resetDefaultFrameworkModel();
        }
        if (LOGGER.isInfoEnabled()) {
            LOGGER.info(getDesc() + " is created");
        }
        //初始化框架模型领域对象
        initialize();
    }
```

 ExtensionScope.FRAMEWORK

### 3.2.1 初始化FrameworkModel
FrameworkModel框架模型的初始化方法initialize()
```java
@Override
    protected void initialize() {
      //这里初始化之前先调用下父类型ScopeModel的初始化方法我们在下面来看
        super.initialize();
		//使用TypeDefinitionBuilder的静态方法initBuilders来初始化类型构建器TypeBuilder类型集合
        TypeDefinitionBuilder.initBuilders(this);
		//框架服务存储仓库对象，可以用于快速查询服务提供者信息
        serviceRepository = new FrameworkServiceRepository(this);
		//获取ScopeModelInitializer类型(域模型初始化器)的扩展加载器ExtensionLoader，每个扩展类型都会创建一个扩展加载器缓存起来
        ExtensionLoader<ScopeModelInitializer> initializerExtensionLoader = this.getExtensionLoader(ScopeModelInitializer.class);
        //获取ScopeModelInitializer类型的支持的扩展集合，这里当前版本存在8个扩展类型实现
        Set<ScopeModelInitializer> initializers = initializerExtensionLoader.getSupportedExtensionInstances();
        //遍历这些扩展实现调用他们的initializeFrameworkModel方法来传递FrameworkModel类型对象，细节我们待会再详细说下
        for (ScopeModelInitializer initializer : initializers) {
            initializer.initializeFrameworkModel(this);
        }
		//创建一个内部的ApplicationModel类型，细节下面说
        internalApplicationModel = new ApplicationModel(this, true);
        //创建ApplicationConfig类型对象同时传递应用程序模型对象internalApplicationModel
        //获取ConfigManager类型对象，然后设置添加当前应用配置对象
       internalApplicationModel.getApplicationConfigManager().setApplication(
            new ApplicationConfig(internalApplicationModel, CommonConstants.DUBBO_INTERNAL_APPLICATION));
            //设置公开的模块名字为常量DUBBO_INTERNAL_APPLICATION
        internalApplicationModel.setModelName(CommonConstants.DUBBO_INTERNAL_APPLICATION);
    }
```



继续上面代码的调用链路，我们来看
FrameworkModel的super.initialize();方法 调用父类型ScopeModel的initialize()方法

### 3.2.2 初始化ScopeModel
ScopeModel类型的初始化方法initialize():
```java
protected void initialize() {
		//初始化ExtensionDirector是一个作用域扩展加载程序管理器。
		//ExtensionDirector支持多个级别，子级可以继承父级的扩展实例。
		//查找和创建扩展实例的方法类似于Java classloader。
        this.extensionDirector = new ExtensionDirector(parent != null ? parent.getExtensionDirector() : null, scope, this);
        //这个参考了Spring的生命周期回调思想，添加一个扩展初始化的前后调用的处理器，在扩展初始化之前或之后调用的后处理器，参数类型为ExtensionPostProcessor
        this.extensionDirector.addExtensionPostProcessor(new ScopeModelAwareExtensionProcessor(this));
        //创建一个内部共享的域工厂对象，用于注册Bean，创建Bean，获取Bean，初始化Bean等
        this.beanFactory = new ScopeBeanFactory(parent != null ? parent.getBeanFactory() : null, extensionDirector);
        //使用数据结构链表，创建销毁监听器容器，一般用于关闭进程，重置应用程序对象等操作时候调用
        this.destroyListeners = new LinkedList<>();
        //使用ConcurrentHashMap属性集合
        this.attributes = new ConcurrentHashMap<>();
        //使用ConcurrentHashSet存储当前域下的类加载器
        this.classLoaders = new ConcurrentHashSet<>();

        // Add Framework's ClassLoader by default
        //将当前类的加载器存入加载器集合classLoaders中
        ClassLoader dubboClassLoader = ScopeModel.class.getClassLoader();
        if (dubboClassLoader != null) {
            this.addClassLoader(dubboClassLoader);
        }
    }
```


### 3.2.3 初始类型定义构建器

TypeDefinitionBuilder的初始化类型构造器方法initBuilders

```java
public static void initBuilders(FrameworkModel model) {
        Set<TypeBuilder> tbs = model.getExtensionLoader(TypeBuilder.class).getSupportedExtensionInstances();
        BUILDERS = new ArrayList<>(tbs);
    }
```


####  3.2.3.1 服务存储仓库对象的创建
FrameworkServiceRepository对象的初始化

```java
public FrameworkServiceRepository(FrameworkModel frameworkModel) {
        this.frameworkModel = frameworkModel;
    }
```

### 3.2.4  域模型初始化器的获取与初始化回调
域模型初始化器的获取与初始化(ScopeModelInitializer类型和initializeFrameworkModel方法)
加载到的ScopeModelInitializer类型的SPI扩展实现

```java
ExtensionLoader<ScopeModelInitializer> initializerExtensionLoader = this.getExtensionLoader(ScopeModelInitializer.class);
    //获取ScopeModelInitializer类型的支持的扩展集合，这里当前版本存在8个扩展类型实现
    Set<ScopeModelInitializer> initializers = initializerExtensionLoader.getSupportedExtensionInstances();
    //遍历这些扩展实现调用他们的initializeFrameworkModel方法来传递FrameworkModel类型对象，细节我们待会再详细说下
    for (ScopeModelInitializer initializer : initializers) {
        initializer.initializeFrameworkModel(this);
    }
```

通过Debug查到域模型初始化器的SPI扩展类型有如下8个:

![在这里插入图片描述](/imgs/blog/source-blog/3-initextent.png)

这里我随机找两个说一下吧:
容错域模型初始化器:ClusterScopeModelInitializer的initializeFrameworkModel方法:

```java
public class ClusterScopeModelInitializer implements ScopeModelInitializer {
    @Override
    public void initializeFrameworkModel(FrameworkModel frameworkModel) {
        ScopeBeanFactory beanFactory = frameworkModel.getBeanFactory();
        beanFactory.registerBean(RouterSnapshotSwitcher.class);
    }
```


```java
public class CommonScopeModelInitializer implements ScopeModelInitializer {
    @Override
    public void initializeFrameworkModel(FrameworkModel frameworkModel) {
        ScopeBeanFactory beanFactory = frameworkModel.getBeanFactory();
        beanFactory.registerBean(FrameworkExecutorRepository.class);
    }
```

```java
public class ConfigScopeModelInitializer implements ScopeModelInitializer {

    @Override
    public void initializeFrameworkModel(FrameworkModel frameworkModel) {
        frameworkModel.addDestroyListener(new FrameworkModelCleaner());
    }
```

### 3.2.5 将内部应用配置对象创建与添加至应用模型中
创建ApplicationConfig对象让后将其添加至应用模型中
内部应用程序模型，这里为应用配置管理器设置一个应用配置对象，将这个应用配置的模块名字配置名字设置为DUBBO_INTERNAL_APPLICATION，应用配置记录着我们常见的应用配置信息，如下面表格所示:
```java
 //获取ConfigManager类型对象，然后设置添加当前应用配置对象
   internalApplicationModel.getApplicationConfigManager().setApplication(
        new ApplicationConfig(internalApplicationModel, CommonConstants.DUBBO_INTERNAL_APPLICATION));
        //设置公开的模块名字为常量DUBBO_INTERNAL_APPLICATION
    internalApplicationModel.setModelName(CommonConstants.DUBBO_INTERNAL_APPLICATION);
```
   来自官网目前版本的配置解释:
   官网当前的配置描述知道到了元数据类型，后面我再补充几个

| 属性 | 对应URL参数 |类型 | 是否必填	|缺省值	 | 作用	 | 描述|兼容性|
|--|--|--|--|--|--|--|--|
|  name|  	application	|  string|  	必填		|  |  服务治理	|  当前应用名称，用于注册中心计算应用间依赖关系，注意：消费者和提供者应用名不要一样，此参数不是匹配条件，你当前项目叫什么名字就填什么，和提供者消费者角色无关，比如：kylin应用调用了morgan应用的服务，则kylin项目配成kylin，morgan项目配成morgan，可能kylin也提供其它服务给别人使用，但kylin项目永远配成kylin，这样注册中心将显示kylin依赖于morgan	|  1.0.16以上版本|
|  version|  	application.version	|  string|  	可选|  		|  服务治理	|  当前应用的版本|  	2.2.0以上版本|
|  owner|  	owner|  	string	|  可选|  		|  服务治理|  	应用负责人，用于服务治理，请填写负责人公司邮箱前缀	|  2.0.5以上版本|
|  organization	|  organization	|  string|  	可选|  |  		服务治理	|  组织名称(BU或部门)，用于注册中心区分服务来源，此配置项建议不要使用autoconfig，直接写死在配置中，比如china,intl,itu,crm,asc,dw,aliexpress等	|  2.0.0以上版本|
|  architecture|  architecture|  string|  	可选	|  |  	服务治理|  	用于服务分层对应的架构。如，intl、china。不同的架构使用不同的分层。	|  2.0.7以上版本
|  environment	|  environment|  	string|  	可选		|  |  服务治理|  	应用环境，如：develop/test/product，不同环境使用不同的缺省值，以及作为只用于开发测试功能的限制条件	|  2.0.0以上版本|  
|  compiler|  	compiler|  	string	|  可选|  	javassist	|  性能优化|  	Java字节码编译器，用于动态类的生成，可选：jdk或javassist	|  2.1.0以上版本|  
|  logger	|  logger|  	string	|  可选|  	slf4j	|  性能优化|  	日志输出方式，可选：slf4j,jcl,log4j,log4j2,jdk	|  2.2.0以上版本|  
|  metadata-type	|  metadata-type	|  String	|  可选|  	local	|  服务治理	|  metadata 传递方式，是以 Provider 视角而言的，Consumer 侧配置无效，可选值有：remote - Provider 把 metadata 放到远端注册中心，Consumer 从注册中心获取local - Provider 把 metadata 放在本地，Consumer 从 Provider 处直接获取	|  2.7.6以上版本| 

当前在Dubbo3.0.7中还有一些的配置我下面列举下:
| 属性 | 对应URL参数 |类型 | 是否必填	|缺省值	 | 作用	 | 描述|兼容性|
|--|--|--|--|--|--|--|--|
|register-consumer| register-consumer|boolean|可选|false|服务治理|是否注册使用者实例，默认为false。||
|register-mode|register-mode|string|可选|all|服务治理|将interface/instance/all 地址注册到注册中心，默认为all。|
|enable-empty-protection|enable-empty-protection|boolean|可选|true|服务治理|在空地址通知上启用空保护，默认为true||
|protocol|protocol|string|可选|dubbo|服务治理|此应用程序的首选协议（名称）||




## 3.3 创建ApplicationModel对象
ApplicationModel对象的初始化调用
 在前面 3.2.4 FrameworkModel框架模型的初始化方法initialize() 章节中，我们看到了代码ApplicationModel对象的初始化调用如下代码，这里我们来详细说一下:
```java
 internalApplicationModel = new ApplicationModel(this, true);
        internalApplicationModel.getApplicationConfigManager().setApplication(
            new ApplicationConfig(internalApplicationModel, CommonConstants.DUBBO_INTERNAL_APPLICATION));
        internalApplicationModel.setModelName(CommonConstants.DUBBO_INTERNAL_APPLICATION);
   
```

### 3.3.1 ApplicationModel的构造器
ApplicationModel(FrameworkModel frameworkModel, boolean isInternal)
刚刚3.2.9那个地方我们看到了使用代码**new ApplicationModel(this, true)** 来创建对象这里我们详细看下代码细节:


```java
public ApplicationModel(FrameworkModel frameworkModel, boolean isInternal) {
		//调用父类型ScopeModel传递参数，这个构造器的传递没与前面看到的FrameworkModel构造器的中的调用参数有些不同第一个参数我们为frameworkModel代表父域模型，第二个参数标记域为应用程序级别APPLICATION，第三个参数我们传递的为true代表为内部域
        super(frameworkModel, ExtensionScope.APPLICATION, isInternal);
        Assert.notNull(frameworkModel, "FrameworkModel can not be null");
        //应用程序域成员变量记录frameworkModel对象
        this.frameworkModel = frameworkModel;
        //frameworkModel对象添加当前应用程序域对象
        frameworkModel.addApplication(this);
        if (LOGGER.isInfoEnabled()) {
            LOGGER.info(getDesc() + " is created");
        }
        //初始化应用程序
        initialize();
    }
```


#### 3.3.1.1 将ApplicationModel添加至FrameworkModel容器中
FrameworkModel的添加应用程序方法addApplication:

```java
void addApplication(ApplicationModel applicationModel) {
        // can not add new application if it's destroying
        //检查FrameworkModel对象是否已经被标记为销毁状态，如果已经被销毁了则抛出异常无需执行逻辑
        checkDestroyed();
        synchronized (instLock) {
        	//如果还未添加过当前参数传递应用模型
            if (!this.applicationModels.contains(applicationModel)) {
            	//为当前应用模型生成内部id
                applicationModel.setInternalId(buildInternalId(getInternalId(), appIndex.getAndIncrement()));
                //添加到成员变量集合applicationModels中
                this.applicationModels.add(applicationModel);
                //如果非内部的则也向公开应用模型集合pubApplicationModels中添加一下
                if (!applicationModel.isInternal()) {
                    this.pubApplicationModels.add(applicationModel);
                }
                resetDefaultAppModel();
            }
        }
    }
```
内部id生成算法buildInternalId方法代码如下:
看代码胜过，文字解释
```java
 protected String buildInternalId(String parentInternalId, long childIndex) {
        // FrameworkModel    1
        // ApplicationModel  1.1
        // ModuleModel       1.1.1
        if (StringUtils.hasText(parentInternalId)) {
            return parentInternalId + "." + childIndex;
        } else {
            return "" + childIndex;
        }
    }
```

 **重置默认的应用模型对象**
FrameworkModel 重置默认的应用模型对象 resetDefaultAppModel()方法
与默认框架模型设置方式类似取集合的第一个，这里应用模型需要使用公开的应用模型的第一个做为默认应用模型，代码如下所示:
```java
private void resetDefaultAppModel() {
        synchronized (instLock) {
            if (this.defaultAppModel != null && !this.defaultAppModel.isDestroyed()) {
                return;
            }
            //取第一个公开的应用模型做为默认应用模型
            ApplicationModel oldDefaultAppModel = this.defaultAppModel;
            if (pubApplicationModels.size() > 0) {
                this.defaultAppModel = pubApplicationModels.get(0);
            } else {
                this.defaultAppModel = null;
            }
            if (defaultInstance == this && oldDefaultAppModel != this.defaultAppModel) {
                if (LOGGER.isInfoEnabled()) {
                    LOGGER.info("Reset global default application from " + safeGetModelDesc(oldDefaultAppModel) + " to " + safeGetModelDesc(this.defaultAppModel));
                }
            }
        }
    }
```

### 3.3.2 初始化ApplicationModel
ApplicationModel的初始化initialize()方法
在前面**3.2.10 ApplicationModel的构造器ApplicationModel(FrameworkModel frameworkModel, boolean isInternal)** 中的最后一行开始初始化应用模型我们还未详细说明下面可以来看下

```java
@Override
    protected void initialize() {
    //这个是调用域模型来初始化基础信息如扩展访问器等，可以参考 3.2.5 ScopeModel类型的初始化方法initialize()章节
        super.initialize();
        //创建一个内部的模块模型对象
        internalModule = new ModuleModel(this, true);
        //创建一个独立服务存储对象
        this.serviceRepository = new ServiceRepository(this);
		//获取应用程序初始化监听器ApplicationInitListener扩展
        ExtensionLoader<ApplicationInitListener> extensionLoader = this.getExtensionLoader(ApplicationInitListener.class);
        //如果存在应用程序初始化监听器扩展则执行这个初始化方法，在当前的版本还未看到有具体的扩展实现类型
        Set<String> listenerNames = extensionLoader.getSupportedExtensions();
        for (String listenerName : listenerNames) {
            extensionLoader.getExtension(listenerName).init();
        }
		//初始化扩展(这个是应用程序生命周期的方法调用，这里调用初始化方法
        initApplicationExts();
        
		//获取域模型初始化器扩展对象列表，然后执行初始化方法
        ExtensionLoader<ScopeModelInitializer> initializerExtensionLoader = this.getExtensionLoader(ScopeModelInitializer.class);
        Set<ScopeModelInitializer> initializers = initializerExtensionLoader.getSupportedExtensionInstances();
        for (ScopeModelInitializer initializer : initializers) {
            initializer.initializeApplicationModel(this);
        }
    }
```

 ### 3.3.4 initApplicationExts()  初始化应用程序扩展方法
```java
   private void initApplicationExts() {
   //这个扩展实现一共有两个可以看下面那个图扩展类型为ConfigManager和Environment
        Set<ApplicationExt> exts = this.getExtensionLoader(ApplicationExt.class).getSupportedExtensionInstances();
        for (ApplicationExt ext : exts) {
            ext.initialize();
        }
    }
```

![在这里插入图片描述](/imgs/blog/source-blog/3-extension.png)

#### 3.3.4.1 ConfigManager类型的initialize方法
先简单说下ConfigManager的作用，无锁配置管理器（通过ConcurrentHashMap），用于快速读取操作。写入操作锁带有配置类型的子配置映射，用于安全检查和添加新配置。
其实ConfigManager实现类中并没有这个初始化方法initialize，不过ConfigManager的父类型AbstractConfigManager中是有initialize方法的，如下所示:

AbstractConfigManager的初始化方法initialize
```java
@Override
    public void initialize() throws IllegalStateException {
    	//乐观锁判断是否初始化过
        if (!initialized.compareAndSet(false, true)) {
            return;
        }
        //从模块环境中获取组合配置，目前Environment中有6种重要的配置，我们后面详细说
        CompositeConfiguration configuration = scopeModel.getModelEnvironment().getConfiguration();

        // dubbo.config.mode获取配置模式，配置模式对应枚举类型ConfigMode，目前有这么几个STRICT，OVERRIDE，OVERRIDE_ALL，OVERRIDE_IF_ABSENT，IGNORE，这个配置决定了属性覆盖的顺序，当有同一个配置key多次出现时候，以最新配置为准，还是以最老的那个配置为准，还是配置重复则抛出异常，默认值为严格模式STRICT重复则抛出异常
        String configModeStr = (String) configuration.getProperty(ConfigKeys.DUBBO_CONFIG_MODE);
        try {
            if (StringUtils.hasText(configModeStr)) {
                this.configMode = ConfigMode.valueOf(configModeStr.toUpperCase());
            }
        } catch (Exception e) {
            String msg = "Illegal '" + ConfigKeys.DUBBO_CONFIG_MODE + "' config value [" + configModeStr + "], available values " + Arrays.toString(ConfigMode.values());
            logger.error(msg, e);
            throw new IllegalArgumentException(msg, e);
        }

        // dubbo.config.ignore-duplicated-interface
        //忽略重复的接口（服务/引用）配置。默认值为false
        String ignoreDuplicatedInterfaceStr = (String) configuration
            .getProperty(ConfigKeys.DUBBO_CONFIG_IGNORE_DUPLICATED_INTERFACE);
        if (ignoreDuplicatedInterfaceStr != null) {
            this.ignoreDuplicatedInterface = Boolean.parseBoolean(ignoreDuplicatedInterfaceStr);
        }

        // print 打印配置信息
        Map<String, Object> map = new LinkedHashMap<>();
        map.put(ConfigKeys.DUBBO_CONFIG_MODE, configMode);
        map.put(ConfigKeys.DUBBO_CONFIG_IGNORE_DUPLICATED_INTERFACE, this.ignoreDuplicatedInterface);
        logger.info("Config settings: " + map);
    }
```


#### 3.3.4.2 Environment类型的initialize方法
这是一个与环境配置有关系的类型，我们先来简单了解下它的初始化方法，后期再详细说明:

Environment类型的initialize方法
```java
 @Override
    public void initialize() throws IllegalStateException {
    	//乐观锁判断是否进行过初始化
        if (initialized.compareAndSet(false, true)) {
        	//PropertiesConfiguration从系统属性和dubbo.properties中获取配置
            this.propertiesConfiguration = new PropertiesConfiguration(scopeModel);
            //SystemConfiguration获取的是JVM参数 启动命令中-D指定的
            this.systemConfiguration = new SystemConfiguration();
            //EnvironmentConfiguration是从环境变量中获取的配置
            this.environmentConfiguration = new EnvironmentConfiguration();
            //外部的Global配置config-center global/default config
            this.externalConfiguration = new InmemoryConfiguration("ExternalConfig");
            //外部的应用配置如:config-center中的应用配置
            this.appExternalConfiguration = new InmemoryConfiguration("AppExternalConfig");
            //本地应用配置 ， 如Spring Environment/PropertySources/application.properties
            this.appConfiguration = new InmemoryConfiguration("AppConfig");
			//服务迁移配置加载 dubbo2升级dubbo3的一些配置
            loadMigrationRule();
        }
    }
	//服务迁移配置加载 JVM  > env >  代码路径dubbo-migration.yaml
    private void loadMigrationRule() {
     //文件路径配置的key dubbo.migration.file
     // JVM参数中获取
        String path = System.getProperty(CommonConstants.DUBBO_MIGRATION_KEY);
        if (StringUtils.isEmpty(path)) {
        //env环境变量中获取
            path = System.getenv(CommonConstants.DUBBO_MIGRATION_KEY);
            if (StringUtils.isEmpty(path)) {
            //类路径下获取文件dubbo-migration.yaml
                path = CommonConstants.DEFAULT_DUBBO_MIGRATION_FILE;
            }
        }
        this.localMigrationRule = ConfigUtils.loadMigrationRule(scopeModel.getClassLoaders(), path);
    }
```

**ConfigUtils中读取迁移规则配置文件loadMigrationRule**
这个我们不细说了，贴一下代码感兴趣可以了解下，这个代码主要是读取文件到内存字符串:

```java
 public static String loadMigrationRule(Set<ClassLoader> classLoaders, String fileName) {
        String rawRule = "";
        if (checkFileNameExist(fileName)) {
            try {
                try (FileInputStream input = new FileInputStream(fileName)) {
                    return readString(input);
                }
            } catch (Throwable e) {
                logger.warn("Failed to load " + fileName + " file from " + fileName + "(ignore this file): " + e.getMessage(), e);
            }
        }

        try {
            List<ClassLoader> classLoadersToLoad = new LinkedList<>();
            classLoadersToLoad.add(ClassUtils.getClassLoader());
            classLoadersToLoad.addAll(classLoaders);
            for (Set<URL> urls : ClassLoaderResourceLoader.loadResources(fileName, classLoadersToLoad).values()) {
                for (URL url : urls) {
                    InputStream is = url.openStream();
                    if (is != null) {
                        return readString(is);
                    }
                }
            }
        } catch (Throwable e) {
            logger.warn("Failed to load " + fileName + " file from " + fileName + "(ignore this file): " + e.getMessage(), e);
        }
        return rawRule;
    }

    private static String readString(InputStream is) {
        StringBuilder stringBuilder = new StringBuilder();
        char[] buffer = new char[10];
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            int n;
            while ((n = reader.read(buffer)) != -1) {
                if (n < 10) {
                    buffer = Arrays.copyOf(buffer, n);
                }
                stringBuilder.append(String.valueOf(buffer));
                buffer = new char[10];
            }
        } catch (IOException e) {
            logger.error("Read migration file error.", e);
        }

        return stringBuilder.toString();
    }

    /**
     * check if the fileName can be found in filesystem
     *
     * @param fileName
     * @return
     */
    private static boolean checkFileNameExist(String fileName) {
        File file = new File(fileName);
        return file.exists();
    }
```

​    

## 3.4 创建ModuleModel对象
前面ApplicationModel对象初始化的时候创建了ModuleModel如下代码:

```java
internalModule = new ModuleModel(this, true);
```

这里我们来看下这个它所对应的构造器


```java
public ModuleModel(ApplicationModel applicationModel, boolean isInternal) {
		//调用ScopeModel传递3个参数父模型，模型域为模块域，是否为内部模型参数为true
        super(applicationModel, ExtensionScope.MODULE, isInternal);
        Assert.notNull(applicationModel, "ApplicationModel can not be null");
        //初始化成员变量applicationModel
        this.applicationModel = applicationModel;
        //将模块模型添加至应用模型中
        applicationModel.addModule(this, isInternal);
        if (LOGGER.isInfoEnabled()) {
            LOGGER.info(getDesc() + " is created");
        }
		//初始化模块模型
        initialize();
        Assert.notNull(serviceRepository, "ModuleServiceRepository can not be null");
        Assert.notNull(moduleConfigManager, "ModuleConfigManager can not be null");
        Assert.assertTrue(moduleConfigManager.isInitialized(), "ModuleConfigManager can not be initialized");

        // notify application check state
        //获取应用程序发布对象，通知检查状态
        ApplicationDeployer applicationDeployer = applicationModel.getDeployer();
        if (applicationDeployer != null) {
            applicationDeployer.notifyModuleChanged(this, DeployState.PENDING);
        }
    }
```

### 3.4.1 将模块模型添加至应用模型中
如上面代码所示调用如下代码将模块模型添加到应用模型中:

```java
 applicationModel.addModule(this, isInternal);
```
这里我们来看下添加过程

```java 

void addModule(ModuleModel moduleModel, boolean isInternal) {
		//加锁
        synchronized (moduleLock) {
        	//不存在则添加
            if (!this.moduleModels.contains(moduleModel)) {
            	//检查应用模型是否已销毁
                checkDestroyed();
                //添加至模块模型成员变量中
                this.moduleModels.add(moduleModel);
                //设置模块模型内部id，这个内部id生成过程与上面将应用模型添加到框架模型中的方式是一致的
                //可以参考 3.3.2 将ApplicationModel添加至FrameworkModel容器中
                moduleModel.setInternalId(buildInternalId(getInternalId(), moduleIndex.getAndIncrement()));
                //如果不是内部模型则添加到公开模块模型中
                if (!isInternal) {
                    pubModuleModels.add(moduleModel);
                }
            }
        }
    }
```

### 3.4.2 初始化模块模型
前面ModuleModel构造器中通过initialize()方法来进行初始化操作如下代码:

```java
@Override
    protected void initialize() {
    	//调用域模型ScopeModel的初始化，可以参考 3.2.5 ScopeModel类型的初始化方法initialize()章节
        super.initialize();
        //创建模块服务存储库对象
        this.serviceRepository = new ModuleServiceRepository(this);
        //创建模块配置管理对象
        this.moduleConfigManager = new ModuleConfigManager(this);
        //初始化模块配置管理对象
        this.moduleConfigManager.initialize();

		//初始化模块配置扩展
        initModuleExt();
		
		//初始化域模型扩展
        ExtensionLoader<ScopeModelInitializer> initializerExtensionLoader = this.getExtensionLoader(ScopeModelInitializer.class);
        Set<ScopeModelInitializer> initializers = initializerExtensionLoader.getSupportedExtensionInstances();
        for (ScopeModelInitializer initializer : initializers) {
            initializer.initializeModuleModel(this);
        }
    }
```
#### 3.4.2.1 模块服务存储库的创建
ModuleServiceRepository是模块模型中用来存储服务的通过如下代码调用

```java
//创建模块服务存储库对象
        this.serviceRepository = new ModuleServiceRepository(this);
       
```
这里我们来看下模块服务存储库的构造器代码:

```java
 public ModuleServiceRepository(ModuleModel moduleModel) {
 		//初始化模块模型
        this.moduleModel = moduleModel;
        //
        frameworkServiceRepository = ScopeModelUtil.getFrameworkModel(moduleModel).getServiceRepository();
    }
```

ModuleServiceRepository存储库中使用框架存储库frameworkServiceRepository来间接存储
这里我们看下怎么通过模块模型获取框架服务存储库frameworkServiceRepository:通过代码

```java
ScopeModelUtil.getFrameworkModel(moduleModel).getServiceRepository()
```

ScopeModelUtil工具类获取getFrameworkModel代码如下:
```java
public static FrameworkModel getFrameworkModel(ScopeModel scopeModel) {
        if (scopeModel == null) {
            return FrameworkModel.defaultModel();
        }
        //通过成员变量获取(构造器初始化的时候将FrameworkModel赋值给了ApplicationModel的成员变量
        if (scopeModel instanceof ApplicationModel) {
        	//直接获取
            return ((ApplicationModel) scopeModel).getFrameworkModel();
        } else if (scopeModel instanceof ModuleModel) {
            ModuleModel moduleModel = (ModuleModel) scopeModel;
            //间接通过ApplicationModel获取，不越级获取
            return moduleModel.getApplicationModel().getFrameworkModel();
        } else if (scopeModel instanceof FrameworkModel) {
            return (FrameworkModel) scopeModel;
        } else {
            throw new IllegalArgumentException("Unable to get FrameworkModel from " + scopeModel);
        }
    }
```

#### 3.4.2.2 模块配置管理器对象的创建与初始化


```java
 //创建模块配置管理对象
        this.moduleConfigManager = new ModuleConfigManager(this);
        //初始化模块配置管理对象
        this.moduleConfigManager.initialize();
```


ModuleConfigManager的构造器代码如下:
```java
public ModuleConfigManager(ModuleModel moduleModel) {
	//向抽象的配置管理器AbstractConfigManager传递参数
	//模块模型参数，模块支持的配置类型集合
        super(moduleModel, Arrays.asList(ModuleConfig.class, ServiceConfigBase.class, ReferenceConfigBase.class, ProviderConfig.class, ConsumerConfig.class));
        //获取应用程序配置管理器
        applicationConfigManager = moduleModel.getApplicationModel().getApplicationConfigManager();
    }
    
```

ModuleConfigManager类型的初始化方法代码如下:

```java
@Override
    public void initialize() throws IllegalStateException {
        if (!initialized.compareAndSet(false, true)) {
            return;
        }
        //获取组合配置对象
        CompositeConfiguration configuration = scopeModel.getModelEnvironment().getConfiguration();

        // dubbo.config.mode
        //3.3.4.1提到过这里再重复一次 dubbo.config.mode获取配置模式，配置模式对应枚举类型ConfigMode，目前有这么几个STRICT，OVERRIDE，OVERRIDE_ALL，OVERRIDE_IF_ABSENT，IGNORE，这个配置决定了属性覆盖的顺序，当有同一个配置key多次出现时候，以最新配置为准，还是以最老的那个配置为准，还是配置重复则抛出异常，默认值为严格模式STRICT重复则抛出异常
        String configModeStr = (String) configuration.getProperty(ConfigKeys.DUBBO_CONFIG_MODE);
        try {
            if (StringUtils.hasText(configModeStr)) {
                this.configMode = ConfigMode.valueOf(configModeStr.toUpperCase());
            }
        } catch (Exception e) {
            String msg = "Illegal '" + ConfigKeys.DUBBO_CONFIG_MODE + "' config value [" + configModeStr + "], available values " + Arrays.toString(ConfigMode.values());
            logger.error(msg, e);
            throw new IllegalArgumentException(msg, e);
        }

        // dubbo.config.ignore-duplicated-interface
        //忽略重复的接口（服务/引用）配置。默认值为false
        String ignoreDuplicatedInterfaceStr = (String) configuration
            .getProperty(ConfigKeys.DUBBO_CONFIG_IGNORE_DUPLICATED_INTERFACE);
        if (ignoreDuplicatedInterfaceStr != null) {
            this.ignoreDuplicatedInterface = Boolean.parseBoolean(ignoreDuplicatedInterfaceStr);
        }

        // print 打印配置信息到控制台
        Map<String, Object> map = new LinkedHashMap<>();
        map.put(ConfigKeys.DUBBO_CONFIG_MODE, configMode);
        map.put(ConfigKeys.DUBBO_CONFIG_IGNORE_DUPLICATED_INTERFACE, this.ignoreDuplicatedInterface);
        logger.info("Config settings: " + map);
    }
```

#### 3.4.2.3 模块配置扩展的初始化

```java
initModuleExt();
```

```java
private void initModuleExt() {
//目前这里的扩展只支持有一个类型ModuleEnvironment
        Set<ModuleExt> exts = this.getExtensionLoader(ModuleExt.class).getSupportedExtensionInstances();
        for (ModuleExt ext : exts) {
            ext.initialize();
        }
    }
```
ModuleEnvironment的初始化

```java
  @Override
    public void initialize() throws IllegalStateException {
        this.orderedPropertiesConfiguration = new OrderedPropertiesConfiguration(moduleModel);
    }
```

OrderedPropertiesConfiguration对象的创建

```java
public OrderedPropertiesConfiguration(ModuleModel moduleModel) {
        this.moduleModel = moduleModel;
        refresh();
    }

    public void refresh() {
        properties = new Properties();
        //有序的配置提供器扩展获取
        ExtensionLoader<OrderedPropertiesProvider> propertiesProviderExtensionLoader = moduleModel.getExtensionLoader(OrderedPropertiesProvider.class);
        Set<String> propertiesProviderNames = propertiesProviderExtensionLoader.getSupportedExtensions();
        if (CollectionUtils.isEmpty(propertiesProviderNames)) {
            return;
        }
        List<OrderedPropertiesProvider> orderedPropertiesProviders = new ArrayList<>();
        for (String propertiesProviderName : propertiesProviderNames) {
            orderedPropertiesProviders.add(propertiesProviderExtensionLoader.getExtension(propertiesProviderName));
        }

        //order the propertiesProvider according the priority descending
        //根据优先级进行排序，值越小优先级越高
        orderedPropertiesProviders.sort((a, b) -> b.priority() - a.priority());


        //override the properties. 目前没看到有具体的扩展实现
        for (OrderedPropertiesProvider orderedPropertiesProvider : orderedPropertiesProviders) {
            properties.putAll(orderedPropertiesProvider.initProperties());
        }

    }
```

 

原文： [<<框架,应用程序,模块领域模型Model对象的初始化>>](https://blog.elastic.link/2022/07/10/dubbo/3-kuang-jia-ying-yong-cheng-xu-mo-kuai-ling-yu-mo-xing-model-dui-xiang-de-chu-shi-hua/ )

