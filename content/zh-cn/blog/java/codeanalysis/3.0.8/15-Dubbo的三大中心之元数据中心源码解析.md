---
title: "15-Dubbo的三大中心之元数据中心源码解析"
linkTitle: "15-Dubbo的三大中心之元数据中心源码解析"
date: 2022-08-15
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析]  Dubbo 3 会需要一个元数据中心来维护RPC服务与应用的映射关系（即接口与应用的映射关系），因为如果采用了应用级别的服务发现和服务注册，在注册中心中将采用“应用 —— 实例列表”结构的数据组织形式，不再是以往的“接口 —— 实例列表”结构的数据组织形式，而以往用接口级别的服务注册和服务发现的应用服务在迁移到应用级别时，得不到接口与应用之间的对应关系，从而无法从注册中心得到实例列表信息，所以Dubbo为了兼容这种场景，在Provider端启动时，会往元数据中心存储接口与应用的映射关系。
---




# 15-Dubbo的三大中心之元数据中心源码解析

## 15.1 简介
关于元数据中心的概念对于大部分用户来说是比较陌生的,配置中心的话我们还好理解,对于元数据中心是什么,我们来看下我从官网拷贝过来的一段文字:

元数据中心在2.7.x版本开始支持，随着应用级别的服务注册和服务发现在Dubbo中落地，**元数据中心也变的越来越重要**。在以下几种情况下会需要部署元数据中心：

- 对于一个原先采用老版本Dubbo搭建的应用服务，在迁移到Dubbo 3时，Dubbo 3 会需要一个**元数据中心来维护RPC服务与应用的映射关系（即接口与应用的映射关系）**，因为如果采用了**应用级别的服务发现和服务注册**，在注册中心中将**采用“应用 —— 实例列表”结构**的数据组织形式，**不再是以往的“接口 —— 实例列表”结构的数据组织形式**，而以往用接口级别的服务注册和服务发现的应用服务在**迁移到应用级别**时，**得不到接口与应用之间的对应关系**，从而无法从注册中心得到实例列表信息，所以**Dubbo为了兼容这种场景，在Provider端启动时，会往元数据中心存储接口与应用的映射关系**。
- 为了让**注册中心更加聚焦与地址的发现和推送能力**，**减轻注册中心的负担**，元数据中心承载了所有的服务元数据、大量接口/方法级别配置信息等，无论是接口粒度还是应用粒度的服务发现和注册，元数据中心都起到了重要的作用。
- 
如果有以上两种需求，都可以选择部署元数据中心，并通过Dubbo的配置来集成该元数据中心。

**元数据中心并不依赖于注册中心和配置中心**，用户可以自由选择是否集成和部署元数据中心，如下图所示：

![/imgs/v3/concepts/centers-metadata.png](/imgs/v3/concepts/centers-metadata.png)


该图中不配备配置中心，意味着可以不需要全局管理配置的能力。该图中不配备注册中心，意味着可能采用了Dubbo mesh的方案，也可能不需要进行服务注册，仅仅接收直连模式的服务调用。
官网参考文章地址:
- [部署架构（注册中心 配置中心 元数据中心](/zh-cn/docs/concepts/registry-configcenter-metadata/)
- [元数据参考手册](/zh-cn/docs/references/metadata/)


综上所述可以用几句话概括下:
- 元数据中心来维护RPC服务与应用的映射关系（即接口与应用的映射关系）来兼容接口与应用之间的对应关系
- 让注册中心更加聚焦与地址的发现和推送能力

注册中心的启动是在DefaultApplicationDeployer中的初始化方法 initialize() 中:如下所示

这里只看下 startMetadataCenter();方法即可

```java
 @Override
    public void initialize() {
        if (initialized) {
            return;
        }
        // Ensure that the initialization is completed when concurrent calls
        synchronized (startLock) {
            if (initialized) {
                return;
            }
            // register shutdown hook
            registerShutdownHook();

            startConfigCenter();

            loadApplicationConfigs();

            initModuleDeployers();

            // @since 2.7.8
            startMetadataCenter();

            initialized = true;

            if (logger.isInfoEnabled()) {
                logger.info(getIdentifier() + " has been initialized!");
            }
        }
    }

```

## 15.2 深入探究元数据中心的启动过程
 ### 15.2.1 启动元数据中心的代码全貌
 
关于元数据中心我们看下 startMetadataCenter()方法来大致了解下整个流程

