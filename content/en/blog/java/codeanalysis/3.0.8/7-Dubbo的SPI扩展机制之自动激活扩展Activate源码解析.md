---
title: "7-Dubbo的SPI扩展机制之自动激活扩展Activate源码解析"
linkTitle: "7-Dubbo的SPI扩展机制之自动激活扩展Activate源码解析"
date: 2022-08-07
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] @Activate可用于在有多个实现时加载某些筛选器扩展，一般带有同种类型多个扩展都要执行的情况，比如过滤器。
---

# 7-Dubbo的SPI扩展机制之自动激活扩展Activate源码解析
## 7.1 Activate扩展的说明
此注解对于使用给定条件自动激活某些扩展非常有用，例如：@Activate可用于在有多个实现时加载某些筛选器扩展。
- **group()** 指定组条件。框架SPI定义了有效的组值。
- **value()** 指定URL条件中的参数键。

SPI提供程序可以调用ExtensionLoader。getActivateExtension(URL、String、String)方法以查找具有给定条件的所有已激活扩展。

比如后面我们会说到的**过滤器扩展对象**的获取,如下通过调用**getActivateExtension方法的**代码:

```java
 List<Filter> filters;
 filters = ScopeModelUtil.getExtensionLoader(Filter.class, moduleModels.get(0)).getActivateExtension(url, key, group);
```


## 7.2 获取自动激活扩展的源码

前面我们看了激活扩展是通过调用getActivateExtension方法来获取对象的,那接下来就来看下这个方法做了什么操作:

```java
/**
* @param url 服务的url
* @param key  用于获取扩展点名称的url参数键 比如监听器:exporter.listener,过滤器:params-filter,telnet处理器:telnet
*/
 public List<T> getActivateExtension(URL url, String key) {
        return getActivateExtension(url, key, null);
    }
```

继续调用重载的方法
```java
/**
     *  
     *
     * @param url   服务的url
     * @param key   用于获取扩展点名称的url参数键 比如监听器:exporter.listener,过滤器:params-filter,telnet处理器:telnet
     * @param group group 用于筛选的分组,比如过滤器中使用此参数来区分消费者使用这个过滤器还是提供者使用这个过滤器他们的group参数分表为consumer,provider
     * @return 已激活的扩展列表。
     */
 public List<T> getActivateExtension(URL url, String key, String group) {
 		//从参数中获取url指定的值
        String value = url.getParameter(key);
        //调用下个重载的方法
        return getActivateExtension(url, StringUtils.isEmpty(value) ? null : COMMA_SPLIT_PATTERN.split(value), group);
    }
```


