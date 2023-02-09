---
title: "21-Dubbo3消费者引用服务入口 "
linkTitle: "21-Dubbo3消费者引用服务入口 "
date: 2022-08-21
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] Dubbo3消费者引用服务入口 。
---
# 21-Dubbo3消费者引用服务入口 
## 21.1 简介
前面我们通过Demo说了一个服务引用配置的创建。另外也在前面的文章说了服务提供者的启动完整过程，不过在说服务提供者启动的过程中并未提到服务消费者是如何发现服务，如果调用服务的，这里先就不再说关于服务消费者启动的一个细节了，直接来看前面未提到的服务消费者是如何引用到服务提供者提供的服务的。
先来回顾下样例代码：

```java
public class ConsumerApplication {
    public static void main(String[] args) {
            runWithBootstrap();
    }
    private static void runWithBootstrap() {
        ReferenceConfig<DemoService> reference = new ReferenceConfig<>();
        reference.setInterface(DemoService.class);
        reference.setGeneric("true");
        reference.setProtocol("");

        DubboBootstrap bootstrap = DubboBootstrap.getInstance();
        ApplicationConfig applicationConfig = new ApplicationConfig("dubbo-demo-api-consumer");
        applicationConfig.setQosEnable(false);
        applicationConfig.setQosPort(-1);
        bootstrap.application(applicationConfig)
            .registry(new RegistryConfig("zookeeper://8.131.79.126:2181"))
            .protocol(new ProtocolConfig(CommonConstants.DUBBO, -1))
            .reference(reference)
            .start();

        DemoService demoService = bootstrap.getCache().get(reference);
        String message = demoService.sayHello("dubbo");
        System.out.println(message);

        // generic invoke
        GenericService genericService = (GenericService) demoService;
        Object genericInvokeResult = genericService.$invoke("sayHello", new String[]{String.class.getName()},
            new Object[]{"dubbo generic invoke"});
        System.out.println(genericInvokeResult);
    }
}

```
这段代码我们前面详细说了服务引用的配置ReferenceConfig和Dubbo启动器启动应用的过程DubboBootstrap，后面我们直接定位到消费者引用服务的代码位置来看。
## 21.2 入口代码

### 21.2.1 DefaultModuleDeployer的start方法
第一个要关注的就是模块发布器DefaultModuleDeployer的start方法，这个start方法包含了Dubbo应用启动的过程

DefaultModuleDeployer的start方法
```java
public synchronized Future start() throws IllegalStateException {
          ...省略掉若干代码

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

            ...省略掉若干代码
        return startFuture;
    }
```

这个方法大部分代码已经省略，也不会详细去说了，感兴趣的可以看之前讲到的博客，这里主要来看引用服务方法referServices


### 21.2.2 DefaultModuleDeployer的referServices方法

下面就要来看消费者应用如何引用的服务的入口了，这个方法主要从大的方面做了一些服务引用生命周期的代码，看懂了这个方法我们就可以不依赖Dubbo负载的启动逻辑可以单独调用ReferenceConfigBase类型的对应方法来刷新，启动，销毁引用的服务了这里先来看下代码再详细介绍内容：


DefaultModuleDeployer的referServices方法 

```java
    private void referServices() {
         //这个是获取配置的所有的ReferenceConfigBase类型对象
        configManager.getReferences().forEach(rc -> {
            try {
                ReferenceConfig<?> referenceConfig = (ReferenceConfig<?>) rc;
                if (!referenceConfig.isRefreshed()) {
                    //刷新引用配置
                    referenceConfig.refresh();
                }

                if (rc.shouldInit()) {
                    if (referAsync || rc.shouldReferAsync()) {
                        ExecutorService executor = executorRepository.getServiceReferExecutor();
                        CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                            try {
                                //间接的通过缓存对象来引用服务配置
                                referenceCache.get(rc);
                            } catch (Throwable t) {
                                logger.error(getIdentifier() + " refer async catch error : " + t.getMessage(), t);
                            }
                        }, executor);

                        asyncReferringFutures.add(future);
                    } else {
                        //间接的通过缓存对象来引用服务配置
                        referenceCache.get(rc);
                    }
                }
            } catch (Throwable t) {
                logger.error(getIdentifier() + " refer catch error.");
                //出现异常销毁引用配置
                referenceCache.destroy(rc);
                throw t;
            }
        });
    }
```
在这个代码中我们核心需要关心的就是SimpleReferenceCache类型的get方法了，在获取服务对象之外包装了一层缓存。

