---
aliases:
    - /zh/docsv2.7/dev/source/export-service/
description: 本文介绍了 Dubbo 服务导出的过程和实现细节
linkTitle: 服务导出
title: 服务导出
type: docs
weight: 3
---



## 1.简介
本篇文章，我们来研究一下 Dubbo 导出服务的过程。Dubbo 服务导出过程始于 Spring 容器发布刷新事件，Dubbo 在接收到事件后，会立即执行服务导出逻辑。整个逻辑大致可分为三个部分，第一部分是前置工作，主要用于检查参数，组装 URL。第二部分是导出服务，包含导出服务到本地 (JVM)，和导出服务到远程两个过程。第三部分是向注册中心注册服务，用于服务发现。本篇文章将会对这三个部分代码进行详细的分析。

## 2.源码分析

服务导出的入口方法是 ServiceBean 的 onApplicationEvent。onApplicationEvent 是一个事件响应方法，该方法会在收到 Spring 上下文刷新事件后执行服务导出操作。方法代码如下：

```java
public void onApplicationEvent(ContextRefreshedEvent event) {
    // 是否有延迟导出 && 是否已导出 && 是不是已被取消导出
    if (isDelay() && !isExported() && !isUnexported()) {
        // 导出服务
        export();
    }
}
```

这个方法首先会根据条件决定是否导出服务，比如有些服务设置了延时导出，那么此时就不应该在此处导出。还有一些服务已经被导出了，或者当前服务被取消导出了，此时也不能再次导出相关服务。注意这里的 isDelay 方法，这个方法字面意思是“是否延迟导出服务”，返回 true 表示延迟导出，false 表示不延迟导出。但是该方法真实意思却并非如此，当方法返回 true 时，表示无需延迟导出。返回 false 时，表示需要延迟导出。与字面意思恰恰相反，这个需要大家注意一下。下面我们来看一下这个方法的逻辑。

```java
// -☆- ServiceBean
private boolean isDelay() {
    // 获取 delay
    Integer delay = getDelay();
    ProviderConfig provider = getProvider();
    if (delay == null && provider != null) {
        // 如果前面获取的 delay 为空，这里继续获取
        delay = provider.getDelay();
    }
    // 判断 delay 是否为空，或者等于 -1
    return supportedApplicationListener && (delay == null || delay == -1);
}
```

