---
title: "17-Dubbo服务提供者的双注册原理"
linkTitle: "17-Dubbo服务提供者的双注册原理"
date: 2022-08-17
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] 对于直接使用Dubbo3的用户还好，可以仅仅开启应用级注册，但是对于Dubbo2.x的用户升级到Dubbo3的用户来说前期都是要开启双注册来慢慢迁移的，既注册传统的接口信息到注册中心，又注册应用信息到注册中心，同时注册应用与接口关系的元数据信息。
---

# 17-Dubbo服务提供者的双注册原理
## 17.1 简介
上个博客[《15-Dubbo的三大中心之元数据中心源码解析》](https://blog.elastic.link/2022/07/10/dubbo/15-dubbo-de-san-da-zhong-xin-zhi-yuan-shu-ju-zhong-xin-yuan-ma-jie-xi/)导出服务端的时候多次提到了元数据中心，注册信息的注册。
Dubbo3出来时间不太长，对于现在的用户来说大部分使用的仍旧是Dubbo2.x，
Dubbo3 比较有特色也是会直接使用到的功能就是**应用级服务发现**：

- 应用级服务发现 
*从服务/接口粒度到应用粒度的升级，使得 Dubbo 在集群可伸缩性、连接异构微服务体系上更具优势。应用粒度能以更低的资源消耗支持超百万实例规模集群程； 实现与 Spring Cloud、Kubernetes Service 等异构微服务体系的互联互通。*

对于直接使用Dubbo3的用户还好，可以仅仅开启应用级注册，但是对于Dubbo2.x的用户升级到Dubbo3的用户来说前期都是要开启双注册来慢慢迁移的，既注册传统的接口信息到注册中心，又注册应用信息到注册中心，同时注册应用与接口关系的元数据信息。
关于双注册与服务迁移的过程的使用可以参考官网：
[应用级地址发现迁移指南](/zh-cn/docs/migration/migration-service-discovery/)

关于官网提供者双注册的图我这里贴一下，方便了解：
![在这里插入图片描述](/imgs/v3/migration/provider-registration.png)

 
##  17.2 双注册配置的读取
### 17.2.1 注册中心地址作为元数据中心
这个配置的解析过程在前面的博客介绍元数据中心的时候很详细的说了相关链接：[15-Dubbo的三大中心之元数据中心源码解析](https://blog.elastic.link/2022/07/10/dubbo/15-dubbo-de-san-da-zhong-xin-zhi-yuan-shu-ju-zhong-xin-yuan-ma-jie-xi/)

对应代码位于：DefaultApplicationDeployer类型的startMetadataCenter()方法

```java
private void startMetadataCenter() {
		//如果未配置元数据中心的地址等配置则使用注册中心的地址等配置做为元数据中心的配置
        useRegistryAsMetadataCenterIfNecessary();
        //...省略掉其他代码防止受到干扰
    }

```
具体逻辑是这个方法：
useRegistryAsMetadataCenterIfNecessary

```java
private void useRegistryAsMetadataCenterIfNecessary() {
		//配置缓存中查询元数据配置
        Collection<MetadataReportConfig> metadataConfigs = configManager.getMetadataConfigs();
		
        //...省略掉空判断
		//查询是否有注册中心设置了默认配置isDefault 设置为true的注册中心则为默认注册中心列表,如果没有注册中心设置为默认注册中心,则获取所有未设置默认配置的注册中心列表
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
                  //...省略掉具体的逻辑
                });
        }
    }
```
关于元数据中心地址的获取，主要经过如下逻辑：
-  **查询：** 所有可用的默认注册中心列表
- **遍历：** 多注册中心遍历
- **筛选：** 选符合条件的注册中心 (筛选逻辑就是查看是否有对应协议的扩展支持)
- **转化：** 注册中心配置RegistryConfig映射转换为元数据中心配置类型MetadataReportConfig

MetadataReportConfig 映射就是获取需要的配置。

最后会把查询到的元数据中心配置存储在配置缓存中方便后续使用。
 
### 17.2.2 双注册模式配置
双注册配置类型是这个

```java
dubbo.application.register-mode=all
```
默认值为all代表应用级注册和接口级注册，当前在完全迁移到应用级注册之后可以将服务直接迁移到应用级配置上去。
配置值解释：
- all 双注册
- instance 应用级注册
- interface 接口级注册

后面的代码如果想要看更详细的代码可以看博客[《16-模块发布器发布服务全过程》](https://blog.elastic.link/2022/07/10/dubbo/16-mo-kuai-fa-bu-qi-fa-bu-fu-wu-quan-guo-cheng/)
关于这个配置的使用我们详细来看下，在Dubbo服务注册时候会先通过此配置查询需要注册服务地址，具体代码位于ServiceConfig的doExportUrls()方法中：

```java
private void doExportUrls() {
      //省略掉前面的代码...
        List<URL> registryURLs = ConfigValidationUtils.loadRegistries(this, true);
      //省略掉后面的代码...
    }
```
然后就是具体注册中心地址的获取过程我们看下：
ConfigValidationUtils的加载注册中心地址方法loadRegistries
```java
 public static List<URL> loadRegistries(AbstractInterfaceConfig interfaceConfig, boolean provider) {
        // check && override if necessary
           //省略掉前面的代码...
           //这里会获取到一个接口配置注册地址例如：registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=9008&registry=zookeeper&release=3.0.8&timestamp=1653703292768
       List<RegistryConfig> registries = interfaceConfig.getRegistries();
           //省略掉中间的的代码...
        return genCompatibleRegistries(interfaceConfig.getScopeModel(), registryList, provider);
    }
```

ConfigValidationUtils的双注册地址的获取genCompatibleRegistries方法.
前面代码获取到了一个注册中心地址列表例如：

```java
registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=9008&registry=zookeeper&release=3.0.8&timestamp=1653703292768
```
下面可以看下如果根据配置来转换为应用级注册地址+接口级注册地址

```java
private static List<URL> genCompatibleRegistries(ScopeModel scopeModel, List<URL> registryList, boolean provider) {
        List<URL> result = new ArrayList<>(registryList.size());
        registryList.forEach(registryURL -> {
            if (provider) {
                // for registries enabled service discovery, automatically register interface compatible addresses.
                String registerMode;
                if (SERVICE_REGISTRY_PROTOCOL.equals(registryURL.getProtocol())) {
                   //为了更好理解这里简化掉服务发现注册地址配置的逻辑判断过程仅仅看当前例子提供的值走的逻辑
                } else {
                   //双注册模式配置查询 对应参数为dubbo.application.register-mode 默认值为all
                    registerMode = registryURL.getParameter(REGISTER_MODE_KEY, ConfigurationUtils.getCachedDynamicProperty(scopeModel, DUBBO_REGISTER_MODE_DEFAULT_KEY, DEFAULT_REGISTER_MODE_ALL));
                    //如果用户配置了一个错误的注册模式配置则只走接口级配置 这里默认值为interface
                    if (!isValidRegisterMode(registerMode)) {
                        registerMode = DEFAULT_REGISTER_MODE_INTERFACE;
                    }
                    //这个逻辑是满足应用级注册就添加一个应用级注册的地址
                    if ((DEFAULT_REGISTER_MODE_INSTANCE.equalsIgnoreCase(registerMode) || DEFAULT_REGISTER_MODE_ALL.equalsIgnoreCase(registerMode))
                        && registryNotExists(registryURL, registryList, SERVICE_REGISTRY_PROTOCOL)) {
                        URL serviceDiscoveryRegistryURL = URLBuilder.from(registryURL)
                            .setProtocol(SERVICE_REGISTRY_PROTOCOL)
                            .removeParameter(REGISTRY_TYPE_KEY)
                            .build();
                        result.add(serviceDiscoveryRegistryURL);
                    }
					//这个逻辑是满足接口级注册配置就添加一个接口级注册地址
                    if (DEFAULT_REGISTER_MODE_INTERFACE.equalsIgnoreCase(registerMode) || DEFAULT_REGISTER_MODE_ALL.equalsIgnoreCase(registerMode)) {
                        result.add(registryURL);
                    }
                }
 		//省略掉若干代码和括号

        return result;
    }
```
可以看到这里简化的配置比较容易理解了
-   双注册模式配置查询 对应参数为dubbo.application.register-mode ，默认值为all
- 如果用户配置了一个错误的注册模式配置则只走接口级配置 这里默认值为interface
- 满足应用级注册就添加一个应用级注册的地址
- 满足接口级注册配置就添加一个接口级注册地址

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
	
最终的注册地址配置如下：
接口级注册地址：

```java
registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=9008&registry=zookeeper&release=3.0.8&timestamp=1653703292768
```
 

应用级注册地址：

```java
service-discovery-registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=10275&registry=zookeeper&release=3.0.8&timestamp=1653704425920
```


## 17.3 双注册服务数据的注册
### 17.3.1 双注册代码逻辑调用简介
前面说了这个注册服务的配置地址会由Dubbo内部进行判断如果判断是all的话会自动将一个配置的注册地址转变为两个一个是传统的接口级注册，一个是应用级注册使用的配置地址

然后我们先看注册中心，注册服务数据的源码
如果想要查看源码细节可以在RegistryProtocol类型的export(final Invoker<T> originInvoker) 方法的如下代码位置打断点：

RegistryProtocol的export方法的注册中心注册数据代码如下：

```java
 		// url to registry 注册服务对外的接口
 		//如果url为service-discovery-registry发现则这个实现类型为ServiceDiscoveryRegistry
        final Registry registry = getRegistry(registryUrl);
		//服务发现的提供者url: dubbo://192.168.1.9:20880/link.elastic.dubbo.entity.DemoService?anyhost=true&application=dubbo-demo-api-provider&background=false&deprecated=false&dubbo=2.0.2&dynamic=true&generic=false&interface=link.elastic.dubbo.entity.DemoService&methods=sayHello,sayHelloAsync&pid=19559&release=3.0.8&service-name-mapping=true&side=provider&timestamp=1654938441023
        final URL registeredProviderUrl = getUrlToRegistry(providerUrl, registryUrl);

        // decide if we need to delay publish (provider itself and registry should both need to register)
        //register参数是否 注册数据到注册中心
        boolean register = providerUrl.getParameter(REGISTER_KEY, true) && registryUrl.getParameter(REGISTER_KEY, true);
        if (register) {
       			//这里有两种情况 接口级注册会将接口级服务提供者数据直接注册到Zookeper上面，服务发现（应用级注册）这里仅仅会将注册数据转换为服务元数据等后面来发布元数据
            register(registry, registeredProviderUrl);
        }

        // register stated url on provider model
        //向提供者模型注册提供者配置ProviderModel
        registerStatedUrl(registryUrl, registeredProviderUrl, register);


        exporter.setRegisterUrl(registeredProviderUrl);
        exporter.setSubscribeUrl(overrideSubscribeUrl);

        if (!registry.isServiceDiscovery()) {
            // Deprecated! Subscribe to override rules in 2.6.x or before.
            registry.subscribe(overrideSubscribeUrl, overrideSubscribeListener);
        }
```

在上个博客中我们整体说了下服务注册时候的一个流程，关于数据向注册中心的注册细节这里可以详细看下


### 17.3.2  注册中心领域对象的初始化
前面的代码使用url来获取注册中心操作对象如下调用代码：

```java
// url to registry 注册服务对外的接口
final Registry registry = getRegistry(registryUrl);
```

对应代码如下：
```java
 protected Registry getRegistry(final URL registryUrl) {
        //这里分为两步先获取注册中心工厂对象
        RegistryFactory registryFactory = ScopeModelUtil.getExtensionLoader(RegistryFactory.class, registryUrl.getScopeModel()).getAdaptiveExtension();
        //使用注册中心工厂对象获取注册中心操作对象
        return registryFactory.getRegistry(registryUrl);
    }
```

关于参数URL有两个在前面已经说过，url信息如下：

接口级注册地址：
```java
registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=9008&registry=zookeeper&release=3.0.8&timestamp=1653703292768
```
 

应用级注册地址：

```java
service-discovery-registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=10275&registry=zookeeper&release=3.0.8&timestamp=1653704425920
```

注册中心工厂对象与注册中心操作对象的获取与执行我们通过Debug来看比较麻烦，这里涉及到很多扩展机制动态生成的代码我们无法看到，这里我直接来贴一下比较关键的一些类型，以Zookeeper注册中心来举例子： 

   先来看下注册工厂相关的类型：
![在这里插入图片描述](/imgs/blog/source-blog/17-register.png) 
- RegistryFactory 注册中心对象获取
- AbstractRegistryFactory	 模板类型封装注册中心对象获取的基本逻辑，比如缓存和基本的逻辑判断
- ServiceDiscoveryRegistryFactory 用于创建服务发现注册中心工厂对象 用于创建ServiceDiscoveryRegistry对象
- ZookeeperRegistryFactory 用于创建ZookeeperRegistry类型对象
- NacosRegistryFactory Nacos注册中心工厂对象 用于创建NacosRegistry


接下来看封装了注册中心操作逻辑的注册中心领域对象：


![在这里插入图片描述](/imgs/blog/source-blog/17-register2.png)
 
 - Node 节点信息开放接口 比如节点 url的获取 ，销毁
 - RegistryService 注册服务接口，比如注册，订阅，查询等操作
 - Registry 注册中心接口，是否服务发现查询，注册，取消注册方法
 - AbstractRegistry 注册中心逻辑抽象模板类型，封装了注册，订阅，通知的基本逻辑，和本地缓存注册中心信息的基本逻辑
 - FailbackRegistry 封装了失败重试的逻辑 
 - NacosRegistry  封装了以nacos作为注册中心的基本逻辑
 - ServiceDiscoveryRegistry 应用级服务发现注册中心逻辑，现在不需要这种网桥实现，协议可以直接与服务发现交互。ServiceDiscoveryRegistry是一种非常特殊的注册表实现，用于以兼容的方式将旧的接口级服务发现模型与3.0中引入的新服务发现模型连接起来。
它完全符合注册表SPI的扩展规范，但与zookeeper和Nacos的具体实现不同，因为它不与任何真正的第三方注册表交互，而只与过程中ServiceDiscovery的相关组件交互。简而言之，它架起了旧接口模型和新服务发现模型之间的桥梁：register()方法主要通过与MetadataService交互，将接口级数据聚合到MetadataInfo中subscribe() 触发应用程序级服务发现模型的整个订阅过程。-根据ServiceNameMapping将接口映射到应用程序。-启动新的服务发现侦听器（InstanceListener），并使NotifierListener成为InstanceListener的一部分。
- CacheableFailbackRegistry 提供了一些本地内存缓存的逻辑 对注册中心有用，注册中心的sdk将原始字符串作为提供程序实例返回，例如zookeeper和etcd 
- ZookeeperRegistry Zookeeper作为注册中心的基本操作逻辑封装


了解了这几个领域对象这里我们回到代码逻辑，这里直接看将会执行的一些核心逻辑：

 
```java
 protected Registry getRegistry(final URL registryUrl) {
        //这里分为两步先获取注册中心工厂对象
        RegistryFactory registryFactory = ScopeModelUtil.getExtensionLoader(RegistryFactory.class, registryUrl.getScopeModel()).getAdaptiveExtension();
        //使用注册中心工厂对象获取注册中心操作对象
        return registryFactory.getRegistry(registryUrl);
    }
```

前面注册中心工厂不论那种协议的地址信息获取到的都是一个RegistryFactory$Adaptive类型（由扩展机制的字节码工具自动生成的代码）

如果getRegistry参数为应用级注册地址。如下所示将获取到的类型为ServiceDiscoveryRegistryFactory逻辑来获取注册中心：
（这个逻辑是@Adaptive注解产生的了逻辑具体原理可以看扩展机制中@Adaptive的实现）

```java
service-discovery-registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=10275&registry=zookeeper&release=3.0.8&timestamp=1653704425920
```

getRegistry方法优先走的逻辑是这里：AbstractRegistryFactory模板类型中的getRegistry方法

```java
@Override
    public Registry getRegistry(URL url) {
        if (registryManager == null) {
            throw new IllegalStateException("Unable to fetch RegistryManager from ApplicationModel BeanFactory. " +
                "Please check if `setApplicationModel` has been override.");
        }
		//销毁状态直接返回
        Registry defaultNopRegistry = registryManager.getDefaultNopRegistryIfDestroyed();
        if (null != defaultNopRegistry) {
            return defaultNopRegistry;
        }

        url = URLBuilder.from(url)
            .setPath(RegistryService.class.getName())
            .addParameter(INTERFACE_KEY, RegistryService.class.getName())
            .removeParameter(TIMESTAMP_KEY)
            .removeAttribute(EXPORT_KEY)
            .removeAttribute(REFER_KEY)
            .build();
          //这个key为 service-discovery-registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService
        String key = createRegistryCacheKey(url);
        Registry registry = null;
        //check配置 是否检查注册中心连通 默认为true
        boolean check = url.getParameter(CHECK_KEY, true) && url.getPort() != 0;
        // Lock the registry access process to ensure a single instance of the registry
        //给写操作加锁方式并发写问题
        registryManager.getRegistryLock().lock();
        try {
             //锁内检查是否销毁的逻辑
            // double check
            // fix https://github.com/apache/dubbo/issues/7265.
            defaultNopRegistry = registryManager.getDefaultNopRegistryIfDestroyed();
            if (null != defaultNopRegistry) {
                return defaultNopRegistry;
            }
            //锁内检查是否缓存中存在存在则直接返回
            registry = registryManager.getRegistry(key);
            if (registry != null) {
                return registry;
            }
            //create registry by spi/ioc
            //使用url创建注册中心操作的逻辑
            registry = createRegistry(url);
        } catch (Exception e) {
           //check配置检查
            if (check) {
                throw new RuntimeException("Can not create registry " + url, e);
            } else {
                LOGGER.warn("Failed to obtain or create registry ", e);
            }
        } finally {
            // Release the lock
            registryManager.getRegistryLock().unlock();
        }

        if (check && registry == null) {
            throw new IllegalStateException("Can not create registry " + url);
        }
		//缓存逻辑
        if (registry != null) {
            registryManager.putRegistry(key, registry);
        }
        return registry;
    }
```

逻辑其实吧比较简单，概括下上面的逻辑：
- 销毁逻辑判断
- 缓存获取，存在则直接返回
- 根据注册中心url配置，创建注册中心操作对象
- 注册中心连接失败的check配置逻辑处理
- 将注册中心操作对象存入缓存

上面比较重要的逻辑是createRegistry这个
整个调用过程我给大家看下Debug的详情，这里很多逻辑由扩展机制产生的这里直接看下逻辑调用栈，有几个需要关注的地方我圈了起来：
![在这里插入图片描述](/imgs/blog/source-blog/17-register3.png)
我们继续看服务发现的注册中心工厂对象的获取，代码如下：
ServiceDiscoveryRegistryFactory类型的createRegistry方法

```java
 @Override
    protected Registry createRegistry(URL url) {
    //判断url是否是这个前缀：service-discovery-registry
        if (UrlUtils.hasServiceDiscoveryRegistryProtocol(url)) {
           //切换下协议：将服务发现协议切换为配置的注册中心协议这里是Zookeeper如下：
           //zookeeper://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&interface=org.apache.dubbo.registry.RegistryService&pid=39884&release=3.0.8
            String protocol = url.getParameter(REGISTRY_KEY, DEFAULT_REGISTRY);
            url = url.setProtocol(protocol).removeParameter(REGISTRY_KEY);
        }
        //创建服务发现注册中心对象对象
        return new ServiceDiscoveryRegistry(url, applicationModel);
    }
```
通过以上代码可以看到其实最终创建的是一个ServiceDiscoveryRegistry注册中心对象，这个url协议被转换为了对应注册中心的协议，也就是说双注册会有两个协议一个是原先的接口级注册注册中心对象（这个还未说到）和这里对应注册中心协议的服务发现注册中心对象ServiceDiscoveryRegistry



### 17.3.3 ServiceDiscoveryRegistry


ServiceDiscoveryRegistry服务发现注册中心对象的初始化过程：

#### 17.3.3.1 ServiceDiscoveryRegistry的构造器：

```java
   public ServiceDiscoveryRegistry(URL registryURL, ApplicationModel applicationModel) {
        super(registryURL);
        //根据url创建一个服务发现对象类型为ServiceDiscovery
        this.serviceDiscovery = createServiceDiscovery(registryURL);
        //这个类型为是serviceNameMapping类型是MetadataServiceNameMapping类型
        this.serviceNameMapping = (AbstractServiceNameMapping) ServiceNameMapping.getDefaultExtension(registryURL.getScopeModel());
        super.applicationModel = applicationModel;
    }
```

 ServiceDiscoveryRegistry中创建服务发现对象createServiceDiscovery方法

```java
protected ServiceDiscovery createServiceDiscovery(URL registryURL) {
        return getServiceDiscovery(registryURL.addParameter(INTERFACE_KEY, ServiceDiscovery.class.getName())
            .removeParameter(REGISTRY_TYPE_KEY));
    }
```

  
 ServiceDiscoveryRegistry中创建服务发现对象getServiceDiscovery方法
 
```java
private ServiceDiscovery getServiceDiscovery(URL registryURL) {
//服务发现工厂对象的获取这里是ServiceDiscoveryFactory类型，
        ServiceDiscoveryFactory factory = getExtension(registryURL);
        //服务发现工厂对象获取服务发现对象
        return factory.getServiceDiscovery(registryURL);
    }
```
ServiceDiscoveryFactory和ServiceDiscovery类型可以往后看

#### 17.3.3.2 父类型FailbackRegistry的构造器
```java
   public FailbackRegistry(URL url) {
        super(url);
         //重试间隔配置retry.period ，默认为5秒
        this.retryPeriod = url.getParameter(REGISTRY_RETRY_PERIOD_KEY, DEFAULT_REGISTRY_RETRY_PERIOD);

        // since the retry task will not be very much. 128 ticks is enough.
        //因为重试任务不会太多。128个刻度就足够了。Dubbo封装的时间轮用于高效率的重试，这个在Kafka也自定义实现了后续可以单独来看看
        retryTimer = new HashedWheelTimer(new NamedThreadFactory("DubboRegistryRetryTimer", true), retryPeriod, TimeUnit.MILLISECONDS, 128);
    }
```

#### 17.3.3.3 AbstractRegistry的构造器
参数url如下所示：
```java
zookeeper://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&interface=org.apache.dubbo.registry.RegistryService&pid=39884&release=3.0.8
```

```java
   
    public AbstractRegistry(URL url) {
        setUrl(url);
        registryManager = url.getOrDefaultApplicationModel().getBeanFactory().getBean(RegistryManager.class);
         //是否本地缓存默认为true
        localCacheEnabled = url.getParameter(REGISTRY_LOCAL_FILE_CACHE_ENABLED, true);
        registryCacheExecutor = url.getOrDefaultFrameworkModel().getBeanFactory()
            .getBean(FrameworkExecutorRepository.class).getSharedExecutor();
        if (localCacheEnabled) {
            // Start file save timer 是否同步缓存默认为false
            syncSaveFile = url.getParameter(REGISTRY_FILESAVE_SYNC_KEY, false);
             //默认缓存的文件路径与文件名字为：/Users/song/.dubbo/dubbo-registry-dubbo-demo-api-provider-127.0.0.1-2181.cache
            String defaultFilename = System.getProperty(USER_HOME) + DUBBO_REGISTRY +
                url.getApplication() + "-" + url.getAddress().replaceAll(":", "-") + CACHE;
               //未指定缓存的文件名字则用默认的文件名字
            String filename = url.getParameter(FILE_KEY, defaultFilename);
            File file = null;
            //父目录创建，保证目录存在
            if (ConfigUtils.isNotEmpty(filename)) {
                file = new File(filename);
                if (!file.exists() && file.getParentFile() != null && !file.getParentFile().exists()) {
                    if (!file.getParentFile().mkdirs()) {
                        throw new IllegalArgumentException("Invalid registry cache file " + file + ", cause: Failed to create directory " + file.getParentFile() + "!");
                    }
                }
            }
            this.file = file;
            // When starting the subscription center,
            // we need to read the local cache file for future Registry fault tolerance processing.
            //加载本地磁盘文件
            loadProperties();
            //变更推送
            notify(url.getBackupUrls());
        }
    }
```


### 17.3.4 将服务提供者数据转换到本地内存的元数据信息中
在前面我们看到了RegistryProtocol中调用register来注册服务提供者的数据到注册的中心，接下来详细看下实现原理：
下面参数为ServiceDiscoveryRegistry为情况下举例子：ServiceDiscoveryRegistry类型的register方法与ZookeeperRegister注册不一样传统的接口级注册在这个方法里面就将服务数据注册到注册中心了，服务发现的数据注册分为了两步，这里仅仅将数据封装到内存中如下：
url例子为：

```java
dubbo://192.168.1.9:20880/link.elastic.dubbo.entity.DemoService?anyhost=true&application=dubbo-demo-api-provider&background=false&deprecated=false&dubbo=2.0.2&dynamic=true&generic=false&interface=link.elastic.dubbo.entity.DemoService&methods=sayHello,sayHelloAsync&pid=19559&release=3.0.8&service-name-mapping=true&side=provider&timestamp=1654938441023
```
RegistryProtocol中的register方法：
```java
 private void register(Registry registry, URL registeredProviderUrl) {
        registry.register(registeredProviderUrl);
    }
```
上面这个代码会优先走ListenerRegistryWrapper的一些逻辑来执行register方法来触发一些监听器的逻辑，我们直接跳到ServiceDiscoveryRegistry中的register方法来看

ServiceDiscoveryRegistry的register方法
```java
@Override
    public final void register(URL url) {
       //逻辑判断比如只有side为提供者时候才能注册
        if (!shouldRegister(url)) { // Should Not Register
            return;
        }
        doRegister(url);
    }
```

ServiceDiscoveryRegistry的doRegister方法：
```java
   @Override
    public void doRegister(URL url) {
        // fixme, add registry-cluster is not necessary anymore
        url = addRegistryClusterKey(url);
        serviceDiscovery.register(url);
    }

```

AbstractServiceDiscovery的register方法：
```java
@Override
    public void register(URL url) {
      //metadaInfo类型为MetadataInfo类型，用来操作元数据的
        metadataInfo.addService(url);
    }

```


MetadataInfo 类型的addService方法

```java
public synchronized void addService(URL url) {
        // fixme, pass in application mode context during initialization of MetadataInfo.
        //元数据参数过滤器扩展获取:MetadataParamsFilter
        if (this.loader == null) {
            this.loader = url.getOrDefaultApplicationModel().getExtensionLoader(MetadataParamsFilter.class);
        }
        //元数据参数过滤器获取
        List<MetadataParamsFilter> filters = loader.getActivateExtension(url, "params-filter");
        // generate service level metadata
        //生成服务级别的元数据
        ServiceInfo serviceInfo = new ServiceInfo(url, filters);
        this.services.put(serviceInfo.getMatchKey(), serviceInfo);
        // extract common instance level params
        extractInstanceParams(url, filters);

        if (exportedServiceURLs == null) {
            exportedServiceURLs = new ConcurrentSkipListMap<>();
        }
        addURL(exportedServiceURLs, url);
        updated = true;
    }
```

### 17.3.5 接口级服务提供者配置的注册
前面我们通过服务发现的的url进行了举例子，其实在RegistryProtocol协议的export方法中还会注册接口级信息：
例如如下关键代码：
当registryUrl参数不是服务发现协议service-discovery-registry配置而是zookeeper如下时候获取到的扩展类型将是与Zookeeper相关的扩展对象

```java
zookeeper://8.131.79.126:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&pid=29386&release=3.0.8&timestamp=1655023329438
```

RegistryProtocol协议的export方法中接口级数据注册的核心代码如下：
如下代码的操作类型可以看注释
```java
// url to registry 这里registry对象的类型为ZookeeperRegistry
        final Registry registry = getRegistry(registryUrl);
        
        final URL registeredProviderUrl = getUrlToRegistry(providerUrl, registryUrl);
        // decide if we need to delay publish (provider itself and registry should both need to register)
        boolean register = providerUrl.getParameter(REGISTER_KEY, true) && registryUrl.getParameter(REGISTER_KEY, true);
        //这一个方法里面会将提供者的url配置写入Zookeeper的provider节点下面
        if (register) {
            register(registry, registeredProviderUrl);
        }
```
如上代码是获取Zookeeper操作对象和向Zookeeper中写入服务提供者信息的代码，关于与Zookeeper连接和注册数据本地缓存的代码可以看ZookeeperRegistry类型和它的几个父类型比如：CacheableFailbackRegistry类型，关于接口级数据的注册可以看register方法，这个就不详细说了，下面我贴一下接口级数据注册的Zookeeper信息可以了解下就行：
![在这里插入图片描述](/imgs/blog/source-blog/17-register4.png)
接口信息如下，上面我们需要注意的是这个 url配置为临时节点，当与Zookeeper断开连接或者Session超时的时候这个信息会被移除：
```java
/dubbo/link.elastic.dubbo.entity.DemoService/providers/dubbo%3A%2F%2F192.168.1.9%3A20880%2Flink.elastic.dubbo.entity.DemoService%3Fanyhost%3Dtrue%26application%3Ddubbo-demo-api-provider%26background%3Dfalse%26deprecated%3Dfalse%26dubbo%3D2.0.2%26dynamic%3Dtrue%26generic%3Dfalse%26interface%3Dlink.elastic.dubbo.entity.DemoService%26methods%3DsayHello%2CsayHelloAsync%26pid%3D29386%26release%3D3.0.8%26service-name-mapping%3Dtrue%26side%3Dprovider%26timestamp%3D1655023329514
```


## 17.4 应用级服务发现功能的实现ServiceDiscovery

在说这个实现之前我们先看看相关类型，这个服务发现相关的类型与注册中心相关的类型有点类似：

服务发现工厂类型：
![在这里插入图片描述](/imgs/blog/source-blog/17-register5.png)
服务发现类型：
![在这里插入图片描述](/imgs/blog/source-blog/17-register6.png)

刚刚在 ServiceDiscoveryRegistry中创建服务发现对象getServiceDiscovery方法看到了两个类型一个是服务发现工厂类型ServiceDiscoveryFactory，一个是服务发现类型ServiceDiscovery

 
```java
private ServiceDiscovery getServiceDiscovery(URL registryURL) {
//服务发现工厂对象的获取这里是ServiceDiscoveryFactory类型，这里对应ZookeeperServiceDiscoveryFactory
        ServiceDiscoveryFactory factory = getExtension(registryURL);
        //服务发现工厂对象获取服务发现对象
        return factory.getServiceDiscovery(registryURL);
    }
```
 
 AbstractServiceDiscoveryFactory类型的getServiceDiscovery方法

```java
   @Override
    public ServiceDiscovery getServiceDiscovery(URL registryURL) {
    //这个key是 zookeeper://127.0.0.1:2181/org.apache.dubbo.registry.client.ServiceDiscovery
     //一个地址需要创建一个服务发现对象
        String key = registryURL.toServiceStringWithoutResolving();
        return discoveries.computeIfAbsent(key, k -> createDiscovery(registryURL));
    }
```
createDiscovery方法对应ZookeeperServiceDiscoveryFactory类型中的createDiscovery方法

如下代码所示：

```java
@Override
    protected ServiceDiscovery createDiscovery(URL registryURL) {
        return new ZookeeperServiceDiscovery(applicationModel, registryURL);
    }
    
```

###  17.4.1 ZookeeperServiceDiscovery 
ZookeeperServiceDiscovery的构造器
```java
  public ZookeeperServiceDiscovery(ApplicationModel applicationModel, URL registryURL) {
        //先调用父类AbstractServiceDiscovery 模板类构造器
        super(applicationModel, registryURL);
        try {
         	//创建 创建CuratorFramework 类型对象用于操作Zookeeper
            this.curatorFramework = buildCuratorFramework(registryURL);
            //获取应用级服务发现的根路径 值为/services 这个可以在Zookeeper上面看到
            this.rootPath = ROOT_PATH.getParameterValue(registryURL);
             //创建服务发现对象 实现类型为ServiceDiscoveryImpl 这个实现来源于Curator框架中的discovery模块
            this.serviceDiscovery = buildServiceDiscovery(curatorFramework, rootPath);
            //启动服务发现
            this.serviceDiscovery.start();
        } catch (Exception e) {
            throw new IllegalStateException("Create zookeeper service discovery failed.", e);
        }
    }
```
这个方法比较重要是应用级服务发现的实现，这里主要关注下serviceDiscovery类型的创建与启动，这个应用级服务发现的实现其实是Dubbo使用了Curator来做的，Dubbo只是在这里封装了一些方法来进行调用Curator的实现：
关于Curator的官方文档可以看[curator官网](https://curator.apache.org/)

关于Zookeeper上面注册服务应用级服务注册信息可以看如下图所示(后面会具体讲到数据注册时的调用）：
![在这里插入图片描述](/imgs/blog/source-blog/17-register7.png)
我这个服务提供者注册的应用数据如下：

```java
{
  "name" : "dubbo-demo-api-provider",
  "id" : "192.168.1.9:20880",
  "address" : "192.168.1.9",
  "port" : 20880,
  "sslPort" : null,
  "payload" : {
    "@class" : "org.apache.dubbo.registry.zookeeper.ZookeeperInstance",
    "id" : "192.168.1.9:20880",
    "name" : "dubbo-demo-api-provider",
    "metadata" : {
      "dubbo.endpoints" : "[{\"port\":20880,\"protocol\":\"dubbo\"}]",
      "dubbo.metadata-service.url-params" : "{\"connections\":\"1\",\"version\":\"1.0.0\",\"dubbo\":\"2.0.2\",\"release\":\"3.0.8\",\"side\":\"provider\",\"port\":\"20880\",\"protocol\":\"dubbo\"}",
      "dubbo.metadata.revision" : "a662fd2213a8a49dc6ff43a4c2ae7b9e",
      "dubbo.metadata.storage-type" : "local",
      "timestamp" : "1654916298616"
    }
  },
  "registrationTimeUTC" : 1654917265499,
  "serviceType" : "DYNAMIC",
  "uriSpec" : null
}
```


如果感兴趣的话可以看更详细的curator服务发现文档[curator-x-discovery](https://curator.apache.org/docs/service-discovery/index.html)

### 17.4.2 AbstractServiceDiscovery的构造器

```java
  public AbstractServiceDiscovery(ApplicationModel applicationModel, URL registryURL) {
        //调用重载的构造器
        this(applicationModel.getApplicationName(), registryURL);
        this.applicationModel = applicationModel;
        MetadataReportInstance metadataReportInstance = applicationModel.getBeanFactory().getBean(MetadataReportInstance.class);
        metadataType = metadataReportInstance.getMetadataType();
        this.metadataReport = metadataReportInstance.getMetadataReport(registryURL.getParameter(REGISTRY_CLUSTER_KEY));
//        if (REMOTE_METADATA_STORAGE_TYPE.equals(metadataReportInstance.getMetadataType())) {
//            this.metadataReport = metadataReportInstance.getMetadataReport(registryURL.getParameter(REGISTRY_CLUSTER_KEY));
//        } else {
//            this.metadataReport = metadataReportInstance.getNopMetadataReport();
//        }
    }
```

重载的构造器
```java
    public AbstractServiceDiscovery(String serviceName, URL registryURL) {
        this.applicationModel = ApplicationModel.defaultModel();
        //这个url参考：zookeeper://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-provider&dubbo=2.0.2&interface=org.apache.dubbo.registry.client.ServiceDiscovery&pid=4570&release=3.0.8
        this.registryURL = registryURL;
        //这个serviceName参考dubbo-demo-api-provider
        this.serviceName = serviceName;
        //MetadataInfo 用来封装元数据信息
        this.metadataInfo = new MetadataInfo(serviceName);
        //这个是元数据缓存信息管理的类型 缓存文件使用LRU策略  感兴趣的可以详细看看
        //对应缓存路径为：/Users/song/.dubbo/.metadata.zookeeper127.0.0.1%003a2181.dubbo.cache
        this.metaCacheManager = new MetaCacheManager(getCacheNameSuffix(),
            applicationModel.getFrameworkModel().getBeanFactory()
            .getBean(FrameworkExecutorRepository.class).getCacheRefreshingScheduledExecutor());
    }
```

## 17.5 服务映射类型AbstractServiceNameMapping
服务映射主要是通过服务名字来反查应用信息的应用名字如下图所示
![在这里插入图片描述](/imgs/blog/source-blog/17-register8.png)
这里我们来看下服务映射相关的类型主要通过如下代码来获取扩展对象：

```java
this.serviceNameMapping = (AbstractServiceNameMapping) ServiceNameMapping.getDefaultExtension(registryURL.getScopeModel());
```
对应类型如下：
![在这里插入图片描述](/imgs/blog/source-blog/17-register9.png)

最终获取的扩展实现类型为：MetadataServiceNameMapping
构造器如下：

```java
   public MetadataServiceNameMapping(ApplicationModel applicationModel) {
        super(applicationModel);
        metadataReportInstance = applicationModel.getBeanFactory().getBean(MetadataReportInstance.class);
    }
```

服务映射元数据父类型AbstractServiceNameMapping如下：

```java
 public AbstractServiceNameMapping(ApplicationModel applicationModel) {
        this.applicationModel = applicationModel;
        //LRU缓存保存服务映射数据
        this.mappingCacheManager = new MappingCacheManager("",
            applicationModel.getFrameworkModel().getBeanFactory()
            .getBean(FrameworkExecutorRepository.class).getCacheRefreshingScheduledExecutor());
    }

```

## 17.4 双注册元数据信息发布到注册中心
### 17.4.1 回顾简介
前面注册数据的时候并没有把服务配置的元数据直接注册在注册中心而是需要在导出服务之后在ServiceConfig中来发布元数据，这个就需要我们回到ServiceConfig的exportUrl方法来看了如下所示：

```java
private void exportUrl(URL url, List<URL> registryURLs) {
        String scope = url.getParameter(SCOPE_KEY);
        // don't export when none is configured
        ...省略到若干代码
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

### 17.4.2 元数据服务定义数据的发布

在exportRemote之后单独调用发布元数据的方法来发布，通过调用元数据工具类来发布元数据信息接下来我们详细看下:
MetadataUtils类型的publishServiceDefinition方法：

```java
public static void publishServiceDefinition(URL url, ServiceDescriptor serviceDescriptor, ApplicationModel applicationModel) {
		//查询是否存在元数据存储对象 对应接口MetadataReport 这里对应实现类 ZookeeperMetadataReport
        if (getMetadataReports(applicationModel).size() == 0) {
            String msg = "Remote Metadata Report Server is not provided or unavailable, will stop registering service definition to remote center!";
            logger.warn(msg);
        }

        try {
            String side = url.getSide();
             //服务提供者走这个逻辑
            if (PROVIDER_SIDE.equalsIgnoreCase(side)) {
                String serviceKey = url.getServiceKey();
                //获取当前服务元数据信息
                FullServiceDefinition serviceDefinition = serviceDescriptor.getFullServiceDefinition(serviceKey);

                if (StringUtils.isNotEmpty(serviceKey) && serviceDefinition != null) {
                    serviceDefinition.setParameters(url.getParameters());
                    for (Map.Entry<String, MetadataReport> entry : getMetadataReports(applicationModel).entrySet()) {
                        MetadataReport metadataReport = entry.getValue();
                        if (!metadataReport.shouldReportDefinition()) {
                            logger.info("Report of service definition is disabled for " + entry.getKey());
                            continue;
                        }
                        //存储服务提供者的元数据  metadataReport类型为ZookeeperMetadataReport 方法来源于父类模板方法： AbstractMetadataReport类型的storeProviderMetadata模板方法
                        metadataReport.storeProviderMetadata(
                            new MetadataIdentifier(
                                url.getServiceInterface(),
                                url.getVersion() == null ? "" : url.getVersion(),
                                url.getGroup() == null ? "" : url.getGroup(),
                                PROVIDER_SIDE,
                                applicationModel.getApplicationName())
                            , serviceDefinition);
                    }
                }
            } else {
              //服务消费者走这个逻辑
                for (Map.Entry<String, MetadataReport> entry : getMetadataReports(applicationModel).entrySet()) {
                    MetadataReport metadataReport = entry.getValue();
                    if (!metadataReport.shouldReportDefinition()) {
                        logger.info("Report of service definition is disabled for " + entry.getKey());
                        continue;
                    }
                    metadataReport.storeConsumerMetadata(
                        new MetadataIdentifier(
                            url.getServiceInterface(),
                            url.getVersion() == null ? "" : url.getVersion(),
                            url.getGroup() == null ? "" : url.getGroup(),
                            CONSUMER_SIDE,
                            applicationModel.getApplicationName()),
                        url.getParameters());
                }
            }
        } catch (Exception e) {
            //ignore error
            logger.error("publish service definition metadata error.", e);
        }
    }
```

AbstractMetadataReport的storeProviderMetadata方法如下所示：

```java
    @Override
    public void storeProviderMetadata(MetadataIdentifier providerMetadataIdentifier, ServiceDefinition serviceDefinition) {
       //是否同步配置对应sync-report 默认为异步
        if (syncReport) {
            storeProviderMetadataTask(providerMetadataIdentifier, serviceDefinition);
        } else {
            reportCacheExecutor.execute(() -> storeProviderMetadataTask(providerMetadataIdentifier, serviceDefinition));
        }
    }
```


AbstractMetadataReport的存储元数据方法storeProviderMetadataTask

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
            doStoreProviderMetadata(providerMetadataIdentifier, data);
            saveProperties(providerMetadataIdentifier, data, true, !syncReport);
        } catch (Exception e) {
            // retry again. If failed again, throw exception.
            failedReports.put(providerMetadataIdentifier, serviceDefinition);
            metadataReportRetry.startRetryTask();
            logger.error("Failed to put provider metadata " + providerMetadataIdentifier + " in  " + serviceDefinition + ", cause: " + e.getMessage(), e);
        }
    }
```

![在这里插入图片描述](/imgs/blog/source-blog/17-register10.png)

元数据信息如下：可以分为两类 应用元数据，服务元数据

```json
{
	"parameters": {
		"side": "provider",
		"interface": "link.elastic.dubbo.entity.DemoService",
		"pid": "22099",
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
		"timestamp": "1654942353902"
	},
	"canonicalName": "link.elastic.dubbo.entity.DemoService",
	"codeSource": "file:/Users/song/Desktop/dubbo-test/target/classes/",
	"methods": [{
		"name": "sayHelloAsync",
		"parameterTypes": ["java.lang.String"],
		"returnType": "java.util.concurrent.CompletableFuture",
		"annotations": []
	}, {
		"name": "sayHello",
		"parameterTypes": ["java.lang.String"],
		"returnType": "java.lang.String",
		"annotations": []
	}],
	"types": [{
		"type": "java.util.concurrent.CompletableFuture",
		"properties": {
			"result": "java.lang.Object",
			"stack": "java.util.concurrent.CompletableFuture.Completion"
		}
	}, {
		"type": "java.lang.Object"
	}, {
		"type": "java.lang.String"
	}, {
		"type": "java.util.concurrent.CompletableFuture.Completion",
		"properties": {
			"next": "java.util.concurrent.CompletableFuture.Completion",
			"status": "int"
		}
	}, {
		"type": "int"
	}],
	"annotations": []
}
```
Zookeeper扩展类型ZookeeperMetadataReport实现的存储方法如下所示doStoreProviderMetadata：

如果我们自己实现一套元数据就可以重写这个方法来进行元数据的额存储

ZookeeperMetadataReport的doStoreProviderMetadata
```java
    @Override
    protected void doStoreProviderMetadata(MetadataIdentifier providerMetadataIdentifier, String serviceDefinitions) {
        storeMetadata(providerMetadataIdentifier, serviceDefinitions);
    }
```

ZookeeperMetadataReport的storeMetadata
```java
 private void storeMetadata(MetadataIdentifier metadataIdentifier, String v) {
 		//参数false为非临时节点，这个元数据为持久节点，这个细节就暂时不看了就是将刚刚的json元数据存储到对应路径上面：路径为：/dubbo/metadata/link.elastic.dubbo.entity.DemoService/provider/dubbo-demo-api-provider
        zkClient.create(getNodePath(metadataIdentifier), v, false);
    }

```

原文地址：[17-Dubbo服务提供者的双注册原理](https://blog.elastic.link/2022/07/10/dubbo/17-dubbo3-ying-yong-ji-zhu-ce-zhi-fu-wu-ti-gong-zhe-de-shuang-zhu-ce-yuan-li/)