上面的重载方法都是用来转换参数的,下面这个方法才是真正的逻辑
```java
 /**
     * 获取激活扩展.
     *
     * @param url    服务的url
     * @param values 这个value是扩展点的名字 当指定了时候会使用指定的名字的扩展
     * @param group  group 用于筛选的分组,比如过滤器中使用此参数来区分消费者使用这个过滤器还是提供者使用这个过滤器他们的group参数分表为consumer,provider
     * @return 获取激活扩展.
     */
    public List<T> getActivateExtension(URL url, String[] values, String group) {
    	//检查扩展加载器是否被销毁了
        checkDestroyed();
        // solve the bug of using @SPI's wrapper method to report a null pointer exception.
        //创建个有序的Map集合,用来对扩展进行排序
        Map<Class<?>, T> activateExtensionsMap = new TreeMap<>(activateComparator);
        //初始化扩展名字,指定了扩展名字values不为空
        List<String> names = values == null ? new ArrayList<>(0) : asList(values);
        //扩展名字使用Set集合进行去重
        Set<String> namesSet = new HashSet<>(names);
        //参数常量是 -default  扩展名字是否不包含默认的
        if (!namesSet.contains(REMOVE_VALUE_PREFIX + DEFAULT_KEY)) {
        	//第一次进来肯定是没有缓存对象双重校验锁检查下
            if (cachedActivateGroups.size() == 0) {
                synchronized (cachedActivateGroups) {
                    // cache all extensions
                    if (cachedActivateGroups.size() == 0) {
                    	//加载扩展类型对应的扩展类,这个具体细节参考源码或者《[Dubbo3.0.7源码解析系列]-5-Dubbo的SPI扩展机制与自适应扩展对象的创建与扩展文件的扫描源码解析》章节
                        getExtensionClasses();
                        for (Map.Entry<String, Object> entry : cachedActivates.entrySet()) {
                            String name = entry.getKey();
                            Object activate = entry.getValue();

                            String[] activateGroup, activateValue;
							//遍历所有的activates列表获取group()和value()值
                            if (activate instanceof Activate) {
                                activateGroup = ((Activate) activate).group();
                                activateValue = ((Activate) activate).value();
                            } else if (activate instanceof com.alibaba.dubbo.common.extension.Activate) {
                                activateGroup = ((com.alibaba.dubbo.common.extension.Activate) activate).group();
                                activateValue = ((com.alibaba.dubbo.common.extension.Activate) activate).value();
                            } else {
                                continue;
                            }
                            //缓存分组值
                            cachedActivateGroups.put(name, new HashSet<>(Arrays.asList(activateGroup)));
                            String[][] keyPairs = new String[activateValue.length][];
                            //遍历指定的激活扩展的扩展名字列表
                            for (int i = 0; i < activateValue.length; i++) {
                                if (activateValue[i].contains(":")) {
                                    keyPairs[i] = new String[2];
                                    String[] arr = activateValue[i].split(":");
                                    keyPairs[i][0] = arr[0];
                                    keyPairs[i][1] = arr[1];
                                } else {
                                    keyPairs[i] = new String[1];
                                    keyPairs[i][0] = activateValue[i];
                                }
                            }
                            //缓存指定扩展信息
                            cachedActivateValues.put(name, keyPairs);
                        }
                    }
                }
            }

            // traverse all cached extensions
            //遍历所有激活的扩展名字和扩展分组集合
            cachedActivateGroups.forEach((name, activateGroup) -> {
            	//筛选当前扩展的扩展分组与激活扩展的扩展分组是否可以匹配
                if (isMatchGroup(group, activateGroup)
                	//不能是指定的扩展名字
                    && !namesSet.contains(name)
                    //也不能是带有 -指定扩展名字
                    && !namesSet.contains(REMOVE_VALUE_PREFIX + name)
                    //如果在Active注解中配置了value则当指定的键出现在URL的参数中时，激活当前扩展名。 
                    //如果未配置value属性则默认都是匹配的(cachedActivateValues中不存在对应扩展名字的缓存的时候默认为true)
                    && isActive(cachedActivateValues.get(name), url)) {
					//缓存激活的扩展类型映射的扩展名字
                    activateExtensionsMap.put(getExtensionClass(name), getExtension(name));
                }
            });
        }

        if (namesSet.contains(DEFAULT_KEY)) {
            // will affect order
            // `ext1,default,ext2` means ext1 will happens before all of the default extensions while ext2 will after them
            ArrayList<T> extensionsResult = new ArrayList<>(activateExtensionsMap.size() + names.size());
            for (int i = 0; i < names.size(); i++) {
                String name = names.get(i);
                if (!name.startsWith(REMOVE_VALUE_PREFIX)
                    && !namesSet.contains(REMOVE_VALUE_PREFIX + name)) {
                    if (!DEFAULT_KEY.equals(name)) {
                        if (containsExtension(name)) {
                            extensionsResult.add(getExtension(name));
                        }
                    } else {
                        extensionsResult.addAll(activateExtensionsMap.values());
                    }
                }
            }
            return extensionsResult;
        } else {
            // add extensions, will be sorted by its order
            for (int i = 0; i < names.size(); i++) {
                String name = names.get(i);
                if (!name.startsWith(REMOVE_VALUE_PREFIX)
                    && !namesSet.contains(REMOVE_VALUE_PREFIX + name)) {
                    if (!DEFAULT_KEY.equals(name)) {
                        if (containsExtension(name)) {
                            activateExtensionsMap.put(getExtensionClass(name), getExtension(name));
                        }
                    }
                }
            }
            return new ArrayList<>(activateExtensionsMap.values());
        }
    }
 ```

 
再来回顾下扫描扩展类型的时候,与激活扩展的相关扫描代码:
与激活注解关键的代码位置在这里ExtensionLoader的loadClass方法中
我来贴下loadClass方法核心的代码:

```java
if (clazz.isAnnotationPresent(Adaptive.class)) {
            cacheAdaptiveClass(clazz, overridden);
        } else if (isWrapperClass(clazz)) {
            cacheWrapperClass(clazz);
        } else {
            if (StringUtils.isEmpty(name)) {
                name = findAnnotationName(clazz);
                if (name.length() == 0) {
                    throw new IllegalStateException("No such extension name for the class " + clazz.getName() + " in the config " + resourceURL);
                }
            }

            String[] names = NAME_SEPARATOR.split(name);
            if (ArrayUtils.isNotEmpty(names)) {
            //位置在这里其他地方就不标记注释了,前面判断了如果不是Adaptive也不是Wrapper类型则我们可以来判断是否为Activate 类型如果是的话调用cacheActivateClass方法将扩展缓存进cachedActivates缓存中
                cacheActivateClass(clazz, names[0]);
                for (String n : names) {
                    cacheName(clazz, n);
                    saveInExtensionClass(extensionClasses, clazz, n, overridden);
                }
            }
        }
```

```java
private void cacheActivateClass(Class<?> clazz, String name) {
        Activate activate = clazz.getAnnotation(Activate.class);
        if (activate != null) {
        	//注解存在则加入激活注解缓存
            cachedActivates.put(name, activate);
        } else {
            // support com.alibaba.dubbo.common.extension.Activate
            com.alibaba.dubbo.common.extension.Activate oldActivate = clazz.getAnnotation(com.alibaba.dubbo.common.extension.Activate.class);
            if (oldActivate != null) {
                cachedActivates.put(name, oldActivate);
            }
        }
    }
```

  原文： [《Dubbo的SPI扩展机制之自动激活扩展Activate源码解析》](https://blog.elastic.link/2022/07/10/dubbo/7-dubbo-de-spi-kuo-zhan-ji-zhi-zhi-zi-dong-ji-huo-kuo-zhan-activate-yuan-ma-jie-xi/)