如果出现了异常则执行referenceCache的destroy方法进行销毁引用配置。

## 21.3 开始引用服务
###  21.3.1 SimpleReferenceCache是什么？
一个用于缓存引用ReferenceConfigBase的util工具类。
ReferenceConfigBase是一个重对象，对于频繁创建ReferenceConfigBase的框架来说，有必要缓存这些对象。
如果需要使用复杂的策略，可以实现并使用自己的ReferenceConfigBase缓存
这个Cache是引用服务的开始如果我们想在代码中自定义一些服务引用的逻辑，可以直接创建SimpleReferenceCache类型对象然后调用其get方法进行引用服务。那这个缓存对象是和缓存与引用服务的可以继续往下看。
### 21.3.2 引用服务之前的缓存处理逻辑？
关于逻辑的处理，看代码有时候比文字更清晰明了，这里可以直接来看 SimpleReferenceCache类型的get方法
```java
 @Override
    @SuppressWarnings("unchecked")
    public <T> T get(ReferenceConfigBase<T> rc) {
         //这个生成的key规则是这样的 服务分组/服务接口:版本号  详细的代码就不看了
         //例如： group/link.elastic.dubbo.entity.DemoService:1.0
        String key = generator.generateKey(rc);
        //服务类型 如果是泛化调用则这个类型为GenericService
        Class<?> type = rc.getInterfaceClass();

        //服务是否为单例的这里默认值都为空，为单例模式
        boolean singleton = rc.getSingleton() == null || rc.getSingleton();
        T proxy = null;
        // Check existing proxy of the same 'key' and 'type' first.
        if (singleton) {
            //一般为单例的 这个方法是从缓存中获取
            proxy = get(key, (Class<T>) type);
        } else {
            //非单例容易造成内存泄露，无法从缓存中获取
            logger.warn("Using non-singleton ReferenceConfig and ReferenceCache at the same time may cause memory leak. " +
                "Call ReferenceConfig#get() directly for non-singleton ReferenceConfig instead of using ReferenceCache#get(ReferenceConfig)");
        }
        //前面是从缓存中拿，如果缓存中获取不到则开始引用服务
        if (proxy == null) {
            //获取或者创建值，为引用类型referencesOfType对象（类型为Map<Class<?>, List<ReferenceConfigBase<?>>>）缓存对象生成值（值不存咋时候会生成一个）
            List<ReferenceConfigBase<?>> referencesOfType = referenceTypeMap.computeIfAbsent(type, _t -> Collections.synchronizedList(new ArrayList<>()));
            //每次走到这里都会添加一个ReferenceConfigBase 引用配置对象（单例的从缓存中拿到就可以直接返回了）
            referencesOfType.add(rc);

            //与前面一样 前面是类型映射，这里是key映射
            List<ReferenceConfigBase<?>> referenceConfigList = referenceKeyMap.computeIfAbsent(key, _k -> Collections.synchronizedList(new ArrayList<>()));
            referenceConfigList.add(rc);
            //开始引用服务
            proxy = rc.get();
        }

        return proxy;
    }
```
可以看到这个逻辑使用了享元模式（其实就是先查缓存，缓存不存在则创建对象存入缓存）来进行引用对象的管理这样一个过程，这里一共有两个缓存对象referencesOfType和referenceConfigList
key分别为引用类型和引用的服务的key，值是引用服务的基础配置对象列表List<ReferenceConfigBase<?>>

