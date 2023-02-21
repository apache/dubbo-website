---
title: "16-模块发布器发布服务全过程"
linkTitle: "16-模块发布器发布服务全过程"
date: 2022-08-16
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] DefaultModuleDeployer模块器启动的流程,其中在start代码的模版方法中开始了导出服务的功能,。
---


# 16-模块发布器发布服务全过程
## 16.1 简介
Dubbo做为服务治理框架,比较核心的就是服务相关的概念,这里我先贴个找到的关于Dubbo工作原理的架构图:
 ![在这里插入图片描述](/imgs/blog/source-blog/16-deploy.png)
 如果按完整服务启动与订阅的顺序我们可以归结为以下6点:
- 导出服务(提供者)
	-  服务提供方通过指定端口对外暴露服务 
- 注册服务(提供者)
	- 提供方向注册中心注册自己的信息
- (服务发现)-订阅服务(消费者)
	-  服务调用方通过注册中心订阅自己感兴趣的服务 
- (服务发现)-服务推送(消费者)
	- 注册中心向调用方推送地址列表
- 调用服务(消费者调用提供者)
	- 调用方选择一个地址发起RPC调用 
- 监控服务
	- 服务提供方和调用方的统计数据由监控模块收集展示 

上面的完整的服务启动订阅与调用流程不仅仅适用于Dubbo 同样也适用于其他服务治理与发现的模型, 一般服务发现与服务调用的思路就是这样的,我们将以上内容扩展,暴漏服务可以使用http,tcp,udp等各种协议,注册服务可以注册到Redis,Dns,Etcd,Zookeeper等注册中心中,订阅服务可以主动去注册中心查询服务列表,服务发现可以让注册中心将服务数据动态推送给消费者.Dubbo其实就是基于这种简单的服务模型来扩展出各种功能的支持,来满足服务治理的各种场景,了解了这里可能各位同学就想着自行开发一个简单的微服务框架了。



回到主题,从以上的服务完整发布调用流程可以看到,所有的功能都是由导出服务(提供者)开始的,只有提供者先提供了服务才可以有真正的服务让消费者调用。


