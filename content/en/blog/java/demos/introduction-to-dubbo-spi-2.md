---
title: "Source Code Analysis of Dubbo's Extensible Mechanism"
linkTitle: "Source Code Analysis of Dubbo's Extensible Mechanism"
tags: ["Java"]
date: 2019-05-02
description: >
    This article introduces the implementation principles and details of the SPI extension mechanism.
---


In [Practical Application of Dubbo's Extensible Mechanism]({{<ref "/blog/java/demos/introduction-to-dubbo-spi.md" >}} ""), we learned some concepts of Dubbo's extension mechanism, explored the implementation of LoadBalance in Dubbo, and implemented a LoadBalance ourselves. Think Dubbo's extension mechanism is pretty good? Next, we'll dive into the source code of Dubbo and see its true form.

## ExtensionLoader
ExtensionLoader is the core class responsible for loading extension points and managing their lifecycle. Let's start with this class.
There are quite a few methods in ExtensionLoader, the commonly used ones are:
* `public static <T> ExtensionLoader<T> getExtensionLoader(Class<T> type)`
* `public T getExtension(String name)`
* `public T getAdaptiveExtension()`

Common usages include:
* `LoadBalance lb = ExtensionLoader.getExtensionLoader(LoadBalance.class).getExtension(loadbalanceName)`
* `RouterFactory routerFactory = ExtensionLoader.getExtensionLoader(RouterFactory.class).getAdaptiveExtension()`

Note: In the source code displayed below, I will omit unrelated code (such as logging, exception handling, etc.) for easier reading and understanding.

1. getExtensionLoader method
    This is a static factory method that takes an extensible interface as a parameter and returns an instance of the ExtensionLoader for that interface. Using this instance, specific extensions can be obtained by name, and adaptive extensions can also be retrieved.

```java
public static <T> ExtensionLoader<T> getExtensionLoader(Class<T> type) {
        // Extension points must be interfaces
        if (!type.isInterface()) {
            throw new IllegalArgumentException("Extension type(" + type + ") is not an interface!");
        }
        // Must have @SPI annotation
        if (!withExtensionAnnotation(type)) {
            throw new IllegalArgumentException("Extension type without @SPI Annotation!");
        }
        // Get the corresponding ExtensionLoader from the cache based on the interface
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

2. getExtension method

```java
public T getExtension(String name) {
        Holder<Object> holder = cachedInstances.get(name);
        if (holder == null) {
            cachedInstances.putIfAbsent(name, new Holder<Object>());
            holder = cachedInstances.get(name);
        }
        Object instance = holder.get();
        // Get from cache, create if not exists
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
The getExtension method does some checks and caching, the main logic is in the createExtension method. Let's continue with the createExtension method.

```java
private T createExtension(String name) {
        // Get the extension class based on the extension point name, e.g., get RandomLoadBalance class for random
        Class<?> clazz = getExtensionClasses().get(name);
        
        T instance = (T) EXTENSION_INSTANCES.get(clazz);
        if (instance == null) {
              // Use reflection to call newInstance to create an instance of the extension class
            EXTENSION_INSTANCES.putIfAbsent(clazz, (T) clazz.newInstance());
            instance = (T) EXTENSION_INSTANCES.get(clazz);
        }
        // Perform dependency injection on the extension class instance
        injectExtension(instance);
        // If there's a wrapper, add the wrapper
        Set<Class<?>> wrapperClasses = cachedWrapperClasses;
        if (wrapperClasses != null && !wrapperClasses.isEmpty()) {
            for (Class<?> wrapperClass : wrapperClasses) {
                instance = injectExtension((T) wrapperClass.getConstructor(type).newInstance(instance));
            }
        }
        return instance;
}
```
The createExtension method does the following:
1. First, get the corresponding extension class by name. Read extension point configuration files from the `META-INF` folder under ClassPath.
2. Create an instance of the extension class using reflection.
3. Perform dependency injection on the properties of the extension class instance, i.e., IOC.
4. If there's a wrapper, add the wrapper, i.e., AOP.

Next, let's focus on these 4 processes:
1. Get the corresponding extension class by name.
   Looking at the code:

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
The process is quite simple, first retrieve from the cache, and if not found, load from the configuration files located at:
* `META-INF/dubbo/internal`
* `META-INF/dubbo`
* `META-INF/services`

2. Using reflection to create an extension instance
    This is straightforward, achieved using `clazz.newInstance()`. The properties of the created extension instance are all null.
3. Automatic wiring of the extension instance
    In practical scenarios, there are dependencies among classes. The extension instance will reference some dependencies. The dependency injection in Dubbo is relatively complex, and we'll cover this in detail later. For now, we need to understand that Dubbo can correctly inject ordinary dependencies in extension points, or Dubbo extension dependencies, or Spring dependencies, etc.
4. Automatic wrapping of extension instances
    Automatic wrapping implements functions similar to Spring's AOP. Dubbo uses it internally to implement common functionalities such as logging and monitoring. This will also be explained later in detail.

After the above 4 steps, Dubbo creates and initializes an extension instance. This instance's dependencies are injected and wrapped as necessary. At this point, this extension instance can be used.

## Advanced Use of Dubbo SPI: Automatic Wiring
The relevant code for automatic wiring is in the injectExtension method:

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
To implement automatic wiring for extension instance dependencies, it's first necessary to identify what dependencies exist and their types. Dubbo's solution is to look for Java standard setter methods, i.e., methods whose names begin with "set" that take a single parameter. If the extension class has such a set method, Dubbo performs dependency injection akin to Spring's set method injection.
However, Dubbo's dependency injection is more complex than Spring's since dependencies may come from various sources such as another Dubbo extension, a Spring Bean, a Google Guice component, or any component from other frameworks. Dubbo needs to load extensions from any scenario. In the injectExtension method, this is accomplished via `Object object = objectFactory.getExtension(pt, property)`. The objectFactory is of ExtensionFactory type, initialized when creating ExtensionLoader:

```java
private ExtensionLoader(Class<?> type) {
        this.type = type;
        objectFactory = (type == ExtensionFactory.class ? null : ExtensionLoader.getExtensionLoader(ExtensionFactory.class).getAdaptiveExtension());
    }
```
The objectFactory itself is also an extension, obtained via `ExtensionLoader.getExtensionLoader(ExtensionFactory.class).getAdaptiveExtension()`.


![Dubbo-ExtensionFactory](/imgs/blog/dubbo-extensionfactory.png "")

ExtensionFactory has three implementations:
1. SpiExtensionFactory: Dubbo's own Spi to load Extensions
2. SpringExtensionFactory: Loads Extensions from the Spring container
3. AdaptiveExtensionFactory: Adaptive AdaptiveExtensionLoader

Note the AdaptiveExtensionFactory; the source code is as follows:

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
The AdaptiveExtensionLoader class has the @Adaptive annotation. As mentioned earlier, Dubbo creates an adaptive instance for every extension. If the extension class has @Adaptive, that class will be used as the adaptive class. If not, Dubbo will create one for us. Thus, `ExtensionLoader.getExtensionLoader(ExtensionFactory.class).getAdaptiveExtension()` returns an instance of AdaptiveExtensionLoader as the adaptive extension instance.
AdaptiveExtensionLoader traverses all ExtensionFactory implementations to attempt to load extensions. If found, it returns it. If not, it continues looking in the next ExtensionFactory. Dubbo has two built-in ExtensionFactory instances that find from both Dubbo's own extension mechanism and the Spring container. Since ExtensionFactory is also an extension point, we can implement our own ExtensionFactory to allow Dubbo's automatic wiring to support our custom components. For instance, if we used Google Guice as the IoC container in our project, we could create our own GuiceExtensionFactory to make Dubbo support loading extensions from the Guice container.

## Advanced Use of Dubbo SPI: AOP
While using Spring, we often utilize AOP functionality. Logic is inserted before and after the target class's methods, commonly used for logging, monitoring, and authorization.
Does Dubbo's extension mechanism support similar functionality? The answer is yes. In Dubbo, there is a special type of class known as a Wrapper class. By using the decorator pattern, Wrapper classes wrap the original extension point instances and insert logic before and after the original extension implementations, achieving AOP functionality.

### What is a Wrapper class?
What types of classes qualify as Wrapper classes in Dubbo's extension mechanism? A Wrapper class is a class that has a copy constructor, displaying the typical decorator pattern. Here is an example of a Wrapper class:

```java
class A{
    private A a;
    public A(A a){
        this.a = a;
    }
}
```
Class A has a constructor `public A(A a)` where the parameter is an instance of A itself. Such a class can be a Wrapper class in Dubbo's extension mechanism. Some examples of Wrapper classes in Dubbo include ProtocolFilterWrapper and ProtocolListenerWrapper; the source code can be reviewed for deeper understanding.

### How to configure Wrapper classes

In Dubbo, Wrapper classes are also extension points, and like other extension points, they are configured in the `META-INF` directory. For instance, the ProtocolFilterWrapper and ProtocolListenerWrapper examples mentioned earlier are configured at the path `dubbo-rpc/dubbo-rpc-api/src/main/resources/META-INF/dubbo/internal/org.apache.dubbo.rpc.Protocol`:
```text
filter=org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper
listener=org.apache.dubbo.rpc.protocol.ProtocolListenerWrapper
mock=org.apache.dubbo.rpc.support.MockProtocol
```
When Dubbo loads the extension configuration files, the following code snippet executes:

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
This means if the extension class has a copy constructor, it's stored for future use. Classes with a copy constructor qualify as Wrapper classes. The constructor is obtained through `clazz.getConstructor(type)`, where the parameter is the extension point interface, not the extension class itself.
Taking Protocol as an example, the configuration file at `dubbo-rpc/dubbo-rpc-api/src/main/resources/META-INF/dubbo/internal/org.apache.dubbo.rpc.Protocol` defines `filter=org.apache.dubbo.rpc.protocol.ProtocolFilterWrapper`.
Here’s the code for ProtocolFilterWrapper:

```java
public class ProtocolFilterWrapper implements Protocol {

    private final Protocol protocol;

    // Copy constructor parameter is Protocol
    public ProtocolFilterWrapper(Protocol protocol) {
        if (protocol == null) {
            throw new IllegalArgumentException("protocol == null");
        }
        this.protocol = protocol;
    }
}
```
ProtocolFilterWrapper has a constructor `public ProtocolFilterWrapper(Protocol protocol)`, the parameter is the extension point Protocol, making it a Wrapper class in Dubbo's extension mechanism. ExtensionLoader caches it for use later when creating Extension instances, applying these wrapper classes in sequence to wrap the original extension point.

## Adaptive extension points

As mentioned before, Dubbo needs to decide at runtime which extension to use based on method parameters, leading to the need for adaptive instances of extension points. Essentially, these are proxies that defer the choice of extensions from Dubbo startup to RPC invocation time. Each extension point in Dubbo has an adaptive class created automatically by Dubbo if not explicitly provided, using Javaassist by default.
Let’s take a look at the code that creates adaptive extension classes:

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
Continuing on to the createAdaptiveExtension method:

```java
private T createAdaptiveExtension() {        
    return injectExtension((T) getAdaptiveExtensionClass().newInstance());
}
```
Next, let's see the getAdaptiveExtensionClass method:

```java
private Class<?> getAdaptiveExtensionClass() {
        getExtensionClasses();
        if (cachedAdaptiveClass != null) {
            return cachedAdaptiveClass;
        }
        return cachedAdaptiveClass = createAdaptiveExtensionClass();
    }
```
Continuing to the createAdaptiveExtensionClass method, we finally arrive at the specific implementation. This method generates the Java source code for the adaptive class, compiles it into Java bytecode, and loads it into the JVM.

```java
private Class<?> createAdaptiveExtensionClass() {
        String code = createAdaptiveExtensionClassCode();
        ClassLoader classLoader = findClassLoader();
        org.apache.dubbo.common.compiler.Compiler compiler = ExtensionLoader.getExtensionLoader(org.apache.dubbo.common.compiler.Compiler.class).getAdaptiveExtension();
        return compiler.compile(code, classLoader);
    }
```
The default implementation of the Compiler is javassist.

```java
@SPI("javassist")
public interface Compiler {
    Class<?> compile(String code, ClassLoader classLoader);
}
```
In the createAdaptiveExtensionClassCode() method, a StringBuilder is used to build the Java source code for the adaptive class. The implementation is relatively long, which won't be pasted here. This approach of generating bytecode is interesting, initially generating Java source code, then compiling and loading it into the JVM. This allows for better control over generated Java classes without having to care about various bytecode generation framework APIs. As the .java file format is universal in Java and familiar, the content must be constructed incrementally for readability.
Here is an example of the Java code for an adaptive class created for Protocol using the createAdaptiveExtensionClassCode method:

```java
package org.apache.dubbo.rpc;

import org.apache.dubbo.common.extension.ExtensionLoader;

public class Protocol$Adaptive implements org.apache.dubbo.rpc.Protocol {
    public void destroy() {
        throw new UnsupportedOperationException("method public abstract void org.apache.dubbo.rpc.Protocol.destroy() of interface org.apache.dubbo.rpc.Protocol is not adaptive method!");
    }

    public int getDefaultPort() {
        throw new UnsupportedOperationException("method public abstract int org.apache.dubbo.rpc.Protocol.getDefaultPort() of interface org.apache.dubbo.rpc.Protocol is not adaptive method!");
    }

    public org.apache.dubbo.rpc.Exporter export(org.apache.dubbo.rpc.Invoker arg0) throws org.apache.dubbo.rpc.RpcException {
        if (arg0 == null) throw new IllegalArgumentException("org.apache.dubbo.rpc.Invoker argument == null");
        if (arg0.getUrl() == null)
            throw new IllegalArgumentException("org.apache.dubbo.rpc.Invoker argument getUrl() == null");
        org.apache.dubbo.common.URL url = arg0.getUrl();
        String extName = (url.getProtocol() == null ? "dubbo" : url.getProtocol());
        if (extName == null)
            throw new IllegalStateException("Fail to get extension(org.apache.dubbo.rpc.Protocol) name from url(" + url.toString() + ") use keys([protocol])");
        org.apache.dubbo.rpc.Protocol extension = (org.apache.dubbo.rpc.Protocol) ExtensionLoader.getExtensionLoader(org.apache.dubbo.rpc.Protocol.class).getExtension(extName);
        return extension.export(arg0);
    }

    public org.apache.dubbo.rpc.Invoker refer(java.lang.Class arg0, org.apache.dubbo.common.URL arg1) throws org.apache.dubbo.rpc.RpcException {
        if (arg1 == null) throw new IllegalArgumentException("url == null");
        org.apache.dubbo.common.URL url = arg1;
        String extName = (url.getProtocol() == null ? "dubbo" : url.getProtocol());
        if (extName == null)
            throw new IllegalStateException("Fail to get extension(org.apache.dubbo.rpc.Protocol) name from url(" + url.toString() + ") use keys([protocol])");
        org.apache.dubbo.rpc.Protocol extension = (org.apache.dubbo.rpc.Protocol) ExtensionLoader.getExtensionLoader(org.apache.dubbo.rpc.Protocol.class).getExtension(extName);
        return extension.refer(arg0, arg1);
    }
}
```
The overall logic is consistent with what was previously stated, where parameters are resolved through URL, and the resolution logic is controlled by the value parameter of the @Adaptive annotation, after which the corresponding extension point implementation is fetched for invocation. For those interested in the specifics of constructing the .java code, the complete implementation of createAdaptiveExtensionClassCode can be referred to.
In the generated Protocol$Adaptive, we observe that the getDefaultPort and destroy methods directly throw exceptions. Why is that? Let's look at the Protocol source code.

```java
@SPI("dubbo")
public interface Protocol {

    int getDefaultPort();

    @Adaptive
    <T> Exporter<T> export(Invoker<T> invoker) throws RpcException;

    @Adaptive
    <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException;

    void destroy();
}
```
It can be seen that the Protocol interface has 4 methods, but only the export and refer methods use the @Adaptive annotation. Therefore, only the methods marked with @Adaptive in the automatically generated adaptive instances have concrete implementations, which is why Protocol$Adaptive contains implementations for only the export and refer methods, while the others throw exceptions.

