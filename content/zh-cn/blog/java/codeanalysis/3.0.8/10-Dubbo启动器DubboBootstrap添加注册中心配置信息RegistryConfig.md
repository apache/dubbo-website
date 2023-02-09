---
title: "10-Dubbo启动器DubboBootstrap添加注册中心配置信息RegistryConfig"
linkTitle: "10-Dubbo启动器DubboBootstrap添加注册中心配置信息RegistryConfig"
date: 2022-08-10
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] RegistryConfig注册中心配置包含了一些比较基础的注册信息相关的配置信息，注册中心是服务在分布式场景下的基础服务。
---

# 10-Dubbo启动器DubboBootstrap添加注册中心配置信息RegistryConfig
## 10.1 简介
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

上个博客我们说了启动器ApplicationConfig对象的创建,启动器对象在启动之前是要初始化一些配置信息的,这里我们来看这一行代码注册中心配置信息:
```java
registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
```


## 10.2  注册中心的配置相关

下面的配置来源于官网

| 属性       | 对应URL参数          | 类型    | 是否必填 | 缺省值 | 作用     | 描述                                                         | 兼容性         |
| ---------- | -------------------- | ------- | -------- | ------ | -------- | ------------------------------------------------------------ | -------------- |
| id         |                      | string  | 可选     |        | 配置关联 | 注册中心引用BeanId，可以在<dubbo:service registry="">或<dubbo:reference registry="">中引用此ID | 1.0.16以上版本 |
| address    | <host:port>          | string  | **必填** |        | 服务发现 | 注册中心服务器地址，如果地址没有端口缺省为9090，同一集群内的多个地址用逗号分隔，如：ip:port,ip:port，不同集群的注册中心，请配置多个<dubbo:registry>标签 | 1.0.16以上版本 |
| protocol   | <protocol>           | string  | 可选     | dubbo  | 服务发现 | 注册中心地址协议，支持`dubbo`, `multicast`, `zookeeper`, `redis`, `consul(2.7.1)`, `sofa(2.7.2)`, `etcd(2.7.2)`, `nacos(2.7.2)`等协议 | 2.0.0以上版本  |
| port       | <port>               | int     | 可选     | 9090   | 服务发现 | 注册中心缺省端口，当address没有带端口时使用此端口做为缺省值  | 2.0.0以上版本  |
| username   | <username>           | string  | 可选     |        | 服务治理 | 登录注册中心用户名，如果注册中心不需要验证可不填             | 2.0.0以上版本  |
| password   | <password>           | string  | 可选     |        | 服务治理 | 登录注册中心密码，如果注册中心不需要验证可不填               | 2.0.0以上版本  |
| transport  | registry.transporter | string  | 可选     | netty  | 性能调优 | 网络传输方式，可选mina,netty                                 | 2.0.0以上版本  |
| timeout    | registry.timeout     | int     | 可选     | 5000   | 性能调优 | 注册中心请求超时时间(毫秒)                                   | 2.0.0以上版本  |
| session    | registry.session     | int     | 可选     | 60000  | 性能调优 | 注册中心会话超时时间(毫秒)，用于检测提供者非正常断线后的脏数据，比如用心跳检测的实现，此时间就是心跳间隔，不同注册中心实现不一样。 | 2.1.0以上版本  |
| file       | registry.file        | string  | 可选     |        | 服务治理 | 使用文件缓存注册中心地址列表及服务提供者列表，应用重启时将基于此文件恢复，注意：两个注册中心不能使用同一文件存储 | 2.0.0以上版本  |
| wait       | registry.wait        | int     | 可选     | 0      | 性能调优 | 停止时等待通知完成时间(毫秒)                                 | 2.0.0以上版本  |
| check      | check                | boolean | 可选     | true   | 服务治理 | 注册中心不存在时，是否报错                                   | 2.0.0以上版本  |
| register   | register             | boolean | 可选     | true   | 服务治理 | 是否向此注册中心注册服务，如果设为false，将只订阅，不注册    | 2.0.5以上版本  |
| subscribe  | subscribe            | boolean | 可选     | true   | 服务治理 | 是否向此注册中心订阅服务，如果设为false，将只注册，不订阅    | 2.0.5以上版本  |
| dynamic    | dynamic              | boolean | 可选     | true   | 服务治理 | 服务是否动态注册，如果设为false，注册后将显示为disable状态，需人工启用，并且服务提供者停止时，也不会自动取消注册，需人工禁用。 | 2.0.5以上版本  |
| group      | group                | string  | 可选     | dubbo  | 服务治理 | 服务注册分组，跨组的服务不会相互影响，也无法相互调用，适用于环境隔离。 | 2.0.5以上版本  |
| simplified | simplified           | boolean | 可选     | false  | 服务治理 | 注册到注册中心的URL是否采用精简模式的（与低版本兼容）        | 2.7.0以上版本  |
| extra-keys | extraKeys            | string  | 可选     |        | 服务治理 | 在simplified=true时，extraKeys允许你在默认参数外将额外的key放到URL中，格式：“interface,key1,key2”。 | 2.7.0以上版本  |



 同样官网提供的参数里面并未包含所有的属性 下面我就将其余的属性列举一下方便学习参考:
 
