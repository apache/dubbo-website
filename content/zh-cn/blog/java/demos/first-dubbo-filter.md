---
title: "第一个 Dubbo Filter"
linkTitle: "第一个 Dubbo Filter"
tags: ["Java"]
date: 2018-07-01
description: >
  本文介绍了如何开发一个 Dubbo 的 Filter
---

### 概述
在Dubbo的整体设计中，Filter是一个很重要的概念，包括Dubbo本身的大多数功能，都是基于此扩展点实现的，在每次的调用过程中，Filter的拦截都会被执行。

#### Dubbo Filter的加载机制
Dubbo中已经实现的Filter大概有二十几个，它们的入口都是ProtocolFilterWrapper，ProtocolFilterWrapper对Protocol做了Wrapper，会在加载扩展的时候被加载进来，下面我们来看下这个Filter链是如何构造的。

```java
//ProtocolFilterWrapper.java
public <T> Invoker<T> refer(Class<T> type, URL url) throws RpcException {
        if (Constants.REGISTRY_PROTOCOL.equals(url.getProtocol())) {
            return protocol.refer(type, url);
        }
        return buildInvokerChain(protocol.refer(type, url), Constants.REFERENCE_FILTER_KEY, Constants.CONSUMER);
    }
    
    private static <T> Invoker<T> buildInvokerChain(final Invoker<T> invoker, String key, String group) {
        Invoker<T> last = invoker;
        List<Filter> filters = ExtensionLoader.getExtensionLoader(Filter.class).getActivateExtension(invoker.getUrl(), key, group);
        if (filters.size() > 0) {
            for (int i = filters.size() - 1; i >= 0; i --) {
                final Filter filter = filters.get(i);
                final Invoker<T> next = last;
                last = new Invoker<T>() {

                    public Class<T> getInterface() {
                        return invoker.getInterface();
                    }

                    public URL getUrl() {
                        return invoker.getUrl();
                    }

                    public boolean isAvailable() {
                        return invoker.isAvailable();
                    }

                    public Result invoke(Invocation invocation) throws RpcException {
                        return filter.invoke(next, invocation);
                    }

                    public void destroy() {
                        invoker.destroy();
                    }

                    @Override
                    public String toString() {
                        return invoker.toString();
                    }
                };
            }
        }
        return last;
    }

```

#### Dubbo Filter的激活机制
通过上述代码我们可以看到，在`buildInvokerChain`中,先获取所有已经激活的调用链，这里的调用链是已经排好序的。再通过Invoker来构造出一个Filter的调用链，最后构建出的调用链大致可以表示为：Filter1->Filter2->Filter3->......->Invoker,下面我们来看一下，第一步中获取已经激活的调用链的详细流程：

```java
    public List<T> getActivateExtension(URL url, String key, String group) {
        String value = url.getParameter(key);
        return getActivateExtension(url, value == null || value.length() == 0 ? null : Constants.COMMA_SPLIT_PATTERN.split(value), group);
    }
    
    public List<T> getActivateExtension(URL url, String[] values, String group) {
        List<T> exts = new ArrayList<T>();
        
        List<String> names = values == null ? new ArrayList<String>(0) : Arrays.asList(values);

        if (! names.contains(Constants.REMOVE_VALUE_PREFIX + Constants.DEFAULT_KEY)) {
            getExtensionClasses();
            for (Map.Entry<String, Activate> entry : cachedActivates.entrySet()) {
                String name = entry.getKey();
                Activate activate = entry.getValue();
                if (isMatchGroup(group, activate.group())) {
                    T ext = getExtension(name);
                    if (! names.contains(name) && ! names.contains(Constants.REMOVE_VALUE_PREFIX + name) 
                            && isActive(activate, url)) {
                        exts.add(ext);
                    }
                }
            }
            Collections.sort(exts, ActivateComparator.COMPARATOR);
        }
        List<T> usrs = new ArrayList<T>();
        for (int i = 0; i < names.size(); i ++) {
            String name = names.get(i);
            if (! name.startsWith(Constants.REMOVE_VALUE_PREFIX)
                    && ! names.contains(Constants.REMOVE_VALUE_PREFIX + name)) {
                           if (Constants.DEFAULT_KEY.equals(name)) {
                    if (usrs.size() > 0) {
                        exts.addAll(0, usrs);
                        usrs.clear();
                    }
                } else {
                    T ext = getExtension(name);
                    usrs.add(ext);
                }
            }
        }
        if (usrs.size() > 0) {
            exts.addAll(usrs);
        }
        return exts;
    }
```
通过以上代码可以看到，用户自己配置的Filter中，有些是默认激活，有些是需要通过配置文件来激活。而所有Filter的加载顺序，也是先处理Dubbo的默认Filter，再来处理用户自己定义并且配置的Filter。通过"-"配置，可以替换掉Dubbo的原生Filter，通过这样的设计，可以灵活地替换或者修改Filter的加载顺序。

#### Dubbo原生的Filter
Dubbo原生的Filter很多，RpcContext，accesslog等功能都可以通过Dubbo来实现，下面我们来介绍一下Consumer端用于上下文传递的ConsumerContextFilter：

```java
public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        RpcContext.getContext()
                .setInvoker(invoker)
                .setInvocation(invocation)
                .setLocalAddress(NetUtils.getLocalHost(), 0)
                .setRemoteAddress(invoker.getUrl().getHost(), 
                                  invoker.getUrl().getPort());
        if (invocation instanceof RpcInvocation) {
            ((RpcInvocation)invocation).setInvoker(invoker);
        }
        try {
            return invoker.invoke(invocation);
        } finally {
            RpcContext.getContext().clearAttachments();
        }
    }
```
此Filter记录了调用过程中的状态信息，并且通过invocation对象将客户端设置的attachments参数传递到服务端。并且在调用完成后清除这些参数，这就是为什么请求状态信息可以按次记录并且进行传递。

#### 实现一个Dubbo Filter
得益于Dubbo灵活的设计和良好的可扩展性，我们可以通过实现自己的Dubbo Filter来完成调用链路中的逻辑嵌入，比如，耗时统计，monitor信息统计等，下面我们来实现一个简单的Filter:

Maven 项目结构：

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxFilter.java (实现Filter接口)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.rpc.Filter (纯文本文件，内容为：xxx=com.xxx.XxxFilter)
```

XxxFilter.java：

```java
public class XxxFilter implements Filter {
    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        // before filter ...
        Result result = invoker.invoke(invocation);
        // after filter ...
        return result;
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.rpc.Filter：
```
xxx=com.xxx.XxxFilter
```

在 xml 中配置:

```xml
<!-- 消费方调用过程拦截 -->
<dubbo:reference filter="xxx" />
<!-- 消费方调用过程缺省拦截器，将拦截所有reference -->
<dubbo:consumer filter="xxx"/>
<!-- 提供方调用过程拦截 -->
<dubbo:service filter="xxx" />
<!-- 提供方调用过程缺省拦截器，将拦截所有service -->
<dubbo:provider filter="xxx"/>
```

或者使用注解：

```java
@Activate(group = "consumer")
public class XxxFilter implements Filter {
    // ...
}
```

使用 xml 的配置方式会更加灵活，粒度更细。

在before和after中，可以实现自己的业务逻辑来赋予该filter一定的功能。编写和配置完成后，该filter就会被Dubbo框架激活并且在调用链中执行。
