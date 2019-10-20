# First Dubbo Filter

### Overview
In overall design of Dubbo, Filter is a very important concept, most of Dubbo's functions are based on this 
extension point, and the Filter interception will be executed during each call.

#### Extension Mechanism of Dubbo Filter
There are already about 20 Filters implemented in Dubbo. Their entry is ProtocolFilterWrapper, ProtocolFilterWrapper 
makes a Wrapper on Protocol and will be loaded when the extension is loaded. Then, let's see how 
the Filter chain is constructed.

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
Through the above code we can see that, in the method buildInvokerChain, first get all 
activated chains, the chain here is already sorted. Then construct a call chain of Filter 
through the Invoker, finally the constructed call chain can be roughly expressed as: Filter1->Filter2->Filter3->......->Invoker, 
now let's see the detailed flow of the activated chain in the above step. 

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
Through the above code we can see that, some of the Filters configured by the user are activated by default, 
and some need to be activated by the configuration file. The loading order of all Filters is to process Dubbo's 
default Filter first, and then to process the Filter defined by the user. With the "-" configuration, Dubbo's defualt Filter 
can be replaced, with this configuration, the user can flexibly replace or modify the Filter's load order.

#### Built-in Filter of Dubbo
Dubbo has lots of built-in Filter. RpcContext, accesslog and other functions can be implemented by Dubbo. 
Now let's see the ConsumerContextFilter which used by the Consumer side for context delivery:

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

This Filter records the state information during call, and passes the attachments parameter set 
by the client to the server through the invocation object, and these parameters will be cleared 
after the call is completed, which is why the request status information can be recorded by times 
and delivered.

#### Implement A Dubbo Filter
Because of Dubbo's flexible design and good scalability, we can implement business logic 
in the call chain by implementing our own Dubbo Filter, such as time-consuming statistics, monitor information statistics, etc.
Now, let's implement a simple Filter:

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxFilter.java (impelement Filter interface)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.rpc.Filter (Plain text file with content：xxx=com.xxx.XxxFilter)
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

configure in xml as:

```xml
<!-- Consumer call process interception -->
<dubbo:reference filter="xxx" />
<!-- Consumer call process default interception，intercept all reference -->
<dubbo:consumer filter="xxx"/>
<!-- Provider call process interception -->
<dubbo:service filter="xxx" />
<!-- Provider call process default interception，intercept all service -->
<dubbo:provider filter="xxx"/>
```

or use annotation as:
```java
@Activate(group = "consumer")
public class XxxFilter implements Filter {
    // ...
}
```

Using xml configuration is more flexible and granular.


In before and after, you can implement your own business logic to give the filter a certain function. 
Once written and configured, the filter is activated by the Dubbo and executed in the call chain.
