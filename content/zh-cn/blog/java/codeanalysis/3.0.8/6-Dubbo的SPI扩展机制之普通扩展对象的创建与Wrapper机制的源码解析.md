---
title: "06-Dubbo的SPI扩展机制之普通扩展对象的创建与Wrapper机制的源码解析"
linkTitle: "6-Dubbo的SPI扩展机制之普通扩展对象的创建与Wrapper机制的源码解析"
date: 2022-08-06
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] 了解Spring的同学可能比较熟悉AOP机制的逻辑，Dubbo Wrapper机制就是类似AOP这样的切面机制用来增强扩展方法，Wrapper机制，即扩展点自动包装。Wrapper 类同样实现了扩展点接口，但是 Wrapper 不是扩展点的真正实现。它的用途主要是用于从 ExtensionLoader 返回扩展点时，包装在真正的扩展点实现外
---


# 6 Dubbo的SPI扩展机制之普通扩展对象的创建与Wrapper机制的源码解析
##  6.1 普通扩展对象的加载与创建
这里我们要分析的是ExtensionLoader类型的getExtension(String name)方法, 有了前面自适应扩展的铺垫,这里就更容易来看了getExtension是根据扩展名字获取具体扩展的通用方法,我们来根据某个类型来获取扩展的时候就是走的这里,比如在这个博客开头的介绍:

-  ApplicationModel中获取配置管理器对象
```java
 configManager = (ConfigManager) this.getExtensionLoader(ApplicationExt.class)
                .getExtension(ConfigManager.NAME);
       
```

### 6.1.1 getExtension方法源码
先来看下getExtension方法的源码,根据扩展名字查询扩展对象
```cpp

public T getExtension(String name) {
		//这里并不能看到什么,只多传了个参数wrap为true调用另外一个重载的方法
        T extension = getExtension(name, true);
        if (extension == null) {
            throw new IllegalArgumentException("Not find extension: " + name);
        }
        return extension;
    }
```


 

```java
public T getExtension(String name, boolean wrap) {
		//检查扩展加载器是否已被销毁
        checkDestroyed();
        if (StringUtils.isEmpty(name)) {
            throw new IllegalArgumentException("Extension name == null");
        }
        //扩展名字为true则加载默认扩展
        if ("true".equals(name)) {
            return getDefaultExtension();
        }
        //非wrap类型则将缓存的扩展名字key加上_origin后缀
        //wrap是aop机制 俗称切面,这个origin在aop里面可以称为切点,下面的wrap扩展可以称为增强通知的类型,普通扩展和wrap扩展的扩展名字是一样的
        String cacheKey = name;
        if (!wrap) {
            cacheKey += "_origin";
        }
        //从cachedInstances缓存中查询
        final Holder<Object> holder = getOrCreateHolder(cacheKey);
        Object instance = holder.get();
        //缓存中不存在则创建扩展对象 双重校验锁
        if (instance == null) {
            synchronized (holder) {
            	//双重校验锁的方式
                instance = holder.get();
                if (instance == null) {
                	//创建扩展对象
                    instance = createExtension(name, wrap);
                    holder.set(instance);
                }
            }
        }
        return (T) instance;
    }
```


我们先来看一下默认扩展的加载代码:

```java
public T getDefaultExtension() {
		//加载扩展类型对应的所有扩展SPI实现类型,在加载所有扩展实现类型的时候会缓存这个扩展的默认实现类型,将对象缓存在cachedDefaultName中
        getExtensionClasses();
        if (StringUtils.isBlank(cachedDefaultName) || "true".equals(cachedDefaultName)) {
            return null;
        }
        //再回到加载扩展的方法
        return getExtension(cachedDefaultName);
    }
```


创建扩展对象方法这个和自适应扩展的创建扩展类似
createExtension:
具体过程如下:
- 加载扩展类型:getExtensionClasses()
- 创建扩展对象:createExtensionInstance(clazz)
- 注入自适应扩展: injectExtension(instance);
- wrap处理