```java
private void startMetadataCenter() {
		//如果未配置元数据中心的地址等配置则使用注册中心的地址等配置做为元数据中心的配置
        useRegistryAsMetadataCenterIfNecessary();
		//获取应用的配置信息
        ApplicationConfig applicationConfig = getApplication();
		//元数据配置类型 元数据类型， local 或 remote,，如果选择远程，则需要进一步指定元数据中心
        String metadataType = applicationConfig.getMetadataType();
        // FIXME, multiple metadata config support.
        //查询元数据中心的地址等配置
        Collection<MetadataReportConfig> metadataReportConfigs = configManager.getMetadataConfigs();
        
        if (CollectionUtils.isEmpty(metadataReportConfigs)) {
        //这个就是判断 如果选择远程，则需要进一步指定元数据中心 否则就抛出来异常
            if (REMOTE_METADATA_STORAGE_TYPE.equals(metadataType)) {
                throw new IllegalStateException("No MetadataConfig found, Metadata Center address is required when 'metadata=remote' is enabled.");
            }
            return;
        }
		//MetadataReport实例的存储库对象获取
        MetadataReportInstance metadataReportInstance = applicationModel.getBeanFactory().getBean(MetadataReportInstance.class);
        List<MetadataReportConfig> validMetadataReportConfigs = new ArrayList<>(metadataReportConfigs.size());
        for (MetadataReportConfig metadataReportConfig : metadataReportConfigs) {
            ConfigValidationUtils.validateMetadataConfig(metadataReportConfig);
            validMetadataReportConfigs.add(metadataReportConfig);
        }
        //初始化元数据
        metadataReportInstance.init(validMetadataReportConfigs);
        //MetadataReport实例的存储库对象初始化失败则抛出异常
        if (!metadataReportInstance.inited()) {
            throw new IllegalStateException(String.format("%s MetadataConfigs found, but none of them is valid.", metadataReportConfigs.size()));
        }
    }
```



### 15.2.2 元数据中心未配置则使用注册中心配置
前面在说配置中心的时候有说过配置中心如果未配置会使用注册中心的地址等信息作为默认配置,这里元数据做了类似的操作:如代码:
DefaultApplicationDeployer类型的 useRegistryAsMetadataCenterIfNecessary()方法

```java
private void useRegistryAsMetadataCenterIfNecessary() {
		//配置缓存中查询元数据配置
        Collection<MetadataReportConfig> metadataConfigs = configManager.getMetadataConfigs();
		//配置存在则直接返回
        if (CollectionUtils.isNotEmpty(metadataConfigs)) {
            return;
        }
		////查询是否有注册中心设置了默认配置isDefault 设置为true的注册中心则为默认注册中心列表,如果没有注册中心设置为默认注册中心,则获取所有未设置默认配置的注册中心列表
        List<RegistryConfig> defaultRegistries = configManager.getDefaultRegistries();
        if (defaultRegistries.size() > 0) {
        //多注册中心遍历
            defaultRegistries
                .stream()
                //筛选符合条件的注册中心 (筛选逻辑就是查看是否有对应协议的扩展支持)
                .filter(this::isUsedRegistryAsMetadataCenter)
                //注册中心配置映射为元数据中心  映射就是获取需要的配置
                .map(this::registryAsMetadataCenter)
                //将元数据中心配置存储在配置缓存中方便后续使用
                .forEach(metadataReportConfig -> {
              
                    if (metadataReportConfig.getId() == null) {
                        Collection<MetadataReportConfig> metadataReportConfigs = configManager.getMetadataConfigs();
                        if (CollectionUtils.isNotEmpty(metadataReportConfigs)) {
                            for (MetadataReportConfig existedConfig : metadataReportConfigs) {
                                if (existedConfig.getId() == null && existedConfig.getAddress().equals(metadataReportConfig.getAddress())) {
                                    return;
                                }
                            }
                        }
                        configManager.addMetadataReport(metadataReportConfig);
                    } else {
                        Optional<MetadataReportConfig> configOptional = configManager.getConfig(MetadataReportConfig.class, metadataReportConfig.getId());
                        if (configOptional.isPresent()) {
                            return;
                        }
                        configManager.addMetadataReport(metadataReportConfig);
                    }
                    logger.info("use registry as metadata-center: " + metadataReportConfig);
                });
        }
    }
```