后面可以详细看下如果借助ReferenceConfigBase类型对象来进行具体类型的引用。

## 21.4 初始化引用服务的过程
### 21.4.1 初始化引用服务的调用入口
引用服务的逻辑其实是相对复杂一点的，包含了服务发现，引用对象的创建等等，接下来就让我们详细看下:

ReferenceConfig类型的get方法
```java
@Override
    public T get() {
        if (destroyed) {
            throw new IllegalStateException("The invoker of ReferenceConfig(" + url + ") has already destroyed!");
        }

        //ref类型为 transient volatile T ref;
        if (ref == null) {
            // ensure start module, compatible with old api usage
            //这个前面已经调用了模块发布器启动过了，这里有这么一行代码是有一定作用的，如果使用方直接调用了ReferenceConfigBase的get方法或者缓存对象SimpleReferenceCache类型的对象的get方法来引用服务端的时候就会造成很多配置没有初始化下面执行逻辑的时候出现问题，这个代码其实就是启动模块进行一些基础配置的初始化操作 比如元数据中心默认配置选择，注册中心默认配置选择这些都是比较重要的
            getScopeModel().getDeployer().start();

            synchronized (this) {
                if (ref == null) {
                    init();
                }
            }
        }

        return ref;
    }
```

这里有一段代码是：getScopeModel().getDeployer().start();
这个前面已经调用了模块发布器启动过了，这里有这么一行代码是有一定作用的，如果使用方直接调用了ReferenceConfigBase的get方法或者缓存对象SimpleReferenceCache类型的对象的get方法来引用服务端的时候就会造成很多配置没有初始化下面执行逻辑的时候出现问题，这个代码其实就是启动模块进行一些基础配置的初始化操作 比如元数据中心默认配置选择，注册中心默认配置选择这些都是比较重要的。

另外可以看到的是这里使用了双重校验锁来保证单例对象的创建，发现Dubbo种大量的使用了双重校验锁的逻辑。

### 21.4.2 初始化引用服务

这个就直接看代码了这，初始化过程相对复杂一点，我们一点点来看
ReferenceConfig类型init()方法


```java
protected synchronized void init() {
      //初始化标记变量保证只初始化一次，这里又是加锁🔐又是加标记变量的
        if (initialized) {
            return;
        }
        initialized = true;
        //刷新配置
        if (!this.isRefreshed()) {
            this.refresh();
        }

        // init serviceMetadata
        //初始化ServiceMetadata类型对象serviceMetadata 为其设置服务基本属性比如版本号，分组，服务接口名
        initServiceMetadata(consumer);

      //继续初始化元数据信息 服务接口类型和key
        serviceMetadata.setServiceType(getServiceInterfaceClass());
        // TODO, uncomment this line once service key is unified
        serviceMetadata.setServiceKey(URL.buildKey(interfaceName, group, version));

        //配置转Map类型
        Map<String, String> referenceParameters = appendConfig();
        // init service-application mapping
        //来自本地存储和url参数的初始化映射。 参数转URL配置初始化 Dubbo中喜欢用url作为配置的一种处理方式
        initServiceAppsMapping(referenceParameters);
         //本地内存模块服务存储库
        ModuleServiceRepository repository = getScopeModel().getServiceRepository();
        //ServiceModel和ServiceMetadata在某种程度上是相互重复的。我们将来应该合并它们。
        ServiceDescriptor serviceDescriptor;
        if (CommonConstants.NATIVE_STUB.equals(getProxy())) {
            serviceDescriptor = StubSuppliers.getServiceDescriptor(interfaceName);
            repository.registerService(serviceDescriptor);
        } else {
            //本地存储库注册服务接口类型
            serviceDescriptor = repository.registerService(interfaceClass);
        }
        //消费者模型对象
        consumerModel = new ConsumerModel(serviceMetadata.getServiceKey(), proxy, serviceDescriptor, this,
            getScopeModel(), serviceMetadata, createAsyncMethodInfo());
         //本地存储库注册消费者模型对象
        repository.registerConsumer(consumerModel);

        //与前面代码一样基础初始化服务元数据对象为其设置附加参数
        serviceMetadata.getAttachments().putAll(referenceParameters);
        //创建服务的代理对象 ！！！核心代码在这里
        ref = createProxy(referenceParameters);

        //为服务元数据对象设置代理对象
        serviceMetadata.setTarget(ref);
        serviceMetadata.addAttribute(PROXY_CLASS_REF, ref);

        consumerModel.setProxyObject(ref);
        consumerModel.initMethodModels();

        //检查invoker对象初始结果
        checkInvokerAvailable();
    }

```


