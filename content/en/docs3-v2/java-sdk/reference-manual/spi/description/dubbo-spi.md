---
type: docs
title: "Extension Point Development Guide"
linkTitle: "Extension Point Development Guide"
weight: 0
description: "This article introduces the principle and implementation details of Dubbo SPI"
---

## 1 Introduction

The full name of SPI is Service Provider Interface, which is a service discovery mechanism. The essence of SPI is to configure the fully qualified name of the interface implementation class in the file, and the service loader reads the configuration file and loads the implementation class. In this way, the implementation class can be dynamically replaced for the interface at runtime. Because of this feature, we can easily provide extended functions for our programs through the SPI mechanism. The SPI mechanism is also used in third-party frameworks. For example, Dubbo loads all components through the SPI mechanism. However, Dubbo does not use Java's native SPI mechanism, but enhances it to better meet the needs. In Dubbo, SPI is a very important module. Based on SPI, we can easily expand Dubbo.
In Dubbo, SPI has two main usages, one is to load fixed extension classes, and the other is to load adaptive extension classes. These two methods will be described in detail below.
Special attention should be paid to: In Dubbo, classes loaded based on SPI extensions are singletons.

### 1.1 Load fixed extension classes

If you were asked to design and load fixed extension classes, what would you do?
A common idea is to read the configuration file in a specific directory, then parse out the full class name, instantiate the class through the reflection mechanism, and then store the class in the collection. If necessary, directly from the collection Take. The implementation in Dubbo is also such an idea.
However, in Dubbo, the implementation is more complete, and it implements the functions of IOC and AOP. IOC means that if this extended class depends on other properties, Dubbo will automatically inject this property. How is this function implemented? A common idea is to get the setter of this extended class
method, call the setter method for property injection. What does AOP refer to? This means that Dubbo can inject its wrapper class into the extension class. For example, DubboProtocol is an extension class of Protocol, and ProtocolListenerWrapper is a wrapper class of DubboProtocol.

### 1.2 Load adaptive extension class

First explain the usage scenarios of adaptive extension classes. For example, we have a requirement that when calling a certain method, we can call different implementation classes based on parameter selection. Somewhat similar to the factory method, different instance objects are constructed based on different parameters.
The idea of implementation in Dubbo is similar to this, but the implementation of Dubbo is more flexible, and its implementation is somewhat similar to the strategy mode. Each extension class is equivalent to a strategy. Based on the URL message bus, the parameters are passed to the ExtensionLoader, and the corresponding extension class is loaded based on the parameters through the ExtensionLoader to realize the dynamic call to the target instance at runtime.

## 2. Dubbo SPI source code analysis

### 2.1 Load fixed extension class

In Dubbo, the entry point for SPI to load fixed extension classes is the getExtension method of ExtensionLoader. Next, we will analyze the process of obtaining extension class objects in detail.

```java
public T getExtension(String name) {
    if (name == null || name. length() == 0)
        throw new IllegalArgumentException("Extension name == null");
    if ("true".equals(name)) {
        // Get the default extension implementation class
        return getDefaultExtension();
    }
    // Holder, as the name suggests, is used to hold the target object
    Holder<Object> holder = cachedInstances. get(name);
    // This logic ensures that only one thread can create a Holder object
    if (holder == null) {
        cachedInstances. putIfAbsent(name, new Holder<Object>());
        holder = cachedInstances. get(name);
    }
    Object instance = holder. get();
    // double check
    if (instance == null) {
        synchronized (holder) {
            instance = holder. get();
            if (instance == null) {
                // create extension instance
                instance = createExtension(name);
                // set the instance to the holder
                holder.set(instance);
            }
        }
    }
    return (T) instance;
}
```

The logic of the above code is relatively simple. First, the cache is checked, and if the cache misses, an extended object is created. Let's take a look at the process of creating an extended object.

