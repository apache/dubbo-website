---
aliases:
    - /zh/docsv2.7/dev/source/directory/
description: 本文介绍了服务目录的原理和实现细节
linkTitle: 服务目录
title: 服务目录
type: docs
weight: 6
---



## 1. 简介

本篇文章，将开始分析 Dubbo 集群容错方面的源码。集群容错源码包含四个部分，分别是服务目录 Directory、服务路由 Router、集群 Cluster 和负载均衡 LoadBalance。这几个部分的源码逻辑相对比较独立，我们将会分四篇文章进行分析。本篇文章作为集群容错的开篇文章，将和大家一起分析服务目录相关的源码。在进行深入分析之前，我们先来了解一下服务目录是什么。服务目录中存储了一些和服务提供者有关的信息，通过服务目录，服务消费者可获取到服务提供者的信息，比如 ip、端口、服务协议等。通过这些信息，服务消费者就可通过 Netty 等客户端进行远程调用。在一个服务集群中，服务提供者数量并不是一成不变的，如果集群中新增了一台机器，相应地在服务目录中就要新增一条服务提供者记录。或者，如果服务提供者的配置修改了，服务目录中的记录也要做相应的更新。如果这样说，服务目录和注册中心的功能不就雷同了吗？确实如此，这里这么说是为了方便大家理解。实际上服务目录在获取注册中心的服务配置信息后，会为每条配置信息生成一个 Invoker 对象，并把这个 Invoker 对象存储起来，这个 Invoker 才是服务目录最终持有的对象。Invoker 有什么用呢？看名字就知道了，这是一个具有远程调用功能的对象。讲到这大家应该知道了什么是服务目录了，它可以看做是 Invoker 集合，且这个集合中的元素会随注册中心的变化而进行动态调整。

关于服务目录这里就先介绍这些，大家先有个大致印象。接下来我们通过继承体系图来了解一下服务目录的家族成员都有哪些。

## 2. 继承体系

服务目录目前内置的实现有两个，分别为 StaticDirectory 和 RegistryDirectory，它们均是 AbstractDirectory 的子类。AbstractDirectory 实现了 Directory 接口，这个接口包含了一个重要的方法定义，即 list(Invocation)，用于列举 Invoker。下面我们来看一下他们的继承体系图。

![img](/imgs/dev/directory-inherit-hierarchy.png)

如上，Directory 继承自 Node 接口，Node 这个接口继承者比较多，像 Registry、Monitor、Invoker 等均继承了这个接口。这个接口包含了一个获取配置信息的方法 getUrl，实现该接口的类可以向外提供配置信息。另外，大家注意看 RegistryDirectory 实现了 NotifyListener 接口，当注册中心节点信息发生变化后，RegistryDirectory 可以通过此接口方法得到变更信息，并根据变更信息动态调整内部 Invoker 列表。

## 3. 源码分析

本章将分析 AbstractDirectory 和它两个子类的源码。AbstractDirectory 封装了 Invoker 列举流程，具体的列举逻辑则由子类实现，这是典型的模板模式。所以，接下来我们先来看一下 AbstractDirectory 的源码。

```java
public List<Invoker<T>> list(Invocation invocation) throws RpcException {
    if (destroyed) {
        throw new RpcException("Directory already destroyed...");
    }
    
    // 调用 doList 方法列举 Invoker，doList 是模板方法，由子类实现
    List<Invoker<T>> invokers = doList(invocation);
    
    // 获取路由 Router 列表
    List<Router> localRouters = this.routers;
    if (localRouters != null && !localRouters.isEmpty()) {
        for (Router router : localRouters) {
            try {
                // 获取 runtime 参数，并根据参数决定是否进行路由
                if (router.getUrl() == null || router.getUrl().getParameter(Constants.RUNTIME_KEY, false)) {
                    // 进行服务路由
                    invokers = router.route(invokers, getConsumerUrl(), invocation);
                }
            } catch (Throwable t) {
                logger.error("Failed to execute router: ...");
            }
        }
    }
    return invokers;
}

// 模板方法，由子类实现
protected abstract List<Invoker<T>> doList(Invocation invocation) throws RpcException;
```