这个代码有些细节就不细说了 我们概括下顺序梳理下思路:
- 配置缓存中查询元数据配置,配置存在则直接返回
- 查询所有可用的默认注册中心列表
	- 多注册中心遍历
	-  选符合条件的注册中心 (筛选逻辑就是查看是否有对应协议的扩展支持)
	- 注册中心配置RegistryConfig映射转换为元数据中心配置类型MetadataReportConfig  映射就是获取需要的配置
	- 将元数据中心配置存储在配置缓存中方便后续使用
 
 元数据的配置可以参考官网:[元数据参考手册](/zh-cn/docs/references/metadata/)
 
 这里主要看下可配置项有哪些 对应类型为MetadataReportConfig 在官网暂时未找到合适的文档,这里整理下属性列表方便后续配置说明查看:
 
| 配置变量 | 类型 | 说明|
|--|--|--|
| id |  String|配置id
|protocol|String|元数据协议|
|address|String|元数据中心地址|
|port|Integer|元数据中心端口|
|username|String|元数据中心认证用户名|
|password|String|元数据中心认证密码|
|timeout|Integer|元数据中心的请求超时（毫秒）|
|group|String|该组将元数据保存在中。它与注册表相同|
|parameters|Map<String, String>|自定义参数|
|retryTimes|Integer|重试次数|
|retryPeriod|Integer|重试间隔|
|cycleReport|Boolean|默认情况下， 是否每天重复存储完整的元数据|
|syncReport|Boolean|Sync or Async report.
|cluster|Boolean|需要群集支持，默认为false|
|registry|String|注册表配置id|
|file|String|元数据报告文件存储位置|
|check|Boolean|连接到元数据中心时要应用的失败策略|


### 15.2.3 元数据中心的初始化逻辑
#### 15.2.3.1 元数据中心的初始化调用逻辑
主要看这一行比较重要的逻辑:

```java
 //初始化元数据
 metadataReportInstance.init(validMetadataReportConfigs);
```

在了解这一行逻辑之前我们先来看下元数据相关联的类型:



MetadataReportInstance中的初始化方法init
```java
 public void init(List<MetadataReportConfig> metadataReportConfigs) {
 		//CAS判断是否有初始化过
        if (!init.compareAndSet(false, true)) {
            return;
        }
		//元数据类型配置如果未配置则默认为local 
        this.metadataType = applicationModel.getApplicationConfigManager().getApplicationOrElseThrow().getMetadataType();
        if (metadataType == null) {
            this.metadataType = DEFAULT_METADATA_STORAGE_TYPE;
        }
		//获取MetadataReportFactory 工厂类型
        MetadataReportFactory metadataReportFactory = applicationModel.getExtensionLoader(MetadataReportFactory.class).getAdaptiveExtension();
        	//多元数据中心初始化
        for (MetadataReportConfig metadataReportConfig : metadataReportConfigs) {
            init(metadataReportConfig, metadataReportFactory);
        }
    }
	
    private void init(MetadataReportConfig config, MetadataReportFactory metadataReportFactory) {
    //配置转url
        URL url = config.toUrl();
        if (METADATA_REPORT_KEY.equals(url.getProtocol())) {
            String protocol = url.getParameter(METADATA_REPORT_KEY, DEFAULT_DIRECTORY);
            url = URLBuilder.from(url)
                    .setProtocol(protocol)
                    .setScopeModel(config.getScopeModel())
                    .removeParameter(METADATA_REPORT_KEY)
                    .build();
        }
        url = url.addParameterIfAbsent(APPLICATION_KEY, applicationModel.getCurrentConfig().getName());
        String relatedRegistryId = isEmpty(config.getRegistry()) ? (isEmpty(config.getId()) ? DEFAULT_KEY : config.getId()) : config.getRegistry();
 		//从元数据工厂中获取元数据
        MetadataReport metadataReport = metadataReportFactory.getMetadataReport(url);
        //缓存元数据到内存
        if (metadataReport != null) {
            metadataReports.put(relatedRegistryId, metadataReport);
        }
    }
```


关于元数据的初始化我们主要看两个位置:
- 一个是元数据工厂对象的创建与初始化MetadataReportFactory
- 一个是元数据对象的创建与初始化MetadataReport


#### 15.2.3.2 元数据工厂对象MetadataReportFactory
关于元数据工厂类型MetadataReportFactory,元数据工厂 用于**创建与管理元数据对象**, 相关类型如下:
![在这里插入图片描述](/imgs/blog/source-blog/15-config.png)

我们这里主要以为Zookeeper扩展的元数据工厂ZookeeperMetadataReportFactory类型为例子:
实现类型逻辑不复杂,这里就直接贴代码看看:

```java
public class ZookeeperMetadataReportFactory extends AbstractMetadataReportFactory {
	//与Zookeeper交互的传输器
    private ZookeeperTransporter zookeeperTransporter;
	//应用程序模型
    private ApplicationModel applicationModel;

    public ZookeeperMetadataReportFactory(ApplicationModel applicationModel) {
        this.applicationModel = applicationModel;
        this.zookeeperTransporter = ZookeeperTransporter.getExtension(applicationModel);
    }

    @DisableInject
    public void setZookeeperTransporter(ZookeeperTransporter zookeeperTransporter) {
        this.zookeeperTransporter = zookeeperTransporter;
    }

    @Override
    public MetadataReport createMetadataReport(URL url) {
        return new ZookeeperMetadataReport(url, zookeeperTransporter);
    }

}
```

元数据工厂的实现比较简单 
- 继承抽象的元数据工厂AbstractMetadataReportFactory
- 实现工厂方法createMetadataReport来创建一个元数据操作类型

如果我们想要实现一个元数据工厂扩展可以参考Zookeeper的这个方式


#### 15.2.3.3 元数据操作对象MetadataReport的创建与初始化

前面的从元数据工厂中获取元数据操作对象的逻辑处理代码如下:

```java
//从元数据工厂中获取元数据 ,url对象可以理解为配置
 MetadataReport metadataReport = metadataReportFactory.getMetadataReport(url);
```

关于元数据对象,用于元数据信息的增删改查等逻辑的操作与元数据信息的缓存

![在这里插入图片描述](/imgs/blog/source-blog/15-config2.png)

我们这里还是以Zookeeper的实现ZookeeperMetadataReportFactory类型做为参考:

我们先来看这个逻辑
```java
//从元数据工厂中获取元数据 ,url对象可以理解为配置
 MetadataReport metadataReport = metadataReportFactory.getMetadataReport(url);
```
ZookeeperMetadataReportFactory的父类型AbstractMetadataReportFactory中的getMetadataReport方法如下:

```java
 @Override
    public MetadataReport getMetadataReport(URL url) {
    //url值参考例子zookeeper://127.0.0.1:2181?application=dubbo-demo-api-provider&client=&port=2181&protocol=zookeeper
    		//如果存在export则移除
        url = url.setPath(MetadataReport.class.getName())
            .removeParameters(EXPORT_KEY, REFER_KEY);
           //生成元数据缓存key 元数据维度 地址+名字 
           //如: zookeeper://127.0.0.1:2181/org.apache.dubbo.metadata.report.MetadataReport
        String key = url.toServiceString();
		//缓存中查询 查到则直接返回
        MetadataReport metadataReport = serviceStoreMap.get(key);
        if (metadataReport != null) {
            return metadataReport;
        }

        // Lock the metadata access process to ensure a single instance of the metadata instance
        //存在写操作 加个锁
        lock.lock();
        try {
        	//双重校验锁在查一下
            metadataReport = serviceStoreMap.get(key);
            if (metadataReport != null) {
                return metadataReport;
            }
            //check参数 查元数据报错是否抛出异常
            boolean check = url.getParameter(CHECK_KEY, true) && url.getPort() != 0;		
            try {
            	//关键模版方法 调用扩展实现的具体业务(创建元数据操作对象)
                metadataReport = createMetadataReport(url);
            } catch (Exception e) {
                if (!check) {
                    logger.warn("The metadata reporter failed to initialize", e);
                } else {
                    throw e;
                }
            }
		//check逻辑检查
            if (check && metadataReport == null) {
                throw new IllegalStateException("Can not create metadata Report " + url);
            }
            //缓存对象 
            if (metadataReport != null) {
                serviceStoreMap.put(key, metadataReport);
            }
            //返回
            return metadataReport;
        } finally {
            // Release the lock
            lock.unlock();
        }
    }

```

上面这个抽象类AbstractMetadataReportFactory中的获取元数据操作对象的模版方法getMetadataReport(URL url), 用了双重校验锁的逻辑来创建对象缓存对象,又用了模版方法设计模式,来让抽象类做通用的逻辑,让实现类型去做扩展, 虽然代码写的太长了些整体还是用了不少的设计思想.

我们直接看这个代码:
```java
metadataReport = createMetadataReport(url);
```

这个创建元数据操作对象的代码实际上走的是实现类型的逻辑:


来自工厂Bean ZookeeperMetadataReportFactory的工厂方法如下所示:
 

```java
@Override
    public MetadataReport createMetadataReport(URL url) {
        return new ZookeeperMetadataReport(url, zookeeperTransporter);
    }
```

创建了元数据操作对象,这里我们继续看下元数据操作对象ZookeeperMetadataReport创建做了哪些逻辑:
来自ZookeeperMetadataReport的构造器:

