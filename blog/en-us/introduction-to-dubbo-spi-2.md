---
title: Dubbo extensible mechanism source code analysis
keywords: Dubbo, SPI, source code analysis
description: This article introduces the principles and details of Dubbo's SPI.
---

# Dubbo extensible mechanism source code analysis
---

In the [actual implementation of the Dubbo extensibility mechanism](./introduction-to-dubbo-spi.md), we learned some concepts of the Dubbo extension mechanism, explored the implementation of LoadBalance in Dubbo, and implemented a LoadBalance on our own. Do you think Dubbo's extension mechanism is great? Next, we will go deep into the source code of Dubbo and see what it is.

## ExtensionLoader

`ExtentionLoader` is the core class, which is responsible for the loading and lifecycle management of extension points. Let's start with this class. There are many methods of Extension, and the common methods include:

* `public static <T> ExtensionLoader<T> getExtensionLoader(Class<T> type)`
* `public T getExtension(String name)`
* `public T getAdaptiveExtension()`

The common usages are:

* `LoadBalance lb = ExtensionLoader.getExtensionLoader(LoadBalance.class).getExtension(loadbalanceName)`
* `RouterFactory routerFactory = ExtensionLoader.getExtensionLoader(RouterFactory.class).getAdaptiveExtension()`

Notice: In the source code shown below, I'll remove extraneous code (such as logging, exception catching, and so on) to make it easy to read and understand.

1. getExtensionLoader
    This is a static factory method that enters an extensible interface and returns an ExtensionLoader entity class for this interface. With this entity class, you can get not only a specific extension based on name, but also an adaptive extension.

```java
public static <T> ExtensionLoader<T> getExtensionLoader(Class<T> type) {
        // An extension point must be an interface
        if (!type.isInterface()) {
            throw new IllegalArgumentException("Extension type(" + type + ") is not interface!");
        }
        // @SPI annotations must be provided
        if (!withExtensionAnnotation(type)) {
            throw new IllegalArgumentException("Extension type without @SPI Annotation!");
        }
        // Get the corresponding ExtensionLoader from the cache according to the interface
        // Each extension will only be loaded once
        ExtensionLoader<T> loader = (ExtensionLoader<T>) EXTENSION_LOADERS.get(type);
        if (loader == null) {
            // Initialize extension
            EXTENSION_LOADERS.putIfAbsent(type, new ExtensionLoader<T>(type));
            loader = (ExtensionLoader<T>) EXTENSION_LOADERS.get(type);
        }
        return loader;
    }
    
private ExtensionLoader(Class<?> type) {
        this.type = type;
        objectFactory = (type == ExtensionFactory.class ? null : ExtensionLoader.getExtensionLoader(ExtensionFactory.class).getAdaptiveExtension());
    }
```

2. getExtension

```java
public T getExtension(String name) {
        Holder<Object> holder = cachedInstances.get(name);
        if (holder == null) {
            cachedInstances.putIfAbsent(name, new Holder<Object>());
            holder = cachedInstances.get(name);
        }
        Object instance = holder.get();
        // Get it from the cache. If it does not exist, create
        if (instance == null) {
            synchronized (holder) {
                instance = holder.get();
                if (instance == null) {
                    instance = createExtension(name);
                    holder.set(instance);
                }
            }
        }
        return (T) instance;
    }
```
Some judgments and caching have been made in the getExtention method, and the main logic is in the createExtension method. Let's move on to the createExtention method.

```java
private T createExtension(String name) {
        // Get the extension class according to the name of extension point. For example,  for LoadBalance, get the RandomLoadBalance class according to random
        Class<?> clazz = getExtensionClasses().get(name);
        
        T instance = (T) EXTENSION_INSTANCES.get(clazz);
        if (instance == null) {
              // Use reflection to call newInstance to create an example of an extension class
            EXTENSION_INSTANCES.putIfAbsent(clazz, (T) clazz.newInstance());
            instance = (T) EXTENSION_INSTANCES.get(clazz);
        }
        // Make dependency injection for the extended class samples
        injectExtension(instance);
        // If there is a wrapper, add the wrapper
        Set<Class<?>> wrapperClasses = cachedWrapperClasses;
        if (wrapperClasses != null && !wrapperClasses.isEmpty()) {
            for (Class<?> wrapperClass : wrapperClasses) {
                instance = injectExtension((T) wrapperClass.getConstructor(type).newInstance(instance));
            }
        }
        return instance;
}
```
The createExtension method has done the following:
1. First, get the corresponding extension class according to name. Read the extension point configuration file from the `META-INF` folder under ClassPath.
2. Use reflection to create an instance of an extended class.
3. make dependency injection for the attributes of the extended class instance. That is, IoC.
4. If there is a wrapper, add the wrapper. That is, AoP.

