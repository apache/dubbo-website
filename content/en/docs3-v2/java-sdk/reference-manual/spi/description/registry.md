---
type: docs
title: "Registry Extension"
linkTitle: "Registry Extension"
weight: 9
---

## Expansion Description

Responsible for service registration and discovery.

## Extension ports

* `org.apache.dubbo.registry.RegistryFactory`
* `org.apache.dubbo.registry.Registry`

## Extended configuration

```xml
<!-- Define the registration center -->
<dubbo:registry id="xxx1" address="xxx://ip:port" />
<!-- Reference registry, if registry property is not configured, registry configuration will be automatically scanned in ApplicationContext -->
<dubbo:service registry="xxx1" />
<!-- Reference the default value of the registry, when <dubbo:service> does not configure the registry attribute, use this configuration -->
<dubbo:provider registry="xxx1" />
```

## Extension contract

RegistryFactory.java:

```java
public interface RegistryFactory {
    /**
     * Connect to the registration center.
     *
     * The connection to the registration center needs to deal with the contract:<br>
     * 1. When check=false is set, it means that the connection will not be checked, otherwise an exception will be thrown when the connection fails. <br>
     * 2. Support username:password authority authentication on the URL. <br>
     * 3. Support backup=10.20.153.10 alternative registration center cluster address. <br>
     * 4. Support file=registry.cache local disk file cache. <br>
     * 5. Support timeout=1000 request timeout setting. <br>
     * 6. Support session=60000 session timeout or expiration setting. <br>
     *
     * @param url Registry address, not allowed to be empty
     * @return Registry reference, never return empty
     */
    Registry getRegistry(URL url);
}
```

RegistryService.java:

```java
public interface RegistryService { // Registry extends RegistryService
    /**
     * Registration service.
     *
     * Registration requires processing contract:<br>
     * 1. When the URL is set to check=false, no error will be reported after the registration fails, and it will be retried regularly in the background, otherwise an exception will be thrown. <br>
     * 2. When the dynamic=false parameter is set in the URL, it needs to be stored persistently. Otherwise, when the registrant exits abnormally due to power failure, etc., it needs to be automatically deleted. <br>
     * 3. When category=overrides is set in the URL, it means classified storage, the default category is providers, and the data can be notified by category. <br>
     * 4. When the registration center restarts and the network fluctuates, data cannot be lost, including automatic deletion of data when disconnected. <br>
     * 5. URLs with the same URI but different parameters are allowed to coexist, and cannot be overwritten. <br>
     *
     * @param url Registration information, not allowed to be empty, such as: dubbo://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     */
    void register(URL url);
 
    /**
     * Unregister service.
     *
     * Cancellation of registration needs to deal with the contract:<br>
     * 1. If it is persistent storage data with dynamic=false and registration data cannot be found, throw IllegalStateException, otherwise ignore it. <br>
     * 2. Cancel registration by full URL matching. <br>
     *
     * @param url Registration information, not allowed to be empty, such as: dubbo://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     */
    void unregister(URL url);
 
    /**
     * Subscription service.
     *
     * Subscription requires processing contract:<br>
     * 1. When the URL is set to check=false, no error will be reported after the subscription fails, and it will be retried periodically in the background. <br>
     * 2. When category=overrides is set in the URL, only the data of the specified category will be notified. Multiple categories are separated by commas, and wildcards of asterisks are allowed, which means to subscribe to all category data. <br>
     * 3. It is allowed to use interface, group, version, classifier as conditional query, such as: interface=com.alibaba.foo.BarService&version=1.0.0<br>
     * 4. And the query condition allows asterisk wildcards, subscribe to all versions of all groups of all interfaces, or: interface=*&group=*&version=*&classifier=*<br>
     * 5. When the registration center restarts and the network fluctuates, the subscription request needs to be automatically resumed. <br>
     * 6. URLs with the same URI but different parameters are allowed to coexist, and cannot be overwritten. <br>
     * 7. The subscription process must be blocked, and return after the first notification. <br>
     *
     * @param url subscription condition, not allowed to be empty, such as: consumer://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     * @param listener Change event listener, not allowed to be empty
     */
    void subscribe(URL url, NotifyListener listener);
 
    /**
     * Unsubscribe service.
     *
     * Unsubscribing requires processing contract:<br>
     * 1. If there is no subscription, just ignore it. <br>
     * 2. Unsubscribe by full URL match. <br>
     *
     * @param url subscription condition, not allowed to be empty, such as: consumer://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     * @param listener Change event listener, not allowed to be empty
     */
    void unsubscribe(URL url, NotifyListener listener);
 
    /**
     * Query the registration list, corresponding to the push mode of subscription, here is the pull mode, and the result is returned only once.
     *
     * @see org.apache.dubbo.registry.NotifyListener#notify(List)
     * @param url query condition, not allowed to be empty, such as: consumer://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     * @return The registered information list, which may be empty, has the same meaning as the parameter of {@link org.apache.dubbo.registry.NotifyListener#notify(List<URL>)}.
     */
    List<URL> lookup(URL url);
 
}
```

NotifyListener.java:

```java
public interface NotifyListener {
    /**
     * Triggered when a service change notification is received.
     *
     * Notice to process contract:<br>
     * 1. The full notification is always based on the service interface and data type, that is, the partial data of the same type of a service will not be notified, and the user does not need to compare the results of the previous notification. <br>
     * 2. The first notification when subscribing must be a full notification of all types of data for a service. <br>
     * 3. When changing midway, different types of data are allowed to be notified separately, such as: providers, consumers, routes, overrides, and only one type is allowed to be notified, but the data of this type must be full, not incremental. <br>
     * 4. If one type of data is empty, it is necessary to notify an empty protocol and identification URL data with category parameter. <br>
     * 5. The notifier (that is, the registration center implementation) needs to ensure the order of notifications, such as: single-threaded push, queue serialization, and version comparison. <br>
     *
     * @param urls Registered information list, always not empty, the meaning is the same as the return value of {@link org.apache.dubbo.registry.RegistryService#lookup(URL)}.
     */
    void notify(List<URL> urls);
 
}
```

## Known extensions

`org.apache.dubbo.registry.support.dubbo.DubboRegistryFactory`

## Extended example

Maven project structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxRegistryFactoryjava (implements RegistryFactory interface)
                |-XxxRegistry.java (implement Registry interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.registry.RegistryFactory (plain text file, content: xxx=com.xxx.XxxRegistryFactory)
```

XxxRegistryFactory.java:

```java
package com.xxx;
 
import org.apache.dubbo.registry.RegistryFactory;
import org.apache.dubbo.registry.Registry;
import org.apache.dubbo.common.URL;
 
public class XxxRegistryFactory implements RegistryFactory {
    public Registry getRegistry(URL url) {
        return new XxxRegistry(url);
    }
}
```

XxxRegistry.java:

```java
package com.xxx;
 
import org.apache.dubbo.registry.Registry;
import org.apache.dubbo.registry.NotifyListener;
import org.apache.dubbo.common.URL;
 
public class XxxRegistry implements Registry {
    public void register(URL url) {
        //...
    }
    public void unregister(URL url) {
        //...
    }
    public void subscribe(URL url, NotifyListener listener) {
        //...
    }
    public void unsubscribe(URL url, NotifyListener listener) {
        //...
    }
}
```

META-INF/dubbo/org.apache.dubbo.registry.RegistryFactory:

```properties
xxx=com.xxx.XxxRegistryFactory
```