```java
public ZookeeperMetadataReport(URL url, ZookeeperTransporter zookeeperTransporter) {
		//url即配置 配置传递给抽象类 做一些公共的逻辑
		//url参考:zookeeper://127.0.0.1:2181/org.apache.dubbo.metadata.report.MetadataReport?application=dubbo-demo-api-provider&client=&port=2181&protocol=zookeeper
        super(url);
        if (url.isAnyHost()) {
            throw new IllegalStateException("registry address == null");
        }
        String group = url.getGroup(DEFAULT_ROOT);
        if (!group.startsWith(PATH_SEPARATOR)) {
            group = PATH_SEPARATOR + group;
        }
        this.root = group;
        //连接Zookeeper
        zkClient = zookeeperTransporter.connect(url);
    }
```


核心的公共的操作逻辑封装在父类AbstractMetadataReport里面
我们来看前面super调用的构造器逻辑:
如下所示:
```java
 public AbstractMetadataReport(URL reportServerURL) {
 //设置url 如:zookeeper://127.0.0.1:2181/org.apache.dubbo.metadata.report.MetadataReport?application=dubbo-demo-api-provider&client=&port=2181&protocol=zookeeper
        setUrl(reportServerURL);
        // Start file save timer
        //缓存的文件名字
        //格式为: 用户目录+/.dubbo/dubbo-metadata- + 应用程序名字application + url地址(IP+端口) + 后缀.cache 如下所示
        ///Users/song/.dubbo/dubbo-metadata-dubbo-demo-api-provider-127.0.0.1-2181.cache
        String defaultFilename = System.getProperty(USER_HOME) + DUBBO_METADATA +
            reportServerURL.getApplication() + "-" +
            replace(reportServerURL.getAddress(), ":", "-") + CACHE;
            //如果用户配置了缓存文件名字则以用户配置为准file
        String filename = reportServerURL.getParameter(FILE_KEY, defaultFilename);
        File file = null;
        //文件名字不为空
        if (ConfigUtils.isNotEmpty(filename)) {
            file = new File(filename);
            //文件和父目录不存在则创建文件目录
            if (!file.exists() && file.getParentFile() != null && !file.getParentFile().exists()) {
                if (!file.getParentFile().mkdirs()) {
                    throw new IllegalArgumentException("Invalid service store file " + file + ", cause: Failed to create directory " + file.getParentFile() + "!");
                }
            }
            // if this file exists, firstly delete it.
            //还未初始化则已存在的历史文件删除掉
            if (!initialized.getAndSet(true) && file.exists()) {
                file.delete();
            }
        }
        //赋值给成员变量后续继续可以用
        this.file = file;
        //文件存在则直接加载文件中的内容
        loadProperties();
        //sync-report配置的值为同步配置还异步配置,true是同步配置,默认为false为异步配置
        syncReport = reportServerURL.getParameter(SYNC_REPORT_KEY, false);
        //重试属性与逻辑也封装了一个类型 创建对象
        //retry-times重试次数配置 默认为100次
        //retry-period 重试间隔配置 默认为3000
        metadataReportRetry = new MetadataReportRetry(reportServerURL.getParameter(RETRY_TIMES_KEY, DEFAULT_METADATA_REPORT_RETRY_TIMES),
            reportServerURL.getParameter(RETRY_PERIOD_KEY, DEFAULT_METADATA_REPORT_RETRY_PERIOD));
            
        // cycle report the data switch
        //是否定期从元数据中心同步配置
        //cycle-report配置默认为true
        if (reportServerURL.getParameter(CYCLE_REPORT_KEY, DEFAULT_METADATA_REPORT_CYCLE_REPORT)) {
        //开启重试定时器 24个小时间隔从元数据中心同步一次
            reportTimerScheduler = Executors.newSingleThreadScheduledExecutor(new NamedThreadFactory("DubboMetadataReportTimer", true));
            reportTimerScheduler.scheduleAtFixedRate(this::publishAll, calculateStartTime(), ONE_DAY_IN_MILLISECONDS, TimeUnit.MILLISECONDS);
        }
		
        this.reportMetadata = reportServerURL.getParameter(REPORT_METADATA_KEY, false);
        this.reportDefinition = reportServerURL.getParameter(REPORT_DEFINITION_KEY, true);
    }

```



#### 15.2.3.4 内存中元数据自动同步到Zookeeper和本地文件
这里来总结下元数据操作的初始化逻辑:

- 首次初始化清理历史元数据文件如:
  Users/song/.dubbo/dubbo-metadata-dubbo-demo-api-provider-127.0.0.1-2181.cache