Let's focus on these four processes.
1. Get the corresponding extension class according to name. Let’s read the code first:

```java
private Map<String, Class<?>> getExtensionClasses() {
        Map<String, Class<?>> classes = cachedClasses.get();
        if (classes == null) {
            synchronized (cachedClasses) {
                classes = cachedClasses.get();
                if (classes == null) {
                    classes = loadExtensionClasses();
                    cachedClasses.set(classes);
                }
            }
        }
        return classes;
    }

    // synchronized in getExtensionClasses
    private Map<String, Class<?>> loadExtensionClasses() {
        final SPI defaultAnnotation = type.getAnnotation(SPI.class);
        if (defaultAnnotation != null) {
            String value = defaultAnnotation.value();
            if (value != null && (value = value.trim()).length() > 0) {
                String[] names = NAME_SEPARATOR.split(value);
                if (names.length > 1) {
                    throw new IllegalStateException("more than 1 default extension name on extension " + type.getName());
                }
                if (names.length == 1) cachedDefaultName = names[0];
            }
        }

        Map<String, Class<?>> extensionClasses = new HashMap<String, Class<?>>();
        loadFile(extensionClasses, DUBBO_INTERNAL_DIRECTORY);
        loadFile(extensionClasses, DUBBO_DIRECTORY);
        loadFile(extensionClasses, SERVICES_DIRECTORY);
        return extensionClasses;
    }
```
This process is very simple. Get the extension class from the cache first, and if it does not exist, load it from the configuration file. The path of the configuration file has been mentioned before:
* `META-INF/dubbo/internal`
* `META-INF/dubbo`
* `META-INF/services`

2. Use reflection to create an extended instance. This process is very simple. We can do this using `clazz.newInstance()`. The attributes of the extended instance created are all null values.
3. Extended instance is automatic assembly. In the actual scenario, there have dependencies between classes. Dependencies are also referenced in the extended instance, such as a simple Java class, an extension of another Dubbo, or a Spring Bean. The situation of dependencies is complex, and Dubbo's processing is relatively complicated. We will have a special chapter to explain it later. Now, we just need to know that Dubbo can correctly inject common dependencies in extension points, Dubbo extension dependencies or Spring dependencies, etc..
4. Extended instance is auto-wrapping. Auto-wrapping is about implementing Spring like AOP functionality. Dubbo uses it to implement some common functions internally, such as logging, monitoring, and so on. The contents of the extended instance auto-wrapper will also be explained separately later.

After the above 4 steps, Dubbo creates and initializes an extended instance. The dependencies of this instance are injected and packaged as needed. At this point, this extended instance can be used.

## Auto-assembly of Dubbo SPI advanced usage

The relevant code for auto-assembly is in the injectExtension method:

```java
private T injectExtension(T instance) {
    for (Method method : instance.getClass().getMethods()) {
        if (method.getName().startsWith("set")
                && method.getParameterTypes().length == 1
                && Modifier.isPublic(method.getModifiers())) {
            Class<?> pt = method.getParameterTypes()[0];
          
            String property = method.getName().length() > 3 ? method.getName().substring(3, 4).toLowerCase() + method.getName().substring(4) : "";
            Object object = objectFactory.getExtension(pt, property);
            if (object != null) {
                method.invoke(instance, object);
            }
        }
    }
    return instance;
}
```
To accomplish the automatic assembly of dependencies of the extended instances, you first need to know what the dependencies are and what the types of dependencies are. The solution of Dubbo is to find the Java standard setter method. That is, the method name starting with set has only one parameter. If such a set method exists in an extension class, Dubbo injects it into dependencies, which is similar to the injection of Spring's set method. However, dependency injection in Dubbo is more complicated than that in Spring, because all the methods injected into Spring are Spring beans and managed by the Spring container. In Dubbo's dependency injection, you may need to inject another extension of Dubbo, or a Spring Bean, or a component of Google guice, or a component in any other framework. Dubbo needs to be able to load extensions from any scenario. In the injectExtension method, it is implemented with `Object object = objectFactory. getExtension (pt, property)`. ObjectFactory is ExtensionFactory type and initialized when creating ExtensionLoader:

```java
private ExtensionLoader(Class<?> type) {
        this.type = type;
        objectFactory = (type == ExtensionFactory.class ? null : ExtensionLoader.getExtensionLoader(ExtensionFactory.class).getAdaptiveExtension());
    }
```
ObjectFacore is also an extension, obtained through `ExtensionLoader.getExtensionLoader(ExtensionFactory.class).getAdaptiveExtension()`.


![Dubbo-ExtensionFactory | left](https://raw.githubusercontent.com/vangoleo/wiki/master/dubbo/dubbo-extensionfactory.png "")

ExtensionLoader includes three implementations:
1. SpiExtensionLoader: use Dubbo's Spi to load Extension.
2. SpringExtensionLoader: load Extension from the Spring container.
3. AdaptiveExtensionLoader: adaptive AdaptiveExtensionLoader

Pay attention to the AdaptiveExtensionLoader here, the source code is as follows:

```java
@Adaptive
public class AdaptiveExtensionFactory implements ExtensionFactory {

    private final List<ExtensionFactory> factories;

    public AdaptiveExtensionFactory() {
        ExtensionLoader<ExtensionFactory> loader = ExtensionLoader.getExtensionLoader(ExtensionFactory.class);
        List<ExtensionFactory> list = new ArrayList<ExtensionFactory>();
        for (String name : loader.getSupportedExtensions()) {
            list.add(loader.getExtension(name));
        }
        factories = Collections.unmodifiableList(list);
    }

    public <T> T getExtension(Class<T> type, String name) {
        for (ExtensionFactory factory : factories) {
            T extension = factory.getExtension(type, name);
            if (extension != null) {
                return extension;
            }
        }
        return null;
    }
}
```
The AdaptiveExtensionLoader class has @Adaptive annotations. As mentioned earlier, Dubbo creates an adaptive instance for each extension. If the extension class has @Adaptive annotations, it will use it as an adaptive class. If not, Dubbo will create one for us. So `ExtensionLoader.getExtensionLoader(ExtensionFactory.class).getAdaptiveExtension())` will return an AdaptiveExtensionLoader instance as an adaptive extension instance. 
The AdaptiveExtentionLoader will iterate through all the ExtensionFactory implementations and try to load the extensions. If found, return. If not, continue to find it in the next ExtensionFactory. Dubbo has two ExtensionFactory built in, which are searched from Dubbo's own extension mechanism and Spring container. Since ExtensionFactory itself is also an extension point, we can implement our own ExtensionFactory to enable automatic assembly of Dubbo to support our custom components. For example, we used Google's guice as an IoC container in our project. We can implement our own GuiceExtensionFactory to enable Dubbo to load extensions from the guice container.

## AoP of Dubbo SPI advanced usage

We often use AOP functionality when using Spring. Insert other logic before and after the method of the target class. For example, Spring AOP is usually used to implement logging, monitoring, and authentication, and so on. 
Does Dubbo's extension mechanism also support similar features? The answer is yes. In Dubbo, there is a special class called the Wrapper class. It uses the wrapper class to wrap the original extension point instance through the decorator pattern, and then inserts additional logic before and after the original extension point implementation to implement AOP functionality. 

### What is the Wrapper class

So what kind of class is the Wrapper class in the Dubbo extension mechanism? The Wrapper class is a class that has a replication constructor and also is a typical decorator pattern. Here's a Wrapper class:

```java
class A{
    private A a;
    public A(A a){
        this.a = a;
    }
}
```
Class A has a constructor `public A(A a)`, and the argument to the constructor is A itself. Such a class can be a Wrapper class in the Dubbo extension mechanism. Such Wrapper classes in Dubbo include ProtocolFilterWrapper, ProtocolListenerWrapper, and so on. You can check the source code to deepen your understanding.

### How to configure the Wrapper class

The Wipper class in Dubbo is also an extension point. Like other extension points, it is also configured in the `META-INF` folder. For example, the ProtocolFilterWrapper and ProtocolListenerWrapper in the previous example are configured in the path `dubbo-rpc/dubbo-rpc-api/src/main/resources/META-INF/dubbo/internal/com.alibaba.dubbo.rpc.Protocol`:
```text
filter=com.alibaba.dubbo.rpc.protocol.ProtocolFilterWrapper
listener=com.alibaba.dubbo.rpc.protocol.ProtocolListenerWrapper
mock=com.alibaba.dubbo.rpc.support.MockProtocol
```
When Dubbo loads the extension configuration file, there is a piece of code as follows:

```java
try {  
  clazz.getConstructor(type);    
  Set<Class<?>> wrappers = cachedWrapperClasses;
  if (wrappers == null) {
    cachedWrapperClasses = new ConcurrentHashSet<Class<?>>();
    wrappers = cachedWrapperClasses;
  }
  wrappers.add(clazz);
} catch (NoSuchMethodException e) {}
```
The meaning of this code is that if the extension class has a copy constructor, it will be saved for later use. The class that has the copy constructor is the Wrapper class. The parameter obtained by `clazz.getConstructor(type)` is the constructor of the extension point interface. Note that the parameter type of the constructor is an extension point interface, not an extension class. 
Take Protocol as an example. The configuration file `dubbo-rpc/dubbo-rpc-api/src/main/resources/META-INF/dubbo/internal/com.alibaba.dubbo.rpc.Protocol defines filter=com.alibaba.dubbo.rpc.protocol. ProtocolFilterWrapper`. 
The code of ProtocolFilterWrapper is as follows:

```java
public class ProtocolFilterWrapper implements Protocol {

    private final Protocol protocol;

    // One parameter is the copy constructor of Protocol
    public ProtocolFilterWrapper(Protocol protocol) {
        if (protocol == null) {
            throw new IllegalArgumentException("protocol == null");
        }
        this.protocol = protocol;
    }
```
ProtocolFilterWrapper has a constructor `public ProtocolFilterWrapper(Protocol protocol)`, and the parameter is the extension point Protocol. So it is a Wrapper class in the Dubbo extension mechanism. The ExtensionLoader will cache it. When creating Extension instances later, the ExtensionLoader use these wrapper classes to wrap the original Extension point in turn.

## Extension point adaptive

As mentioned earlier, Dubbo needs to determine which extension to use based on method parameters at runtime. So there is an extension point adaptive instance. In fact, it is an extension point proxy that delays the selection of extensions from starting Dubbo to calling RPC. Each extension point in Dubbo has an adaptive class. If it is not explicitly provided, Dubbo will automatically create one for us. By default, Javaassist is used. 
Let's first look at the code to create an adaptive extension class:

```java
public T getAdaptiveExtension() {
    Object instance = cachedAdaptiveInstance.get();
    if (instance == null) {
            synchronized (cachedAdaptiveInstance) {
                instance = cachedAdaptiveInstance.get();
                if (instance == null) {
                      instance = createAdaptiveExtension();
                      cachedAdaptiveInstance.set(instance); 
                }
            }        
    }

    return (T) instance;
}
```
Continue to read the createAdaptiveExtension method:

```java
private T createAdaptiveExtension() {        
    return injectExtension((T) getAdaptiveExtensionClass().newInstance());
}
```
Continue to read the getAdaptiveExtensionClass method:

```java
private Class<?> getAdaptiveExtensionClass() {
        getExtensionClasses();
        if (cachedAdaptiveClass != null) {
            return cachedAdaptiveClass;
        }
        return cachedAdaptiveClass = createAdaptiveExtensionClass();
    }
```
Continue to read the createAdaptiveExtensionClass method. After a long journey, we finally come to a concrete realization. Look at this createAdaptiveExtensionClass method, which first generates the Java source code for the adaptive class, and then compile the source code into Java bytecode and load it into the JVM.

```java
private Class<?> createAdaptiveExtensionClass() {
        String code = createAdaptiveExtensionClassCode();
        ClassLoader classLoader = findClassLoader();
        com.alibaba.dubbo.common.compiler.Compiler compiler = ExtensionLoader.getExtensionLoader(com.alibaba.dubbo.common.compiler.Compiler.class).getAdaptiveExtension();
        return compiler.compile(code, classLoader);
    }
```
The default implementation of Compiler's code is javassist.

```java
@SPI("javassist")
public interface Compiler {
    Class<?> compile(String code, ClassLoader classLoader);
}
```
The createAdaptiveExtensionClassCode () method uses a StringBuilder to build Java source code for the adaptive class. The method implementation is relatively long, and the code is not posted here. The approach to bytecode generation is also interesting, first generating Java source code, then compiling it and loading it into the jvm. In this way, the generated Java class can be better controlled. And it doesn't have to care about the API of the bytecode generation framework. Because the xxx.java file is universal in Java, it is also the one we are most familiar with. However, the code is not very readable and you need to build xx. Java content bit by bit. 
Below are the Java code example for Protocol adaptive class created by createAdaptiveExtensionClassCode method: 

```java
package com.alibaba.dubbo.rpc;

import com.alibaba.dubbo.common.extension.ExtensionLoader;

public class Protocol$Adpative implements com.alibaba.dubbo.rpc.Protocol {
    public void destroy() {
        throw new UnsupportedOperationException("method public abstract void com.alibaba.dubbo.rpc.Protocol.destroy() of interface com.alibaba.dubbo.rpc.Protocol is not adaptive method!");
    }

    public int getDefaultPort() {
        throw new UnsupportedOperationException("method public abstract int com.alibaba.dubbo.rpc.Protocol.getDefaultPort() of interface com.alibaba.dubbo.rpc.Protocol is not adaptive method!");
    }

    public com.alibaba.dubbo.rpc.Exporter export(com.alibaba.dubbo.rpc.Invoker arg0) throws com.alibaba.dubbo.rpc.RpcException {
        if (arg0 == null) throw new IllegalArgumentException("com.alibaba.dubbo.rpc.Invoker argument == null");
        if (arg0.getUrl() == null)
            throw new IllegalArgumentException("com.alibaba.dubbo.rpc.Invoker argument getUrl() == null");
        com.alibaba.dubbo.common.URL url = arg0.getUrl();
        String extName = (url.getProtocol() == null ? "dubbo" : url.getProtocol());
        if (extName == null)
            throw new IllegalStateException("Fail to get extension(com.alibaba.dubbo.rpc.Protocol) name from url(" + url.toString() + ") use keys([protocol])");
        com.alibaba.dubbo.rpc.Protocol extension = (com.alibaba.dubbo.rpc.Protocol) ExtensionLoader.getExtensionLoader(com.alibaba.dubbo.rpc.Protocol.class).getExtension(extName);
        return extension.export(arg0);
    }

    public com.alibaba.dubbo.rpc.Invoker refer(java.lang.Class arg0, com.alibaba.dubbo.common.URL arg1) throws com.alibaba.dubbo.rpc.RpcException {
        if (arg1 == null) throw new IllegalArgumentException("url == null");
        com.alibaba.dubbo.common.URL url = arg1;
        String extName = (url.getProtocol() == null ? "dubbo" : url.getProtocol());
        if (extName == null)
            throw new IllegalStateException("Fail to get extension(com.alibaba.dubbo.rpc.Protocol) name from url(" + url.toString() + ") use keys([protocol])");
        com.alibaba.dubbo.rpc.Protocol extension = (com.alibaba.dubbo.rpc.Protocol) ExtensionLoader.getExtensionLoader(com.alibaba.dubbo.rpc.Protocol.class).getExtension(extName);
        return extension.refer(arg0, arg1);
    }
}
```
The general logic is the same as at the beginning. The parameters are parsed through the url, and the parsed logic is controlled by the value parameter of @adaptive, and then the extension points implementation are obtained according to the name of the extension point. And then finally make the call. If you want to know the specific construction logic of .Java code, you can see the complete implementation of `createAdaptiveExtensionClassCode`. 
In the generated Protocol$Adpative, both the getDefaultPort and destroy methods are found to throw the exception directly. Why? Take a look at the source code of Protocol:

```java
@SPI("dubbo")
public interface Protocol {

    int getDefaultPort();

    @Adaptive
    <T> Exporter<T> export(Invoker<T> invoker) throws RpcException;

    @Adaptive
    <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException;

    void destroy();
```
As you can see, there are four methods in the Protocol interface, but only the methods of export and refer use the @adaptive annotation. Dubbo automatically generates adaptive instances, and only the methods modified by @Adaptive has a specific implementation. Therefore, in the Protocol$Adpative class, only the export and refer methods have specific implementations, and the rest of the methods throw exceptions.

