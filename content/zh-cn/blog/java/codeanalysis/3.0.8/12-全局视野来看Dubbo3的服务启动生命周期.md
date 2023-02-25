---
title: "12 全局视野来看Dubbo3的服务启动生命周期"
linkTitle: "12 全局视野来看Dubbo3的服务启动生命周期"
date: 2022-08-12
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析]  全局视野来看Dubbo3的服务启动生命周期，了解了Dubbo3的启动生命周期，可以有效的了解整个Dubbo应用的启动阶段。
---

# 12 全局视野来看Dubbo3的服务启动生命周期
## 12.1 启动方法简介
在说启动方法之前先把视野拉回第一章[《1-从一个服务提供者的Demo说起》](https://blog.elastic.link/2022/07/10/dubbo/1-cong-yi-ge-demo-shuo-qi/ )我们的Demo代码,下面只贴一下核心代码:

```java
public class Application {
    public static void main(String[] args) throws Exception {
            startWithBootstrap();
    }
    private static void startWithBootstrap() {
    	//前面的文章都在说这个服务配置对象的创建,中间又说了分层域模型,扩展加载机制
        ServiceConfig<DemoServiceImpl> service = new ServiceConfig<>();
        //为服务配置下服务接口和服务实现,下面两行用来初始化对象就不详细说了
        service.setInterface(DemoService.class);
        service.setRef(new DemoServiceImpl());
        //这一个篇章主要说这里:
        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        //初始化应用配置
        bootstrap.application(new ApplicationConfig("dubbo-demo-api-provider"))
        //初始化注册中心配置
            .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
            //初始化协议配置
            .protocol(new ProtocolConfig(CommonConstants.DUBBO, -1))
            //初始化服务配置
            .service(service)
            //启动
            .start()
            .await();
    }
}
```

前面我们介绍了Dubbo启动器DubboBootstrap类型对象的创建,又介绍了为DubboBootstrap启动器初始化各种配置信息,这一个博客就开始到了分析启动方法的位置了,Dubbo启动器借助Deployer发布器来启动和发布服务,发布器的启动过程包含了启动配置中心,加载配置,启动元数据中心,启动服务等操作都是比较重要又比较复杂的过程,这里我们先来看下启动过程的生命周期来为后面的内容做好铺垫。

## 12.2 启动器启动方法的调用逻辑start()
这里我们就直接来看DubboBootstrap的start()方法:

```java
 public DubboBootstrap start() {
 		//调用重载的方法进行启动参数代表是否等待启动结束
        this.start(true);
        return this;
    }
```

我们再来看重载的start方法:

```java
public DubboBootstrap start(boolean wait) {
		//这个发布器是在ApplicationModel对象创建之后初始化的时候进行初始化的具体类型为DefaultApplicationDeployer
        Future future = applicationDeployer.start();
      
        if (wait) {
            try {
              //等待异步启动的结果
                future.get();
            } catch (Exception e) {
            	//启动失败则抛出一个异常
                throw new IllegalStateException("await dubbo application start finish failure", e);
            }
        }
        return this;
    }
```


## 12.3 应用程序发布器DefaultApplicationDeployer的启动方法
发布器是帮助我们发布服务和引用服务的,在Dubbo3中不论是服务提供者还是服务消费者如果想要启动服务都需要走这个启动方法的逻辑,所以务必重视

我们直接来看DefaultApplicationDeployer的start()代码:

```java
@Override
    public Future start() {
    	//启动锁，防止重复启动
        synchronized (startLock) {
            //发布器,状态已经设置为停止或者失败了就直接抛出异常
            if (isStopping() || isStopped() || isFailed()) {
                throw new IllegalStateException(getIdentifier() + " is stopping or stopped, can not start again");
            }

            try {
                // maybe call start again after add new module, check if any new module
                //可能在添加新模块后再次调用start，检查是否有任何新模块
                //这里遍历当前应用程序下的所有模块如果某个模块是PENDING状态则这里hasPendingModule的值为true
                boolean hasPendingModule = hasPendingModule();
				//发布器状态正在启动中
                if (isStarting()) {
                    // currently, is starting, maybe both start by module and application
                    // if it has new modules, start them
                    //存在挂器的模块
                    if (hasPendingModule) {
                     	//启动模块
                        startModules();
                    }
                    // if it is starting, reuse previous startFuture
                    //模块异步启动中
                    return startFuture;
                }

                // if is started and no new module, just return
                //如果已启动且没有新模块，直接返回
                if (isStarted() && !hasPendingModule) {
                    return CompletableFuture.completedFuture(false);
                }

                // pending -> starting : first start app
                // started -> starting : re-start app
                //启动状态切换，将启动状态切换到STARTING（pending和started状态无需切换）
                onStarting();
				//核心初始化逻辑，这里主要做一些应用级别启动比如配置中心，元数据中心
                initialize();
				//启动模块（我们的服务提供和服务引用是在这个模块级别的）
                doStart();
            } catch (Throwable e) {
                onFailed(getIdentifier() + " start failure", e);
                throw e;
            }

            return startFuture;
        }
    }
```

这个启动方法逻辑不多 主要三个方法我们重点来看：
- onStarting() 这个是启动之前的状态切换
-  initialize()  应用的初始化逻辑 比如配置中心，元数据中心的初始化
-  doStart() 启动模块比如启动我们的服务提供和服务引用的）

继续看后面的细节吧，代码胜千言。

## 12.4 应用程序发布器对应用级别的初始化逻辑
这个我们先来看DefaultApplicationDeployer的初始化方法initialize()：

```java
@Override
    public void initialize() {
    	//状态判断 如果已经初始化过了就直接返回
        if (initialized) {
            return;
        }
        // Ensure that the initialization is completed when concurrent calls
        //启动锁，确保在并发调用时完成初始化
        synchronized (startLock) {
        	//双重校验锁 如果已经初始化过了就直接返回
            if (initialized) {
                return;
            }
            // register shutdown hook
            //注册关闭钩子，这个逻辑基本每个中间件应用都必须要要做的事情了，正常关闭应用回收资源，一般没这个逻辑情况下容易出现一些异常，让我们开发人员很疑惑，而这个逻辑往往并不好处理的干净。
            registerShutdownHook();
			
			//启动配置中心，感觉Dubbo3耦合了这个玩意
            startConfigCenter();
			
			//加载配置，一般配置信息当前机器的来源：环境变量，JVM启动参数，配置文字
            loadApplicationConfigs();

			//初始化模块发布器 （发布服务提供和服务引用使用）
            initModuleDeployers();

            // @since 2.7.8
            //启动元数据中心
            startMetadataCenter();
			
			//初始化完成
            initialized = true;

            if (logger.isInfoEnabled()) {
                logger.info(getIdentifier() + " has been initialized!");
            }
        }
    }

```

这个是个生命周期整体概览的方法，将具体逻辑拆分到各个子方法中，是代码重构的一种策略，上面注释也很清楚了就不细说了，上面每个方法在后面会有单独的博客来分析。


## 12.5 应用下模块的启动（服务的发布与引用）

我们回过头来详细看DefaultApplicationDeployer的doStart()代码:

```java
private void doStart() {
		// 启动模块
        startModules();
```

DefaultApplicationDeployer的 startModules()方法
```java
private void startModules() {
        // ensure init and start internal module first
        //确保初始化并首先启动内部模块,Dubbo3中将模块分为内部和外部，内部是核心代码已经提供的一些服务比如元数据服务，外部是我们自己写的服务
        prepareInternalModule();

        // filter and start pending modules, ignore new module during starting, throw exception of module start
        //启动所有的模块 （启动所有的服务）
        for (ModuleModel moduleModel : new ArrayList<>(applicationModel.getModuleModels())) {
        	//这个状态默认就是PENDING的
            if (moduleModel.getDeployer().isPending()) {
            	//模块启动器，发布服务
                moduleModel.getDeployer().start();
            }
        }
    }
```

这个模块的启动其实就是用来启动服务的 先启动内部服务，再启动外部服务
内部服务有个元数据服务Dubbo3中每个服务都可以对外提供服务的元数据信息，来简化服务配置，不论是内部服务还是外部服务调用的代码逻辑都是模块发布器ModuleDeployer的start()方法，接下来我们详细看下模块发布器的生命周期函数。


## 12.6 模块发布器发布服务的过程 

前面我们说到了所有的服务都是经过模块发布器，ModuleDeployer的start()方法来启动的，那我们接下来就来看看这个模块发布器的启动方法。

ModuleDeployer的start()方法代码：

```java
@Override
    public synchronized Future start() throws IllegalStateException {
    	//模块发布器已经停止或者启动失败则直接抛出异常返回
        if (isStopping() || isStopped() || isFailed()) {
            throw new IllegalStateException(getIdentifier() + " is stopping or stopped, can not start again");
        }

        try {
        	//启动中或者已经启动了则直接返回一个Future对象 
            if (isStarting() || isStarted()) {
                return startFuture;
            }
			//切换模块启动状态为STARTING
            onModuleStarting();

            // initialize
            //如果应用未初始化则初始化（非正常逻辑）
            applicationDeployer.initialize();
            //模块发布器进行初始化
            initialize();

            // export services
            //暴露服务
            exportServices();

            // prepare application instance
            // exclude internal module to avoid wait itself
            if (moduleModel != moduleModel.getApplicationModel().getInternalModule()) {
                applicationDeployer.prepareInternalModule();
            }

            // refer services
			//引用服务
            referServices();

            // if no async export/refer services, just set started
            //非异步启动则直接切换状态为STARTED
            if (asyncExportingFutures.isEmpty() && asyncReferringFutures.isEmpty()) {
                onModuleStarted();
            } else {
            //如果是异步的则等待服务发布和服务引用异步回调
                frameworkExecutorRepository.getSharedExecutor().submit(() -> {
                    try {
                        // wait for export finish
                        waitExportFinish();
                        // wait for refer finish
                        waitReferFinish();
                    } catch (Throwable e) {
                        logger.warn("wait for export/refer services occurred an exception", e);
                    } finally {
                    	//异步回调完成 所有服务都启动了，再切换状态
                        onModuleStarted();
                    }
                });
            }
        } catch (Throwable e) {
            onModuleFailed(getIdentifier() + " start failed: " + e, e);
            throw e;
        }
        return startFuture;
    }
```

好了整体的服务启动生命周期就如上代码，后续我们再详细来看每个细节。



## 12.7 发布器简介
前面主要说了应用和模块的发布器的启动和初始化，下面简单了解下它们的关系，如下所示
![在这里插入图片描述](https://img-blog.csdnimg.cn/37e7c05796ab4b38aa7658377e16c0aa.png)
可以发布器主要包含 
- 应用的发布器ApplicationDeployer用于初始化并启动应用程序实例
- 模块发布器ModuleDeployer  模块（服务）的导出/引用服务

两种发布器有各自的接口，他们都继承了抽象的发布器AbstractDeployer 封装了一些公共的操作比如状态切换，状态查询的逻辑。

另外我们再来看下发布过程的状态枚举DeployState如下：

```java
public enum DeployState {
    /**
     * Unknown state
     */
    UNKNOWN,

    /**
     * Pending, wait for start
     */
    PENDING,

    /**
     * Starting
     */
    STARTING,

    /**
     * Started
     */
    STARTED,

    /**
     * Stopping
     */
    STOPPING,

    /**
     * Stopped
     */
    STOPPED,

    /**
     * Failed
     */
    FAILED
}
```


Dubbo这一块后续可以优化以下，这里的状态切换全部耦合在一起了，可以考虑使用状态机将状态与行为解耦。

 原文：[Dubbo启动器DubboBootstrap添加协议配置信息ProtocolConfig](https://blog.elastic.link/2022/07/10/dubbo/12-quan-ju-shi-ye-lai-kan-dubbo3.0.8-de-fu-wu-qi-dong-sheng-ming-zhou-qi/)