## 21.5 ReferenceConfig创建服务引用代理对象的原理
### 21.5.1 代理对象的创建过程
这里就要继续看 ReferenceConfig类型的创建代理方法createProxy了
直接贴一下源码：
```java
 private T createProxy(Map<String, String> referenceParameters) {
     //本地引用 这里为false
        if (shouldJvmRefer(referenceParameters)) {
            createInvokerForLocal(referenceParameters);
        } else {
            urls.clear();
            if (StringUtils.isNotEmpty(url)) {
                //url存在则为点对点引用
                // user specified URL, could be peer-to-peer address, or register center's address.
                parseUrl(referenceParameters);
            } else {
                // if protocols not in jvm checkRegistry
                //这里不是local协议默认这里为空
                if (!LOCAL_PROTOCOL.equalsIgnoreCase(getProtocol())) {
                    //从注册表中获取URL并将其聚合。这个其实就是初始化一下注册中心的url配置
                    aggregateUrlFromRegistry(referenceParameters);
                }
            }
            //这个代码非常重要 创建远程引用，创建远程引用调用器
            createInvokerForRemote();
        }

        if (logger.isInfoEnabled()) {
            logger.info("Referred dubbo service: [" + referenceParameters.get(INTERFACE_KEY) + "]." +
                (Boolean.parseBoolean(referenceParameters.get(GENERIC_KEY)) ?
                    " it's GenericService reference" : " it's not GenericService reference"));
        }

        URL consumerUrl = new ServiceConfigURL(CONSUMER_PROTOCOL, referenceParameters.get(REGISTER_IP_KEY), 0,
            referenceParameters.get(INTERFACE_KEY), referenceParameters);
        consumerUrl = consumerUrl.setScopeModel(getScopeModel());
        consumerUrl = consumerUrl.setServiceModel(consumerModel);
        MetadataUtils.publishServiceDefinition(consumerUrl, consumerModel.getServiceModel(), getApplicationModel());

        // create service proxy
        return (T) proxyFactory.getProxy(invoker, ProtocolUtils.isGeneric(generic));
    }
```

### 21.5.2 创建远程引用，创建远程引用调用器


ReferenceConfig类型的createInvokerForRemote方法

