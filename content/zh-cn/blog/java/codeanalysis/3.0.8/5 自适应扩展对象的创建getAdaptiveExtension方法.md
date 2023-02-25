---
title: "05-自适应扩展对象的创建getAdaptiveExtension方法"
linkTitle: "5-自适应扩展对象的创建getAdaptiveExtension方法"
date: 2022-08-05
author: 宋小生
tags: ["源码解析", "Java"]
description: >
    [Dubbo 3.0.8源码解析] Dubbo是一个微内核框架，所有的实现都是通过扩展机制来实现的，了解扩展加载机制可以有效的逻辑代码的抽象与具体逻辑
---


## 5 自适应扩展对象的创建getAdaptiveExtension方法
自适应扩展又称为动态扩展,可以在运行时生成扩展对象

ExtensionLoader中的getAdaptiveExtension()方法,这个方法也是我们看到的第一个获取扩展对象的方法. ,这个方法可以帮助我们通过SPI机制从扩展文件中找到需要的扩展类型并创建它的对象,
**自适应扩展:**如果对设计模式比较了解的可能会联想到**适配器模式**,自适应扩展其实就是适配器模式的思路,自适应扩展有两种策略:

- 一种是我们自己实现自适应扩展:然后使用@Adaptive修饰这个时候适配器的逻辑由我们自己实现,当扩展加载器去查找具体的扩展的时候可以通过找到我们这个对应的适配器扩展,然后适配器扩展帮忙去查询真正的扩展,这个比如我们下面要举的扩展注入器的例子,具体扩展通过扩展注入器适配器,注入器适配器来查询具体的注入器扩展实现来帮忙查找扩展。 

- 还有一种方式是我们未实现这个自适应扩展,Dubbo在运行时通过字节码动态代理的方式在运行时生成一个适配器,使用这个适配器映射到具体的扩展. 第二种情况往往用在比如 Protocol、Cluster、LoadBalance 等。有时，有些拓展并不想在框架启动阶段被加载，而是希望在拓展方法被调用时，根据运行时参数进行加载。(如果还不了解可以考虑看下@Adaptive注解加载方法上面的时候扩展是如何加载的)

```java
 public T getAdaptiveExtension() {
 		//检查当前扩展加载器是否已经被销毁
        checkDestroyed();
        //从自适应扩展缓存中查询扩展对象如果存在就直接返回,这个自适应扩展类型只会有一个扩展实现类型如果是多个的话根据是否可以覆盖参数决定扩展实现类是否可以相互覆盖
        Object instance = cachedAdaptiveInstance.get();
        //这个if判断不太优雅 容易多层嵌套,上面instance不为空就可以直接返回了
        if (instance == null) {
        	//创建异常则抛出异常直接返回(多线程场景下可能第一个线程异常了第二个线程进来之后走到这里)
            if (createAdaptiveInstanceError != null) {
                throw new IllegalStateException("Failed to create adaptive instance: " +
                    createAdaptiveInstanceError.toString(),
                    createAdaptiveInstanceError);
            }
			//加锁排队 (单例模式创建对象的思想 双重校验锁)
            synchronized (cachedAdaptiveInstance) {
            	//加锁的时候对象都是空的,进来之后先判断下防止重复创建
                instance = cachedAdaptiveInstance.get();
                //只有第一个进来锁的对象为空开始创建扩展对象
                if (instance == null) {
                    try {
                    	//根据SPI机制获取类型,创建对象
                        instance = createAdaptiveExtension();
                        //存入缓存
                        cachedAdaptiveInstance.set(instance);
                    } catch (Throwable t) {
                        createAdaptiveInstanceError = t;
                        throw new IllegalStateException("Failed to create adaptive instance: " + t.toString(), t);
                    }
                }
            }
        }

        return (T) instance;
    }
```

前面使用单例思想来调用创建自适应扩展对象的方法,下面就让我们深入探究下创建自适应扩展对象的整个过程createAdaptiveExtension();方法:


## 5.1 创建扩展对象的生命周期方法-注意这个后续会详细解析这个声明周期方法的细节

createAdaptiveExtension()
我们先来看ExtensionLoader类型中的createAdaptiveExtension();方法,这个方法包含了扩展对象创建初始化的整个生命周期,如下代码所示:

```java
private T createAdaptiveExtension() {
        try {
        	//获取扩展类型实现类, 创建扩展对象
            T instance = (T) getAdaptiveExtensionClass().newInstance();
            //注入扩展对象之前的回调方法
            instance = postProcessBeforeInitialization(instance, null);
            //注入扩展对象
            instance = injectExtension(instance);
            //注入扩展对象之后的回调方法
            instance = postProcessAfterInitialization(instance, null);
            //初始化扩展对象的属性,如果当前扩展实例的类型实现了Lifecycle则调用当前扩展对象的生命周期回调方法initialize()(来自Lifecycle接口)
            //参考样例第一个instance为ExtensionInjector的自适应扩展对象类型为AdaptiveExtensionInjector,自适应扩展注入器(适配器)用来查询具体支持的扩展注入器比如scope,spi,spring注入器
            initExtension(instance);
            return instance;
        } catch (Exception e) {
            throw new IllegalStateException("Can't create adaptive extension " + type + ", cause: " + e.getMessage(), e);
        }
    }
```