| 变量 |	类型 |	说明 |
|--|--|--|
| server |String  |
| client |String  |
| cluster |String  |影响流量在注册中心之间的分布，在订阅多个注册中心时很有用，可用选项：1。区域感知，特定类型的流量总是根据流量的来源进入一个注册表。|
| zone |String  |注册表所属的区域，通常用于隔离流量|
| parameters |Map<String, String>  |自定义参数|
| useAsConfigCenter |Boolean  |该地址是否用作配置中心|
| useAsMetadataCenter |Boolean  |该地址是否用作远程元数据中心|
| accepts |String  |此注册表接受的rpc协议列表，例如“dubbo，rest”|
| preferred |Boolean  |如果设置为true，则始终首先使用此注册表，这在订阅多个注册表时非常有用|
| weight |Integer  |影响注册中心之间的流量分布，当订阅多个注册中心仅在未指定首选注册中心时才生效时，此功能非常有用。|
| registerMode |String  |注册模式:实例级,接口级,所有|
| enableEmptyProtection |Boolean  |收到的空url地址列表和空保护被禁用，将清除当前可用地址|
 


## 10.3 注册中心配置对象创建与添加
前面例子中调用的代码
```java
.registry(new RegistryConfig("zookeeper://127.0.0.1:2181"))
```

首先我们要来看的是RegistryConfig类型的构造器

```java
public RegistryConfig(String address) {
        setAddress(address);
 }
```

继续看setAddress方法

```java
 public void setAddress(String address) {
 		//保存地址
        this.address = address;
        //下面是支持将参数在url地址后面 比如用户名,密码,协议,端口,这几个参数提前做解析放入成员变量中
        if (address != null) {
            try {
            	//地址转Dubbo的URL对象 这个URL是Dubbo自行实现的URL封装信息的类型
                URL url = URL.valueOf(address);

                // Refactor since 2.7.8
                //值不存在时候更新属性,非常巧妙的代码 重构了多个if判断
                //第一个参数值不存在则调用第二个方法,第二个方法的参数为第三方方法			 
                updatePropertyIfAbsent(this::getUsername, this::setUsername, url.getUsername());
                updatePropertyIfAbsent(this::getPassword, this::setPassword, url.getPassword());
                updatePropertyIfAbsent(this::getProtocol, this::setProtocol, url.getProtocol());
                updatePropertyIfAbsent(this::getPort, this::setPort, url.getPort());

				//移除掉url中的backup自定义参数 (备份的注册中心地址)
                Map<String, String> params = url.getParameters();
                if (CollectionUtils.isNotEmptyMap(params)) {
                    params.remove(BACKUP_KEY);
                }
                //将自定义参数存储到成员变量中
                updateParameters(params);
            } catch (Exception ignored) {
            }
        }
    }
```


然后再回过头来看DubboBootstrap的registry方法:

```java
  public DubboBootstrap registry(RegistryConfig registryConfig) {
        //将applicationModel对象设置给注册中心配置对象
        registryConfig.setScopeModel(applicationModel);
        //将注册中心配置对象添加到配置管理器中
        configManager.addRegistry(registryConfig);
        return this;
    }
```


直接来看配置管理器configManager的添加注册中心配置addRegistry方法:

```java
public void addRegistry(RegistryConfig registryConfig) {
    addConfig(registryConfig);
}
```

configManager 的addConfig方法:

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
		//不是服务级接口配置则直接从缓存中读取到配置之后直接返回
        // fast check duplicated equivalent config before write lock
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


  原文： [<<Dubbo启动器DubboBootstrap添加注册中心配置信息RegistryConfig>>](https://blog.elastic.link/2022/07/10/dubbo/10-dubbo-qi-dong-qi-dubbobootstrap-tian-jia-zhu-ce-zhong-xin-pei-zhi-xin-xi-registryconfig//)