```cpp
private T createExtension(String name, boolean wrap) {
		//扩展的创建的第一步扫描所有jar中的扩展实现,这里扫描完之后获取对应扩展名字的扩展实现类型的Class对象
        Class<?> clazz = getExtensionClasses().get(name);
        //出现异常了 转换下异常信息 再抛出
        if (clazz == null || unacceptableExceptions.contains(name)) {
            throw findException(name);
        }
        try {
        	//当前扩展对象是否已经创建过了则直接从缓存中获取
            T instance = (T) extensionInstances.get(clazz);
            if (instance == null) {
            	//第一次获取缓存中肯定没有则创建扩展对象然后缓存起来
            	//createExtensionInstance 这个是与自适应扩展对象创建对象的不同之处
                extensionInstances.putIfAbsent(clazz, createExtensionInstance(clazz));
                instance = (T) extensionInstances.get(clazz);
                instance = postProcessBeforeInitialization(instance, name);
                //注入扩展自适应方法,这个方法前面讲自适应扩展时候说了,注入自适应扩展方法的自适应扩展对象
                injectExtension(instance);
                instance = postProcessAfterInitialization(instance, name);
            }
			//是否开启了wrap
			//Dubbo通过Wrapper实现AOP的方法
            if (wrap) {
            //这个可以参考下Dubbo扩展的加载
                List<Class<?>> wrapperClassesList = new ArrayList<>();
                //wrap类型排序 这个wrap类型是如何来的呢,在前面扫描扩展类型的时候如果当前扩展类型不是Adaptive注解修饰的,并且当前类型type有个构造器参数是type自身的也是前面加载扩展类型时候说的装饰器模式 可以参考DubboProtocol的构造器
                if (cachedWrapperClasses != null) {
                    wrapperClassesList.addAll(cachedWrapperClasses);
                    //根据Wrapper注解的order值来进行排序值越小越在列表的前面
                    wrapperClassesList.sort(WrapperComparator.COMPARATOR);
                    //反转之后值越大就会在列表的前面
                    Collections.reverse(wrapperClassesList);
                }
				//从缓存中查到了wrapper扩展则遍历这些wrapp扩展进行筛选
                if (CollectionUtils.isNotEmpty(wrapperClassesList)) {
                    for (Class<?> wrapperClass : wrapperClassesList) {
                        Wrapper wrapper = wrapperClass.getAnnotation(Wrapper.class);
                        //需要包装的扩展名。当此数组为空时，默认值为匹配
                        //看下当前扩展是否匹配这个wrap,如何判断呢?
                        //wrapper注解不存在或者matches匹配,或者mismatches不包含当前扩展
                        //如果匹配到了当前扩展对象是需要进行wrapp的就为当前扩展创建当前wrapper扩展对象进行包装
                        boolean match = (wrapper == null) ||
                            ((ArrayUtils.isEmpty(wrapper.matches()) || ArrayUtils.contains(wrapper.matches(), name)) &&
                                !ArrayUtils.contains(wrapper.mismatches(), name));
                                //这是扩展类型是匹配wrapp的则开始注入
                        if (match) {
                        //匹配到了就创建所有的wrapper类型的对象同时构造器参数设置为当前类型
                            instance = injectExtension((T) wrapperClass.getConstructor(type).newInstance(instance));
                            instance = postProcessAfterInitialization(instance, name);
                        }
                    }
                }
            }

            // Warning: After an instance of Lifecycle is wrapped by cachedWrapperClasses, it may not still be Lifecycle instance, this application may not invoke the lifecycle.initialize hook.
            //初始化扩展,如果当前扩展是Lifecycle类型则调用初始化方法
            initExtension(instance);
            return instance;
        } catch (Throwable t) {
            throw new IllegalStateException("Extension instance (name: " + name + ", class: " +
                type + ") couldn't be instantiated: " + t.getMessage(), t);
        }
    }
```



###  6.1.2 创建扩展对象

前面加载扩展类型在自适应扩展的时候已经说过了这里就不重复了,这里我们来看下
扩展对象的创建过程:createExtensionInstance(clazz)

前面看自适应扩展对象创建的时候自适应扩展对象仅仅是使用反射newInstance了一个扩展对象,而普通的扩展类型创建对象的过程就相对复杂一点,接下来我们来看下:
 