## 5.2 SPI机制获取扩展对象实现类型getAdaptiveExtensionClass()
这个方法可以帮助我们了解具体的Dubbo SPI机制 如果找到扩展类型的实现类,会寻找哪些文件,扩展文件的优先级又是什么,对我们自己写扩展方法很有帮助,接下来我们就来看下它的源码:

```java
 private Class<?> getAdaptiveExtensionClass() {
 		//获取扩展类型,将扩展类型存入成员变量cachedClasses中进行缓存
        getExtensionClasses();
        //在上个方法的详细解析中的最后一步loadClass方法中如果扩展类型存在Adaptive注解将会将扩展类型赋值给cachedAdaptiveClass,否则的话会把扩展类型都缓存起来存储在扩展集合extensionClasses中
        if (cachedAdaptiveClass != null) {
            return cachedAdaptiveClass;
        }
        //扩展实现类型没有一个这个自适应注解Adaptive时候会走到这里
        //刚刚我们扫描到了扩展类型然后将其存入cachedClasses集合中了 接下来我们看下如何创建扩展类型
        return cachedAdaptiveClass = createAdaptiveExtensionClass();
    }
```

继续看获取扩展类型的方法**getExtensionClasses()**:

```java
 private Map<String, Class<?>> getExtensionClasses() {
 		//缓存中查询扩展类型是否存在
        Map<String, Class<?>> classes = cachedClasses.get();
        if (classes == null) {
        	//单例模式双重校验锁判断
            synchronized (cachedClasses) {
                classes = cachedClasses.get();
                if (classes == null) {
                	//加载扩展类型
                    classes = loadExtensionClasses();
                    //将我们扫描到的扩展类型存入成员变量cachedClasses中
                    cachedClasses.set(classes);
                }
            }
        }
        return classes;
    }
```

### 5.2.1 使用不同的的策略加载加载不同目录下的扩展
加载扩展类型的方法**loadExtensionClasses()**

```cpp
  private Map<String, Class<?>> loadExtensionClasses() {
  		//检查扩展加载器是否被销毁
        checkDestroyed();
        //缓存默认的扩展名到成员变量cachedDefaultName中
        cacheDefaultExtensionName();
		//加载到的扩展集合
        Map<String, Class<?>> extensionClasses = new HashMap<>();
		//扩展策略,在4.3章节中我们介绍了这个类型的UML与说明
		//LoadingStrategy扩展加载策略,目前有3个扩展加载策略
		//DubboInternalLoadingStrategy:Dubbo内置的扩展加载策略,将加载文件目录为META-INF/dubbo/internal/的扩展
		//DubboLoadingStrategy:Dubbo普通的扩展加载策略,将加载目录为META-INF/dubbo/的扩展
		//ServicesLoadingStrategy:JAVA SPI加载策略 ,将加载目录为META-INF/services/的扩展
		//扩展策略集合对象在什么时候初始化的呢在成员变量初始化的时候就创建了集合对象,这个可以看方法loadLoadingStrategies() 通过Java的 SPI加载策略
        for (LoadingStrategy strategy : strategies) {
        	//根据策略从指定文件目录中加载扩展类型
            loadDirectory(extensionClasses, strategy, type.getName());

            // compatible with old ExtensionFactory
            //如果当前要加载的扩展类型是扩展注入类型则扫描下ExtensionFactory类型的扩展
            if (this.type == ExtensionInjector.class) {
            	//这个方法和上面那个方法是一样的就不详细说了 扫描文件 找到扩展类型
                loadDirectory(extensionClasses, strategy, ExtensionFactory.class.getName());
            }
        }
		//通过loadDirectory扫描 扫描到了ExtensionInjector类型的扩展实现类有3个 我们将会得到这样一个集合例子:
		//"spring" ->  "class org.apache.dubbo.config.spring.extension.SpringExtensionInjector"
		//"scopeBean" ->  "class org.apache.dubbo.common.beans.ScopeBeanExtensionInjector"
		//"spi" ->  "class org.apache.dubbo.common.extension.inject.SpiExtensionInjector"
        return extensionClasses;
    }
```


 从文件中加载扩展实现loadDirectory方法:

```java
 private void loadDirectory(Map<String, Class<?>> extensionClasses, LoadingStrategy strategy, String type) {
 		//加载并根据策略的参数来加载
        loadDirectory(extensionClasses, strategy.directory(), type, strategy.preferExtensionClassLoader(),
            strategy.overridden(), strategy.includedPackages(), strategy.excludedPackages(), strategy.onlyExtensionClassLoaderPackages());
            //下面两行就是要兼容alibaba的扩展包了  
        String oldType = type.replace("org.apache", "com.alibaba");
        loadDirectory(extensionClasses, strategy.directory(), oldType, strategy.preferExtensionClassLoader(),
            strategy.overridden(), strategy.includedPackagesInCompatibleType(), strategy.excludedPackages(), strategy.onlyExtensionClassLoaderPackages());
    }
```

带扩展策略参数的loadDirectory方法

关于扩展策略的参数列表我这里列个表格方便大家来看

|扩展类型|dir(目录)  |  extensionLoaderClassLoaderFirst(优先扩展类型的类加载器)|overridden(是否允许覆盖同名扩展)|includedPackages (明确包含的扩展包) | excludedPackages (明确排除的扩展包)|onlyExtensionClassLoaderPackages(限制应该从Dubbo的类加载器加载的类)| 
|--|--|--|--|--|--|--|
| DubboInternalLoadingStrategy | META-INF/dubbo/internal/ |false|false|null|null|[]|
|DubboLoadingStrategy|META-INF/dubbo/|false|true|null|null|[]|
|ServicesLoadingStrategy|META-INF/services/|false|true|null|null|[]|


```java
    /**
     * 不同的扩展策略传递了不同的参数,但是扩展的加载流程是相同的,这里我们可以参考上面表格
     * @param extensionClasses 
     * @param dir 
     * @param type 这里我们参考的示例这个值为org.apache.dubbo.common.extension.ExtensionInjector
     * @param extensionLoaderClassLoaderFirst 
     * @param overridden false
     * @param includedPackages 
     * @param excludedPackages 
     * @param onlyExtensionClassLoaderPackages 
     */
private void loadDirectory(Map<String, Class<?>> extensionClasses, String dir, String type,
                               boolean extensionLoaderClassLoaderFirst, boolean overridden, String[] includedPackages,
                               String[] excludedPackages, String[] onlyExtensionClassLoaderPackages) {
        //扩展目录 + 扩展类型全路径 比如: META-INF/dubbo/internal/org.apache.dubbo.common.extension.ExtensionInjector
        String fileName = dir + type;
        try {
            List<ClassLoader> classLoadersToLoad = new LinkedList<>();

            // try to load from ExtensionLoader's ClassLoader first
            //是否优先使用扩展加载器的 类加载器
            if (extensionLoaderClassLoaderFirst) {
                ClassLoader extensionLoaderClassLoader = ExtensionLoader.class.getClassLoader();
                if (ClassLoader.getSystemClassLoader() != extensionLoaderClassLoader) {
                    classLoadersToLoad.add(extensionLoaderClassLoader);
                }
            }

            // load from scope model
            //获取域模型对象的类型加载器 ,这个域模型对象在初始化的时候会将自己的类加载器放入集合中可以参考《3.2.2 初始化ScopeModel》章节
            Set<ClassLoader> classLoaders = scopeModel.getClassLoaders();
			
			//没有可用的类加载器则从使用
            if (CollectionUtils.isEmpty(classLoaders)) {
            //从用于加载类的搜索路径中查找指定名称的所有资源。
                Enumeration<java.net.URL> resources = ClassLoader.getSystemResources(fileName);
                if (resources != null) {
                    while (resources.hasMoreElements()) {
                        loadResource(extensionClasses, null, resources.nextElement(), overridden, includedPackages, excludedPackages, onlyExtensionClassLoaderPackages);
                    }
                }
            } else {
                classLoadersToLoad.addAll(classLoaders);
            }
			//使用类加载资源加载器(ClassLoaderResourceLoader)来加载具体的资源
            Map<ClassLoader, Set<java.net.URL>> resources = ClassLoaderResourceLoader.loadResources(fileName, classLoadersToLoad);
           //遍历从所有资源文件中读取到资源url地址,key为类加载器,值为扩展文件url如夏所示
           //jar:file:/Users/song/.m2/repository/org/apache/dubbo/dubbo/3.0.7/dubbo-3.0.7.jar!/META-INF/dubbo/internal/org.apache.dubbo.common.extension.ExtensionInjector
            resources.forEach(((classLoader, urls) -> {
             //从文件中加载完资源之后开始根据类加载器和url加载具体的扩展类型,最后将扩展存放进extensionClasses集合
                loadFromClass(extensionClasses, overridden, urls, classLoader, includedPackages, excludedPackages, onlyExtensionClassLoaderPackages);
            }));
        } catch (Throwable t) {
            logger.error("Exception occurred when loading extension class (interface: " +
                type + ", description file: " + fileName + ").", t);
        }
    }
```

### 5.2.2 借助类加载器的getResources方法遍历所有文件进行扩展文件的查询

查找扩展类型对应的扩展文件的url方法:ClassLoaderResourceLoader类型的loadResources源码:

```cpp
public static Map<ClassLoader, Set<URL>> loadResources(String fileName, List<ClassLoader> classLoaders) {
		//
        Map<ClassLoader, Set<URL>> resources = new ConcurrentHashMap<>();
        //不同的类加载器之间使用不同的线程异步的方式进行扫描
        CountDownLatch countDownLatch = new CountDownLatch(classLoaders.size());
        for (ClassLoader classLoader : classLoaders) {
        	//多线程扫描,这个是个newCachedThreadPool的类型的线程池
            GlobalResourcesRepository.getGlobalExecutorService().submit(() -> {
            	//
                resources.put(classLoader, loadResources(fileName, classLoader));
                countDownLatch.countDown();
            });
        }
        try {
            countDownLatch.await();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        return Collections.unmodifiableMap(new LinkedHashMap<>(resources));
    }
```


加载具体类加载器中的资源文件的loadResources方法
```cpp
public static Set<URL> loadResources(String fileName, ClassLoader currentClassLoader) {
        Map<ClassLoader, Map<String, Set<URL>>> classLoaderCache;
        //第一次进来类加载器资源缓存是空的
        if (classLoaderResourcesCache == null || (classLoaderCache = classLoaderResourcesCache.get()) == null) {
        	//类对象锁 
            synchronized (ClassLoaderResourceLoader.class) {
                if (classLoaderResourcesCache == null || (classLoaderCache = classLoaderResourcesCache.get()) == null) {
                    classLoaderCache = new ConcurrentHashMap<>();
                    //创建一个类资源映射url的软引用缓存对象
                    //软引用(soft references)，用于帮助垃圾收集器管理内存使用和消除潜在的内存泄漏。当内存快要不足的时候，GC会迅速的把所有的软引用清除掉，释放内存空间
                    classLoaderResourcesCache = new SoftReference<>(classLoaderCache);
                }
            }
        }
        //第一次进来时候类加载器url映射缓存是空的,给类加载器缓存对象新增一个值,key是类加载器,值是map类型用来存储文件名对应的url集合
        if (!classLoaderCache.containsKey(currentClassLoader)) {
            classLoaderCache.putIfAbsent(currentClassLoader, new ConcurrentHashMap<>());
        }
        
        Map<String, Set<URL>> urlCache = classLoaderCache.get(currentClassLoader);
       //缓存中没有就从文件里面找
        if (!urlCache.containsKey(fileName)) {
            Set<URL> set = new LinkedHashSet<>();
            Enumeration<URL> urls;
            try {
            	//getResources这个方法是这样的:加载当前类加载器以及父类加载器所在路径的资源文件,将遇到的所有资源文件全部返回！这个可以理解为使用双亲委派模型中的类加载器 加载各个位置的资源文件
                urls = currentClassLoader.getResources(fileName);
                //native配置 是否为本地镜像(k可以参考官方文档:https://dubbo.apache.org/zh-cn/docs/references/graalvm/support-graalvm/
                boolean isNative = NativeUtils.isNative();
                if (urls != null) {
                //遍历找到的对应扩展的文件url将其加入集合
                    while (urls.hasMoreElements()) {
                        URL url = urls.nextElement();
                        if (isNative) {
                            //In native mode, the address of each URL is the same instead of different paths, so it is necessary to set the ref to make it different
                            //动态修改jdk底层url对象的ref变量为可访问,让我们在用反射时访问私有变量
                            setRef(url);
                        }
                        set.add(url);
                    }
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
            //存入缓存
            urlCache.put(fileName, set);
        }
        //返回结果
        return urlCache.get(fileName);
    }
```


### 5.2.3 使用找到的扩展资源url加载具体扩展类型到内存

ExtensionLoader类型中的loadFromClass方法 遍历url 开始加载扩展类型
```java
 private void loadFromClass(Map<String, Class<?>> extensionClasses, boolean overridden, Set<java.net.URL> urls, ClassLoader classLoader,
                               String[] includedPackages, String[] excludedPackages, String[] onlyExtensionClassLoaderPackages) {
        if (CollectionUtils.isNotEmpty(urls)) {
            for (java.net.URL url : urls) {
                loadResource(extensionClasses, classLoader, url, overridden, includedPackages, excludedPackages, onlyExtensionClassLoaderPackages);
            }
        }
    }
```

ExtensionLoader类型中的loadResource方法 使用IO流读取扩展文件的内容
读取内容之前我这里先贴一下我们参考的扩展注入类型的文件中的内容如下所示:

```cpp
adaptive=org.apache.dubbo.common.extension.inject.AdaptiveExtensionInjector
spi=org.apache.dubbo.common.extension.inject.SpiExtensionInjector
scopeBean=org.apache.dubbo.common.beans.ScopeBeanExtensionInjector
```

扩展中的文件都是一行一行的,并且扩展名字和扩展类型之间使用等号隔开=
了解了文件内容之后 应该下面的代码大致思路就知道了,我们可以详细看下

