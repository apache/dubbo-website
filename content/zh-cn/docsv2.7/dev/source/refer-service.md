---
aliases:
    - /zh/docsv2.7/dev/source/refer-service/
description: 本文介绍了 Dubbo 服务引用的过程和实现细节
linkTitle: 服务引用
title: 服务引用
type: docs
weight: 4
---



## 1. 简介

上一篇文章详细分析了服务导出的过程，本篇文章我们趁热打铁，继续分析服务引用过程。在 Dubbo 中，我们可以通过两种方式引用远程服务。第一种是使用服务直连的方式引用服务，第二种方式是基于注册中心进行引用。服务直连的方式仅适合在调试或测试服务的场景下使用，不适合在线上环境使用。因此，本文我将重点分析通过注册中心引用服务的过程。从注册中心中获取服务配置只是服务引用过程中的一环，除此之外，服务消费者还需要经历 Invoker 创建、代理类创建等步骤。这些步骤，将在后续章节中一一进行分析。

## 2.服务引用原理

Dubbo 服务引用的时机有两个，第一个是在 Spring 容器调用 ReferenceBean 的 afterPropertiesSet 方法时引用服务，第二个是在 ReferenceBean 对应的服务被注入到其他类中时引用。这两个引用服务的时机区别在于，第一个是饿汉式的，第二个是懒汉式的。默认情况下，Dubbo 使用懒汉式引用服务。如果需要使用饿汉式，可通过配置 \<dubbo:reference\> 的 init 属性开启。下面我们按照 Dubbo 默认配置进行分析，整个分析过程从 ReferenceBean 的 getObject 方法开始。当我们的服务被注入到其他类中时，Spring 会第一时间调用 getObject 方法，并由该方法执行服务引用逻辑。按照惯例，在进行具体工作之前，需先进行配置检查与收集工作。接着根据收集到的信息决定服务用的方式，有三种，第一种是引用本地 (JVM) 服务，第二是通过直连方式引用远程服务，第三是通过注册中心引用远程服务。不管是哪种引用方式，最后都会得到一个 Invoker 实例。如果有多个注册中心，多个服务提供者，这个时候会得到一组 Invoker 实例，此时需要通过集群管理类 Cluster 将多个 Invoker 合并成一个实例。合并后的 Invoker 实例已经具备调用本地或远程服务的能力了，但并不能将此实例暴露给用户使用，这会对用户业务代码造成侵入。此时框架还需要通过代理工厂类 (ProxyFactory) 为服务接口生成代理类，并让代理类去调用 Invoker 逻辑。避免了 Dubbo 框架代码对业务代码的侵入，同时也让框架更容易使用。

以上就是服务引用的大致原理，下面我们深入到代码中，详细分析服务引用细节。

## 3.源码分析

服务引用的入口方法为 ReferenceBean 的 getObject 方法，该方法定义在 Spring 的 FactoryBean 接口中，ReferenceBean 实现了这个方法。实现代码如下：

```java
public Object getObject() throws Exception {
    return get();
}

public synchronized T get() {
    if (destroyed) {
        throw new IllegalStateException("Already destroyed!");
    }
    // 检测 ref 是否为空，为空则通过 init 方法创建
    if (ref == null) {
        // init 方法主要用于处理配置，以及调用 createProxy 生成代理类
        init();
    }
    return ref;
}
```

