---
title: "Compatibility Implementation Plan After Repackaging Dubbo 2.7.x"
linkTitle: "Compatibility Implementation Plan After Repackaging Dubbo 2.7.x"
tags: ["Java"]
date: 2018-07-22
description: >
    This article briefly describes the compatibility implementation plan for older versions after repackaging 2.7.x.
---

Since Dubbo joined the Apache Incubator, a strong requirement has been to rename the groupId and package name, which needs to be completed before the project graduates. Renaming the package is relatively complex, as it involves not only changing all class package names to `org.apache.dubbo`, but also considering compatibility with older versions.

Common compatibility issues include but are not limited to the following situations:

* User API
  * Programming API
  * Spring Annotations
* Extension SPI
  * Extension Filter

In 2.7.x, the above compatibility issues are resolved by adding a new module `dubbo-compatible`.

## Programming API

The programming API is the most direct and original way of using Dubbo, and other methods like Spring schema and annotations are based on the original API. Therefore, it is essential to maintain compatibility with the API programming form.

All compatibility code related to the programming-related API is under the `com.alibaba.dubbo.config` package. 

### ApplicationConfig

```java
package com.alibaba.dubbo.config;

@Deprecated
public class ApplicationConfig extends org.apache.dubbo.config.ApplicationConfig {

    public ApplicationConfig() {
        super();
    }

    public ApplicationConfig(String name) {
        super(name);
    }
}
```

### ProtocolConfig

```java
package com.alibaba.dubbo.config;

@Deprecated
public class ProtocolConfig extends org.apache.dubbo.config.ProtocolConfig {

    public ProtocolConfig() {
    }

    public ProtocolConfig(String name) {
        super(name);
    }

    public ProtocolConfig(String name, int port) {
        super(name, port);
    }
}
```

As we can see:

1. The compatibility class directly extends the repackaged class, maximizing code reuse.
2. Constructors also need to maintain compatibility.

In the entire compatibility package, in addition to the APIs mentioned above, some common classes like `Constants`, `URL`, and most compatibility classes are implemented through simple inheritance, allowing user-implemented classes based on the old API to run correctly.

## Spring Annotations

Spring annotations like `@EnableDubbo`, `@Service`, and `@Reference`, cannot use inheritance, so these annotation classes are implemented through code duplication. The Spring BeanPostProcessor and related classes for processing these annotations are also implemented through duplication.

This type of compatibility code exists in the following packages of the compatibility module:

* com.alibaba.dubbo.config.annotation
* com.alibaba.dubbo.config.spring.context.annotation
* org.apache.dubbo.config.spring

Thus, it is important to emphasize that this type of code exists in two copies in 2.7.x, so modifications need to be synchronized.

## Extension SPI

Dubbo's SPI extension mechanism can be detailed in the blog post [Dubbo Extensibility Mechanism Practical Guide](/en/blog/2019/04/25/dubbo可扩展机制实战/).

Taking the Filter extension as an example, it can be summarized as:

1. MyFilter needs to implement the Filter interface.
2. Under META-INF/dubbo, add META-INF/dubbo/com.alibaba.dubbo.rpc.Filter with the content:

	```
	myFilter=com.test.MyFilter
	```

These seemingly simple two points require the Dubbo framework to:

1. Correctly load the configuration file META-INF/dubbo/com.alibaba.dubbo.rpc.Filter.
2. Correctly load the MyFilter class and execute the invoke method.

Let's introduce how the Dubbo framework achieves these points.

### Correctly Load META-INF/dubbo/com.alibaba.dubbo.rpc.Filter

The Dubbo SPI mechanism looks for configuration files based on the extension point's class name. For the Filter example, after the package name changes to org.apache.dubbo, the directories searched become:

* META-INF/dubbo/internal/org.apache.dubbo.rpc.Filter
* META-INF/dubbo/org.apache.dubbo.rpc.Filter
* META-INF/services/org.apache.dubbo.rpc.Filter

However, filters implemented by users according to the old package have their configurations placed in directories like `META-INF/dubbo/com.alibaba.dubbo.rpc.Filter`. If the framework does not handle this specially, it will not load the old configuration.

Therefore, special handling is made in the `ExtensionLoader` class:

```java
    // synchronized in getExtensionClasses
    private Map<String, Class<?>> loadExtensionClasses() {
        final SPI defaultAnnotation = type.getAnnotation(SPI.class);
        if (defaultAnnotation != null) {
            String value = defaultAnnotation.value();
            if ((value = value.trim()).length() > 0) {
                String[] names = NAME_SEPARATOR.split(value);
                if (names.length > 1) {
                    throw new IllegalStateException("more than 1 default extension name on extension " + type.getName()
                            + ": " + Arrays.toString(names));
                }
                if (names.length == 1) cachedDefaultName = names[0];
            }
        }

        Map<String, Class<?>> extensionClasses = new HashMap<String, Class<?>>();
        loadDirectory(extensionClasses, DUBBO_INTERNAL_DIRECTORY, type.getName());
        loadDirectory(extensionClasses, DUBBO_INTERNAL_DIRECTORY, type.getName().replace("org.apache", "com.alibaba"));
        loadDirectory(extensionClasses, DUBBO_DIRECTORY, type.getName());
        loadDirectory(extensionClasses, DUBBO_DIRECTORY, type.getName().replace("org.apache", "com.alibaba"));
        loadDirectory(extensionClasses, SERVICES_DIRECTORY, type.getName());
        loadDirectory(extensionClasses, SERVICES_DIRECTORY, type.getName().replace("org.apache", "com.alibaba"));
        return extensionClasses;
    }
```

As seen, in addition to loading new configurations, old configuration files are also scanned.

### Correctly Load MyFilter Class

The `com.alibaba.dubbo.rpc.Filter` interface must extend `org.apache.dubbo.rpc.Filter`, and its only method, invoke, requires special handling. Let's look at its method signature:

`Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException;`

Here, the parameters, return values, and exceptions will all be utilized by the implementing class `MyFilter`, so these classes also need compatibility classes. Since different parameters and return values mean different methods for interfaces:

* In `com.alibaba.dubbo.rpc.Filter`, the old invoke method needs to be defined, which MyFilter will override.
* The invoke method in `org.apache.dubbo.rpc.Filter` needs to find a place to implement a bridge so that when the framework calls the Filter chain and executes the new invoke method, the parameters can be converted and the return values can also be translated.

This utilizes the new feature of JDK8: interface default methods.

```java
@Deprecated
public interface Filter extends org.apache.dubbo.rpc.Filter {

    Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException;

    default org.apache.dubbo.rpc.Result invoke(org.apache.dubbo.rpc.Invoker<?> invoker,
                                               org.apache.dubbo.rpc.Invocation invocation)
            throws org.apache.dubbo.rpc.RpcException {
        Result.CompatibleResult result = (Result.CompatibleResult) invoke(new Invoker.CompatibleInvoker<>(invoker),
                new Invocation.CompatibleInvocation(invocation));
        return result.getDelegate();
    }
}
```

It can be seen that in the default method, parameters are wrapped and then the old invoke method is called, unpacking the return value and returning it to the Dubbo framework. Here, Result.CompatibleResult, Invocation.CompatibleInvocation, and Invoker.CompatibleInvoker all use the proxy pattern.

Interested parties can take a look at the following classes:

* com.alibaba.dubbo.rpc.Invocation
* com.alibaba.dubbo.rpc.Invoker
* com.alibaba.dubbo.rpc.Result

## Future Todo List

Currently, the compatibility package only supports common APIs and SPIs, including:

* com.alibaba.dubbo.rpc.Filter / Invocation / Invoker / Result / RpcContext / RpcException
* com.alibaba.dubbo.config.*Config
* com.alibaba.dubbo.config.annotation.Reference / Service
* com.alibaba.dubbo.config.spring.context.annotation.EnableDubbo
* com.alibaba.dubbo.common.Constants / URL
* com.alibaba.dubbo.common.extension.ExtensionFactory
* com.alibaba.dubbo.common.serialize.Serialization / ObjectInput / ObjectOutput
* com.alibaba.dubbo.cache.CacheFactory / Cache
* com.alibaba.dubbo.rpc.service.EchoService / GenericService

If you encounter any issues during testing, please report them promptly. Also, if there are compatibility needs for other extension points, please bring them up, and contributions are more than welcome.

