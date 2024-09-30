---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/dubbo-spi/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/dubbo-spi/
description: This article introduces the principles and implementation details of Dubbo SPI.
linkTitle: Extension Point Development Guide
title: Extension Point Development Guide
type: docs
weight: 0
---

## 1. Introduction to Dubbo SPI Extensions

The extension mechanism in Dubbo is similar to the <a href="https://www.baeldung.com/java-spi" target="_blank">JDK standard SPI extension points</a> principle. Dubbo has made certain modifications and enhancements:

* The JDK standard SPI instantiates all extension point implementations at once, which can waste resources if the extension implementations are resource-intensive but not used.
* If an extension point fails to load, JDK SPI does not provide detailed information to locate the problem, while Dubbo SPI logs the actual failure reason on failure and prints it out.
* Adds [IOC](#23-ioc-mechanism), [AOP](#24-aop-mechanism) capabilities.
* Adds sorting capabilities.
* Adds conditional activation capabilities.
* Provides a series of more flexible APIs, such as [getting all SPI extension implementations](./#21-getting-all-extension-implementations), [querying a specific extension implementation by name](./#211-getting-all-extensions), querying extensions by type, and querying extension implementations that match conditions.

### 1.1 Definition of SPI

The SPI plugin in Dubbo is standard Java Interface definition and must contain the `@org.apache.dubbo.common.extension.SPI` annotation:

```java
@SPI(value = "dubbo", scope = ExtensionScope.FRAMEWORK)
public interface Protocol {
	// ...
}
```

The definition of the `@SPI` annotation is as follows:

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE})
public @interface SPI {
    /**
     * Default extension name
     */
    String value() default "";