上面就是 AbstractDirectory 的 list 方法源码，这个方法封装了 Invoker 的列举过程。如下：

1. 调用 doList 获取 Invoker 列表
2. 根据 Router 的 getUrl 返回值为空与否，以及 runtime 参数决定是否进行服务路由

以上步骤中，doList 是模板方法，需由子类实现。Router 的 runtime 参数这里简单说明一下，这个参数决定了是否在每次调用服务时都执行路由规则。如果 runtime 为 true，那么每次调用服务前，都需要进行服务路由。这个对性能造成影响，配置时需要注意。

关于 AbstractDirectory 就分析这么多，下面开始分析子类的源码。

### 3.1 StaticDirectory

StaticDirectory 即静态服务目录，顾名思义，它内部存放的 Invoker 是不会变动的。所以，理论上它和不可变 List 的功能很相似。下面我们来看一下这个类的实现。

```java
public class StaticDirectory<T> extends AbstractDirectory<T> {

    // Invoker 列表
    private final List<Invoker<T>> invokers;
    
    // 省略构造方法

    @Override
    public Class<T> getInterface() {
        // 获取接口类
        return invokers.get(0).getInterface();
    }
    
    // 检测服务目录是否可用
    @Override
    public boolean isAvailable() {
        if (isDestroyed()) {
            return false;
        }
        for (Invoker<T> invoker : invokers) {
            if (invoker.isAvailable()) {
                // 只要有一个 Invoker 是可用的，就认为当前目录是可用的
                return true;
            }
        }
        return false;
    }

    @Override
    public void destroy() {
        if (isDestroyed()) {
            return;
        }
        // 调用父类销毁逻辑
        super.destroy();
        // 遍历 Invoker 列表，并执行相应的销毁逻辑
        for (Invoker<T> invoker : invokers) {
            invoker.destroy();
        }
        invokers.clear();
    }

    @Override
    protected List<Invoker<T>> doList(Invocation invocation) throws RpcException {
        // 列举 Inovker，也就是直接返回 invokers 成员变量
        return invokers;
    }
}
```

以上就是 StaticDirectory 的代码逻辑，很简单，就不多说了。下面来看看 RegistryDirectory，这个类的逻辑比较复杂。

### 3.2 RegistryDirectory

RegistryDirectory 是一种动态服务目录，实现了 NotifyListener 接口。当注册中心服务配置发生变化后，RegistryDirectory 可收到与当前服务相关的变化。收到变更通知后，RegistryDirectory 可根据配置变更信息刷新 Invoker 列表。RegistryDirectory 中有几个比较重要的逻辑，第一是 Invoker 的列举逻辑，第二是接收服务配置变更的逻辑，第三是 Invoker 列表的刷新逻辑。接下来按顺序对这三块逻辑进行分析。

#### 3.2.1 列举 Invoker

Invoker 列举逻辑封装在 doList 方法中，相关代码如下：

```java
public List<Invoker<T>> doList(Invocation invocation) {
    if (forbidden) {
        // 服务提供者关闭或禁用了服务，此时抛出 No provider 异常
        throw new RpcException(RpcException.FORBIDDEN_EXCEPTION,
            "No provider available from registry ...");
    }
    List<Invoker<T>> invokers = null;
    // 获取 Invoker 本地缓存
    Map<String, List<Invoker<T>>> localMethodInvokerMap = this.methodInvokerMap;
    if (localMethodInvokerMap != null && localMethodInvokerMap.size() > 0) {
        // 获取方法名和参数列表
        String methodName = RpcUtils.getMethodName(invocation);
        Object[] args = RpcUtils.getArguments(invocation);
        // 检测参数列表的第一个参数是否为 String 或 enum 类型
        if (args != null && args.length > 0 && args[0] != null
                && (args[0] instanceof String || args[0].getClass().isEnum())) {
            // 通过 方法名 + 第一个参数名称 查询 Invoker 列表，具体的使用场景暂时没想到
            invokers = localMethodInvokerMap.get(methodName + "." + args[0]);
        }
        if (invokers == null) {
            // 通过方法名获取 Invoker 列表
            invokers = localMethodInvokerMap.get(methodName);
        }
        if (invokers == null) {
            // 通过星号 * 获取 Invoker 列表
            invokers = localMethodInvokerMap.get(Constants.ANY_VALUE);
        }
        
        // 冗余逻辑，pull request #2861 移除了下面的 if 分支代码
        if (invokers == null) {
            Iterator<List<Invoker<T>>> iterator = localMethodInvokerMap.values().iterator();
            if (iterator.hasNext()) {
                invokers = iterator.next();
            }
        }
    }

	// 返回 Invoker 列表
    return invokers == null ? new ArrayList<Invoker<T>>(0) : invokers;
}
```