以上两个方法的代码比较简短，并不难理解。这里需要特别说明一下，如果你对 2.6.4 及以下版本的 getObject 方法进行调试时，会碰到比较奇怪的的问题。这里假设你使用 IDEA，且保持了 IDEA 的默认配置。当你面调试到 get 方法的`if (ref == null)`时，你会发现 ref 不为空，导致你无法进入到 init 方法中继续调试。导致这个现象的原因是 Dubbo 框架本身有一些小问题。该问题已经在 pull request [#2754](<https://github.com/apache/dubbo/pull/2754>) 修复了此问题，并跟随 2.6.5 版本发布了。如果你正在学习 2.6.4 及以下版本，可通过修改 IDEA 配置规避这个问题。首先 IDEA 配置弹窗中搜索 toString，然后取消`Enable 'toString' object view`勾选。具体如下：

![img](/imgs/docsv2.7/dev/source/refer-service/15417503733794.jpg)

### 3.1 处理配置

Dubbo 提供了丰富的配置，用于调整和优化框架行为，性能等。Dubbo 在引用或导出服务时，首先会对这些配置进行检查和处理，以保证配置的正确性。配置解析逻辑封装在 ReferenceConfig 的 init 方法中，下面进行分析。

```java
private void init() {
    // 避免重复初始化
    if (initialized) {
        return;
    }
    initialized = true;
    // 检测接口名合法性
    if (interfaceName == null || interfaceName.length() == 0) {
        throw new IllegalStateException("interface not allow null!");
    }

    // 检测 consumer 变量是否为空，为空则创建
    checkDefault();
    appendProperties(this);
    if (getGeneric() == null && getConsumer() != null) {
        // 设置 generic
        setGeneric(getConsumer().getGeneric());
    }

    // 检测是否为泛化接口
    if (ProtocolUtils.isGeneric(getGeneric())) {
        interfaceClass = GenericService.class;
    } else {
        try {
            // 加载类
            interfaceClass = Class.forName(interfaceName, true, Thread.currentThread()
                    .getContextClassLoader());
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException(e.getMessage(), e);
        }
        checkInterfaceAndMethods(interfaceClass, methods);
    }
    
    // -------------------------------✨ 分割线1 ✨------------------------------

    // 从系统变量中获取与接口名对应的属性值
    String resolve = System.getProperty(interfaceName);
    String resolveFile = null;
    if (resolve == null || resolve.length() == 0) {
        // 从系统属性中获取解析文件路径
        resolveFile = System.getProperty("dubbo.resolve.file");
        if (resolveFile == null || resolveFile.length() == 0) {
            // 从指定位置加载配置文件
            File userResolveFile = new File(new File(System.getProperty("user.home")), "dubbo-resolve.properties");
            if (userResolveFile.exists()) {
                // 获取文件绝对路径
                resolveFile = userResolveFile.getAbsolutePath();
            }
        }
        if (resolveFile != null && resolveFile.length() > 0) {
            Properties properties = new Properties();
            FileInputStream fis = null;
            try {
                fis = new FileInputStream(new File(resolveFile));
                // 从文件中加载配置
                properties.load(fis);
            } catch (IOException e) {
                throw new IllegalStateException("Unload ..., cause:...");
            } finally {
                try {
                    if (null != fis) fis.close();
                } catch (IOException e) {
                    logger.warn(e.getMessage(), e);
                }
            }
            // 获取与接口名对应的配置
            resolve = properties.getProperty(interfaceName);
        }
    }
    if (resolve != null && resolve.length() > 0) {
        // 将 resolve 赋值给 url
        url = resolve;
    }
    
    // -------------------------------✨ 分割线2 ✨------------------------------
    if (consumer != null) {
        if (application == null) {
            // 从 consumer 中获取 Application 实例，下同
            application = consumer.getApplication();
        }
        if (module == null) {
            module = consumer.getModule();
        }
        if (registries == null) {
            registries = consumer.getRegistries();
        }
        if (monitor == null) {
            monitor = consumer.getMonitor();
        }
    }
    if (module != null) {
        if (registries == null) {
            registries = module.getRegistries();
        }
        if (monitor == null) {
            monitor = module.getMonitor();
        }
    }
    if (application != null) {
        if (registries == null) {
            registries = application.getRegistries();
        }
        if (monitor == null) {
            monitor = application.getMonitor();
        }
    }
    
    // 检测 Application 合法性
    checkApplication();
    // 检测本地存根配置合法性
    checkStubAndMock(interfaceClass);
    
	// -------------------------------✨ 分割线3 ✨------------------------------
    
    Map<String, String> map = new HashMap<String, String>();
    Map<Object, Object> attributes = new HashMap<Object, Object>();

    // 添加 side、协议版本信息、时间戳和进程号等信息到 map 中
    map.put(Constants.SIDE_KEY, Constants.CONSUMER_SIDE);
    map.put(Constants.DUBBO_VERSION_KEY, Version.getProtocolVersion());
    map.put(Constants.TIMESTAMP_KEY, String.valueOf(System.currentTimeMillis()));
    if (ConfigUtils.getPid() > 0) {
        map.put(Constants.PID_KEY, String.valueOf(ConfigUtils.getPid()));
    }

    // 非泛化服务
    if (!isGeneric()) {
        // 获取版本
        String revision = Version.getVersion(interfaceClass, version);
        if (revision != null && revision.length() > 0) {
            map.put("revision", revision);
        }

        // 获取接口方法列表，并添加到 map 中
        String[] methods = Wrapper.getWrapper(interfaceClass).getMethodNames();
        if (methods.length == 0) {
            map.put("methods", Constants.ANY_VALUE);
        } else {
            map.put("methods", StringUtils.join(new HashSet<String>(Arrays.asList(methods)), ","));
        }
    }
    map.put(Constants.INTERFACE_KEY, interfaceName);
    // 将 ApplicationConfig、ConsumerConfig、ReferenceConfig 等对象的字段信息添加到 map 中
    appendParameters(map, application);
    appendParameters(map, module);
    appendParameters(map, consumer, Constants.DEFAULT_KEY);
    appendParameters(map, this);
    
	// -------------------------------✨ 分割线4 ✨------------------------------
    
    String prefix = StringUtils.getServiceKey(map);
    if (methods != null && !methods.isEmpty()) {
        // 遍历 MethodConfig 列表
        for (MethodConfig method : methods) {
            appendParameters(map, method, method.getName());
            String retryKey = method.getName() + ".retry";
            // 检测 map 是否包含 methodName.retry
            if (map.containsKey(retryKey)) {
                String retryValue = map.remove(retryKey);
                if ("false".equals(retryValue)) {
                    // 添加重试次数配置 methodName.retries
                    map.put(method.getName() + ".retries", "0");
                }
            }
 
            // 添加 MethodConfig 中的“属性”字段到 attributes
            // 比如 onreturn、onthrow、oninvoke 等
            appendAttributes(attributes, method, prefix + "." + method.getName());
            checkAndConvertImplicitConfig(method, map, attributes);
        }
    }
    
	// -------------------------------✨ 分割线5 ✨------------------------------

    // 获取服务消费者 ip 地址
    String hostToRegistry = ConfigUtils.getSystemProperty(Constants.DUBBO_IP_TO_REGISTRY);
    if (hostToRegistry == null || hostToRegistry.length() == 0) {
        hostToRegistry = NetUtils.getLocalHost();
    } else if (isInvalidLocalHost(hostToRegistry)) {
        throw new IllegalArgumentException("Specified invalid registry ip from property..." );
    }
    map.put(Constants.REGISTER_IP_KEY, hostToRegistry);

    // 存储 attributes 到系统上下文中
    StaticContext.getSystemContext().putAll(attributes);

    // 创建代理类
    ref = createProxy(map);

    // 根据服务名，ReferenceConfig，代理类构建 ConsumerModel，
    // 并将 ConsumerModel 存入到 ApplicationModel 中
    ConsumerModel consumerModel = new ConsumerModel(getUniqueServiceName(), this, ref, interfaceClass.getMethods());
    ApplicationModel.initConsumerModel(getUniqueServiceName(), consumerModel);
}
```

上面的代码很长，做的事情比较多。这里根据代码逻辑，对代码进行了分块，下面我们一起来看一下。

首先是方法开始到分割线1之间的代码。这段代码主要用于检测 ConsumerConfig 实例是否存在，如不存在则创建一个新的实例，然后通过系统变量或 dubbo.properties 配置文件填充 ConsumerConfig 的字段。接着是检测泛化配置，并根据配置设置 interfaceClass 的值。接着来看分割线1到分割线2之间的逻辑。这段逻辑用于从系统属性或配置文件中加载与接口名相对应的配置，并将解析结果赋值给 url 字段。url 字段的作用一般是用于点对点调用。继续向下看，分割线2和分割线3之间的代码用于检测几个核心配置类是否为空，为空则尝试从其他配置类中获取。分割线3与分割线4之间的代码主要用于收集各种配置，并将配置存储到 map 中。分割线4和分割线5之间的代码用于处理 MethodConfig 实例。该实例包含了事件通知配置，比如 onreturn、onthrow、oninvoke 等。分割线5到方法结尾的代码主要用于解析服务消费者 ip，以及调用 createProxy 创建代理对象。关于该方法的详细分析，将会在接下来的章节中展开。

### 3.2 引用服务

本节我们要从 createProxy 开始看起。从字面意思上来看，createProxy 似乎只是用于创建代理对象的。但实际上并非如此，该方法还会调用其他方法构建以及合并 Invoker 实例。具体细节如下。

```java
private T createProxy(Map<String, String> map) {
    URL tmpUrl = new URL("temp", "localhost", 0, map);
    final boolean isJvmRefer;
    if (isInjvm() == null) {
        // url 配置被指定，则不做本地引用
        if (url != null && url.length() > 0) {
            isJvmRefer = false;
        // 根据 url 的协议、scope 以及 injvm 等参数检测是否需要本地引用
        // 比如如果用户显式配置了 scope=local，此时 isInjvmRefer 返回 true
        } else if (InjvmProtocol.getInjvmProtocol().isInjvmRefer(tmpUrl)) {
            isJvmRefer = true;
        } else {
            isJvmRefer = false;
        }
    } else {
        // 获取 injvm 配置值
        isJvmRefer = isInjvm().booleanValue();
    }

    // 本地引用
    if (isJvmRefer) {
        // 生成本地引用 URL，协议为 injvm
        URL url = new URL(Constants.LOCAL_PROTOCOL, NetUtils.LOCALHOST, 0, interfaceClass.getName()).addParameters(map);
        // 调用 refer 方法构建 InjvmInvoker 实例
        invoker = refprotocol.refer(interfaceClass, url);
        
    // 远程引用
    } else {
        // url 不为空，表明用户可能想进行点对点调用
        if (url != null && url.length() > 0) {
            // 当需要配置多个 url 时，可用分号进行分割，这里会进行切分
            String[] us = Constants.SEMICOLON_SPLIT_PATTERN.split(url);
            if (us != null && us.length > 0) {
                for (String u : us) {
                    URL url = URL.valueOf(u);
                    if (url.getPath() == null || url.getPath().length() == 0) {
                        // 设置接口全限定名为 url 路径
                        url = url.setPath(interfaceName);
                    }
                    
                    // 检测 url 协议是否为 registry，若是，表明用户想使用指定的注册中心
                    if (Constants.REGISTRY_PROTOCOL.equals(url.getProtocol())) {
                        // 将 map 转换为查询字符串，并作为 refer 参数的值添加到 url 中
                        urls.add(url.addParameterAndEncoded(Constants.REFER_KEY, StringUtils.toQueryString(map)));
                    } else {
                        // 合并 url，移除服务提供者的一些配置（这些配置来源于用户配置的 url 属性），
                        // 比如线程池相关配置。并保留服务提供者的部分配置，比如版本，group，时间戳等
                        // 最后将合并后的配置设置为 url 查询字符串中。
                        urls.add(ClusterUtils.mergeUrl(url, map));
                    }
                }
            }
        } else {
            // 加载注册中心 url
            List<URL> us = loadRegistries(false);
            if (us != null && !us.isEmpty()) {
                for (URL u : us) {
                    URL monitorUrl = loadMonitor(u);
                    if (monitorUrl != null) {
                        map.put(Constants.MONITOR_KEY, URL.encode(monitorUrl.toFullString()));
                    }
                    // 添加 refer 参数到 url 中，并将 url 添加到 urls 中
                    urls.add(u.addParameterAndEncoded(Constants.REFER_KEY, StringUtils.toQueryString(map)));
                }
            }

            // 未配置注册中心，抛出异常
            if (urls.isEmpty()) {
                throw new IllegalStateException("No such any registry to reference...");
            }
        }

        // 单个注册中心或服务提供者(服务直连，下同)
        if (urls.size() == 1) {
            // 调用 RegistryProtocol 的 refer 构建 Invoker 实例
            invoker = refprotocol.refer(interfaceClass, urls.get(0));
            
        // 多个注册中心或多个服务提供者，或者两者混合
        } else {
            List<Invoker<?>> invokers = new ArrayList<Invoker<?>>();
            URL registryURL = null;

            // 获取所有的 Invoker
            for (URL url : urls) {
                // 通过 refprotocol 调用 refer 构建 Invoker，refprotocol 会在运行时
                // 根据 url 协议头加载指定的 Protocol 实例，并调用实例的 refer 方法
                invokers.add(refprotocol.refer(interfaceClass, url));
                if (Constants.REGISTRY_PROTOCOL.equals(url.getProtocol())) {
                    registryURL = url;
                }
            }
            if (registryURL != null) {
                // 如果注册中心链接不为空，则将使用 AvailableCluster
                URL u = registryURL.addParameter(Constants.CLUSTER_KEY, AvailableCluster.NAME);
                // 创建 StaticDirectory 实例，并由 Cluster 对多个 Invoker 进行合并
                invoker = cluster.join(new StaticDirectory(u, invokers));
            } else {
                invoker = cluster.join(new StaticDirectory(invokers));
            }
        }
    }

    Boolean c = check;
    if (c == null && consumer != null) {
        c = consumer.isCheck();
    }
    if (c == null) {
        c = true;
    }
    
    // invoker 可用性检查
    if (c && !invoker.isAvailable()) {
        throw new IllegalStateException("No provider available for the service...");
    }

    // 生成代理类
    return (T) proxyFactory.getProxy(invoker);
}
```

上面代码很多，不过逻辑比较清晰。首先根据配置检查是否为本地调用，若是，则调用 InjvmProtocol 的 refer 方法生成 InjvmInvoker 实例。若不是，则读取直连配置项，或注册中心 url，并将读取到的 url 存储到 urls 中。然后根据 urls 元素数量进行后续操作。若 urls 元素数量为1，则直接通过 Protocol 自适应拓展类构建 Invoker 实例接口。若 urls 元素数量大于1，即存在多个注册中心或服务直连 url，此时先根据 url 构建 Invoker。然后再通过 Cluster 合并多个 Invoker，最后调用 ProxyFactory 生成代理类。Invoker 的构建过程以及代理类的过程比较重要，因此接下来将分两小节对这两个过程进行分析。

#### 3.2.1 创建 Invoker

Invoker 是 Dubbo 的核心模型，代表一个可执行体。在服务提供方，Invoker 用于调用服务提供类。在服务消费方，Invoker 用于执行远程调用。Invoker 是由 Protocol 实现类构建而来。Protocol 实现类有很多，本节会分析最常用的两个，分别是 RegistryProtocol 和 DubboProtocol，其他的大家自行分析。下面先来分析 DubboProtocol 的 refer 方法源码。如下：

```java
public <T> Invoker<T> refer(Class<T> serviceType, URL url) throws RpcException {
    optimizeSerialization(url);
    // 创建 DubboInvoker
    DubboInvoker<T> invoker = new DubboInvoker<T>(serviceType, url, getClients(url), invokers);
    invokers.add(invoker);
    return invoker;
}
```

上面方法看起来比较简单，不过这里有一个调用需要我们注意一下，即  getClients。这个方法用于获取客户端实例，实例类型为 ExchangeClient。ExchangeClient 实际上并不具备通信能力，它需要基于更底层的客户端实例进行通信。比如 NettyClient、MinaClient 等，默认情况下，Dubbo 使用 NettyClient 进行通信。接下来，我们简单看一下 getClients 方法的逻辑。

```java
private ExchangeClient[] getClients(URL url) {
    // 是否共享连接
    boolean service_share_connect = false;
  	// 获取连接数，默认为0，表示未配置
    int connections = url.getParameter(Constants.CONNECTIONS_KEY, 0);
    // 如果未配置 connections，则共享连接
    if (connections == 0) {
        service_share_connect = true;
        connections = 1;
    }

    ExchangeClient[] clients = new ExchangeClient[connections];
    for (int i = 0; i < clients.length; i++) {
        if (service_share_connect) {
            // 获取共享客户端
            clients[i] = getSharedClient(url);
        } else {
            // 初始化新的客户端
            clients[i] = initClient(url);
        }
    }
    return clients;
}
```

这里根据 connections 数量决定是获取共享客户端还是创建新的客户端实例，默认情况下，使用共享客户端实例。getSharedClient 方法中也会调用 initClient 方法，因此下面我们一起看一下这两个方法。

```java
private ExchangeClient getSharedClient(URL url) {
    String key = url.getAddress();
    // 获取带有“引用计数”功能的 ExchangeClient
    ReferenceCountExchangeClient client = referenceClientMap.get(key);
    if (client != null) {
        if (!client.isClosed()) {
            // 增加引用计数
            client.incrementAndGetCount();
            return client;
        } else {
            referenceClientMap.remove(key);
        }
    }

    locks.putIfAbsent(key, new Object());
    synchronized (locks.get(key)) {
        if (referenceClientMap.containsKey(key)) {
            return referenceClientMap.get(key);
        }

        // 创建 ExchangeClient 客户端
        ExchangeClient exchangeClient = initClient(url);
        // 将 ExchangeClient 实例传给 ReferenceCountExchangeClient，这里使用了装饰模式
        client = new ReferenceCountExchangeClient(exchangeClient, ghostClientMap);
        referenceClientMap.put(key, client);
        ghostClientMap.remove(key);
        locks.remove(key);
        return client;
    }
}
```

上面方法先访问缓存，若缓存未命中，则通过 initClient 方法创建新的 ExchangeClient 实例，并将该实例传给 ReferenceCountExchangeClient 构造方法创建一个带有引用计数功能的 ExchangeClient 实例。ReferenceCountExchangeClient 内部实现比较简单，就不分析了。下面我们再来看一下 initClient 方法的代码。

```java
private ExchangeClient initClient(URL url) {

    // 获取客户端类型，默认为 netty
    String str = url.getParameter(Constants.CLIENT_KEY, url.getParameter(Constants.SERVER_KEY, Constants.DEFAULT_REMOTING_CLIENT));

    // 添加编解码和心跳包参数到 url 中
    url = url.addParameter(Constants.CODEC_KEY, DubboCodec.NAME);
    url = url.addParameterIfAbsent(Constants.HEARTBEAT_KEY, String.valueOf(Constants.DEFAULT_HEARTBEAT));

    // 检测客户端类型是否存在，不存在则抛出异常
    if (str != null && str.length() > 0 && !ExtensionLoader.getExtensionLoader(Transporter.class).hasExtension(str)) {
        throw new RpcException("Unsupported client type: ...");
    }

    ExchangeClient client;
    try {
        // 获取 lazy 配置，并根据配置值决定创建的客户端类型
        if (url.getParameter(Constants.LAZY_CONNECT_KEY, false)) {
            // 创建懒加载 ExchangeClient 实例
            client = new LazyConnectExchangeClient(url, requestHandler);
        } else {
            // 创建普通 ExchangeClient 实例
            client = Exchangers.connect(url, requestHandler);
        }
    } catch (RemotingException e) {
        throw new RpcException("Fail to create remoting client for service...");
    }
    return client;
}
```

initClient 方法首先获取用户配置的客户端类型，默认为 netty。然后检测用户配置的客户端类型是否存在，不存在则抛出异常。最后根据 lazy 配置决定创建什么类型的客户端。这里的 LazyConnectExchangeClient 代码并不是很复杂，该类会在 request 方法被调用时通过 Exchangers 的 connect 方法创建 ExchangeClient 客户端，该类的代码本节就不分析了。下面我们分析一下 Exchangers 的 connect 方法。

```java
public static ExchangeClient connect(URL url, ExchangeHandler handler) throws RemotingException {
    if (url == null) {
        throw new IllegalArgumentException("url == null");
    }
    if (handler == null) {
        throw new IllegalArgumentException("handler == null");
    }
    url = url.addParameterIfAbsent(Constants.CODEC_KEY, "exchange");
    // 获取 Exchanger 实例，默认为 HeaderExchangeClient
    return getExchanger(url).connect(url, handler);
}
```

如上，getExchanger 会通过 SPI 加载 HeaderExchanger 实例，这个方法比较简单，大家自己看一下吧。接下来分析 HeaderExchanger.connect 的实现。

```java
public ExchangeClient connect(URL url, ExchangeHandler handler) throws RemotingException {
    // 这里包含了多个调用，分别如下：
    // 1. 创建 HeaderExchangeHandler 对象
    // 2. 创建 DecodeHandler 对象
    // 3. 通过 Transporters 构建 Client 实例
    // 4. 创建 HeaderExchangeClient 对象
    return new HeaderExchangeClient(Transporters.connect(url, new DecodeHandler(new HeaderExchangeHandler(handler))), true);
}
```

这里的调用比较多，我们这里重点看一下 Transporters 的 connect 方法。如下：

```java
public static Client connect(URL url, ChannelHandler... handlers) throws RemotingException {
    if (url == null) {
        throw new IllegalArgumentException("url == null");
    }
    ChannelHandler handler;
    if (handlers == null || handlers.length == 0) {
        handler = new ChannelHandlerAdapter();
    } else if (handlers.length == 1) {
        handler = handlers[0];
    } else {
        // 如果 handler 数量大于1，则创建一个 ChannelHandler 分发器
        handler = new ChannelHandlerDispatcher(handlers);
    }
    
    // 获取 Transporter 自适应拓展类，并调用 connect 方法生成 Client 实例
    return getTransporter().connect(url, handler);
}
```

如上，getTransporter 方法返回的是自适应拓展类，该类会在运行时根据客户端类型加载指定的 Transporter 实现类。若用户未配置客户端类型，则默认加载 NettyTransporter，并调用该类的 connect 方法。如下：

```java
public Client connect(URL url, ChannelHandler listener) throws RemotingException {
    // 创建 NettyClient 对象
    return new NettyClient(url, listener);
}
```

到这里就不继续跟下去了，在往下就是通过 Netty 提供的 API 构建 Netty 客户端了，大家有兴趣自己看看。到这里，关于 DubboProtocol 的 refer 方法就分析完了。接下来，继续分析 RegistryProtocol 的 refer 方法逻辑。

```java
public <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException {
    // 取 registry 参数值，并将其设置为协议头
    url = url.setProtocol(url.getParameter(Constants.REGISTRY_KEY, Constants.DEFAULT_REGISTRY)).removeParameter(Constants.REGISTRY_KEY);
    // 获取注册中心实例
    Registry registry = registryFactory.getRegistry(url);
    if (RegistryService.class.equals(type)) {
        return proxyFactory.getInvoker((T) registry, type, url);
    }

    // 将 url 查询字符串转为 Map
    Map<String, String> qs = StringUtils.parseQueryString(url.getParameterAndDecoded(Constants.REFER_KEY));
    // 获取 group 配置
    String group = qs.get(Constants.GROUP_KEY);
    if (group != null && group.length() > 0) {
        if ((Constants.COMMA_SPLIT_PATTERN.split(group)).length > 1
                || "*".equals(group)) {
            // 通过 SPI 加载 MergeableCluster 实例，并调用 doRefer 继续执行服务引用逻辑
            return doRefer(getMergeableCluster(), registry, type, url);
        }
    }
    
    // 调用 doRefer 继续执行服务引用逻辑
    return doRefer(cluster, registry, type, url);
}
```

上面代码首先为 url 设置协议头，然后根据 url 参数加载注册中心实例。然后获取 group 配置，根据 group 配置决定 doRefer 第一个参数的类型。这里的重点是 doRefer 方法，如下：

```java
private <T> Invoker<T> doRefer(Cluster cluster, Registry registry, Class<T> type, URL url) {
    // 创建 RegistryDirectory 实例
    RegistryDirectory<T> directory = new RegistryDirectory<T>(type, url);
    // 设置注册中心和协议
    directory.setRegistry(registry);
    directory.setProtocol(protocol);
    Map<String, String> parameters = new HashMap<String, String>(directory.getUrl().getParameters());
    // 生成服务消费者链接
    URL subscribeUrl = new URL(Constants.CONSUMER_PROTOCOL, parameters.remove(Constants.REGISTER_IP_KEY), 0, type.getName(), parameters);

    // 注册服务消费者，在 consumers 目录下新节点
    if (!Constants.ANY_VALUE.equals(url.getServiceInterface())
            && url.getParameter(Constants.REGISTER_KEY, true)) {
        registry.register(subscribeUrl.addParameters(Constants.CATEGORY_KEY, Constants.CONSUMERS_CATEGORY,
                Constants.CHECK_KEY, String.valueOf(false)));
    }

    // 订阅 providers、configurators、routers 等节点数据
    directory.subscribe(subscribeUrl.addParameter(Constants.CATEGORY_KEY,
            Constants.PROVIDERS_CATEGORY
                    + "," + Constants.CONFIGURATORS_CATEGORY
                    + "," + Constants.ROUTERS_CATEGORY));

    // 一个注册中心可能有多个服务提供者，因此这里需要将多个服务提供者合并为一个
    Invoker invoker = cluster.join(directory);
    ProviderConsumerRegTable.registerConsumer(invoker, url, subscribeUrl, directory);
    return invoker;
}
```

如上，doRefer 方法创建一个 RegistryDirectory 实例，然后生成服务者消费者链接，并向注册中心进行注册。注册完毕后，紧接着订阅 providers、configurators、routers 等节点下的数据。完成订阅后，RegistryDirectory 会收到这几个节点下的子节点信息。由于一个服务可能部署在多台服务器上，这样就会在  providers 产生多个节点，这个时候就需要 Cluster 将多个服务节点合并为一个，并生成一个 Invoker。关于 RegistryDirectory 和 Cluster，本文不打算进行分析，相关分析将会在随后的文章中展开。

#### 3.2.2 创建代理

Invoker 创建完毕后，接下来要做的事情是为服务接口生成代理对象。有了代理对象，即可进行远程调用。代理对象生成的入口方法为 ProxyFactory 的 getProxy，接下来进行分析。

```java
public <T> T getProxy(Invoker<T> invoker) throws RpcException {
    // 调用重载方法
    return getProxy(invoker, false);
}

public <T> T getProxy(Invoker<T> invoker, boolean generic) throws RpcException {
    Class<?>[] interfaces = null;
    // 获取接口列表
    String config = invoker.getUrl().getParameter("interfaces");
    if (config != null && config.length() > 0) {
        // 切分接口列表
        String[] types = Constants.COMMA_SPLIT_PATTERN.split(config);
        if (types != null && types.length > 0) {
            interfaces = new Class<?>[types.length + 2];
            // 设置服务接口类和 EchoService.class 到 interfaces 中
            interfaces[0] = invoker.getInterface();
            interfaces[1] = EchoService.class;
            for (int i = 0; i < types.length; i++) {
                // 加载接口类
                interfaces[i + 1] = ReflectUtils.forName(types[i]);
            }
        }
    }
    if (interfaces == null) {
        interfaces = new Class<?>[]{invoker.getInterface(), EchoService.class};
    }

    // 为 http 和 hessian 协议提供泛化调用支持，参考 pull request #1827
    if (!invoker.getInterface().equals(GenericService.class) && generic) {
        int len = interfaces.length;
        Class<?>[] temp = interfaces;
        // 创建新的 interfaces 数组
        interfaces = new Class<?>[len + 1];
        System.arraycopy(temp, 0, interfaces, 0, len);
        // 设置 GenericService.class 到数组中
        interfaces[len] = GenericService.class;
    }

    // 调用重载方法
    return getProxy(invoker, interfaces);
}

public abstract <T> T getProxy(Invoker<T> invoker, Class<?>[] types);
```

如上，上面大段代码都是用来获取 interfaces 数组的，我们继续往下看。getProxy(Invoker, Class<?>[]) 这个方法是一个抽象方法，下面我们到 JavassistProxyFactory 类中看一下该方法的实现代码。

```java
public <T> T getProxy(Invoker<T> invoker, Class<?>[] interfaces) {
    // 生成 Proxy 子类（Proxy 是抽象类）。并调用 Proxy 子类的 newInstance 方法创建 Proxy 实例
    return (T) Proxy.getProxy(interfaces).newInstance(new InvokerInvocationHandler(invoker));
}
```

上面代码并不多，首先是通过 Proxy 的 getProxy 方法获取 Proxy 子类，然后创建 InvokerInvocationHandler 对象，并将该对象传给 newInstance 生成 Proxy 实例。InvokerInvocationHandler 实现 JDK 的 InvocationHandler 接口，具体的用途是拦截接口类调用。该类逻辑比较简单，这里就不分析了。下面我们重点关注一下 Proxy 的 getProxy 方法，如下。

```java
public static Proxy getProxy(Class<?>... ics) {
    // 调用重载方法
    return getProxy(ClassHelper.getClassLoader(Proxy.class), ics);
}

public static Proxy getProxy(ClassLoader cl, Class<?>... ics) {
    if (ics.length > 65535)
        throw new IllegalArgumentException("interface limit exceeded");

    StringBuilder sb = new StringBuilder();
    // 遍历接口列表
    for (int i = 0; i < ics.length; i++) {
        String itf = ics[i].getName();
        // 检测类型是否为接口
        if (!ics[i].isInterface())
            throw new RuntimeException(itf + " is not a interface.");

        Class<?> tmp = null;
        try {
            // 重新加载接口类
            tmp = Class.forName(itf, false, cl);
        } catch (ClassNotFoundException e) {
        }

        // 检测接口是否相同，这里 tmp 有可能为空
        if (tmp != ics[i])
            throw new IllegalArgumentException(ics[i] + " is not visible from class loader");

        // 拼接接口全限定名，分隔符为 ;
        sb.append(itf).append(';');
    }

    // 使用拼接后的接口名作为 key
    String key = sb.toString();

    Map<String, Object> cache;
    synchronized (ProxyCacheMap) {
        cache = ProxyCacheMap.get(cl);
        if (cache == null) {
            cache = new HashMap<String, Object>();
            ProxyCacheMap.put(cl, cache);
        }
    }

    Proxy proxy = null;
    synchronized (cache) {
        do {
            // 从缓存中获取 Reference<Proxy> 实例
            Object value = cache.get(key);
            if (value instanceof Reference<?>) {
                proxy = (Proxy) ((Reference<?>) value).get();
                if (proxy != null) {
                    return proxy;
                }
            }

            // 并发控制，保证只有一个线程可以进行后续操作
            if (value == PendingGenerationMarker) {
                try {
                    // 其他线程在此处进行等待
                    cache.wait();
                } catch (InterruptedException e) {
                }
            } else {
                // 放置标志位到缓存中，并跳出 while 循环进行后续操作
                cache.put(key, PendingGenerationMarker);
                break;
            }
        }
        while (true);
    }

    long id = PROXY_CLASS_COUNTER.getAndIncrement();
    String pkg = null;
    ClassGenerator ccp = null, ccm = null;
    try {
        // 创建 ClassGenerator 对象
        ccp = ClassGenerator.newInstance(cl);

        Set<String> worked = new HashSet<String>();
        List<Method> methods = new ArrayList<Method>();

        for (int i = 0; i < ics.length; i++) {
            // 检测接口访问级别是否为 protected 或 private
            if (!Modifier.isPublic(ics[i].getModifiers())) {
                // 获取接口包名
                String npkg = ics[i].getPackage().getName();
                if (pkg == null) {
                    pkg = npkg;
                } else {
                    if (!pkg.equals(npkg))
                        // 非 public 级别的接口必须在同一个包下，否者抛出异常
                        throw new IllegalArgumentException("non-public interfaces from different packages");
                }
            }
            
            // 添加接口到 ClassGenerator 中
            ccp.addInterface(ics[i]);

            // 遍历接口方法
            for (Method method : ics[i].getMethods()) {
                // 获取方法描述，可理解为方法签名
                String desc = ReflectUtils.getDesc(method);
                // 如果方法描述字符串已在 worked 中，则忽略。考虑这种情况，
                // A 接口和 B 接口中包含一个完全相同的方法
                if (worked.contains(desc))
                    continue;
                worked.add(desc);

                int ix = methods.size();
                // 获取方法返回值类型
                Class<?> rt = method.getReturnType();
                // 获取参数列表
                Class<?>[] pts = method.getParameterTypes();

                // 生成 Object[] args = new Object[1...N]
                StringBuilder code = new StringBuilder("Object[] args = new Object[").append(pts.length).append("];");
                for (int j = 0; j < pts.length; j++)
                    // 生成 args[1...N] = ($w)$1...N;
                    code.append(" args[").append(j).append("] = ($w)$").append(j + 1).append(";");
                // 生成 InvokerHandler 接口的 invoker 方法调用语句，如下：
                // Object ret = handler.invoke(this, methods[1...N], args);
                code.append(" Object ret = handler.invoke(this, methods[" + ix + "], args);");

                // 返回值不为 void
                if (!Void.TYPE.equals(rt))
                    // 生成返回语句，形如 return (java.lang.String) ret;
                    code.append(" return ").append(asArgument(rt, "ret")).append(";");

                methods.add(method);
                // 添加方法名、访问控制符、参数列表、方法代码等信息到 ClassGenerator 中 
                ccp.addMethod(method.getName(), method.getModifiers(), rt, pts, method.getExceptionTypes(), code.toString());
            }
        }

        if (pkg == null)
            pkg = PACKAGE_NAME;

        // 构建接口代理类名称：pkg + ".proxy" + id，比如 org.apache.dubbo.proxy0
        String pcn = pkg + ".proxy" + id;
        ccp.setClassName(pcn);
        ccp.addField("public static java.lang.reflect.Method[] methods;");
        // 生成 private java.lang.reflect.InvocationHandler handler;
        ccp.addField("private " + InvocationHandler.class.getName() + " handler;");

        // 为接口代理类添加带有 InvocationHandler 参数的构造方法，比如：
        // porxy0(java.lang.reflect.InvocationHandler arg0) {
        //     handler=$1;
    	// }
        ccp.addConstructor(Modifier.PUBLIC, new Class<?>[]{InvocationHandler.class}, new Class<?>[0], "handler=$1;");
        // 为接口代理类添加默认构造方法
        ccp.addDefaultConstructor();
        
        // 生成接口代理类
        Class<?> clazz = ccp.toClass();
        clazz.getField("methods").set(null, methods.toArray(new Method[0]));

        // 构建 Proxy 子类名称，比如 Proxy1，Proxy2 等
        String fcn = Proxy.class.getName() + id;
        ccm = ClassGenerator.newInstance(cl);
        ccm.setClassName(fcn);
        ccm.addDefaultConstructor();
        ccm.setSuperClass(Proxy.class);
        // 为 Proxy 的抽象方法 newInstance 生成实现代码，形如：
        // public Object newInstance(java.lang.reflect.InvocationHandler h) { 
        //     return new org.apache.dubbo.proxy0($1);
        // }
        ccm.addMethod("public Object newInstance(" + InvocationHandler.class.getName() + " h){ return new " + pcn + "($1); }");
        // 生成 Proxy 实现类
        Class<?> pc = ccm.toClass();
        // 通过反射创建 Proxy 实例
        proxy = (Proxy) pc.newInstance();
    } catch (RuntimeException e) {
        throw e;
    } catch (Exception e) {
        throw new RuntimeException(e.getMessage(), e);
    } finally {
        if (ccp != null)
            // 释放资源
            ccp.release();
        if (ccm != null)
            ccm.release();
        synchronized (cache) {
            if (proxy == null)
                cache.remove(key);
            else
                // 写缓存
                cache.put(key, new WeakReference<Proxy>(proxy));
            // 唤醒其他等待线程
            cache.notifyAll();
        }
    }
    return proxy;
}
```

上面代码比较复杂，我们写了大量的注释。大家在阅读这段代码时，要搞清楚 ccp 和 ccm 的用途，不然会被搞晕。ccp 用于为服务接口生成代理类，比如我们有一个 DemoService 接口，这个接口代理类就是由 ccp 生成的。ccm 则是用于为 org.apache.dubbo.common.bytecode.Proxy 抽象类生成子类，主要是实现 Proxy 类的抽象方法。下面以 org.apache.dubbo.demo.DemoService 这个接口为例，来看一下该接口代理类代码大致是怎样的（忽略 EchoService 接口）。

```java
package org.apache.dubbo.common.bytecode;

public class proxy0 implements org.apache.dubbo.demo.DemoService {

    public static java.lang.reflect.Method[] methods;

    private java.lang.reflect.InvocationHandler handler;

    public proxy0() {
    }

    public proxy0(java.lang.reflect.InvocationHandler arg0) {
        handler = $1;
    }

    public java.lang.String sayHello(java.lang.String arg0) {
        Object[] args = new Object[1];
        args[0] = ($w) $1;
        Object ret = handler.invoke(this, methods[0], args);
        return (java.lang.String) ret;
    }
}
```

好了，到这里代理类生成逻辑就分析完了。整个过程比较复杂，大家需要耐心看一下。

## 4.总结

本篇文章对服务引用的过程进行了较为详尽的分析，还有一些逻辑暂时没有分析到，比如  Directory、Cluster。这些接口及实现类功能比较独立，后续会单独成文进行分析。暂时我们可以先把这些类看成黑盒，只要知道这些类的用途即可。关于服务引用过程就分析到这里。