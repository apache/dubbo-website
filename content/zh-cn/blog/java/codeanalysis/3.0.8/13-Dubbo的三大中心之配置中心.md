---
title: "13-Dubbo的三大中心之配置中心"
linkTitle: "13-Dubbo的三大中心之配置中心"
date: 2022-08-13
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析]  一套统一的，通用的管理配置机制是不可缺少的主要组成部分。常见的做法就是通过配置服务器进行管理。
---
# 13-Dubbo的三大中心之配置中心
## 13.1 配置中心简介
百度了一段不错的文字来介绍配置中心，我看了下肯定比我写的好多了，那我就直接拷贝过来一起看：

*对于传统的单体应用而言，常使用配置文件来管理所有配置，比如SpringBoot的application.yml文件，但是在微服务架构中全部手动修改的话很麻烦而且不易维护。微服务的配置管理一般有以下需求：*
- ***集中配置管理**，一个微服务架构中可能有成百上千个微服务，所以集中配置管理是很重要的。*
- ***不同环境不同配置**，比如数据源配置在不同环境（开发，生产，测试）中是不同的。*
- ***运行期间可动态调整**。例如，可根据各个微服务的负载情况，动态调整数据源连接池大小等。*
- ***配置修改后可自动更新**。如配置内容发生变化，微服务可以自动更新配置。*

综上所述对于微服务架构而言，一套统一的，通用的管理配置机制是不可缺少的主要组成部分。常见的做法就是通过配置服务器进行管理。

不过对于来看这个文章的小伙伴应该大部分对配置中心都会比较了解，分布式配置中心实现简单一点就是借助Zookeeper来协助存储，变更推送，不过为了实现各种不同的业务需求，市面上已经有很多很可靠的配置中心可用了，比如我从其他地方拷贝过来的图（虽然不是最新的但是可以供大家参考下）：

![在这里插入图片描述](/imgs/blog/source-blog/register.png)

每个配置中心都有自己的实现，如果对配置中心感兴趣的小伙伴可以自行去对应开源项目官网查看，我们这里来看Dubbo对配置中心的支持

***多配置中心：** Dubbo支持多配置中心，来 **保证其中一个配置中心集群出现不可用时能够切换到另一个配置中心集群** ，保证能够正常从配置中心获取全局的配置、路由规则等信息。这也能够满足配置中心在部署上适应各类高可用的部署架构模式。-来自官网*

做中间件可能考虑更多的的不仅仅是性能，还要过多的考虑高可用，高可用怎么做呢，其实就是失效转移，主备切换，降级，降级再降级这些理论的运用，多多考虑某一个服务挂了怎么办，Dubbo的多配置中心支持增加了复杂性，不过降低了服务不可用的风险，有一定的人手的公司还是值得做的。