以上代码进行多次尝试，以期从 localMethodInvokerMap 中获取到 Invoker 列表。一般情况下，普通的调用可通过方法名获取到对应的 Invoker 列表，泛化调用可通过 ```*``` 获取到 Invoker 列表。localMethodInvokerMap 源自 RegistryDirectory 类的成员变量 methodInvokerMap。doList 方法可以看做是对 methodInvokerMap 变量的读操作，至于对 methodInvokerMap 变量的写操作，下一节进行分析。

#### 3.2.2 接收服务变更通知

RegistryDirectory 是一个动态服务目录，会随注册中心配置的变化进行动态调整。因此 RegistryDirectory 实现了 NotifyListener 接口，通过这个接口获取注册中心变更通知。下面我们来看一下具体的逻辑。

```java
public synchronized void notify(List<URL> urls) {
    // 定义三个集合，分别用于存放服务提供者 url，路由 url，配置器 url
    List<URL> invokerUrls = new ArrayList<URL>();
    List<URL> routerUrls = new ArrayList<URL>();
    List<URL> configuratorUrls = new ArrayList<URL>();
    for (URL url : urls) {
        String protocol = url.getProtocol();
        // 获取 category 参数
        String category = url.getParameter(Constants.CATEGORY_KEY, Constants.DEFAULT_CATEGORY);
        // 根据 category 参数将 url 分别放到不同的列表中
        if (Constants.ROUTERS_CATEGORY.equals(category)
                || Constants.ROUTE_PROTOCOL.equals(protocol)) {
            // 添加路由器 url
            routerUrls.add(url);
        } else if (Constants.CONFIGURATORS_CATEGORY.equals(category)
                || Constants.OVERRIDE_PROTOCOL.equals(protocol)) {
            // 添加配置器 url
            configuratorUrls.add(url);
        } else if (Constants.PROVIDERS_CATEGORY.equals(category)) {
            // 添加服务提供者 url
            invokerUrls.add(url);
        } else {
            // 忽略不支持的 category
            logger.warn("Unsupported category ...");
        }
    }
    if (configuratorUrls != null && !configuratorUrls.isEmpty()) {
        // 将 url 转成 Configurator
        this.configurators = toConfigurators(configuratorUrls);
    }
    if (routerUrls != null && !routerUrls.isEmpty()) {
        // 将 url 转成 Router
        List<Router> routers = toRouters(routerUrls);
        if (routers != null) {
            setRouters(routers);
        }
    }
    List<Configurator> localConfigurators = this.configurators;
    this.overrideDirectoryUrl = directoryUrl;
    if (localConfigurators != null && !localConfigurators.isEmpty()) {
        for (Configurator configurator : localConfigurators) {
            // 配置 overrideDirectoryUrl
            this.overrideDirectoryUrl = configurator.configure(overrideDirectoryUrl);
        }
    }

    // 刷新 Invoker 列表
    refreshInvoker(invokerUrls);
}
```