```java
private T createExtension(String name, boolean wrap) {
    // Load all extension classes from the configuration file to get the mapping relationship table from "configuration item name" to "configuration class"
    Class<?> clazz = getExtensionClasses().get(name);
    // If there is no extension of the interface, or the implementation class of the interface does not allow repetition but actually repeats, an exception is thrown directly
    if (clazz == null || unacceptableExceptions. contains(name)) {
        throw findException(name);
    }
    try {
        T instance = (T) EXTENSION_INSTANCES. get(clazz);
        // This code ensures that the extended class will only be constructed once, which is a singleton.
        if (instance == null) {
            EXTENSION_INSTANCES.putIfAbsent(clazz, clazz.getDeclaredConstructor().newInstance());
            instance = (T) EXTENSION_INSTANCES. get(clazz);
        }
        // Inject dependencies into the instance
        injectExtension(instance);

        // Automatically wrap if wrapping is enabled.
        // For example, I defined the extension of DubboProtocol based on Protocol, but in fact, DubboProtocol is not directly used in Dubbo, but its wrapper class
        // ProtocolListenerWrapper
        if (wrap) {

            List<Class<?>> wrapperClassesList = new ArrayList<>();
            if (cachedWrapperClasses != null) {
                wrapperClassesList.addAll(cachedWrapperClasses);
                wrapperClassesList.sort(WrapperComparator. COMPARATOR);
                Collections. reverse(wrapperClassesList);
            }
    
            // Loop to create Wrapper instances
            if (CollectionUtils. isNotEmpty(wrapperClassesList)) {
                for (Class<?> wrapperClass : wrapperClassesList) {
                    Wrapper wrapper = wrapperClass. getAnnotation(Wrapper. class);
                    if (wrapper == null
                            || (ArrayUtils.contains(wrapper.matches(), name) && !ArrayUtils.contains(wrapper.mismatches(), name))) {
                        // Pass the current instance as a parameter to the constructor of Wrapper, and create a Wrapper instance through reflection.
                        // Then inject dependencies into the Wrapper instance, and finally assign the Wrapper instance to the instance variable again
                        instance = injectExtension((T) wrapperClass. getConstructor(type). newInstance(instance));
                    }
                }
            }
        }
        // initialization
        initExtension(instance);
        return instance;
    } catch (Throwable t) {
        throw new IllegalStateException("Extension instance (name: " + name + ", class: " +
                type + ") couldn't be instantiated: " + t. getMessage(), t);
    }
}
```

The logic of the createExtension method is a little more complicated, including the following steps:

1. Get all extension classes through getExtensionClasses
2. Create an extended object through reflection
3. Inject dependencies into extended objects
4. Wrap the extension object in the corresponding Wrapper object
5. Initialize the extension object

Among the above steps, the first step is the key to loading the extension class, and the third and fourth steps are the specific implementation of Dubbo IOC and AOP. In the following chapters, we will focus on analyzing the logic of the getExtensionClasses method and briefly introduce the specific implementation of Dubbo IOC.

### 2.1.1 Get all extension classes

Before we obtain the extension class by name, we first need to parse out the mapping relationship table from the extension item name to the extension class (Map\<name, extension class\>) according to the configuration file, and then extract it from the mapping relationship table according to the extension item name The corresponding extension class can be. The code analysis of the relevant process is as follows:

```java
private Map<String, Class<?>> getExtensionClasses() {
    // Get the loaded extension class from the cache
    Map<String, Class<?>> classes = cachedClasses. get();
    // double check
    if (classes == null) {
        synchronized (cachedClasses) {
            classes = cachedClasses. get();
            if (classes == null) {
                // load extension class
                classes = loadExtensionClasses();
                cachedClasses.set(classes);
            }
        }
    }
    return classes;
}
```

Here is also to check the cache first, and if the cache misses, lock it through synchronized. After locking, check the cache again and find it empty. At this time, if classes is still null, the extension class is loaded through loadExtensionClasses. Let's analyze the logic of the loadExtensionClasses method.

```java
private Map<String, Class<?>> loadExtensionClasses() {
    // Cache the default SPI extension
    cacheDefaultExtensionName();

    Map<String, Class<?>> extensionClasses = new HashMap<>();
    
    // Load the files in the specified folder based on the policy
    // Currently there are four strategies to read the configuration files in META-INF/services/ META-INF/dubbo/ META-INF/dubbo/internal/ META-INF/dubbo/external/ respectively
    for (LoadingStrategy strategy : strategies) {
        loadDirectory(extensionClasses, strategy.directory(), type.getName(), strategy.preferExtensionClassLoader(), strategy.overridden(), strategy.excludedPackages());
        loadDirectory(extensionClasses, strategy.directory(), type.getName().replace("org.apache", "com.alibaba"), strategy.preferExtensionClassLoader(), strategy.overridden(), strategy.excludedPackages());
    }

    return extensionClasses;
}
```

