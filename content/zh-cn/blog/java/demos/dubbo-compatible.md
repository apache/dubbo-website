---
title: "Dubbo 2.7.x repackage 后的兼容实现方案"
linkTitle: "Dubbo 2.7.x repackage 后的兼容实现方案"
tags: ["Java"]
date: 2018-07-22
description: >
    本文简单描述了2.7.x repackage后对老版本的兼容性实现方案。
---

Dubbo至加入Apache孵化器以来，一个很强的诉求就是需要rename groupId和package name，这两项工作在项目毕业前需要完成。其中rename package相对来说复杂一些，除了要修改所有类的包名为`org.apache.dubbo`外，更多的是需要考虑如何老版本的兼容性。

常见的兼容性包括但不限于以下几种情况：

* 用户API
  * 编程API
  * Spring注解
* 扩展SPI
  * 扩展Filter

2.7.x里就是通过增加了一个新的模块`dubbo-compatible`来解决以上兼容性问题。

## 编程使用API

编程使用API是最直接最原始的使用方式，其他方式诸如Spring schema、注解等方式都是基于原始API的；因此非常有必要对API编程形式进行兼容。

所有编程相关API的兼容代码均在`com.alibaba.dubbo.config`包下，下面我们看看几个常见API的兼容实现。

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

可以看到：

1. 兼容类是直接通过继续repacakge后的类，达到最大程度的代码复用；
2. 构造函数也需要保持兼容；

整个兼容包中，除了上述API以外，包括一些常用的类比如`Constants`、`URL`以及绝大部分的兼容类都是通过简单的继承，让用户基于老的API实现的类能正确运行。

## Spring注解

Spring注解诸如`@EnableDubbo`、`@Service`以及`@Reference`，由于不能使用继承，故这些注解类是通过代码拷贝来实现的；用于处理这些注解的Spring BeanPostProcessor以及Parser等相关的类，也是通过拷贝来实现；

这类兼容代码分别位于兼容包的以下几个package中：

* com.alibaba.dubbo.config.annotation
* com.alibaba.dubbo.config.spring.context.annotation
* org.apache.dubbo.config.spring

所以这里要特别强调的是，这类代码在2.7.x里存在2份，因此有修改的同时需要同步修改。

## 扩展SPI

Dubbo的SPI扩展机制，可以通过[Dubbo可扩展机制实战](/zh-cn/blog/2019/04/25/dubbo可扩展机制实战/)这篇博客详细了解。

以Filter扩展为例，简单来说就是：

1. MyFilter需要实现Filter接口
2. 在META-INF/dubbo下，增加META-INF/dubbo/com.alibaba.dubbo.rpc.Filter，内容为：

	```
	myFilter=com.test.MyFilter
	```

看似简单的两点，对Dubbo框架来说，需要：

1. 正确加载配置文件META-INF/dubbo/com.alibaba.dubbo.rpc.Filter
2. 正确加载MyFilter类并执行invoke方法

下面分别介绍Dubbo框架怎么实现以上几点。

### 正确加载META-INF/dubbo/com.alibaba.dubbo.rpc.Filter

Dubbo SPI机制在查找配置文件时，是根据扩展点的类名来查找的，以Filter为例，在包名变为org.apache.dubbo后，查询的目录变成：

* META-INF/dubbo/internal/org.apache.dubbo.rpc.Filter
* META-INF/dubbo/org.apache.dubbo.rpc.Filter
* META-INF/services/org.apache.dubbo.rpc.Filter

但是用户之前按老的包实现的Filter，其配置是放在类似`META-INF/dubbo/com.alibaba.dubbo.rpc.Filter`的，如果框架不做特殊处理，是不会加载老配置的。

因此在`ExtensionLoader`这个类里，做了特殊的处理：

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

可以看到，除了加载新配置外，老配置文件也会进行扫描。

### 正确加载MyFilter类

`com.alibaba.dubbo.rpc.Filter`接口除了要继承自`org.apache.dubbo.rpc.Filter`以外，其唯一的方法invoke也需要做特殊处理。我们看看它的方法签名：

`Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException;`

这里参数、返回值、异常都会被实现类`MyFilter`用到，因此这些类也需要有兼容类；而参数、返回值不同，对于接口来说是不同的方法，因此：

* 需要在com.alibaba.dubbo.rpc.Filter里，定义老的invoke方法，MyFilter会覆盖这个方法；
* org.apache.dubbo.rpc.Filter里的invoke方法，需要找一个地方来实现桥接，框架调用Filter链执行到新的invoke方法时，新的参数如何转换成老参数，老返回值如何转换成新的返回值；

这里就用到了JDK8的新特性：接口default方法。

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

可以看到，default方法里，对参数进行了包装，然后调用老的invoke方法，并将返回值进行解包后返回给Dubbo框架。这里Result.CompatibleResult、Invocation.CompatibleInvocation以及Invoker.CompatibleInvoker都用到了代理模式。

感兴趣的同学可以详细看一下以下几个类：

* com.alibaba.dubbo.rpc.Invocation
* com.alibaba.dubbo.rpc.Invoker
* com.alibaba.dubbo.rpc.Result

## 后续todo list

目前兼容包仅仅是对常见的API及SPI做了支持，列表如下：

* com.alibaba.dubbo.rpc.Filter / Invocation / Invoker / Result / RpcContext / RpcException
* com.alibaba.dubbo.config.*Config
* com.alibaba.dubbo.config.annotation.Reference / Service
* com.alibaba.dubbo.config.spring.context.annotation.EnableDubbo
* com.alibaba.dubbo.common.Constants / URL
* com.alibaba.dubbo.common.extension.ExtensionFactory
* com.alibaba.dubbo.common.serialize.Serialization / ObjectInput / ObjectOutput
* com.alibaba.dubbo.cache.CacheFactory / Cache
* com.alibaba.dubbo.rpc.service.EchoService / GenericService

大家如果在试用的过程中发现有任何问题请及时提出；同时如果对其他扩展点有兼容需求，也请大家提出来，也非常欢迎大家自己解决并贡献出来。