- 如果非首次进来则直接加载缓存在本地的缓存文件,赋值给properties成员变量
- 初始化同步配置是否异步(默认为false), sync-report配置的值为同步配置还异步配置,true是同步配置,默认为false为异步配置
- 初始化重试属性
- 是否定期从元数据中心同步配置初始化 默认为true 24小时自动同步一次



关于元数据同步可以看AbstractMetadataReport类型的publishAll方法:

```java
  reportTimerScheduler = Executors.newSingleThreadScheduledExecutor(new NamedThreadFactory("DubboMetadataReportTimer", true));
            reportTimerScheduler.scheduleAtFixedRate(this::publishAll, calculateStartTime(), ONE_DAY_IN_MILLISECONDS, TimeUnit.MILLISECONDS);
```

这里有个方法叫做calculateStartTime 这个代码是随机时间的between 2:00 am to 6:00 am, the time is random.  2点到6点之间启动, 低峰期启动自动同步 
返回值:


AbstractMetadataReport类型的
```java
  void publishAll() {
        logger.info("start to publish all metadata.");
        this.doHandleMetadataCollection(allMetadataReports);
    }
```
AbstractMetadataReport类型的doHandleMetadataCollection
```java
private boolean doHandleMetadataCollection(Map<MetadataIdentifier, Object> metadataMap) {
        if (metadataMap.isEmpty()) {
            return true;
        }
        Iterator<Map.Entry<MetadataIdentifier, Object>> iterable = metadataMap.entrySet().iterator();
        while (iterable.hasNext()) {
            Map.Entry<MetadataIdentifier, Object> item = iterable.next();
            if (PROVIDER_SIDE.equals(item.getKey().getSide())) {
            	//提供端的元数据则存储提供端元数据
                this.storeProviderMetadata(item.getKey(), (FullServiceDefinition) item.getValue());
            } else if (CONSUMER_SIDE.equals(item.getKey().getSide())) {
            //消费端的元数据则存储提供端元数据
                this.storeConsumerMetadata(item.getKey(), (Map) item.getValue());
            }

        }
        return false;
    }
```


提供端元数据的存储:
AbstractMetadataReport类型的storeProviderMetadata
```java
 @Override
    public void storeProviderMetadata(MetadataIdentifier providerMetadataIdentifier, ServiceDefinition serviceDefinition) {
        if (syncReport) {
            storeProviderMetadataTask(providerMetadataIdentifier, serviceDefinition);
        } else {
            reportCacheExecutor.execute(() -> storeProviderMetadataTask(providerMetadataIdentifier, serviceDefinition));
        }
    }
```

 

AbstractMetadataReport类型的storeProviderMetadataTask
具体同步代码:storeProviderMetadataTask
```java
private void storeProviderMetadataTask(MetadataIdentifier providerMetadataIdentifier, ServiceDefinition serviceDefinition) {
        try {
            if (logger.isInfoEnabled()) {
                logger.info("store provider metadata. Identifier : " + providerMetadataIdentifier + "; definition: " + serviceDefinition);
            }
            allMetadataReports.put(providerMetadataIdentifier, serviceDefinition);
            failedReports.remove(providerMetadataIdentifier);
            Gson gson = new Gson();
            String data = gson.toJson(serviceDefinition);
             //内存中的元数据同步到元数据中心
            doStoreProviderMetadata(providerMetadataIdentifier, data);
            //内存中的元数据同步到本地文件
            saveProperties(providerMetadataIdentifier, data, true, !syncReport);
        } catch (Exception e) {
            // retry again. If failed again, throw exception.
            failedReports.put(providerMetadataIdentifier, serviceDefinition);
            metadataReportRetry.startRetryTask();
            logger.error("Failed to put provider metadata " + providerMetadataIdentifier + " in  " + serviceDefinition + ", cause: " + e.getMessage(), e);
        }
    }

```

上面代码我们主要看本地内存中的元数据同步到元数据中心和存本地的两个点:

```java
//内存中的元数据同步到元数据中心
doStoreProviderMetadata(providerMetadataIdentifier, data);
//内存中的元数据同步到本地文件
saveProperties(providerMetadataIdentifier, data, true, 
```

//内存中的元数据同步到元数据中心


这个方法会调用当前子类重写的具体存储逻辑:这里我们以
ZookeeperMetadataReport的doStoreProviderMetadata举例:


```java
   private void storeMetadata(MetadataIdentifier metadataIdentifier, String v) {
   		//使用zkClient创建一个节点数据为参数V v是前面说的服务定义数据
        zkClient.create(getNodePath(metadataIdentifier), v, false);
    }
```