The loadExtensionClasses method does two things in total, one is to parse the SPI annotations, and the other is to call the loadDirectory method to load the specified folder configuration file. The process of parsing SPI annotations is relatively simple, so there is no need to say more. Let's take a look at what loadDirectory does.

```java
private void loadDirectory(Map<String, Class<?>> extensionClasses, String dir, String type,
                           boolean extensionLoaderClassLoaderFirst, boolean overridden, String... excludedPackages) {
    // fileName = folder path + type fully qualified name
    String fileName = dir + type;
    try {
        Enumeration<java.net. URL> urls = null;
        ClassLoader classLoader = findClassLoader();

        // try to load from ExtensionLoader's ClassLoader first
        if (extensionLoaderClassLoaderFirst) {
            ClassLoader extensionLoaderClassLoader = ExtensionLoader. class. getClassLoader();
            if (ClassLoader. getSystemClassLoader() != extensionLoaderClassLoader) {
                urls = extensionLoaderClassLoader. getResources(fileName);
            }
        }
        // Load all files with the same name according to the file name
        if (urls == null || !urls.hasMoreElements()) {
            if (classLoader != null) {
                urls = classLoader. getResources(fileName);
            } else {
                urls = ClassLoader. getSystemResources(fileName);
            }
        }

        if (urls != null) {
            while (urls. hasMoreElements()) {
                java.net.URL resourceURL = urls.nextElement();
                // load resources
                loadResource(extensionClasses, classLoader, resourceURL, overridden, excludedPackages);
            }
        }
    } catch (Throwable t) {
        logger.error("Exception occurred when loading extension class (interface: " +
                type + ", description file: " + fileName + ").", t);
    }
}
```

The loadDirectory method first obtains all resource links through classLoader, and then loads resources through the loadResource method. Let's go ahead and take a look at the implementation of the loadResource method.