ExtensionLoader的createExtensionInstance方法
```cpp
private Object createExtensionInstance(Class<?> type) throws ReflectiveOperationException {
		//在ExtensionLoader构造器中,有个initInstantiationStrategy()方法中new了一个初始化策略InstantiationStrategy类型对象 
        return instantiationStrategy.instantiate(type);
    }
```

 
InstantiationStrategy的实例化对象方法instantiate
```cpp
public <T> T instantiate(Class<T> type) throws ReflectiveOperationException {

        // should not use default constructor directly, maybe also has another constructor matched scope model arguments
        // 1. try to get default constructor
        Constructor<T> defaultConstructor = null;
        try {
        	//反射获取对应类型的无参构造器
            defaultConstructor = type.getConstructor();
        } catch (NoSuchMethodException e) {
            // ignore no default constructor
        }

        // 2. use matched constructor if found
        List<Constructor> matchedConstructors = new ArrayList<>();
        //获取所有构造器
        Constructor<?>[] declaredConstructors = type.getConstructors();
        //遍历构造器列表,
        for (Constructor<?> constructor : declaredConstructors) {
        //如果存在构造器则构造器参数类型是否为ScopeModel类型,如果为ScopeModel则为匹配的构造器 说明我们扩展类型在这个版本如果想要让这个构造器生效必须参数类型为ScopeModel
            if (isMatched(constructor)) {
                matchedConstructors.add(constructor);
            }
        }
        // remove default constructor from matchedConstructors
        if (defaultConstructor != null) {
            matchedConstructors.remove(defaultConstructor);
        }

        // match order:
        // 1. the only matched constructor with parameters
        // 2. default constructor if absent
		
        Constructor targetConstructor;
        //匹配的参数ScopeModel的构造器太多了就抛出异常
        if (matchedConstructors.size() > 1) {
            throw new IllegalArgumentException("Expect only one but found " +
                matchedConstructors.size() + " matched constructors for type: " + type.getName() +
                ", matched constructors: " + matchedConstructors);
        } else if (matchedConstructors.size() == 1) {
        //一个参数一般为一个参数类型ScopeModel的构造器
            targetConstructor = matchedConstructors.get(0);
        } else if (defaultConstructor != null) {
        //如果没有自定义构造器则使用空参数构造器
            targetConstructor = defaultConstructor;
        } else {
        //一个构造器也没匹配上也要报错
            throw new IllegalArgumentException("None matched constructor was found for type: " + type.getName());
        }

        // create instance with arguments
        //反射获取构造器参数的参数类型列表
        Class[] parameterTypes = targetConstructor.getParameterTypes();
        //如果存在参数则为参数设置值
        Object[] args = new Object[parameterTypes.length];
        for (int i = 0; i < parameterTypes.length; i++) {
        //借助scopeModelAccessor工具获取参数类型,这个参数类型为当前的域模型对象
            args[i] = getArgumentValueForType(parameterTypes[i]);
        }
        //创建扩展对象
        return (T) targetConstructor.newInstance(args);
    }
```


## 6.2 wrap机制
### 6.2.1 Wrapper机制说明
Dubbo通过Wrapper实现AOP的方法

Wrapper机制，即扩展点自动包装。Wrapper 类同样实现了扩展点接口，但是 Wrapper 不是扩展点的真正实现。它的用途主要是用于从 ExtensionLoader 返回扩展点时，包装在真正的扩展点实现外。即从 ExtensionLoader 中返回的实际上是 Wrapper 类的实例，Wrapper 持有了实际的扩展点实现类。
扩展点的 Wrapper 类可以有多个，也可以根据需要新增。
通过 Wrapper 类可以把所有扩展点公共逻辑移至 Wrapper 中。新加的 Wrapper 在所有的扩展点上添加了逻辑，有些类似 AOP，即 Wrapper 代理了扩展点。

Wrapper的规范
Wrapper 机制不是通过注解实现的，而是通过一套 Wrapper 规范实现的。
Wrapper 类在定义时需要遵循如下规范。

- 该类要实现 SPI 接口
- 该类中要有 SPI 接口的引用
- 该类中必须含有一个含参的构造方法且参数只能有一个类型为SPI接口
- 在接口实现方法中要调用 SPI 接口引用对象的相应方法
- 该类名称以 Wrapper 结尾
 
比如如下几个扩展类型

```cpp
 class org.apache.dubbo.rpc.protocol.ProtocolListenerWrapper
 class org.apache.dubbo.qos.protocol.QosProtocolWrapper
 class org.apache.dubbo.rpc.protocol.ProtocolListenerWrapper
 class org.apache.dubbo.qos.protocol.QosProtocolWrapper
```