关于Dubbo的配置中心这里我来贴个官网的图:
![在这里插入图片描述](/imgs/v3/concepts/centers-config.png)
关于官网的介绍可以自行去官网看详细内容: [部署架构(注册中心、配置中心、元数据中心](/zh-cn/docs/concepts/registry-configcenter-metadata/)


## 13.2 启动配置中心
在上一个博客中说到了[《12-全局视野来看Dubbo3.0.8的服务启动生命周期》](https://blog.elastic.link/2022/07/10/dubbo/12-quan-ju-shi-ye-lai-kan-dubbo3.0.8-de-fu-wu-qi-dong-sheng-ming-zhou-qi/)Dubbo应用的启动过程DefaultApplicationDeployer的initialize()方法的全生命周期，在初始化方法中通过调用startConfigCenter();方法来启动配置中心的加载。后面就来详细看下：

DefaultApplicationDeployer类型的startConfigCenter()代码如下：

```java
private void startConfigCenter() {

        // load application config
        //加载应用程序配置 （配置可能有多个地方可以配置需要遵循Dubbo约定的优先级进行设置，也可能是多应用，多注册中心这样的配置）
      configManager.loadConfigsOfTypeFromProps(ApplicationConfig.class);

        // try set model name
        if (StringUtils.isBlank(applicationModel.getModelName())) {
        //设置一下模块名字和模块描述（我们再Debug里面经常会看到这个描述信息 toString直接返回了Dubbo为我们改造的对象信息）
            applicationModel.setModelName(applicationModel.tryGetApplicationName());
        }

        // load config centers
        //加载配置中心配置
        //配置可能有多个地方可以配置需要遵循Dubbo约定的优先级进行设置，也可能是多应用，多注册中心这样的配置）
        configManager.loadConfigsOfTypeFromProps(ConfigCenterConfig.class);
		//出于兼容性目的，如果没有明确指定配置中心，并且registryConfig的UseAConfigCenter为null或true，请使用registry作为默认配置中心
        useRegistryAsConfigCenterIfNecessary();

        // check Config Center
        //配置管理器中获取配置中心
        Collection<ConfigCenterConfig> configCenters = configManager.getConfigCenters();
        //配置中心配置不为空则刷新配置中心配置将其放入配置管理器中
        //下面开始刷新配置中心配置,如果配置中心配置为空则执行空刷新
        if (CollectionUtils.isEmpty(configCenters)) {
        //配置中心不存在的配置刷新
            ConfigCenterConfig configCenterConfig = new ConfigCenterConfig();
            configCenterConfig.setScopeModel(applicationModel);
            configCenterConfig.refresh();
            //验证配置
            ConfigValidationUtils.validateConfigCenterConfig(configCenterConfig);
            if (configCenterConfig.isValid()) {
            //配置合法则将配置放入配置管理器中
                configManager.addConfigCenter(configCenterConfig);
                configCenters = configManager.getConfigCenters();
            }
        } else {
        //一个或者多个配置中心配置存在的情况下的配置刷新
            for (ConfigCenterConfig configCenterConfig : configCenters) {
                configCenterConfig.refresh();
                //验证配置
                ConfigValidationUtils.validateConfigCenterConfig(configCenterConfig);
            }
        }

		//配置中心配置不为空则将配置中心配置添加到environment中
        if (CollectionUtils.isNotEmpty(configCenters)) {
        //多配置中心本地动态配置对象创建CompositeDynamicConfiguration
            CompositeDynamicConfiguration compositeDynamicConfiguration = new CompositeDynamicConfiguration();
            //获取配置中心的相关配置
            for (ConfigCenterConfig configCenter : configCenters) {
                // Pass config from ConfigCenterBean to environment
                //将配置中心的外部化配置,更新到环境里面
                environment.updateExternalConfigMap(configCenter.getExternalConfiguration());
                //将配置中心的应用配置,添加到环境里面
                environment.updateAppExternalConfigMap(configCenter.getAppExternalConfiguration());

                // Fetch config from remote config center
                //从配置中心拉取配置添加到组合配置中
                compositeDynamicConfiguration.addConfiguration(prepareEnvironment(configCenter));
            }
            //将配置中心中的动态配置信息 设置到environment的动态配置属性中
            environment.setDynamicConfiguration(compositeDynamicConfiguration);
        }
    }
```

### 13.2.1 配置管理器加载配置
 
前面我们看到了配置管理器会从系统属性中加载配置这里我们来详细看下，配置往往是我们使用者比较关注的内容，
```java
configManager.loadConfigsOfTypeFromProps(ApplicationConfig.class);
```

配置管理器加载配置代码:
来自ConfigManager的父类型AbstractConfigManager中
```java
public <T extends AbstractConfig> List<T> loadConfigsOfTypeFromProps(Class<T> cls) {
        List<T> tmpConfigs = new ArrayList<>();
        //获取属性配置 dubbo properties in classpath
        //这个配置信息回头说
        PropertiesConfiguration properties = environment.getPropertiesConfiguration();

        // load multiple configs with id
        //多注册中心配置id查询
       
       /*
       搜索属性并提取指定类型的配置ID。
       例如如下配置
       # 配置信息 properties
       dubbo.registries.registry1.address=xxx
       dubbo.registries.registry2.port=xxx
      
       # 提取配置的id extract  
       Set configIds = getConfigIds(RegistryConfig.class)
      
       # 提取的配置id结果 result
       configIds: ["registry1", "registry2"]
       */
        Set<String> configIds = this.getConfigIdsFromProps(cls);
        configIds.forEach(id -> {
        	//遍历这些配置id 判断配置缓存(configsCache成员变量)中是否已经存在当前配置
            if (!this.getConfig(cls, id).isPresent()) {
                T config;
                try {
                	//创建配置对象 为配置对象初始化配置id
                    config = createConfig(cls, scopeModel);
                    config.setId(id);
                } catch (Exception e) {
                    throw new IllegalStateException("create config instance failed, id: " + id + ", type:" + cls.getSimpleName());
                }

                String key = null;
                boolean addDefaultNameConfig = false;
                try {
                    // add default name config (same as id), e.g. dubbo.protocols.rest.port=1234
                    key = DUBBO + "." + AbstractConfig.getPluralTagName(cls) + "." + id + ".name";
                    if (properties.getProperty(key) == null) {
                        properties.setProperty(key, id);
                        addDefaultNameConfig = true;
                    }
				//刷新配置信息 好理解点就是Dubbo配置属性重写 
                    config.refresh();
                    //将当前配置信息添加到配置缓存中configsCache成员变量
                    this.addConfig(config);
                    tmpConfigs.add(config);
                } catch (Exception e) {
                    logger.error("load config failed, id: " + id + ", type:" + cls.getSimpleName(), e);
                    throw new IllegalStateException("load config failed, id: " + id + ", type:" + cls.getSimpleName());
                } finally {
                    if (addDefaultNameConfig && key != null) {
                        properties.remove(key);
                    }
                }
            }
        });

        // If none config of the type, try load single config
        //如果没有该类型的配置，请尝试加载单个配置
        if (this.getConfigs(cls).isEmpty()) {
            // load single config
            List<Map<String, String>> configurationMaps = environment.getConfigurationMaps();
            if (ConfigurationUtils.hasSubProperties(configurationMaps, AbstractConfig.getTypePrefix(cls))) {
                T config;
                try {
                    config = createConfig(cls, scopeModel);
                    config.refresh();
                } catch (Exception e) {
                    throw new IllegalStateException("create default config instance failed, type:" + cls.getSimpleName());
                }

                this.addConfig(config);
                tmpConfigs.add(config);
            }
        }

        return tmpConfigs;
    }
```

## 13.2.2  默认使用注册中心地址为配置中心
出于兼容性目的，如果没有明确指定配置中心，并且registryConfig的UseAConfigCenter为null或true，请使用registry作为默认配置中心
调用方法useRegistryAsConfigCenterIfNecessary()来处理逻辑
我们来看下代码:

```java
private void useRegistryAsConfigCenterIfNecessary() {
        // we use the loading status of DynamicConfiguration to decide whether ConfigCenter has been initiated.
        //我们使用DynamicConfiguration的加载状态来决定是否已启动ConfigCenter。配置中心配置加载完成之后会初始化动态配置defaultDynamicConfiguration
        if (environment.getDynamicConfiguration().isPresent()) {
            return;
        }
		//从配置缓存中查询是否存在config-center相关配置 ,如果已经存在配置了就无需使用注册中心的配置地址直接返回
        if (CollectionUtils.isNotEmpty(configManager.getConfigCenters())) {
            return;
        }

        // load registry
        //加载注册中心相关配置
        configManager.loadConfigsOfTypeFromProps(RegistryConfig.class);

		//查询是否有注册中心设置了默认配置isDefault 设置为true的注册中心则为默认注册中心列表,如果没有注册中心设置为默认注册中心,则获取所有未设置默认配置的注册中心列表
        List<RegistryConfig> defaultRegistries = configManager.getDefaultRegistries();
        //存在注册中心
        if (defaultRegistries.size() > 0) {
            defaultRegistries
                .stream()
                //判断当前注册中心是否可以作为配置中心
                .filter(this::isUsedRegistryAsConfigCenter)
                //将注册中心配置映射转换为配置中心
                .map(this::registryAsConfigCenter)
                //遍历配置中心流
                .forEach(configCenter -> {
                    if (configManager.getConfigCenter(configCenter.getId()).isPresent()) {
                        return;
                    }
                    //配置管理器中添加配置中心,方便后去读取配置中心的配置信息
                    configManager.addConfigCenter(configCenter);
                    logger.info("use registry as config-center: " + configCenter);

                });
        }
    }
```

#### 13.2.2.1 如何判断当前注册中心是否可以为配置中心
isUsedRegistryAsConfigCenter

```java
private boolean isUsedRegistryAsCenter(RegistryConfig registryConfig, Supplier<Boolean> usedRegistryAsCenter,
                                           String centerType,
                                           Class<?> extensionClass) {
        final boolean supported;
			//这个useAsConfigCenter参数是来自注册中心的配置 如果配置了这个值则以这个值为准,如果配置了false则这个注册中心不能做为配置中心
        Boolean configuredValue = usedRegistryAsCenter.get();
        if (configuredValue != null) { // If configured, take its value.
            supported = configuredValue.booleanValue();
        } else {                       // Or check the extension existence
        	//这个逻辑的话是判断下注册中心的协议是否满足要求,我们例子代码中使用的是zookeeper
            String protocol = registryConfig.getProtocol();
            //这个扩展是否支持的逻辑判断是这样的扫描扩展类 看一下当前扩展类型是否有对应协议的扩展 比如在扩展文件里面这样配置过后是支持的 protocol=xxxImpl
            //动态配置的扩展类型为:interface org.apache.dubbo.common.config.configcenter.DynamicConfigurationFactory
            //zookeeper协议肯定是支持的因为zookeeper协议实现了这个动态配置工厂 ,这个扩展类型为ZookeeperDynamicConfigurationFactory
            //代码位置在dubbo-configcenter-zookeeper包中的org.apache.dubbo.common.config.configcenter.DynamicConfigurationFactory扩展配置中内容为zookeeper=org.apache.dubbo.configcenter.support.zookeeper.ZookeeperDynamicConfigurationFactory
            supported = supportsExtension(extensionClass, protocol);
            //配置中心走注册中心会打印一条日志
            if (logger.isInfoEnabled()) {
                logger.info(format("No value is configured in the registry, the %s extension[name : %s] %s as the %s center"
                    , extensionClass.getSimpleName(), protocol, supported ? "supports" : "does not support", centerType));
            }
        }

		//配置中心走注册中心会打印一条日志
        if (logger.isInfoEnabled()) {
            logger.info(format("The registry[%s] will be %s as the %s center", registryConfig,
                supported ? "used" : "not used", centerType));
        }
        return supported;
    }
```
这个扩展是否支持的逻辑判断是这样的扫描扩展类 看一下当前扩展类型是否有对应协议的扩展 比如在扩展文件里面这样配置过后是支持的 protocol=xxxImpl
配置中心的动态配置的扩展类型为 org.apache.dubbo.common.config.configcenter.DynamicConfigurationFactory

zookeeper协议肯定是支持的因为zookeeper协议实现了这个动态配置工厂 ,这个扩展类型为ZookeeperDynamicConfigurationFactory代码位置在dubbo-configcenter-zookeeper包中的org.apache.dubbo.common.config.configcenter.DynamicConfigurationFactory扩展配置中内容为
```
zookeeper=org.apache.dubbo.configcenter.support.zookeeper.ZookeeperDynamicConfigurationFactory
```



#### 13.2.2.2 注册中心配置转配置中心配置
这个逻辑是registryAsConfigCenter方法,我来贴一下代码:

```java
private ConfigCenterConfig registryAsConfigCenter(RegistryConfig registryConfig) {
		//注册中心协议获取这里例子中的是zookeeper协议
        String protocol = registryConfig.getProtocol();
        //注册中心端口 2181
        Integer port = registryConfig.getPort();
        //在Dubbo中配置信息 很多情况下都以URL形式表示,这里转换后的地址为zookeeper://127.0.0.1:2181
        URL url = URL.valueOf(registryConfig.getAddress(), registryConfig.getScopeModel());
        //生成当前配置中心的id 封装之后的内容为:
        //config-center-zookeeper-127.0.0.1-2181
        String id = "config-center-" + protocol + "-" + url.getHost() + "-" + port;
        //配置中心配置对象创建
        ConfigCenterConfig cc = new ConfigCenterConfig();
        //config-center-zookeeper-127.0.0.1-2181
        cc.setId(id);
        cc.setScopeModel(applicationModel);
        if (cc.getParameters() == null) {
            cc.setParameters(new HashMap<>());
        }
        if (CollectionUtils.isNotEmptyMap(registryConfig.getParameters())) {
            cc.getParameters().putAll(registryConfig.getParameters()); // copy the parameters
        }
        cc.getParameters().put(CLIENT_KEY, registryConfig.getClient());
        //zookeeper
        cc.setProtocol(protocol);
        //2181
        cc.setPort(port);
        if (StringUtils.isNotEmpty(registryConfig.getGroup())) {
            cc.setGroup(registryConfig.getGroup());
        }
        //这个方法转换地址是修复bug用的可以看bug https://github.com/apache/dubbo/issues/6476
        cc.setAddress(getRegistryCompatibleAddress(registryConfig));
        //注册中心分组做为配置中心命名空间 这里为null
        cc.setNamespace(registryConfig.getGroup());
        //zk认证信息
        cc.setUsername(registryConfig.getUsername());
         //zk认证信息
        cc.setPassword(registryConfig.getPassword());
        if (registryConfig.getTimeout() != null) {
            cc.setTimeout(registryConfig.getTimeout().longValue());
        }
        //这个属性注释中已经建议了已经弃用了默认就是false了
        //如果配置中心被赋予最高优先级，它将覆盖所有其他配置，
        cc.setHighestPriority(false);
        return cc;
    }
```


## 13.3 配置刷新逻辑
来自AbstractConfig类型的refresh()方法

```java
public void refresh() {
        refreshed.set(true);
        try {
            // check and init before do refresh
            //刷新之前执行的逻辑 这里并做什么逻辑
            preProcessRefresh();
		
			//获取当前域模型的环境信息对象
            Environment environment = getScopeModel().getModelEnvironment();
            List<Map<String, String>> configurationMaps = environment.getConfigurationMaps();

            // Search props starts with PREFIX in order
            String preferredPrefix = null;
            for (String prefix : getPrefixes()) {
                if (ConfigurationUtils.hasSubProperties(configurationMaps, prefix)) {
                    preferredPrefix = prefix;
                    break;
                }
            }
            if (preferredPrefix == null) {
                preferredPrefix = getPrefixes().get(0);
            }
            // Extract sub props (which key was starts with preferredPrefix)
            Collection<Map<String, String>> instanceConfigMaps = environment.getConfigurationMaps(this, preferredPrefix);
            Map<String, String> subProperties = ConfigurationUtils.getSubProperties(instanceConfigMaps, preferredPrefix);
            InmemoryConfiguration subPropsConfiguration = new InmemoryConfiguration(subProperties);

            if (logger.isDebugEnabled()) {
                String idOrName = "";
                if (StringUtils.hasText(this.getId())) {
                    idOrName = "[id=" + this.getId() + "]";
                } else {
                    String name = ReflectUtils.getProperty(this, "getName");
                    if (StringUtils.hasText(name)) {
                        idOrName = "[name=" + name + "]";
                    }
                }
                logger.debug("Refreshing " + this.getClass().getSimpleName() + idOrName +
                    " with prefix [" + preferredPrefix +
                    "], extracted props: " + subProperties);
            }

            assignProperties(this, environment, subProperties, subPropsConfiguration);

            // process extra refresh of subclass, e.g. refresh method configs
            processExtraRefresh(preferredPrefix, subPropsConfiguration);

        } catch (Exception e) {
            logger.error("Failed to override field value of config bean: " + this, e);
            throw new IllegalStateException("Failed to override field value of config bean: " + this, e);
        }

        postProcessRefresh();
    }
```

![在这里插入图片描述](/imgs/blog/source-blog/13-config-1.png)

![在这里插入图片描述](/imgs/blog/source-blog/13-config2.png)





## 13.4 配置中心配置大全
ConfigCenterConfig类型
 下面配置信息来自官网
dubbo:config-center 配置

配置中心。对应的配置类：`org.apache.dubbo.config.ConfigCenterConfig`

| 属性               | 对应URL参数            | 类型                | 是否必填 | 缺省值           | 描述                                                         | 兼容性 |
| ------------------ | ---------------------- | ------------------- | -------- | ---------------- | ------------------------------------------------------------ | ------ |
| protocol           | config.protocol        | string              | 可选     | zookeeper        | 使用哪个配置中心：apollo、zookeeper、nacos等。 以zookeeper为例 1. 指定protocol，则address可以简化为`127.0.0.1:2181`； 2. 不指定protocol，则address取值为`zookeeper://127.0.0.1:2181` | 2.7.0+ |
| address            | config.address         | string              | 必填     |                  | 配置中心地址。 取值参见protocol说明                          | 2.7.0+ |
| highest-priority   | config.highestPriority | boolean             | 可选     | true             | 来自配置中心的配置项具有最高优先级，即会覆盖本地配置项。     | 2.7.0+ |
| namespace          | config.namespace       | string              | 可选     | dubbo            | 通常用于多租户隔离，实际含义视具体配置中心而不同。 如： zookeeper - 环境隔离，默认值`dubbo`； apollo - 区分不同领域的配置集合，默认使用`dubbo`和`application` | 2.7.0+ |
| cluster            | config.cluster         | string              | 可选     |                  | 含义视所选定的配置中心而不同。 如Apollo中用来区分不同的配置集群 | 2.7.0+ |
| group              | config.group           | string              | 可选     | dubbo            | 含义视所选定的配置中心而不同。 nacos - 隔离不同配置集 zookeeper - 隔离不同配置集 | 2.7.0+ |
| check              | config.check           | boolean             | 可选     | true             | 当配置中心连接失败时，是否终止应用启动。                     | 2.7.0+ |
| config-file        | config.configFile      | string              | 可选     | dubbo.properties | 全局级配置文件所映射到的key zookeeper - 默认路径/dubbo/config/dubbo/dubbo.properties apollo - dubbo namespace中的dubbo.properties键 | 2.7.0+ |
| timeout            | config.timeout         | integer             |          | 3000ms           | 获取配置的超时时间                                           | 2.7.0+ |
| username           |                        | string              |          |                  | 如果配置中心需要做校验，用户名 Apollo暂未启用                | 2.7.0+ |
| password           |                        | string              |          |                  | 如果配置中心需要做校验，密码 Apollo暂未启用                  | 2.7.0+ |
| parameters         |                        | Map<string, string> |          |                  | 扩展参数，用来支持不同配置中心的定制化配置参数               | 2.7.0+ |
| include-spring-env |                        | boolean             | 可选     | false            | 使用Spring框架时支持，为true时，会自动从Spring Environment中读取配置。 默认依次读取 key为dubbo.properties的配置 key为dubbo.properties的PropertySource | 2.7.0+ |



 原文：[Dubbo的三大中心之配置中心](https://blog.elastic.link/2022/07/10/dubbo/13-dubbo-de-san-da-zhong-xin-zhi-pei-zhi-zhong-xin-yuan-ma-jie-xi/)