如上，notify 方法首先是根据 url 的 category 参数对 url 进行分门别类存储，然后通过 toRouters 和 toConfigurators 将 url 列表转成 Router 和 Configurator 列表。最后调用 refreshInvoker 方法刷新 Invoker 列表。这里的 toRouters 和 toConfigurators 方法逻辑不复杂，大家自行分析。接下来，我们把重点放在 refreshInvoker 方法上。

#### 3.2.3 刷新 Invoker 列表

refreshInvoker 方法是保证 RegistryDirectory 随注册中心变化而变化的关键所在。这一块逻辑比较多，接下来一一进行分析。

```java
private void refreshInvoker(List<URL> invokerUrls) {
    // invokerUrls 仅有一个元素，且 url 协议头为 empty，此时表示禁用所有服务
    if (invokerUrls != null && invokerUrls.size() == 1 && invokerUrls.get(0) != null
            && Constants.EMPTY_PROTOCOL.equals(invokerUrls.get(0).getProtocol())) {
        // 设置 forbidden 为 true
        this.forbidden = true;
        this.methodInvokerMap = null;
        // 销毁所有 Invoker
        destroyAllInvokers();
    } else {
        this.forbidden = false;
        Map<String, Invoker<T>> oldUrlInvokerMap = this.urlInvokerMap;
        if (invokerUrls.isEmpty() && this.cachedInvokerUrls != null) {
            // 添加缓存 url 到 invokerUrls 中
            invokerUrls.addAll(this.cachedInvokerUrls);
        } else {
            this.cachedInvokerUrls = new HashSet<URL>();
            // 缓存 invokerUrls
            this.cachedInvokerUrls.addAll(invokerUrls);
        }
        if (invokerUrls.isEmpty()) {
            return;
        }
        // 将 url 转成 Invoker
        Map<String, Invoker<T>> newUrlInvokerMap = toInvokers(invokerUrls);
        // 将 newUrlInvokerMap 转成方法名到 Invoker 列表的映射
        Map<String, List<Invoker<T>>> newMethodInvokerMap = toMethodInvokers(newUrlInvokerMap);
        // 转换出错，直接打印异常，并返回
        if (newUrlInvokerMap == null || newUrlInvokerMap.size() == 0) {
            logger.error(new IllegalStateException("urls to invokers error ..."));
            return;
        }
        // 合并多个组的 Invoker
        this.methodInvokerMap = multiGroup ? toMergeMethodInvokerMap(newMethodInvokerMap) : newMethodInvokerMap;
        this.urlInvokerMap = newUrlInvokerMap;
        try {
            // 销毁无用 Invoker
            destroyUnusedInvokers(oldUrlInvokerMap, newUrlInvokerMap);
        } catch (Exception e) {
            logger.warn("destroyUnusedInvokers error. ", e);
        }
    }
}
```

refreshInvoker 方法首先会根据入参 invokerUrls 的数量和协议头判断是否禁用所有的服务，如果禁用，则将 forbidden 设为 true，并销毁所有的 Invoker。若不禁用，则将 url 转成 Invoker，得到 \<url, Invoker\> 的映射关系。然后进一步进行转换，得到 \<methodName, Invoker 列表\> 映射关系。之后进行多组 Invoker 合并操作，并将合并结果赋值给 methodInvokerMap。methodInvokerMap 变量在 doList 方法中会被用到，doList 会对该变量进行读操作，在这里是写操作。当新的 Invoker 列表生成后，还要一个重要的工作要做，就是销毁无用的 Invoker，避免服务消费者调用已下线的服务的服务。

接下来对 refreshInvoker 方法中涉及到的调用一一进行分析。按照顺序，先来分析 url 到 Invoker 的转换过程。