之前的博客内容 链接:[<<12-全局视野来看Dubbo3.0.8的服务启动生命周期>>](https://blog.elastic.link/2022/07/10/dubbo/12-quan-ju-shi-ye-lai-kan-dubbo3.0.8-de-fu-wu-qi-dong-sheng-ming-zhou-qi/) 我们了解了 DefaultModuleDeployer模块器启动的流程,其中在start代码的模版方法中开始了导出服务的功能,这里我们来详细看下服务发布的全过程:


入口代码: DefaultModuleDeployer的发布服务方法
```java
 private void exportServices() {
 		//从配置管缓存中查询缓存的所有的服务配置然后逐个服务发布
        for (ServiceConfigBase sc : configManager.getServices()) {
            exportServiceInternal(sc);
        }
    }
```


## 16.2 导出服务的入口
入口代码: DefaultModuleDeployer的发布服务方法

```java
 private void exportServices() {
 		//从配置管缓存中查询缓存的所有的服务配置然后逐个服务发布
        for (ServiceConfigBase sc : configManager.getServices()) {
            exportServiceInternal(sc);
        }
    }
```

主要流程为遍历初始化的服务配置列表然后逐个服务开始到处
内部导出服务代码:
exportServiceInternal方法:

```java
 private void exportServiceInternal(ServiceConfigBase sc) {
 	
        ServiceConfig<?> serviceConfig = (ServiceConfig<?>) sc;
        //服务配置刷新 配置优先级覆盖
        if (!serviceConfig.isRefreshed()) {
            serviceConfig.refresh();
        }
        //服务已经导出过了就直接返回
        if (sc.isExported()) {
            return;
        }
        //是否异步方式导出 全局配置或者服务级其中一个配置了异步则异步处理
        if (exportAsync || sc.shouldExportAsync()) {
        //异步其实就是使用线程来导出服务serviceExportExecutor
            ExecutorService executor = executorRepository.getServiceExportExecutor();
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                try {
                    if (!sc.isExported()) {
                        sc.export();
                        exportedServices.add(sc);
                    }
                } catch (Throwable t) {
                    logger.error(getIdentifier() + " export async catch error : " + t.getMessage(), t);
                }
            }, executor);

            asyncExportingFutures.add(future);
        } else {
        	//同步导出服务
            if (!sc.isExported()) {
                sc.export();
                exportedServices.add(sc);
            }
        }
    }
```

这个逻辑里面做了一些基本的操作,可以直接看注释然后调用ServiceConfig的export的来导出服务,继续往后看服务配置的导出服务方法。



## 16.3 服务配置导出服务模板方法
核心的服务导出代码是在服务配置中来做的ServiceConfig的 export() 方法
ServiceConfig的 export() 方法代码如下:

```java

    @Override
    public void export() {
    	//已经导出过服务直接放那会
        if (this.exported) {
            return;
        }

        // ensure start module, compatible with old api usage
        //确保模块启动了(基本的初始化操作执行了)
        getScopeModel().getDeployer().start();
		//悲观锁
        synchronized (this) {
        	//双重校验
            if (this.exported) {
                return;
            }
			//配置是否刷新 前面初始化时候已经刷新过配置
            if (!this.isRefreshed()) {
                this.refresh();
            }
            //服务导出配置配置为false则不导出
            if (this.shouldExport()) {
            	//服务发布前初始化一下元数据对象
                this.init();
			
                if (shouldDelay()) {
                	//配置了服务的延迟发布配置则走延迟发布逻辑
                    doDelayExport();
                } else {
                	//导出服务
                    doExport();
                }
            }
        }
    }
```

### 16.3.1 服务配置导出服务前的初始化方法
ServiceConfig 导出服务之前的初始化方法init
```java
public void init() {
        if (this.initialized.compareAndSet(false, true)) {
        	//加载服务监听器 这里暂时没有服务监听器扩展
            // load ServiceListeners from extension
            ExtensionLoader<ServiceListener> extensionLoader = this.getExtensionLoader(ServiceListener.class);
            this.serviceListeners.addAll(extensionLoader.getSupportedExtensionInstances());
        }
        //服务提供者配置传递给元数据配置对象 一个服务提供者配置会有一个元数据配置，服务配置
        initServiceMetadata(provider);
        //元数据
        serviceMetadata.setServiceType(getInterfaceClass());
        
        serviceMetadata.setTarget(getRef());
        //元数据的key格式为 group/服务接口:版本号
        serviceMetadata.generateServiceKey();
    }
```


## 16.4 服务配置导出服务模板方法2
ServiceConfig 导出服务核心逻辑
```java
protected synchronized void doExport() {
		//取消发布
        if (unexported) {
            throw new IllegalStateException("The service " + interfaceClass.getName() + " has already unexported!");
        }
        //已经发布
        if (exported) {
            return;
        }
		//服务路径 为空则设置为接口名，本例子中为link.elastic.dubbo.entity.DemoService
        if (StringUtils.isEmpty(path)) {
            path = interfaceName;
        }
        //导出URL
        doExportUrls();
        //
        exported();
    }
```

### 16.4.1 导出服务的URL配置逻辑

ServiceConfig 导出URL核心逻辑
```java
 private void doExportUrls() {
        //模块服务存储库
        ModuleServiceRepository repository = getScopeModel().getServiceRepository();
        ServiceDescriptor serviceDescriptor;
        //ref为服务实现类型 这里对应我们例子的DemoServiceImpl
        final boolean serverService = ref instanceof ServerService;
        if(serverService){
            serviceDescriptor=((ServerService) ref).getServiceDescriptor();
            repository.registerService(serviceDescriptor);
        }else{
        	//我们代码走这个逻辑 注册服务 这个注册不是向注册中心注册 这个是解析服务接口将服务方法等描述信息存放在了服务存储ModuleServiceRepository类型对象的成员变量services中
            serviceDescriptor = repository.registerService(getInterfaceClass());
        }
        //提供者领域模型， 提供者领域模型 封装了一些提供者需要的就基本属性同时内部解析封装方法信息 ProviderMethodModel 列表 ， 服务标识符 格式group/服务接:版本号
        providerModel = new ProviderModel(getUniqueServiceName(),
        	//服务实现类DemoServiceImpl
            ref,
            //服务描述符 描述符里面包含了服务接口的方法信息，不过服务接口通过反射也可以拿到方法信息
            serviceDescriptor,
            //服务配置
            this,
            //当前所处模型
            getScopeModel(),
            //当前服务接口的元数据对象
            serviceMetadata);
		
		//模块服务存储库存储提供者模型对象ModuleServiceRepository
        repository.registerProvider(providerModel);
		//获取配置的注册中心列表 ，同时将注册中心配置转URL （在Dubbo中URL就是配置信息的一种形式）
		//这里会获取到两个  由dubbo.application.register-mode 双注册配置决定
		//注册中心 registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=9008&registry=zookeeper&release=3.0.8&timestamp=1653703292768
	  //service-discovery-registry://8.131.79.126:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=10275&registry=zookeeper&release=3.0.8&timestamp=1653704425920
	  //参数dubbo是dubbo协议的版本不是Dubbo版本 Dubbo RPC protocol version, for compatibility, it must not be between 2.0.10 ~ 2.6.2
	   //这里后面详细说下 服务双注册  dubbo.application.register-mode
        List<URL> registryURLs = ConfigValidationUtils.loadRegistries(this, true);

        for (ProtocolConfig protocolConfig : protocols) {
            String pathKey = URL.buildKey(getContextPath(protocolConfig)
                    .map(p -> p + "/" + path)
                    .orElse(path), group, version);
            // stub service will use generated service name
            if(!serverService) {
                // In case user specified path, register service one more time to map it to path.
                //模块服务存储库ModuleServiceRepository存储服务接口信息
               repository.registerService(pathKey, interfaceClass);
            }
            //导出根据协议导出配置到注册中心
            doExportUrlsFor1Protocol(protocolConfig, registryURLs);
        }
    }

```



### 16.4.2 应用级和接口级服务注册地址获取
这里主要看下注册中心的获取，这里涉及到服务的双注册配置

```java
List<URL> registryURLs = ConfigValidationUtils.loadRegistries(this, true);
```

关于loadRegistries方法的详情我们就不看了主要看loadRegistries方法中调用的genCompatibleRegistries添加服务发现注册中心
```java
  /**
   * @param scopeModel 域模型
   * @param registryList 配置的注册中心列表 例如：registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=9008&registry=zookeeper&release=3.0.8&timestamp=1653703292768
   * 
   *  @param provider 是否为服务提供者 这里Demo为true
   */
private static List<URL> genCompatibleRegistries(ScopeModel scopeModel, List<URL> registryList, boolean provider) {
        List<URL> result = new ArrayList<>(registryList.size());
        //遍历所有的注册中心 为每个注册中心增加兼容的服务发现注册中心地址配置
        registryList.forEach(registryURL -> {
           //是否为提供者 
            if (provider) {
                // for registries enabled service discovery, automatically register interface compatible addresses.
                
                String registerMode;
                //注册协议配置了service-discovery-registry 走这个逻辑
                //前面这个逻辑是直接接给result结果中添加应用级注册，如果是all配置则增加接口级注册信息
                if (SERVICE_REGISTRY_PROTOCOL.equals(registryURL.getProtocol())) {
                    registerMode = registryURL.getParameter(REGISTER_MODE_KEY, ConfigurationUtils.getCachedDynamicProperty(scopeModel, DUBBO_REGISTER_MODE_DEFAULT_KEY, DEFAULT_REGISTER_MODE_INSTANCE));
                    if (!isValidRegisterMode(registerMode)) {
                        registerMode = DEFAULT_REGISTER_MODE_INSTANCE;
                    }
                    //这里配置的就是应用级配置 则先添加应用级地址，再根据条件判断是否添加接口级注册中心地址
                    result.add(registryURL);
                    if (DEFAULT_REGISTER_MODE_ALL.equalsIgnoreCase(registerMode)
                        && registryNotExists(registryURL, registryList, REGISTRY_PROTOCOL)) {
                        URL interfaceCompatibleRegistryURL = URLBuilder.from(registryURL)
                            .setProtocol(REGISTRY_PROTOCOL)
                            .removeParameter(REGISTRY_TYPE_KEY)
                            .build();
                        result.add(interfaceCompatibleRegistryURL);
                    }
                } else {
                	//正常情况下我们的配置会走这个逻辑
                	// 获取服务注册的注册模式 配置为dubbo.application.register-mode 默认值为all 既注册接口数据又注册应用级信息
                    registerMode = registryURL.getParameter(REGISTER_MODE_KEY, ConfigurationUtils.getCachedDynamicProperty(scopeModel, DUBBO_REGISTER_MODE_DEFAULT_KEY, DEFAULT_REGISTER_MODE_ALL));
                    
                    if (!isValidRegisterMode(registerMode)) {
                        registerMode = DEFAULT_REGISTER_MODE_INTERFACE;
                    }
                     //根据逻辑条件判断是否添加应用级注册中心地址
                    if ((DEFAULT_REGISTER_MODE_INSTANCE.equalsIgnoreCase(registerMode) || DEFAULT_REGISTER_MODE_ALL.equalsIgnoreCase(registerMode))
                        && registryNotExists(registryURL, registryList, SERVICE_REGISTRY_PROTOCOL)) {
                        URL serviceDiscoveryRegistryURL = URLBuilder.from(registryURL)
                            .setProtocol(SERVICE_REGISTRY_PROTOCOL)
                            .removeParameter(REGISTRY_TYPE_KEY)
                            .build();
                        result.add(serviceDiscoveryRegistryURL);
                    }
   					//根据逻辑条件判断是否添加接口级注册中心地址
                    if (DEFAULT_REGISTER_MODE_INTERFACE.equalsIgnoreCase(registerMode) || DEFAULT_REGISTER_MODE_ALL.equalsIgnoreCase(registerMode)) {
                        result.add(registryURL);
                    }
                }

                FrameworkStatusReportService reportService = ScopeModelUtil.getApplicationModel(scopeModel).getBeanFactory().getBean(FrameworkStatusReportService.class);
                reportService.reportRegistrationStatus(reportService.createRegistrationReport(registerMode));
            } else {
                result.add(registryURL);
            }
        });

        return result;
    }
```

这个方法是根据服务注册模式来判断使用接口级注册地址还是应用级注册地址分别如下所示：
配置信息：
dubbo.application.register-mode
配置值：
- interface
	- 接口级注册
- instance
	- 应用级注册
- all 
	- 接口级别和应用级都注册
	
接口级注册地址：

```java
registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=9008&registry=zookeeper&release=3.0.8&timestamp=1653703292768
```
 

应用级注册地址：

```java
service-discovery-registry://8.131.79.126:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=10275&registry=zookeeper&release=3.0.8&timestamp=1653704425920
```







 ## 16.5 导出服务配置到本地和注册中心
 

```java
 doExportUrlsFor1Protocol(protocolConfig, registryURLs);
```
protocolConfig为：dubbo协议的配置
<dubbo:protocol port="-1" name="dubbo" />

registryURLs目前有两个 应用级注册地址和接口级注册地址：
```java
registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=9008&registry=zookeeper&release=3.0.8&timestamp=1653703292768
```

```java
service-discovery-registry://8.131.79.126:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=10275&registry=zookeeper&release=3.0.8&timestamp=1653704425920
```

### 16.5.1 导出服务配置的doExportUrlsFor1Protocol方法
```java
    private void doExportUrlsFor1Protocol(ProtocolConfig protocolConfig, List<URL> registryURLs) {
       //生成协议配置具体可见下图中的元数据配置中的attachments
        Map<String, String> map = buildAttributes(protocolConfig);

        // remove null key and null value
        //移除空值 简化配置
        map.keySet().removeIf(key -> key == null || map.get(key) == null);
        // init serviceMetadata attachments
        //协议配置放到元数据对象中
        serviceMetadata.getAttachments().putAll(map);
	
		//协议配置 + 默认协议配置转URL类型的配置存储
        URL url = buildUrl(protocolConfig, map);
		//导出url
        exportUrl(url, registryURLs);
    }

```

 ![在这里插入图片描述](/imgs/blog/source-blog/16-deploy2.png)


### 16.5.2 导出服务配置模板方法
继续看导出服务的模板方法，分为本地导出和注册中心导出
//参数url为协议配置url可以参考：

```java
dubbo://192.168.1.9:20880/link.elastic.dubbo.entity.DemoService?anyhost=true&application=dubbo-demo-api-provider&background=false&bind.ip=192.168.1.9&bind.port=20880&deprecated=false&dubbo=2.0.2&dynamic=true&generic=false&interface=link.elastic.dubbo.entity.DemoService&methods=sayHello,sayHelloAsync&pid=10953&release=3.0.8&side=provider&timestamp=1653705630518
```

```java
private void exportUrl(URL url, List<URL> registryURLs) {
        String scope = url.getParameter(SCOPE_KEY);
        // don't export when none is configured
        if (!SCOPE_NONE.equalsIgnoreCase(scope)) {

            // export to local if the config is not remote (export to remote only when config is remote)
            //未明确指定远程导出 则开启本地导出
            if (!SCOPE_REMOTE.equalsIgnoreCase(scope)) {
                exportLocal(url);
            }
			//未明确指定本地导出 则开启远程导出
            // export to remote if the config is not local (export to local only when config is local)
            if (!SCOPE_LOCAL.equalsIgnoreCase(scope)) {
                url = exportRemote(url, registryURLs);
                if (!isGeneric(generic) && !getScopeModel().isInternal()) {
                    MetadataUtils.publishServiceDefinition(url, providerModel.getServiceModel(), getApplicationModel());
                }
            }
        }
        this.urls.add(url);
    }
```


## 16.6 导出服务到本地
本地调用使用了 injvm 协议，是一个伪协议，它不开启端口，不发起远程调用，只在 JVM 内直接关联，但执行 Dubbo 的 Filter 链。

直接通过代码来看吧
```java
 private void exportLocal(URL url) {
       //协议转为injvm 代表本地导出 host为127.0.0.1
        URL local = URLBuilder.from(url)
                .setProtocol(LOCAL_PROTOCOL)
                .setHost(LOCALHOST_VALUE)
                .setPort(0)
                .build();
        local = local.setScopeModel(getScopeModel())
            .setServiceModel(providerModel);
        doExportUrl(local, false);
        logger.info("Export dubbo service " + interfaceClass.getName() + " to local registry url : " + local);
    }
```

###  16.6.1 doExportUrl方法
```java
private void doExportUrl(URL url, boolean withMetaData) {
		//这里是由adaptor扩展类型处理过的 我们直接看默认的类型javassist 对应JavassistProxyFactory代理工厂 获取调用对象 （
        Invoker<?> invoker = proxyFactory.getInvoker(ref, (Class) interfaceClass, url);
        if (withMetaData) {
            invoker = new DelegateProviderMetaDataInvoker(invoker, this);
        }
        Exporter<?> exporter = protocolSPI.export(invoker);
        exporters.add(exporter);
    }
```

### 16.6.2 JavassistProxyFactory类型的getInvoker方法

```java
@Override
    public <T> Invoker<T> getInvoker(T proxy, Class<T> type, URL url) {
        try {
            // TODO Wrapper cannot handle this scenario correctly: the classname contains '$'
            // 创建实际服务提供者的代理类型，代理类型后缀为DubboWrap在这里类型为 link.elastic.dubbo.entity.DemoServiceImplDubboWrap0
            final Wrapper wrapper = Wrapper.getWrapper(proxy.getClass().getName().indexOf('$') < 0 ? proxy.getClass() : type);
            //创建一个匿名内部类对象 继承自AbstractProxyInvoker的Invoker对象
            return new AbstractProxyInvoker<T>(proxy, type, url) {
                @Override
                protected Object doInvoke(T proxy, String methodName,
                                          Class<?>[] parameterTypes,
                                          Object[] arguments) throws Throwable {
                    return wrapper.invokeMethod(proxy, methodName, parameterTypes, arguments);
                }
            };
        } catch (Throwable fromJavassist) {
            // try fall back to JDK proxy factory
            ...
            }
        }
    }
```

### 16.6.3 使用协议导出调用对象 export

```java
 Exporter<?> exporter = protocolSPI.export(invoker);
```
这个使用了Adaptor扩展和Wrapper机制Debug起来不太方便这里贴一下调用堆栈![在这里插入图片描述](/imgs/blog/source-blog/16-deploy3.png)

### 16.6.3.1 协议序列化机制ProtocolSerializationWrapper

```java
   @Override
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
        //这里主要逻辑是将服务提供者url添加到服务存储仓库中
        getFrameworkModel(invoker.getUrl().getScopeModel()).getServiceRepository().registerProviderUrl(invoker.getUrl());
        return protocol.export(invoker);
    }
```


### 16.6.3.2 协议过滤器Wrapper ProtocolFilterWrapper

```java
 @Override
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
        //注册中心的协议导出直接执行
        if (UrlUtils.isRegistry(invoker.getUrl())) {
            return protocol.export(invoker);
        }
        //过滤器调用链FilterChainBuilder的扩展对象查询
        FilterChainBuilder builder = getFilterChainBuilder(invoker.getUrl());
       	//这里分为2步 生成过滤器调用链 然后使用链表中的节点调用  这里值查询provider类型的过滤器
        return protocol.export(builder.buildInvokerChain(invoker, SERVICE_FILTER_KEY, CommonConstants.PROVIDER));
    }
```

过滤器调用链的生成 对用DefaultFilterChainBuilder类型的buildInvokerChain方法

```java
@Override
    public <T> Invoker<T> buildInvokerChain(final Invoker<T> originalInvoker, String key, String group) {
    	//originalInvoker代表真正的服务调用器
        Invoker<T> last = originalInvoker;
        URL url = originalInvoker.getUrl();
        List<ModuleModel> moduleModels = getModuleModelsFromUrl(url);
        List<Filter> filters;
        if (moduleModels != null && moduleModels.size() == 1) {
        //类型Filter key为service.filter 分组为provider 所有提供者过滤器拉取
            filters = ScopeModelUtil.getExtensionLoader(Filter.class, moduleModels.get(0)).getActivateExtension(url, key, group);
        } else if (moduleModels != null && moduleModels.size() > 1) {
            filters = new ArrayList<>();
            List<ExtensionDirector> directors = new ArrayList<>();
            for (ModuleModel moduleModel : moduleModels) {
                List<Filter> tempFilters = ScopeModelUtil.getExtensionLoader(Filter.class, moduleModel).getActivateExtension(url, key, group);
                filters.addAll(tempFilters);
                directors.add(moduleModel.getExtensionDirector());
            }
            filters = sortingAndDeduplication(filters, directors);

        } else {
            filters = ScopeModelUtil.getExtensionLoader(Filter.class, null).getActivateExtension(url, key, group);
        }

		//倒序拼接，将过滤器的调用对象添加到链表中  最后倒序遍历之后 last节点指向了调用链路链表头节点的对象
        if (!CollectionUtils.isEmpty(filters)) {
            for (int i = filters.size() - 1; i >= 0; i--) {
                final Filter filter = filters.get(i);
                final Invoker<T> next = last;
                //每个invoker对象中都有originalInvoker对象
                last = new CopyOfFilterChainNode<>(originalInvoker, next, filter);
            }
            return new CallbackRegistrationInvoker<>(last, filters);
        }

        return last;
    }
```

![在这里插入图片描述](/imgs/blog/source-blog/16-deploy4.png)


### 16.6.3.3 协议监听器Wrapper ProtocolListenerWrapper

```java
 @Override
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
        //注册中心地址则直接导出
        if (UrlUtils.isRegistry(invoker.getUrl())) {
            return protocol.export(invoker);
        }
        // 先导出对象 再创建过滤器包装对象 执行监听器逻辑
        return new ListenerExporterWrapper<T>(protocol.export(invoker),
                Collections.unmodifiableList(ScopeModelUtil.getExtensionLoader(ExporterListener.class, invoker.getUrl().getScopeModel())
                        .getActivateExtension(invoker.getUrl(), EXPORTER_LISTENER_KEY)));
    }
```

### 16.6.3.4 QOS的协议Wrapper QosProtocolWrapper

```java
@Override
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
         //注册中心导出的时候开启QOS 默认端口22222
        if (UrlUtils.isRegistry(invoker.getUrl())) {
            startQosServer(invoker.getUrl());
            return protocol.export(invoker);
        }
        return protocol.export(invoker);
    }
```

### 16.6.3.5 InjvmProtocol 的导出方法

```java
  @Override
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
        return new InjvmExporter<T>(invoker, invoker.getUrl().getServiceKey(), exporterMap);
    }

```

## 16.7 导出服务到注册中心
 16.5.2 导出服务配置模板方法 中我们看到了服务导出会导出到本地和远程，接下来就看下导出到远程的方法exportRemote
 参数url:
 

```java
dubbo://192.168.1.9:20880/link.elastic.dubbo.entity.DemoService?anyhost=true&application=dubbo-demo-api-provider&background=false&bind.ip=192.168.1.9&bind.port=20880&deprecated=false&dubbo=2.0.2&dynamic=true&generic=false&interface=link.elastic.dubbo.entity.DemoService&methods=sayHello,sayHelloAsync&pid=12865&release=3.0.8&side=provider&timestamp=1653708351378
```

参数registryURLs目前有两个 应用级注册地址和接口级注册地址：
```java
registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=9008&registry=zookeeper&release=3.0.8&timestamp=1653703292768
```

```java
service-discovery-registry://8.131.79.126:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=10275&registry=zookeeper&release=3.0.8&timestamp=1653704425920
```

```java
private URL exportRemote(URL url, List<URL> registryURLs) {

        if (CollectionUtils.isNotEmpty(registryURLs)) {
        	//遍历所有注册地址与注册模式 逐个注册
            for (URL registryURL : registryURLs) {
              //为协议URL 添加应用级注册service-discovery-registry参数service-name-mapping为true
                if (SERVICE_REGISTRY_PROTOCOL.equals(registryURL.getProtocol())) {
                    url = url.addParameterIfAbsent(SERVICE_NAME_MAPPING_KEY, "true");
                }

                //if protocol is only injvm ,not register
                if (LOCAL_PROTOCOL.equalsIgnoreCase(url.getProtocol())) {
                    continue;
                }
				//为协议url 添加动态配置dynamic
                url = url.addParameterIfAbsent(DYNAMIC_KEY, registryURL.getParameter(DYNAMIC_KEY));
                //监控配置暂时为null
                URL monitorUrl = ConfigValidationUtils.loadMonitor(this, registryURL);
                if (monitorUrl != null) {
                    url = url.putAttribute(MONITOR_KEY, monitorUrl);
                }

                // For providers, this is used to enable custom proxy to generate invoker
                String proxy = url.getParameter(PROXY_KEY);
                if (StringUtils.isNotEmpty(proxy)) {
                    registryURL = registryURL.addParameter(PROXY_KEY, proxy);
                }

				//开始注册服务了 打印个认知 提示下
                if (logger.isInfoEnabled()) {
                    if (url.getParameter(REGISTER_KEY, true)) {
                        logger.info("Register dubbo service " + interfaceClass.getName() + " url " + url + " to registry " + registryURL.getAddress());
                    } else {
                        logger.info("Export dubbo service " + interfaceClass.getName() + " to url " + url);
                    }
                }

                doExportUrl(registryURL.putAttribute(EXPORT_KEY, url), true);
            }

        } else {

            if (logger.isInfoEnabled()) {
                logger.info("Export dubbo service " + interfaceClass.getName() + " to url " + url);
            }

            doExportUrl(url, true);
        }


        return url;
    }
```


### 16.7.1   doExportUrl方法
与 16.6.1 doExportUrl方法 导出本地协议是一样的逻辑 ，我们来看看点不同地方 
```java
private void doExportUrl(URL url, boolean withMetaData) {
        Invoker<?> invoker = proxyFactory.getInvoker(ref, (Class) interfaceClass, url);
        if (withMetaData) {
          //远程服务导出逐个值为true 元数据invoker包装一下
            invoker = new DelegateProviderMetaDataInvoker(invoker, this);
        }
        Exporter<?> exporter = protocolSPI.export(invoker);
        exporters.add(exporter);
    }
```

与本地导出ProtocolFilterWrapper的不同之处
 服务发现service-discovery-registry的导出UrlUtils.isRegistry(invoker.getUrl() 判断结果为true会走这个逻辑
```java
 @Override
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
        //注册中心的协议导出直接执行
        // 服务发现service-discovery-registry的导出会走这个逻辑
        if (UrlUtils.isRegistry(invoker.getUrl())) {
            return protocol.export(invoker);
        }
        //过滤器调用链FilterChainBuilder的扩展对象查询
        FilterChainBuilder builder = getFilterChainBuilder(invoker.getUrl());
       	//这里分为2步 生成过滤器调用链 然后使用链表中的节点调用  这里值查询provider类型的过滤器
        return protocol.export(builder.buildInvokerChain(invoker, SERVICE_FILTER_KEY, CommonConstants.PROVIDER));
    }
```


与 协议监听器Wrapper ProtocolListenerWrapper 的不同之处

 服务发现service-discovery-registry的导出UrlUtils.isRegistry(invoker.getUrl() 判断结果为true会走这个逻辑
```java
 @Override
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
        //注册中心地址则直接导出
         // 服务发现service-discovery-registry的导出会走这个逻辑
        if (UrlUtils.isRegistry(invoker.getUrl())) {
            return protocol.export(invoker);
        }
        // 先导出对象 再创建过滤器包装对象 执行监听器逻辑
        return new ListenerExporterWrapper<T>(protocol.export(invoker),
                Collections.unmodifiableList(ScopeModelUtil.getExtensionLoader(ExporterListener.class, invoker.getUrl().getScopeModel())
                        .getActivateExtension(invoker.getUrl(), EXPORTER_LISTENER_KEY)));
    }
```


与 16.6.3.4 QOS的协议Wrapper QosProtocolWrapper 不同之处

 服务发现service-discovery-registry的导出UrlUtils.isRegistry(invoker.getUrl() 判断结果为true会走这个逻辑
 
```java
@Override
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
         //注册中心导出的时候开启QOS 默认端口22222
        if (UrlUtils.isRegistry(invoker.getUrl())) {
            startQosServer(invoker.getUrl());
            return protocol.export(invoker);
        }
        return protocol.export(invoker);
    }
```

启动QOS服务startQosServer
```java
private void startQosServer(URL url) {
        try {
            if (!hasStarted.compareAndSet(false, true)) {
                return;
            }

            boolean qosEnable = url.getParameter(QOS_ENABLE, true);
            if (!qosEnable) {
                logger.info("qos won't be started because it is disabled. " +
                        "Please check dubbo.application.qos.enable is configured either in system property, " +
                        "dubbo.properties or XML/spring-boot configuration.");
                return;
            }

            String host = url.getParameter(QOS_HOST);
            int port = url.getParameter(QOS_PORT, QosConstants.DEFAULT_PORT);
            boolean acceptForeignIp = Boolean.parseBoolean(url.getParameter(ACCEPT_FOREIGN_IP, "false"));
            Server server = frameworkModel.getBeanFactory().getBean(Server.class);
            server.setHost(host);
            server.setPort(port);
            server.setAcceptForeignIp(acceptForeignIp);
            server.start();

        } catch (Throwable throwable) {
            logger.warn("Fail to start qos server: ", throwable);
        }
```

QOS的Server的启动方法start

```java
public void start() throws Throwable {
        if (!started.compareAndSet(false, true)) {
            return;
        }
        //1个主线程
        boss = new NioEventLoopGroup(1, new DefaultThreadFactory("qos-boss", true));
        //0个从线程
        worker = new NioEventLoopGroup(0, new DefaultThreadFactory("qos-worker", true));
        //服务端启动器，和参数设置
        ServerBootstrap serverBootstrap = new ServerBootstrap();
        serverBootstrap.group(boss, worker);
        serverBootstrap.channel(NioServerSocketChannel.class);
        serverBootstrap.option(ChannelOption.SO_REUSEADDR, true);
        serverBootstrap.childOption(ChannelOption.TCP_NODELAY, true);
        serverBootstrap.childHandler(new ChannelInitializer<Channel>() {

            @Override
            protected void initChannel(Channel ch) throws Exception {
                ch.pipeline().addLast(new QosProcessHandler(frameworkModel, welcome, acceptForeignIp));
            }
        });
        try {
            if (StringUtils.isBlank(host)) {
                serverBootstrap.bind(port).sync();
            } else {
                serverBootstrap.bind(host, port).sync();
            }

            logger.info("qos-server bind localhost:" + port);
        } catch (Throwable throwable) {
            logger.error("qos-server can not bind localhost:" + port, throwable);
            throw throwable;
        }
    }
```

QOS处理器为QosProcessHandler关于QosProcessHandler的细节这里先不说




最后一个不同的地方调用链路走的这个 RegistryProtocol

### 16.7.2 通过注册协议导出服务与注册服务的流程
RegistryProtocol的导出方法：
这个方法非常重要也是服务注册的核心代码，先概括下包含了哪些步骤
- 覆盖配置
- 导出协议端口开启TCP服务
- 注册到注册中心
- 通知服务启动了

```java
 @Override
    public <T> Exporter<T> export(final Invoker<T> originInvoker) throws RpcException {
       //service-discovery-registry://8.131.79.126:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=14256&registry=zookeeper&release=3.0.8&timestamp=1653710477057
        URL registryUrl = getRegistryUrl(originInvoker);
        // url to export locally
        //dubbo://192.168.1.9:20880/link.elastic.dubbo.entity.DemoService?anyhost=true&application=dubbo-demo-api-provider&background=false&bind.ip=192.168.1.9&bind.port=20880&deprecated=false&dubbo=2.0.2&dynamic=true&generic=false&interface=link.elastic.dubbo.entity.DemoService&methods=sayHello,sayHelloAsync&pid=14256&release=3.0.8&service-name-mapping=true&side=provider&timestamp=1653710479073
        URL providerUrl = getProviderUrl(originInvoker);

        // Subscribe the override data
        // FIXME When the provider subscribes, it will affect the scene : a certain JVM exposes the service and call
        //  the same service. Because the subscribed is cached key with the name of the service, it causes the
        //  subscription information to cover.
        //provider://192.168.1.9:20880/link.elastic.dubbo.entity.DemoService?anyhost=true&application=dubbo-demo-api-provider&background=false&bind.ip=192.168.1.9&bind.port=20880&category=configurators&check=false&deprecated=false&dubbo=2.0.2&dynamic=true&generic=false&interface=link.elastic.dubbo.entity.DemoService&methods=sayHello,sayHelloAsync&pid=14256&release=3.0.8&service-name-mapping=true&side=provider&timestamp=1653710479073
        
        final URL overrideSubscribeUrl = getSubscribedOverrideUrl(providerUrl);
        //override配置
        final OverrideListener overrideSubscribeListener = new OverrideListener(overrideSubscribeUrl, originInvoker);
        Map<URL, NotifyListener> overrideListeners = getProviderConfigurationListener(providerUrl).getOverrideListeners();
        overrideListeners.put(registryUrl, overrideSubscribeListener);

        providerUrl = overrideUrlWithConfig(providerUrl, overrideSubscribeListener);
        
        //export invoker
        final ExporterChangeableWrapper<T> exporter = doLocalExport(originInvoker, providerUrl);

        // url to registry
        //通过URL获取 注册中心Registry操作对象
        final Registry registry = getRegistry(registryUrl);
        //需要向注册中心注册地址转换
        //dubbo://192.168.1.9:20880/link.elastic.dubbo.entity.DemoService?anyhost=true&application=dubbo-demo-api-provider&background=false&deprecated=false&dubbo=2.0.2&dynamic=true&generic=false&interface=link.elastic.dubbo.entity.DemoService&methods=sayHello,sayHelloAsync&pid=14656&release=3.0.8&service-name-mapping=true&side=provider&timestamp=1653711086189
        final URL registeredProviderUrl = getUrlToRegistry(providerUrl, registryUrl);

        // decide if we need to delay publish (provider itself and registry should both need to register)
        boolean register = providerUrl.getParameter(REGISTER_KEY, true) && registryUrl.getParameter(REGISTER_KEY, true);
        //是否向注册中心注册
        if (register) {
            register(registry, registeredProviderUrl);
        }

        // register stated url on provider model
        registerStatedUrl(registryUrl, registeredProviderUrl, register);


        exporter.setRegisterUrl(registeredProviderUrl);
        exporter.setSubscribeUrl(overrideSubscribeUrl);

        if (!registry.isServiceDiscovery()) {
            // Deprecated! Subscribe to override rules in 2.6.x or before.
            registry.subscribe(overrideSubscribeUrl, overrideSubscribeListener);
        }
		//内置监听器通知 这个不是通知消费者的
        notifyExport(exporter);
        //Ensure that a new exporter instance is returned every time export
        return new DestroyableExporter<>(exporter);
    }
```

## 16.8 doLocalExport本地导出协议开启端口
前面已经看过了本地协议JVM协议的服务导出和注册中心配置的导出，这里可以直接看一些关键代码：

```java
  private <T> ExporterChangeableWrapper<T> doLocalExport(final Invoker<T> originInvoker, URL providerUrl) {
        String key = getCacheKey(originInvoker);

        return (ExporterChangeableWrapper<T>) bounds.computeIfAbsent(key, s -> {
            Invoker<?> invokerDelegate = new InvokerDelegate<>(originInvoker, providerUrl);
            //代码中用的这个protoco对象是dubbo自动生成的适配器对象protocol$Adaptive 适配器对象会根据当前协议的参数来查询具体的协议扩展对象
            return new ExporterChangeableWrapper<>((Exporter<T>) protocol.export(invokerDelegate), originInvoker);
        });
    }
```

上面这个protocol$Adaptive 协议的export导出方法与之前的一样也会经历下面几个过程，具体细节可以参考JVM协议的导出：
- ProtocolSerializationWrapper
- ProtocolFilterWrapper
- ProtocolListenerWrapper
- QosProtocolWrapper
- 唯一不同的是我们这里对应的协议扩展类型为DubboProtocol、
接下来来看下DubboProtocol的导出服务export方法实现：

```java
 @Override
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
        checkDestroyed();
        //服务提供者的url参考例子dubbo://192.168.1.9:20880/link.elastic.dubbo.entity.DemoService?anyhost=true&application=dubbo-demo-api-provider&background=false&bind.ip=192.168.1.9&bind.port=20880&deprecated=false&dubbo=2.0.2&dynamic=true&generic=false&interface=link.elastic.dubbo.entity.DemoService&methods=sayHello,sayHelloAsync&pid=6043&release=3.0.8&service-name-mapping=true&side=provider&timestamp=1654224285437
        URL url = invoker.getUrl();

        // export service.
        //生成服务的key参考：link.elastic.dubbo.entity.DemoService:20880
        String key = serviceKey(url);
        //创建导出服务用的导出器DubboExporter
        DubboExporter<T> exporter = new DubboExporter<T>(invoker, key, exporterMap);

        //export a stub service for dispatching event
        //stub配置校验
        Boolean isStubSupportEvent = url.getParameter(STUB_EVENT_KEY, DEFAULT_STUB_EVENT);
        Boolean isCallbackservice = url.getParameter(IS_CALLBACK_SERVICE, false);
        if (isStubSupportEvent && !isCallbackservice) {
            String stubServiceMethods = url.getParameter(STUB_EVENT_METHODS_KEY);
            if (stubServiceMethods == null || stubServiceMethods.length() == 0) {
                if (logger.isWarnEnabled()) {
                    logger.warn(new IllegalStateException("consumer [" + url.getParameter(INTERFACE_KEY) +
                            "], has set stubproxy support event ,but no stub methods founded."));
                }

            }
        }
		//创建服务开启服务端口
        openServer(url);
        //
        optimizeSerialization(url);

        return exporter;
    }
```
### 开启服务端口
这里就到了RPC协议的TCP通信模块了，对应DubboProtocol 的    openServer(url);方法

```java
 private void openServer(URL url) {
        checkDestroyed();
        // find server. 地址作为key这里是192.168.1.9:20880
        String key = url.getAddress();
        // client can export a service which only for server to invoke
        //默认提供者开启服务，消费者是不能开启服务的
        boolean isServer = url.getParameter(IS_SERVER_KEY, true);
        if (isServer) {
            //协议服务器 下面一个双重校验锁检查，如果为空则创建服务
            ProtocolServer server = serverMap.get(key);
            if (server == null) {
                synchronized (this) {
                    server = serverMap.get(key);
                    if (server == null) {
                        serverMap.put(key, createServer(url));
                    }else {
                        server.reset(url);
                    }
                }
            } else {
                // server supports reset, use together with override
                server.reset(url);
            }
        }
    }
```

为当前地址创建协议服务对应方法如下：
DubboProtocol的createServer方法
```java
private ProtocolServer createServer(URL url) {
  		//下面将url增加了心跳参数最终如下dubbo://192.168.1.9:20880/link.elastic.dubbo.entity.DemoService?anyhost=true&application=dubbo-demo-api-provider&background=false&bind.ip=192.168.1.9&bind.port=20880&channel.readonly.sent=true&codec=dubbo&deprecated=false&dubbo=2.0.2&dynamic=true&generic=false&heartbeat=60000&interface=link.elastic.dubbo.entity.DemoService&methods=sayHello,sayHelloAsync&pid=6700&release=3.0.8&service-name-mapping=true&side=provider&timestamp=1654225251112
        url = URLBuilder.from(url)
                // send readonly event when server closes, it's enabled by default
                .addParameterIfAbsent(CHANNEL_READONLYEVENT_SENT_KEY, Boolean.TRUE.toString())
                // enable heartbeat by default
                .addParameterIfAbsent(HEARTBEAT_KEY, String.valueOf(DEFAULT_HEARTBEAT))
                .addParameter(CODEC_KEY, DubboCodec.NAME)
                .build();
       //这里服务端使用的网络库这里是默认值netty
        String str = url.getParameter(SERVER_KEY, DEFAULT_REMOTING_SERVER);

        if (StringUtils.isNotEmpty(str) && !url.getOrDefaultFrameworkModel().getExtensionLoader(Transporter.class).hasExtension(str)) {
            throw new RpcException("Unsupported server type: " + str + ", url: " + url);
        }
		//dubbo交换器层对象创建
        ExchangeServer server;
        try {
        	//这个方法会绑定端口，关于交换器与传输网络层到后面统一说
        	//这里通过绑定url和请求处理器来创建交换器对象
            server = Exchangers.bind(url, requestHandler);
        } catch (RemotingException e) {
            throw new RpcException("Fail to start server(url: " + url + ") " + e.getMessage(), e);
        }

        str = url.getParameter(CLIENT_KEY);
        if (StringUtils.isNotEmpty(str)) {
            Set<String> supportedTypes = url.getOrDefaultFrameworkModel().getExtensionLoader(Transporter.class).getSupportedExtensions();
            if (!supportedTypes.contains(str)) {
                throw new RpcException("Unsupported client type: " + str);
            }
        }

        DubboProtocolServer protocolServer = new DubboProtocolServer(server);
        //关闭等待时长默认为10秒
        loadServerProperties(protocolServer);
        return protocolServer;
    }
```

## 16.9 向注册中心注册服务register
 这个细节在下个博客中说涉及到Dubbo3的双注册



原文地址：[16-模块发布器发布服务全过程](https://blog.elastic.link/2022/07/10/dubbo/16-mo-kuai-fa-bu-qi-fa-bu-fu-wu-quan-guo-cheng/)