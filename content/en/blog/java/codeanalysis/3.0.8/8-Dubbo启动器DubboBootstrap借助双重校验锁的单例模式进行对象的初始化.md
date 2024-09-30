---
title: "8-Dubbo启动器DubboBootstrap借助双重校验锁的单例模式进行对象的初始化"
linkTitle: "8-Dubbo启动器DubboBootstrap借助双重校验锁的单例模式进行对象的初始化"
date: 2022-08-08
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] 启动器是为使用者提供简化的API功能来进行Dubbo应用的启动，手写Dubbo服务的启动使用启动器是必要的。
---

#  8-Dubbo启动器DubboBootstrap借助双重校验锁的单例模式进行对象的初始化
## 8.1 启动器简介
在说启动器之前先把视野拉回第一章[《1-从一个服务提供者的Demo说起》](https://blog.elastic.link/2022/07/10/dubbo/1-cong-yi-ge-demo-shuo-qi/ )我们的Demo代码,下面只贴一下核心代码:

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
        bootstrap.application(new ApplicationConfig("dubbo-demo-api-provider"))
            .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
            .protocol(new ProtocolConfig(CommonConstants.DUBBO, -1))
            .service(service)
            .start()
            .await();
    }
}
```

Dubbo3 往云原生的方向走自然要针对云原生应用的应用启动,应用运行,应用发布等信息做一些建模,这个DubboBootstrap就是用来启动Dubbo服务的.类似于Netty的Bootstrap类型和ServerBootstrap启动器

## 8.2 双重校验锁的单例模式创建启动器对象的
Dubbo的bootstrap类为啥要用单例模式:

通过调用静态方法getInstance()获取单例实例。之所以设计为单例，是因为Dubbo中的一些类（如ExtensionLoader）只为每个进程设计一个实例。

下面就来直接看代码吧,代码胜千言:
对象的调用代码如下:

```java
DubboBootstrap bootstrap = DubboBootstrap.getInstance();   
```

DubboBootstrap获取对象的getInstance()方法:
```java
 public static DubboBootstrap getInstance() {
 		//双重校验锁第一次判断空
        if (instance == null) {
        	//为空都进行排队
            synchronized (DubboBootstrap.class) {
            //双重校验锁第二次判断空 上面为空的都排队了这里得判断下
                if (instance == null) {
                	//调用重载方法获取对象
                    instance = DubboBootstrap.getInstance(ApplicationModel.defaultModel());
                }
            }
        }
        return instance;
    }
```

DubboBootstrap获取对象重载的getInstance(ApplicationModel applicationModel)方法:

*computeIfAbsent() 方法对 hashMap 中指定 key 的值进行重新计算，如果不存在这个 key，则添加到 hashMap 中。*

instanceMap设计为Map<ApplicationModel, DubboBootstrap>类型 Key,意味着可以为多个应用程序模型创建不同的启动器,启动多个服务
```java
 public static DubboBootstrap getInstance(ApplicationModel applicationModel) {
        return instanceMap.computeIfAbsent(applicationModel, _k -> new DubboBootstrap(applicationModel));
    }
```

## 8.3 DubboBootstrap的构造器代码

构造器代码是逻辑比较复杂的地方,我们先来看下代码

```java
private DubboBootstrap(ApplicationModel applicationModel) {
		//存储应用程序启动模型
        this.applicationModel = applicationModel;
        //获取配置管理器ConfigManager:  配置管理器的扩展类型ApplicationExt ,扩展名字config
        configManager = applicationModel.getApplicationConfigManager();
        //获取环境信息Environment: 环境信息的扩展类型为ApplicationExt,扩展名字为environment
        environment = applicationModel.getModelEnvironment();
		//执行器存储仓库(线程池)ExecutorRepository: 扩展类型为ExecutorRepository,默认扩展扩展名字为default
        executorRepository = applicationModel.getExtensionLoader(ExecutorRepository.class).getDefaultExtension();
        //初始化并启动应用程序实例ApplicationDeployer,DefaultApplicationDeployer类型
        applicationDeployer = applicationModel.getDeployer();
        // listen deploy events
        //为发布器 设置生命周期回调
        applicationDeployer.addDeployListener(new DeployListenerAdapter<ApplicationModel>() {
            @Override
            public void onStarted(ApplicationModel scopeModel) {
                notifyStarted(applicationModel);
            }

            @Override
            public void onStopped(ApplicationModel scopeModel) {
                notifyStopped(applicationModel);
            }

            @Override
            public void onFailure(ApplicationModel scopeModel, Throwable cause) {
                notifyStopped(applicationModel);
            }
        });
        //将启动器对象注册到应用程序模型applicationModel的Bean工厂中
        // register DubboBootstrap bean
        applicationModel.getBeanFactory().registerBean(this);
    }
```

 原文： [<<Dubbo启动器DubboBootstrap借助双重校验锁的单例模式进行对象的初始化>>](https://blog.elastic.link/2022/07/10/dubbo/8-dubbo-qi-dong-qi-dubbobootstrap-jie-zhu-shuang-chong-xiao-yan-suo-de-dan-li-mo-shi-jin-xing-dui-xiang-de-chu-shi-hua/)
