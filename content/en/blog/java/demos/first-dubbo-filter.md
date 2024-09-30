---
title: "First Dubbo Filter"
linkTitle: "First Dubbo Filter"
tags: ["Java"]
date: 2018-07-01
description: >
  This article introduces how to develop a Dubbo Filter
---

### Overview
In the overall design of Dubbo, Filters are an important concept. Most of Dubbo's functionalities are realized based on this extension point, and the interception of Filters is executed during each call.

#### Loading Mechanism of Dubbo Filter
There are approximately twenty Filters that have been implemented in Dubbo, all entering through ProtocolFilterWrapper. ProtocolFilterWrapper wraps the Protocol and is loaded during extension loading. Let's take a look at how this Filter chain is constructed.

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

#### Activation Mechanism of Dubbo Filter
From the above code, we can see that in `buildInvokerChain`, all activated invocation chains are first obtained, which are already sorted. The invocation chain can be roughly represented as: Filter1->Filter2->Filter3->......->Invoker. Let's look at the process of obtaining the activated invocation chain:

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
Through the above code, it can be seen that some Filters configured by users are activated by default, while others need to be activated through configuration files. The loading order of all Filters first processes Dubbo's default Filters, followed by user-defined and configured Filters. Through the "-" configuration, Dubbo's native Filters can be replaced, allowing flexible replacement or modification of the order in which Filters are loaded.

#### Native Dubbo Filters
There are many native Filters in Dubbo, such as RpcContext, accesslog, etc. can be implemented through Dubbo. Below we introduce the ConsumerContextFilter, which is used for context passing on the Consumer side:

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
This Filter records the status information during the call process and passes the attachments parameter set by the client to the server through the invocation object. After the call is completed, these parameters are cleared, which is why the request status information can be recorded and passed accordingly.

#### Implementing a Dubbo Filter
Thanks to Dubbo's flexible design and good scalability, we can implement our own Dubbo Filter to embed logic within the calling chain, such as time consumption statistics, monitor information statistics, etc. Below we implement a simple Filter:

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxFilter.java (implementing Filter interface)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.rpc.Filter (plain text file, content: xxx=com.xxx.XxxFilter)
```

XxxFilter.java:

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

Configuring in XML:

```xml
<!-- Intercepting consumer-side calls -->
<dubbo:reference filter="xxx" />
<!-- Default interceptor for consumer-side calls, will intercept all references -->
<dubbo:consumer filter="xxx"/>
<!-- Intercepting provider-side calls -->
<dubbo:service filter="xxx" />
<!-- Default interceptor for provider-side calls, will intercept all services -->
<dubbo:provider filter="xxx"/>
```

Or use annotations:

```java
@Activate(group = "consumer")
public class XxxFilter implements Filter {
    // ...
}
```

Using XML configuration is more flexible and granular. 

In before and after, you can implement your business logic to assign functionality to this filter. After writing and configuring, the filter will be activated by the Dubbo framework and executed in the calling chain.

