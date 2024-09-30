---
title: "18-Dubbo3元数据服务MetadataService的导出"
linkTitle: "18-Dubbo3元数据服务MetadataService的导出"
date: 2022-08-18
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] 使用者查询提供者的元数据信息，以列出接口和每个接口的配置，控制台（dubbo admin）查询特定进程的元数据，或聚合所有进程的数据。在Dubbo2.x的时候，所有的服务数据都是以接口的形式注册在注册中心。
---

# 18-Dubbo3元数据服务MetadataService的导出

## 18.1 简介
MetadataService
此服务用于公开Dubbo进程内的元数据信息。典型用途包括：
- 使用者查询提供者的元数据信息，以列出接口和每个接口的配置
- 控制台（dubbo admin）查询特定进程的元数据，或聚合所有进程的数据。在Dubbo2.x的时候，所有的服务数据都是以接口的形式注册在注册中心.

Dubbo3将部分数据抽象为元数据的形式来将数据存放在元数据中心，然后元数据由服务提供者提供给消费者而不是再由注册中心进行推送，如下图所示：

![在这里插入图片描述](/imgs/blog/source-blog/18-metadata.png)
 
![在这里插入图片描述](/imgs/blog/source-blog/18-metadata3.png)
引入 MetadataService 元数据服务服务的好处
• 由中心化推送转向点对点拉取（Consumer - Proroder）
• 易于扩展更多的参数
• 更多的数据量
• 对外暴露更多的治理数据

## 18.2 MetadataService的导出过程
了解元数据的到处过程，这个就要继续前面博客往后的代码了前面博客说了一个服务发布之后的服务信息的双注册数据，这里继续看下导出服务之后的代码：
先来简单回顾下模块发布的启动生命周期方法：

DefaultModuleDeployer类型的start方法：

```java
 @Override
    public synchronized Future start() throws IllegalStateException {
       ...

        try {
           ...
            onModuleStarting();

            // initialize
            applicationDeployer.initialize();
            initialize();

            // export services
            exportServices();

            // prepare application instance
            // exclude internal module to avoid wait itself
            if (moduleModel != moduleModel.getApplicationModel().getInternalModule()) {
                applicationDeployer.prepareInternalModule();
            }

            // refer services
            referServices();

            // if no async export/refer services, just set started
            if (asyncExportingFutures.isEmpty() && asyncReferringFutures.isEmpty()) {
                onModuleStarted();
            } else {
       ....
        return startFuture;
    }
```

前面的博客我们已经说了服务提供者导出服务的方法如下：

```java
   // export services
   exportServices();
```

在导出服务之后如果代码中配置了引用服务的代码将会执行引用服务的功能，调用代码如下：

```java
referServices();
```

不过我们样例代码并没有介绍引用服务的功能，这里先不说，等服务提供者完全启动成功之后我们再来看消费者的逻辑。

接下来我们要看的是模块启动成功之后的方法 onModuleStarted();，在这个方法中会去发布服务元数据信息。

## 18.3 模块启动成功时候的逻辑 onModuleStarted();

这里我们直接先看代码再来分析下逻辑：

DefaultModuleDeployer类型的onModuleStarted方法如下所示：
```java
 private void onModuleStarted() {
        try {
        	//状态判断是否为启动中如果是则将状态设置为STARTED
            if (isStarting()) {
              //先修改状态
                setStarted();
                logger.info(getIdentifier() + " has started.");
                //状态修改成功之后开始通知应用程序发布器模块发布器启动成功了
                applicationDeployer.notifyModuleChanged(moduleModel, DeployState.STARTED);
            }
        } finally {
            // complete module start future after application state changed
            completeStartFuture(true);
        }
    }
```



应用程序发布器处理启动成功的逻辑：
DefaultApplicationDeployer类型的notifyModuleChanged方法：

```java
 @Override
    public void notifyModuleChanged(ModuleModel moduleModel, DeployState state) {
        //根据所有模块的状态来判断应用发布器的状态
        checkState(moduleModel, state);

        // notify module state changed or module changed
        //通知所有模块状态更新
        synchronized (stateLock) {
            stateLock.notifyAll();
        }
    }
```
应用发布器模型DefaultApplicationDeployer检查状态方法checkState代码如下：