```java
private void createInvokerForRemote() {
     //这个url 为注册协议如registry://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-consumer&dubbo=2.0.2&pid=6204&qos.enable=false&qos.port=-1&registry=zookeeper&release=3.0.9&timestamp=1657439419495
        if (urls.size() == 1) {
            URL curUrl = urls.get(0);
            //这个SPI对象是由字节码动态生成的自适应对象Protocol$Adaptie直接看看不到源码，后续可以解析一个字节码生成的类型，这里后续来调用链路即可
            invoker = protocolSPI.refer(interfaceClass, curUrl);
            if (!UrlUtils.isRegistry(curUrl)) {
                List<Invoker<?>> invokers = new ArrayList<>();
                invokers.add(invoker);
                invoker = Cluster.getCluster(scopeModel, Cluster.DEFAULT).join(new StaticDirectory(curUrl, invokers), true);
            }
        } else {
            List<Invoker<?>> invokers = new ArrayList<>();
            URL registryUrl = null;
            for (URL url : urls) {
                // For multi-registry scenarios, it is not checked whether each referInvoker is available.
                // Because this invoker may become available later.
                invokers.add(protocolSPI.refer(interfaceClass, url));

                if (UrlUtils.isRegistry(url)) {
                    // use last registry url
                    registryUrl = url;
                }
            }

            if (registryUrl != null) {
                // registry url is available
                // for multi-subscription scenario, use 'zone-aware' policy by default
                String cluster = registryUrl.getParameter(CLUSTER_KEY, ZoneAwareCluster.NAME);
                // The invoker wrap sequence would be: ZoneAwareClusterInvoker(StaticDirectory) -> FailoverClusterInvoker
                // (RegistryDirectory, routing happens here) -> Invoker
                invoker = Cluster.getCluster(registryUrl.getScopeModel(), cluster, false).join(new StaticDirectory(registryUrl, invokers), false);
            } else {
                // not a registry url, must be direct invoke.
                if (CollectionUtils.isEmpty(invokers)) {
                    throw new IllegalArgumentException("invokers == null");
                }
                URL curUrl = invokers.get(0).getUrl();
                String cluster = curUrl.getParameter(CLUSTER_KEY, Cluster.DEFAULT);
                invoker = Cluster.getCluster(scopeModel, cluster).join(new StaticDirectory(curUrl, invokers), true);
            }
        }
    }
```

### 21.5.3 Invoker对象创建的全过程
为了更好理解Protocol$Adaptie内部的引用执行过程这里我把Debug的链路截图了过来
按照固定的顺序先执行AOP的逻辑再执行具体的逻辑:
- Protocol$Adaptie的refer方法
- ProtocolSerializationWrapper AOP类型的协议序列化器refer方法
- ProtocolFilterWrapper AOP类型的协议过滤器的refer方法
- QosProtocolWrapper AOP类型的QOS协议包装器的refer方法
- ProtocolListenerWrapper APO类型监听器包装器的refer方法
- RegistryProtocol 注册协议的refer方法 （会添加容错逻辑）
- RegistryProtocol 注册协议的doRefer方法（调用方法创建Invoker对象）

[](/imgs/blog/source-blog/21-createInvokerRemote.png)

这里我们不再详细说这个引用链的具体过程直接定位到RegistryProtocol中创建Invoker类型的地方。
先来看RegistryProtocol类型的refer方法，如下代码所示：

RegistryProtocol类型的refer方法
```java
@Override
    @SuppressWarnings("unchecked")
    public <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException {
        //这个url已经被转换为具体的注册中心协议类型了
        //zookeeper://127.0.0.1:2181/org.apache.dubbo.registry.RegistryService?application=dubbo-demo-api-consumer&dubbo=2.0.2&pid=7944&qos.enable=false&qos.port=-1&release=3.0.9&timestamp=1657440673100
        url = getRegistryUrl(url);
        //获取用于操作Zookeeper的Registry类型 
        Registry registry = getRegistry(url);
        if (RegistryService.class.equals(type)) {
            return proxyFactory.getInvoker((T) registry, type, url);
        }

        // group="a,b" or group="*"
        Map<String, String> qs = (Map<String, String>) url.getAttribute(REFER_KEY);
        String group = qs.get(GROUP_KEY);
        if (StringUtils.isNotEmpty(group)) {
            if ((COMMA_SPLIT_PATTERN.split(group)).length > 1 || "*".equals(group)) {
                return doRefer(Cluster.getCluster(url.getScopeModel(), MergeableCluster.NAME), registry, type, url, qs);
            }
        }
        //降级容错的逻辑处理对象 类型为Cluster 实际类型为MockClusterWrapper 内部包装的是FailoverCluster
        //后续调用服务失败时候会先失效转移再降级
        Cluster cluster = Cluster.getCluster(url.getScopeModel(), qs.get(CLUSTER_KEY));
        //这里才是具体的Invoker对象的创建
        return doRefer(cluster, registry, type, url, qs);
    }
```