这里参数我们举个例子: 提供者的元数据内容如下:
节点路径为:

- /dubbo/metadata/link.elastic.dubbo.entity.DemoService/provider/dubbo-demo-api-provider

格式:
- /dubbo/metadata前缀
- 服务提供者接口
- 提供者类型provider
- 应用名

具体的元数据内容如下:
比较详细的记录了应用信息,服务接口信息和服务接口对应的方法信息


```json
{
  "parameters": {
    "side": "provider",
    "interface": "link.elastic.dubbo.entity.DemoService",
    "pid": "38680",
    "application": "dubbo-demo-api-provider",
    "dubbo": "2.0.2",
    "release": "3.0.8",
    "anyhost": "true",
    "bind.ip": "192.168.1.9",
    "methods": "sayHello,sayHelloAsync",
    "background": "false",
    "deprecated": "false",
    "dynamic": "true",
    "service-name-mapping": "true",
    "generic": "false",
    "bind.port": "20880",
    "timestamp": "1653097653865"
  },
  "canonicalName": "link.elastic.dubbo.entity.DemoService",
  "codeSource": "file:/Users/song/Desktop/Computer/A/code/gitee/weaving-a-net/weaving-test/dubbo-test/target/classes/",
  "methods": [
    {
      "name": "sayHello",
      "parameterTypes": [
        "java.lang.String"
      ],
      "returnType": "java.lang.String",
      "annotations": [
        
      ]
    },
    {
      "name": "sayHelloAsync",
      "parameterTypes": [
        "java.lang.String"
      ],
      "returnType": "java.util.concurrent.CompletableFuture",
      "annotations": [
        
      ]
    }
  ],
  "types": [
    {
      "type": "java.util.concurrent.CompletableFuture",
      "properties": {
        "result": "java.lang.Object",
        "stack": "java.util.concurrent.CompletableFuture.Completion"
      }
    },
    {
      "type": "java.lang.Object"
    },
    {
      "type": "java.lang.String"
    },
    {
      "type": "java.util.concurrent.CompletableFuture.Completion",
      "properties": {
        "next": "java.util.concurrent.CompletableFuture.Completion",
        "status": "int"
      }
    },
    {
      "type": "int"
    }
  ],
  "annotations": [
    
  ]
}
```



本地缓存文件的写入 可以看下如下代码
AbstractMetadataReport类型的saveProperties方法
```java
 private void saveProperties(MetadataIdentifier metadataIdentifier, String value, boolean add, boolean sync) {
        if (file == null) {
            return;
        }

        try {
            if (add) {
                properties.setProperty(metadataIdentifier.getUniqueKey(KeyTypeEnum.UNIQUE_KEY), value);
            } else {
                properties.remove(metadataIdentifier.getUniqueKey(KeyTypeEnum.UNIQUE_KEY));
            }
            long version = lastCacheChanged.incrementAndGet();
            if (sync) {
            	//获取最新修改版本持久化到磁盘
                new SaveProperties(version).run();
            } else {
                reportCacheExecutor.execute(new SaveProperties(version));
            }

        } catch (Throwable t) {
            logger.warn(t.getMessage(), t);
        }
    }
```

主要看如下代码:

```java
 new SaveProperties(version).run();
```

SaveProperties类型代码如下:
```java
  private class SaveProperties implements Runnable {
        private long version;

        private SaveProperties(long version) {
            this.version = version;
        }

        @Override
        public void run() {
            doSaveProperties(version);
        }
    }
```


继续看doSaveProperties方法:

```java
private void doSaveProperties(long version) {
		//不是最新的就不要持久化了
        if (version < lastCacheChanged.get()) {
            return;
        }
        if (file == null) {
            return;
        }
        // Save
        try {
        	//创建本地文件锁:
        	//路径为:
        	///Users/song/.dubbo/dubbo-metadata-dubbo-demo-api-provider-127.0.0.1-2181.cache.lock
            File lockfile = new File(file.getAbsolutePath() + ".lock");
            //锁文件不存在则创建锁文件
            if (!lockfile.exists()) {
                lockfile.createNewFile();
            }
            //随机访问文件工具类对象创建 读写权限
            try (RandomAccessFile raf = new RandomAccessFile(lockfile, "rw");
            //文件文件Channel
            //返回与此文件关联的唯一FileChannel对象。
                FileChannel channel = raf.getChannel()) {
                //FileChannel中的lock()与tryLock()方法都是尝试去获取在某一文件上的独有锁（以下简称独有锁），可以实现进程间操作的互斥。区别在于lock()会阻塞（blocking）方法的执行，tryLock()则不会。
                FileLock lock = channel.tryLock();
                //如果多个线程同时进来未获取锁的则抛出异常
                if (lock == null) {
                    throw new IOException("Can not lock the metadataReport cache file " + file.getAbsolutePath() + ", ignore and retry later, maybe multi java process use the file, please config: dubbo.metadata.file=xxx.properties");
                }
                // Save
                try {
                	//文件不存在则创建本地元数据缓存文件
                	///Users/song/.dubbo/dubbo-metadata-dubbo-demo-api-provider-127.0.0.1-2181.cache
                    if (!file.exists()) {
                        file.createNewFile();
                    }

                    Properties tmpProperties;
                    if (!syncReport) {
                        // When syncReport = false, properties.setProperty and properties.store are called from the same
                        // thread(reportCacheExecutor), so deep copy is not required
                        tmpProperties = properties;
                    } else {
                        // Using store method and setProperty method of the this.properties will cause lock contention
                        // under multi-threading, so deep copy a new container
                        //异步存储会导致锁争用 使用此的store方法和setProperty方法。属性将导致多线程下的锁争用，因此深度复制新容器
                        tmpProperties = new Properties();
                        Set<Map.Entry<Object, Object>> entries = properties.entrySet();
                        for (Map.Entry<Object, Object> entry : entries) {
                            tmpProperties.setProperty((String) entry.getKey(), (String) entry.getValue());
                        }
                    }

                    try (FileOutputStream outputFile = new FileOutputStream(file)) {
                    //Properties类型自带的方法:
                    //将此属性表中的属性列表（键和元素对）以适合使用load（Reader）方法的格式写入输出字符流。
                        tmpProperties.store(outputFile, "Dubbo metadataReport Cache");
                    }
                } finally {
                    lock.release();
                }
            }
        } catch (Throwable e) {
            if (version < lastCacheChanged.get()) {
                return;
            } else {
                reportCacheExecutor.execute(new SaveProperties(lastCacheChanged.incrementAndGet()));
            }
            //这个代码太诡异了如果是lock失败也会打印异常给人非常疑惑的感觉 后续会修复
            logger.warn("Failed to save service store file, cause: " + e.getMessage(), e);
        }
    }
```

写入文件的内容大致如下

```json
link.elastic.dubbo.entity.DemoService:::provider:dubbo-demo-api-provider -> {
  "parameters": {
    "side": "provider",
    "interface": "link.elastic.dubbo.entity.DemoService",
    "pid": "41457",
    "application": "dubbo-demo-api-provider",
    "dubbo": "2.0.2",
    "release": "3.0.8",
    "anyhost": "true",
    "bind.ip": "192.168.1.9",
    "methods": "sayHello,sayHelloAsync",
    "background": "false",
    "deprecated": "false",
    "dynamic": "true",
    "service-name-mapping": "true",
    "generic": "false",
    "bind.port": "20880",
    "timestamp": "1653100253548"
  },
  "canonicalName": "link.elastic.dubbo.entity.DemoService",
  "codeSource": "file:/Users/song/Desktop/Computer/A/code/gitee/weaving-a-net/weaving-test/dubbo-test/target/classes/",
  "methods": [
    {
      "name": "sayHelloAsync",
      "parameterTypes": [
        "java.lang.String"
      ],
      "returnType": "java.util.concurrent.CompletableFuture",
      "annotations": [
        
      ]
    },
    {
      "name": "sayHello",
      "parameterTypes": [
        "java.lang.String"
      ],
      "returnType": "java.lang.String",
      "annotations": [
        
      ]
    }
  ],
  "types": [
    {
      "type": "java.util.concurrent.CompletableFuture",
      "properties": {
        "result": "java.lang.Object",
        "stack": "java.util.concurrent.CompletableFuture.Completion"
      }
    },
    {
      "type": "java.lang.Object"
    },
    {
      "type": "java.lang.String"
    },
    {
      "type": "java.util.concurrent.CompletableFuture.Completion",
      "properties": {
        "next": "java.util.concurrent.CompletableFuture.Completion",
        "status": "int"
      }
    },
    {
      "type": "int"
    }
  ],
  "annotations": [
    
  ]
}
```


原文地址：[15-Dubbo的三大中心之元数据中心源码解析](https://blog.elastic.link/2022/07/10/dubbo/15-dubbo-de-san-da-zhong-xin-zhi-yuan-shu-ju-zhong-xin-yuan-ma-jie-xi/)