暂时忽略 supportedApplicationListener 这个条件，当 delay 为空，或者等于-1时，该方法返回 true，而不是 false。这个方法的返回值让人有点困惑。该方法目前已被重构，详细请参考 [dubbo #2686](https://github.com/apache/dubbo/pull/2686)。

现在解释一下 supportedApplicationListener 变量含义，该变量用于表示当前的 Spring 容器是否支持 ApplicationListener，这个值初始为 false。在 Spring 容器将自己设置到 ServiceBean 中时，ServiceBean 的 setApplicationContext 方法会检测 Spring 容器是否支持 ApplicationListener。若支持，则将 supportedApplicationListener 置为 true。ServiceBean 是 Dubbo 与 Spring 框架进行整合的关键，可以看做是两个框架之间的桥梁。具有同样作用的类还有 ReferenceBean。

现在我们知道了 Dubbo 服务导出过程的起点，接下来对服务导出的前置逻辑进行分析。

### 2.1 前置工作

前置工作主要包含两个部分，分别是配置检查，以及 URL 装配。在导出服务之前，Dubbo 需要检查用户的配置是否合理，或者为用户补充缺省配置。配置检查完成后，接下来需要根据这些配置组装 URL。在 Dubbo 中，URL 的作用十分重要。Dubbo 使用 URL 作为配置载体，所有的拓展点都是通过 URL 获取配置。这一点，官方文档中有所说明。

> 采用 URL 作为配置信息的统一格式，所有扩展点都通过传递 URL 携带配置信息。

接下来，我们先来分析配置检查部分的源码，随后再来分析 URL 组装部分的源码。

#### 2.1.1 检查配置

本节我们接着前面的源码向下分析，前面说过 onApplicationEvent 方法在经过一些判断后，会决定是否调用 export 方法导出服务。那么下面我们从 export 方法开始进行分析，如下：

```java
public synchronized void export() {
    if (provider != null) {
        // 获取 export 和 delay 配置
        if (export == null) {
            export = provider.getExport();
        }
        if (delay == null) {
            delay = provider.getDelay();
        }
    }
    // 如果 export 为 false，则不导出服务
    if (export != null && !export) {
        return;
    }

    // delay > 0，延时导出服务
    if (delay != null && delay > 0) {
        delayExportExecutor.schedule(new Runnable() {
            @Override
            public void run() {
                doExport();
            }
        }, delay, TimeUnit.MILLISECONDS);
        
    // 立即导出服务
    } else {
        doExport();
    }
}
```

export 方法对两项配置进行了检查，并根据配置执行相应的动作。首先是 export 配置，这个配置决定了是否导出服务。有时候我们只是想本地启动服务进行一些调试工作，我们并不希望把本地启动的服务暴露出去给别人调用。此时，我们可通过配置 export 禁止服务导出，比如：

```xml
<dubbo:provider export="false" />
```

delay 配置顾名思义，用于延迟导出服务，这个就不分析了。下面，我们继续分析源码，这次要分析的是 doExport 方法。


```java
protected synchronized void doExport() {
    if (unexported) {
        throw new IllegalStateException("Already unexported!");
    }
    if (exported) {
        return;
    }
    exported = true;
    // 检测 interfaceName 是否合法
    if (interfaceName == null || interfaceName.length() == 0) {
        throw new IllegalStateException("interface not allow null!");
    }
    // 检测 provider 是否为空，为空则新建一个，并通过系统变量为其初始化
    checkDefault();

    // 下面几个 if 语句用于检测 provider、application 等核心配置类对象是否为空，
    // 若为空，则尝试从其他配置类对象中获取相应的实例。
    if (provider != null) {
        if (application == null) {
            application = provider.getApplication();
        }
        if (module == null) {
            module = provider.getModule();
        }
        if (registries == null) {...}
        if (monitor == null) {...}
        if (protocols == null) {...}
    }
    if (module != null) {
        if (registries == null) {
            registries = module.getRegistries();
        }
        if (monitor == null) {...}
    }
    if (application != null) {
        if (registries == null) {
            registries = application.getRegistries();
        }
        if (monitor == null) {...}
    }

    // 检测 ref 是否为泛化服务类型
    if (ref instanceof GenericService) {
        // 设置 interfaceClass 为 GenericService.class
        interfaceClass = GenericService.class;
        if (StringUtils.isEmpty(generic)) {
            // 设置 generic = "true"
            generic = Boolean.TRUE.toString();
        }
        
    // ref 非 GenericService 类型
    } else {
        try {
            interfaceClass = Class.forName(interfaceName, true, Thread.currentThread()
                    .getContextClassLoader());
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException(e.getMessage(), e);
        }
        // 对 interfaceClass，以及 <dubbo:method> 标签中的必要字段进行检查
        checkInterfaceAndMethods(interfaceClass, methods);
        // 对 ref 合法性进行检测
        checkRef();
        // 设置 generic = "false"
        generic = Boolean.FALSE.toString();
    }

    // local 和 stub 在功能应该是一致的，用于配置本地存根
    if (local != null) {
        if ("true".equals(local)) {
            local = interfaceName + "Local";
        }
        Class<?> localClass;
        try {
            // 获取本地存根类
            localClass = ClassHelper.forNameWithThreadContextClassLoader(local);
        } catch (ClassNotFoundException e) {
            throw new IllegalStateException(e.getMessage(), e);
        }
        // 检测本地存根类是否可赋值给接口类，若不可赋值则会抛出异常，提醒使用者本地存根类类型不合法
        if (!interfaceClass.isAssignableFrom(localClass)) {
            throw new IllegalStateException("The local implementation class " + localClass.getName() + " not implement interface " + interfaceName);
        }
    }

    if (stub != null) {
        // 此处的代码和上一个 if 分支的代码基本一致，这里省略
    }

    // 检测各种对象是否为空，为空则新建，或者抛出异常
    checkApplication();
    checkRegistry();
    checkProtocol();
    appendProperties(this);
    checkStubAndMock(interfaceClass);
    if (path == null || path.length() == 0) {
        path = interfaceName;
    }

    // 导出服务
    doExportUrls();

    // ProviderModel 表示服务提供者模型，此对象中存储了与服务提供者相关的信息。
    // 比如服务的配置信息，服务实例等。每个被导出的服务对应一个 ProviderModel。
    // ApplicationModel 持有所有的 ProviderModel。
    ProviderModel providerModel = new ProviderModel(getUniqueServiceName(), this, ref);
    ApplicationModel.initProviderModel(getUniqueServiceName(), providerModel);
}
```

以上就是配置检查的相关分析，代码比较多，需要大家耐心看一下。下面对配置检查的逻辑进行简单的总结，如下：

1. 检测 \<dubbo:service\> 标签的 interface 属性合法性，不合法则抛出异常
2. 检测 ProviderConfig、ApplicationConfig 等核心配置类对象是否为空，若为空，则尝试从其他配置类对象中获取相应的实例。
3. 检测并处理泛化服务和普通服务类
4. 检测本地存根配置，并进行相应的处理
5. 对 ApplicationConfig、RegistryConfig 等配置类进行检测，为空则尝试创建，若无法创建则抛出异常

配置检查并非本文重点，因此这里不打算对 doExport 方法所调用的方法进行分析（doExportUrls 方法除外）。在这些方法中，除了 appendProperties 方法稍微复杂一些，其他方法逻辑不是很复杂。因此，大家可自行分析。

#### 2.1.2 多协议多注册中心导出服务

Dubbo 允许我们使用不同的协议导出服务，也允许我们向多个注册中心注册服务。Dubbo 在 doExportUrls 方法中对多协议，多注册中心进行了支持。相关代码如下：

```java
private void doExportUrls() {
    // 加载注册中心链接
    List<URL> registryURLs = loadRegistries(true);
    // 遍历 protocols，并在每个协议下导出服务
    for (ProtocolConfig protocolConfig : protocols) {
        doExportUrlsFor1Protocol(protocolConfig, registryURLs);
    }
}
```

上面代码首先是通过 loadRegistries 加载注册中心链接，然后再遍历 ProtocolConfig 集合导出每个服务。并在导出服务的过程中，将服务注册到注册中心。下面，我们先来看一下 loadRegistries 方法的逻辑。

```java
protected List<URL> loadRegistries(boolean provider) {
    // 检测是否存在注册中心配置类，不存在则抛出异常
    checkRegistry();
    List<URL> registryList = new ArrayList<URL>();
    if (registries != null && !registries.isEmpty()) {
        for (RegistryConfig config : registries) {
            String address = config.getAddress();
            if (address == null || address.length() == 0) {
                // 若 address 为空，则将其设为 0.0.0.0
                address = Constants.ANYHOST_VALUE;
            }

            // 从系统属性中加载注册中心地址
            String sysaddress = System.getProperty("dubbo.registry.address");
            if (sysaddress != null && sysaddress.length() > 0) {
                address = sysaddress;
            }
            // 检测 address 是否合法
            if (address.length() > 0 && !RegistryConfig.NO_AVAILABLE.equalsIgnoreCase(address)) {
                Map<String, String> map = new HashMap<String, String>();
                // 添加 ApplicationConfig 中的字段信息到 map 中
                appendParameters(map, application);
                // 添加 RegistryConfig 字段信息到 map 中
                appendParameters(map, config);
                
                // 添加 path、pid，protocol 等信息到 map 中
                map.put("path", RegistryService.class.getName());
                map.put("dubbo", Version.getProtocolVersion());
                map.put(Constants.TIMESTAMP_KEY, String.valueOf(System.currentTimeMillis()));
                if (ConfigUtils.getPid() > 0) {
                    map.put(Constants.PID_KEY, String.valueOf(ConfigUtils.getPid()));
                }
                if (!map.containsKey("protocol")) {
                    if (ExtensionLoader.getExtensionLoader(RegistryFactory.class).hasExtension("remote")) {
                        map.put("protocol", "remote");
                    } else {
                        map.put("protocol", "dubbo");
                    }
                }

                // 解析得到 URL 列表，address 可能包含多个注册中心 ip，
                // 因此解析得到的是一个 URL 列表
                List<URL> urls = UrlUtils.parseURLs(address, map);
                for (URL url : urls) {
                    url = url.addParameter(Constants.REGISTRY_KEY, url.getProtocol());
                    // 将 URL 协议头设置为 registry
                    url = url.setProtocol(Constants.REGISTRY_PROTOCOL);
                    // 通过判断条件，决定是否添加 url 到 registryList 中，条件如下：
                    // (服务提供者 && register = true 或 null) 
                    //    || (非服务提供者 && subscribe = true 或 null)
                    if ((provider && url.getParameter(Constants.REGISTER_KEY, true))
                            || (!provider && url.getParameter(Constants.SUBSCRIBE_KEY, true))) {
                        registryList.add(url);
                    }
                }
            }
        }
    }
    return registryList;
}
```

loadRegistries 方法主要包含如下的逻辑：

1. 检测是否存在注册中心配置类，不存在则抛出异常
2. 构建参数映射集合，也就是 map
3. 构建注册中心链接列表
4. 遍历链接列表，并根据条件决定是否将其添加到 registryList 中

关于多协议多注册中心导出服务就先分析到这，代码不是很多，接下来分析 URL 组装过程。

#### 2.1.3 组装 URL

配置检查完毕后，紧接着要做的事情是根据配置，以及其他一些信息组装 URL。前面说过，URL 是 Dubbo 配置的载体，通过  URL 可让 Dubbo 的各种配置在各个模块之间传递。URL 之于 Dubbo，犹如水之于鱼，非常重要。大家在阅读 Dubbo 服务导出相关源码的过程中，要注意 URL 内容的变化。既然 URL 如此重要，那么下面我们来了解一下 URL 组装的过程。

```java
private void doExportUrlsFor1Protocol(ProtocolConfig protocolConfig, List<URL> registryURLs) {
    String name = protocolConfig.getName();
    // 如果协议名为空，或空串，则将协议名变量设置为 dubbo
    if (name == null || name.length() == 0) {
        name = "dubbo";
    }

    Map<String, String> map = new HashMap<String, String>();
    // 添加 side、版本、时间戳以及进程号等信息到 map 中
    map.put(Constants.SIDE_KEY, Constants.PROVIDER_SIDE);
    map.put(Constants.DUBBO_VERSION_KEY, Version.getProtocolVersion());
    map.put(Constants.TIMESTAMP_KEY, String.valueOf(System.currentTimeMillis()));
    if (ConfigUtils.getPid() > 0) {
        map.put(Constants.PID_KEY, String.valueOf(ConfigUtils.getPid()));
    }

    // 通过反射将对象的字段信息添加到 map 中
    appendParameters(map, application);
    appendParameters(map, module);
    appendParameters(map, provider, Constants.DEFAULT_KEY);
    appendParameters(map, protocolConfig);
    appendParameters(map, this);

    // methods 为 MethodConfig 集合，MethodConfig 中存储了 <dubbo:method> 标签的配置信息
    if (methods != null && !methods.isEmpty()) {
        // 这段代码用于添加 Callback 配置到 map 中，代码太长，待会单独分析
    }

    // 检测 generic 是否为 "true"，并根据检测结果向 map 中添加不同的信息
    if (ProtocolUtils.isGeneric(generic)) {
        map.put(Constants.GENERIC_KEY, generic);
        map.put(Constants.METHODS_KEY, Constants.ANY_VALUE);
    } else {
        String revision = Version.getVersion(interfaceClass, version);
        if (revision != null && revision.length() > 0) {
            map.put("revision", revision);
        }

        // 为接口生成包裹类 Wrapper，Wrapper 中包含了接口的详细信息，比如接口方法名数组，字段信息等
        String[] methods = Wrapper.getWrapper(interfaceClass).getMethodNames();
        // 添加方法名到 map 中，如果包含多个方法名，则用逗号隔开，比如 method = init,destroy
        if (methods.length == 0) {
            logger.warn("NO method found in service interface ...");
            map.put(Constants.METHODS_KEY, Constants.ANY_VALUE);
        } else {
            // 将逗号作为分隔符连接方法名，并将连接后的字符串放入 map 中
            map.put(Constants.METHODS_KEY, StringUtils.join(new HashSet<String>(Arrays.asList(methods)), ","));
        }
    }

    // 添加 token 到 map 中
    if (!ConfigUtils.isEmpty(token)) {
        if (ConfigUtils.isDefault(token)) {
            // 随机生成 token
            map.put(Constants.TOKEN_KEY, UUID.randomUUID().toString());
        } else {
            map.put(Constants.TOKEN_KEY, token);
        }
    }
    // 判断协议名是否为 injvm
    if (Constants.LOCAL_PROTOCOL.equals(protocolConfig.getName())) {
        protocolConfig.setRegister(false);
        map.put("notify", "false");
    }

    // 获取上下文路径
    String contextPath = protocolConfig.getContextpath();
    if ((contextPath == null || contextPath.length() == 0) && provider != null) {
        contextPath = provider.getContextpath();
    }

    // 获取 host 和 port
    String host = this.findConfigedHosts(protocolConfig, registryURLs, map);
    Integer port = this.findConfigedPorts(protocolConfig, name, map);
    // 组装 URL
    URL url = new URL(name, host, port, (contextPath == null || contextPath.length() == 0 ? "" : contextPath + "/") + path, map);
    
    // 省略无关代码
}
```

上面的代码首先是将一些信息，比如版本、时间戳、方法名以及各种配置对象的字段信息放入到 map 中，map 中的内容将作为 URL 的查询字符串。构建好 map 后，紧接着是获取上下文路径、主机名以及端口号等信息。最后将 map 和主机名等数据传给 URL 构造方法创建 URL 对象。需要注意的是，这里出现的 URL 并非 java.net.URL，而是 com.alibaba.dubbo.common.URL。

上面省略了一段代码，这里简单分析一下。这段代码用于检测 \<dubbo:method\> 标签中的配置信息，并将相关配置添加到 map 中。代码如下：

```java
private void doExportUrlsFor1Protocol(ProtocolConfig protocolConfig, List<URL> registryURLs) {
    // ...

    // methods 为 MethodConfig 集合，MethodConfig 中存储了 <dubbo:method> 标签的配置信息
    if (methods != null && !methods.isEmpty()) {
        for (MethodConfig method : methods) {
            // 添加 MethodConfig 对象的字段信息到 map 中，键 = 方法名.属性名。
            // 比如存储 <dubbo:method name="sayHello" retries="2"> 对应的 MethodConfig，
            // 键 = sayHello.retries，map = {"sayHello.retries": 2, "xxx": "yyy"}
            appendParameters(map, method, method.getName());

            String retryKey = method.getName() + ".retry";
            if (map.containsKey(retryKey)) {
                String retryValue = map.remove(retryKey);
                // 检测 MethodConfig retry 是否为 false，若是，则设置重试次数为0
                if ("false".equals(retryValue)) {
                    map.put(method.getName() + ".retries", "0");
                }
            }
            
            // 获取 ArgumentConfig 列表
            List<ArgumentConfig> arguments = method.getArguments();
            if (arguments != null && !arguments.isEmpty()) {
                for (ArgumentConfig argument : arguments) {
                    // 检测 type 属性是否为空，或者空串（分支1 ⭐️）
                    if (argument.getType() != null && argument.getType().length() > 0) {
                        Method[] methods = interfaceClass.getMethods();
                        if (methods != null && methods.length > 0) {
                            for (int i = 0; i < methods.length; i++) {
                                String methodName = methods[i].getName();
                                // 比对方法名，查找目标方法
                                if (methodName.equals(method.getName())) {
                                    Class<?>[] argtypes = methods[i].getParameterTypes();
                                    if (argument.getIndex() != -1) {
                                        // 检测 ArgumentConfig 中的 type 属性与方法参数列表
                                        // 中的参数名称是否一致，不一致则抛出异常(分支2 ⭐️)
                                        if (argtypes[argument.getIndex()].getName().equals(argument.getType())) {
                                            // 添加 ArgumentConfig 字段信息到 map 中，
                                            // 键前缀 = 方法名.index，比如:
                                            // map = {"sayHello.3": true}
                                            appendParameters(map, argument, method.getName() + "." + argument.getIndex());
                                        } else {
                                            throw new IllegalArgumentException("argument config error: ...");
                                        }
                                    } else {    // 分支3 ⭐️
                                        for (int j = 0; j < argtypes.length; j++) {
                                            Class<?> argclazz = argtypes[j];
                                            // 从参数类型列表中查找类型名称为 argument.type 的参数
                                            if (argclazz.getName().equals(argument.getType())) {
                                                appendParameters(map, argument, method.getName() + "." + j);
                                                if (argument.getIndex() != -1 && argument.getIndex() != j) {
                                                    throw new IllegalArgumentException("argument config error: ...");
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    // 用户未配置 type 属性，但配置了 index 属性，且 index != -1
                    } else if (argument.getIndex() != -1) {    // 分支4 ⭐️
                        // 添加 ArgumentConfig 字段信息到 map 中
                        appendParameters(map, argument, method.getName() + "." + argument.getIndex());
                    } else {
                        throw new IllegalArgumentException("argument config must set index or type");
                    }
                }
            }
        }
    }

    // ...
}
```

上面这段代码 for 循环和 if else 分支嵌套太多，导致层次太深，不利于阅读，需要耐心看一下。大家在看这段代码时，注意把几个重要的条件分支找出来。只要理解了这几个分支的意图，就可以弄懂这段代码。请注意上面代码中⭐️符号，这几个符号标识出了4个重要的分支，下面用伪代码解释一下这几个分支的含义。

```java
// 获取 ArgumentConfig 列表
for (遍历 ArgumentConfig 列表) {
    if (type 不为 null，也不为空串) {    // 分支1
        1. 通过反射获取 interfaceClass 的方法列表
        for (遍历方法列表) {
            1. 比对方法名，查找目标方法
        	2. 通过反射获取目标方法的参数类型数组 argtypes
            if (index != -1) {    // 分支2
                1. 从 argtypes 数组中获取下标 index 处的元素 argType
                2. 检测 argType 的名称与 ArgumentConfig 中的 type 属性是否一致
                3. 添加 ArgumentConfig 字段信息到 map 中，或抛出异常
            } else {    // 分支3
                1. 遍历参数类型数组 argtypes，查找 argument.type 类型的参数
                2. 添加 ArgumentConfig 字段信息到 map 中
            }
        }
    } else if (index != -1) {    // 分支4
		1. 添加 ArgumentConfig 字段信息到 map 中
    }
}
```

在本节分析的源码中，appendParameters 这个方法出现的次数比较多，该方法用于将对象字段信息添加到 map 中。实现上则是通过反射获取目标对象的 getter 方法，并调用该方法获取属性值。然后再通过 getter 方法名解析出属性名，比如从方法名 getName 中可解析出属性 name。如果用户传入了属性名前缀，此时需要将属性名加入前缀内容。最后将 \<属性名，属性值\> 键值对存入到 map 中就行了。限于篇幅原因，这里就不分析 appendParameters 方法的源码了，大家请自行分析。

### 2.2 导出 Dubbo 服务

前置工作做完，接下来就可以进行服务导出了。服务导出分为导出到本地 (JVM)，和导出到远程。在深入分析服务导出的源码前，我们先来从宏观层面上看一下服务导出逻辑。如下：

```java
private void doExportUrlsFor1Protocol(ProtocolConfig protocolConfig, List<URL> registryURLs) {
    
    // 省略无关代码
    
    if (ExtensionLoader.getExtensionLoader(ConfiguratorFactory.class)
            .hasExtension(url.getProtocol())) {
        // 加载 ConfiguratorFactory，并生成 Configurator 实例，然后通过实例配置 url
        url = ExtensionLoader.getExtensionLoader(ConfiguratorFactory.class)
                .getExtension(url.getProtocol()).getConfigurator(url).configure(url);
    }

    String scope = url.getParameter(Constants.SCOPE_KEY);
    // 如果 scope = none，则什么都不做
    if (!Constants.SCOPE_NONE.toString().equalsIgnoreCase(scope)) {
        // scope != remote，导出到本地
        if (!Constants.SCOPE_REMOTE.toString().equalsIgnoreCase(scope)) {
            exportLocal(url);
        }

        // scope != local，导出到远程
        if (!Constants.SCOPE_LOCAL.toString().equalsIgnoreCase(scope)) {
            if (registryURLs != null && !registryURLs.isEmpty()) {
                for (URL registryURL : registryURLs) {
                    url = url.addParameterIfAbsent(Constants.DYNAMIC_KEY, registryURL.getParameter(Constants.DYNAMIC_KEY));
                    // 加载监视器链接
                    URL monitorUrl = loadMonitor(registryURL);
                    if (monitorUrl != null) {
                        // 将监视器链接作为参数添加到 url 中
                        url = url.addParameterAndEncoded(Constants.MONITOR_KEY, monitorUrl.toFullString());
                    }

                    String proxy = url.getParameter(Constants.PROXY_KEY);
                    if (StringUtils.isNotEmpty(proxy)) {
                        registryURL = registryURL.addParameter(Constants.PROXY_KEY, proxy);
                    }

                    // 为服务提供类(ref)生成 Invoker
                    Invoker<?> invoker = proxyFactory.getInvoker(ref, (Class) interfaceClass, registryURL.addParameterAndEncoded(Constants.EXPORT_KEY, url.toFullString()));
                    // DelegateProviderMetaDataInvoker 用于持有 Invoker 和 ServiceConfig
                    DelegateProviderMetaDataInvoker wrapperInvoker = new DelegateProviderMetaDataInvoker(invoker, this);

                    // 导出服务，并生成 Exporter
                    Exporter<?> exporter = protocol.export(wrapperInvoker);
                    exporters.add(exporter);
                }
                
            // 不存在注册中心，仅导出服务
            } else {
                Invoker<?> invoker = proxyFactory.getInvoker(ref, (Class) interfaceClass, url);
                DelegateProviderMetaDataInvoker wrapperInvoker = new DelegateProviderMetaDataInvoker(invoker, this);

                Exporter<?> exporter = protocol.export(wrapperInvoker);
                exporters.add(exporter);
            }
        }
    }
    this.urls.add(url);
}
```

上面代码根据 url 中的 scope 参数决定服务导出方式，分别如下：

- scope = none，不导出服务
- scope != remote，导出到本地
- scope != local，导出到远程

不管是导出到本地，还是远程。进行服务导出之前，均需要先创建 Invoker，这是一个很重要的步骤。因此下面先来分析 Invoker 的创建过程。

### 2.2.1 Invoker 创建过程

在 Dubbo 中，Invoker 是一个非常重要的模型。在服务提供端，以及服务引用端均会出现 Invoker。Dubbo 官方文档中对 Invoker 进行了说明，这里引用一下。

> Invoker 是实体域，它是 Dubbo 的核心模型，其它模型都向它靠扰，或转换成它，它代表一个可执行体，可向它发起 invoke 调用，它有可能是一个本地的实现，也可能是一个远程的实现，也可能一个集群实现。

既然 Invoker 如此重要，那么我们很有必要搞清楚 Invoker 的用途。Invoker 是由 ProxyFactory 创建而来，Dubbo 默认的 ProxyFactory 实现类是 JavassistProxyFactory。下面我们到 JavassistProxyFactory 代码中，探索 Invoker 的创建过程。如下：

```java
public <T> Invoker<T> getInvoker(T proxy, Class<T> type, URL url) {
	// 为目标类创建 Wrapper
    final Wrapper wrapper = Wrapper.getWrapper(proxy.getClass().getName().indexOf('$') < 0 ? proxy.getClass() : type);
    // 创建匿名 Invoker 类对象，并实现 doInvoke 方法。
    return new AbstractProxyInvoker<T>(proxy, type, url) {
        @Override
        protected Object doInvoke(T proxy, String methodName,
                                  Class<?>[] parameterTypes,
                                  Object[] arguments) throws Throwable {
			// 调用 Wrapper 的 invokeMethod 方法，invokeMethod 最终会调用目标方法
            return wrapper.invokeMethod(proxy, methodName, parameterTypes, arguments);
        }
    };
}
```

如上，JavassistProxyFactory 创建了一个继承自 AbstractProxyInvoker 类的匿名对象，并覆写了抽象方法 doInvoke。覆写后的 doInvoke 逻辑比较简单，仅是将调用请求转发给了 Wrapper 类的 invokeMethod 方法。Wrapper 用于“包裹”目标类，Wrapper 是一个抽象类，仅可通过 getWrapper(Class) 方法创建子类。在创建 Wrapper 子类的过程中，子类代码生成逻辑会对 getWrapper 方法传入的 Class 对象进行解析，拿到诸如类方法，类成员变量等信息。以及生成 invokeMethod 方法代码和其他一些方法代码。代码生成完毕后，通过 Javassist 生成 Class 对象，最后再通过反射创建 Wrapper 实例。相关的代码如下：

```java
 public static Wrapper getWrapper(Class<?> c) {	
    while (ClassGenerator.isDynamicClass(c))
        c = c.getSuperclass();

    if (c == Object.class)
        return OBJECT_WRAPPER;

    // 从缓存中获取 Wrapper 实例
    Wrapper ret = WRAPPER_MAP.get(c);
    if (ret == null) {
        // 缓存未命中，创建 Wrapper
        ret = makeWrapper(c);
        // 写入缓存
        WRAPPER_MAP.put(c, ret);
    }
    return ret;
}
```

getWrapper 方法仅包含一些缓存操作逻辑，不难理解。下面我们看一下 makeWrapper 方法。

```java
private static Wrapper makeWrapper(Class<?> c) {
    // 检测 c 是否为基本类型，若是则抛出异常
    if (c.isPrimitive())
        throw new IllegalArgumentException("Can not create wrapper for primitive type: " + c);

    String name = c.getName();
    ClassLoader cl = ClassHelper.getClassLoader(c);

    // c1 用于存储 setPropertyValue 方法代码
    StringBuilder c1 = new StringBuilder("public void setPropertyValue(Object o, String n, Object v){ ");
    // c2 用于存储 getPropertyValue 方法代码
    StringBuilder c2 = new StringBuilder("public Object getPropertyValue(Object o, String n){ ");
    // c3 用于存储 invokeMethod 方法代码
    StringBuilder c3 = new StringBuilder("public Object invokeMethod(Object o, String n, Class[] p, Object[] v) throws " + InvocationTargetException.class.getName() + "{ ");

    // 生成类型转换代码及异常捕捉代码，比如：
    //   DemoService w; try { w = ((DemoServcie) $1); }}catch(Throwable e){ throw new IllegalArgumentException(e); }
    c1.append(name).append(" w; try{ w = ((").append(name).append(")$1); }catch(Throwable e){ throw new IllegalArgumentException(e); }");
    c2.append(name).append(" w; try{ w = ((").append(name).append(")$1); }catch(Throwable e){ throw new IllegalArgumentException(e); }");
    c3.append(name).append(" w; try{ w = ((").append(name).append(")$1); }catch(Throwable e){ throw new IllegalArgumentException(e); }");

    // pts 用于存储成员变量名和类型
    Map<String, Class<?>> pts = new HashMap<String, Class<?>>();
    // ms 用于存储方法描述信息（可理解为方法签名）及 Method 实例
    Map<String, Method> ms = new LinkedHashMap<String, Method>();
    // mns 为方法名列表
    List<String> mns = new ArrayList<String>();
    // dmns 用于存储“定义在当前类中的方法”的名称
    List<String> dmns = new ArrayList<String>();

    // --------------------------------✨ 分割线1 ✨-------------------------------------

    // 获取 public 访问级别的字段，并为所有字段生成条件判断语句
    for (Field f : c.getFields()) {
        String fn = f.getName();
        Class<?> ft = f.getType();
        if (Modifier.isStatic(f.getModifiers()) || Modifier.isTransient(f.getModifiers()))
            // 忽略关键字 static 或 transient 修饰的变量
            continue;

        // 生成条件判断及赋值语句，比如：
        // if( $2.equals("name") ) { w.name = (java.lang.String) $3; return;}
        // if( $2.equals("age") ) { w.age = ((Number) $3).intValue(); return;}
        c1.append(" if( $2.equals(\"").append(fn).append("\") ){ w.").append(fn).append("=").append(arg(ft, "$3")).append("; return; }");

        // 生成条件判断及返回语句，比如：
        // if( $2.equals("name") ) { return ($w)w.name; }
        c2.append(" if( $2.equals(\"").append(fn).append("\") ){ return ($w)w.").append(fn).append("; }");

        // 存储 <字段名, 字段类型> 键值对到 pts 中
        pts.put(fn, ft);
    }

    // --------------------------------✨ 分割线2 ✨-------------------------------------

    Method[] methods = c.getMethods();
    // 检测 c 中是否包含在当前类中声明的方法
    boolean hasMethod = hasMethods(methods);
    if (hasMethod) {
        c3.append(" try{");
    }
    for (Method m : methods) {
        if (m.getDeclaringClass() == Object.class)
            // 忽略 Object 中定义的方法
            continue;

        String mn = m.getName();
        // 生成方法名判断语句，比如：
        // if ( "sayHello".equals( $2 )
        c3.append(" if( \"").append(mn).append("\".equals( $2 ) ");
        int len = m.getParameterTypes().length;
        // 生成“运行时传入的参数数量与方法参数列表长度”判断语句，比如：
        // && $3.length == 2
        c3.append(" && ").append(" $3.length == ").append(len);

        boolean override = false;
        for (Method m2 : methods) {
            // 检测方法是否存在重载情况，条件为：方法对象不同 && 方法名相同
            if (m != m2 && m.getName().equals(m2.getName())) {
                override = true;
                break;
            }
        }
        // 对重载方法进行处理，考虑下面的方法：
        //    1. void sayHello(Integer, String)
        //    2. void sayHello(Integer, Integer)
        // 方法名相同，参数列表长度也相同，因此不能仅通过这两项判断两个方法是否相等。
        // 需要进一步判断方法的参数类型
        if (override) {
            if (len > 0) {
                for (int l = 0; l < len; l++) {
                    // 生成参数类型进行检测代码，比如：
                    // && $3[0].getName().equals("java.lang.Integer") 
                    //    && $3[1].getName().equals("java.lang.String")
                    c3.append(" && ").append(" $3[").append(l).append("].getName().equals(\"")
                            .append(m.getParameterTypes()[l].getName()).append("\")");
                }
            }
        }

        // 添加 ) {，完成方法判断语句，此时生成的代码可能如下（已格式化）：
        // if ("sayHello".equals($2) 
        //     && $3.length == 2
        //     && $3[0].getName().equals("java.lang.Integer") 
        //     && $3[1].getName().equals("java.lang.String")) {
        c3.append(" ) { ");

        // 根据返回值类型生成目标方法调用语句
        if (m.getReturnType() == Void.TYPE)
            // w.sayHello((java.lang.Integer)$4[0], (java.lang.String)$4[1]); return null;
            c3.append(" w.").append(mn).append('(').append(args(m.getParameterTypes(), "$4")).append(");").append(" return null;");
        else
            // return w.sayHello((java.lang.Integer)$4[0], (java.lang.String)$4[1]);
            c3.append(" return ($w)w.").append(mn).append('(').append(args(m.getParameterTypes(), "$4")).append(");");

        // 添加 }, 生成的代码形如（已格式化）：
        // if ("sayHello".equals($2) 
        //     && $3.length == 2
        //     && $3[0].getName().equals("java.lang.Integer") 
        //     && $3[1].getName().equals("java.lang.String")) {
        //
        //     w.sayHello((java.lang.Integer)$4[0], (java.lang.String)$4[1]); 
        //     return null;
        // }
        c3.append(" }");

        // 添加方法名到 mns 集合中
        mns.add(mn);
        // 检测当前方法是否在 c 中被声明的
        if (m.getDeclaringClass() == c)
            // 若是，则将当前方法名添加到 dmns 中
            dmns.add(mn);
        ms.put(ReflectUtils.getDesc(m), m);
    }
    if (hasMethod) {
        // 添加异常捕捉语句
        c3.append(" } catch(Throwable e) { ");
        c3.append("     throw new java.lang.reflect.InvocationTargetException(e); ");
        c3.append(" }");
    }

    // 添加 NoSuchMethodException 异常抛出代码
    c3.append(" throw new " + NoSuchMethodException.class.getName() + "(\"Not found method \\\"\"+$2+\"\\\" in class " + c.getName() + ".\"); }");

    // --------------------------------✨ 分割线3 ✨-------------------------------------

    Matcher matcher;
    // 处理 get/set 方法
    for (Map.Entry<String, Method> entry : ms.entrySet()) {
        String md = entry.getKey();
        Method method = (Method) entry.getValue();
        // 匹配以 get 开头的方法
        if ((matcher = ReflectUtils.GETTER_METHOD_DESC_PATTERN.matcher(md)).matches()) {
            // 获取属性名
            String pn = propertyName(matcher.group(1));
            // 生成属性判断以及返回语句，示例如下：
            // if( $2.equals("name") ) { return ($w).w.getName(); }
            c2.append(" if( $2.equals(\"").append(pn).append("\") ){ return ($w)w.").append(method.getName()).append("(); }");
            pts.put(pn, method.getReturnType());

        // 匹配以 is/has/can 开头的方法
        } else if ((matcher = ReflectUtils.IS_HAS_CAN_METHOD_DESC_PATTERN.matcher(md)).matches()) {
            String pn = propertyName(matcher.group(1));
            // 生成属性判断以及返回语句，示例如下：
            // if( $2.equals("dream") ) { return ($w).w.hasDream(); }
            c2.append(" if( $2.equals(\"").append(pn).append("\") ){ return ($w)w.").append(method.getName()).append("(); }");
            pts.put(pn, method.getReturnType());

        // 匹配以 set 开头的方法
        } else if ((matcher = ReflectUtils.SETTER_METHOD_DESC_PATTERN.matcher(md)).matches()) {
            Class<?> pt = method.getParameterTypes()[0];
            String pn = propertyName(matcher.group(1));
            // 生成属性判断以及 setter 调用语句，示例如下：
            // if( $2.equals("name") ) { w.setName((java.lang.String)$3); return; }
            c1.append(" if( $2.equals(\"").append(pn).append("\") ){ w.").append(method.getName()).append("(").append(arg(pt, "$3")).append("); return; }");
            pts.put(pn, pt);
        }
    }

    // 添加 NoSuchPropertyException 异常抛出代码
    c1.append(" throw new " + NoSuchPropertyException.class.getName() + "(\"Not found property \\\"\"+$2+\"\\\" filed or setter method in class " + c.getName() + ".\"); }");
    c2.append(" throw new " + NoSuchPropertyException.class.getName() + "(\"Not found property \\\"\"+$2+\"\\\" filed or setter method in class " + c.getName() + ".\"); }");

    // --------------------------------✨ 分割线4 ✨-------------------------------------

    long id = WRAPPER_CLASS_COUNTER.getAndIncrement();
    // 创建类生成器
    ClassGenerator cc = ClassGenerator.newInstance(cl);
    // 设置类名及超类
    cc.setClassName((Modifier.isPublic(c.getModifiers()) ? Wrapper.class.getName() : c.getName() + "$sw") + id);
    cc.setSuperClass(Wrapper.class);

    // 添加默认构造方法
    cc.addDefaultConstructor();

    // 添加字段
    cc.addField("public static String[] pns;");
    cc.addField("public static " + Map.class.getName() + " pts;");
    cc.addField("public static String[] mns;");
    cc.addField("public static String[] dmns;");
    for (int i = 0, len = ms.size(); i < len; i++)
        cc.addField("public static Class[] mts" + i + ";");

    // 添加方法代码
    cc.addMethod("public String[] getPropertyNames(){ return pns; }");
    cc.addMethod("public boolean hasProperty(String n){ return pts.containsKey($1); }");
    cc.addMethod("public Class getPropertyType(String n){ return (Class)pts.get($1); }");
    cc.addMethod("public String[] getMethodNames(){ return mns; }");
    cc.addMethod("public String[] getDeclaredMethodNames(){ return dmns; }");
    cc.addMethod(c1.toString());
    cc.addMethod(c2.toString());
    cc.addMethod(c3.toString());

    try {
        // 生成类
        Class<?> wc = cc.toClass();
        
        // 设置字段值
        wc.getField("pts").set(null, pts);
        wc.getField("pns").set(null, pts.keySet().toArray(new String[0]));
        wc.getField("mns").set(null, mns.toArray(new String[0]));
        wc.getField("dmns").set(null, dmns.toArray(new String[0]));
        int ix = 0;
        for (Method m : ms.values())
            wc.getField("mts" + ix++).set(null, m.getParameterTypes());

        // 创建 Wrapper 实例
        return (Wrapper) wc.newInstance();
    } catch (RuntimeException e) {
        throw e;
    } catch (Throwable e) {
        throw new RuntimeException(e.getMessage(), e);
    } finally {
        cc.release();
        ms.clear();
        mns.clear();
        dmns.clear();
    }
}
```

上面代码很长，大家耐心看一下。我们在上面代码中做了大量的注释，并按功能对代码进行了分块，以帮助大家理解代码逻辑。下面对这段代码进行讲解。首先我们把目光移到分割线1之上的代码，这段代码主要用于进行一些初始化操作。比如创建 c1、c2、c3 以及 pts、ms、mns 等变量，以及向  c1、c2、c3 中添加方法定义和类型转换代码。接下来是分割线1到分割线2之间的代码，这段代码用于为 public 级别的字段生成条件判断取值与赋值代码。这段代码不是很难看懂，就不多说了。继续向下看，分割线2和分隔线3之间的代码用于为定义在当前类中的方法生成判断语句，和方法调用语句。因为需要对方法重载进行校验，因此到这这段代码看起来有点复杂。不过耐心看一下，也不是很难理解。接下来是分割线3和分隔线4之间的代码，这段代码用于处理 getter、setter 以及以 is/has/can 开头的方法。处理方式是通过正则表达式获取方法类型（get/set/is/...），以及属性名。之后为属性名生成判断语句，然后为方法生成调用语句。最后我们再来看一下分隔线4以下的代码，这段代码通过 ClassGenerator 为刚刚生成的代码构建 Class 类，并通过反射创建对象。ClassGenerator 是 Dubbo 自己封装的，该类的核心是 toClass() 的重载方法 toClass(ClassLoader, ProtectionDomain)，该方法通过 javassist 构建 Class。这里就不分析 toClass 方法了，大家请自行分析。

阅读 Wrapper 类代码需要对 javassist 框架有所了解。关于 javassist，大家如果不熟悉，请自行查阅资料，本节不打算介绍 javassist 相关内容。

好了，关于 Wrapper 类生成过程就分析到这。如果大家看的不是很明白，可以单独为 Wrapper 创建单元测试，然后单步调试。并将生成的代码拷贝出来，格式化后再进行观察和理解。

### 2.2.2 导出服务到本地

本节我们来看一下服务导出相关的代码，按照代码执行顺序，本节先来分析导出服务到本地的过程。相关代码如下：

```java
private void exportLocal(URL url) {
    // 如果 URL 的协议头等于 injvm，说明已经导出到本地了，无需再次导出
    if (!Constants.LOCAL_PROTOCOL.equalsIgnoreCase(url.getProtocol())) {
        URL local = URL.valueOf(url.toFullString())
            .setProtocol(Constants.LOCAL_PROTOCOL)    // 设置协议头为 injvm
            .setHost(LOCALHOST)
            .setPort(0);
        ServiceClassHolder.getInstance().pushServiceClass(getServiceClass(ref));
        // 创建 Invoker，并导出服务，这里的 protocol 会在运行时调用 InjvmProtocol 的 export 方法
        Exporter<?> exporter = protocol.export(
            proxyFactory.getInvoker(ref, (Class) interfaceClass, local));
        exporters.add(exporter);
    }
}
```

exportLocal 方法比较简单，首先根据 URL 协议头决定是否导出服务。若需导出，则创建一个新的 URL 并将协议头、主机名以及端口设置成新的值。然后创建 Invoker，并调用 InjvmProtocol 的 export 方法导出服务。下面我们来看一下 InjvmProtocol 的 export 方法都做了哪些事情。

```java
public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
    // 创建 InjvmExporter
    return new InjvmExporter<T>(invoker, invoker.getUrl().getServiceKey(), exporterMap);
}
```

如上，InjvmProtocol 的 export 方法仅创建了一个 InjvmExporter，无其他逻辑。到此导出服务到本地就分析完了，接下来，我们继续分析导出服务到远程的过程。

### 2.2.3 导出服务到远程

与导出服务到本地相比，导出服务到远程的过程要复杂不少，其包含了服务导出与服务注册两个过程。这两个过程涉及到了大量的调用，比较复杂。按照代码执行顺序，本节先来分析服务导出逻辑，服务注册逻辑将在下一节进行分析。下面开始分析，我们把目光移动到 RegistryProtocol 的 export 方法上。

```java
public <T> Exporter<T> export(final Invoker<T> originInvoker) throws RpcException {
    // 导出服务
    final ExporterChangeableWrapper<T> exporter = doLocalExport(originInvoker);

    // 获取注册中心 URL，以 zookeeper 注册中心为例，得到的示例 URL 如下：
    // zookeeper://127.0.0.1:2181/com.alibaba.dubbo.registry.RegistryService?application=demo-provider&dubbo=2.0.2&export=dubbo%3A%2F%2F172.17.48.52%3A20880%2Fcom.alibaba.dubbo.demo.DemoService%3Fanyhost%3Dtrue%26application%3Ddemo-provider
    URL registryUrl = getRegistryUrl(originInvoker);

    // 根据 URL 加载 Registry 实现类，比如 ZookeeperRegistry
    final Registry registry = getRegistry(originInvoker);
    
    // 获取已注册的服务提供者 URL，比如：
    // dubbo://172.17.48.52:20880/com.alibaba.dubbo.demo.DemoService?anyhost=true&application=demo-provider&dubbo=2.0.2&generic=false&interface=com.alibaba.dubbo.demo.DemoService&methods=sayHello
    final URL registeredProviderUrl = getRegisteredProviderUrl(originInvoker);

    // 获取 register 参数
    boolean register = registeredProviderUrl.getParameter("register", true);

    // 向服务提供者与消费者注册表中注册服务提供者
    ProviderConsumerRegTable.registerProvider(originInvoker, registryUrl, registeredProviderUrl);

    // 根据 register 的值决定是否注册服务
    if (register) {
        // 向注册中心注册服务
        register(registryUrl, registeredProviderUrl);
        ProviderConsumerRegTable.getProviderWrapper(originInvoker).setReg(true);
    }

    // 获取订阅 URL，比如：
    // provider://172.17.48.52:20880/com.alibaba.dubbo.demo.DemoService?category=configurators&check=false&anyhost=true&application=demo-provider&dubbo=2.0.2&generic=false&interface=com.alibaba.dubbo.demo.DemoService&methods=sayHello
    final URL overrideSubscribeUrl = getSubscribedOverrideUrl(registeredProviderUrl);
    // 创建监听器
    final OverrideListener overrideSubscribeListener = new OverrideListener(overrideSubscribeUrl, originInvoker);
    overrideListeners.put(overrideSubscribeUrl, overrideSubscribeListener);
    // 向注册中心进行订阅 override 数据
    registry.subscribe(overrideSubscribeUrl, overrideSubscribeListener);
    // 创建并返回 DestroyableExporter
    return new DestroyableExporter<T>(exporter, originInvoker, overrideSubscribeUrl, registeredProviderUrl);
}
```

上面代码看起来比较复杂，主要做如下一些操作：

1. 调用 doLocalExport 导出服务
2. 向注册中心注册服务
3. 向注册中心进行订阅 override 数据
4. 创建并返回 DestroyableExporter

在以上操作中，除了创建并返回 DestroyableExporter 没什么难度外，其他几步操作都不是很简单。这其中，导出服务和注册服务是本章要重点分析的逻辑。 订阅 override 数据并非本文重点内容，后面会简单介绍一下。下面先来分析 doLocalExport 方法的逻辑，如下：

```java
private <T> ExporterChangeableWrapper<T> doLocalExport(final Invoker<T> originInvoker) {
    String key = getCacheKey(originInvoker);
    // 访问缓存
    ExporterChangeableWrapper<T> exporter = (ExporterChangeableWrapper<T>) bounds.get(key);
    if (exporter == null) {
        synchronized (bounds) {
            exporter = (ExporterChangeableWrapper<T>) bounds.get(key);
            if (exporter == null) {
                // 创建 Invoker 为委托类对象
                final Invoker<?> invokerDelegete = new InvokerDelegete<T>(originInvoker, getProviderUrl(originInvoker));
                // 调用 protocol 的 export 方法导出服务
                exporter = new ExporterChangeableWrapper<T>((Exporter<T>) protocol.export(invokerDelegete), originInvoker);
                
                // 写缓存
                bounds.put(key, exporter);
            }
        }
    }
    return exporter;
}
```

上面的代码是典型的双重检查锁，大家在阅读 Dubbo 的源码中，会多次见到。接下来，我们把重点放在 Protocol 的 export 方法上。假设运行时协议为 dubbo，此处的 protocol 变量会在运行时加载 DubboProtocol，并调用 DubboProtocol 的 export 方法。所以，接下来我们目光转移到 DubboProtocol 的 export 方法上，相关分析如下：

```java
public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
    URL url = invoker.getUrl();

    // 获取服务标识，理解成服务坐标也行。由服务组名，服务名，服务版本号以及端口组成。比如：
    // demoGroup/com.alibaba.dubbo.demo.DemoService:1.0.1:20880
    String key = serviceKey(url);
    // 创建 DubboExporter
    DubboExporter<T> exporter = new DubboExporter<T>(invoker, key, exporterMap);
    // 将 <key, exporter> 键值对放入缓存中
    exporterMap.put(key, exporter);

    // 本地存根相关代码
    Boolean isStubSupportEvent = url.getParameter(Constants.STUB_EVENT_KEY, Constants.DEFAULT_STUB_EVENT);
    Boolean isCallbackservice = url.getParameter(Constants.IS_CALLBACK_SERVICE, false);
    if (isStubSupportEvent && !isCallbackservice) {
        String stubServiceMethods = url.getParameter(Constants.STUB_EVENT_METHODS_KEY);
        if (stubServiceMethods == null || stubServiceMethods.length() == 0) {
            // 省略日志打印代码
        } else {
            stubServiceMethodsMap.put(url.getServiceKey(), stubServiceMethods);
        }
    }

    // 启动服务器
    openServer(url);
    // 优化序列化
    optimizeSerialization(url);
    return exporter;
}
```

如上，我们重点关注 DubboExporter 的创建以及 openServer 方法，其他逻辑看不懂也没关系，不影响理解服务导出过程。另外，DubboExporter 的代码比较简单，就不分析了。下面分析 openServer 方法。

```java
private void openServer(URL url) {
    // 获取 host:port，并将其作为服务器实例的 key，用于标识当前的服务器实例
    String key = url.getAddress();
    boolean isServer = url.getParameter(Constants.IS_SERVER_KEY, true);
    if (isServer) {
        // 访问缓存
        ExchangeServer server = serverMap.get(key);
        if (server == null) {
            // 创建服务器实例
            serverMap.put(key, createServer(url));
        } else {
            // 服务器已创建，则根据 url 中的配置重置服务器
            server.reset(url);
        }
    }
}
```

如上，在同一台机器上（单网卡），同一个端口上仅允许启动一个服务器实例。若某个端口上已有服务器实例，此时则调用 reset 方法重置服务器的一些配置。考虑到篇幅问题，关于服务器实例重置的代码就不分析了。接下来分析服务器实例的创建过程。如下：


```java
private ExchangeServer createServer(URL url) {
    url = url.addParameterIfAbsent(Constants.CHANNEL_READONLYEVENT_SENT_KEY,
    // 添加心跳检测配置到 url 中
    url = url.addParameterIfAbsent(Constants.HEARTBEAT_KEY, String.valueOf(Constants.DEFAULT_HEARTBEAT));
	// 获取 server 参数，默认为 netty
    String str = url.getParameter(Constants.SERVER_KEY, Constants.DEFAULT_REMOTING_SERVER);

	// 通过 SPI 检测是否存在 server 参数所代表的 Transporter 拓展，不存在则抛出异常
    if (str != null && str.length() > 0 && !ExtensionLoader.getExtensionLoader(Transporter.class).hasExtension(str))
        throw new RpcException("Unsupported server type: " + str + ", url: " + url);

    // 添加编码解码器参数
    url = url.addParameter(Constants.CODEC_KEY, DubboCodec.NAME);
    ExchangeServer server;
    try {
        // 创建 ExchangeServer
        server = Exchangers.bind(url, requestHandler);
    } catch (RemotingException e) {
        throw new RpcException("Fail to start server...");
    }
                                   
	// 获取 client 参数，可指定 netty，mina
    str = url.getParameter(Constants.CLIENT_KEY);
    if (str != null && str.length() > 0) {
        // 获取所有的 Transporter 实现类名称集合，比如 supportedTypes = [netty, mina]
        Set<String> supportedTypes = ExtensionLoader.getExtensionLoader(Transporter.class).getSupportedExtensions();
        // 检测当前 Dubbo 所支持的 Transporter 实现类名称列表中，
        // 是否包含 client 所表示的 Transporter，若不包含，则抛出异常
        if (!supportedTypes.contains(str)) {
            throw new RpcException("Unsupported client type...");
        }
    }
    return server;
}
```

如上，createServer 包含三个核心的逻辑。第一是检测是否存在 server 参数所代表的 Transporter 拓展，不存在则抛出异常。第二是创建服务器实例。第三是检测是否支持 client 参数所表示的 Transporter 拓展，不存在也是抛出异常。两次检测操作所对应的代码比较直白了，无需多说。但创建服务器的操作目前还不是很清晰，我们继续往下看。

```java
public static ExchangeServer bind(URL url, ExchangeHandler handler) throws RemotingException {
    if (url == null) {
        throw new IllegalArgumentException("url == null");
    }
    if (handler == null) {
        throw new IllegalArgumentException("handler == null");
    }
    url = url.addParameterIfAbsent(Constants.CODEC_KEY, "exchange");
    // 获取 Exchanger，默认为 HeaderExchanger。
    // 紧接着调用 HeaderExchanger 的 bind 方法创建 ExchangeServer 实例
    return getExchanger(url).bind(url, handler);
}
```

上面代码比较简单，就不多说了。下面看一下 HeaderExchanger 的 bind 方法。

```java
public ExchangeServer bind(URL url, ExchangeHandler handler) throws RemotingException {
	// 创建 HeaderExchangeServer 实例，该方法包含了多个逻辑，分别如下：
	//   1. new HeaderExchangeHandler(handler)
	//	 2. new DecodeHandler(new HeaderExchangeHandler(handler))
	//   3. Transporters.bind(url, new DecodeHandler(new HeaderExchangeHandler(handler)))
    return new HeaderExchangeServer(Transporters.bind(url, new DecodeHandler(new HeaderExchangeHandler(handler))));
}
```

HeaderExchanger 的 bind 方法包含的逻辑比较多，但目前我们仅需关心 Transporters 的 bind 方法逻辑即可。该方法的代码如下：

```java
public static Server bind(URL url, ChannelHandler... handlers) throws RemotingException {
    if (url == null) {
        throw new IllegalArgumentException("url == null");
    }
    if (handlers == null || handlers.length == 0) {
        throw new IllegalArgumentException("handlers == null");
    }
    ChannelHandler handler;
    if (handlers.length == 1) {
        handler = handlers[0];
    } else {
    	// 如果 handlers 元素数量大于1，则创建 ChannelHandler 分发器
        handler = new ChannelHandlerDispatcher(handlers);
    }
    // 获取自适应 Transporter 实例，并调用实例方法
    return getTransporter().bind(url, handler);
}
```

如上，getTransporter() 方法获取的 Transporter 是在运行时动态创建的，类名为 Transporter$Adaptive，也就是自适应拓展类。Transporter$Adaptive 会在运行时根据传入的 URL 参数决定加载什么类型的 Transporter，默认为 NettyTransporter。下面我们继续跟下去，这次分析的是 NettyTransporter 的 bind 方法。

```java
public Server bind(URL url, ChannelHandler listener) throws RemotingException {
	// 创建 NettyServer
	return new NettyServer(url, listener);
}
```

这里仅有一句创建 NettyServer 的代码，无需多说，我们继续向下看。

```java
public class NettyServer extends AbstractServer implements Server {
    public NettyServer(URL url, ChannelHandler handler) throws RemotingException {
        // 调用父类构造方法
        super(url, ChannelHandlers.wrap(handler, ExecutorUtil.setThreadName(url, SERVER_THREAD_POOL_NAME)));
    }
}


public abstract class AbstractServer extends AbstractEndpoint implements Server {
    public AbstractServer(URL url, ChannelHandler handler) throws RemotingException {
        // 调用父类构造方法，这里就不用跟进去了，没什么复杂逻辑
        super(url, handler);
        localAddress = getUrl().toInetSocketAddress();

        // 获取 ip 和端口
        String bindIp = getUrl().getParameter(Constants.BIND_IP_KEY, getUrl().getHost());
        int bindPort = getUrl().getParameter(Constants.BIND_PORT_KEY, getUrl().getPort());
        if (url.getParameter(Constants.ANYHOST_KEY, false) || NetUtils.isInvalidLocalHost(bindIp)) {
            // 设置 ip 为 0.0.0.0
            bindIp = NetUtils.ANYHOST;
        }
        bindAddress = new InetSocketAddress(bindIp, bindPort);
        // 获取最大可接受连接数
        this.accepts = url.getParameter(Constants.ACCEPTS_KEY, Constants.DEFAULT_ACCEPTS);
        this.idleTimeout = url.getParameter(Constants.IDLE_TIMEOUT_KEY, Constants.DEFAULT_IDLE_TIMEOUT);
        try {
            // 调用模板方法 doOpen 启动服务器
            doOpen();
        } catch (Throwable t) {
            throw new RemotingException("Failed to bind ");
        }

        DataStore dataStore = ExtensionLoader.getExtensionLoader(DataStore.class).getDefaultExtension();
        executor = (ExecutorService) dataStore.get(Constants.EXECUTOR_SERVICE_COMPONENT_KEY, Integer.toString(url.getPort()));
    }
    
    protected abstract void doOpen() throws Throwable;

    protected abstract void doClose() throws Throwable;
}
```

上面代码多为赋值代码，不需要多讲。我们重点关注 doOpen 抽象方法，该方法需要子类实现。下面回到 NettyServer 中。

```java
protected void doOpen() throws Throwable {
    NettyHelper.setNettyLoggerFactory();
    // 创建 boss 和 worker 线程池
    ExecutorService boss = Executors.newCachedThreadPool(new NamedThreadFactory("NettyServerBoss", true));
    ExecutorService worker = Executors.newCachedThreadPool(new NamedThreadFactory("NettyServerWorker", true));
    ChannelFactory channelFactory = new NioServerSocketChannelFactory(boss, worker, getUrl().getPositiveParameter(Constants.IO_THREADS_KEY, Constants.DEFAULT_IO_THREADS));
    
    // 创建 ServerBootstrap
    bootstrap = new ServerBootstrap(channelFactory);

    final NettyHandler nettyHandler = new NettyHandler(getUrl(), this);
    channels = nettyHandler.getChannels();
    bootstrap.setOption("child.tcpNoDelay", true);
    // 设置 PipelineFactory
    bootstrap.setPipelineFactory(new ChannelPipelineFactory() {
        @Override
        public ChannelPipeline getPipeline() {
            NettyCodecAdapter adapter = new NettyCodecAdapter(getCodec(), getUrl(), NettyServer.this);
            ChannelPipeline pipeline = Channels.pipeline();
            pipeline.addLast("decoder", adapter.getDecoder());
            pipeline.addLast("encoder", adapter.getEncoder());
            pipeline.addLast("handler", nettyHandler);
            return pipeline;
        }
    });
    // 绑定到指定的 ip 和端口上
    channel = bootstrap.bind(getBindAddress());
}
```

以上就是 NettyServer 创建的过程，dubbo 默认使用的 NettyServer 是基于 netty 3.x 版本实现的，比较老了。因此 Dubbo 另外提供了 netty 4.x 版本的 NettyServer，大家可在使用 Dubbo 的过程中按需进行配置。

到此，关于服务导出的过程就分析完了。整个过程比较复杂，大家在分析的过程中耐心一些。并且多写 Demo 进行调试，以便能够更好的理解代码逻辑。

本节内容先到这里，接下来分析服务导出的另一块逻辑 — 服务注册。

### 2.2.4 服务注册

本节我们来分析服务注册过程，服务注册操作对于 Dubbo 来说不是必需的，通过服务直连的方式就可以绕过注册中心。但通常我们不会这么做，直连方式不利于服务治理，仅推荐在测试服务时使用。对于 Dubbo 来说，注册中心虽不是必需，但却是必要的。因此，关于注册中心以及服务注册相关逻辑，我们也需要搞懂。

本节内容以 Zookeeper 注册中心作为分析目标，其他类型注册中心大家可自行分析。下面从服务注册的入口方法开始分析，我们把目光再次移到 RegistryProtocol 的 export 方法上。如下：

```java
public <T> Exporter<T> export(final Invoker<T> originInvoker) throws RpcException {
    
    // ${导出服务}
    
    // 省略其他代码
    
    boolean register = registeredProviderUrl.getParameter("register", true);
    if (register) {
        // 注册服务
        register(registryUrl, registeredProviderUrl);
        ProviderConsumerRegTable.getProviderWrapper(originInvoker).setReg(true);
    }
    
    final URL overrideSubscribeUrl = getSubscribedOverrideUrl(registeredProviderUrl);
    final OverrideListener overrideSubscribeListener = new OverrideListener(overrideSubscribeUrl, originInvoker);
    overrideListeners.put(overrideSubscribeUrl, overrideSubscribeListener);
    // 订阅 override 数据
    registry.subscribe(overrideSubscribeUrl, overrideSubscribeListener);

    // 省略部分代码
}
```

RegistryProtocol 的 export 方法包含了服务导出，注册，以及数据订阅等逻辑。其中服务导出逻辑上一节已经分析过了，本节将分析服务注册逻辑，相关代码如下：

```java
public void register(URL registryUrl, URL registedProviderUrl) {
    // 获取 Registry
    Registry registry = registryFactory.getRegistry(registryUrl);
    // 注册服务
    registry.register(registedProviderUrl);
}
```

register 方法包含两步操作，第一步是获取注册中心实例，第二步是向注册中心注册服务。接下来分两节内容对这两步操作进行分析。

#### 2.2.4.1 创建注册中心

本节内容以 Zookeeper 注册中心为例进行分析。下面先来看一下 getRegistry 方法的源码，这个方法由 AbstractRegistryFactory 实现。如下：

```java
public Registry getRegistry(URL url) {
    url = url.setPath(RegistryService.class.getName())
            .addParameter(Constants.INTERFACE_KEY, RegistryService.class.getName())
            .removeParameters(Constants.EXPORT_KEY, Constants.REFER_KEY);
    String key = url.toServiceString();
    LOCK.lock();
    try {
    	// 访问缓存
        Registry registry = REGISTRIES.get(key);
        if (registry != null) {
            return registry;
        }
        
        // 缓存未命中，创建 Registry 实例
        registry = createRegistry(url);
        if (registry == null) {
            throw new IllegalStateException("Can not create registry...");
        }
        
        // 写入缓存
        REGISTRIES.put(key, registry);
        return registry;
    } finally {
        LOCK.unlock();
    }
}

protected abstract Registry createRegistry(URL url);
```

如上，getRegistry 方法先访问缓存，缓存未命中则调用 createRegistry 创建 Registry，然后写入缓存。这里的 createRegistry 是一个模板方法，由具体的子类实现。因此，下面我们到 ZookeeperRegistryFactory 中探究一番。

```java
public class ZookeeperRegistryFactory extends AbstractRegistryFactory {

    // zookeeperTransporter 由 SPI 在运行时注入，类型为 ZookeeperTransporter$Adaptive
    private ZookeeperTransporter zookeeperTransporter;

    public void setZookeeperTransporter(ZookeeperTransporter zookeeperTransporter) {
        this.zookeeperTransporter = zookeeperTransporter;
    }

    @Override
    public Registry createRegistry(URL url) {
        // 创建 ZookeeperRegistry
        return new ZookeeperRegistry(url, zookeeperTransporter);
    }
}
```

ZookeeperRegistryFactory 的 createRegistry 方法仅包含一句代码，无需解释，继续跟下去。


```java
public ZookeeperRegistry(URL url, ZookeeperTransporter zookeeperTransporter) {
    super(url);
    if (url.isAnyHost()) {
        throw new IllegalStateException("registry address == null");
    }
    
    // 获取组名，默认为 dubbo
    String group = url.getParameter(Constants.GROUP_KEY, DEFAULT_ROOT);
    if (!group.startsWith(Constants.PATH_SEPARATOR)) {
        // group = "/" + group
        group = Constants.PATH_SEPARATOR + group;
    }
    this.root = group;
    // 创建 Zookeeper 客户端，默认为 CuratorZookeeperTransporter
    zkClient = zookeeperTransporter.connect(url);
    // 添加状态监听器
    zkClient.addStateListener(new StateListener() {
        @Override
        public void stateChanged(int state) {
            if (state == RECONNECTED) {
                try {
                    recover();
                } catch (Exception e) {
                    logger.error(e.getMessage(), e);
                }
            }
        }
    });
}
```

在上面的代码代码中，我们重点关注 ZookeeperTransporter 的 connect 方法调用，这个方法用于创建 Zookeeper 客户端。创建好 Zookeeper 客户端，意味着注册中心的创建过程就结束了。接下来，再来分析一下 Zookeeper 客户端的创建过程。

前面说过，这里的 zookeeperTransporter 类型为自适应拓展类，因此 connect 方法会在被调用时决定加载什么类型的 ZookeeperTransporter 拓展，默认为 CuratorZookeeperTransporter。下面我们到 CuratorZookeeperTransporter 中看一看。

```java
public ZookeeperClient connect(URL url) {
    // 创建 CuratorZookeeperClient
    return new CuratorZookeeperClient(url);
}
```

继续向下看。

```java
public class CuratorZookeeperClient extends AbstractZookeeperClient<CuratorWatcher> {

    private final CuratorFramework client;
    
    public CuratorZookeeperClient(URL url) {
        super(url);
        try {
            // 创建 CuratorFramework 构造器
            CuratorFrameworkFactory.Builder builder = CuratorFrameworkFactory.builder()
                    .connectString(url.getBackupAddress())
                    .retryPolicy(new RetryNTimes(1, 1000))
                    .connectionTimeoutMs(5000);
            String authority = url.getAuthority();
            if (authority != null && authority.length() > 0) {
                builder = builder.authorization("digest", authority.getBytes());
            }
            // 构建 CuratorFramework 实例
            client = builder.build();
            // 添加监听器
            client.getConnectionStateListenable().addListener(new ConnectionStateListener() {
                @Override
                public void stateChanged(CuratorFramework client, ConnectionState state) {
                    if (state == ConnectionState.LOST) {
                        CuratorZookeeperClient.this.stateChanged(StateListener.DISCONNECTED);
                    } else if (state == ConnectionState.CONNECTED) {
                        CuratorZookeeperClient.this.stateChanged(StateListener.CONNECTED);
                    } else if (state == ConnectionState.RECONNECTED) {
                        CuratorZookeeperClient.this.stateChanged(StateListener.RECONNECTED);
                    }
                }
            });
            
            // 启动客户端
            client.start();
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage(), e);
        }
    }
}
```

CuratorZookeeperClient 构造方法主要用于创建和启动 CuratorFramework 实例。以上基本上都是 Curator 框架的代码，大家如果对 Curator 框架不是很了解，可以参考 Curator 官方文档。

本节分析了 ZookeeperRegistry 实例的创建过程，整个过程并不是很复杂。大家在看完分析后，可以自行调试，以加深理解。现在注册中心实例创建好了，接下来要做的事情是向注册中心注册服务，我们继续往下看。

#### 2.2.4.2 节点创建

以 Zookeeper 为例，所谓的服务注册，本质上是将服务配置数据写入到 Zookeeper 的某个路径的节点下。为了让大家有一个直观的了解，下面我们将 Dubbo 的 demo 跑起来，然后通过 Zookeeper 可视化客户端 [ZooInspector](https://github.com/apache/zookeeper/tree/b79af153d0f98a4f3f3516910ed47234d7b3d74e/src/contrib/zooinspector) 查看节点数据。如下：

![img](/imgs/dev/service-registry.png)

从上图中可以看到 com.alibaba.dubbo.demo.DemoService 这个服务对应的配置信息（存储在 URL 中）最终被注册到了 /dubbo/com.alibaba.dubbo.demo.DemoService/providers/ 节点下。搞懂了服务注册的本质，那么接下来我们就可以去阅读服务注册的代码了。服务注册的接口为 register(URL)，这个方法定义在 FailbackRegistry 抽象类中。代码如下：

```java
public void register(URL url) {
    super.register(url);
    failedRegistered.remove(url);
    failedUnregistered.remove(url);
    try {
        // 模板方法，由子类实现
        doRegister(url);
    } catch (Exception e) {
        Throwable t = e;

        // 获取 check 参数，若 check = true 将会直接抛出异常
        boolean check = getUrl().getParameter(Constants.CHECK_KEY, true)
                && url.getParameter(Constants.CHECK_KEY, true)
                && !Constants.CONSUMER_PROTOCOL.equals(url.getProtocol());
        boolean skipFailback = t instanceof SkipFailbackWrapperException;
        if (check || skipFailback) {
            if (skipFailback) {
                t = t.getCause();
            }
            throw new IllegalStateException("Failed to register");
        } else {
            logger.error("Failed to register");
        }

        // 记录注册失败的链接
        failedRegistered.add(url);
    }
}

protected abstract void doRegister(URL url);
```

如上，我们重点关注 doRegister 方法调用即可，其他的代码先忽略。doRegister 方法是一个模板方法，因此我们到 FailbackRegistry 子类 ZookeeperRegistry 中进行分析。如下：

```java
protected void doRegister(URL url) {
    try {
        // 通过 Zookeeper 客户端创建节点，节点路径由 toUrlPath 方法生成，路径格式如下:
        //   /${group}/${serviceInterface}/providers/${url}
        // 比如
        //   /dubbo/org.apache.dubbo.DemoService/providers/dubbo%3A%2F%2F127.0.0.1......
        zkClient.create(toUrlPath(url), url.getParameter(Constants.DYNAMIC_KEY, true));
    } catch (Throwable e) {
        throw new RpcException("Failed to register...");
    }
}
```

如上，ZookeeperRegistry 在 doRegister 中调用了 Zookeeper 客户端创建服务节点。节点路径由 toUrlPath 方法生成，该方法逻辑不难理解，就不分析了。接下来分析 create 方法，如下：

```java
public void create(String path, boolean ephemeral) {
    if (!ephemeral) {
        // 如果要创建的节点类型非临时节点，那么这里要检测节点是否存在
        if (checkExists(path)) {
            return;
        }
    }
    int i = path.lastIndexOf('/');
    if (i > 0) {
        // 递归创建上一级路径
        create(path.substring(0, i), false);
    }
    
    // 根据 ephemeral 的值创建临时或持久节点
    if (ephemeral) {
        createEphemeral(path);
    } else {
        createPersistent(path);
    }
}
```

上面方法先是通过递归创建当前节点的上一级路径，然后再根据 ephemeral 的值决定创建临时还是持久节点。createEphemeral 和 createPersistent 这两个方法都比较简单，这里简单分析其中的一个。如下：

```java
public void createEphemeral(String path) {
    try {
        // 通过 Curator 框架创建节点
        client.create().withMode(CreateMode.EPHEMERAL).forPath(path);
    } catch (NodeExistsException e) {
    } catch (Exception e) {
        throw new IllegalStateException(e.getMessage(), e);
    }
}
```

好了，到此关于服务注册的过程就分析完了。整个过程可简单总结为：先创建注册中心实例，之后再通过注册中心实例注册服务。本节先到这，接下来分析数据订阅过程。

### 2.2.5 订阅 override 数据

// 待补充

## 3.总结

本篇文章详细分析了 Dubbo 服务导出过程，包括配置检测，URL 组装，Invoker 创建过程、导出服务以及注册服务等等。篇幅比较大，需要大家耐心阅读。本篇文章先就到这，如果文章有不妥错误之处，希望大家能够进行反馈或修正。