```java
private Map<String, Invoker<T>> toInvokers(List<URL> urls) {
    Map<String, Invoker<T>> newUrlInvokerMap = new HashMap<String, Invoker<T>>();
    if (urls == null || urls.isEmpty()) {
        return newUrlInvokerMap;
    }
    Set<String> keys = new HashSet<String>();
    // 获取服务消费端配置的协议
    String queryProtocols = this.queryMap.get(Constants.PROTOCOL_KEY);
    for (URL providerUrl : urls) {
        if (queryProtocols != null && queryProtocols.length() > 0) {
            boolean accept = false;
            String[] acceptProtocols = queryProtocols.split(",");
            // 检测服务提供者协议是否被服务消费者所支持
            for (String acceptProtocol : acceptProtocols) {
                if (providerUrl.getProtocol().equals(acceptProtocol)) {
                    accept = true;
                    break;
                }
            }
            if (!accept) {
                // 若服务提供者协议头不被消费者所支持，则忽略当前 providerUrl
                continue;
            }
        }
        // 忽略 empty 协议
        if (Constants.EMPTY_PROTOCOL.equals(providerUrl.getProtocol())) {
            continue;
        }
        // 通过 SPI 检测服务端协议是否被消费端支持，不支持则抛出异常
        if (!ExtensionLoader.getExtensionLoader(Protocol.class).hasExtension(providerUrl.getProtocol())) {
            logger.error(new IllegalStateException("Unsupported protocol..."));
            continue;
        }
        
        // 合并 url
        URL url = mergeUrl(providerUrl);

        String key = url.toFullString();
        if (keys.contains(key)) {
            // 忽略重复 url
            continue;
        }
        keys.add(key);
        // 将本地 Invoker 缓存赋值给 localUrlInvokerMap
        Map<String, Invoker<T>> localUrlInvokerMap = this.urlInvokerMap;
        // 获取与 url 对应的 Invoker
        Invoker<T> invoker = localUrlInvokerMap == null ? null : localUrlInvokerMap.get(key);
        // 缓存未命中
        if (invoker == null) {
            try {
                boolean enabled = true;
                if (url.hasParameter(Constants.DISABLED_KEY)) {
                    // 获取 disable 配置，取反，然后赋值给 enable 变量
                    enabled = !url.getParameter(Constants.DISABLED_KEY, false);
                } else {
                    // 获取 enable 配置，并赋值给 enable 变量
                    enabled = url.getParameter(Constants.ENABLED_KEY, true);
                }
                if (enabled) {
                    // 调用 refer 获取 Invoker
                    invoker = new InvokerDelegate<T>(protocol.refer(serviceType, url), url, providerUrl);
                }
            } catch (Throwable t) {
                logger.error("Failed to refer invoker for interface...");
            }
            if (invoker != null) {
                // 缓存 Invoker 实例
                newUrlInvokerMap.put(key, invoker);
            }
            
        // 缓存命中
        } else {
            // 将 invoker 存储到 newUrlInvokerMap 中
            newUrlInvokerMap.put(key, invoker);
        }
    }
    keys.clear();
    return newUrlInvokerMap;
}
```

toInvokers 方法一开始会对服务提供者 url 进行检测，若服务消费端的配置不支持服务端的协议，或服务端 url 协议头为 empty 时，toInvokers 均会忽略服务提供方 url。必要的检测做完后，紧接着是合并 url，然后访问缓存，尝试获取与 url 对应的 invoker。如果缓存命中，直接将 Invoker 存入 newUrlInvokerMap 中即可。如果未命中，则需新建 Invoker。

toInvokers 方法返回的是 \<url, Invoker\> 映射关系表，接下来还要对这个结果进行进一步处理，得到方法名到 Invoker 列表的映射关系。这个过程由 toMethodInvokers 方法完成，如下：