RegistryProtocol类型的doRefer方法创建Invoker对象
直接来看代码了

```java
 protected <T> Invoker<T> doRefer(Cluster cluster, Registry registry, Class<T> type, URL url, Map<String, String> parameters) {
        Map<String, Object> consumerAttribute = new HashMap<>(url.getAttributes());
        consumerAttribute.remove(REFER_KEY);
        String p = isEmpty(parameters.get(PROTOCOL_KEY)) ? CONSUMER : parameters.get(PROTOCOL_KEY);
        URL consumerUrl = new ServiceConfigURL (
            p,
            null,
            null,
            parameters.get(REGISTER_IP_KEY),
            0, getPath(parameters, type),
            parameters,
            consumerAttribute
        );
        url = url.putAttribute(CONSUMER_URL_KEY, consumerUrl);
        //重点看这一行 带迁移性质的Invoker对象
        ClusterInvoker<T> migrationInvoker = getMigrationInvoker(this, cluster, registry, type, url, consumerUrl);
        //这一行回来执行迁移规则创建应用级优先的服务发现Invoker对象
        return interceptInvoker(migrationInvoker, url, consumerUrl);
    }
```
这里代码比较重要的其实只有两行getMigrationInvoker和interceptInvoker方法
比较核心也是Dubbo3比较重要的消费者启动逻辑基本都在这个方法里面interceptInvoker，这个方法执行了消费者应用级发现和接口级发现迁移的逻辑，会自动帮忙决策一个Invoker类型对象，不过这个逻辑这里先简单看下，后续单独整个文章来说。

这里我们先来看 ClusterInvoker对象的创建，下面先看代码：

RegistryProtocol类型的getMigrationInvoker方法

```java
 protected <T> ClusterInvoker<T> getMigrationInvoker(RegistryProtocol registryProtocol, Cluster cluster, Registry registry, Class<T> type, URL url, URL consumerUrl) {
        return new ServiceDiscoveryMigrationInvoker<T>(registryProtocol, cluster, registry, type, url, consumerUrl);
    }
```
详细的逻辑这里就不再看了，我们继续看RegistryProtocol类型的interceptInvoker方法：

具体代码如下：
RegistryProtocol类型的interceptInvoker方法

```java
 protected <T> Invoker<T> interceptInvoker(ClusterInvoker<T> invoker, URL url, URL consumerUrl) {
    //获取激活的注册协议监听器扩展里面registry.protocol.listener，这里激活的类型为MigrationRuleListener
        List<RegistryProtocolListener> listeners = findRegistryProtocolListeners(url);
        if (CollectionUtils.isEmpty(listeners)) {
            return invoker;
        }

        for (RegistryProtocolListener listener : listeners) {
            //这里执行MigrationRuleListener类型的onRefer方法
            listener.onRefer(this, invoker, consumerUrl, url);
        }
        return invoker;
    }
```

该方法尝试加载所有RegistryProtocolListener定义，这些定义通过与定义的交互来控制调用器的行为，然后使用这些侦听器更改MigrationInvoker的状态和行为。
当前可用的监听器是MigrationRuleListener，用于通过动态变化的规则控制迁移行为。


可以看到核心的逻辑集中在了这个位置MigrationRuleListener类型的onRefer方法，这个这里就不深入往下说了，后续会有个文章专门来看Dubbo2迁移Dubbo3时候处理的逻辑。

Invoker对象的创建完成其实就代表了服务引用执行完成，不过这里核心的协议并没有来说

 
原文地址：[21-Dubbo3消费者引用服务入口](https://blog.elastic.link/2022/07/10/dubbo/21-dubbo-xiao-fei-zhe-yin-yong-fu-wu-de-ru-kou/)