```java
private void loadResource(Map<String, Class<?>> extensionClasses, ClassLoader classLoader,
                              java.net.URL resourceURL, boolean overridden, String[] includedPackages, String[] excludedPackages, String[] onlyExtensionClassLoaderPackages) {
        try {
           //这里固定了文件的格式为utf8
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(resourceURL.openStream(), StandardCharsets.UTF_8))) {
                String line;
                String clazz;
                //按行读取 例如读取到的内容:spring=org.apache.dubbo.config.spring.extension.SpringExtensionInjector
                while ((line = reader.readLine()) != null) {
                //不知道为何会有这么一行代码删除#之后的字符串
                    final int ci = line.indexOf('#');
                    if (ci >= 0) {
                        line = line.substring(0, ci);
                    }
                    line = line.trim();
                    //
                    if (line.length() > 0) {
                        try {
                            String name = null;
                            //扩展文件可能如上面我贴的那样 名字和类型等号隔开,也可能是无类型的,例如扩展加载策略使用的是JDK自带的方式services内容中只包含具体的扩展类型
                            int i = line.indexOf('=');
                            if (i > 0) {
                                name = line.substring(0, i).trim();
                                clazz = line.substring(i + 1).trim();
                            } else {
                                clazz = line;
                            }
                            //isExcluded是否为加载策略要排除的配置,参数这里为空代表全部类型不排除
                            //isIncluded是否为加载策略包含的类型,参数这里为空代表全部文件皆可包含				
                            //onlyExtensionClassLoaderPackages参数是否只有扩展类的类加载器可以加载扩展,其他扩展类型的类加载器不能加载扩展 这里结果为false 不排除任何类加载器
                            if (StringUtils.isNotEmpty(clazz) && !isExcluded(clazz, excludedPackages) && isIncluded(clazz, includedPackages)
                                && !isExcludedByClassLoader(clazz, classLoader, onlyExtensionClassLoaderPackages)) {
                                //根据类全路径加载类到内存
                                loadClass(extensionClasses, resourceURL, Class.forName(clazz, true, classLoader), name, overridden);
                            }
                        } catch (Throwable t) {
                            IllegalStateException e = new IllegalStateException("Failed to load extension class (interface: " + type +
                                ", class line: " + line + ") in " + resourceURL + ", cause: " + t.getMessage(), t);
                            exceptions.put(line, e);
                        }
                    }
                }
            }
        } catch (Throwable t) {
            logger.error("Exception occurred when loading extension class (interface: " +
                type + ", class file: " + resourceURL + ") in " + resourceURL, t);
        }
    }
```


ExtensionLoader类型中的loadClass方法加载具体的类到内存
```java
private void loadClass(Map<String, Class<?>> extensionClasses, java.net.URL resourceURL, Class<?> clazz, String name,
                           boolean overridden) throws NoSuchMethodException {
           //当前clazz是否为type的子类型
           //这里第一次访问到的type是ExtensionInjector,clazz是SpringExtensionInjector 父子类型关系满足情况
        if (!type.isAssignableFrom(clazz)) {
            throw new IllegalStateException("Error occurred when loading extension class (interface: " +
                type + ", class line: " + clazz.getName() + "), class "
                + clazz.getName() + " is not subtype of interface.");
        }
        //扩展子类型是否存在这个注解@Adaptive
        if (clazz.isAnnotationPresent(Adaptive.class)) {
            cacheAdaptiveClass(clazz, overridden);
        } else if (isWrapperClass(clazz)) {
        //扩展子类型构造器中是否有这个类型的接口 (这个可以想象下我们了解的Java IO流中的类型使用到的装饰器模式 构造器传个类型)
            cacheWrapperClass(clazz);
        } else {
        //无自适应注解,也没有构造器是扩展类型参数 ,这个name我们在扩展文件中找到了就是等号前面那个
            if (StringUtils.isEmpty(name)) {
            //低版本中可以使用@Extension 扩展注解来标注扩展类型,这里获取注解有两个渠道:
            //先查询@Extension注解是否存在如果存在则取value值,如果不存在@Extension注解则获取当前类型的名字
                name = findAnnotationName(clazz);
                if (name.length() == 0) {
                    throw new IllegalStateException("No such extension name for the class " + clazz.getName() + " in the config " + resourceURL);
                }
            }
		//获取扩展名字数组,扩展名字可能为逗号隔开的
            String[] names = NAME_SEPARATOR.split(name);
            if (ArrayUtils.isNotEmpty(names)) {
              //@Activate注解修饰的扩展
                cacheActivateClass(clazz, names[0]);
                for (String n : names) {
                	//cachedNames缓存集合缓存当前扩展类型的扩展名字
                    cacheName(clazz, n);
                    //将扩展类型加入结果集合extensionClasses中,不允许覆盖的话出现同同名字扩展将抛出异常
                    saveInExtensionClass(extensionClasses, clazz, n, overridden);
                }
            }
        }
    }
```


 
ExtensionLoader类型中cacheAdaptiveClass
Adaptive 机制，即扩展类的自适应机制。即其可以指定想要加载的扩展名，也可以不指定。若不指定，则直接加载默认的扩展类。即其会自动匹配，做到自适应。其是通过@Adaptive注解实现的。
自适应注解修饰的扩展同一个扩展名字只能有一个扩展实现类型, 扩展策略中提供的参数overridden是否允许覆盖扩展覆盖
```java
private void cacheAdaptiveClass(Class<?> clazz, boolean overridden) {
        if (cachedAdaptiveClass == null || overridden) {
        	 //成员变量存储这个自适应扩展类型
            cachedAdaptiveClass = clazz;
        } else if (!cachedAdaptiveClass.equals(clazz)) {
            throw new IllegalStateException("More than 1 adaptive class found: "
                + cachedAdaptiveClass.getName()
                + ", " + clazz.getName());
        }
    }
```