```java
private Map<String, List<Invoker<T>>> toMethodInvokers(Map<String, Invoker<T>> invokersMap) {
    // 方法名 -> Invoker 列表
    Map<String, List<Invoker<T>>> newMethodInvokerMap = new HashMap<String, List<Invoker<T>>>();
    List<Invoker<T>> invokersList = new ArrayList<Invoker<T>>();
    if (invokersMap != null && invokersMap.size() > 0) {
        for (Invoker<T> invoker : invokersMap.values()) {
            // 获取 methods 参数
            String parameter = invoker.getUrl().getParameter(Constants.METHODS_KEY);
            if (parameter != null && parameter.length() > 0) {
                // 切分 methods 参数值，得到方法名数组
                String[] methods = Constants.COMMA_SPLIT_PATTERN.split(parameter);
                if (methods != null && methods.length > 0) {
                    for (String method : methods) {
                        // 方法名不为 *
                        if (method != null && method.length() > 0
                                && !Constants.ANY_VALUE.equals(method)) {
                            // 根据方法名获取 Invoker 列表
                            List<Invoker<T>> methodInvokers = newMethodInvokerMap.get(method);
                            if (methodInvokers == null) {
                                methodInvokers = new ArrayList<Invoker<T>>();
                                newMethodInvokerMap.put(method, methodInvokers);
                            }
                            // 存储 Invoker 到列表中
                            methodInvokers.add(invoker);
                        }
                    }
                }
            }
            invokersList.add(invoker);
        }
    }
    
    // 进行服务级别路由，参考 pull request #749
    List<Invoker<T>> newInvokersList = route(invokersList, null);
    // 存储 <*, newInvokersList> 映射关系
    newMethodInvokerMap.put(Constants.ANY_VALUE, newInvokersList);
    if (serviceMethods != null && serviceMethods.length > 0) {
        for (String method : serviceMethods) {
            List<Invoker<T>> methodInvokers = newMethodInvokerMap.get(method);
            if (methodInvokers == null || methodInvokers.isEmpty()) {
                methodInvokers = newInvokersList;
            }
            // 进行方法级别路由
            newMethodInvokerMap.put(method, route(methodInvokers, method));
        }
    }
    // 排序，转成不可变列表
    for (String method : new HashSet<String>(newMethodInvokerMap.keySet())) {
        List<Invoker<T>> methodInvokers = newMethodInvokerMap.get(method);
        Collections.sort(methodInvokers, InvokerComparator.getComparator());
        newMethodInvokerMap.put(method, Collections.unmodifiableList(methodInvokers));
    }
    return Collections.unmodifiableMap(newMethodInvokerMap);
}
```

上面方法主要做了三件事情， 第一是对入参进行遍历，然后从 Invoker 的 url 成员变量中获取 methods 参数，并切分成数组。随后以方法名为键，Invoker 列表为值，将映射关系存储到 newMethodInvokerMap 中。第二是分别基于类和方法对 Invoker 列表进行路由操作。第三是对 Invoker 列表进行排序，并转成不可变列表。关于 toMethodInvokers 方法就先分析到这，我们继续向下分析，这次要分析的多组服务的合并逻辑。

```java
private Map<String, List<Invoker<T>>> toMergeMethodInvokerMap(Map<String, List<Invoker<T>>> methodMap) {
    Map<String, List<Invoker<T>>> result = new HashMap<String, List<Invoker<T>>>();
    // 遍历入参
    for (Map.Entry<String, List<Invoker<T>>> entry : methodMap.entrySet()) {
        String method = entry.getKey();
        List<Invoker<T>> invokers = entry.getValue();
        // group -> Invoker 列表
        Map<String, List<Invoker<T>>> groupMap = new HashMap<String, List<Invoker<T>>>();
        // 遍历 Invoker 列表
        for (Invoker<T> invoker : invokers) {
            // 获取分组配置
            String group = invoker.getUrl().getParameter(Constants.GROUP_KEY, "");
            List<Invoker<T>> groupInvokers = groupMap.get(group);
            if (groupInvokers == null) {
                groupInvokers = new ArrayList<Invoker<T>>();
                // 缓存 <group, List<Invoker>> 到 groupMap 中
                groupMap.put(group, groupInvokers);
            }
            // 存储 invoker 到 groupInvokers
            groupInvokers.add(invoker);
        }
        if (groupMap.size() == 1) {
            // 如果 groupMap 中仅包含一组键值对，此时直接取出该键值对的值即可
            result.put(method, groupMap.values().iterator().next());
        
        // groupMap.size() > 1 成立，表示 groupMap 中包含多组键值对，比如：
        // {
        //     "dubbo": [invoker1, invoker2, invoker3, ...],
        //     "hello": [invoker4, invoker5, invoker6, ...]
        // }
        } else if (groupMap.size() > 1) {
            List<Invoker<T>> groupInvokers = new ArrayList<Invoker<T>>();
            for (List<Invoker<T>> groupList : groupMap.values()) {
                // 通过集群类合并每个分组对应的 Invoker 列表
                groupInvokers.add(cluster.join(new StaticDirectory<T>(groupList)));
            }
            // 缓存结果
            result.put(method, groupInvokers);
        } else {
            result.put(method, invokers);
        }
    }
    return result;
}
```