    /**
     * Scope of SPI, default value is application scope.
     */
    ExtensionScope scope() default ExtensionScope.APPLICATION;
}
```

### 1.2 SPI Loading Process

The whole process of Dubbo loading extensions is as follows:

![//imgs/v3/concepts/extension-load.png](/imgs/v3/concepts/extension-load.png)

The main steps are 4:
* Read and parse configuration files.
* Cache all extension implementations.
* Instantiate the corresponding extension implementation based on the extension name executed by the user.
* Perform IOC injection for extension instance properties and instantiate wrapper classes for extensions to implement AOP features.

## 2. Source Code Analysis of Dubbo SPI

### 2.1 Getting a Specific Extension Class by Name

In Dubbo, the entry for loading fixed extension classes is the getExtension method of ExtensionLoader. Below, we analyze the acquisition process of the extension class object in detail.

```java
public T getExtension(String name) {
    if (name == null || name.length() == 0)
        throw new IllegalArgumentException("Extension name == null");
    if ("true".equals(name)) {
        // Get the default extension implementation class
        return getDefaultExtension();
    }
    // Holder, as the name suggests, is used to hold the target object
    Holder<Object> holder = cachedInstances.get(name);
    // This logic ensures that only one thread can create the Holder object
    if (holder == null) {
        cachedInstances.putIfAbsent(name, new Holder<Object>());
        holder = cachedInstances.get(name);
    }
    Object instance = holder.get();
    // Double-check
    if (instance == null) {
        synchronized (holder) {
            instance = holder.get();
            if (instance == null) {
                // Create extension instance
                instance = createExtension(name);
                // Set instance in holder
                holder.set(instance);
            }
        }
    }
    return (T) instance;
}
```

The logic of the code above is quite straightforward; it first checks the cache, and if it doesn't hit the cache, it creates the extension object. Next, let's look at the process of creating the extension object.

```java
private T createExtension(String name, boolean wrap) {
    // Load all extension classes from the configuration file, which can obtain the "configuration item name" to "configuration class" mapping table
    Class<?> clazz = getExtensionClasses().get(name);
    // If there is no extension for the interface, or the implementation class of the interface does not allow duplication but actually duplicates, throw an exception directly
    if (clazz == null || unacceptableExceptions.contains(name)) {
        throw findException(name);
    }
    try {
        T instance = (T) EXTENSION_INSTANCES.get(clazz);
        // This code ensures that the extension class is constructed only once, meaning it's a singleton.
        if (instance == null) {
            EXTENSION_INSTANCES.putIfAbsent(clazz, clazz.getDeclaredConstructor().newInstance());
            instance = (T) EXTENSION_INSTANCES.get(clazz);
        }
        // Inject dependencies into the instance
        injectExtension(instance);

        // If wrapping is enabled, automatically wrap it.
        // For example, I defined the extension of DubboProtocol based on Protocol, but in Dubbo, it's not directly used as DubboProtocol; rather, it's used as its wrapper class
        // ProtocolListenerWrapper
        if (wrap) {

            List<Class<?>> wrapperClassesList = new ArrayList<>();
            if (cachedWrapperClasses != null) {
                wrapperClassesList.addAll(cachedWrapperClasses);
                wrapperClassesList.sort(WrapperComparator.COMPARATOR);
                Collections.reverse(wrapperClassesList);
            }
    
            // Loop to create Wrapper instances
            if (CollectionUtils.isNotEmpty(wrapperClassesList)) {
                for (Class<?> wrapperClass : wrapperClassesList) {
                    Wrapper wrapper = wrapperClass.getAnnotation(Wrapper.class);
                    if (wrapper == null
                            || (ArrayUtils.contains(wrapper.matches(), name) && !ArrayUtils.contains(wrapper.mismatches(), name))) {
                        // Pass the current instance as a parameter to the Wrapper constructor and create the Wrapper instance through reflection.
                        // Then inject dependencies into the Wrapper instance, and finally assign the Wrapper instance back to the instance variable
                        instance = injectExtension((T) wrapperClass.getConstructor(type).newInstance(instance));
                    }
                }
            }
        }
        // Initialization
        initExtension(instance);
        return instance;
    } catch (Throwable t) {
        throw new IllegalStateException("Extension instance (name: " + name + ", class: " +
                type + ") couldn't be instantiated: " + t.getMessage(), t);
    }
}
```

The logic of createExtension method is slightly more complex and consists of the following steps:

1. Load all extension classes through getExtensionClasses.
2. Create the extension object through reflection.
3. Inject dependencies into the extension object.
4. Wrap the extension object in the corresponding Wrapper object.
5. Initialize the extension object.

Among the above steps, the first step is crucial for loading extension classes, while steps three and four are the specific implementations of Dubbo IOC and AOP. In the following chapters, we will focus on analyzing the logic of the getExtensionClasses method and briefly introduce the specific implementation of Dubbo IOC.

#### 2.1.1 Getting All Extension Classes

Before we get extension classes by name, we first need to parse the configuration file to obtain a mapping table from extension item names to extension classes (Map<Name, Extension Class>), and then extract the corresponding extension class from this mapping table based on the extension item names. The relevant process code analysis is as follows:

```java
private Map<String, Class<?>> getExtensionClasses() {
    // Get already loaded extension classes from cache
    Map<String, Class<?>> classes = cachedClasses.get();
    // Double check
    if (classes == null) {
        synchronized (cachedClasses) {
            classes = cachedClasses.get();
            if (classes == null) {
                // Load extension classes
                classes = loadExtensionClasses();
                cachedClasses.set(classes);
            }
        }
    }
    return classes;
}
```

Here, we also check the cache first, and if not found, lock through synchronized. After locking, check the cache again, and if it's still null, load the extension classes through loadExtensionClasses. Next, we analyze the logic of loadExtensionClasses method.

```java
private Map<String, Class<?>> loadExtensionClasses() {
    // Cache default SPI extension name
    cacheDefaultExtensionName();

    Map<String, Class<?>> extensionClasses = new HashMap<>();
    
    // Load files from the specified folder based on strategies
    // Currently, there are four strategies to read configuration files in the directories: META-INF/services/, META-INF/dubbo/, META-INF/dubbo/internal/, META-INF/dubbo/external/
    for (LoadingStrategy strategy : strategies) {
        loadDirectory(extensionClasses, strategy.directory(), type.getName(), strategy.preferExtensionClassLoader(), strategy.overridden(), strategy.excludedPackages());
        loadDirectory(extensionClasses, strategy.directory(), type.getName().replace("org.apache", "com.alibaba"), strategy.preferExtensionClassLoader(), strategy.overridden(), strategy.excludedPackages());
    }

    return extensionClasses;
}
```

The loadExtensionClasses method performs two main tasks: parsing the SPI annotation and calling the loadDirectory method to load the specified folder's configuration files. The SPI annotation parsing process is straightforward and does not require further explanation. Next, let's look at what loadDirectory does.

```java
private void loadDirectory(Map<String, Class<?>> extensionClasses, String dir, String type,
                           boolean extensionLoaderClassLoaderFirst, boolean overridden, String... excludedPackages) {
    // fileName = folder path + type fully qualified name 
    String fileName = dir + type;
    try {
        Enumeration<java.net.URL> urls = null;
        ClassLoader classLoader = findClassLoader();

        // try to load from ExtensionLoader's ClassLoader first
        if (extensionLoaderClassLoaderFirst) {
            ClassLoader extensionLoaderClassLoader = ExtensionLoader.class.getClassLoader();
            if (ClassLoader.getSystemClassLoader() != extensionLoaderClassLoader) {
                urls = extensionLoaderClassLoader.getResources(fileName);
            }
        }
        // Load all files with the same name based on the file name
        if (urls == null || !urls.hasMoreElements()) {
            if (classLoader != null) {
                urls = classLoader.getResources(fileName);
            } else {
                urls = ClassLoader.getSystemResources(fileName);
            }
        }

        if (urls != null) {
            while (urls.hasMoreElements()) {
                java.net.URL resourceURL = urls.nextElement();
                // Load resources
                loadResource(extensionClasses, classLoader, resourceURL, overridden, excludedPackages);
            }
        }
    } catch (Throwable t) {
        logger.error("Exception occurred when loading extension class (interface: " +
                type + ", description file: " + fileName + ").", t);
    }
}
```

The loadDirectory method first obtains all resource links through classLoader, then loads the resource through the loadResource method. Let's continue to see the implementation of the loadResource method.

```java
private void loadResource(Map<String, Class<?>> extensionClasses, ClassLoader classLoader,
                          java.net.URL resourceURL, boolean overridden, String... excludedPackages) {
    try {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resourceURL.openStream(), StandardCharsets.UTF_8))) {
            String line;
            String clazz = null;
            // Read configuration content line by line
            while ((line = reader.readLine()) != null) {
                // Locate the # character
                final int ci = line.indexOf('#');
                if (ci >= 0) {
                    // Take the substring before the #, and ignore the content after #
                    line = line.substring(0, ci);
                }
                line = line.trim();
                if (line.length() > 0) {
                    try {
                        String name = null;
                        // Split between key and value based on the equal sign =
                        int i = line.indexOf('=');
                        if (i > 0) {
                            name = line.substring(0, i).trim();
                            clazz = line.substring(i + 1).trim();
                        } else {
                            clazz = line;
                        }
                        // Load class and cache it through the loadClass method
                        if (StringUtils.isNotEmpty(clazz) && !isExcluded(clazz, excludedPackages)) {
                            loadClass(extensionClasses, resourceURL, Class.forName(clazz, true, classLoader), name, overridden);
                        }
                    } catch (Throwable t) {
                        IllegalStateException e = new IllegalStateException("Failed to load extension class (interface: " + type + ", class line: " + line + ") in " + resourceURL + ", cause: " + t.getMessage(), t);
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

The loadResource method reads and parses configuration files, loads classes through reflection, and finally calls the loadClass method for other operations. The loadClass method is primarily used for cache operations, and its logic is as follows:

```java
private void loadClass(Map<String, Class<?>> extensionClasses, java.net.URL resourceURL, Class<?> clazz, String name,
                       boolean overridden) throws NoSuchMethodException {
    if (!type.isAssignableFrom(clazz)) {
        throw new IllegalStateException("Error occurred when loading extension class (interface: " +
                type + ", class line: " + clazz.getName() + "), class "
                + clazz.getName() + " is not subtype of interface.");
    }
    // Check if the target class has the Adaptive annotation
    if (clazz.isAnnotationPresent(Adaptive.class)) {
        cacheAdaptiveClass(clazz, overridden);
    } else if (isWrapperClass(clazz)) {
        // Cache wrapper classes
        cacheWrapperClass(clazz);
    } else {
        // If we reach here, it means the class is just an ordinary extension class
        // Check if clazz has a default constructor; if not, throw an exception
        clazz.getConstructor();
        if (StringUtils.isEmpty(name)) {
            // If name is empty, try to get name from the Extension annotation or use lowercase class name as the name
            name = findAnnotationName(clazz);
            if (name.length() == 0) {
                throw new IllegalStateException("No such extension name for the class " + clazz.getName() + " in the config " + resourceURL);
            }
        }

        String[] names = NAME_SEPARATOR.split(name);
        if (ArrayUtils.isNotEmpty(names)) {
            // If there is an Activate annotation on the class, use the first element of the names array as the key,
            // store the mapping of name to the Activate annotation object
            cacheActivateClass(clazz, names[0]);
            for (String n : names) {
                // Store Class to name mapping
                cacheName(clazz, n);
                // Store name to Class mapping.
                // If the same extension name corresponds to multiple implementation classes, based on the override parameter whether overrides are allowed,
                // if not allowed, throw an exception.
                saveInExtensionClass(extensionClasses, clazz, n, overridden);
            }
        }
    }
}
```

As seen, the loadClass method operates on different caches, such as cachedAdaptiveClass, cachedWrapperClasses, and cachedNames, among others. Apart from this, there aren't many other logics in the method.

Thus, the process of loading cached classes has been fully analyzed. The entire process is not particularly complex; analyze it step by step, and if there are any unclear parts, you can debug.

### 2.2 Loading Adaptive Extension Classes

First, let’s explain the scenario of using adaptive extension classes. For example, if we have a demand to select different implementation classes based on parameters when calling a specific method, this is somewhat similar to the factory method, creating different instance objects based on different parameters. The idea implemented in Dubbo is quite similar, but Dubbo's implementation is more flexible and akin to the strategy pattern. Each extension class essentially represents a strategy, passing parameters to the ExtensionLoader via the URL message bus to load the corresponding extension class based on parameters, achieving dynamic invocation of the target instance at runtime.

The meaning of adaptive extension classes is to dynamically select the specific target class at runtime based on parameters and then execute.

In Dubbo, many extensions are loaded through the SPI mechanism, such as Protocol, Cluster, LoadBalance, etc. Sometimes, some extensions do not wish to be loaded at the framework startup stage, but rather want to be loaded when the extension method is called, based on runtime parameters. This may sound contradictory. If the extension is not loaded, then the extension method cannot be called (except for static methods). If the extension method has not been called, then the extension cannot be loaded. For this contradictory issue, Dubbo solves it well through the adaptive extension mechanism. The implementation logic of the adaptive extension mechanism is fairly complex; first, Dubbo will generate proxy code for the extension interfaces. It then compiles this code using Javassist or JDK, resulting in a Class instance. Finally, it uses reflection to create the proxy class, making the entire process quite complex.

The entry point for loading adaptive extension classes is the getAdaptiveExtension method of ExtensionLoader.

```java
public T getAdaptiveExtension() {
    // Get adaptive extension from cache
    Object instance = cachedAdaptiveInstance.get();
    if (instance == null) {
        // If there is an exception, directly throw
        if (createAdaptiveInstanceError != null) {
            throw new IllegalStateException("Failed to create adaptive instance: " +
                    createAdaptiveInstanceError.toString(),
                    createAdaptiveInstanceError);
        }

        synchronized (cachedAdaptiveInstance) {
            instance = cachedAdaptiveInstance.get();
            // double check
            if (instance == null) {
                try {
                    // Create adaptive extension
                    // There are two situations: one is having an Adaptive class, and another is needing to generate an Adaptive class
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

The getAdaptiveExtension method first checks the cache, and if not hit, it calls the createAdaptiveExtension method to create an adaptive extension. Next, let’s look at the code for the createAdaptiveExtension method.

```java
private T createAdaptiveExtension() {
    try {
        // Get the adaptive extension class and instantiate it via reflection
        return injectExtension((T) getAdaptiveExtensionClass().newInstance());
    } catch (Exception e) {
        throw new IllegalStateException("Cannot create adaptive extension ...");
    }
}
```
The createAdaptiveExtension method is relatively short but contains three logics as follows:

1. Call the getAdaptiveExtensionClass method to get the adaptive extension Class object.
2. Instantiate it via reflection.
3. Call the injectExtension method to inject dependencies into the extension instance.

The first two logics are easy to understand, while the third logic is to inject dependencies into the adaptive extension object. This logic may seem redundant, but it is necessary. The reason is simple. It has been mentioned earlier that there are two types of adaptive extensions in Dubbo: one is manually coded, and the other is automatically generated. There may be dependencies in the manually coded adaptive extensions, while automatically generated Adaptive extensions will not depend on other classes. The purpose of calling the injectExtension method here is to inject dependencies into manually coded adaptive extensions; this point needs to be noted. Regarding the injectExtension method, it has been analyzed earlier, and there is no need to elaborate further. Next, we will analyze the logic of the getAdaptiveExtensionClass method.

```java
private Class<?> getAdaptiveExtensionClass() {
    // Get all extension classes via SPI
    getExtensionClasses();
    // Check the cache; if not null, return it directly
    if (cachedAdaptiveClass != null) {
        return cachedAdaptiveClass;
    }
    // Create the adaptive extension class
    return cachedAdaptiveClass = createAdaptiveExtensionClass();
}
```

The getAdaptiveExtensionClass method also includes three logics, as follows:

1. Call getExtensionClasses to get all extension classes.
2. Check the cache; if not null, return it.
3. If the cache is null, call createAdaptiveExtensionClass to create the adaptive extension class.

These three logics appear plain and may not seem to require much explanation. However, there are some details hidden in these plain codes that need highlighting. Firstly, starting from the first logic, the getExtensionClasses method is used to obtain all implementation classes of a certain interface. For instance, this method can obtain the DubboProtocol, HttpProtocol, InjvmProtocol, etc., implementation classes for the Protocol interface. In the process of retrieving implementation classes, if any implementation class is annotated with Adaptive, that class will be assigned to the cachedAdaptiveClass variable. At this point, the condition for the second step above is satisfied (the cache is not null), and it directly returns cachedAdaptiveClass. If all implementation classes are not annotated with Adaptive, the third-step logic is executed to create the adaptive extension class. The relevant code is as follows:

```java
private Class<?> createAdaptiveExtensionClass() {
    // Build the adaptive extension code
    String code = new AdaptiveClassCodeGenerator(type, cachedDefaultName).generate();
    ClassLoader classLoader = findClassLoader();
    // Get the compiler implementation class
    org.apache.dubbo.common.compiler.Compiler compiler = ExtensionLoader.getExtensionLoader(org.apache.dubbo.common.compiler.Compiler.class).getAdaptiveExtension();
    // Compile the code and generate Class
    return compiler.compile(code, classLoader);
}
```

The createAdaptiveExtensionClass method is used to generate adaptive extension classes. This method first generates the source code for the adaptive extension class, then compiles this code using an instance of Compiler (by default, Dubbo uses Javassist as a compiler) to obtain the Class instance for the proxy class. Next, we will focus on the logic for generating the proxy class code; the other logic can be analyzed independently.

#### 2.2.1 Code Generation for Adaptive Extension Classes

AdaptiveClassCodeGenerator#generate method generates the extension class code
```java
public String generate() {
    // If there is no method in the interface marked with @Adaptive, throw an exception directly
    if (!hasAdaptiveMethod()) {
        throw new IllegalStateException("No adaptive method exist on extension " + type.getName() + ", refuse to create the adaptive class!");
    }

    StringBuilder code = new StringBuilder();
    // Generate package name, imports, methods, etc.
    code.append(generatePackageInfo());
    code.append(generateImports());
    code.append(generateClassDeclaration());

    Method[] methods = type.getMethods();
    for (Method method : methods) {
        code.append(generateMethod(method));
    }
    code.append("}");

    if (logger.isDebugEnabled()) {
        logger.debug(code.toString());
    }
    return code.toString();
}

```

#### 2.2.2 Generate Method

The logic in the method generation part above is most crucial, so we analyze it in detail.
```java
private String generateMethod(Method method) {
    String methodReturnType = method.getReturnType().getCanonicalName();
    String methodName = method.getName();
    // Generate method content
    String methodContent = generateMethodContent(method);
    String methodArgs = generateMethodArguments(method);
    String methodThrows = generateMethodThrows(method);
    return String.format(CODE_METHOD_DECLARATION, methodReturnType, methodName, methodArgs, methodThrows, methodContent);
}
```

Analyzing the generateMethodContent logic

```java
private String generateMethodContent(Method method) {
    // The method must have the @Adaptive annotation
    Adaptive adaptiveAnnotation = method.getAnnotation(Adaptive.class);
    StringBuilder code = new StringBuilder(512);
    if (adaptiveAnnotation == null) {
        // Not annotated with @Adaptive, generate exception message
        return generateUnsupported(method);
    } else {
        // Get the index of the URL type in the parameter list
        int urlTypeIndex = getUrlTypeIndex(method);
        
        if (urlTypeIndex != -1) {
            // If there is a URL in the parameter list, generate a null check for the URL
            code.append(generateUrlNullCheck(urlTypeIndex));
        } else {
            // If there is no URL type parameter in the parameter list, check if the parameter object has a getUrl method
            // If yes, generate a URL null check
            code.append(generateUrlAssignmentIndirectly(method));
        }
        // Parse the value attribute from the Adaptive annotation
        String[] value = getMethodAdaptiveValue(adaptiveAnnotation);
        // If there is an Invocation type parameter in the parameter list, generate a null check and obtain methodName.
        boolean hasInvocation = hasInvocationArgument(method);
        
        code.append(generateInvocationArgumentNullCheck(method));
        // This logic primarily generates extName (which is the extension name)
        // It consists of multiple conditions:
        // 1. Whether defaultExtName exists
        // 2. Whether there is an invocation type parameter in the parameters
        // 3. Whether it is generating a proxy for the protocol
        // Why treat the protocol separately? Because the protocol value can be obtained from the URL.
        code.append(generateExtNameAssignment(value, hasInvocation));
        // check extName == null?
        code.append(generateExtNameNullCheck(value));
    
        // Generate obtaining the extension (using ExtensionLoader.getExtension method)
        code.append(generateExtensionAssignment());

        // Generate return statement
        code.append(generateReturnAndInvocation(method));
    }

    return code.toString();
}
```

The logic above mainly accomplishes the following tasks:
1. Check if the method is annotated with Adaptive.
2. Generate code for the method ensuring the URL is in the parameter list (or in the parameter object).
3. Use ExtensionLoader.getExtension to get the extension.
4. Execute the corresponding method.

#### 2.2.3 Example of Code Generated Dynamically

```java
package org.apache.dubbo.common.extension.adaptive;

import org.apache.dubbo.common.extension.ExtensionLoader;


public class HasAdaptiveExt$Adaptive implements org.apache.dubbo.common.extension.adaptive.HasAdaptiveExt {
    public java.lang.String echo(org.apache.dubbo.common.URL arg0,
        java.lang.String arg1) {
        // URL null check
        if (arg0 == null) {
            throw new IllegalArgumentException("url == null");
        }

        org.apache.dubbo.common.URL url = arg0;
        // Get extension name
        String extName = url.getParameter("has.adaptive.ext", "adaptive");
        // Extension name null check
        if (extName == null) {
            throw new IllegalStateException(
                "Failed to get extension (org.apache.dubbo.common.extension.adaptive.HasAdaptiveExt) name from url (" +
                url.toString() + ") use keys([has.adaptive.ext])");
        }
        // Get extension
        org.apache.dubbo.common.extension.adaptive.HasAdaptiveExt extension = (org.apache.dubbo.common.extension.adaptive.HasAdaptiveExt) ExtensionLoader.getExtensionLoader(org.apache.dubbo.common.extension.adaptive.HasAdaptiveExt.class)
                                                                                                                                                         .getExtension(extName);
        // Execute corresponding method
        return extension.echo(arg0, arg1);
    }
}

```

### 2.3 IOC Mechanism

Dubbo IOC injects dependencies via setter methods. Firstly, Dubbo will use reflection to obtain all methods of the instance, then traverse the method list to check if the method name features setter methods. If found, it uses ObjectFactory to obtain the dependency object and finally calls the setter method via reflection to set the dependency into the target object. The relevant code for the entire process is as follows:

```java
private T injectExtension(T instance) {

    if (objectFactory == null) {
        return instance;
    }

    try {
        // Traverse all methods of the target class
        for (Method method : instance.getClass().getMethods()) {
            // Check if the method starts with set, has a single parameter and is public
            if (!isSetter(method)) {
                continue;
            }
            /**
             * Check for DisableInject annotation.
             */
            if (method.getAnnotation(DisableInject.class) != null) {
                continue;
            }

            /**
             * Check if it implements ScopeModelAware, ExtensionAccessorAware classes; if so, do not inject.
             */
            if (method.getDeclaringClass() == ScopeModelAware.class) {
                    continue;
            }
            if (instance instanceof ScopeModelAware || instance instanceof ExtensionAccessorAware) {
                if (ignoredInjectMethodsDesc.contains(ReflectUtils.getDesc(method))) {
                    continue;
                }
            }

            // Do not inject for primitive types.
            Class<?> pt = method.getParameterTypes()[0];
            if (ReflectUtils.isPrimitives(pt)) {
                continue;
            }

            try {
                // Obtain property name, for example, setName corresponds to property name name.
                String property = getSetterProperty(method);
                // Get the dependency object from ObjectFactory.
                Object object = objectFactory.getExtension(pt, property);
                if (object != null) {
                    // Inject
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

In the code above, the objectFactory variable is of type AdaptiveExtensionFactory, which maintains a list of ExtensionFactories to store other types of ExtensionFactories. There are currently two types of ExtensionFactory provided, namely SpiExtensionFactory and SpringExtensionFactory. The former is used to create adaptive extensions, while the latter is used to get the required extensions from the Spring IOC container. The code for these two classes is not particularly complex, so there is no need for detailed analysis.

Dubbo IOC currently only supports setter-based injection, and overall, the logic is relatively simple and easy to understand.

### 2.4 AOP Mechanism

The Dubbo AOP mechanism is implemented using the wrapper design pattern. To become an AOP wrapper class, it must satisfy the following three conditions:
1. The wrapper class must implement the SPI interface, such as `class QosProtocolWrapper implements Protocol` in the example below.
2. The constructor must include a same SPI parameter, such as `QosProtocolWrapper(Protocol protocol)` in the example below.
3. The wrapper class must be written to the configuration file just like ordinary SPI implementations, such as `resources/META-INF/dubbo/internal/org.apache.dubbo.rpc.Protocol`.

```java
public class QosProtocolWrapper implements Protocol, ScopeModelAware {
    private final Protocol protocol;
    public QosProtocolWrapper(Protocol protocol) {
        if (protocol == null) {
            throw new IllegalArgumentException("protocol == null");
        }
        this.protocol = protocol;
    }
}
```

In the configuration file `resources/META-INF/dubbo/internal/org.apache.dubbo.rpc.Protocol`, it is written as follows:

```properties
qos=org.apache.dubbo.qos.protocol.QosProtocolWrapper
```

When attempting to obtain and load SPI extension instances through `getExtension(name)`, the Dubbo framework will determine all wrapper class implementations that meet the above three conditions and wrap the wrapper class around the instance in sequence, thus achieving the effect of AOP interception.

Here is the implementation logic for wrapper determination and loading; you can also use the @Wrapper annotation to control the activation conditions of the wrapper class:

```java
private T createExtension(String name, boolean wrap) {
	Class<?> clazz = getExtensionClasses().get(name);
	T instance = (T) extensionInstances.get(clazz);
	// ...
	if (wrap) { // If the caller indicates that AOP is needed, i.e., wrap=true
		List<Class<?>> wrapperClassesList = new ArrayList<>();
		if (cachedWrapperClasses != null) {
			wrapperClassesList.addAll(cachedWrapperClasses);
			wrapperClassesList.sort(WrapperComparator.COMPARATOR);
			Collections.reverse(wrapperClassesList);
		}

		if (CollectionUtils.isNotEmpty(wrapperClassesList)) {
			for (Class<?> wrapperClass : wrapperClassesList) {
			    // Use @Wrapper annotation to determine whether the current wrapper class should take effect
				Wrapper wrapper = wrapperClass.getAnnotation(Wrapper.class);
				boolean match = (wrapper == null)
						|| ((ArrayUtils.isEmpty(wrapper.matches())
										|| ArrayUtils.contains(wrapper.matches(), name))
								&& !ArrayUtils.contains(wrapper.mismatches(), name));
				if (match) {
					instance = injectExtension(
							(T) wrapperClass.getConstructor(type).newInstance(instance));
					instance = postProcessAfterInitialization(instance, name);
				}
			}
		}
	}
}
```

### 2.5 Activate Activation Conditions

You can use `@org.apache.dubbo.common.extension.Activate` to control the circumstances under which SPI extension implementations are loaded and take effect. Compared to being active in all scenarios, being able to precisely control the activation conditions for the extension implementations will make implementations more flexible.

Here are some usage scenario examples:

```java
// Without @Activate annotation, it won't load during getActivateExtension(), other getExtension() methods can still load normally.
public class MetricsProviderFilter implements Filter{}
```

```java
// Without any parameters, indicating unconditional automatic return during getActivateExtension().
@Activate
public class MetricsProviderFilter implements Filter{}
```

```java
// group supports two fixed values: consumer and provider, automatically filters during loading extensions when calling getActivateExtension()
// provider indicates it will be loaded on the provider side; consumer indicates it will be loaded on the consumer side.
@Activate(group="provider")
public class MetricsProviderFilter implements Filter{}
```

```java
// Will only load when the URL parameter contains the key cache during getActivateExtension().
@Activate(value="cache")
public class MetricsProviderFilter implements Filter{}
```

```java
// Will only load when the URL parameter contains the key cache and its value is test during getActivateExtension().
@Activate(value="cache:test")
public class MetricsProviderFilter implements Filter{}
```

Here is the specific definition of the `@Activate` annotation:

```java
/**
 * Activate. This annotation is useful for automatically activate certain extensions with the given criteria,
 * for examples: <code>@Activate</code> can be used to load certain <code>Filter</code> extension when there are
 * multiple implementations.
 * <ol>
 * <li>{@link Activate#group()} specifies group criteria. Framework SPI defines the valid group values.
 * <li>{@link Activate#value()} specifies parameter key in {@link URL} criteria.
 * </ol>
 * SPI provider can call {@link ExtensionLoader#getActivateExtension(URL, String, String)} to find out all activated
 * extensions with the given criteria.
 *
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD})
public @interface Activate {
    /**
     * Activate the current extension when one of the groups matches. The group passed into
     * {@link ExtensionLoader#getActivateExtension(URL, String, String)} will be used for matching.
     *
     * @return group names to match
     * @see ExtensionLoader#getActivateExtension(URL, String, String)
     */
    String[] group() default {};

    /**
     * Activate the current extension when the specified keys appear in the URL's parameters.
     * <p>
     * For example, given <code>@Activate("cache, validation")</code>, the current extension will be return only when
     * there's either <code>cache</code> or <code>validation</code> key appeared in the URL's parameters.
     * </p>
     *
     * @return URL parameter keys
     * @see ExtensionLoader#getActivateExtension(URL, String)
     * @see ExtensionLoader#getActivateExtension(URL, String, String)
     */
    String[] value() default {};

    /**
     * Absolute ordering info, optional
     *
     * Ascending order, smaller values will be in the front o the list.
     *
     * @return absolute ordering info
     */
    int order() default 0;

    /**
     * Activate loadClass when the current extension when the specified className all match
     * @return className names to all match
     */
    String[] onClass() default {};
}
```

### 2.6 Extension Point Sorting

Sorting is also set using the `@Activate` annotation. Here’s an example of usage; the smaller the `order` value, the higher the loading priority.

```java
@Activate(order=100)
public class FilterImpl1 implements Filter{}

@Activate(order=200)
public class FilterImpl2 implements Filter{}
```

## 3. Dubbo SPI Extension Examples

### 3.1 Loading Fixed Extension Classes

#### 3.1.1 Writing SPI Interface and Implementation Class

Whether in Java SPI or the SPI implemented in Dubbo, it is necessary to write an interface. However, the interface in Dubbo needs to be annotated with @SPI.

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

#### 3.1.2 Placing Implementation Classes in Specific Directories

From the above code, it can be seen that Dubbo reads extension classes from four directories. We will create a file in the META-INF/dubbo directory with the name of the DemoSpi interface; its content is as follows:

```text
demoSpiImpl = com.xxx.xxx.DemoSpiImpl (the fully qualified name of the DemoSpi interface implementation class)
```

#### 3.1.3 Usage

```java
public class DubboSPITest {

    @Test
    public void sayHello() throws Exception {
        ExtensionLoader<DemoSpi> extensionLoader = 
            ExtensionLoader.getExtensionLoader(DemoSpi.class);
        DemoSpi demoSpi = extensionLoader.getExtension("demoSpiImpl");
        demoSpi.sayHello();
    }
}
```

### 3.2 Loading Adaptive Extension Classes

Taking Protocol as an example for explanation.

#### 3.2.1 Protocol Interface (Extracting Core Methods)

```java
@SPI("dubbo")
public interface Protocol {
    @Adaptive
    <T> Exporter<T> export(Invoker<T> invoker) throws RpcException;

    @Adaptive
    <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException;
}

public class DubboProtocol extends AbstractProtocol {
    ......
    @Override
    public <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException {
        return protocolBindingRefer(type, url);
    }
    
    @Override
    public <T> Exporter<T> export(Invoker<T> invoker) throws RpcException {
        ......
        return exporter;
    }
}
```

#### 3.2.2 Placing Implementation Classes in Specific Directories

In Dubbo, the configuration path is `META-INF/dubbo/internal/org.apache.dubbo.rpc.Protocol`

```text
dubbo=org.apache.dubbo.rpc.protocol.dubbo.DubboProtocol
```

It should be noted that, in Dubbo, instead of using DubboProtocol directly, the wrapper class is being used.

#### 3.2.3 Usage

```java
public class DubboAdaptiveTest {

    @Test
    public void sayHello() throws Exception {
        URL url = URL.valueOf("dubbo://localhost/test");
        Protocol adaptiveProtocol = ExtensionLoader.getExtensionLoader(Protocol.class).getAdaptiveExtension();
        adaptiveProtocol.refer(type, url);
    }
}
```
