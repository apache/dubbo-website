# Registry Extension

## Summary

Registry extension is used for service registration and discovery.

## Extension Interface

* `com.alibaba.dubbo.registry.RegistryFactory`
* `com.alibaba.dubbo.registry.Registry`

## Extension Configuration

```xml
<!-- config registry server -->
<dubbo:registry id="xxx1" address="xxx://ip:port" />
<!-- reference registry server, if registry attribute is not specified, then ApplicationContext will be scanned to find if there's any -->
<dubbo:service registry="xxx1" />
<!-- default configuration for referencing registry server, it will take effect if there's no registry attribute specified in <dubbo:service> -->
<dubbo:provider registry="xxx1" />
```

## Extension Contract

RegistryFactory.java：

```java
public interface RegistryFactory {
    /**
     * Connect to registry server
     * 
     * The contract for connecting to registry server: <br>
     * 1. Will not check connection when check=false is set, otherwise exception will be thrown if connection fails. <br>
     * 2. Support authorizing against username:password in the URL <br>
     * 3. Support registry server backup with backup=10.20.153.10 <br>
     * 4. Support cache on local disk with file=registry.cache <br>
     * 5. Support timeout setup with timeout=1000 <br>
     * 6. Support session expiration setup with session=60000 <br>
     * 
     * @param url registry server address, null is not allowed
     * @return reference to registry server, never return null
     */
    Registry getRegistry(URL url); 
}
```

RegistryService.java：

```java
public interface RegistryService { // Registry extends RegistryService 
    /**
     * Register service.
     * 
     * Contract for registering service: <br>
     * 1. Registration failure will be ignored and kept retrying if check=false is set in URL, otherwise exception will be thrown <br>
     * 2. Persistence is required if dynamic=false is set in URL, otherwise, the registration info will be removed automatically when register quits accidentally <br>
     * 3. Persistent by category if category=overrides is set in URL, default category is providers. It is possible to notify by category. <br>
     * 4. Data lost is not tolerant when registry server reboots or network jitter happens. <br> 
     * 5. It is not allowed to override each other when URLs have same URI part but different parameters <br>
     * 
     * @param url registration info，null is not allowed, e.g.: dubbo://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     */
    void register(URL url);
 
    /**
     * Unregister service.
     * 
     * Contract for unregistering service: <br>
     * 1. IllegalStateException should be thrown when registration info which's supposed to be persistent (with dynamic=false set) cannot be found, otherwise it should be ignored. <br>
     * 2. To cancel one service, extract match on its URL will be honored <br>
     * 
     * @param url registration info，null is not allowed, e.g.: dubbo://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     */
    void unregister(URL url);
 
    /**
     * 订阅服务.
     * Subscribe service.
     * 
     * Contract for subscribing service: <br>
     * 1. Subscription failure will be ignored and kept retrying if check=false is set in URL <br>
     * 2. Only the specified category will be notified if category=overrides is set in URL. Categories are seperated with comma, and all categorized data will be subscribed when wildcard "*" is specified. <br>
     * 3. Allow to query by interface, group, version, classifier, e.g.: interface=com.alibaba.foo.BarService&version=1.0.0<br>
     * 4. Allow to query with wildcard "*" to subscribe all versions under all categories for all interfaces, e.g.: interface=*&group=*&version=*&classifier=*<br>
     * 5. Subscription will be automatically recoverred when registry server reboots or network jitter happens. <br>
     * 6. It is not allowed to override each other when URLs have same URI part but different parameters <br>
     * 7. Subscription procedure will not return until the first notification happens. <br>
     * 
     * @param url URL for subscription, null isn't allowed, e.g.: consumer://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     * @param listener notification listener, null is not allowed
     */
    void subscribe(URL url, NotifyListener listener);
 
    /**
     * Unsubscribe service.
     * 
     * Contract for unsubscribing service: <br>
     * 1. Simply ignore if not subscribe <br>
     * 2. Unsubscribe with URL exact match <br>
     * 
     * @param url URL for unsubscription, null is not allowed, e.g.: consumer://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     * @param listener notification listener, null is not allowed
     */
    void unsubscribe(URL url, NotifyListener listener);
 
    /**
     * 查询注册列表，与订阅的推模式相对应，这里为拉模式，只返回一次结果。
     * Lookup subscription list. Compared to push mode for subscription, this is pull mode and returns result only once.
     * 
     * @see com.alibaba.dubbo.registry.NotifyListener#notify(List)
     * @param url URL for  query, null is not allowed, e.g.: consumer://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     * @return subscription list, could be null, has the same meaning as the parameters in {@link com.alibaba.dubbo.registry.NotifyListener#notify(List<URL>)}.
     */
    List<URL> lookup(URL url);
 
}
```

NotifyListener.java：

```java
public interface NotifyListener { 
    /**
     * Fire event when receive service change notification.
     * 
     * Contract for notify: <br>
     * 1. Always notify with the whole data instead of partial data from the perspective of service interface and data type. In this way, user needs not compare with the previous result. <br>
     * 2. First notification for subscription must contain the full set of data for one particular service <br>
     * 3. It is allowed to separate the different type of data in the upcoming notifications, e.g.: it is legal to only notify one of types among providers, consumers, routes or overrides each time, but pls. note for this particular type, the data must be a full set. <br>
     * 4. If the data for one particular type is empty, need to notify with a special URL which has empty as its protocol and has category parameter for this particluar type.
     * 5. Notifier (usually it is monitor center) needs to guarantee the notification sequence by, for say: single thread push, queuing in order,  versioning, etc. <br>
     * 
     * @param urls subscription list, always not empty, equivalent to the return result of {@link com.alibaba.dubbo.registry.RegistryService#lookup(URL)}.
     */
    void notify(List<URL> urls);
 
}
```

## Existing Extension

`com.alibaba.dubbo.registry.support.dubbo.DubboRegistryFactory`

## Extension Guide

Directory structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxRegistryFactoryjava (RegistryFactory implementation)
                |-XxxRegistry.java (Registry implementation)
    |-resources
        |-META-INF
            |-dubbo
                |-com.alibaba.dubbo.registry.RegistryFactory (plain text file with the content: xxx=com.xxx.XxxRegistryFactory)
```

XxxRegistryFactory.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.registry.RegistryFactory;
import com.alibaba.dubbo.registry.Registry;
import com.alibaba.dubbo.common.URL;
 
public class XxxRegistryFactory implements RegistryFactory {
    public Registry getRegistry(URL url) {
        return new XxxRegistry(url);
    }
}
```

XxxRegistry.java：

```java
package com.xxx;
 
import com.alibaba.dubbo.registry.Registry;
import com.alibaba.dubbo.registry.NotifyListener;
import com.alibaba.dubbo.common.URL;
 
public class XxxRegistry implements Registry {
    public void register(URL url) {
        // ...
    }
    public void unregister(URL url) {
        // ...
    }
    public void subscribe(URL url, NotifyListener listener) {
        // ...
    }
    public void unsubscribe(URL url, NotifyListener listener) {
        // ...
    }
}
```

META-INF/dubbo/com.alibaba.dubbo.registry.RegistryFactory：

```properties
xxx=com.xxx.XxxRegistryFactory
```