---
aliases:
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/registry/
    - /en/docs3-v2/java-sdk/reference-manual/spi/description/registry/
description: Registry Center Extension
linkTitle: Registry Center Extension
title: Registry Center Extension
type: docs
weight: 9
---






## Extension Description

Responsible for the registration and discovery of services.

## Extension Interfaces

* `org.apache.dubbo.registry.RegistryFactory`
* `org.apache.dubbo.registry.Registry`

## Extension Configuration

```xml
<!-- Define the registry -->
<dubbo:registry id="xxx1" address="xxx://ip:port" />
<!-- Reference the registry, if the registry attribute is not configured, it will automatically scan the registry configuration in the ApplicationContext -->
<dubbo:service registry="xxx1" />
<!-- Reference the default value of the registry, when <dubbo:service> does not configure the registry attribute, use this configuration -->
<dubbo:provider registry="xxx1" />
```

## Extension Contracts

RegistryFactory.java：

```java
public interface RegistryFactory {
    /**
     * Connect to the registry.
     * 
     * The connection to the registry must handle the following contracts:<br>
     * 1. Setting check=false indicates no connection check, otherwise an exception will be thrown if it cannot connect.<br>
     * 2. Supports username:password authentication based on the URL.<br>
     * 3. Supports backup=10.20.153.10 alternative registry cluster addresses.<br>
     * 4. Supports file=registry.cache local disk file caching.<br>
     * 5. Supports timeout=1000 request timeout settings.<br>
     * 6. Supports session=60000 session timeout or expiration settings.<br>
     * 
     * @param url The registry address, must not be null
     * @return The registry reference, never returns null
     */
    Registry getRegistry(URL url); 
}
```

RegistryService.java：

```java
public interface RegistryService { // Registry extends RegistryService 
    /**
     * Register a service.
     * 
     * Registration must handle the following contracts:<br>
     * 1. If the URL sets check=false, no error will be reported on registration failure, and it will retry in the background; otherwise, an exception will be thrown.<br>
     * 2. If the URL sets dynamic=false, it needs to be persisted; otherwise, it should be automatically deleted when the registrant exits abnormally due to power failure or other circumstances.<br>
     * 3. If the URL sets category=overrides, it indicates classified storage, with the default category being providers, allowing notifications of partial data by category.<br>
     * 4. Data must not be lost when the registry restarts or during network fluctuations, including automatic deletion of data upon disconnection.<br>
     * 5. URLs with the same URI but different parameters are allowed to coexist and cannot be overwritten.<br>
     * 
     * @param url The registration information, must not be null, such as: dubbo://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     */
    void register(URL url);
 
    /**
     * Unregister a service.
     * 
     * Unregistration must handle the following contracts:<br>
     * 1. If it is dynamic=false persistent storage data and the registration data cannot be found, throw IllegalStateException, otherwise ignore.<br>
     * 2. Unregister based on full URL match.<br>
     * 
     * @param url The registration information, must not be null, such as: dubbo://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     */
    void unregister(URL url);
 
    /**
     * Subscribe to a service.
     * 
     * Subscription must handle the following contracts:<br>
     * 1. If the URL sets check=false, no error will be reported on subscription failure, and it will retry in the background.<br>
     * 2. If the URL sets category=overrides, only notify the specified categorized data; multiple categories are separated by commas and wildcard '*' is allowed to subscribe to all categorized data.<br>
     * 3. Allows querying based on interface, group, version, classifier, such as: interface=com.alibaba.foo.BarService&version=1.0.0<br>
     * 4. The query criteria allow wildcards, subscribing to all groups of all versions of all interfaces, or: interface=*&group=*&version=*&classifier=*<br>
     * 5. When the registry restarts or during network fluctuations, subscription requests must be automatically restored.<br>
     * 6. URLs with the same URI but different parameters are allowed to coexist and cannot be overwritten.<br>
     * 7. The subscription process must be blocked, returning only after the first notification is completed.<br>
     * 
     * @param url The subscription criteria, must not be null, such as: consumer://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     * @param listener The change event listener, must not be null
     */
    void subscribe(URL url, NotifyListener listener);
 
    /**
     * Unsubscribe from a service.
     * 
     * Unsubscription must handle the following contracts:<br>
     * 1. If there is no subscription, just ignore it.<br>
     * 2. Unsubscribe based on full URL match.<br>
     * 
     * @param url The subscription criteria, must not be null, such as: consumer://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     * @param listener The change event listener, must not be null
     */
    void unsubscribe(URL url, NotifyListener listener);
 
    /**
     * Query the registration list, corresponding to the push mode of subscription, here it is the pull mode, returning results only once.
     * 
     * @see org.apache.dubbo.registry.NotifyListener#notify(List)
     * @param url The query criteria, must not be null, such as: consumer://10.20.153.10/com.alibaba.foo.BarService?version=1.0.0&application=kylin
     * @return The list of registered information, may be empty, meaning the same as the parameters of {@link org.apache.dubbo.registry.NotifyListener#notify(List<URL>)}.
     */
    List<URL> lookup(URL url);
 
}
```

NotifyListener.java：

```java
public interface NotifyListener { 
    /**
     * Triggered when a service change notification is received.
     * 
     * The notification must handle the following contracts:<br>
     * 1. Always notify the full set of data dimensioned by service interface and data type, i.e., it will not notify partial data of the same type from a service, and the user does not need to compare the previous notification results.<br>
     * 2. The first notification during subscription must be a full notification of all types of data for a service.<br>
     * 3. During changes, different types of data may be notified separately, for example: providers, consumers, routes, overrides; only one type may be notified, but that type’s data must be complete, not incremental.<br>
     * 4. If any type of data is empty, an empty protocol notification with a category parameter must be sent.<br>
     * 5. The notifier (i.e., the registry implementation) must ensure the order of notifications; for instance: single-threaded pushes, queue serialization, version comparison.<br>
     * 
     * @param urls The list of registered information, never null, meaning the same as the return value of {@link org.apache.dubbo.registry.RegistryService#lookup(URL)}.
     */
    void notify(List<URL> urls);
 
}
```

## Known Extensions

`org.apache.dubbo.registry.support.dubbo.DubboRegistryFactory`

## Extension Example

Maven Project Structure:

```
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxRegistryFactory.java (implementing RegistryFactory interface)
                |-XxxRegistry.java (implementing Registry interface)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.registry.RegistryFactory (plain text file, content: xxx=com.xxx.XxxRegistryFactory)
```

XxxRegistryFactory.java：

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

XxxRegistry.java：

```java
package com.xxx;
 
import org.apache.dubbo.registry.Registry;
import org.apache.dubbo.registry.NotifyListener;
import org.apache.dubbo.common.URL;
 
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

META-INF/dubbo/org.apache.dubbo.registry.RegistryFactory：

```properties
xxx=com.xxx.XxxRegistryFactory
```