```java
 @Override
    public void checkState(ModuleModel moduleModel, DeployState moduleState) {
       //存在写操作 先加个锁
        synchronized (stateLock) {
        	//非内部模块，并且模块的状态是发布成功了
            if (!moduleModel.isInternal() && moduleState == DeployState.STARTED) {
                
                prepareApplicationInstance();
            }
            //应用下所有模块状态进行汇总计算
            DeployState newState = calculateState();
            switch (newState) {
                case STARTED:
                    onStarted();
                    break;
                case STARTING:
                    onStarting();
                    break;
                case STOPPING:
                    onStopping();
                    break;
                case STOPPED:
                    onStopped();
                    break;
                case FAILED:
                    Throwable error = null;
                    ModuleModel errorModule = null;
                    for (ModuleModel module : applicationModel.getModuleModels()) {
                        ModuleDeployer deployer = module.getDeployer();
                        if (deployer.isFailed() && deployer.getError() != null) {
                            error = deployer.getError();
                            errorModule = module;
                            break;
                        }
                    }
                    onFailed(getIdentifier() + " found failed module: " + errorModule.getDesc(), error);
                    break;
                case PENDING:
                    // cannot change to pending from other state
                    // setPending();
                    break;
            }
        }
    }
```

## 18.4 准备发布元数据信息和应用实例信息
前面有个代码调用比较重要：

```java
prepareApplicationInstance()
```



DefaultApplicationDeployer类型的prepareApplicationInstance方法如下所示
```java
 @Override
    public void prepareApplicationInstance() {
     //已经注册过应用实例数据了 直接返回 （下面CAS逻辑判断了）
        if (hasPreparedApplicationInstance.get()) {
            return;
        }
		//注册开关控制默认为true
		//通过将registerConsumer默认设置为“false”来关闭纯使用者进程实例的注册。
        if (isRegisterConsumerInstance()) {
            exportMetadataService();
            if (hasPreparedApplicationInstance.compareAndSet(false, true)) {
                // register the local ServiceInstance if required
                registerServiceInstance();
            }
        }
    }
```



### 18.4.1 导出元数据服务方法exportMetadataService
 
 这里我们就先直接来贴一下代码：
 
DefaultApplicationDeployer类型的exportMetadataService方法如下所示：
```java
 private void exportMetadataService() {
        if (!isStarting()) {
            return;
        }
        //这里监听器我们主要关注的类型是ExporterDeployListener类型
        for (DeployListener<ApplicationModel> listener : listeners) {
            try {
                if (listener instanceof ApplicationDeployListener) {
                // 回调监听器的模块启动成功方法
                    ((ApplicationDeployListener) listener).onModuleStarted(applicationModel);
                }
            } catch (Throwable e) {
                logger.error(getIdentifier() + " an exception occurred when handle starting event", e);
            }
        }
    }
```

前面我们主要关注ExporterDeployListener类型的监听器的回调方法，这里我贴一下代码：
ExporterDeployListener类型的onModuleStarted方法如下：

```java
 @Override
    public synchronized void onModuleStarted(ApplicationModel applicationModel) {
        // start metadata service exporter
      //MetadataServiceDelegation类型为实现提供远程RPC服务以方便元数据信息的查询功能的类型。
        MetadataServiceDelegation metadataService = applicationModel.getBeanFactory().getOrRegisterBean(MetadataServiceDelegation.class);
        if (metadataServiceExporter == null) {
            metadataServiceExporter = new ConfigurableMetadataServiceExporter(applicationModel, metadataService);
            // fixme, let's disable local metadata service export at this moment
            //默认我们是没有配置这个元数据类型的这里元数据类型默认为local 条件是不是remote则开始导出，在前面的博客<<Dubbo启动器DubboBootstrap添加应用程序的配置信息ApplicationConfig>> 中有提到这个配置下面我再说下
            if (!REMOTE_METADATA_STORAGE_TYPE.equals(getMetadataType(applicationModel))) {
                metadataServiceExporter.export();
            }
        }
    }
```