回顾下Wrapper扩展类型的扫描于对象的创建
### 6.2.2 Wrapper类型的扫描
**Wrapper类型的扫描代码如下:**

来自4.5.2.3小节ExtensionLoader类型中的loadClass方法

```cpp
 //扩展子类型是否存在这个注解@Adaptive
        if (clazz.isAnnotationPresent(Adaptive.class)) {
            cacheAdaptiveClass(clazz, overridden);
        } else if (isWrapperClass(clazz)) {
        //扩展子类型构造器中是否有这个类型的接口 (这个可以想象下我们了解的Java IO流中的类型使用到的装饰器模式 构造器传个类型)
            cacheWrapperClass(clazz);
        } else {
```

isWrapperClass方法通过判断构造器类型是否为当前类型来判断是否为Wrapper类型
```cpp
 private boolean isWrapperClass(Class<?> clazz) {
        try {
            clazz.getConstructor(type);
            return true;
        } catch (NoSuchMethodException e) {
            return false;
        }
    }
```


### 6.2.3 Wrapper类型的创建
这个可以看下4.6.1 getExtension方法源码的获取扩展对象时候查询扩展对象是否有对应的Wrapper类型的扩展为其创建Wrapper扩展对象,如下代码

```cpp
//Dubbo通过Wrapper实现AOP的方法
            if (wrap) {
            //这个可以参考下Dubbo扩展的加载
                List<Class<?>> wrapperClassesList = new ArrayList<>();
                //wrap类型排序 这个wrap类型是如何来的呢,在前面扫描扩展类型的时候如果当前扩展类型不是Adaptive注解修饰的,并且当前类型type有个构造器参数是type自身的也是前面加载扩展类型时候说的装饰器模式 可以参考DubboProtocol的构造器
                if (cachedWrapperClasses != null) {
                    wrapperClassesList.addAll(cachedWrapperClasses);
                    //根据Wrapper注解的order值来进行排序值越小越在列表的前面
                    wrapperClassesList.sort(WrapperComparator.COMPARATOR);
                    //反转之后值越大就会在列表的前面
                    Collections.reverse(wrapperClassesList);
                }
				//从缓存中查到了wrapper扩展则遍历这些wrapp扩展进行筛选
                if (CollectionUtils.isNotEmpty(wrapperClassesList)) {
                    for (Class<?> wrapperClass : wrapperClassesList) {
                        Wrapper wrapper = wrapperClass.getAnnotation(Wrapper.class);
                        //需要包装的扩展名。当此数组为空时，默认值为匹配
                        //看下当前扩展是否匹配这个wrap,如何判断呢?
                        //wrapper注解不存在或者matches匹配,或者mismatches不包含当前扩展
                        //如果匹配到了当前扩展对象是需要进行wrapp的就为当前扩展创建当前wrapper扩展对象进行包装
                        boolean match = (wrapper == null) ||
                            ((ArrayUtils.isEmpty(wrapper.matches()) || ArrayUtils.contains(wrapper.matches(), name)) &&
                                !ArrayUtils.contains(wrapper.mismatches(), name));
                                //这是扩展类型是匹配wrapp的则开始注入
                        if (match) {
                        //匹配到了就创建所有的wrapper类型的对象同时构造器参数设置为当前类型
                            instance = injectExtension((T) wrapperClass.getConstructor(type).newInstance(instance));
                            instance = postProcessAfterInitialization(instance, name);
                        }
                    }
                }
            }
```

主要来看下什么情况下才为当前扩展类型创建Wrapper包装类型:
- wrapper注解不存在(前面判断过Wrapper类型是构造器满足条件的)
- 存在Wrapper注解:
	- matches匹配,
	- 或者mismatches不包含当前扩展

如果匹配到了当前扩展对象是需要进行wrapp的就为当前扩展创建当前wrapper扩展对象进行包装


 原文： [《Dubbo的SPI扩展机制之普通扩展对象的创建与Wrapper机制的源码解析》](https://blog.elastic.link/2022/07/10/dubbo/6-dubbo-de-spi-kuo-zhan-ji-zhi-zhi-pu-tong-kuo-zhan-dui-xiang-de-chuang-jian-yu-wrapper-ji-zhi-de-yuan-ma-jie-xi/)
