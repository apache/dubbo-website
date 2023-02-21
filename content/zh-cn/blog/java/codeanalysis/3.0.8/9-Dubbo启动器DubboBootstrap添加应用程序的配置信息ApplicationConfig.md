---
title: "9-Dubbo启动器DubboBootstrap添加应用程序的配置信息ApplicationConfig"
linkTitle: "9-Dubbo启动器DubboBootstrap添加应用程序的配置信息ApplicationConfig"
date: 2022-08-09
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] ApplicationConfig应用配置包含了一些比较基础的配置信息。
---

# 9-Dubbo启动器DubboBootstrap添加应用程序的配置信息ApplicationConfig

## 9.1 简介
先贴个代码用来参考:

```java
 DubboBootstrap bootstrap = DubboBootstrap.getInstance();
 bootstrap.application(new ApplicationConfig("dubbo-demo-api-provider"))
            .registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
            .protocol(new ProtocolConfig(CommonConstants.DUBBO, -1))
            .service(service)
            .start()
            .await();
```

上个博客我们说了启动器对象的创建,启动器对象在启动之前是要初始化一些配置信息的,这里我们来看这一行代码:

```java
bootstrap.application(new ApplicationConfig("dubbo-demo-api-provider"))
```

## 9.2 应用程序ApplicationConfig的配置信息
ApplicationConfig的构造器比较简单就是为他的成员变量name赋值来标识这个应用程序的名字
下面我们直接参考下官网的配置表格:

| 属性          | 对应URL参数         | 类型   | 是否必填 | 缺省值    | 作用     | 描述                                                         | 兼容性         |
| ------------- | ------------------- | ------ | -------- | --------- | -------- | ------------------------------------------------------------ | -------------- |
| name          | application         | string | **必填** |           | 服务治理 | 当前应用名称，用于注册中心计算应用间依赖关系，注意：消费者和提供者应用名不要一样，此参数不是匹配条件，你当前项目叫什么名字就填什么，和提供者消费者角色无关，比如：kylin应用调用了morgan应用的服务，则kylin项目配成kylin，morgan项目配成morgan，可能kylin也提供其它服务给别人使用，但kylin项目永远配成kylin，这样注册中心将显示kylin依赖于morgan | 1.0.16以上版本 |
| version       | application.version | string | 可选     |           | 服务治理 | 当前应用的版本                                               | 2.2.0以上版本  |
| owner         | owner               | string | 可选     |           | 服务治理 | 应用负责人，用于服务治理，请填写负责人公司邮箱前缀           | 2.0.5以上版本  |
| organization  | organization        | string | 可选     |           | 服务治理 | 组织名称(BU或部门)，用于注册中心区分服务来源，此配置项建议不要使用autoconfig，直接写死在配置中，比如china,intl,itu,crm,asc,dw,aliexpress等 | 2.0.0以上版本  |
| architecture  | architecture        | string | 可选     |           | 服务治理 | 用于服务分层对应的架构。如，intl、china。不同的架构使用不同的分层。 | 2.0.7以上版本  |
| environment   | environment         | string | 可选     |           | 服务治理 | 应用环境，如：develop/test/product，不同环境使用不同的缺省值，以及作为只用于开发测试功能的限制条件 | 2.0.0以上版本  |
| compiler      | compiler            | string | 可选     | javassist | 性能优化 | Java字节码编译器，用于动态类的生成，可选：jdk或javassist     | 2.1.0以上版本  |
| logger        | logger              | string | 可选     | slf4j     | 性能优化 | 日志输出方式，可选：slf4j,jcl,log4j,log4j2,jdk               | 2.2.0以上版本  |
| metadata-type | metadata-type       | String | 可选     | local     | 服务治理 | metadata 传递方式，是以 Provider 视角而言的，Consumer 侧配置无效，可选值有： remote - Provider 把 metadata 放到远端注册中心，Consumer 从注册中心获取 local - Provider 把 metadata 放在本地，Consumer 从 Provider 处直接获取 | 2.7.6以上版本  |


官网的配置很详细了上面有一些属性是值得注意的比如这个name,compiler,logger,metadata-type 我们可能要多看下默认值是什么,方便我们在使用过程中遇到问题的排查

常用的属性参考官网的表格已经足够了,不过上面的属性不是列举了所有的属性,后续应该官方文档回更新:
我这里把缺失的一些属性列举出来:

| 变量 | 类型 |说明
|--|--|--|
|  registries|  List<RegistryConfig>|应用级注册中心列表|
|registryIds|String|注册中心id列表|
|monitor|MonitorConfig|应用级监控配置|
|dumpDirectory|String|保存线程转储的目录|
|qosEnable|Boolean|是否启用qos|
|qosHost|String|要侦听的qos主机地址|
|qosPort|Integer|要侦听的qos端口|
|qosAcceptForeignIp|Boolean|qos是否接收外部IP|
|parameters|Map<String, String>|自定义参数|
|shutwait|String|应用程序关闭时间|赋值属性的时候会想系统属性dubbo.service.shutdown.wait里面存一份|
|hostname|String|主机名|
|registerConsumer|Boolean|用于控制是否将实例注册到注册表。仅当实例是纯消费者时才设置为“false”。|
|repository|String|没找到哪里用了|
|enableFileCache|Boolean|是否开启本地文件缓存|
|protocol|String|此应用程序的首选协议（名称）适用于难以确定哪个是首选协议的地方|
|metadataServiceProtocol|String|用于点对点的元数据传输的协议|
|metadataServicePort|Integer|元数据服务端口号，用于服务发现|
|livenessProbe|String|Liveness 存活探针 用于设置qos中探测器的扩展|
|readinessProbe|String|Readiness 就绪探针|
|startupProbe|String|Startup 启动探针|
|registerMode|String|注册模式,实例级,接口集,所有|
|enableEmptyProtection|Boolean|接收到的空url地址列表和空保护被禁用，将清除当前可用地址|

这里我们先来简单了解下这个实体类型的基本配置,直接看配置可能不太好理解,后面我们讲到每个配置的时候可以回来参考一下



## 应用程序配置对象添加到启动器中的配置管理器中
了解了配置信息再回过头来看下这个配置信息如何存放到启动器里面的:

我们的Demo调用代码如下:
```java
 DubboBootstrap bootstrap = DubboBootstrap.getInstance();
 bootstrap.application(new ApplicationConfig("dubbo-demo-api-provider"))
```

DubboBootstrap的application方法设置一个应用程序配置ApplicationConfig对象

```java
 public DubboBootstrap application(ApplicationConfig applicationConfig) {
 		//将启动器构造器中初始化的默认应用程序模型对象传递给配置对象
        applicationConfig.setScopeModel(applicationModel);
        //将配置信息添加到配置管理器中
        configManager.setApplication(applicationConfig);
        return this;
    }
```

ConfigManager配置管理器的setApplication方法
```java
  @DisableInject
    public void setApplication(ApplicationConfig application) {
        addConfig(application);
    }
```

ConfigManager配置管理器的addConfig方法
```java
public final <T extends AbstractConfig> T addConfig(AbstractConfig config) {
		
        if (config == null) {
            return null;
        }
        // ignore MethodConfig
        //检查当前配置管理器支持管理的配置对象
        //目前支持的配置有ApplicationConfig,MonitorConfig,MetricsConfig,SslConfig,
        //ProtocolConfig,RegistryConfig,ConfigCenterConfig,MetadataReportConfig
        if (!isSupportConfigType(config.getClass())) {
            throw new IllegalArgumentException("Unsupported config type: " + config);
        }
		
        if (config.getScopeModel() != scopeModel) {
            config.setScopeModel(scopeModel);
        }
		
		//缓存中是否存在
        Map<String, AbstractConfig> configsMap = configsCache.computeIfAbsent(getTagName(config.getClass()), type -> new ConcurrentHashMap<>());

        // fast check duplicated equivalent config before write lock
        //不是服务级配置则直接从缓存中读取到配置之后直接返回
        if (!(config instanceof ReferenceConfigBase || config instanceof ServiceConfigBase)) {
            for (AbstractConfig value : configsMap.values()) {
                if (value.equals(config)) {
                    return (T) value;
                }
            }
        }

        // lock by config type
        //添加配置
        synchronized (configsMap) {
            return (T) addIfAbsent(config, configsMap);
        }
    }
```


ConfigManager配置管理器的addIfAbsent方法:

```java
private <C extends AbstractConfig> C addIfAbsent(C config, Map<String, C> configsMap)
        throws IllegalStateException {
		//配置信息为空直接返回
        if (config == null || configsMap == null) {
            return config;
        }

        // find by value
        //根据配置规则判断,配置存在则返回
        Optional<C> prevConfig = findDuplicatedConfig(configsMap, config);
        if (prevConfig.isPresent()) {
            return prevConfig.get();
        }
		
		//生成配置key
        String key = config.getId();
        if (key == null) {
            do {
                // generate key if id is not set
                key = generateConfigId(config);
            } while (configsMap.containsKey(key));
        }

		//不相同的配置key重复则抛出异常
        C existedConfig = configsMap.get(key);
        if (existedConfig != null && !isEquals(existedConfig, config)) {
            String type = config.getClass().getSimpleName();
            logger.warn(String.format("Duplicate %s found, there already has one default %s or more than two %ss have the same id, " +
                    "you can try to give each %s a different id, override previous config with later config. id: %s, prev: %s, later: %s",
                type, type, type, type, key, existedConfig, config));
        }

        // override existed config if any
        //将配置对象存入configsMap对象中,configsMap来源于configsCache
        configsMap.put(key, config);
        return config;
    }
```

 原文： [<<Dubbo启动器DubboBootstrap添加应用程序的配置信息ApplicationConfig>>](https://blog.elastic.link/2022/07/10/dubbo/9-dubbo-qi-dong-qi-dubbobootstrap-tian-jia-ying-yong-cheng-xu-de-pei-zhi-xin-xi-applicationconfig/)