上面方法首先是生成 group 到 Invoker 列表的映射关系表，若关系表中的映射关系数量大于1，表示有多组服务。此时通过集群类合并每组 Invoker，并将合并结果存储到 groupInvokers 中。之后将方法名与 groupInvokers   存到到 result 中，并返回，整个逻辑结束。

接下来我们再来看一下 Invoker 列表刷新逻辑的最后一个动作 — 删除无用 Invoker。如下：

```java
private void destroyUnusedInvokers(Map<String, Invoker<T>> oldUrlInvokerMap, Map<String, Invoker<T>> newUrlInvokerMap) {
    if (newUrlInvokerMap == null || newUrlInvokerMap.size() == 0) {
        destroyAllInvokers();
        return;
    }
   
    List<String> deleted = null;
    if (oldUrlInvokerMap != null) {
        // 获取新生成的 Invoker 列表
        Collection<Invoker<T>> newInvokers = newUrlInvokerMap.values();
        // 遍历老的 <url, Invoker> 映射表
        for (Map.Entry<String, Invoker<T>> entry : oldUrlInvokerMap.entrySet()) {
            // 检测 newInvokers 中是否包含老的 Invoker
            if (!newInvokers.contains(entry.getValue())) {
                if (deleted == null) {
                    deleted = new ArrayList<String>();
                }
                // 若不包含，则将老的 Invoker 对应的 url 存入 deleted 列表中
                deleted.add(entry.getKey());
            }
        }
    }

    if (deleted != null) {
        // 遍历 deleted 集合，并到老的 <url, Invoker> 映射关系表查出 Invoker，销毁之
        for (String url : deleted) {
            if (url != null) {
                // 从 oldUrlInvokerMap 中移除 url 对应的 Invoker
                Invoker<T> invoker = oldUrlInvokerMap.remove(url);
                if (invoker != null) {
                    try {
                        // 销毁 Invoker
                        invoker.destroy();
                    } catch (Exception e) {
                        logger.warn("destroy invoker...");
                    }
                }
            }
        }
    }
}
```

destroyUnusedInvokers 方法的主要逻辑是通过 newUrlInvokerMap 找出待删除 Invoker 对应的 url，并将 url 存入到 deleted 列表中。然后再遍历 deleted 列表，并从 oldUrlInvokerMap 中移除相应的 Invoker，销毁之。整个逻辑大致如此，不是很难理解。

到此关于 Invoker 列表的刷新逻辑就分析了，这里对整个过程进行简单总结。如下：

1. 检测入参是否仅包含一个 url，且 url 协议头为 empty
2. 若第一步检测结果为 true，表示禁用所有服务，此时销毁所有的 Invoker
3. 若第一步检测结果为 false，此时将入参转为 Invoker 列表
4. 对上一步逻辑生成的结果进行进一步处理，得到方法名到 Invoker 的映射关系表
5. 合并多组 Invoker
6. 销毁无用 Invoker

Invoker 的刷新逻辑还是比较复杂的，大家在看的过程中多写点 demo 进行调试，以加深理解。

## 4. 总结

本篇文章对 Dubbo 服务目录进行了较为详细的分析，篇幅主要集中在 RegistryDirectory 的源码分析上。从代码量上可以看出，想让本地服务目录和注册中心保持一致还是需要做很多事情的，并不简单。服务目录是 Dubbo 集群容错的一部分，也是比较基础的部分，所以大家应尽量搞懂。