```java
private void loadResource(Map<String, Class<?>> extensionClasses, ClassLoader classLoader,
                          java.net.URL resourceURL, boolean overridden, String... excludedPackages) {
    try {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resourceURL. openStream(), StandardCharsets. UTF_8))) {
            String line;
            String clazz = null;
            // Read configuration content line by line
            while ((line = reader. readLine()) != null) {
                // locate # characters
                final int ci = line. indexOf('#');
                if (ci >= 0) {
                    // Intercept the string before #, the content after # is a comment, which needs to be ignored
                    line = line. substring(0, ci);
                }
                line = line. trim();
                if (line. length() > 0) {
                    try {
                        String name = null;
                        // Use the equal sign = as the boundary to intercept the key and value
                        int i = line. indexOf('=');
                        if (i > 0) {
                            name = line.substring(0, i).trim();
                            clazz = line.substring(i + 1).trim();
                        } else {
                            clazz = line;
                        }
                        // Load the class and cache the class through the loadClass method
                        if (StringUtils.isNotEmpty(clazz) && !isExcluded(clazz, excludedPackages)) {
                            loadClass(extensionClasses, resourceURL, Class. forName(clazz, true, classLoader), name, overridden);
                        }
                    } catch (Throwable t) {
                        IllegalStateException e = new IllegalStateException("Failed to load extension class (interface: " + type + ", class line: " + line + ") in " + resourceURL + ", cause: " + t.getMessage(), t);
                        exceptions. put(line, e);
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

The loadResource method is used to read and parse configuration files, load classes through reflection, and finally call the loadClass method for other operations. The loadClass method is mainly used to operate the cache. The logic of this method is as follows:

```java
private void loadClass(Map<String, Class<?>> extensionClasses, java.net.URL resourceURL, Class<?> clazz, String name,
                       boolean overridden) throws NoSuchMethodException {
    if (!type.isAssignableFrom(clazz)) {
        throw new IllegalStateException("Error occurred when loading extension class (interface: " +
                type + ", class line: " + clazz. getName() + "), class "
                + clazz.getName() + " is not subtype of interface.");
    }
    // Check if there are Adaptive annotations on the target class
    if (clazz. isAnnotationPresent(Adaptive. class)) {
        cacheAdaptiveClass(clazz, overridden);
    } else if (isWrapperClass(clazz)) {
        // cache wrapper class
        cacheWrapperClass(clazz);
    } else {
        // Enter here, indicating that this class is just an ordinary extension class
        // Check if clazz has a default constructor, if not, throw an exception
        clazz. getConstructor();
        if (StringUtils. isEmpty(name)) {
            // If name is empty, try to get name from Extension annotation, or use lowercase class name as name
            name = findAnnotationName(clazz);
            if (name. length() == 0) {
                throw new IllegalStateException("No such extension name for the class " + clazz. getName() + " in the config " + resourceURL);
            }
        }

        String[] names = NAME_SEPARATOR. split(name);
        if (ArrayUtils. isNotEmpty(names)) {
            // If the class has the Activate annotation, use the first element of the names array as the key,
            // Store the mapping relationship between name and Activate annotation object
            cacheActivateClass(clazz, names[0]);
            for (String n : names) {
                // Store the mapping relationship from Class to name
                cacheName(clazz, n);
                // Store the mapping relationship from name to Class.
                // If there are multiple implementation classes corresponding to the same extension, whether overriding is allowed based on the override parameter, if not, an exception is thrown.
                saveInExtensionClass(extensionClasses, clazz, n, overridden);
            }
        }
    }
}
```

As above, the loadClass method operates different caches, such as cachedAdaptiveClass, cachedWrapperClasses and cachedNames, etc. Apart from that, there is no other logic in this method.

At this point, the analysis of the process of caching class loading is over. There is nothing particularly complicated in the whole process. You can analyze it step by step, and you can debug it if you don’t understand it. Next, let's talk about Dubbo IOC.

### 2.1.2 Dubbo IOC

Dubbo IOC injects dependencies through the setter method. Dubbo first obtains all methods of the instance through reflection, and then traverses the method list to detect whether the method name has the characteristics of a setter method. If so, obtain the dependent object through ObjectFactory, and finally call the setter method through reflection to set the dependency to the target object. The code corresponding to the whole process is as follows:

```java
private T injectExtension(T instance) {

    if (objectFactory == null) {
        return instance;
    }

    try {
        // traverse all methods of the target class
        for (Method method : instance. getClass(). getMethods()) {
            // Check whether the method starts with set, and the method has only one parameter, and the method access level is public
            if (!isSetter(method)) {
                continue;
            }
            /**
             * Detect whether there is DisableInject annotation modification.
             */
            if (method. getAnnotation(DisableInject. class) != null) {
                continue;
            }
            
            /**
             * Detect whether the ScopeModelAware and ExtensionAccessorAware classes are implemented, and if implemented, do not inject
             */
            if (method. getDeclaringClass() == ScopeModelAware. class) {
                    continue;
            }
            if (instance instanceof ScopeModelAware || instance instanceof ExtensionAccessorAware) {
                if (ignoredInjectMethodsDesc. contains(ReflectUtils. getDesc(method))) {
                    continue;
                }
            }
            
            // Primitive types are not injected
            Class<?> pt = method. getParameterTypes()[0];
            if (ReflectUtils. isPrimitives(pt)) {
                continue;
            }

            try {
                // Get the attribute name, for example, the setName method corresponds to the attribute name name
                String property = getSetterProperty(method);
                // Get dependent objects from ObjectFactory
                Object object = objectFactory. getExtension(pt, property);
                if (object != null) {
                    // inject
                    method.invoke(instance, object);
                }
            } catch (Exception e) {
                logger.error("Failed to inject via method " + method.getName()
                        + " of interface " + type. getName() + ": " + e. getMessage(), e);
            }

        }
    } catch (Exception e) {
        logger. error(e. getMessage(), e);
    }
    return instance;
}
```

In the above code, the type of the objectFactory variable is AdaptiveExtensionFactory, and AdaptiveExtensionFactory internally maintains an ExtensionFactory list for storing other types of ExtensionFactory. Dubbo currently provides two types of ExtensionFactory, namely SpiExtensionFactory and SpringExtensionFactory. The former is used to create adaptive extensions, and the latter is used to obtain the required extensions from Spring's IOC container. The codes of these two classes are not very complicated, so I won't analyze them one by one here.

Dubbo IOC currently only supports setter injection. Generally speaking, the logic is relatively simple and easy to understand.

### 2.2 Load adaptive extension class

The meaning of adaptive extension class is that, based on parameters, a specific target class is dynamically selected at runtime and then executed.
In Dubbo, many extensions are loaded through the SPI mechanism, such as Protocol, Cluster, LoadBalance, etc. Sometimes, some extensions do not want to be loaded during the framework startup phase, but want to be loaded according to runtime parameters when the extension method is called. This sounds contradictory. If the extension is not loaded, the extension methods cannot be called (except static methods). If the extension method is not called, the extension cannot be loaded. For this contradictory problem, Dubbo has solved it well through the adaptive expansion mechanism. The implementation logic of the self-adaptive expansion mechanism is relatively complicated. First, Dubbo will generate code with proxy functions for the expansion interface. Then compile this code through javassist or jdk to get the Class class. Finally, the proxy class is created through reflection, and the whole process is more complicated.

The entry point for loading adaptive extension classes is the getAdaptiveExtension method of ExtensionLoader.

```java
public T getAdaptiveExtension() {
    // Get the adaptive extension from the cache
    Object instance = cachedAdaptiveInstance. get();
    if (instance == null) {
        // If there is an exception, throw it directly
        if (createAdaptiveInstanceError != null) {
            throw new IllegalStateException("Failed to create adaptive instance: " +
                    createAdaptiveInstanceError.toString(),
                    createAdaptiveInstanceError);
        }

        synchronized (cachedAdaptiveInstance) {
            instance = cachedAdaptiveInstance. get();
            // double check
            if (instance == null) {
                try {
                    // create adaptive extension
                    // There are two cases here: one is that there is an Adaptive class, and the other is that an Adaptive class needs to be generated
                    instance = createAdaptiveExtension();
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

The getAdaptiveExtension method will first check the cache, and if the cache misses, call the createAdaptiveExtension method to create an adaptive extension. Next, let's look at the code of the createAdaptiveExtension method.

```java
private T createAdaptiveExtension() {
    try {
        // Get the adaptive extension class and instantiate it through reflection
        return injectExtension((T) getAdaptiveExtensionClass(). newInstance());
    } catch (Exception e) {
        throw new IllegalStateException("Can not create adaptive extension ...");
    }
}
```
The code of the createAdaptiveExtension method is relatively small, but it contains three logics, which are as follows:

1. Call the getAdaptiveExtensionClass method to obtain the adaptive extension Class object
2. Instantiation via reflection
3. Call the injectExtension method to inject dependencies into the extension instance

The first two logics are easy to understand, and the third logic is used to inject dependencies into adaptive extension objects. This logic may seem redundant, but it is necessary to exist. Here is a brief explanation. As mentioned earlier, there are two types of adaptive extensions in Dubbo, one is manually coded and the other is automatically generated. There may be some dependencies in the hand-coded Adaptive extension, while the automatically generated Adaptive extension will not depend on other classes. The purpose of calling the injectExtension method here is to inject dependencies for the hand-coded adaptive extension, which requires everyone to pay attention. Regarding the injectExtension method, it has been analyzed in the previous article, so I won’t go into details here. Next, analyze the logic of the getAdaptiveExtensionClass method.

```java
private Class<?> getAdaptiveExtensionClass() {
    // Get all extension classes through SPI
    getExtensionClasses();
    // Check the cache, if the cache is not empty, return the cache directly
    if (cachedAdaptiveClass != null) {
        return cachedAdaptiveClass;
    }
    // Create an adaptive extension class
    return cachedAdaptiveClass = createAdaptiveExtensionClass();
}
```

The getAdaptiveExtensionClass method also contains three logics, as follows:

1. Call getExtensionClasses to get all extension classes
2. Check the cache, if the cache is not empty, return the cache
3. If the cache is empty, call createAdaptiveExtensionClass to create an adaptive extension class

These three logics seem unremarkable, and there seems to be no need to talk about them. But there are some details hidden in this bland code that need to be explained. First, let’s start with the first logic. The getExtensionClasses method is used to get all the implementation classes of an interface. For example, this method can obtain DubboProtocol, HttpProtocol, InjvmProtocol and other implementation classes of the Protocol interface. In the process of obtaining the implementation class, if an implementation class is modified by the Adaptive annotation, then the class will be assigned to the cachedAdaptiveClass variable. At this point, the condition of the second step in the above steps is satisfied (the cache is not empty), just return the cachedAdaptiveClass directly. If all implementation classes are not modified by Adaptive annotations, then execute the logic of the third step to create adaptive extension classes. The relevant code is as follows:

```java
private Class<?> createAdaptiveExtensionClass() {
    // Build adaptive extension code
    String code = new AdaptiveClassCodeGenerator(type, cachedDefaultName).generate();
    ClassLoader classLoader = findClassLoader();
    // Get the compiler implementation class
    org.apache.dubbo.common.compiler.Compiler compiler = ExtensionLoader.getExtensionLoader(org.apache.dubbo.common.compiler.Compiler.class).getAdaptiveExtension();
    // Compile the code and generate Class
    return compiler.compile(code, classLoader);
}
```

The createAdaptiveExtensionClass method is used to generate an adaptive extension class. This method first generates the source code of the adaptive extension class, and then compiles the source code through a Compiler instance (Dubbo uses javassist as the compiler by default) to obtain a proxy class Class instance. Next, we will focus on the logic of proxy class code generation, and analyze other logic by yourself.

### 2.2.1 Adaptive extension class code generation

AdaptiveClassCodeGenerator#generate method generates extension class code
```java
public String generate() {
    // If there is no method in the interface modified by the @Adaptive annotation, an exception is thrown directly
    if (!hasAdaptiveMethod()) {
        throw new IllegalStateException("No adaptive method exist on extension " + type.getName() + ", refuse to create the adaptive class!");
    }

    StringBuilder code = new StringBuilder();
    // Generate package name, import, method, etc.
    code.append(generatePackageInfo());
    code.append(generateImports());
    code.append(generateClassDeclaration());

    Method[] methods = type. getMethods();
    for (Method method : methods) {
        code.append(generateMethod(method));
    }
    code.append("}");

    if (logger. isDebugEnabled()) {
        logger. debug(code. toString());
    }
    return code. toString();
}

```

#### 2.2.2 Generation method

In the above code, the logic of the generation method is the most critical, let's analyze it in detail.
```java
private String generateMethod(Method method) {
    String methodReturnType = method. getReturnType(). getCanonicalName();
    String methodName = method. getName();
    // generate method content
    String methodContent = generateMethodContent(method);
    String methodArgs = generateMethodArguments(method);
    String methodThrows = generateMethodThrows(method);
    return String. format(CODE_METHOD_DECLARATION, methodReturnType, methodName, methodArgs, methodThrows, methodContent);
}
```

generateMethodContent Analysis

```java
private String generateMethodContent(Method method) {
    // This method must be decorated with @Adaptive annotation
    Adaptive adaptiveAnnotation = method. getAnnotation(Adaptive. class);
    StringBuilder code = new StringBuilder(512);
    if (adaptiveAnnotation == null) {
        // Without @Adaptive annotation modification, exception information is generated
        return generateUnsupported(method);
    } else {
        // Get the index of the URL on the parameter list
        int urlTypeIndex = getUrlTypeIndex(method);
        
        if (urlTypeIndex != -1) {
            // Generate a null check for the URL if it exists on the parameter list
            code.append(generateUrlNullCheck(urlTypeIndex));
        } else {
            // If there is no parameter of URL type in the parameter list, then it depends on whether the parameter object on the parameter list contains the getUrl method
            // If there is, generate a URL null check
            code.append(generateUrlAssignmentIndirectly(method));
        }
        // parse the value attribute on the Adaptive annotation
        String[] value = getMethodAdaptiveValue(adaptiveAnnotation);
        // If there is a parameter of type Invocation on the parameter list, generate a null check and get the methodName.
        boolean hasInvocation = hasInvocationArgument(method);
        
        code.append(generateInvocationArgumentNullCheck(method));
        // This logic is mainly to generate extName (that is, the extension)
        // Divided into multiple situations:
        // 1. Does defaultExtName exist?
        // 2. Whether there is an invocation type parameter in the parameter
        // 3. Whether to generate a proxy for the protocol
        // Why should the protocol be considered separately? Because there is a method to get the protocol value in the URL
        code.append(generateExtNameAssignment(value, hasInvocation));
        // check extName == null?
        code.append(generateExtNameNullCheck(value));
    
        // generate get extension (using ExtensionLoader.getExtension method)
        code.append(generateExtensionAssignment());

        // generate return statement
        code.append(generateReturnAndInvocation(method));
    }

    return code. toString();
}
```

The above logic mainly does the following things:
1. Check whether the Adaptive annotation is modified on the method
2. When generating code for a method, there must be a URL on the parameter list (or a URL in the parameter object)
3. Use ExtensionLoader.getExtension to get the extension
4. Execute the corresponding method

### 2.2.3 Attach an example of dynamically generated code

```java
package org.apache.dubbo.common.extension.adaptive;

import org.apache.dubbo.common.extension.ExtensionLoader;


public class HasAdaptiveExt$Adaptive implements org.apache.dubbo.common.extension.adaptive.HasAdaptiveExt {
    public java.lang.String echo(org.apache.dubbo.common.URL arg0,
        java. lang. String arg1) {
        // URL null check
        if (arg0 == null) {
            throw new IllegalArgumentException("url == null");
        }

        org.apache.dubbo.common.URL url = arg0;
        // get the extension
        String extName = url. getParameter("has. adaptive. ext", "adaptive");
        // extension null check
        if (extName == null) {
            throw new IllegalStateException(
                "Failed to get extension (org.apache.dubbo.common.extension.adaptive.HasAdaptiveExt) name from url (" +
                url.toString() + ") use keys([has.adaptive.ext])");
        }
        // get extension
        org.apache.dubbo.common.extension.adaptive.HasAdaptiveExt extension = (org.apache.dubbo.common.extension.adaptive.HasAdaptiveExt) ExtensionLoader.getExtensionLoader(org.apache.dubbo.common.extension.adaptive.HasAdaptiveExt.class)
                                                                                                                                                         .getExtension(extName);
        // Execute the corresponding method
        return extension.echo(arg0, arg1);
    }
}

```


## 3. SPI extension example

### 3.1 Load fixed extension class

### 3.1.1 Write SPI interface and implementation class

Whether it is Java SPI or SPI implemented in Dubbo, you need to write an interface. However, the interface in Dubbo needs to be decorated with @SPI annotation.

```java
@SPI
public interface DemoSpi {
    void say();
}

public class DemoSpiImpl implements DemoSpi {
    public void say() {
    }
}
```

#### 3.1.2 Put the implementation class in a specific directory

From the above code, we can see that when dubbo loads the extension class, it will read from four directories. We create a new file named after the DemoSpi interface in the META-INF/dubbo directory, the content is as follows:


```text
demoSpiImpl = com.xxx.xxx.DemoSpiImpl (full class name for the implementation class of the DemoSpi interface)
```

#### 3.1.3 Use

```java
public class DubboSPITest {

    @Test
    public void sayHello() throws Exception {
        ExtensionLoader<DemoSpi> extensionLoader =
            ExtensionLoader. getExtensionLoader(DemoSpi. class);
        DemoSpi dmeoSpi = extensionLoader. getExtension("demoSpiImpl");
        optimusPrime. sayHello();
    }
}
```

### 3.2 Load adaptive extension class

This takes Protocol as an example to illustrate

### 3.2.1 Protocol interface (extract some core methods)

```java
@SPI("dubbo")
public interface Protocol {
    @Adaptive
    <T> Exporter<T> export(Invoker<T> invoker) throws RpcException;

    @Adaptive
    <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException;
}

public class DubboProtocol extends AbstractProtocol {
     …
    @Override
    public <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException {
        return protocolBindingRefer(type, url);
    }
    
    @Override
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
         …
        return exporter;
    }
}
```

### 3.2.2 Put the implementation class in a specific directory
In dubbo, the configuration path is META-INF/dubbo/internal/org.apache.dubbo.rpc.Protocol
```text
dubbo=org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol
```

It should be noted that in dubbo, DubboProtocol is not used directly, but its wrapper class is used.

### 3.2.3 Use

```java
public class DubboAdaptiveTest {

    @Test
    public void sayHello() throws Exception {
        URL url = URL.valueOf("dubbo://localhost/test");
        Protocol adaptiveProtocol = ExtensionLoader.getExtensionLoader(Protocol.class).getAdaptiveExtension();
        adaptiveProtocol. refer(type, url);
    }
}
```