ExtensionLoader类型中cacheWrapperClass
Wrapper 机制，即扩展类的包装机制。就是对扩展类中的 SPI 接口方法进行增强，进行包装，是 AOP 思想的体现，是 Wrapper 设计模式的应用。一个 SPI 可以包含多个 Wrapper。这个也是可以同一个类型多个
```java
private void cacheWrapperClass(Class<?> clazz) {
        if (cachedWrapperClasses == null) {
            cachedWrapperClasses = new ConcurrentHashSet<>();
        }
        //缓存这个Wrapper类型的扩展
        cachedWrapperClasses.add(clazz);
    }
```


 
ExtensionLoader类型中cacheActivateClass
Activate用于激活扩展类的。 这个扩展类型可以出现多个比如过滤器可以同一个扩展名字多个过滤器实现,所以不需要有override判断
Activate 机制，即扩展类的激活机制。通过指定的条件来激活当前的扩展类。其是通过@Activate 注解实现的。

```cpp
private void cacheActivateClass(Class<?> clazz, String name) {
        Activate activate = clazz.getAnnotation(Activate.class);
        if (activate != null) {
        	//缓存Activate类型的扩展
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

ExtensionLoader类型中的saveInExtensionClass方法
  
  上面扩展对象加载了这么多最终的目的就是将这个扩展类型存放进结果集合extensionClasses中,扩展策略中提供的参数overridden是否允许覆盖扩展覆盖
```cpp
private void saveInExtensionClass(Map<String, Class<?>> extensionClasses, Class<?> clazz, String name, boolean overridden) {
        Class<?> c = extensionClasses.get(name);
        if (c == null || overridden) {
        //上面扩展对象加载了这么多最终的目的就是将这个扩展类型存放进结果集合中
            extensionClasses.put(name, clazz);
        } else if (c != clazz) {
            // duplicate implementation is unacceptable
            unacceptableExceptions.add(name);
            String duplicateMsg = "Duplicate extension " + type.getName() + " name " + name + " on " + c.getName() + " and " + clazz.getName();
            logger.error(duplicateMsg);
            throw new IllegalStateException(duplicateMsg);
        }
    }
```


## 5.3 自适应扩展代理对象的代码生成与编译
### 5.3.1 自适应扩展对象的创建

Dubbo 的**自适应扩展机制**中如果 **自己生成了自适应扩展的代理类**

Dubbo 的自适应扩展为了做什么：**在运行时动态调用扩展方法**。以及怎么做的：生成扩展代理类。比如: 代理类中根据 URL 获取扩展名，使用 SPI 加载扩展类，并调用同名方法，返回执行结果。

看了上一个章节,我们了解到了Dubbo是如何通过扫描目录来查询扩展实现类的这一次我们看下扩展类我们找到了之后,如果这个扩展类型未加上这个@Adaptive注解那么是如何创建这个类型的,接下来看createAdaptiveExtensionClass方法,这个方法是借助字节码工具来动态生成所需要的扩展类型的包装类型的代码,这个代码在编译时我们可能看不到,但是在Debug的时候,我们还是可以看到这个对象名字的,但是往往Debug的时候又进不到具体的代码位置,这里可以注意下

当扩展点的方法被@Adaptive修饰时，在Dubbo初始化扩展点时会自动生成和编译一个动态的Adaptive类。

下面我们可以以interface org.apache.dubbo.rpc.Protocol 这个协议扩展类型来看 协议扩展类型目前没有一个是带有自适应注解的
```java
private Class<?> createAdaptiveExtensionClass() {
        // Adaptive Classes' ClassLoader should be the same with Real SPI interface classes' ClassLoader
        //获取加载器
        ClassLoader classLoader = type.getClassLoader();
        try {
        	// //native配置 是否为本地镜像(可以参考官方文档:https://dubbo.apache.org/zh-cn/docs/references/graalvm/support-graalv
            if (NativeUtils.isNative()) {
                return classLoader.loadClass(type.getName() + "$Adaptive");
            }
        } catch (Throwable ignore) {

        }
        //创建一个代码生成器,来生成代码 详细内容我们就下一章来看
        String code = new AdaptiveClassCodeGenerator(type, cachedDefaultName).generate();
        //获取编译器
        org.apache.dubbo.common.compiler.Compiler compiler = extensionDirector.getExtensionLoader(
    org.apache.dubbo.common.compiler.Compiler.class).getAdaptiveExtension();
            //生成的代码进行编译
        return compiler.compile(type, code, classLoader);
    }