在前面的博客[<<Dubbo启动器DubboBootstrap添加应用程序的配置信息ApplicationConfig>>](https://blog.elastic.link/2022/07/10/dubbo/9-dubbo-qi-dong-qi-dubbobootstrap-tian-jia-ying-yong-cheng-xu-de-pei-zhi-xin-xi-applicationconfig/) 中有提到这个配置下面我再说下

metadata-type


metadata 传递方式，是以 Provider 视角而言的，Consumer 侧配置无效，可选值有： 
- remote - Provider 把 metadata 放到远端**注册中心**，Consumer 从**注册中心获取**。
-  local - Provider **把 metadata 放在本地**，**Consumer 从 Provider 处直接获取**  。

可以看到默认的local配置元数据信息的获取是由消费者从提供者拉的，那提供者怎么拉取对应服务的元数据信息那就要要用到这个博客说到的MetadataService服务，传递方式为remote的方式其实就要依赖注册中心了相对来说增加了注册中心的压力。



### 18.4.2 可配置元数据服务的导出ConfigurableMetadataServiceExporter的export
前面了解了导出服务的调用链路，这里详细看下ConfigurableMetadataServiceExporter的export过程源码如下所示：

```java
public synchronized ConfigurableMetadataServiceExporter export() {
 		//元数据服务配置已经存在或者已经导出或者不可导出情况下是无需导出的
        if (serviceConfig == null || !isExported()) {
         	//创建服务配置
            this.serviceConfig = buildServiceConfig();
            // export
            //导出服务 ,导出服务的具体过程这里就不再说了可以看上一个博客，这个导出服务的过程会绑定端口
            serviceConfig.export();
            metadataService.setMetadataURL(serviceConfig.getExportedUrls().get(0));
            if (logger.isInfoEnabled()) {
                logger.info("The MetadataService exports urls : " + serviceConfig.getExportedUrls());
            }
        } else {
            if (logger.isWarnEnabled()) {
                logger.warn("The MetadataService has been exported : " + serviceConfig.getExportedUrls());
            }
        }

        return this;
    }
```


### 18.4.3 元数据服务配置对象的创建
前面我们看到了构建元数据服务对象的代码调用ServiceConfig<MetadataService>，接下来我们详细看下构建源码如下所示：
ConfigurableMetadataServiceExporter类型的buildServiceConfig构建元数据服务配置对象方法如下：

```java
 private ServiceConfig<MetadataService> buildServiceConfig() {
 //1 获取当前的应用配置 然后初始化应用配置
        ApplicationConfig applicationConfig = getApplicationConfig();
        //创建服务配置对象
        ServiceConfig<MetadataService> serviceConfig = new ServiceConfig<>();
        //设置域模型
        serviceConfig.setScopeModel(applicationModel.getInternalModule());
        serviceConfig.setApplication(applicationConfig);
       
       //2 创建注册中心配置对象 然后并初始化
        RegistryConfig registryConfig = new RegistryConfig("N/A");
        registryConfig.setId("internal-metadata-registry");
		
		//3 创建服务配置对象，并初始化
        serviceConfig.setRegistry(registryConfig);
        serviceConfig.setRegister(false);
        //4 生成协议配置 ，这里会配置一下元数据使用的服务端口号默认使用其他服务的端口20880
        serviceConfig.setProtocol(generateMetadataProtocol());
        serviceConfig.setInterface(MetadataService.class);
        serviceConfig.setDelay(0);
       //这里也是需要注意的地方服务引用的类型为MetadataServiceDelegation
        serviceConfig.setRef(metadataService);
        serviceConfig.setGroup(applicationConfig.getName());
        serviceConfig.setVersion(MetadataService.VERSION);
        //5 生成方法配置 这里目前提供的服务方法为getAndListenInstanceMetadata方法 后续可以看下这个方法的视线
        serviceConfig.setMethods(generateMethodConfig());
        serviceConfig.setConnections(1); // separate connection
        serviceConfig.setExecutes(100); // max tasks running at the same time

        return serviceConfig;
    }

```


这个服务配置对象的创建非常像我们第一个博客提到的服务配置过程，不过这个元数据服务对象有几个比较特殊的配置
- 注册中心的配置register设置为了false 则为不向注册中心注册具体的服务配置信息
- 对每个提供者的最大连接数connections为1
- 服务提供者每服务每方法最大可并行执行请求数executes为100

在使用过程中可以知道上面这几个配置值

## 18.5 应用级数据注册   registerServiceInstance()
在前面导出元数据服务之后也会调用一行代码来注册应用级数据来保证应用上线

主要涉及到的代码为DefaultApplicationDeployer类型中的registerServiceInstance方法如下所示
```java
 private void registerServiceInstance() {
        try {
         //标记变量设置为true
            registered = true;
            ServiceInstanceMetadataUtils.registerMetadataAndInstance(applicationModel);
        } catch (Exception e) {
            logger.error("Register instance error", e);
        }
        if (registered) {
            // scheduled task for updating Metadata and ServiceInstance
            asyncMetadataFuture = frameworkExecutorRepository.getSharedScheduledExecutor().scheduleWithFixedDelay(() -> {

                // ignore refresh metadata on stopping
                if (applicationModel.isDestroyed()) {
                    return;
                }
                try {
                    if (!applicationModel.isDestroyed() && registered) {
                        ServiceInstanceMetadataUtils.refreshMetadataAndInstance(applicationModel);
                    }
                } catch (Exception e) {
                    if (!applicationModel.isDestroyed()) {
                        logger.error("Refresh instance and metadata error", e);
                    }
                }
            }, 0, ConfigurationUtils.get(applicationModel, METADATA_PUBLISH_DELAY_KEY, DEFAULT_METADATA_PUBLISH_DELAY), TimeUnit.MILLISECONDS);
        }
    }

```

这个方法先将应用元数据注册到注册中心，然后开始开启定时器每隔30秒同步一次元数据向注册中心。

### 18.5.1 服务实例元数据工具类注册服务发现的元数据信息
前面通过调用类型ServiceInstanceMetadataUtils工具类的registerMetadataAndInstance方法来进行服务实例数据和元数据的注册这里我们详细看下代码如下所示：

```java
    public static void registerMetadataAndInstance(ApplicationModel applicationModel) {
        LOGGER.info("Start registering instance address to registry.");
        RegistryManager registryManager = applicationModel.getBeanFactory().getBean(RegistryManager.class);
        // register service instance
//注意这里服务发现的类型只有ServiceDiscoveryRegistry类型的注册协议才满足        registryManager.getServiceDiscoveries().forEach(ServiceDiscovery::register);
    }
```


### 18.5.2 AbstractServiceDiscovery中的服务发现数据注册的模版方法

AbstractServiceDiscovery类型的注册方法register()方法这个是一个模版方法，真正执行的注册逻辑封装在了doRegister方法中由扩展的服务发现子类来完成
```java
  @Override
    public synchronized void register() throws RuntimeException {
       //第一步创建应用的实例信息等待下面注册到注册中心
        this.serviceInstance = createServiceInstance(this.metadataInfo);
        if (!isValidInstance(this.serviceInstance)) {
            logger.warn("No valid instance found, stop registering instance address to registry.");
            return;
        }

		//是否需要更新
        boolean revisionUpdated = calOrUpdateInstanceRevision(this.serviceInstance);
        if (revisionUpdated) {
            reportMetadata(this.metadataInfo);
            //应用的实例信息注册到注册中心之上 ，这个
            doRegister(this.serviceInstance);
        }
    }
```

### 18.5.3 应用级实例对象创建
可以看到在AbstractServiceDiscovery服务发现的第一步创建应用的实例信息等待下面注册到注册中心

```java
this.serviceInstance = createServiceInstance(this.metadataInfo);
```
最终创建的serviceInstance类型为ServiceInstance 这个是Dubbo封装的一个接口，具体实现类型为DefaultServiceInstance，我们可以看下应用级的元数据有哪些

```java
    protected ServiceInstance createServiceInstance(MetadataInfo metadataInfo) {
    //这里的服务名字为：dubbo-demo-api-provider
        DefaultServiceInstance instance = new DefaultServiceInstance(serviceName, applicationModel);
        //应用服务的元数据 ，可以看下面debug的数据信息
        instance.setServiceMetadata(metadataInfo);
        //metadataType的值为local 这个方法是将元数据类型存储到英勇的元数据对象中 对应内容为dubbo.metadata.storage-type:local
        setMetadataStorageType(instance, metadataType);
        // 这个是自定义元数据数据 我们也可以通过实现扩展ServiceInstanceCustomizer来自定义一些元数据
        ServiceInstanceMetadataUtils.customizeInstance(instance, applicationModel);
        return instance;
    }

```

这个方法的主要目的就是将应用的元数据信息都封装到ServiceInstance类型中，不过额外提供了一个扩展性比较好的方法可以自定义元数据信息

前面的metadataInfo对象的信息如下图所示：
![在这里插入图片描述](/imgs/blog/source-blog/18-metadata2.png)


自定义元数据类型Dubbo官方提供了一个默认的实现类型为：ServiceInstanceMetadataCustomizer

最终封装好的元数据信息如下所示：

```java
DefaultServiceInstance{
serviceName='dubbo-demo-api-provider', 
host='192.168.1.169', 
port=20880, 
enabled=true, 
healthy=true,
 metadata={
 	dubbo.metadata-service.url-params={"connections":"1",
 	"version":"1.0.0",
 	"dubbo":"2.0.2",
 	"release":"3.0.9",
 	"side":"provider",
 	"port":"20880",
 	"protocol":"dubbo"
 	}, 
 	dubbo.endpoints=[
 	{"port":20880,"protocol":"dubbo"}], 
 	dubbo.metadata.storage-type=local, 
 	timestamp=1656227493387}}
```



### 18.5.4 应用级实例数据配置变更的的版本号获取
前面创建元应用的实例信息后开始创建版本号来判断是否需要更新，对应AbstractServiceDiscovery类型的calOrUpdateInstanceRevision
```java
  protected boolean calOrUpdateInstanceRevision(ServiceInstance instance) {
    	//获取元数据版本号对应字段dubbo.metadata.revision
        String existingInstanceRevision = getExportedServicesRevision(instance);
        //获取实例的服务元数据信息：metadata{app='dubbo-demo-api-provider',revision='null',size=1,services=[link.elastic.dubbo.entity.DemoService:dubbo]}
        MetadataInfo metadataInfo = instance.getServiceMetadata();
        //必须在不同线程之间同步计算此实例的状态，如同一实例的修订和修改。此方法的使用仅限于某些点，例如在注册期间。始终尝试使用此选项。改为getRevision（）。
        String newRevision = metadataInfo.calAndGetRevision();
        //版本号发生了变更（元数据发生了变更）版本号是md5元数据信息计算出来HASH验证
        if (!newRevision.equals(existingInstanceRevision)) {
            //版本号添加到dubbo.metadata.revision字段中
            instance.getMetadata().put(EXPORTED_SERVICES_REVISION_PROPERTY_NAME, metadataInfo.getRevision());
            return true;
        }
        return false;
    }
```




#### 18.5.4.1 元数据版本号的计算与HASH校验 calAndGetRevision
这个方法其实比较重要，决定了什么时候会更新元数据，Dubbo使用了一种Hash验证的方式将元数据转MD5值与之前的存在的版本号（也是元数据转MD5得到的） 如果数据发生了变更则MD5值会发生变化 以此来更新元数据，不过发生了MD5冲突的话就会导致配置不更新这个冲突的概率非常小。
好了直接来看代码吧：
MetadataInfo类型的calAndGetRevision方法：

```java
public synchronized String calAndGetRevision() {
        if (revision != null && !updated) {
            return revision;
        }

        updated = false;
		//应用下没有服务则使用一个空的版本号
        if (CollectionUtils.isEmptyMap(services)) {
            this.revision = EMPTY_REVISION;
        } else {
            StringBuilder sb = new StringBuilder();
            //app是应用名
            sb.append(app);
            for (Map.Entry<String, ServiceInfo> entry : new TreeMap<>(services).entrySet()) {
                sb.append(entry.getValue().toDescString());
            }
            String tempRevision = RevisionResolver.calRevision(sb.toString());
            if (!StringUtils.isEquals(this.revision, tempRevision)) {
              //元数据重新注册的话我们可以看看这个日志metadata revision change
                if (logger.isInfoEnabled()) {
                    logger.info(String.format("metadata revision changed: %s -> %s, app: %s, services: %d", this.revision, tempRevision, this.app, this.services.size()));
                }
                this.revision = tempRevision;
                this.rawMetadataInfo = JsonUtils.getJson().toJson(this);
            }
        }
        return revision;
    }
```

RevisionResolver类型的Md5运算计算版本号
```java
md5Utils.getMd5(metadata);
```



### 18.5.5 reportMetadata
回到18.5.2 AbstractServiceDiscovery中的模版方法register，这里我们来看下reportMetadata方法，不过这个方法目前并不会走到，因为我们默认的配置元数据是local不会直接把应用的元数据注册在元数据中心

```java
  protected void reportMetadata(MetadataInfo metadataInfo) {
        if (metadataReport != null) {
        //订阅元数据的标识符
            SubscriberMetadataIdentifier identifier = new SubscriberMetadataIdentifier(serviceName, metadataInfo.getRevision());
            //是否远程发布元数据，这里我们是本地注册这个就不会在元数据中心发布这个元数据信息
            if ((DEFAULT_METADATA_STORAGE_TYPE.equals(metadataType) && metadataReport.shouldReportMetadata()) || REMOTE_METADATA_STORAGE_TYPE.equals(metadataType)) {
                metadataReport.publishAppMetadata(identifier, metadataInfo);
            }
        }
    }
```

### 18.5.6 扩展的注册中心来注册应用级服务发现数据doRegister方法
前面我们说了AbstractServiceDiscovery中的模版方法register，在register会调用一个doRegister方法来注册应用级数据，这个方法是需要扩展注册中心的服务发现来自行实现的，我们这里以官方实现的Zookeeper服务发现模型为例:

ZookeeperServiceDiscovery中的doRegister方法

```java
 @Override
    public void doRegister(ServiceInstance serviceInstance) {
        try {
        //Dubbo实现的ServiceInstance类型对象转 Curator的ServiceInstance
            serviceDiscovery.registerService(build(serviceInstance));
        } catch (Exception e) {
            throw new RpcException(REGISTRY_EXCEPTION, "Failed register instance " + serviceInstance.toString(), e);
        }
    }
```
前面我们介绍了ZookeeperServiceDiscovery发现的构造器连接注册中心，这里来看下服务注册，
应用级实例数据注册一共分为两步
第一步是：Dubbo实现的ServiceInstance类型对象转 Curator的ServiceInstance
第二步是：执行registerService方法将数据注册到注册中心


先来看第一步：Dubbo实现的ServiceInstance类型对象转 Curator的ServiceInstance
关于Curator的服务发现原理可以参考官网的文章博客[curator-x-discovery](https://curator.apache.org/docs/service-discovery/index.html)


**什么是发现服务？**
在 SOA/分布式系统中，服务需要找到彼此。即，Web 服务可能需要找到缓存服务等。DNS 可以用于此，但对于不断变化的服务来说，它远不够灵活。服务发现系统提供了一种机制：

- 注册其可用性的服务
- 定位特定服务的单个实例
- 在服务实例更改时通知


服务实例由类表示：ServiceInstance。ServiceInstances 具有名称、id、地址、端口和/或 ssl 端口，以及可选的有效负载（用户定义）。ServiceInstances 通过以下方式序列化并存储在 ZooKeeper 中：


```java
base path
       |_______ service A name
                    |__________ instance 1 id --> (serialized ServiceInstance)
                    |__________ instance 2 id --> (serialized ServiceInstance)
                    |__________ ...
       |_______ service B name
                    |__________ instance 1 id --> (serialized ServiceInstance)
                    |__________ instance 2 id --> (serialized ServiceInstance)
                    |__________ ...
       |_______ ...
```

这个应用最终注册应用级服务数据如下：
![在这里插入图片描述](/imgs/blog/source-blog/18-metadata4.png)
这里需要注意的是这个 应用的IP+端口的服务元数据信息是临时节点
build方法内容对应着上图的JSON数据 可以看菜build方法封装的过程：

```java
public static org.apache.curator.x.discovery.ServiceInstance<ZookeeperInstance> build(ServiceInstance serviceInstance) {
        ServiceInstanceBuilder builder;
        
        String serviceName = serviceInstance.getServiceName();
        String host = serviceInstance.getHost();
        int port = serviceInstance.getPort();
        Map<String, String> metadata = serviceInstance.getSortedMetadata();
        String id = generateId(host, port);
        //ZookeeperInstance是Dubbo封装的用于存放payload数据 包含服务id，服务名字和元数据
        ZookeeperInstance zookeeperInstance = new ZookeeperInstance(id, serviceName, metadata);
        try {
            builder = builder()
                .id(id)
                .name(serviceName)
                .address(host)
                .port(port)
                .payload(zookeeperInstance);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return builder.build();
    }

```

在《18.5 应用级数据注册   registerServiceInstance() 》 小节中介绍了应用元数据信息的注册调用代码，其实后面还有个update的逻辑定期30秒同步元数据到元数据中心，这里就不详细介绍了。



原文地址：[18-Dubbo3元数据服务MetadataService的导出](https://blog.elastic.link/2022/07/10/dubbo/18-dubbo3-yuan-shu-ju-fu-wu-metadataservice-de-dao-chu/)