```



## 5.4 为扩展对象的set方法注入自适应扩展对象
在4.4.5小节中我们已经讲解了获取扩展类型实现类, 创建扩展对象
      
```java
 T instance = (T) getAdaptiveExtensionClass().newInstance();
        
```

接下来就让我们来看下为扩展对象的set方法注入自适应的扩展对象
调用方法代码如下:

```java
   //注入扩展对象之前的回调方法
injectExtension(instance);
```

ExtensionLoader类型的injectExtension方法具体代码如下:
```cpp
private T injectExtension(T instance) {
		//如果注入器为空则直接返回当前对象
        if (injector == null) {
            return instance;
        }

        try {
        	//获取当前对象的当前类的所有方法
            for (Method method : instance.getClass().getMethods()) {
            	//是否为set方法 不是的话则跳过,在这里合法的set方法满足3个条件:
            	//set开头,参数只有一个,public修饰
                if (!isSetter(method)) {
                    continue;
                }
                /**
                 * Check {@link DisableInject} to see if we need auto injection for this property
                 */
                 //方法上面是否有注解DisableInject修饰,这种情况也直接跳过
                if (method.isAnnotationPresent(DisableInject.class)) {
                    continue;
                }
                //方法的参数如果是原生类型也跳过
                Class<?> pt = method.getParameterTypes()[0];
                if (ReflectUtils.isPrimitives(pt)) {
                    continue;
                }
                try {
                	//获取set方法对应的成员变量如setProtocol 属性为protocol
                    String property = getSetterProperty(method);
                    //根据参数类型如Protocol和属性名字如protocol获取应该注入的对象
                    Object object = injector.getInstance(pt, property);
                    if (object != null) {
                    	//执行对应对象和对应参数的这个方法
                        method.invoke(instance, object);
                    }
                } catch (Exception e) {
                    logger.error("Failed to inject via method " + method.getName()
                        + " of interface " + type.getName() + ": " + e.getMessage(), e);
                }

            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        return instance;
    }
```
###  5.4.1 获取注入对象
这里我们主要来看下如何通过注入器找到需要注入的那个对象 调用代码如下:
```cpp
  Object object = injector.getInstance(pt, property);
```
  在前面看注入器扩展对象的获取的时候是会获取到ExtensionInjector扩展的一个自适应扩展注入器实现类型  AdaptiveExtensionInjector,这个地方对应的getInstance也是这个扩展里面的,我们来看下它的方法:
  
```java
 @Override
    public <T> T getInstance(Class<T> type, String name) {
    	//遍历所有的扩展注入器
        for (ExtensionInjector injector : injectors) {
        	//遍历所有的扩展注入器,如果可以获取到扩展对象则直接返回
            T extension = injector.getInstance(type, name);
            if (extension != null) {
                return extension;
            }
        }
        return null;
    }
```
可以看到上面代码按扩展注入器顺序来遍历的第一个找到的对象就直接返回了,

  这个AdaptiveExtensionInjector在初始化的时候会获取所有的ExtensionInjector的扩展,非自适应的,它本身自适应的扩展,这里会获取非自适应的扩展列表一共有3个按顺序为:
- ScopeBeanExtensionInjector  
- SpiExtensionInjector 
- SpringExtensionInjector


接下来我们详细看下每种扩展注入器加载扩展对象的策略:

###  5.4.2 域模型中的Bean扩展注入器ScopeBeanExtensionInjector

ScopeBeanExtensionInjector的getInstance方法:
每个域模型都会有个ScopeBeanFactory类型的对象用于存储共享对象,并且域模型之间按照层级子类型的Bean工厂可以从父域的Bean工厂中查询对象,

```cpp
@Override
    public <T> T getInstance(Class<T> type, String name) {
        return beanFactory.getBean(name, type);
    }
```

ScopeBeanFactory的getBean方法
先从当前域空间查询对象,如果找不到对应类型的扩展对象则从父域工厂查询扩展对象
```cpp
public <T> T getBean(String name, Class<T> type) {
		//当前域下注册的扩展对象
        T bean = getBeanInternal(name, type);
        if (bean == null && parent != null) {
        	//父域中查找扩展对象
            return parent.getBean(name, type);
        }
        return bean;
    }
```

ScopeBeanFactory的getBeanInternal方法
从当前域下找注册的参数类型的对象
```cpp
private <T> T getBeanInternal(String name, Class<T> type) {
        checkDestroyed();
        // All classes are derived from java.lang.Object, cannot filter bean by it
        if (type == Object.class) {
            return null;
        }
        List<BeanInfo> candidates = null;
        BeanInfo firstCandidate = null;
        //遍历列表查询
        for (BeanInfo beanInfo : registeredBeanInfos) {
            // if required bean type is same class/superclass/interface of the registered bean
            if (type.isAssignableFrom(beanInfo.instance.getClass())) {
                if (StringUtils.isEquals(beanInfo.name, name)) {
                    return (T) beanInfo.instance;
                } else {
                    // optimize for only one matched bean
                    if (firstCandidate == null) {
                        firstCandidate = beanInfo;
                    } else {
                        if (candidates == null) {
                            candidates = new ArrayList<>();
                            candidates.add(firstCandidate);
                        }
                        candidates.add(beanInfo);
                    }
                }
            }
        }

        // if bean name not matched and only single candidate
        if (candidates != null) {
            if (candidates.size() == 1) {
                return (T) candidates.get(0).instance;
            } else if (candidates.size() > 1) {
                List<String> candidateBeanNames = candidates.stream().map(beanInfo -> beanInfo.name).collect(Collectors.toList());
                throw new ScopeBeanException("expected single matching bean but found " + candidates.size() + " candidates for type [" + type.getName() + "]: " + candidateBeanNames);
            }
        } else if (firstCandidate != null) {
            return (T) firstCandidate.instance;
        }
        return null;
    }
```

### 5.4.3 SPI扩展机制注入器SpiExtensionInjector

SPI是Dubbo自行实现的一套扩展机制,我们来看下它是如何查找扩展对象的

```cpp
@Override
    public <T> T getInstance(Class<T> type, String name) {
    	//如果是一个标准的被@SPI注解修饰的扩展接口则满足条件
        if (type.isInterface() && type.isAnnotationPresent(SPI.class)) {
        //使用扩展访问器来获取对应类型的扩展加载器
            ExtensionLoader<T> loader = extensionAccessor.getExtensionLoader(type);
            if (loader == null) {
                return null;
            }
            //使用对应类型的扩展加载器来加载自适应扩展 这个加载的扩展可以参考4.4.6小节
            if (!loader.getSupportedExtensions().isEmpty()) {
                return loader.getAdaptiveExtension();
            }
        }
        return null;
    }
```



### 5.4.4 Spring扩展注入器
SpringExtensionInjector

Spring扩展注入器主要是用来从Spring容器中查询当前类型的Bean是否存在的,如下代码直接看代码吧
```cpp
@Override
    @SuppressWarnings("unchecked")
    public <T> T getInstance(Class<T> type, String name) {

        if (context == null) {
            // ignore if spring context is not bound
            return null;
        }

        //check @SPI annotation ,类型需要满足SPI机制 @SPI修饰的接口
        if (type.isInterface() && type.isAnnotationPresent(SPI.class)) {
            return null;
        }
		//从Spring容器中查询Bean
        T bean = getOptionalBean(context, name, type);
        if (bean != null) {
            return bean;
        }

        //logger.warn("No spring extension (bean) named:" + name + ", try to find an extension (bean) of type " + type.getName());
        return null;
    }
```


```cpp
private <T> T getOptionalBean(ListableBeanFactory beanFactory, String name, Class<T> type) {
		//要搜索的扩展名字为空就根据类型搜索
        if (StringUtils.isEmpty(name)) {
        //返回与给定类型（包括子类）匹配的bean的名称，对于FactoryBeans
            String[] beanNamesForType = beanFactory.getBeanNamesForType(type, true, false);
            if (beanNamesForType != null) {
                if (beanNamesForType.length == 1) {
                //返回指定bean的实例，该实例可以是共享的，也可以是独立的。
                //根据Bean Name和类型 查询具体的扩展对象
                    return beanFactory.getBean(beanNamesForType[0], type);
                } else if (beanNamesForType.length > 1) {
                    throw new IllegalStateException("Expect single but found " + beanNamesForType.length + " beans in spring context: " +
                        Arrays.toString(beanNamesForType));
                }
            }
        } else {
        	//扩展名字不为空则直接通过名字搜索Bean
            if (beanFactory.containsBean(name)) {
                return beanFactory.getBean(name, type);
            }
        }
        return null;
    }
```
 

原文：  [《自适应扩展对象的创建getAdaptiveExtension方法》](https://blog.elastic.link/2022/07/10/dubbo/5-dubbo-de-spi-kuo-zhan-ji-zhi-yu-zi-gua-ying-kuo-zhan-dui-xiang-de-chuang-jian-yu-kuo-zhan-wen-jian-de-sao-miao-yuan-ma-jie-xi/)
